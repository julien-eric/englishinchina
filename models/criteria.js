const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Criteria = new Schema({
    cri_academicDisciplinarySupport: Number,
    cri_managementAdministration: Number,
    cri_resourcesAvailability: Number,
    cri_accomodationProvided: Number,
    cri_supportOnArrivalandVisa: Number,
    cri_salaryVsCOLiving: Number,
    cri_respectForContract: Number,
    cri_pollution: Number
});

module.exports = mongoose.model('Criteria', Criteria);

