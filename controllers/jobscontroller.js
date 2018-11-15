const _ = require('underscore');
const Job = require('../models/job');
const moment = require('moment');
const provincesController = require('./provincescontroller');
const citiesController = require('./citiescontroller');
const imagesController = require('./imagescontroller');
const utils = require('../utils');
const MISSING = -1;

let findPicture = function (job) {
    if (!job.pictureUrl) {
        if (job.school) {
            job.pictureUrl = job.school.pictureUrl;
        }
    }
};

let JobsController = function () { };

JobsController.prototype.getJob = async (id) => {
    let job = await Job.findOne({ _id: id }).populate('user').populate('school').populate('province').populate('city').exec();
    findPicture(job);
    return job;
};

JobsController.prototype.getJobByTitle = async (title) => {
    let titleUrl = utils.generateUrl(title);
    let job = await Job.findOne({ url: titleUrl }).populate('user').populate('school').populate('province').populate('city').exec();
    if (job) {
        findPicture(job);
    }
    return job;
};

JobsController.prototype.getAllJobs = async () => {
    let jobs = await Job.find().populate('school').populate('province').populate('city').exec();
    jobs.forEach((job) => {
        findPicture(job);
    });
    return jobs;
};

JobsController.prototype.getFeaturedJobs = async () => {
    let jobs = await Job.find().sort({ dateCreated: 'descending' }).limit(3).populate('school').populate('province').populate('city').exec();
    jobs.forEach((job) => {
        findPicture(job);
    });
    return jobs;
};

JobsController.prototype.addJob = async (user, jobParams) => {
    let jobInfo;
    try {

        let city = await citiesController.getCityByCode(jobParams.cityCode);
        let province = await provincesController.getProvinceByCode(jobParams.provinceCode);
        if (jobParams.pictureUrlPrevious && !jobParams.pictureUrl) {
            jobParams.pictureUrl = jobParams.pictureUrlPrevious;
            jobParams.pictureFileName = jobParams.pictureFileNamePrevious;
        }

        jobInfo = {
            title: jobParams.title,
            kicker: jobParams.kicker,
            pictureUrl: jobParams.pictureUrl,
            pictureFileName: jobParams.pictureFileName,
            url: utils.generateUrl(jobParams.title),
            email: jobParams.email,
            description: jobParams.description,
            user,
            school: jobParams.schoolId,
            province,
            provinceCode: province.code,
            city,
            cityCode: city.code,
            company: jobParams.companyId,
            contractDetails: {
                salaryLower: jobParams.salaryLower,
                salaryHigher: jobParams.salaryHigher,
                startDate: new Date(moment(jobParams.startDate, 'MMMM Do YYYY').format()),
                duration: jobParams.duration
            },
            teachingDetails: {
                institution: jobParams.institution,
                weeklyLoad: jobParams.weeklyLoad,
                classSize: jobParams.classSize,
                ageGroup: jobParams.ageGroup
            },
            benefits: {
                accomodation: jobParams.accomodation,
                airfare: jobParams.airfare,
                teachingAssistant: jobParams.teachingAssistant,
                vacationDays: jobParams.vacationDays
            }
        };

        let savedJob = await Job.create(jobInfo);

        await imagesController.addImage({
            type: 5,
            user: null,
            school: null,
            description: savedJob.title,
            url: savedJob.pictureUrl,
            date: Date.now()
        });

        return Promise.resolve(savedJob);

    } catch (error) {
        return Promise.reject({ error: error, jobInfo: jobInfo });
    }
};

/**
 * @param  {String} jobInfo String to look for in the school's name
 * @param  {String} provinceInfo Look for the school in this province
 * @param  {String} cityInfo Look for the school in this city
 * @param  {Object} sorting  Which attributes to sort the list by (rating or name)
 * @param  {Number} limit The number of records to keep from the list
 * @param  {Boolean} shortRecords Get a few attributes or the complete object (short->autocomplete, complete->school list)
 * @return {Object} an object containing a list of jobs, the query as well as the query information for this search
 */
