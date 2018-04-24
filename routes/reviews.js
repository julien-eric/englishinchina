const express = require('express');
const router = express.Router();
const moment = require('moment');
const criteria = require('../criteria').criteria;
const schools = require('../controllers/schools');
const reviews = require('../controllers/reviews');
const jadefunctions = require('./jadeutilityfunctions');
const provincesController = require('../controllers/provinces');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');

module.exports = function(passport) {

  /** **********************************************************************************************************
       *WriteReview : Page for users to write review for school specified by id
       * Param : School id
       ************************************************************************************************************ */
  router.get('/', async (req, res) => {
    let provinces = await provincesController.getAllProvinces();
    res.render('writereview', {
      title: `Write Review - SLW`,
      user: req.user,
      criteria,
      moment,
      provinces,
      pictureInfo: pictureinfo,
      jadefunctions,
      scripts: [scripts.util, scripts.libcalendar, scripts.libmoment, scripts.libbsdatetimepicker, scripts.libslider, scripts.writereview, scripts.typeahead]
    });
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
