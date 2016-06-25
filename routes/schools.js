var express = require('express');
var router = express.Router();
var schools = require('../controllers/schools');
var reviews = require('../controllers/reviews');
var images = require('../controllers/images');
var provincesController = require('../controllers/provinces');
var jadefunctions = require('./jadeutilityfunctions');
var pictureinfo = require('../pictureinfo');
var criteria = require('../criteria').criteria;
var async = require('async');
var scripts = require('../scripts').scripts;

/************************************************************************************************************
 *isAuthenticated :  If user is authenticated in the session, call the next() to call the next request handler
 Passport adds this method to request object. A middleware is allowed to add properties to
 request and response objects
 *************************************************************************************************************/
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/login');
}


module.exports = function(passport) {

    /**********************************
    //SCHOOL ROUTES
    ***********************************/
    /************************************************************************************************************
     *getSchoolById : Method to search for specific school by its ID. will return school and render page.
     * ID: school's id.
     *************************************************************************************************************/
    router.get('/id/:id', function (req, res) {

        async.waterfall([
            function findSchool(done){
                schools.findSchoolById(req.params.id, function (school) {
                    done(null, school);
                });
            },

            function findNumberOfReviews(school, done){
                reviews.findNumberofReviews(school._id, function(numberOfReviews){
                    done(null, school, numberOfReviews);
                });
            },
            function findReviews(school, numberOfReviews){
                reviews.findReviews(school, function (reviews) {

                    //Verify if user has access to school editing.
                    var schoolOwner = false;
                    if ((req.user && school && school.user && school.user.equals(req.user._id)) || (req.user && req.user.admin)) {
                        schoolOwner = true;
                    }

                    school.description = jadefunctions.nl2br(school.description, false);

                    res.render('school', {
                        edit: schoolOwner,
                        school: school,
                        user: req.user,
                        reviewsCount: numberOfReviews,
                        reviews: reviews,
                        criteria:criteria,
                        criteriaScore: school.criteria,
                        jadefunctions: jadefunctions,
                        pictureInfo: pictureinfo,
                        scripts:[scripts.librater, scripts.rating, scripts.libbarchart, scripts.util, scripts.schoolpage]
                    });
                },6,1,true);
            }

        ], function(err,callback){
            if(err){
                console.log(err);
            }
        })
    });

    /************************************************************************************************************
     *AddSchool : Method for loading page for creating a new school. As well as POST request from website to process creation
     * Param : user, verify user validity and store in DB, to enable editing school
     *************************************************************************************************************/
    router.route('/addschool')
        .get( isAuthenticated, function (req, res) {
            var incompleteSchool = undefined;
            if (req.query.name !== undefined || req.query.schoolType !== undefined ) {
                incompleteSchool = {name:decodeURIComponent(req.query.name), schoolType:parseInt(req.query.type)};
            }
            provincesController.getAllProvinces(function(provinces){
                res.render('addschool', {
                    user: req.user,
                    pictureInfo: pictureinfo,
                    provinces: provinces,
                    scripts:[scripts.util, scripts.addschool],
                    incompleteSchool:incompleteSchool
                });
            });
        })
        .post(function (req, res) {
            schools.addSchool(req.user, req.body, function(err, newSchool){
                if (err) {
                    console.log("error");
                    return handleError(err);
                }
                else {
                    res.redirect('/school/id/' + newSchool.id);
                }
            })
        });

    router.post('/addschoolgetstarted', isAuthenticated, function (req, res) {
        var school = {name:encodeURIComponent(req.body.name), schoolType:encodeURIComponent(req.body.schoolType)}
        res.redirect('/school/addschool?name=' + school.name +"&type=" + school.schoolType);
    });


    /************************************************************************************************************
     *Addphoto : Add photo to a school
     * Param : School id
     *************************************************************************************************************/
    router.get('/addphoto/:id', function (req, res) {
        schools.findSchoolById(req.params.id, function (school) {
            res.render('addphoto', {
                school:school,
                scripts:[scripts.util]
            });
        });
    })

    router.get('/addphotoajax/:id', function (req, res) {
        schools.findSchoolById(req.params.id, function (school) {
            res.render('addphoto', {school:school},
                function(err, html) {
                    if(err)
                        console.log(err);
                    else{
                        res.send({html:html});
                    }
            });
        });
    })

    router.post('/addphoto', function (req, res) {
            var picture = {url:req.body.pictureUrl, description: req.body.description};
            async.waterfall([
                    //1 First find the school
                    async.apply(function getSchool(picture,next){
                        schools.findSchoolById(req.body.id, function (school) {
                            next(null, picture, school)
                        });
                    },picture),

                    //2 Add Images
                    function addImage(picture, school, next){
                        images.addImage({
                                type: 1,
                                user: req.user,
                                school: school,
                                url: picture.url,
                                description: picture.description,
                                date: Date.now()
                            },
                            function(error, image){
                                if(!error){
                                    var xschool = school.toObject()
                                    xschool.photos.push(image);
                                    schools.updatePictures(xschool, function(err, school){
                                        res.redirect('/school/id/' + school._id);
                                    });
                                }
                                else{
                                    callback(error, createdSchool);
                                }
                                //next(err, province, city, image);
                            });
                    }


                ],
                function(err,callback){})

    })

    router.get('/getphoto/:id', function (req, res) {
        images.getImageById(req.params.id, function (image) {
            res.render('photomodal', {photo:image[0], pictureInfo:pictureinfo},
                function(err, html){
                    if (err)
                        res.send({html: err.toString()})
                    else {
                        res.send({html: html});
                    }
                });
            });
    })


    router.get('/deletephoto/:photoid/:schoolid', function (req, res) {

        if(req.user.admin){
            var photoId = req.params.photoid;
            var schoolId = req.params.schoolid;

            images.deleteImage(photoId, function (err, numberOfPhotosDeleted) {
                res.redirect('/school/id/' + schoolId);
            });
        }
        else{
            req.flash('error', "You don't have administrator rights.");
            return res.redirect('/');
        }
    })


    /**********************************************************************************************************************************
     //REVIEWS
     ***********************************************************************************************************************************/
    /************************************************************************************************************
     *WriteReview : Page for users to write review for school specified by id
     * Param : School id
     *************************************************************************************************************/
    router.get('/id/:id/writereview',isAuthenticated, function (req, res) {
        schools.findSchoolById(req.params.id, function (school) {
            //var province = req.query.province;
            //var city = req.query.city;
            res.render('writereview', {
                user: req.user,
                school: school,
                criteria: criteria,
                pictureInfo: pictureinfo,
                scripts:[scripts.util, scripts.libcalendar, scripts.libslider, scripts.writereview]
            });
        });
    });

    /************************************************************************************************************
     *insertCommentforSchool : POST insertreview on school
     * userID : integer
     * schoolID : integer
     * review : string
     *************************************************************************************************************/
    router.post('/insertreview', function(req, res) {

        reviews.insertReviewforSchool(req, function(schoolId, averageRating){
            schools.findSchoolById(schoolId, function (school) {
                    res.redirect('/school/id/'+ school._id)
            });
        })
    });

    /************************************************************************************************************
     *deleteReview : Delete Review
     * userID : integer
     * schoolID : integer
     * review : string
     *************************************************************************************************************/
    router.get('/deletereview/:reviewid/:schoolid', function(req, res) {

        if(req.user.admin){
            var reviewId = req.params.reviewid;
            var schoolId = req.params.schoolid;
            reviews.deleteReview(reviewId, function(err, document, result){
                res.redirect('/school/id/' + schoolId);
            })
        }
        else{
            req.flash('error', "You don't have administrator rights.");
            return res.redirect('/');
        }


    });

    /****************************************************************************************************************
     * getmorereviews
     ***************************************************************************************************************/
    router.get('/reviews/:schoolid/:page', function(req, res) {

        var page = req.params.page;
        var schoolId = req.params.schoolid;

        reviews.findReviews(schoolId,function(reviews){

            res.render('schoolreviews',{
                reviews: reviews,
                pictureInfo: pictureinfo,
                jadefunctions: jadefunctions,
                scripts:[scripts.util]
            },function(err, html) {
                if(err)
                    console.log(err);
                else{
                    res.send({html:html});
                }
            });

        },6,page,true);

    });


    /****************************************************************************************************************
     * getIndividualreview
     ***************************************************************************************************************/
    router.get('/reviews/:id', function(req, res) {

        var reviewId = req.params.id;

        reviews.findReviewById(reviewId,function(reviews){

            var review = reviews[0];
            review.comment = jadefunctions.nl2br(review.comment,false);

            res.render('schoolreview',{
                review: review,
                pictureInfo: pictureinfo,
                jadefunctions: jadefunctions,
                scripts:[scripts.util],
                criteria: criteria,
                criteriaScore: reviews[0].criteria
            },function(err, html) {
                if(err)
                    console.log(err);
                else{
                    res.send({html:html});
                }
            });
        });
    });


    /************************************************************************************************************
     *searchSchool : Method for search all schools, it will return any school that has some of the information
     * Param : Query, string that will be looked for as part of the schools name
     * [Province] optional.
     * [City] optional
     *************************************************************************************************************/
    router.get('/search', function (req, res) {
        var schoolInfo = req.query.schoolInfo;
        var province = req.query.province;
        var city = validateCity(req.query.city);


        async.waterfall([

            //1) Search for list of schools containing some or all of the info
            async.apply(function searchSchools(schoolInfo, province, city, callback){
                schools.searchSchools(schoolInfo, province, city, function (schoolList, searchMessage) {
                    if (schoolList != undefined && schoolList.length > 0) {
                        schoolList = jadefunctions.trunkSchoolDescription(schoolList,500);
                    }
                    callback(null, schoolList, searchMessage);
                })
            },schoolInfo, province, city),
            //2) Get the provinces and pass along all the returned values
            function getProvinces(schoolList, searchMessage){
                provincesController.getAllProvinces(function(provinces){
                    res.render('home', {
                        schools: schoolList,
                        user: req.user,
                        provinces: provinces,
                        pictureInfo: pictureinfo,
                        searchMessage: searchMessage,
                        jadefunctions: jadefunctions,
                        scripts:[scripts.util]
                    });
                });
            }
        ], function(err){
            if (err) return next(err);
            res.redirect('/');
        });
    });

    var validateCity = function (queryElement){
        if (queryElement == undefined)
            return -1;
        return queryElement;
    }

    /************************************************************************************************************
     *editSchool: GET loads page to edit existing school
     * Param : SchoolID, id of school to load
     * TODO: userID to make sure user has permission to modify said school
     *************************************************************************************************************/
    router.get('/edit/:id', function (req, res) {
        schools.findSchoolById(req.params.id, function (school) {
            provincesController.getAllProvinces(function(provinces){
                res.render('editschool', {
                    school: school,
                    user: req.user,
                    reviews: reviews,
                    provinces: provinces.provinces,
                    scripts:[scripts.util]
                });
            });
        });
    });

    router.post('/edit', function(req, res){
        schools.editSchool(req.body, function(err, editedSchool){
            if (err) {
                console.log("error");
                return handleError(err);
            }
            else {
                res.redirect('/school/' + editedSchool._id);
            }
        })
    });


    /************************************************************************************************************
     *  validateSchool: School should be validated before appearing in list
     * Param : SchoolID, id of school to validate
     *************************************************************************************************************/
    router.get('/validate/:id', function(req, res){
        if(req.user.admin){
            schools.validateSchool(req.params.id, function(err, editedSchool){
                res.redirect('/');
            })
        }
        else{
            return "nice try";
        }
    });

    /************************************************************************************************************
     *  devalidateSchool: Devalidate School
     * Param : SchoolID, id of school to validate
     *************************************************************************************************************/
    router.get('/invalidate/:id', function(req, res){
        if(req.user.admin){
            schools.validateSchool(req.params.id, function(err, editedSchool){
                res.redirect('/');
            },false)
        }
        else{
            return "nice try";
        }
    });


    /************************************************************************************************************
     *  removeSchool: Remove school if user is admin
     * Param : SchoolID, id of school to remove
     *************************************************************************************************************/
    router.get('/remove/:id', function(req, res){
        if(req.user.admin){
            schools.deleteSchool(req.params.id, function(err, deletedSchool){
                res.redirect('/');
            })
        }
        else{
            req.flash('error', "You don't have administrator rights.");
            return res.redirect('/');
        }
    });

    return router;
}