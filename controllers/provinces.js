/**
 * Created by Julz on 1/24/2016.
 */
const Province = require('../models/province');
const School = require('../models/school');
const companiesController = require('./companies');
let _ = require('underscore');


module.exports = {

  getAllProvinces() {
    return Province.find().sort({ name: 1 }).exec();
  },

  getProvinceByCode(code) {
    return Province.findOne({ code }).exec();
  },

  getProvinceById(provinceId) {
    return Province.findOne({ _id: provinceId }).exec();
  },

  getProvinceByCode(code) {
    return Province.findOne({ code }).exec();
  },

  async getProvinceByName(name) {
    return Province.findOne({ name: { $regex: new RegExp("^" + name.toLowerCase(), "i") } }).exec();
  },

  /**
   * 
   * @param {Int} code 
   */
  async getProvincePic(code) {
    // At the moment picture is based on school with highest rating
    let provinceId = await Province.findOne({ code }).exec();
    let transactions = await School.aggregate([
      { $group: { _id: '$province', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
      { $match: { _id: provinceId._id } },
      { $limit: 1 }
    ]).exec();

    let province = await Province.populate(transactions, { path: '_id' });
    if (province.length > 0) {
      return province[0].pictureUrl;
    } else {
      return undefined;
    }
  },

  async queryProvincesByName(name, limit) {
    let provinceResults = await Province.find({ 'name': { "$regex": name, "$options": "i" } }).exec();
    return { total: provinceResults.length, list: limit ? _.first(provinceResults, limit) : provinceResults }
  },

  getProvinceByChineseName(cityinfo) {
    return Province.findOne({ code: chineseName }).exec();
  },

  async getMostPopularProvinces() {

    // At the moment featured schools are schools with the highest ratings
    let transactions = await School.aggregate([
      { $group: { _id: '$province', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
      { $sort: { number: -1 } },
      { $limit: 9 }
    ]).exec();
    return Province.populate(transactions, { path: '_id' });
  },

  async getMostPopularProvincesbyCompany(companyId) {

    let company = await companiesController.findCompanyById(companyId);

    let transactions = await School.aggregate([
      { $match: { company: company._id } },
      { $group: { _id: '$province', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
      { $sort: { number: -1 } },
      { $limit: 9 }]).exec();

    return Province.populate(transactions, { path: '_id' });

  }

};
