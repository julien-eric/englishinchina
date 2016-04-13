var express = require('express');
var router = express.Router();
var provincesController = require('../controllers/provinces');
var provincesSource = require('../provinces');
var citiesController = require('../controllers/cities');
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
     *Init Provinces
     *************************************************************************************************************/
    router.get('/initcities', function (req, res) {
        citiesController.initCities(citiesSource.cities, function(){
            res.end()
        });
    });

    /************************************************************************************************************
     *Init Provinces
     *************************************************************************************************************/
    router.get('/pushcities', function (req, res) {
        citiesController.pushCities(citiesController.citiesToPush, function(result){
            console.log(result);
            res.end()
        });
    });

    return router;
};
