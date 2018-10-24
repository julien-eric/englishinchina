const _ = require('underscore');
const Job = require('../models/job');
const moment = require('moment');
const provincesController = require('./provincescontroller');
const citiesController = require('./citiescontroller');
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
  let job = await Job.findOne({ _id: id }).populate('school').populate('province').populate('city').exec();
  findPicture(job);
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
  let jobs = await Job.find().sort({dateCreated: 'descending'}).limit(3).populate('school').populate('province').populate('city').exec();
  jobs.forEach((job) => {
    findPicture(job);
  });
  return jobs;
};

JobsController.prototype.addJob = async (user, job) => {

  if (job.schoolId == -1 || job.schoolId == '') {
    job.schoolId = undefined;
  }

  let pictureUrl = job.urlJobOfferPicture;
  let city = await citiesController.getCityByCode(job.cityId);
  let province = await provincesController.getProvinceByCode(job.provinceId);

  return Job.create({
    title: job.title,
    author: user.username,
    email: job.email,
    user,
    school: job.schoolId,
    province,
    city,
    company: job.companyId,
    salary: job.salary,
    startDate: new Date(moment(job.startDate, 'MMMM Do YYYY').format()),
    endDate: job.endDate ? new Date(moment(job.endDate, 'MMMM Do YYYY').format()) : undefined,
    pictureUrl,
    description: job.description,
    kicker: job.kicker
  });
  // return imagesController.addImage({
  //   type: 5,
  //   user: null,
  //   school: null,
  //   description: newJob.title,
  //   url: newJob.pictureUrl,
  //   date: Date.now()
  // });
};

/**
 * @param  {String} queryInfo String to look for in the school's name
 * @param  {String} provinceInfo Look for the school in this province
 * @param  {String} cityInfo Look for the school in this city
 * @param  {Boolean} shortRecords Get a few attributes or the complete object (short->autocomplete, complete->school list)
 * @param  {Object} sorting  Which attributes to sort the list by (rating or name)
 * @param  {Number} limit The number of records to keep from the list
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

JobsController.prototype.getQueryMessage = function(queryInfo) {
  let queryMessage = '';
  let exists = function(value) {
    if (value == MISSING || value == undefined || value == '') {
      return false;
    } else {}
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


let jobsController = new JobsController();
module.exports = jobsController;
