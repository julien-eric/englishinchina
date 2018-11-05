const mongoose = require('mongoose');

module.exports = mongoose.model('Job', {
  title: String,
  url: String,
  author: String,
  email: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  school: {type: mongoose.Schema.Types.ObjectId, ref: 'School'},
  company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
  province: {type: mongoose.Schema.Types.ObjectId, ref: 'Province'},
  city: {type: mongoose.Schema.Types.ObjectId, ref: 'City'},
  dateCreated: {type: Date, default: Date.now},
  pictureUrl: {type: String},
  description: String,
  salaryLower: Number,
  salaryHigher: Number,
  kicker: String,
  startDate: Date,
  endDate: Date
});
