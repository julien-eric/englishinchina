const mongoose = require('mongoose');

module.exports = mongoose.model('Conversation', {
    _id: { type: String },
    verified: { type: Boolean, default: false }
});
