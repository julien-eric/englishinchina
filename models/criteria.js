var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Criteria = new Schema({
    cri_academicDisciplinarySupport: Number,
    cri_managementAdministration: Number,
    cri_resourcesAvailability: Number,
    cri_accomodationProvided: Number,
    cri_supportOnArrivalandVisa : Number,
    cri_salaryVsCOLiving: Number,
    cri_respectForContract: Number,
    cri_pollution: Number
})

module.exports = mongoose.model('Review',Review);

