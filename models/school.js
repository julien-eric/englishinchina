var mongoose = require('mongoose');

module.exports = mongoose.model('School',{
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: String,
    description: String,
    province: {type: mongoose.Schema.Types.ObjectId, ref: 'Province'},
    city: {type: mongoose.Schema.Types.ObjectId, ref: 'City'},
    schoolType: Number,
    pictureUrl: String,
    averageRating: Number
});