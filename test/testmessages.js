let assert = require('assert');
let chai = require('chai');
const settings = require('simplesettings');
let expect = chai.expect;
const mongoose = require('mongoose');
mongoose.connect(settings.get('DB_URL'));

let conversationsController = require('../controllers/conversationscontroller');
let messagesController = require('../controllers/messagescontroller');
let users = require('../controllers/usersController');


describe('Messaging', function() {

  describe('Adding', function() {

    afterEach(function() {
    //   sampleJob = {};
    });

    it('should correctly create a conversation whose ID is the combination of both userIDs', async function() {

      let sampleUser1 = (await users.getAllUsers())[Math.floor(Math.random() * 10) + 1];
      let sampleUser2 = (await users.getAllUsers())[Math.floor(Math.random() * 10) + 1];

      let sampleJob = jobTemplate;
      sampleJob.schoolId = (await schools.getAllSchools())[0].id;
      sampleJob.cityId = (await cities.getAllCities())[0].id;
      sampleJob.provinceId = (await provinces.getAllProvinces())[0].id;
      sampleJob.companyId = (await companies.getAllCompanies())[0].id;

      let addedJob = await jobs.addJob(sampleUser, sampleJob);
      expect(addedJob.id).to.be.a('string');
    });

  });

});
