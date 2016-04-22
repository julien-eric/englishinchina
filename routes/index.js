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
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport")

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

        async.waterfall([
            //1) First get provinces list
            function getProvinces(done) {
                provincesController.getAllProvinces(function(provinces){
                    done(null, provinces);
                });
            },
            //2) Then get featured schools for jumbotron
            function getFeaturedSchools(provinces, done) {
                schools.featuredSchools(function(err, featuredSchoolList){
                    done(null, provinces,featuredSchoolList);
                });
            },
            //3) Lastly Get paginated list of schools
            function getSchools(provinces, featuredSchoolList) {
                var pageSize = 5;
                var admin = false;
                if(req.user == undefined || req.user.admin == undefined){admin = false;}
                else{admin = req.user.admin};


                schools.getSchools(function(count, schoolList){
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
                },pageSize, 0, admin);
            }
        ], function(err) {
            if (err) console.log(err);
            //res.redirect('/');
        });
    });


    router.get('/page/:page', function(req, res){
        var page = req.params.page;
        var pageSize = 5;
        provincesController.getAllProvinces(function(provinces) {
            schools.getSchools(function (count, schoolList) {
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
     *FORGOT :   GET : Forgot your password page
     *************************************************************************************************************/
    router.get('/forgot', function(req, res) {
        res.render('forgot', {
            user: req.user,
            pictureInfo: pictureinfo
        });
    });

    router.post('/forgot', function(req, res, next) {

        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                usersController.findUserByEmail(req.body.email, function(err, user) {
                    if (!user) {
                        req.flash('error', 'No account with that email address exists.');
                        return res.redirect('/forgot');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {

                var smtpTransport = nodemailer.createTransport({
                    service: "sendGrid",
                    host : "smtp.sendgrid.net",
                    secureConnection : false,
                    port: 587,
                    auth : {
                        user : "jueri",
                        pass : "Montreal123!"
                    }
                });

                var mailOptions = {
                    to: user.email,
                    from: 'passwordreset@englishinchina.co',
                    subject: 'English in China Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/forgot');
        });
    });

    router.get('/reset/:token', function(req, res) {
        usersController.findUserByToken(req.params.token, {$gt: Date.now()}, function(err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/forgot');
            }
            res.render('reset', {
                user: req.user,
                pictureInfo: pictureinfo
            });
        });
    });

    router.post('/reset/:token', function(req, res) {

        usersController.findUserByToken(req.params.token, {$gt: Date.now()}, function(err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('back');
            }

            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
                req.logIn(user, function(err) {
                    return res.redirect('/');
                });
            });
        });
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
            usersController.updateUser(req.body, function(user){
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