const express = require('express');
const router = express.Router();
const moment = require('moment');
const criteria = require('../criteria').criteria;
const schools = require('../controllers/schoolscontroller');
const reviews = require('../controllers/reviewscontroller');
const companiesController = require('../controllers/companiescontroller');
const jadefunctions = require('../jadeutilityfunctions');
const provincesController = require('../controllers/provincescontroller');
const citiesController = require('../controllers/citiescontroller');
const schoolsController = require('../controllers/schoolscontroller');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');
const utils = require('../utils');
const tokensController = require('../submissiontokens');

module.exports = function (passport) {

  /** **********************************************************************************************************
       *WriteReview : Page for users to write review for school specified by id
       * Param : School id
       ************************************************************************************************************ */
  router.get('/', async (req, res) => {

    try {

      const searchInfo = {};
      const schoolId = utils.validateParam(req.query.schoolId);
      let cities = undefined;

      if (schoolId != -1) {
        // If we have a school we have all the information we need
        const school = await schoolsController.findSchoolById(schoolId);
        searchInfo.school = { name: school.name, id: school._id };
        searchInfo.province = school.province.code;
        searchInfo.city = school.city.code;
        cities = await citiesController.getProvinceCitiesByCode(searchInfo.province);
      } else {
        // If we don't have a school, we still might have a province-city
        searchInfo.province = utils.validateParam(req.query.province);
        searchInfo.city = utils.validateParam(req.query.city);

        if (searchInfo.province) {
          cities = await citiesController.getProvinceCitiesByCode(searchInfo.province);
        }
      }

      let token = tokensController.createToken();
      let companies = await companiesController.getAllCompanies();
      let provinces = await provincesController.getAllProvinces();
      res.render('review/writereview', {
        title: `Write Review - SLW`,
        user: req.user,
        criteria,
        moment,
        provinces,
        cities,
        companies,
        pictureInfo: pictureinfo,
        searchInfo,
        tokenValue: token.value,
        jadefunctions,
        scripts: [scripts.util, scripts.libcalendar, scripts.libmoment, scripts.libbsdatetimepicker, scripts.libslider, scripts.typeahead, scripts.writereview, scripts.fileUploader, scripts.reviewvalidation, scripts.typeaheadwrapper]
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

      let school = await schools.findSchoolById(req.body.schoolId);
      let schoolUrl = '/school/' + school._id;
      let token = tokensController.recuperateToken(req.body.submissionTokenVal);
      
      if (token.state == tokensController.ALIVE) {
        
        token.processing();
        token.setUrl(schoolUrl);
        await reviews.insertReviewforSchool(req);
        token.processed();

      } else if (token.state == tokensController.PROCESSING) {
        console.log('Token ' + token.value + ' is already being processed');
      } else if (token.state == tokensController.PROCESSED) {
        console.log('Token ' + token.value + ' has already been processed');
      } else if (token.state == tokensController.TIMED_OUT) {
        console.log('Token ' + token.value + ' has timed out');
      }

      res.redirect('/school/' + school._id);

    } catch (error) {
      res.send(error);
    }
  });

  return router;
};
