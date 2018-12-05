const express = require('express');
const moment = require('moment');

const router = express.Router();
const schools = require('../controllers/schoolscontroller');
const provincesController = require('../controllers/provincescontroller');
const companies = require('../controllers/companiescontroller');
const reviewsController = require('../controllers/reviewscontroller');
const jadefunctions = require('../jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');

module.exports = function (passport) {

    /** **********************************************************************************************************
     *searchCompany : Method for search companies , it will return any company that has some of the information
     * Param : Query, string that will be looked for as part of the companys name
     ************************************************************************************************************ */
    router.get('/search', async (req, res, next) => {

        try {
            const companyInfo = req.query.companyInfo;

            let searchResults = await companies.searchCompanies(companyInfo);
            if (searchResults != undefined && searchResults.list != undefined && searchResults.list.length > 0) {
                searchResults.list = jadefunctions.trunkContentArray(searchResults.list, 'description', 150);
            }

            res.render('search', {
                title: `${searchResults.query} Companies - Second Language World`,
                companies: searchResults.list,
                user: req.user,
                pictureInfo: pictureinfo,
                searchMessage: `You searched for ${searchResults.query}`,
                searchInfo: searchResults.searchInfo,
                jadefunctions,
                scripts: [scripts.util, scripts.typeahead, scripts.typeaheadwrapper]
            });
        } catch (error) {
            next(error);
        }
    });

    router.route('/addcompany')
        .get((req, res) => {
            res.render('company/addcompany', {
                title: 'Add Company - Second Language World',
                message: req.flash('message'),
                scripts: [scripts.util, scripts.fileUploader, scripts.libtinyMCE, scripts.tinyMCE]
            });
        })
        .post(async (req, res) => {
            const company = {
                name: req.body.name,
                description: req.body.description,
                website: req.body.website,
                pictureUrl: req.body.urlNewCompanyPicture,
                logoUrl: req.body.urlNewCompanyLogo
            };
            let newCompany = await companies.addCompany(company);
            res.redirect(`/company/${newCompany.id}`);
        });

    router.route('/edit/:id')
        .get((req, res) => {
            companies.findCompanyById(req.params.id, (company) => {
                res.render('company/editcompany', {
                    title: `Edit ${company.name} - Second Language World`,
                    company,
                    message: req.flash('message'),
                    pictureInfo: pictureinfo,
                    scripts: [scripts.util, scripts.fileUploader, scripts.libtinyMCE, scripts.tinyMCE]
                });
            });
        })
        .post((req, res) => {
            const company = {
                id: req.params.id,
                name: req.body.name,
                description: req.body.description,
                website: req.body.website,
                pictureUrl: req.body.urlNewCompanyPicture,
                logoUrl: req.body.urlNewCompanyLogo
            };
            companies.editCompany(company).then((newCompany) => {
                res.redirect(`/company/${newCompany.id}`);
            });
        });

    router.get('/:id', async (req, res, next) => {

        try {
            let companyId = req.params.id;
            let company = await companies.findCompanyWithSchoolsAndReviews(companyId);
            company.splitDescription = await jadefunctions.splitDescription(company.description, 600);

            let schoolList = await schools.findSchoolsByCompany(company);
            let provincesByCompany = await provincesController.getMostPopularProvincesbyCompany(companyId);
            schoolList = jadefunctions.trunkContentArray(schoolList, 'description', 300);
            company.reviews = jadefunctions.trunkContentArray(company.reviews, 'comment', 190);
            let splashReview = reviewsController.selectSplashReview(company.reviews);
            let splashSchool = undefined;
            if (!splashReview) {
                splashSchool = schools.selectSplashSchool(schoolList);
            }
            res.render('company/company', {
                title: `${company.name} - Second Language World`,
                company,
                user: req.user,
                moment,
                splashReview,
                splashSchool,
                jadefunctions,
                provincesByCompany,
                schools: schoolList,
                pictureInfo: pictureinfo,
                scripts: [scripts.librater, scripts.rating, scripts.libbarchart, scripts.util, scripts.libekkolightbox, scripts.schoolPage]
            });
        } catch (error) {
            next(error);
        }

    });

    return router;
};
