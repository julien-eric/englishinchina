var express = require('express');
var router = express.Router();
var provincesController = require('../controllers/provinces');
var provincesSource = require('../provinces');
var citiesController = require('../controllers/cities');
var imagesController = require('../controllers/images');
var schoolsController = require('../controllers/schools');
var usersController = require('../controllers/users');
var citiesSource = require('../citiesJSON');

module.exports = function(passport) {

    /************************************************************************************************************
     *Init Provinces
     *************************************************************************************************************/
    router.get('/initprovinces', function (req, res) {
        provincesController.initProvinces(provincesSource.provinces, function(result){
            console.log(result);
            res.end()
        });
    });

    /************************************************************************************************************
     *Init Cities
     *************************************************************************************************************/
    router.get('/initcities', function (req, res) {
        citiesController.initCities(citiesSource.cities, function(){
            res.end()
        });
    });

    /************************************************************************************************************
     *Push Cities
     *************************************************************************************************************/
    router.get('/pushcities', function (req, res) {
        citiesController.pushCities(citiesController.citiesToPush, function(result){
            console.log(result);
            res.end()
        });
    });

    /************************************************************************************************************
     *Fix Images because they have absolute links instead of just the extensions
     *************************************************************************************************************/
    router.get('/fiximagespaths', function (req, res) {
        imagesController.getAllImages(function(result){
            var message = "";
            result.forEach(function(image){
                var url = image.url;
                url = url.replace(/https:\/\/englishinchina.s3.amazonaws.com\//g, "");
                //https://englishinchina.s3.amazonaws.com/Colors_of_dawn_in_Venice.png
                image.url = url;
                imagesController.updateImage(image, function(err, editedImage){
                    if(err){
                        console.log(err);}
                    else{
                        console.log(editedImage);
                    }
                });
            });
            console.log(result);
            res.end()
        });
    });

    /************************************************************************************************************
     *Fix Images because they have absolute links instead of just the extensions
     *************************************************************************************************************/
    router.get('/fixschoolspaths', function (req, res) {
        schoolsController.getAllSchools(function(result){
            var message = "";
            result.forEach(function(school){
                var url = school.pictureUrl;
                url = url.replace(/https:\/\/englishinchina.s3.amazonaws.com\//g, "");
                school.pictureUrl = url;
                schoolsController.editSchool(school, function(err, editedSchool){
                    if(err){
                        console.log(err);}
                    else{
                        console.log(editedSchool);
                    }
                });
            });
            console.log(result);
            res.end()
        });
    });

    /************************************************************************************************************
     *Fix Images because they have absolute links instead of just the extensions
     *************************************************************************************************************/
    router.get('/fixuserspaths', function (req, res) {
        usersController.getAllUsers(function(result){
            var message = "";
            result.forEach(function(user){
                var url = user.avatarUrl;
                if(url){
                    url = url.replace(/https:\/\/englishinchina.s3.amazonaws.com\//g, "");
                    user.avatarUrl = url;
                    usersController.updateUser(user, function(err, editedUser){
                        if(err){
                            console.log(err);}
                        else{
                            console.log(editedUser);
                        }
                    });
                }
            });
            console.log(result);
            res.end()
        });
    });





    return router;
};
