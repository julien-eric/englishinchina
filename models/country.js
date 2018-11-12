const mongoose = require('mongoose');

module.exports = mongoose.model('Country', {
    code: String,
    name: String
});
