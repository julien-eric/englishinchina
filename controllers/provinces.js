/**
 * Created by Julz on 1/24/2016.
 */
const Province = require('../models/province');
const School = require('../models/school');
const companiesController = require('./companies');


module.exports = {

  async initProvinces(provincesList, callback) {
    let count = await Province.count({});
    if (count == 0) {
      return Province.create(provincesList);
    }
  },

  getAllProvinces() {
    return Province.find().sort({name: 1}).exec();
  },

  getProvinceByCode(code) {
    return Province.findOne({code}).exec();
  },

  getProvinceByPinyinName(name) {
    return Province.findOne({name}).exec();
  },

  getProvinceByChineseName(cityinfo) {
    return Province.findOne({code: chineseName}).exec();
  },

  helpInitCities(provinceCode, callback) {
    return Province.findOne({code: provinceCode}).exec();
  },

  async getMostPopularProvinces() {

    // At the moment featured schools are schools with the highest ratings
    let transactions = await School.aggregate([
      {$group: {_id: '$province', number: {$sum: 1}, pictureUrl: {$first: '$pictureUrl'}}},
      {$sort: {number: -1}},
      {$limit: 9}
    ]).exec();
    return Province.populate(transactions, {path: '_id'});
  },

  async getMostPopularProvincesbyCompany(companyId) {

    let company = await companiesController.findCompanyById(companyId);

    let transactions = await School.aggregate([
      {$match: {company: company._id}},
      {$group: {_id: '$province', number: {$sum: 1}, pictureUrl: {$first: '$pictureUrl'}}},
      {$sort: {number: -1}},
      {$limit: 9}]).exec();

    return Province.populate(transactions, {path: '_id'});

  }

};
