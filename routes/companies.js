const express = require('express');
const moment = require('moment');

const router = express.Router();
const schools = require('../controllers/schools');
const provincesController = require('../controllers/provinces');
const citiesController = require('../controllers/cities');
const companies = require('../controllers/companies');
const jadefunctions = require('./jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const async = require('async');
const scripts = require('../scripts').scripts;
const settings = require('simplesettings');
const fcbAppId = settings.get('FCB_APP_ID');

module.exports = function(passport) {

  router.route('/addcompany')
    .get((req, res) => {
      res.render('company/addcompany', {
        title: 'Add Company - English in China',
        fcbAppId,
        message: req.flash('message'),
        scripts: [scripts.util, scripts.libtinyMCE, scripts.tinyMCE]
      });
    })
    .post((req, res) => {
      const company = {
        name: req.body.name,
        description: req.body.description,
        website: req.body.website,
        pictureUrl: req.body.pictureUrl,
        logoUrl: req.body.logoUrl
      };
      companies.addCompany(company).then((newCompany) => {
        res.redirect(`/company/id/${newCompany.id}`);
      });
    });

  router.route('/edit/:id')
    .get((req, res) => {
      companies.findCompanyById(req.params.id, (company) => {
        res.render('company/editcompany', {
          title: `Edit ${company.name} - English in China`,
          fcbAppId,
          company,
          message: req.flash('message'),
          pictureInfo: pictureinfo,
          scripts: [scripts.util, scripts.libtinyMCE, scripts.tinyMCE]
        });
      });
    })
    .post((req, res) => {
      const company = {
        id: req.params.id,
        name: req.body.name,
        description: req.body.description,
        website: req.body.website,
        pictureUrl: req.body.pictureUrl,
        logoUrl: req.body.logoUrl
      };
      companies.editCompany(company).then((newCompany) => {
        res.redirect(`/company/id/${newCompany.id}`);
      });
    });


  router.get('/id/:id', (req, res) => {
    async.waterfall([
      function findCompany(done) {
        companies.findCompanyById(req.params.id, (company) => {
          done(null, company);
        });
      },

      function getPopularCities(company, done) {
        citiesController.getMostPopularCities((popularCities) => {
          done(null, company, popularCities);
        });
      },
      function getPopularProvinces(company, popularCities, done) {
        provincesController.getMostPopularProvinces((popularProvinces) => {
          done(null, company, popularCities, popularProvinces);
        });
      },
      function getSchoolList(company, popularCities, popularProvinces, done) {
        schools.findSchoolsByCompany(company.id, (err, schoolList) => {
          done(err, company, popularCities, popularProvinces, schoolList);
        });
      },
      function getprovincesByCompany(company, popularCities, popularProvinces, schoolList, done) {
        provincesController.getMostPopularProvincesbyCompany(req.params.id, (provincesByCompany) => {
          done(null, company, popularCities, popularProvinces, schoolList, provincesByCompany);
        });
      },
      function finish(company, popularCities, popularProvinces, schoolList, provincesByCompany) {
        const truckSchoolList = jadefunctions.trunkSchoolDescription(schoolList, 150);
        res.render('company/company', {
          title: `${company.name} - English in China`,
          fcbAppId,
          company,
          user: req.user,
          moment,
          jadefunctions,
          popularCities,
          popularProvinces,
          provincesByCompany,
          schools: truckSchoolList,
          pictureInfo: pictureinfo,
          scripts: [scripts.librater, scripts.rating, scripts.libbarchart, scripts.util, scripts.libekkolightbox, scripts.schoolpage]
        });
      }
    ], (err, callback) => {
      if (err) {
        console.log(err);
      }
    });
  });

  return router;
};
