var mongoose = require('mongoose');

module.exports = mongoose.model('Review',{
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    objectType: Number, /*School:0*/
    foreignId: {type: mongoose.Schema.Types.ObjectId, ref: 'School'},
    comment: String,
    dateCreated: {type: Date, default: Date.now},
    cri_academicDisciplinarySupport: Number,
    cri_managementAdministration: Number,
    cri_resourcesAvailability: Number,
    cri_accomodationProvided: Number,
    cri_supportOnArrivalandVisa : Number,
    cri_salaryVsCOLiving: Number,
    cri_respectForContract: Number,
    cri_pollution: Number,
    average_rating: Number
});