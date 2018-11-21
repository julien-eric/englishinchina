/**
 * Created by Julz on 1/24/2016.
 */
const Province = require('../models/province');
const School = require('../models/school');
const Job = require('../models/job');
const utils = require('../utils');
const companiesController = require('./companiescontroller');
let _ = require('underscore');


module.exports = {

    getAllProvinces () {
        return Province.find().sort({ name: 1 }).exec();
    },

    getProvinceByCode (code) {
        return Province.findOne({ code }).exec();
    },

    getProvinceById (provinceId) {
        return Province.findOne({ _id: provinceId }).exec();
    },

    getProvinceByCode (code) {
        return Province.findOne({ code }).exec();
    },

    async getProvinceByName (name) {
        return Province.findOne({ name: { $regex: new RegExp('^' + name.toLowerCase(), 'i') } }).exec();
    },

    /**
     *
     * @param {Int} code The code of the province
     * @param {Boolean} random Should it return a random picture or the first one
     * @return {String} Returns a picture url in the form of a string, or undefined
     */
    async getProvincePic (code, random) {
        // At the moment picture is based on school with highest rating
        let provinceId = await Province.findOne({ code }).exec();
        let transactions = await School.aggregate([
            { $group: { _id: '$province', number: { $sum: 1 }, pictureUrl: { $push: '$pictureUrl' } } },
            { $match: { _id: provinceId._id } },
            { $limit: 1 }
        ]).exec();

        let province = await Province.populate(transactions, { path: '_id' });
        if (province.length > 0 && province[0].pictureUrl.length > 0) {

            let index = 0;
            if (random) {
                index = utils.getRandomArbitrary(0, province[0].pictureUrl.length - 1);
            }

            return province[0].pictureUrl[index];

        } else {
            return undefined;
        }
    },

    async queryProvincesByName (name, limit) {
        let provinceResults = await Province.find({ 'name': { '$regex': name, '$options': 'i' } }).exec();
        return { total: provinceResults.length, list: limit ? _.first(provinceResults, limit) : provinceResults };
    },

    getProvinceByChineseName (cityinfo) {
        return Province.findOne({ code: chineseName }).exec();
    },

    async getMostPopularProvinces () {

        // At the moment featured schools are schools with the highest ratings
        let transactions = await School.aggregate([
            { $group: { _id: '$province', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
            { $sort: { number: -1 } },
            { $limit: 9 }
        ]).exec();
        return Province.populate(transactions, { path: '_id' });
    },

    async getMostPopularProvincesbyCompany (companyId) {

        let company = await companiesController.findCompanyById(companyId);

        let transactions = await School.aggregate([
            { $match: { company: company._id } },
            { $group: { _id: '$province', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
            { $sort: { number: -1 } },
            { $limit: 9 }]).exec();

        return Province.populate(transactions, { path: '_id' });
    },

    async getMostPopularProvincesbyJobs () {

        // At the moment featured schools are schools with the highest ratings
        let transactions = await Job.aggregate([
            { $group: { _id: '$province', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
            { $sort: { number: -1 } },
            { $limit: 9 }
        ]).exec();
        return Province.populate(transactions, { path: '_id' });
    }

};
