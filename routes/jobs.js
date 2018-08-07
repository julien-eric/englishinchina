const express = require('express');
const router = express.Router();
const moment = require('moment');
const jadefunctions = require('../jadeutilityfunctions');
const provincesController = require('../controllers/provinces');
const companiesController = require('../controllers/companies');
const citiesController = require('../controllers/cities');
const schoolsController = require('../controllers/schools');
const jobsController = require('../controllers/jobs');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');
const utils = require('../utils');
const url = require('url');

module.exports = function(passport) {

  router.route('/')
    .get(async (req, res) => {

      try {

        const province = utils.validateQuery(req.query.province);

        let jobs = await jobsController.getAllJobs();
        let provinces = await provincesController.getAllProvinces();
        let cities = undefined;
        if (province) {
          cities = await citiesController.getCitiesByProvince(province);
        }

        jobs = jadefunctions.trunkContentArray(jobs, 'title', 120);
        jobs = jadefunctions.trunkContentArray(jobs, 'description', 250);
        res.render('job/jobs-list', {
          title: `Jobs - Second Language World`,
          jobs,
          provinces,
          cities,
          moment,
          user: req.user,
          pictureInfo: pictureinfo,
          jadefunctions,
          scripts: [scripts.util, scripts.typeahead, scripts.typeaheadwrapper]
        });

      } catch (error) {
        res.render('error', {
          message: error.message,
          error: error
        });
      }
    })
    .post(async (req, res) => {

      try {

        let job = await jobsController.addJob(req.user, req.body);
        res.redirect('/job/' + job.id);

      } catch (error) {

        console.log(error);
        res.redirect(url.format({
          pathname: '/job/add',
          query: req.body
        }));

      }
    });

  router.get('/add', async (req, res) => {

    try {

      let job = {
        schoolId: req.query.schoolId,
        companyId: req.query.companyId,
        province: req.query.province,
        city: req.query.city,
        title: req.query.title,
        kicker: req.query.kicker,
        email: req.query.email,
        salary: req.query.salary,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        description: req.query.description
      };

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
      let companies = await companiesController.getAllCompanies();

      res.render('job/addjob', {
        title: `Add Job - SLW`,
        job,
        user: req.user,
        moment,
        companies,
        provinces,
        cities,
        pictureInfo: pictureinfo,
        searchInfo,
        jadefunctions,
        scripts: [scripts.util, scripts.fileUploader, scripts.libcalendar, scripts.libmoment, scripts.libbsdatetimepicker, scripts.libslider, scripts.typeahead, scripts.writereview, scripts.reviewvalidation, scripts.typeaheadwrapper]
      });

    } catch (error) {
      res.render('error', {
        message: error.message,
        error: error
      });
    }
  });

  router.get('/:id', async (req, res) => {
    let job = await jobsController.getJob(req.params.id);
    res.render('job/job', {
      title: 'SLW - ' + job.title,
      user: req.user,
      job,
      moment,
      pictureInfo: pictureinfo,
      jadefunctions,
      scripts: [scripts.util, scripts.fileUploader, scripts.libcalendar, scripts.libmoment]
    });
  });

  return router;
};
