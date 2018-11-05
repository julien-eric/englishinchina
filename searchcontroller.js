const _ = require('underscore');
const provincesController = require('./controllers/provincescontroller');
const citiesController = require('./controllers/citiescontroller');
const utils = require('./utils');

let SearchController = function () {

};

/**
 * The string will be split into terms, then each term will be cross-checked with provinces and cities, if a term is found, it will also be returned as
 * to be able to remove it from school terms.
 * @param  {String} searchString The string to be cross-checked in provinces and cities
 * @returns {Object} Location contains province or undefined and city or undefined, positiveTerms contains terms that were found that can be escaped in
 * the query search 
 */
SearchController.prototype.pluckLocationTerms = async function (searchString) {
    let searchTerms = utils.splitWords(searchString);
    let location = { province: undefined, city: undefined };
    let positiveTerms = [];
    // let search = { positiveTerms: [] };

    for (let i = 0; i < searchTerms.length; i++) {

        let foundProvince = await provincesController.getProvinceByName(searchTerms[i]);
        if (foundProvince != null) {
            location.province = foundProvince;
            positiveTerms.push(searchTerms[i]);
        }

        let foundCity = await citiesController.getCityByName(searchTerms[i]);
        if (foundCity != null) {
            location.city = foundCity;
            positiveTerms.push(searchTerms[i]);
        }

    }


    return { location, positiveTerms };
};

let searchController = new SearchController();
module.exports = searchController;
