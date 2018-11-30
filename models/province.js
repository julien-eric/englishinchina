const mongoose = require('mongoose');

module.exports = mongoose.model('Province', {
    name: String,
    chineseName: String,
    typeOfRegion: Number,
    code: Number
});
