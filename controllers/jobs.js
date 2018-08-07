const Job = require('./../models/job');
const moment = require('moment');
const provincesController = require('../controllers/provinces');
const citiesController = require('../controllers/cities');

let findPicture = function(job) {
  if (!job.pictureUrl) {
    if (job.school) {
      job.pictureUrl = job.school.pictureUrl;
    }
  }
};

module.exports = {

  getJob: async (id) => {
    let job = await Job.findOne({_id: id}).populate('school').populate('province').populate('city').exec();
    findPicture(job);
    return job;
  },

  getAllJobs: async () => {
    let jobs = await Job.find().populate('school').populate('province').populate('city').exec();
    jobs.forEach((job) => {
      findPicture(job);
    });
    return jobs;
  },

  addJob: async (user, job) => {

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
  }
};
