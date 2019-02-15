const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teachingDetailsSchema = new Schema({
    fullName: String,
    gender: String,
    eslCertificate: Boolean,
    teachingLicense: Boolean,
    livingCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    citizenship: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    dateOfBirth: Date,
    urlResume: String,
    fileNameResume: String,
    yearsOfExperience: Number
});

const employerDetailsSchema = new Schema({
    name: String,
    description: String
});

module.exports = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    verified: { type: Boolean, default: false },
    teachingDetails: { type: teachingDetailsSchema },
    employerDetails: { type: employerDetailsSchema },

    livingCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    citizenship: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    dateOfBirth: Date,
    firstName: String,
    lastName: String,

    token: String,
    avatarUrl: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    useFacebookPic: Boolean,
    fb: {
        id: String,
        access_token: String
    }
});
