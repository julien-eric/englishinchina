var mongoose = require('mongoose');

//TYPE:
//1)school
//2 user
//3 company

module.exports = mongoose.model('Image',{
    type: Number,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    school: {type: mongoose.Schema.Types.ObjectId, ref: 'School'},
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    description: String,
    url: String,
    date: Date
});