var mongoose = require('mongoose');

module.exports = mongoose.model('Comment',{
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    objectType: Number, /*School:0*/
    foreignId: {type: mongoose.Schema.Types.ObjectId, ref: 'School'},
    comment: String,
    dateCreated: {type: Date, default: Date.now}
});