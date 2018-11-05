const Country = require('../models/country');

module.exports = {

    getCountries() {
        return Country.find().exec();
    },

    getCountryFromCode(code) {
        return Country.findOne({ code }).exec();
    },

};