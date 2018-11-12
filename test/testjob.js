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

// let jobTemplate = {
//     title: 'Great Job Opportunity in Hejiang!',
//     kicker: 'An experience you will never forget',
//     url: 'http://example.com',
//     author: 'Breant32',
//     schoolId: undefined,
//     email: 'secondlanguageworld@gmail.com',
//     pictureUrl: 'Chengdu.jpg',
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Morbi tristique senectus et netus et malesuada fames ac turpis. Fusce id velit ut tortor pretium viverra suspendisse. Cras sed felis eget velit aliquet sagittis id consectetur purus. Aenean euismod elementum nisi quis eleifend. Fermentum dui faucibus in ornare quam viverra orci. Sit amet mattis vulputate enim nulla aliquet. Amet justo donec enim diam. Nullam non nisi est sit amet. Amet purus gravida quis blandit turpis cursus. Id interdum velit laoreet id donec ultrices. Faucibus a pellentesque sit amet porttitor eget dolor morbi non. Vel pretium lectus quam id leo in vitae turpis massa. Sit amet luctus venenatis lectus. Ultricies mi quis hendrerit dolor. Purus ut faucibus pulvinar elementum integer enim. Massa tincidunt nunc pulvinar sapien et. In massa tempor nec feugiat nisl pretium fusce.',
//     salary: 8000,
//     startDate: 'December 22nd 2016',
//     endDate: 'December 22nd 2017'
// };

let jobTemplate = { contractDetails: {}, benefits: {}, teachingDetails: {} };
let sampleJob = {};

jobTemplate.title = 'An incredible Job title';
jobTemplate.kicker = 'Just too good to be true!';
jobTemplate.email = 'julieneric11@gmail.com';
jobTemplate.pictureUrl = 'picture.jpg';
jobTemplate.provinceCode = '30';
jobTemplate.cityCode = '101010100';
jobTemplate.schoolId;
jobTemplate.companyId;
jobTemplate.description = 'Please provide a description for the job. For example this could include things such as the work environment and the responsibilities of teachers in the school, as well as the size of the school and the amenities. Teachers might also be interested in learning a little bit about the city it is located in.';

jobTemplate.duration = 2;
jobTemplate.salaryLower = 7000;
jobTemplate.salaryHigher = 12000;
jobTemplate.startDate = 'December 22nd 2016';

jobTemplate.weeklyLoad = 21;
jobTemplate.institution = 'Public School';
jobTemplate.classSize = 1;
jobTemplate.ageGroup = 1;

jobTemplate.accomodation = 0;
jobTemplate.airfare = 0;
jobTemplate.teachingAssistant = true;
jobTemplate.vacationDays = 21;


describe('Jobs', function () {

    describe('Adding', function () {

        beforeEach(async function () {
            sampleJob = jobTemplate;
            sampleJob.schoolId = (await schools.getAllSchools())[0].id;
            sampleJob.companyId = (await companies.getAllCompanies())[0].id;
        });

        afterEach(function () {
            sampleJob = {};
        });

        it('should add correctly when all values are present', async function () {
            let addedJob;
            let sampleUser = (await users.getAllUsers())[0];

            try {
                addedJob = await jobs.addJob(sampleUser, sampleJob);
            } catch (error) {
                console.log(error.errors);
            }
            expect(addedJob.id).to.be.a('string');
        });

        it('should return an array of errors when validation of certain fields fail', async function () {

            let sampleUser = (await users.getAllUsers())[0];

            sampleJob.email = 'aninvalid email@@shi.y.com';
            sampleJob.accomodation = undefined;
            sampleJob.description = undefined;

            try {
                addedJob = await jobs.addJob(sampleUser, sampleJob);
            } catch (errorInfo) {
                let jobInsertError = errorInfo.error;
                let jobInfo = errorInfo.jobInfo;

                for (let field in jobInsertError.errors) {
                    if (jobInsertError.errors.hasOwnProperty(field)) {
                        console.log(jobInsertError.errors[field].message);
                    }
                }

                expect(error.errors).to.be.an('array');
                expect(error.errors.length).to.be.equal(3);
            }
        });


        // it('should add province and city', async function () {

        //     let sampleUser = (await users.getAllUsers())[0];

        //     let sampleJob = jobTemplate;
        //     sampleJob.schoolId = (await schools.getAllSchools())[0].id;
        //     sampleJob.cityId = (await cities.getAllCities())[0].id;
        //     sampleJob.provinceId = (await provinces.getAllProvinces())[0].id;
        //     sampleJob.companyId = (await companies.getAllCompanies())[0].id;

        //     let addedJob = await jobs.addJob(sampleUser, sampleJob);
        //     expect(addedJob.city._bsontype).to.be.equal('ObjectID');
        //     expect(addedJob.province._bsontype).to.be.equal('ObjectID');
        // });

        // it('should add correctly when the endDate is not specified', async function () {

        //     let sampleUser = (await users.getAllUsers())[0];

        //     let sampleJob = jobTemplate;
        //     sampleJob.schoolId = (await schools.getAllSchools())[0].id;
        //     sampleJob.cityId = (await cities.getAllCities())[0].id;
        //     sampleJob.provinceId = (await provinces.getAllProvinces())[0].id;
        //     sampleJob.companyId = (await companies.getAllCompanies())[0].id;
        //     sampleJob.endDate = undefined;

        //     let addedJob = await jobs.addJob(sampleUser, sampleJob);
        //     expect(addedJob.id).to.be.a('string');
        // });

    });

});
