const Job = require('./../models/job');
const moment = require('moment');

let findPicture = function(job) {
  if (!job.pictureUrl) {
    if (job.school) {
      job.pictureUrl = job.school.pictureUrl;
    }
  }
};

module.exports = {

  getJob: async (id) => {
    let job = await Job.findOne({_id: id}).populate('school').exec();
    findPicture(job);
    return job;
  },

  getAllJobs: async () => {
    let jobs = await Job.find().populate('school').exec();
    jobs.forEach((job) => {
      findPicture(job);
    });
    return jobs;
  },

  addJob: (user, job) => {

    if (job.schoolId == -1 || job.schoolId == '') {
      job.schoolId = undefined;
    }

    return Job.create({
      title: job.title,
      author: user.username,
      email: job.email,
      user,
      school: job.schoolId,
      company: job.companyId,
      salary: job.salary,
      startDate: new Date(moment(job.startDate, 'MMMM Do YYYY').format()),
      endDate: new Date(moment(job.endDate, 'MMMM Do YYYY').format()),
      pictureUrl: job.pictureUrl,
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