JobsController.prototype.searchJobs = async function (jobInfo, provinceInfo, cityInfo, sorting, limit, shortRecords) {

    let queryInfo = {};
    let jobList = undefined;
    let regex = undefined;

    queryInfo.job = jobInfo;

    if (queryInfo.job) {
        regex = new RegExp(utils.returnRegex(queryInfo.job));
    } else {
        regex = new RegExp('');
    }

    let transactions = Job.aggregate([
        { $match: { title: { $regex: regex, $options: 'i' } } },
        { $sort: { number: -1 } }
    ]);

    if (provinceInfo != MISSING) {
        province = await provincesController.getProvinceByCode(provinceInfo);
        queryInfo.province = province.name;
        transactions._pipeline.push({ $match: { province: province._id } });
    }

    if (cityInfo != MISSING) {
        city = await citiesController.getCityByCode(cityInfo);
        queryInfo.city = city.pinyinName;
        transactions._pipeline.push({ $match: { city: city._id } });
    }

    transactions._pipeline = transactions._pipeline.concat([
        { $lookup: { from: 'provinces', localField: 'province', foreignField: '_id', as: 'province' } },
        { $unwind: '$province' },
        { $lookup: { from: 'cities', localField: 'city', foreignField: '_id', as: 'city' } },
        { $unwind: '$city' }
    ]);

    try {
        jobList = await transactions.exec();
        total = jobList.length;
        jobList = _.first(jobList, limit || 9999);
    } catch (error) {
        console.log(error);
    }
    let searchQuery = this.getQueryMessage(queryInfo);
    return { list: jobList, total, query: searchQuery, searchInfo: { province: provinceInfo, city: cityInfo, jobInfo: jobInfo } };
};

JobsController.prototype.getQueryMessage = function (queryInfo) {
    let queryMessage = '';
    let exists = function (value) {
        if (value == MISSING || value == undefined || value == '') {
            return false;
        } else { }
        return true;
    };

    // Verify if we have any job info
    if (exists(queryInfo.job)) {
        queryMessage += queryInfo.job;
        if (exists(queryInfo.province) || exists(queryInfo.city)) {
            queryMessage += ' in ';
        }
    }

    // Add information for province and city
    if (exists(queryInfo.province)) {
        queryMessage += queryInfo.province;
        if (exists(queryInfo.city)) {
            queryMessage += ', ' + queryInfo.city;
        }
    } else {
        if (exists(queryInfo.city)) {
            queryMessage += queryInfo.city;
        }
    }

    return queryMessage;
};

JobsController.prototype.fillInValues = function (job) {

    let jobInfo = job.toObject();

    const jobParser = { teachingDetails: {}, benefits: {} };
    jobParser.teachingDetails.classSize = ['0-10', '11-20', '21-30', '30+'];
    jobParser.teachingDetails.ageGroup = ['Children', 'Teenagers', 'University', 'Adults'];
    jobParser.benefits.accomodation = ['Not Provided', 'Provided', 'Partly Provided'];
    jobParser.benefits.airfare = ['Paid', 'Not Paid', 'Inbound Flight Only', 'Partly Provided'];
    jobParser.benefits.teachingAssistant = function (assistant) {
        if (assistant) { return 'Yes'; }
        else { return 'No'; }
    };

    jobInfo.teachingDetails.classSize = jobParser.teachingDetails.classSize[job.teachingDetails.classSize];
    jobInfo.teachingDetails.ageGroup = jobParser.teachingDetails.ageGroup[job.teachingDetails.ageGroup];
    jobInfo.benefits.accomodation = jobParser.benefits.accomodation[job.benefits.accomodation];
    jobInfo.benefits.airfare = jobParser.benefits.airfare[job.benefits.airfare];
    jobInfo.benefits.teachingAssistant = jobParser.benefits.teachingAssistant(job.benefits.teachingAssistant);

    return jobInfo;
};

let jobsController = new JobsController();
module.exports = jobsController;
