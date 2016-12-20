var express = require('express');
var moment = require('moment');
var email = require('../controllers/email');
var router = express.Router();
var schools = require('../controllers/schools');
var reviews = require('../controllers/reviews');
var images = require('../controllers/images');
var provincesController = require('../controllers/provinces');
var citiesController = require('../controllers/cities');
var companiesController = require('../controllers/companies');
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
            function getPopularCities (school, done){
                citiesController.getMostPopularCities(function(popularCities){
                    done(null,school, popularCities);
                });
            },
            function getPopularProvinces (school, popularCities, done){
                provincesController.getMostPopularProvinces(function(popularProvinces){
                    done(null,school, popularCities, popularProvinces);
                });
            },
            function getRelatedSchools (school, popularCities, popularProvinces, done){
                if(school.company && school.company.id){
                    schools.findSchoolsByCompanySortbyRating(school.company.id, function(err, relatedSchools){
                        done(err,school, popularCities, popularProvinces, relatedSchools);
                    });
                }
                else{
                    done(null,school, popularCities, popularProvinces, null);
                }
            },

            function findNumberOfReviews(school, popularCities, popularProvinces, relatedSchools, done){
                reviews.findNumberofReviews(school._id, function(numberOfReviews){
                    done(null, school, popularCities, popularProvinces, relatedSchools, numberOfReviews);
                });
            },

            function findReviews(school, popularCities, popularProvinces, relatedSchools, numberOfReviews){
                reviews.findReviews(school, function (reviewList) {

                    //Verify if user has access to school editing.
                    var schoolOwner = false;
                    if ((req.user && school && school.user && school.user.equals(req.user._id)) || (req.user && req.user.admin)) {
                        schoolOwner = true;
                    }

                    //school.description = jadefunctions.nl2br(school.description, false);
                    var reviewDistribution = reviews.createReviewDistribution(reviewList);

                    res.render('school/school', {
                        title: school.name + " - English in China",
                        edit: schoolOwner,
                        school: school,
                        user: req.user,
                        reviewsCount: numberOfReviews,
                        reviews: reviewList,
                        reviewDistribution: reviewDistribution,
                        criteria:criteria,
                        moment:moment,
                        criteriaScore: school.criteria,
                        jadefunctions: jadefunctions,
                        popularCities: popularCities,
                        popularProvinces: popularProvinces,
                        relatedSchools: relatedSchools,
                        pictureInfo: pictureinfo,
                        scripts:[scripts.librater, scripts.rating, scripts.libbarchart, scripts.util, scripts.libekkolightbox, scripts.schoolpage]
                    });
                },6,1,true,req);
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
                companiesController.getAllCompanies(function(companies){
                    res.render('school/addschool', {
                        title: "Add School - English in China",
                        user: req.user,
                        pictureInfo: pictureinfo,
                        provinces: provinces,
                        companies: companies,
                        scripts:[scripts.util, scripts.libtinyMCE, scripts.tinyMCE],
                        incompleteSchool:incompleteSchool
                    });
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
                    //Send Email to admin to advise the creation of a new school
                    var message = "Email: " + newSchool.name + "\n" + newSchool.description;
                    var callbackMessage = "Thank you, we will get back to you shortly";
                    email.sendEmail("julieneric11@gmail.com","newschoolcreated@englishinchina.com","School Created "+newSchool.name,message,callbackMessage, req, function(){
                            //redirect the user to its new school
                            res.redirect('/school/id/' + newSchool.id);
                        }
                    )
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
                title: "Upload Picture - English in China",
                school:school,
                scripts:[scripts.util]
            });
        });
    })

    router.get('/addphotoajax/:id', function (req, res) {
        schools.findSchoolById(req.params.id, function (school) {
            res.render('addphoto', {
                    title: "Upload Picture - English in China",
                    school:school
                },
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
        var admin = false;
        if(req.user && req.user.admin){
            admin = true;
        }
        images.getImageById(req.params.id, function (image) {
            res.render('photomodal', {
                    title: "View Picture - English in China",
                    photo:image[0],
                    admin: admin,
                    pictureInfo:pictureinfo
                },
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

    router.get('/updatecoverphoto/:photoid/:schoolid', function (req, res) {
            var photoId = req.params.photoid;
            var schoolId = req.params.schoolid;

            images.getImageById(photoId, function(photolist){
                schools.updateCoverPicture(schoolId, photolist[0].url, function(editedschool){
                    res.redirect("/");
                });
            });

    })

    /**********************************************************************************************************************************
     //REVIEWS
     ***********************************************************************************************************************************/
    /************************************************************************************************************
     *WriteReview : Page for users to write review for school specified by id
     * Param : School id
     *************************************************************************************************************/
    router.get('/id/:id/writereview',isAuthenticated, function (req, res) {
        var schoolId = req.params.id;

        async.waterfall([

            async.apply(function findNumberofReviews(schoolId, done){
                reviews.findNumberofReviews(schoolId, function(numberOfReviews){
                    done(null, schoolId, numberOfReviews);
                });
            },schoolId),

            function findReviews(schoolId, numberOfReviews, done){
                reviews.findReviews(schoolId, function (reviewList) {
                    done(null,schoolId,numberOfReviews,reviewList);
                });
            },
            function findSchool(schoolId, numberOfReviews,reviewList){
                schools.findSchoolById(schoolId, function (school) {
                    res.render('writereview', {
                        title: "Write Review for " + school.name + " - English in China",
                        user: req.user,
                        school: school,
                        criteria: criteria,
                        moment:moment,
                        reviewsCount: numberOfReviews,
                        reviews: reviewList,
                        pictureInfo: pictureinfo,
                        jadefunctions: jadefunctions,
                        scripts:[scripts.util, scripts.libcalendar,scripts.libbsdatetimepicker, scripts.libslider, scripts.writereview]
                    });
                });
            }

        ], function(err,callback){
            if(err){
                console.log(err);
            }
        })
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

            res.render('school/schoolreviews',{
                title: "Reviews - English in China",
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

        },6,page,true,req);

    });

    /****************************************************************************************************************
     * get Ajax review
     ***************************************************************************************************************/
    router.get('/reviews/:id', function(req, res) {
        var ajax = false;
        var reviewId = req.params.id;
        var userId = req.user;
        if (req.query.ajax !== undefined ) {
            ajax = decodeURIComponent(req.query.ajax);
        }

        reviews.findReviewById(reviewId, userId, function(reviewlist){

            var review = reviewlist[0];
            review.comment = jadefunctions.nl2br(review.comment,false);

            if(ajax){
                res.render('school/schoolreview',{
                    review: review,
                    loggedin : "true",
                    pictureInfo: pictureinfo,
                    jadefunctions: jadefunctions,
                    scripts:[scripts.util],
                    criteria: criteria,
                    moment: moment,
                    criteriaScore: review.criteria
                },function(err, html) {
                    if(err)
                        console.log(err);
                    else{
                        res.send({html:html});
                    }
                });
            }
            else{
                reviews.findReviews(review.foreignId.id,function(otherReviews){
                    res.render('school/review', {
                        title: review.foreignId.name + " - review by " + review.user.username + " - " + review.comment + " - English in China",
                        review: review,
                        reviews:otherReviews,
                        pictureInfo: pictureinfo,
                        jadefunctions: jadefunctions,
                        scripts: [scripts.util, scripts.libbarchart, scripts.schoolpage],
                        criteria: criteria,
                        moment: moment,
                        criteriaScore: review.criteria
                    });
                },9,1,true);
            }
        });
    });

    /****************************************************************************************************************
     * This review was helpful
     ***************************************************************************************************************/
    router.post('/helpfuls/:type/:id',isAuthenticated, function(req, res) {
        var reviewId = req.params.id;
        var type = req.params.type;
        var userId = req.user;

        async.waterfall([
            async.apply(function getReview(reviewId, userId, type, done){
                reviews.findReviewById(reviewId,userId, function(reviewList){
                    done(null, reviewList[0], userId, type);
                });
            }, reviewId, userId, type),

            function addHelpful(review, userId, type, done){
                review.helpfuls.push({user: userId});
                var hf = review.helpfuls[0];
                console.log(hf) // { _id: '501d86090d371bab2c0341c5', name: 'Liesl' }
                console.log(hf.isNew) // { _id: '501d86090d371bab2c0341c5', name: 'Liesl' }
                hf.isNew; // true

                review.save(function (err, document) {
                    //TODO: Change my error handling to this form
                    //if (err) return handleError(err)
                    //console.log('Success!');
                    if (err){
                        res.send({result:"0"});
                    }
                    else{
                        //res.send({result:"1", reviewId:documents._id , numberOfHelpfuls:documents.helpfuls.length});
                        document.hasHF = true;
                        res.render('helpfulshort',{
                            review: document,
                            loggedin : "true"
                        },function(err, html) {
                            if(err)
                                console.log(err);
                            else{
                                res.send({html:html, result:"1", reviewId:document.id});
                            }
                        });
                    }
                    done(null, document)
                });
            },

            function sendEmailToReviewUser(review){
                var user = review.user;
                if(user.email != undefined){
                    //var message = "Hi " + review.user.username + "! " + review.helpfuls.length + " people think your review is helpful.\n Take a look : http://englishinchina.co/school/id/" + review.foreignId.id;
                    var message = email.createReviewHelpfulMessage(res, review.user.username, review.helpfuls.length, review.foreignId.id, function(message){
                        var callbackMessage = "Thank you";
                        email.sendEmail(user.email,"reviews@englishinchina.com","Review Feedback on " + review.foreignId.name, message, callbackMessage, req, function(){});
                    });

                }
            }

            ],
            //ERROR MANAGEMENT
            function(err,callback){
                if(err){
                    console.log("ERROR" + err);
                }
                else{
                    done();
                }
            }
        );
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
                        schoolList = jadefunctions.trunkSchoolDescription(schoolList,180);
                    }
                    callback(null, schoolList, searchMessage);
                })
            },schoolInfo, province, city),
            function getPopularCities (schoolList, searchMessage, done){
                citiesController.getMostPopularCities(function(popularCities){
                    done(null, schoolList, searchMessage, popularCities);
                });
            },
            function getPopularProvinces (schoolList, searchMessage, popularCities, done){
                provincesController.getMostPopularProvinces(function(popularProvinces){
                    done(null, schoolList, searchMessage, popularCities, popularProvinces);
                });
            },
            //2) Get the provinces and pass along all the returned values
            function getProvinces(schoolList, searchMessage, popularCities, popularProvinces){
                provincesController.getAllProvinces(function(provinces){
                    res.render('search', {
                        title: searchMessage + " Schools - English in China",
                        schools: schoolList,
                        user: req.user,
                        provinces: provinces,
                        pictureInfo: pictureinfo,
                        popularCities: popularCities,
                        popularProvinces: popularProvinces,
                        searchMessage: "You searched for " +  searchMessage,
                        jadefunctions: jadefunctions,
                        scripts:[scripts.librater, scripts.util, scripts.rating]
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
    router.get('/edit/:id', isAuthenticated, function (req, res) {
        schools.findSchoolById(req.params.id, function (school) {
            provincesController.getAllProvinces(function(provinces){
                citiesController.getCitiesByProvince(school.province.code, function(cities){
                    companiesController.getAllCompanies(function(companies){
                        res.render('school/editschool', {
                            school: school,
                            user: req.user,
                            reviews: reviews,
                            provinces: provinces,
                            cities: cities,
                            companies: companies,
                            jadefunctions: jadefunctions,
                            pictureInfo: pictureinfo,
                            scripts:[scripts.util, scripts.libtinyMCE, scripts.tinyMCE]
                        });
                    });
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
                res.redirect('/school/id/' + editedSchool._id);
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