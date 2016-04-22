var express = require('express');
var router = express.Router();
var schools = require('../controllers/schools');
var reviews = require('../controllers/reviews');
var images = require('../controllers/images');
var provincesController = require('../controllers/provinces');
var jadefunctions = require('./jadeutilityfunctions');
var pictureinfo = require('../pictureinfo');
var async = require('async');



module.exports = function(passport) {

    /**********************************
    //SCHOOL ROUTES
    ***********************************/
    /************************************************************************************************************
     *getSchoolById : Method to search for specific school by its ID. will return school and render page.
     * ID: school's id.
     *************************************************************************************************************/
    router.get('/id/:id', function (req, res) {

        schools.findSchoolById(req.params.id, function (school) {
            reviews.findReviews(school, function (reviews) {
                //images.getImagesBySchool(school, function(images) {

                    //Verify if user has access to school editing.
                    var schoolOwner = false;
                    if (req.user && school.user && school.user.equals(req.user._id)) {
                        schoolOwner = true;
                    }

                    function nl2br(str, is_xhtml) {
                        // http://kevin.vanzonneveld.net
                        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                        // +   improved by: Philip Peterson
                        // +   improved by: Onno Marsman
                        // +   improved by: Atli Þór
                        // +   bugfixed by: Onno Marsman
                        // +      input by: Brett Zamir (http://brett-zamir.me)
                        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                        // +   improved by: Brett Zamir (http://brett-zamir.me)
                        // +   improved by: Maximusya
                        // *     example 1: nl2br('Kevin\nvan\nZonneveld');
                        // *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
                        // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
                        // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
                        // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
                        // *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
                        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : "<br>"; // Adjust comment to avoid issue on phpjs.org display
                        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
                    };

                    school.description = nl2br(school.description, false);

                    res.render('school', {
                        edit: schoolOwner,
                        school: school,
                        user: req.user,
                        reviews: reviews,
                        jadefunctions: jadefunctions,
                        pictureInfo: pictureinfo
                    });
                //});
            });
        });
    });

    /************************************************************************************************************
     *AddSchool : Method for loading page for creating a new school. As well as POST request from website to process creation
     * Param : user, verify user validity and store in DB, to enable editing school
     *************************************************************************************************************/
    router.route('/addschool')
        .get(function (req, res) {
            provincesController.getAllProvinces(function(provinces){
                res.render('addschool', {
                    user: req.user,
                    pictureInfo: pictureinfo,
                    provinces: provinces
                });
            });
        })
        .post(function (req, res) {
            schools.addSchool(req.body, function(err, newSchool){
                if (err) {
                    console.log("error");
                    return handleError(err);
                }
                else {

                    provincesController.getAllProvinces(function(provinces){
                        schools.findSchoolById(newSchool.id, function (school) {
                            reviews.findReviews(school, function (reviews) {
                                res.render('school', {
                                    school: school,
                                    user: req.user,
                                    reviews: reviews,
                                    provinces: provinces,
                                    jadefunctions: jadefunctions,
                                    pictureInfo: pictureinfo
                                });
                            })
                        });
                    });
                }
            })
        });


    /************************************************************************************************************
     *Addphoto : Add photo to a school
     * Param : School id
     *************************************************************************************************************/
    router.get('/addphoto/:id', function (req, res) {
            schools.findSchoolById(req.params.id, function (school) {
                res.render('addphoto', {school:school});
            });
    })

    router.post('/addphoto', function (req, res) {
            var pictureUrl = req.body.pictureUrl;
            async.waterfall([
                    //1 First find the school
                    async.apply(function getSchool(pictureUrl,next){
                        schools.findSchoolById(req.body.id, function (school) {
                            next(null, pictureUrl, school)
                        });
                    },pictureUrl),

                    //2 Add Images
                    function addImage(pictureUrl, school, next){
                        images.addImage({
                                type: 1,
                                user: null,
                                school: school,
                                url: pictureUrl,
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

    /**********************************************************************************************************************************
     //REVIEWS
     ***********************************************************************************************************************************/
    /************************************************************************************************************
     *WriteReview : Page for users to write review for school specified by id
     * Param : School id
     *************************************************************************************************************/
    router.get('/id/:id/writereview', function (req, res) {
        schools.findSchoolById(req.params.id, function (school) {
            //var province = req.query.province;
            //var city = req.query.city;
            res.render('writereview', {
                user: req.user,
                school: school,
                pictureInfo: pictureinfo
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
            reviews.findNumberofReviews(schoolId, function(numberOfReviews){
                schools.updateSchoolRating(schoolId,averageRating,numberOfReviews);
                console.log("Back");
                schools.findSchoolById(schoolId, function (school) {
                    reviews.findReviews(school, function (reviews) {
                        res.redirect('id/'+ school._id)

                        //res.render('school', {
                        //    school: school,
                        //    user: req.user,
                        //    reviews: reviews,
                        //    pictureInfo: pictureinfo,
                        //    jadefunctions: jadefunctions
                        //});
                    })
                });
            });
        })
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
                        jadefunctions: jadefunctions
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
                res.render('editschool', {
                    school: school,
                    user: req.user,
                    reviews: reviews,
                    provinces: provinces.provinces
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
                schools.findSchoolById(editedSchool.id, function (school) {
                    reviews.findReviews(school, function (reviews) {
                        res.render('school', {
                            school: school,
                            user: req.user,
                            reviews: reviews,
                            provinces: provinces.provinces
                        });
                    })
                });
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
     *  removeSchool: Remove school if user is admin
     * Param : SchoolID, id of school to remove
     *************************************************************************************************************/
    router.get('/remove/:id', function(req, res){
        if(req.user.admin){
            schools.deleteSchool(req.params.id, function(err, editedSchool){
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