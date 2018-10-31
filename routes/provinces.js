const express = require('express');
const router = express.Router();
const moment = require('moment');
const jadefunctions = require('../jadeutilityfunctions');
const provincesController = require('../controllers/provincescontroller');
const companiesController = require('../controllers/companiescontroller');
const citiesController = require('../controllers/citiescontroller');
const schoolsController = require('../controllers/schoolscontroller');
const jobsController = require('../controllers/jobscontroller');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');
const utils = require('../utils');
const url = require('url');

module.exports = function (passport) {

    router.route('/:code')
        .get(async (req, res) => {

            try {

                const provinceCode = utils.validateParam(req.params.code);

                let schools = [];
                let companies = [];
                let jobs = [];

                schools = await schoolsController.searchSchools('', provinceCode, -1);
                if (schools != undefined && schools.list != undefined && schools.list.length > 0) {
                    schools.list = jadefunctions.trunkContentArray(schools.list, 'description', 150);
                }

                companies = await companiesController.searchCompanies('', provinceCode, -1);
                if (schools != undefined && companies.list != undefined && companies.list.length > 0) {
                    companies.list = jadefunctions.trunkContentArray(companies.list, 'description', 150);
                }

                jobs = await jobsController.searchJobs('', provinceCode, -1);
                if (jobs != undefined && jobs.list != undefined && jobs.list.length > 0) {
                    jobs.list = jadefunctions.trunkContentArray(jobs.list, 'description', 150);
                }

                let province = await provincesController.getProvinceByCode(provinceCode);
                province.pictureUrl = (await provincesController.getProvinceWithPic(provinceCode))[0].pictureUrl;

                let cities = undefined;
                if (provinceCode) {
                    cities = await citiesController.getProvinceCitiesByCode(provinceCode);
                }

                // title: `${searchResults.query} Schools - Second Language World`,
                res.render('province/province', {
                    title: `Schools - Second Language World`,
                    schools: schools.list,
                    jobs: companies.list,
                    companies: jobs.list,
                    user: req.user,
                    cities,
                    province,
                    jadefunctions,
                    pictureInfo: pictureinfo,
                    scripts: [scripts.util, scripts.typeahead, scripts.typeaheadwrapper]
                });

            } catch (error) {
                res.render('error', {
                    message: error.message,
                    error: error
                });
            }
        });

    return router;
};
