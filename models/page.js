const mongoose = require('mongoose');

module.exports = mongoose.model('Page', {
    url: String,
    succeeded: { type: Boolean, default: false }
});
