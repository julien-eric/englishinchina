const express = require('express');
const router = express.Router();
const moment = require('moment');
const criteria = require('../criteria').criteria;
const schools = require('../controllers/schools');
const reviews = require('../controllers/reviews');
const jadefunctions = require('./jadeutilityfunctions');
const provincesController = require('../controllers/provinces');
const citiesController = require('../controllers/cities');
const schoolsController = require('../controllers/schools');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');
const utils = require('../utils');

module.exports = function(passport) {

  /** **********************************************************************************************************
       *WriteReview : Page for users to write review for school specified by id
       * Param : School id
       ************************************************************************************************************ */
  router.get('/', async (req, res) => {

    try {


      const searchInfo = {};
      const schoolId = utils.validateQuery(req.query.schoolId);
      let cities = undefined;

      if (schoolId != -1) {
        // If we have a school we have all the information we need
        const school = await schoolsController.findSchoolById(schoolId);
        searchInfo.school = {name: school.name, id: school.id};
        searchInfo.province = school.province.code;
        searchInfo.city = school.city.code;
        cities = await citiesController.getCitiesByProvince(searchInfo.province);
      } else {
        // If we don't have a school, we still might have a province-city
        searchInfo.province = utils.validateQuery(req.query.province);
        searchInfo.city = utils.validateQuery(req.query.city);

        if (searchInfo.province) {
          cities = await citiesController.getCitiesByProvince(searchInfo.province);
        }
      }

      let provinces = await provincesController.getAllProvinces();
      res.render('review/writereview', {
        title: `Write Review - SLW`,
        user: req.user,
        criteria,
        moment,
        provinces,
        cities,
        pictureInfo: pictureinfo,
        searchInfo,
        jadefunctions,
        scripts: [scripts.util, scripts.libcalendar, scripts.libmoment, scripts.libbsdatetimepicker, scripts.libslider, scripts.writereview, scripts.reviewvalidation, scripts.typeahead]
      });

    } catch (error) {
      res.render('error', {
        message: error.message,
        error: error
      });
    }
  });

  /** **********************************************************************************************************
     *insertCommentforSchool : POST insertreview on school
     * userID : integer
     * schoolID : integer
     * review : string
     ************************************************************************************************************ */
  router.post('/', async (req, res) => {
    try {
      await reviews.insertReviewforSchool(req);
      let school = await schools.findSchoolById(req.body.schoolId);
      res.redirect('/school/id/' + school.id);
    } catch (error) {
      res.send(error);
    }
  });

  return router;
};
