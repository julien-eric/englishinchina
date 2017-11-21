const mongoose = require('mongoose');

module.exports = mongoose.model('Article', {
  title: String,
  url: String,
  author: String,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  dateCreated: {type: Date, default: Date.now},
  pictureUrl: String,
  content: String,
  kicker: String,
});
