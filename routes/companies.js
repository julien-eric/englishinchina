const express = require('express');
const moment = require('moment');

const router = express.Router();
const schools = require('../controllers/schools');
const provincesController = require('../controllers/provinces');
const citiesController = require('../controllers/cities');
const companies = require('../controllers/companies');
const jadefunctions = require('./jadeutilityfunctions');
const pictureinfo = require('../pictureinfo');
const scripts = require('../public/scripts');

module.exports = function(passport) {

  router.get('/id/:id', async (req, res) => {
    let companyId = req.params.id;
    let company = await companies.findCompanyById(companyId);
    company.splitDescription = await jadefunctions.splitDescription(company.description, 600);
    let popularCities = await citiesController.getMostPopularCities();
    let popularProvinces = await provincesController.getMostPopularProvinces();
    let schoolList = await schools.findSchoolsByCompany(company);
    let provincesByCompany = await provincesController.getMostPopularProvincesbyCompany(companyId);
    const truckSchoolList = jadefunctions.trunkContentArray(schoolList, 'description', 150);
    res.render('company/company', {
      title: `${company.name} - Second Language World`,
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
  });

  /** **********************************************************************************************************
   *searchCompany : Method for search companies , it will return any company that has some of the information
   * Param : Query, string that will be looked for as part of the companys name
   ************************************************************************************************************ */
  router.get('/search', async (req, res) => {

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
      res.render('error', {
        message: error.message,
        error: error
      });
    }
  });

  router.route('/addcompany')
    .get((req, res) => {
      res.render('company/addcompany', {
        title: 'Add Company - Second Language World',
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
          title: `Edit ${company.name} - Second Language World`,
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

  return router;
};
