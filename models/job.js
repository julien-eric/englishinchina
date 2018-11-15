const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContractDetails = new Schema({
    salaryLower: { type: Number, required: [true, 'Please specify the lower bracket of salary'] },
    salaryHigher: { type: Number, required: [true, 'Please specify the higher bracket of salary'] },
    startDate: { type: Date, required: [true, 'Please specify the starting date'] },
    duration: { type: Number, required: [true, 'Please specify the length of the contract'] }
});


const TeachingDetails = new Schema({
    institution: { type: String, required: [true, 'Please specify the type of institution'] },
    weeklyLoad: { type: Number, required: [true, 'Please specify the weekly workload'] },
    classSize: { type: Number, required: [true, 'Please specify the class size'] },
    ageGroup: { type: Number, required: [true, 'Please specify the age group'] }
});

const Benefits = new Schema({
    accomodation: { type: Number, required: [true, 'Please specify if the accomodation is provided'] }, // 0 Not provided, 1 provided, 2 partly
    airfare: { type: Number, required: [true, 'Please specify if the airfare is reimbursed'] }, // 0 Not provided, 1 provided, 2 partly
    teachingAssistant: { type: Boolean, required: [true, 'Please specify if there is a teaching assistant'] },
    vacationDays: { type: Number, required: [true, 'Please specify the number of vacation days'] }
});

const validateEmail = function (email) {
    return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
};

const Job = new Schema({
    title: { type: String, required: [true, 'Please enter a job title'] },
    kicker: { type: String, required: [true, 'Please enter a kicker'] },
    pictureUrl: { type: String, required: [true, 'Please upload a picture'] },
    pictureFileName: { type: String, required: [true, 'Please upload a picture'] },
    url: { type: String, required: [true, 'Job URL could not be formed from the title'] },
    email: {
        type: String,
        validate: {
            validator: validateEmail,
            message: '"{VALUE}" is not a valid email address!'
        },
        required: [true, 'Please provide an email address']
    },
    description: { type: String, required: [true, 'Please provide a job description'] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    dateCreated: { type: Date, default: Date.now },
    contractDetails: {
        type: ContractDetails,
        default: () => ({})
    },
    teachingDetails: {
        type: TeachingDetails,
        default: () => ({})
    },
    benefits: {
        type: Benefits,
        default: () => ({})
    }
});

module.exports = mongoose.model('Job', Job);

