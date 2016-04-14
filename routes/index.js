var express = require('express');
var router = express.Router();
var schools = require('../controllers/schools');
var reviews = require('../controllers/reviews');
//var provinces = require('../provinces');
var pictures = require('../pictures');
var aws = require('aws-sdk');
var url = require('url');
var jadefunctions = require('./jadeutilityfunctions');
var pictureinfo = require('../pictureinfo');
var provincesController = require('../controllers/provinces');
var citiesController = require('../controllers/cities');
var usersController = require('../controllers/users');

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




module.exports = function(passport){

    /**********************************************************************************************************************************
     //USER RELATED GET AND POST ROUTES
     ***********************************************************************************************************************************/

    /************************************************************************************************************
     *HOME PAGE : Root page fromwhere users can search schools. Page can be loaded even if users are not logged in
     *************************************************************************************************************/
    router.get('/', function(req, res){

        //var cities = citiesController.citiesToPush;
        //var JSONized = JSON.stringify(cities);
        //citiesController.getAllCities(function(cities){
        //    var a = 2;
        //});
        provincesController.getAllProvinces(function(provinces){
            schools.featuredSchools(function(featuredSchoolList){
                var pageSize = 5;
                schools.loadSchools(function(count, schoolList){
                    var truckSchoolList = jadefunctions.trunkSchoolDescription(schoolList,500);
                    res.render('home', {
                        featured: featuredSchoolList,
                        schools:truckSchoolList,
                        user: req.user,
                        provinces: provinces,
                        pictureInfo: pictureinfo,
                        jadefunctions: jadefunctions,
                        cities: {},
                        currentPage: 1,
                        total: count,
                        totalPages: ((count - (count%pageSize))/pageSize)+1
                    })
                },pageSize, 0);
            });
        });
    });


    router.get('/page/:page', function(req, res){
        var page = req.params.page;
        var pageSize = 5;
        provincesController.getAllProvinces(function(provinces) {
            schools.loadSchools(function (count, schoolList) {
                var truckSchoolList = jadefunctions.trunkSchoolDescription(schoolList, 500);
                res.render('home', {
                    schools: truckSchoolList,
                    user: req.user,
                    provinces: provinces,
                    pictureInfo: pictureinfo,
                    jadefunctions: jadefunctions,
                    currentPage: page,
                    total: count,
                    totalPages: ((count - (count % pageSize)) / pageSize) + 1
                })
            }, pageSize, page - 1);
        });
    });



    /************************************************************************************************************
     *LOGIN :   GET : Root Path, login page.
     *          POST: Send user login request. redirect to home if sucessful, try again if failure
     *************************************************************************************************************/
    router.route('/login')
        .get(function(req, res) {

            //citiesController.pushCities(citiesController.citiesToPush);
            // Display the Login page with any flash message, if any
            res.render('index', { message: req.flash('message') });
        })
        .post(passport.authenticate('login', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash : true
        }));



    /************************************************************************************************************
     *FACEBOOK LOGIN :   Facebook login will hit callback function below (login/facebook/callback)
     *************************************************************************************************************/
    router.get('/login/facebook',
        passport.authenticate('facebook', { scope : 'email' }
    ));


    /************************************************************************************************************
     *FACEBOOK LOGIN CALLBACK :   // handle the callback after facebook has authenticated the user
     *************************************************************************************************************/
    router.get('/login/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/'
        })
    );


    /************************************************************************************************************
     *SIGNUP :   GET : Sign up page.
     *          POST: Send user registration request. redirect to home if sucessful, try again if failure
     *************************************************************************************************************/
    router.route('/signup')
        .get( function(req, res){
            res.render('register',{message: req.flash('message')});
        })
        .post(passport.authenticate('signup', {
            successRedirect: '/',
            failureRedirect: '/signup',
            failureFlash : true
        }));



    /************************************************************************************************************
     *SIGNOUT :   GET : Sign out and redirect to Home Page
     *************************************************************************************************************/
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });



    /************************************************************************************************************
     *USER :   GET : If user is authenticated, send him to view myprofile page, else redirect to login
     * This method is not the general one to view a different user.
     *************************************************************************************************************/
    router.get('/user', isAuthenticated, function(req, res){
        reviews.findReviewsByUser(req.user._id, function(reviews){
            res.render('user', {
                user: req.user,
                reviews: reviews,
                pictureInfo: pictureinfo,
                jadefunctions: jadefunctions
            });
        });
    });

    /************************************************************************************************************
     *EDIT USER :   GET : Show profile for a different user, show reviews and possible schools created by user.
     *************************************************************************************************************/
    router.route('/user/edit')
        .get(function(req, res){
            usersController.findUserById(req.user._id, function(user){
                res.render('edituser', {
                    user: user,
                    pictureInfo: pictureinfo,
                    jadefunctions: jadefunctions
                });
            });
        })
        .post(function(req,res){
            usersController.updateUser(req, function(user){
                res.render('edituser', {
                    user: user,
                    pictureInfo: pictureinfo,
                    jadefunctions: jadefunctions
                });
            });
        });

    router.route('/signup')
        .get( function(req, res){
            res.render('register',{message: req.flash('message')});
        })
        .post(passport.authenticate('signup', {
            successRedirect: '/',
            failureRedirect: '/signup',
            failureFlash : true
        }));

    /************************************************************************************************************
     *VIEW USER :   GET : Show profile for a different user, show reviews and possible schools created by user.
     *************************************************************************************************************/
    router.get('/user/:id', function(req, res){
        usersController.findUserById(req.params.id, function(user){
            reviews.findReviewsByUser(req.params.id, function(reviews){
                res.render('user', {
                    user: user,
                    reviews: reviews,
                    pictureInfo: pictureinfo,
                    jadefunctions: jadefunctions
                });
            });
        });
    });



    /************************************************************************************************************
     *GETCITIESFORPROVINCE :   GET : used with ajax. On search navigation bar
     * This method is not the general one to view a different user.
     *************************************************************************************************************/
    router.get('/cities/:provincecode', function(req, res){
        var provCode = req.params.provincecode;
        citiesController.getCitiesByProvince(provCode,function(cities){
            res.send(cities);
        });
    });

    /**********************************************************************************************************************************
     //UTILS
     ***********************************************************************************************************************************/

    /************************************************************************************************************
     * pictureUploaded : POST// After original picture is uploaded to S3, server will create responsive images for faster loading times
     * pictureURL : string
     *************************************************************************************************************/
    router.post('/pictureuploaded', function(req,res){
        pictures.createResponsivePictures(req.query.url, req.query.filename, req.query.filesize, function(){
            console.log("DAMN")
        })
    });

    /************************************************************************************************************
     * sign_s3 : GET get signed request to upload to server directly.
     *************************************************************************************************************/
    router.get('/sign_s3', function (req, res) {
        aws.config.update({
            accessKeyId: "AKIAJFGLJ3FU42D22YKQ",
            secretAccessKey: "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"
        });
        var s3 = new aws.S3();
        var s3_params = {
            Bucket: "englishinchina",
            Key: req.query.file_name,
            Expires: 60,
            ContentType: req.query.file_type,
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3_params, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                var return_data = {
                    signed_request: data,
                    url: 'https://' + "englishinchina" + '.s3.amazonaws.com/' + req.query.file_name
                };
                res.write(JSON.stringify(return_data));
                res.end();
            }
        });
    });
    return router;
}