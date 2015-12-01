var express = require('express');
var router = express.Router();
var schools = require('../schools');
var users = require('../users');
var comments = require('../comments');
var provinces = require('../provinces');
var aws = require('aws-sdk');

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
}

module.exports = function(passport){

    /**********************************
    //USER RELATED GET AND POST ROUTES
    ***********************************/
    /* GET login page. */
    router.get('/', function(req, res) {
        // Display the Login page with any flash message, if any
        res.render('index', { message: req.flash('message') });
    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash : true
    }));

    /* GET Registration Page */
    router.get('/signup', function(req, res){
        res.render('register',{message: req.flash('message')});
    });

    /* GET User Page */
    router.get('/user', function(req, res){
            res.render('user', {
                user: req.user,
                provinces: provinces.provinces
            });
    });

    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash : true
    }));

    /* GET Home Page */
    router.get('/home', isAuthenticated, function(req, res){
        //schools.emptySchoolCollection();

        schools.loadSchools(function(schoolList){
                res.render('home', {
                    schools:schoolList,
                    user: req.user,
                    provinces: provinces.provinces
                })
        });
    });

    /* Handle Logout */
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // route for facebook authentication and login
    // different scopes while logging in
    router.get('/login/facebook',
        passport.authenticate('facebook', { scope : 'email' }
        ));

    // handle the callback after facebook has authenticated the user
    router.get('/login/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/home',
            failureRedirect : '/'
        })
    );



    /**********************************
     //SCHOOL ROUTES
     ***********************************/
    //GET SINGLE APOLOGY
    router.get('/school/:id', function(req, res){
        //var id = ObjectId.fromString(req.params.id);
        schools.findSchoolById(req.params.id, function(school){
            comments.findComments(school, function(comments){
                res.render('school', {
                    school:school,
                    user: req.user,
                    comments : comments,
                    provinces: provinces.provinces
                });
            })

        });
    });

    router.get('/addschool', function(req, res) {
        res.render('addschool', { user: req.user });
    });

    /* Handle Registration POST */
    router.post('/addschool', function(req, res) {schools.addSchool(req)});

    router.get('/sign_s3', function(req, res){
        aws.config.update({accessKeyId: "AKIAJFGLJ3FU42D22YKQ", secretAccessKey: "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"});
        var s3 = new aws.S3();
        var s3_params = {
            Bucket: "englishinchina",
            Key: req.query.file_name,
            Expires: 60,
            ContentType: req.query.file_type,
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3_params, function(err, data){
            if(err){
                console.log(err);
            }
            else{
                var return_data = {
                    signed_request: data,
                    url: 'https://'+"englishinchina"+'.s3.amazonaws.com/'+req.query.file_name
                };
                res.write(JSON.stringify(return_data));
                res.end();
            }
        });
    });

    router.get('/search/school', function(req, res){
        var schoolInfo = req.query.schoolInfo;
        var province = req.query.province;
        var city = req.query.city;
        schools.searchSchools(schoolInfo, province, city, function(schoolList) {
            res.render('home', {
                schools: schoolList,
                user: req.user,
                provinces: provinces.provinces
            });
        });
    });



    /**********************************
     //COMMENTS
     ***********************************/

    router.post('/insertcomment', function(req, res) {comments.insertCommentforSchool(req.user._id, req.body.school, req.body.comment, function(){
            console.log("Back")
        })
    });

    return router;
}