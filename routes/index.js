const express = require('express');
const router = express.Router();
const emailsController = require('../controllers/emailscontroller');
const moment = require('moment');
const jadefunctions = require('../jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const splashText = require('../splash-text.json');
const provincesController = require('../controllers/provincescontroller');
const citiesController = require('../controllers/citiescontroller');
const jobsController = require('../controllers/jobscontroller');
const winston = require('../config/winstonconfig');
const scripts = require('../public/scripts');
const utils = require('../utils');

module.exports = function (passport) {

    // Home Page
    router.get('/', async (req, res, next) => {

        try {
            let featuredJobs = await jobsController.getFeaturedJobs();
            featuredJobs = jadefunctions.trunkContentArray(featuredJobs, 'title', 120);
            featuredJobs = jadefunctions.trunkContentArray(featuredJobs, 'description', 170);
            let popularProvinces = await provincesController.getMostPopularProvincesbyJobs();

            let meta = utils.generateMeta(
                'Discover, Learn, Teach. Explore job opportunities around the world',
                splashText.description,
                utils.getFullUrl(req),
                splashText.image
            );

            res.render('home/home', {
                meta,
                main: true,
                user: req.user,
                pictureInfo: pictureinfo,
                moment,
                jadefunctions,
                featuredJobs,
                popularProvinces,
                // popularCompanies,
                splashText
            });
        } catch (error) {
            next(error);
        }
    });

    /** **********************************************************************************************************
       *search : Method for search site, it will return any school, company, job that has some of the information
       * Param : Query, string that will be looked for
    ************************************************************************************************************ */
    router.get('/search/', async (req, res, next) => {

        try {

            let queryInfo;
            const searchInfo = {};
            searchInfo.sort = req.query.sort;

            searchInfo.queryInfo = req.query.queryInfo;

            searchInfo.cityCode = utils.validateParam(req.query.city);
            searchInfo.cityCode ? searchInfo.city = await citiesController.getCityByCode(searchInfo.cityCode) : null;
            searchInfo.provinceCode = utils.validateParam(req.query.province);

            if (searchInfo.cityCode != -1 && searchInfo.provinceCode == -1) {
                searchInfo.provinceCode = searchInfo.city.province.code;
                searchInfo.province = await provincesController.getProvinceByCode(searchInfo.provinceCode);
            }

            searchInfo.provinceCode ? searchInfo.province = await provincesController.getProvinceByCode(searchInfo.provinceCode) : null;

            let filters = {
                salaryLower: req.query.salaryLower,
                salaryHigher: req.query.salaryHigher,
                startDateFrom: req.query.startDateFrom,
                startDateTo: req.query.startDateTo,
                accomodation: req.query.accomodation,
                airfare: req.query.airfare
            };

            let jobs = [];
            jobs = await jobsController.searchJobs(searchInfo.queryInfo, searchInfo.provinceCode, searchInfo.cityCode, filters);
            if (jobs != undefined && jobs.list != undefined && jobs.list.length > 0) {
                jobs.list = jadefunctions.trunkContentArray(jobs.list, 'description', 280);
                jobs.list = jadefunctions.trunkContentArray(jobs.list, 'title', 120);
                jobs.list = jadefunctions.trunkContentArray(jobs.list, 'kicker', 75);

            }

            if (req.query.ajax) {

                res.render('job/job-list', {
                    jobs: jobs.list,
                    pictureInfo: pictureinfo,
                    moment,
                    jadefunctions
                }, function (err, html) {
                    if (err) {
                        winston.error(err);
                    } else {
                        res.send(html);
                    }
                });

            } else {

                let bannerPicture;
                if (searchInfo.city) {
                    bannerPicture = await citiesController.getCityPic(searchInfo.cityCode);
                    queryInfo = searchInfo.city.pinyinName;
                } else if (searchInfo.province) {
                    bannerPicture = await provincesController.getProvincePic(searchInfo.provinceCode);
                    queryInfo = searchInfo.province.name;
                }

                // Fetch list of all provinces and cities.
                let cities = undefined;
                if (searchInfo.provinceCode != -1) {
                    cities = await citiesController.getProvinceCitiesByCode(searchInfo.provinceCode);
                }

                // let popularProvinces = await provincesController.getMostPopularProvincesbyJobs();
                let title = utils.titleFromSearchInfo(searchInfo);
                let meta = utils.generateMeta(
                    title,
                    splashText.description,
                    utils.getFullUrl(req),
                    bannerPicture || splashText.image
                );

                res.render('search/search', {
                    meta,
                    jobs: jobs.list,
                    searchInfo,
                    user: req.user,
                    cities,
                    pictureInfo: pictureinfo,
                    queryInfo,
                    bannerPicture,
                    responseInfo: filters,
                    moment,
                    jadefunctions
                });
            }

        } catch (error) {
            next(error);
        }
    });

    router.get('/cityrenametest/', async (req, res, next) => {
        let cities = await citiesController.getAllCities();
        cities.forEach(async (city) => {
            await citiesController.updateCity({ code: city.code, pinyinName: city.pinyinName });
        });
    });

    /** **********************************************************************************************************
       *fetchprovinces : Typeahead on client side will fetch list of all provinces
    ************************************************************************************************************ */
    router.get('/fetchprovinces', async (req, res) => {
        try {
            let provinces = await provincesController.getAllProvinces();
            res.send(JSON.stringify({ query: 'provinces', list: provinces, total: provinces.length }));
        } catch (error) {
            res.send(error);
        }
    });

    /** **********************************************************************************************************
       *fetchcities : Typeahead on client side will fetch list of all provinces
    ************************************************************************************************************ */
    router.get('/fetchcities', async (req, res) => {

        try {
            let cities = await citiesController.getAllCities();
            res.send(JSON.stringify({ query: 'provinces', list: cities, total: cities.length }));
        } catch (error) {
            res.send(error);
        }
    });

    router.get('/about', async (req, res, next) => {

        try {
            let provinces = await provincesController.getAllProvinces();
            let popularCities = await citiesController.getMostPopularCities();
            let popularProvinces = await provincesController.getMostPopularProvinces();

            const splashText = require('../splash-text.json');
            res.render('home/about', {
                title: 'Second Language World',
                user: req.user,
                provinces,
                main: true,
                pictureInfo: pictureinfo,
                jadefunctions,
                popularCities,
                popularProvinces,
                splashText,
                currentPage: 1,
                scripts: [scripts.librater, scripts.util, scripts.rating, scripts.typeahead, scripts.typeaheadwrapper]
            });
        } catch (error) {
            next(error);
        }
    });

    router.get('/tefl-express', async (req, res, next) => {

        try {

            let provinces = await provincesController.getAllProvinces();
            let popularCities = await citiesController.getMostPopularCities();
            let popularProvinces = await provincesController.getMostPopularProvinces();

            const splashText = require('../splash-text.json');
            res.render('home/tefl-express', {
                title: 'Second Language World',
                user: req.user,
                provinces,
                main: true,
                pictureInfo: pictureinfo,
                jadefunctions,
                popularCities,
                popularProvinces,
                splashText,
                currentPage: 1,
                scripts: [scripts.librater, scripts.util, scripts.rating, scripts.typeahead, scripts.typeaheadwrapper]
            });
        } catch (error) {
            next(error);
        }
    });

    router.get('/cities/:provincecode', async (req, res) => {
        const provCode = req.params.provincecode;
        let cities = await citiesController.getProvinceCitiesByCode(provCode);
        res.send(cities);
    });

    router.post('/contactus', (req, res) => {
        res.flash('info', 'Thank you, we will get back to you shortly');
        emailsController.contactUsForm(req.body.emailContact, req.body.message);
        res.redirect('/');
    });

    return router;
};
