const express = require('express');
const router = express.Router();
const moment = require('moment');
const jadefunctions = require('../jadeutilityfunctions');
const provincesController = require('../controllers/provincescontroller');
const companiesController = require('../controllers/companiescontroller');
const citiesController = require('../controllers/citiescontroller');
const schoolsController = require('../controllers/schoolscontroller');
const jobsController = require('../controllers/jobscontroller');
const messagesController = require('../controllers/messagescontroller');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');
const utils = require('../utils');
const url = require('url');

module.exports = function (passport) {

    router.route('/')
        .get(async (req, res) => {

            try {

                const province = utils.validateParam(req.query.province);

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

            } catch (errorInfo) {

                let jobInsertError = errorInfo.error;
                let jobInfo = errorInfo.jobInfo;

                for (let field in jobInsertError.errors) {
                    if (jobInsertError.errors.hasOwnProperty(field)) {
                        res.flash('error', jobInsertError.errors[field].message);
                    }
                }

                res.flash('responseInfo', jobInfo);
                res.redirect(url.format({ pathname: '/job/add' }));

            }
        });

    router.get('/test', async (req, res) => {

        res.flash('error', 'this isnt what we are looking for.');
        res.flash('error', 'Unavailable allocation of memory');
        res.redirect(url.format({ pathname: '/job/add' }));
    });

    router.get('/add', async (req, res) => {

        try {

            let responseInfo;
            if (res.locals.flash.responseInfo) {
                responseInfo = res.locals.flash.responseInfo[0];
            }

            let cities = undefined;
            let provinces = await provincesController.getAllProvinces();
            let companies = await companiesController.getAllCompanies();
            if (responseInfo && responseInfo.provinceCode) {
                cities = await citiesController.getProvinceCitiesByCode(responseInfo.provinceCode);
            }

            res.render('job/creation/job-add', {
                title: `Add Job - SLW`,
                user: req.user,
                moment,
                companies,
                provinces,
                cities,
                responseInfo: responseInfo,
                jadefunctions: jadefunctions,
                pictureInfo: pictureinfo,
                scripts: [scripts.util, scripts.fileUploader, scripts.libcalendar, scripts.libmoment,
                scripts.libbsdatetimepicker, scripts.libslider, scripts.typeahead, scripts.addjob, scripts.stepper, scripts.nouislider,
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
            const province = utils.validateParam(req.query.province);
            const city = utils.validateParam(req.query.city);

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
            const province = utils.validateParam(req.query.province);
            const city = utils.validateParam(req.query.city);
            let searchResults = await jobsController.searchJobs(jobInfo, province, city, undefined, limit, true);
            res.send(JSON.stringify({ query: 'jobs', list: searchResults.list, total: searchResults.total }));
        } catch (error) {
            res.send(error);
        }
    });

    router.get('/apply/:id', utils.isAuthenticated, async (req, res) => {
        res.redirect('/user/teacher-details/' + req.user.id + '?redirectUrl=/job/message/' + req.params.id);
    });


    /** **********************************************************************************************************
       *queryJob : Method for search all jobs, it will return any job that has some of the information
       * Param : Query, string that will be looked for as part of the jobs name
       * [Province] optional.
       * [City] optional
       ************************************************************************************************************ */
    router.get('/message/:id', async (req, res) => {
        let job = await jobsController.getJob(req.params.id);
        res.render('job/application/message', {
            title: 'Apply - ' + job.title,
            user: req.user,
            job,
            moment,
            pictureInfo: pictureinfo,
            jadefunctions,
            scripts: [scripts.util, scripts.fileUploader, scripts.libcalendar, scripts.libmoment,
            scripts.readMore, scripts.libtinyMCE, scripts.tinyMCE]
        });
    });

    router.post('/message/:id', async (req, res) => {

        let job = await jobsController.getJob(req.params.id);
        let messageToSend = await utils.validateParam(req.body.message);
        await messagesController.createMessage(req.user, job.user, messageToSend);
        res.redirect('/job/message/' + job.id);
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
