const mongoose = require('mongoose');

module.exports = mongoose.model('Message', {
  conversation: {type: mongoose.Schema.Types.ObjectId, ref: 'Conversation'},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  content: String,
  dateCreated: {type: Date, default: Date.now},
});