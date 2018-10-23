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

module.exports = function (passport) {

  router.route('/')
    .get(async (req, res) => {

      try {

        const province = utils.validateQuery(req.query.province);

        let jobs = await jobsController.getAllJobs();
        let provinces = await provincesController.getAllProvinces();
        let cities = undefined;
        if (province) {
          cities = await citiesController.getProvinceCitiesByCode(province);
        }

        jobs = jadefunctions.trunkContentArray(jobs, 'title', 120);
        jobs = jadefunctions.trunkContentArray(jobs, 'description', 250);
        res.render('job/job-home', {
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
        searchInfo.school = { name: school.name, id: school.id };
        searchInfo.province = school.province.code;
        searchInfo.city = school.city.code;
        cities = await citiesController.getProvinceCitiesByCode(searchInfo.province);
      } else {
        // If we don't have a school, we still might have a province-city
        searchInfo.province = utils.validateQuery(req.query.province);
        searchInfo.city = utils.validateQuery(req.query.city);

        if (searchInfo.province) {
          cities = await citiesController.getProvinceCitiesByCode(searchInfo.province);
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
        scripts: [scripts.util, scripts.fileUploader, scripts.libcalendar, scripts.libmoment,
               scripts.libbsdatetimepicker, scripts.libslider, scripts.typeahead, scripts.writereview, 
               scripts.libtinyMCE, scripts.tinyMCE, scripts.reviewvalidation, scripts.typeaheadwrapper]
      });

    } catch (error) {
      res.render('error', {
        message: error.message,
        error: error
      });
    }
  });

  /** **********************************************************************************************************
     *searchJob : Method for search all jobs, it will return any job that has some of the information
     * Param : Query, string that will be looked for as part of the jobs name
     * [Province] optional.
     * [City] optional
     ************************************************************************************************************ */
  router.get('/search/', async (req, res) => {

    try {
      const jobInfo = req.query.jobInfo;
      const province = utils.validateQuery(req.query.province);
      const city = utils.validateQuery(req.query.city);

      let searchResults = await jobsController.searchJobs(jobInfo, province, city);
      if (searchResults != undefined && searchResults.list != undefined && searchResults.list.length > 0) {
        searchResults.list = jadefunctions.trunkContentArray(searchResults.list, 'description', 150);
      }

      // let popularCities = await citiesController.getMostPopularCities();
      // let popularProvinces = await provincesController.getMostPopularProvinces();
      let popularCities = undefined;
      let popularProvinces = undefined;

      let provinces = await provincesController.getAllProvinces();
      let cities = undefined;
      if (province) {
        cities = await citiesController.getProvinceCitiesByCode(province);
      }
      res.render('job/job-search', {
        title: `${searchResults.query} Jobs - Second Language World`,
        jobs: searchResults.list,
        user: req.user,
        provinces,
        cities,
        pictureInfo: pictureinfo,
        popularCities,
        popularProvinces,
        moment,
        searchMessage: `You searched for ${searchResults.query}`,
        searchInfo: searchResults.searchInfo,
        jadefunctions,
        scripts: [scripts.util, scripts.typeahead, scripts.typeaheadwrapper]
      });
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: error
      });
    }
  });

  /** **********************************************************************************************************
     *queryJob : Method for search all jobs, it will return any job that has some of the information
     * Param : Query, string that will be looked for as part of the jobs name
     * [Province] optional.
     * [City] optional
     ************************************************************************************************************ */
  router.get('/query/', async (req, res) => {

    try {
      const jobInfo = req.query.jobInfo || undefined;
      const limit = parseInt(req.query.limit) || undefined;
      const province = utils.validateQuery(req.query.province);
      const city = utils.validateQuery(req.query.city);
      let searchResults = await jobsController.searchJobs(jobInfo, province, city, undefined, limit, true);
      res.send(JSON.stringify({ query:'jobs', list: searchResults.list, total: searchResults.total }));
    } catch (error) {
      res.send(error);
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
      scripts: [scripts.util, scripts.fileUploader, scripts.libcalendar, scripts.libmoment, scripts.readMore]
    });
  });

  return router;
};
