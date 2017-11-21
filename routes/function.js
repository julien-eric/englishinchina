const express = require('express');

const router = express.Router();
const provincesController = require('../controllers/provinces');
const provincesSource = require('../provinces');
const citiesController = require('../controllers/cities');
const imagesController = require('../controllers/images');
const schoolsController = require('../controllers/schools');
const usersController = require('../controllers/users');
const citiesSource = require('../citiesJSON');

module.exports = function(passport) {
  /** **********************************************************************************************************
     *Init Provinces
     ************************************************************************************************************ */
  router.get('/initprovinces', (req, res) => {
    provincesController.initProvinces(provincesSource.provinces, (result) => {
      console.log(result);
      res.end();
    });
  });

  /** **********************************************************************************************************
     *Init Cities
     ************************************************************************************************************ */
  router.get('/initcities', (req, res) => {
    citiesController.initCities(citiesSource.cities, () => {
      res.end();
    });
  });

  /** **********************************************************************************************************
     *Push Cities
     ************************************************************************************************************ */
  router.get('/pushcities', (req, res) => {
    citiesController.pushCities(citiesController.citiesToPush, (result) => {
      console.log(result);
      res.end();
    });
  });

  /** **********************************************************************************************************
     *Fix Images because they have absolute links instead of just the extensions
     ************************************************************************************************************ */
  router.get('/fiximagespaths', (req, res) => {
    imagesController.getAllImages((result) => {
      result.forEach((image) => {
        let url = image.url;
        url = url.replace(/https:\/\/englishinchina.s3.amazonaws.com\//g, '');
        // https://englishinchina.s3.amazonaws.com/Colors_of_dawn_in_Venice.png
        image.url = url;
        imagesController.updateImage(image, (err, editedImage) => {
          if (err) {
            console.log(err);
          } else {
            console.log(editedImage);
          }
        });
      });
      console.log(result);
      res.end();
    });
  });

  /** **********************************************************************************************************
     *Fix Images because they have absolute links instead of just the extensions
     ************************************************************************************************************ */
  router.get('/fixschoolspaths', (req, res) => {
    schoolsController.getAllSchools((result) => {
      result.forEach((school) => {
        let url = school.pictureUrl;
        url = url.replace(/https:\/\/englishinchina.s3.amazonaws.com\//g, '');
        school.pictureUrl = url;
        schoolsController.editSchool(school, (err, editedSchool) => {
          if (err) {
            console.log(err);
          } else {
            console.log(editedSchool);
          }
        });
      });
      console.log(result);
      res.end();
    });
  });

  /** **********************************************************************************************************
     *Fix Images because they have absolute links instead of just the extensions
     ************************************************************************************************************ */
  router.get('/fixuserspaths', (req, res) => {
    usersController.getAllUsers((result) => {
      result.forEach((user) => {
        let url = user.avatarUrl;
        if (url) {
          url = url.replace(/https:\/\/englishinchina.s3.amazonaws.com\//g, '');
          user.avatarUrl = url;
          usersController.updateUser(user, (err, editedUser) => {
            if (err) {
              console.log(err);
            } else {
              console.log(editedUser);
            }
          });
        }
      });
      console.log(result);
      res.end();
    });
  });


  return router;
};
