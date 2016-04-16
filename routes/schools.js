var express = require('express');
var router = express.Router();
var schools = require('../controllers/schools');
var reviews = require('../controllers/reviews');
var provincesController = require('../controllers/provinces');
var jadefunctions = require('./jadeutilityfunctions');
var pictureinfo = require('../pictureinfo');



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

                //Verify if user has access to school editing.
                var schoolOwner = false;
                if(req.user && school.user && school.user.equals(req.user._id)){
                    schoolOwner = true;
                }

                function nl2br (str, is_xhtml) {
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
            })
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
            schools.addSchool(req, function(err, newSchool){
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
                        res.render('school', {
                            school: school,
                            user: req.user,
                            reviews: reviews,
                            pictureInfo: pictureinfo,
                            jadefunctions: jadefunctions
                        });
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

        //var searchMessage = createSearchMessage(schoolInfo, province, city);

        schools.searchSchools(schoolInfo, province, city, function (schoolList, searchMessage) {
            if (schoolList != undefined && schoolList.length > 0){
                schoolList = jadefunctions.trunkSchoolDescription(schoolList);
            }
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
        });
    });

    var createSearchMessage = function(schoolInfo, province, city){
        var searchQueryMessage = "You have searched for ";
        if(schoolInfo != "" && province){
            searchQueryMessage += schoolInfo + " in " + province;
            if(city != undefined){
                searchQueryMessage +=  + ", " + city;
            }
        }
        if(schoolInfo != "" && (province == undefined)){
            searchQueryMessage += schoolInfo;
        }
        if( province && (schoolInfo == "")){
            searchQueryMessage += province;
        }
        return searchQueryMessage;
    };

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
        schools.editSchool(req, function(err, editedSchool){
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

    return router;
}