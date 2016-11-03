var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schools = require('../controllers/schools');

var helpful = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    dateCreated: {type: Date, default: Date.now}
});

var Review = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    objectType: Number, /*School:0*/
    foreignId: {type: mongoose.Schema.Types.ObjectId, ref: 'School'},
    comment: String,
    anonymous: Boolean,
    position: Number, /*FT 1, TA 2, HT3*/
    dateEmployed: Date,
    dateReleased: Date,
    dateCreated: {type: Date, default: Date.now},
    helpfuls: [helpful],
    criteria : {
        c1:Number,
        c2:Number,
        c3:Number,
        c4:Number,
        c5:Number,
        c6:Number,
        c7:Number,
        c8:Number },
    average_rating: Number
})

Review.post('save', function(document){
    console.log("Inserted review : %s : (%s)", document._id, document.comment);
    var schools = require('../controllers/schools');
    schools.updateAverageRating(document.foreignId);
})

Review.post('remove', function(document){
    console.log("Removed review : %s : (%s)", document._id, document.comment);
    var schools = require('../controllers/schools');
    schools.updateAverageRating(document.foreignId);
})

module.exports = mongoose.model('Review',Review);

