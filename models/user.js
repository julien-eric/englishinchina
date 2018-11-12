const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teachingDetailsSchema = new Schema({
    eslCertificate: Boolean,
    teachingLicense: Boolean,
    yearsOfExperience: Number,
    urlResume: String,
    fileNameResume: String
});

module.exports = mongoose.model('User', {
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    teachingDetails: {
        type: teachingDetailsSchema,
        default: () => ({})
    },
    livingCountry: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    citizenship: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    anonymous: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    token: String,
    gender: String,
    avatarUrl: String,
    admin: Boolean,
    dateOfBirth: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    useFacebookPic: Boolean,
    fb: {
        id: String,
        access_token: String
    },
    twitter: {
        id: String,
        token: String,
        username: String,
        displayName: String,
        lastStatus: String
    }
});
