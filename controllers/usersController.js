/**
 * Created by Julz on 11/20/2015.
 */
const User = require('../models/user');

module.exports = {

    getAllUsers () {
        return User.find().exec();
    },

    findUserById (id) {
        return User.findOne({ _id: id }).populate('livingCountry').populate('citizenship').exec();
    },

    findUserByEmail (email) {
        return User.findOne({ email }).exec();
    },

    findUserByToken (token, expiryDate) {
        return User.findOne({ resetPasswordToken: token, resetPasswordExpires: expiryDate }).exec();
    },

    updateUser (userId, userFields) {
        return User.findOneAndUpdate({ _id: userId }, userFields).exec();
    }
};

