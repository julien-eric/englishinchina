var mongoose = require('mongoose');

module.exports = mongoose.model('School',{
    name: String,
    description: String,
    province: Number,
    pictureUrl: String
});