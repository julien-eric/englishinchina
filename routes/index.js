var express = require('express');
var router = express.Router();
var schools = require('../controllers/schools');
var companies = require('../controllers/companies');
var reviews = require('../controllers/reviews');
var email = require('../controllers/email');
//var provinces = require('../provinces');
var pictures = require('../pictures');
var aws = require('aws-sdk');
var url = require('url');
var moment = require('moment');
var jadefunctions = require('./jadeutilityfunctions');
var pictureinfo = require('../pictureinfo');
var provincesController = require('../controllers/provinces');
var citiesController = require('../controllers/cities');
var usersController = require('../controllers/users');
var async = require('async');
var crypto = require('crypto');
var scripts = require('../scripts').scripts;
var bCrypt = require('bcrypt-nodejs');

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
            function getPopularCities (provinces,featuredSchoolList, done){
                citiesController.getMostPopularCities(function(popularCities){
                    done(null,provinces,featuredSchoolList,popularCities);
                });
            },
            function getPopularProvinces (provinces, featuredSchoolList, popularCities, done){
                provincesController.getMostPopularProvinces(function(popularProvinces){
                    done(null,provinces, featuredSchoolList, popularCities, popularProvinces);
                });
            },
            //3) Lastly Get paginated list of schools
            function getSchools(provinces, featuredSchoolList, popularCities,popularProvinces) {
                var pageSize = 5;
                var admin = false;
                if(req.user == undefined || req.user.admin == undefined){admin = false;}
                else{admin = req.user.admin};

                schools.getSchools(function(count, schoolList){
                    var truckSchoolList = jadefunctions.trunkSchoolDescription(schoolList,150);

                    res.render('home', {
                        title: "English in China",
                        main: true,
                        featuredSchoolList: featuredSchoolList,
                        schools:truckSchoolList,
                        user: req.user,
                        provinces: provinces,
                        pictureInfo: pictureinfo,
                        jadefunctions: jadefunctions,
                        popularCities: popularCities,
                        popularProvinces: popularProvinces,
                        cities: {},
                        currentPage: 1,
                        total: count,
                        totalPages: ((count - (count%pageSize))/pageSize)+1,
                        scripts:[scripts.librater, scripts.util, scripts.rating]
                    })
                },pageSize, 0, admin);
            }
        ], function(err) {
            if (err) console.log(err);
            //res.redirect('/');
        });
    });


    router.get('/page/:page', function(req, res){


        async.waterfall([
            //1) First get provinces list
            function getProvinces(done) {
                provincesController.getAllProvinces(function(provinces){
                    done(null, provinces);
                });
            },
            function getPopularCities (provinces, done){
                citiesController.getMostPopularCities(function(popularCities){
                    done(null,provinces,popularCities);
                });
            },
            function getPopularProvinces (provinces, popularCities, done){
                provincesController.getMostPopularProvinces(function(popularProvinces){
                    done(null,provinces, popularCities, popularProvinces);
                });
            },
            //3) Lastly Get paginated list of schools
            function getSchools(provinces, popularCities, popularProvinces) {
                var page = req.params.page;
                var pageSize = 5;
                var admin = false;

                if(req.user == undefined || req.user.admin == undefined){admin = false;}
                else{admin = req.user.admin};
                schools.getSchools(function (count, schoolList) {
                    var trunkSchoolList = jadefunctions.trunkSchoolDescription(schoolList,150);
                    res.render('home', {
                        title: "English in China - Page " + page,
                        schools: trunkSchoolList,
                        user: req.user,
                        provinces: provinces,
                        pictureInfo: pictureinfo,
                        jadefunctions: jadefunctions,
                        popularCities: popularCities,
                        popularProvinces: popularProvinces,
                        currentPage: page,
                        total: count,
                        totalPages: ((count - (count % pageSize)) / pageSize) + 1,
                        scripts:[scripts.librater, scripts.util, scripts.rating]
                    })
                }, pageSize, page - 1, admin);
            }
        ], function(err) {
            if (err) console.log(err);
            //res.redirect('/');
        });


    });

    /**********************************************************************************************************************************
     //COMPANY RELATED ROUTES
    ***********************************************************************************************************************************/
    router.route('/company/addcompany')
        .get(function(req, res) {
            res.render('company/addcompany', {
                title: "Add Company - English in China",
                message: req.flash('message'),
                scripts:[scripts.util]
            });
        })
        .post(function (req, res) {
            var company = {
                name: req.body.name,
                description: req.body.description,
                website: req.body.website,
                pictureUrl: req.body.pictureUrl,
                logoUrl: req.body.logoUrl
            }
            companies.addCompany(company, function(newCompany){
                res.redirect('/company/id/' + newCompany.id);
            })
        });

    router.route('/company/edit/:id')
        .get(function(req, res) {
            companies.findCompanyById(req.params.id, function (company) {
                res.render('company/editcompany', {
                    title: "Edit " + company.name +  " - English in China",
                    company: company,
                    message: req.flash('message'),
                    pictureInfo: pictureinfo,
                    scripts:[scripts.util]
                });
            });
        })
        .post(function (req, res) {
            var company = {
                id: req.body.id,
                name: req.body.name,
                description: req.body.description,
                website: req.body.website,
                pictureUrl: req.body.pictureUrl,
                logoUrl: req.body.logoUrl
            }
            companies.editCompany(company, function(err, newCompany){
                res.redirect('/company/id/' + newCompany.id);
            })
        });


    router.get('/company/id/:id', function (req, res) {

        async.waterfall([
            function findCompany(done){
                companies.findCompanyById(req.params.id, function (company) {
                    done(null, company);
                });
            },

            function getPopularCities (company, done){
                citiesController.getMostPopularCities(function(popularCities){
                    done(null,company, popularCities);
                });
            },
            function getPopularProvinces (company, popularCities, done){
                provincesController.getMostPopularProvinces(function(popularProvinces){
                    done(null,company, popularCities, popularProvinces);
                });
            },
            function getSchoolList (company, popularCities, popularProvinces, done){
                schools.findSchoolsByCompany(company.id, function(err, schoolList){
                    done(err, company, popularCities, popularProvinces, schoolList);
                });
            },
            function getprovincesByCompany (company, popularCities, popularProvinces, schoolList, done){
                provincesController.getMostPopularProvincesbyCompany(req.params.id, function(provincesByCompany){
                    done(null, company, popularCities, popularProvinces, schoolList, provincesByCompany);
                });
            },
            function finish(company, popularCities, popularProvinces, schoolList, provincesByCompany){
                var truckSchoolList = jadefunctions.trunkSchoolDescription(schoolList,150);
                res.render('company/company', {
                    title: company.name + " - English in China",
                    company: company,
                    user: req.user,
                    moment:moment,
                    jadefunctions: jadefunctions,
                    popularCities: popularCities,
                    popularProvinces: popularProvinces,
                    provincesByCompany: provincesByCompany,
                    schools: truckSchoolList,
                    pictureInfo: pictureinfo,
                    scripts:[scripts.librater, scripts.rating, scripts.libbarchart, scripts.util, scripts.libekkolightbox, scripts.schoolpage]
                });
            }
        ], function(err,callback){
            if(err){
                console.log(err);
            }
        })
    });

    /************************************************************************************************************
     *LOGIN :   GET : Root Path, login page.
     *          POST: Send user login request. redirect to home if sucessful, try again if failure
     *************************************************************************************************************/
    router.route('/login')
        .get(function(req, res) {
            //citiesController.pushCities(citiesController.citiesToPush);
            // Display the Login page with any flash message, if any
            res.render('login', {
                title: "Login - English in China",
                message: req.flash('message'),
                scripts:[scripts.util]
            });
        })
        .post(function(req, res, next) {
            //custom callback allows us to redirect user to the same page he was on... (maybe better way?)
            var redirect = "/";
            if(req.body.redirecturl){
                redirect = req.body.redirecturl;
            }
            passport.authenticate('login', function(err, user, info) {
                if (err) { return next(err); }
                if (!user) { return res.redirect('/login'); }
                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                    return res.redirect(redirect);
                });
            })(req, res, next);
        });

    router.get('/loginajax', function (req, res) {
        res.render('loginpanel', {
                title: "Login - English in China",
                message: req.flash('message'),
                redirecturl: req.query.url,
                scripts:[scripts.util]
            },
            function(err, html) {
                if(err)
                    console.log(err);
                else{
                    res.send({html:html});
                }
            });
    })

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
            res.render('register',{
                title: "Sign up - English in China",
                message: req.flash('message'),
                scripts:[scripts.util]
            });
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
            title: "Forgot your Password - English in China",
            user: req.user,
            pictureInfo: pictureinfo,
            scripts:[scripts.util]
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

                email.resetPassword(req, user, token, req, done);

                //var smtpTransport = nodemailer.createTransport({
                //    service: "sendGrid",
                //    host : "smtp.sendgrid.net",
                //    secureConnection : false,
                //    port: 587,
                //    auth : {
                //        user : "jueri",
                //        pass : "Montreal123!"
                //    }
                //});
                //
                //var mailOptions = {
                //    to: user.email,
                //    from: 'passwordreset@englishinchina.co',
                //    subject: 'English in China Password Reset',
                //    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                //    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                //    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                //    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                //};
                //smtpTransport.sendMail(mailOptions, function(err) {
                //    req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                //    done(err, 'done');
                //});
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
                title: "Reset Password - English in China",
                pictureInfo: pictureinfo,
                scripts:[scripts.util]
            });
        });
    });

    router.post('/reset/:token', function(req, res) {

        usersController.findUserByToken(req.params.token, {$gt: Date.now()}, function(err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('back');
            }

            // Generates hash using bCrypt
            var createHash = function(password){
                return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
            }
            user.password = createHash(req.body.password);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
                req.logIn(user, function(err) {
                    return res.redirect('/');
                });
            });
        });
    });

    router.post('/contactus', function(req, res) {
        var message = "Email: " + req.body.email + "\n" + req.body.content;
        var callbackMessage = "Thank you, we will get back to you shortly";
        email.sendEmail("julieneric11@gmail.com","contactusfeedback@englishinchina.com","Feedback comment from user",message,callbackMessage, req, function(){
                res.redirect('/');
            }
        )

    });

    /************************************************************************************************************
     *USER :   GET : If user is authenticated, send him to view myprofile page, else redirect to login
     * This method is not the general one to view a different user.
     *************************************************************************************************************/
    router.get('/user', isAuthenticated, function(req, res){
        reviews.findReviewsByUser(req.user._id, function(reviews){
            res.render('user', {
                title: "User " + req.user.username + " - English in China",
                user: req.user,
                reviews: reviews,
                pictureInfo: pictureinfo,
                jadefunctions: jadefunctions,
                scripts:[scripts.util]
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
                    title: "Edit Profile - " + user.username + " - English in China",
                    user: user,
                    pictureInfo: pictureinfo,
                    jadefunctions: jadefunctions,
                    scripts:[scripts.util]
                });
            });
        })
        .post(function(req,res){
            usersController.updateUser(req.body, function(user){
                res.redirect('/user/edit');
            });
        });

    /************************************************************************************************************
     *VIEW USER :   GET : Show profile for a different user, show reviews and possible schools created by user.
     *************************************************************************************************************/
    router.get('/user/:id', function(req, res){
        usersController.findUserById(req.params.id, function(user){
            reviews.findReviewsByUser(req.params.id, function(reviews){
                res.render('user', {
                    title: "User " + user.username + " - English in China",
                    user: user,
                    reviews: reviews,
                    pictureInfo: pictureinfo,
                    jadefunctions: jadefunctions,
                    moment: moment,
                    scripts:[scripts.util]
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
     *GETUSERS :
     *************************************************************************************************************/
    router.get('/allusers', isAuthenticated, function(req, res){
        if(req.user.admin){
            usersController.getAllUsers(function(users){
                res.render('allusers', {
                    title: "Users - English in China",
                    users: users,
                    pictureInfo: pictureinfo,
                    jadefunctions: jadefunctions,
                    moment: moment,
                    scripts:[scripts.util]
                });
            });
        }
        else{
            return "nice try";
        }
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
            Bucket: "englishinchinaasia",
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
                    url: req.query.file_name
                };
                res.write(JSON.stringify(return_data));
                res.end();
            }
        });
    });
    return router;
}