var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    gender: String,
    address: String,
    avatarUrl: String,
    fb: {
        id: String,
        access_token: String,
        firstName: String,
        lastName: String,
        email: String
    },
    twitter: {
        id: String,
        token: String,
        username: String,
        displayName: String,
        lastStatus: String
    }
});