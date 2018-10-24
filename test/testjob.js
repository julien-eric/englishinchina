let assert = require('assert');
let chai = require('chai');
const settings = require('simplesettings');
let expect = chai.expect;
const mongoose = require('mongoose');
mongoose.connect(settings.get('DB_URL'));

let jobs = require('../controllers/jobscontroller');
let users = require('../controllers/usersController');
let schools = require('../controllers/schoolscontroller');
let cities = require('../controllers/citiescontroller');
let provinces = require('../controllers/provincescontroller');
let companies = require('../controllers/companiescontroller');

let jobTemplate = {
  title: 'Great Job Opportunity in Hejiang!',
  url: 'http://example.com',
  author: 'Breant32',
  schoolId: undefined,
  email: 'secondlanguageworld@gmail.com',
  pictureUrl: 'Chengdu.jpg',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Morbi tristique senectus et netus et malesuada fames ac turpis. Fusce id velit ut tortor pretium viverra suspendisse. Cras sed felis eget velit aliquet sagittis id consectetur purus. Aenean euismod elementum nisi quis eleifend. Fermentum dui faucibus in ornare quam viverra orci. Sit amet mattis vulputate enim nulla aliquet. Amet justo donec enim diam. Nullam non nisi est sit amet. Amet purus gravida quis blandit turpis cursus. Id interdum velit laoreet id donec ultrices. Faucibus a pellentesque sit amet porttitor eget dolor morbi non. Vel pretium lectus quam id leo in vitae turpis massa. Sit amet luctus venenatis lectus. Ultricies mi quis hendrerit dolor. Purus ut faucibus pulvinar elementum integer enim. Massa tincidunt nunc pulvinar sapien et. In massa tempor nec feugiat nisl pretium fusce.',
  salary: 8000,
  kicker: 'An experience you will never forget',
  startDate: 'December 22nd 2016',
  endDate: 'December 22nd 2017'
};

describe('Jobs', function() {

  describe('Adding', function() {

    afterEach(function() {
      sampleJob = {};
    });

    it('should add correctly when all values are present', async function() {

      let sampleUser = (await users.getAllUsers())[0];

      let sampleJob = jobTemplate;
      sampleJob.schoolId = (await schools.getAllSchools())[0].id;
      sampleJob.cityId = (await cities.getAllCities())[0].id;
      sampleJob.provinceId = (await provinces.getAllProvinces())[0].id;
      sampleJob.companyId = (await companies.getAllCompanies())[0].id;

      let addedJob = await jobs.addJob(sampleUser, sampleJob);
      expect(addedJob.id).to.be.a('string');
    });


    it('should add correctly when all values are present but the school', async function() {

      let sampleUser = (await users.getAllUsers())[0];

      let sampleJob = jobTemplate;
      sampleJob.schoolId = undefined;
      sampleJob.cityId = (await cities.getAllCities())[0];
      sampleJob.provinceId = (await provinces.getAllProvinces())[0];
      sampleJob.companyId = (await companies.getAllCompanies())[0];

      let addedJob = await jobs.addJob(sampleUser, sampleJob);
      expect(addedJob.id, 'Could not add job with undefined value for school').to.be.a('string');

      sampleJob.schoolId = -1;

      let addedJob2 = await jobs.addJob(sampleUser, sampleJob);
      expect(addedJob2.id, 'Could not add job with value of -1 for school').to.be.a('string');

      sampleJob.schoolId = '';

      let addedJob3 = await jobs.addJob(sampleUser, sampleJob);
      expect(addedJob3.id, 'Could not add job with value of -1 for school').to.be.a('string');
    });


    it('should add province and city', async function() {

      let sampleUser = (await users.getAllUsers())[0];

      let sampleJob = jobTemplate;
      sampleJob.schoolId = (await schools.getAllSchools())[0].id;
      sampleJob.cityId = (await cities.getAllCities())[0].id;
      sampleJob.provinceId = (await provinces.getAllProvinces())[0].id;
      sampleJob.companyId = (await companies.getAllCompanies())[0].id;

      let addedJob = await jobs.addJob(sampleUser, sampleJob);
      expect(addedJob.city._bsontype).to.be.equal('ObjectID');
      expect(addedJob.province._bsontype).to.be.equal('ObjectID');
    });

    it('should add correctly when the endDate is not specified', async function() {

      let sampleUser = (await users.getAllUsers())[0];

      let sampleJob = jobTemplate;
      sampleJob.schoolId = (await schools.getAllSchools())[0].id;
      sampleJob.cityId = (await cities.getAllCities())[0].id;
      sampleJob.provinceId = (await provinces.getAllProvinces())[0].id;
      sampleJob.companyId = (await companies.getAllCompanies())[0].id;
      sampleJob.endDate = undefined;

      let addedJob = await jobs.addJob(sampleUser, sampleJob);
      expect(addedJob.id).to.be.a('string');
    });

  });

});
