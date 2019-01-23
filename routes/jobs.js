const express = require('express');
const router = express.Router();
const moment = require('moment');
const jadefunctions = require('../jadeutilityfunctions');
const provincesController = require('../controllers/provincescontroller');
const companiesController = require('../controllers/companiescontroller');
const usersController = require('../controllers/userscontroller');
const citiesController = require('../controllers/citiescontroller');
const jobsController = require('../controllers/jobscontroller');
const messagesController = require('../controllers/messagescontroller');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');
const utils = require('../utils');
const url = require('url');

module.exports = function (passport) {

    router.route('/')
        .get(async (req, res, next) => {

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
                next(error);
            }
        })
        .post(async (req, res) => {

            try {

                let job = await jobsController.addJob(req.user, req.body);
                res.redirect('/job/' + job.url);

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

    router.get('/add', utils.isAuthenticated, async (req, res, next) => {

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
                scripts: [scripts.util, scripts.fileUploader, scripts.libmoment,
                scripts.libbsdatetimepicker, scripts.libslider, scripts.typeahead, scripts.addjob, scripts.stepper, scripts.nouislider,
                scripts.libtinyMCE, scripts.tinyMCE, scripts.reviewvalidation, scripts.typeaheadwrapper]
            });

        } catch (error) {
            next(error);
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

    router.get('/apply/:url', utils.isAuthenticated, async (req, res) => {
        if (!req.user.teachingDetails) {
            res.redirect('/user/teacher-details/' + req.user.id + '?redirectUrl=' + encodeURIComponent('/job/message/' + req.params.url));
        } else {
            res.redirect('/job/message/' + req.params.url);
        }
    });


    /** **********************************************************************************************************
       *queryJob : Method for search all jobs, it will return any job that has some of the information
       * Param : Query, string that will be looked for as part of the jobs name
       * [Province] optional.
       * [City] optional
       ************************************************************************************************************ */
    router.get('/message/:url', async (req, res) => {
        let job = await jobsController.getJobByUrl(req.params.url);

        let responseInfo;
        if (res.locals.flash.responseInfo) {
            responseInfo = res.locals.flash.responseInfo[0];
        }

        res.render('job/application/message', {
            title: 'Apply - ' + job.title,
            user: req.user,
            job,
            moment,
            pictureInfo: pictureinfo,
            responseInfo,
            jadefunctions,
            scripts: [scripts.util, scripts.fileUploader, scripts.libmoment,
            scripts.readMore, scripts.libtinyMCE, scripts.tinyMCE]
        });
    });

    router.post('/message/:url', async (req, res) => {

        try {
            let job = await jobsController.getJobByUrl(req.params.url);
            let messageToSend = await utils.validateParam(req.body.message);
            res.flash('responseInfo', { message: messageToSend });
            let formattedAppMessage = messagesController.formatApplicationMessage(req.user, messageToSend);
            await jobsController.sendApplicationMessage(job, req.user, job.user, formattedAppMessage);
            res.redirect('/job/thankyou/' + job.url);
        } catch (error) {
            res.flash('error', error.message);
            res.redirect('/job/message/' + job.url);
        }
    });

    router.get('/fixuserless', async (req, res) => {
        let options = { user: null };
        let jobs = await jobsController.getAllJobs(options);
        let user = await usersController.findUserByEmail('secondlanguageworld@gmail.com');
        jobs.forEach(async (job) => {
            await jobsController.updateJob(job.id, { user });
        });
    });

    router.get('/thankyou/:url', async (req, res) => {
        try {
            let job = await jobsController.getJobByUrl(req.params.url);
            res.render('job/application/thank-you', {
                title: 'Thank you from ' + job.title,
                user: req.user,
                job,
                moment,
                pictureInfo: pictureinfo,
                jadefunctions
            });
        } catch (error) {
            res.flash('error', 'Sorry, there was a problem trying to send your message.');
            res.flash('error', error.message);
            res.redirect('/job/message/' + job.url);
        }
    });

    router.get('/:url', async (req, res, next) => {

        try {
            let job = await jobsController.getJobByUrl(req.params.url);
            job = jobsController.fillInValues(job);

            let featuredJobs = await jobsController.getFeaturedJobs();
            featuredJobs = jadefunctions.trunkContentArray(featuredJobs, 'title', 120);
            featuredJobs = jadefunctions.trunkContentArray(featuredJobs, 'description', 250);

            res.render('job/single-job-page/job', {
                title: 'SLW - ' + job.title,
                user: req.user,
                job,
                moment,
                featuredJobs,
                pictureInfo: pictureinfo,
                jadefunctions
            });
        } catch (error) {
            next(error);
        }

    });

    return router;
};
