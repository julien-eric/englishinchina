var mongoose = require('mongoose');

//TYPE:
//1)school
//2 user

module.exports = mongoose.model('Image',{
    type: Number,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    school: {type: mongoose.Schema.Types.ObjectId, ref: 'School'},
    description: String,
    url: String,
    date: Date
});