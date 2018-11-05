const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = mongoose.model('Conversation', {
    _id: { type: String },
    verified: { type: Boolean, default: false }
});
