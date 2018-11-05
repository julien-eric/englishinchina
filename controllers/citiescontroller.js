const provincesController = require('./provincescontroller');
const City = require('../models/city');
const School = require('../models/school');
let _ = require('underscore');

module.exports = {

  async getAllCities () {
    return City.find().populate('province', 'code').exec();
  },

  async getProvinceCitiesByCode (provinceCode) {
    let province = await provincesController.getProvinceByCode(provinceCode);
    return City.find({ province }).sort({ pinyinName: 1 }).exec();
  },

  async getProvinceCitiesById (provinceId) {
    let province = await provincesController.getProvinceById(provinceId);
    return City.find({ province }).sort({ pinyinName: 1 }).exec();
  },

  async getCityByCode (cityCode) {
    return City.findOne({ code: cityCode }).populate('province', 'code').exec();
  },

  async getCityByName (name) {
    return City.findOne({ pinyinName: { $regex: new RegExp('^' + name.toLowerCase(), 'i') } }).populate('province', 'code').exec();
  },

  async queryCityiesByPinyinName (name, limit) {
    let cityResults = await City.find({ 'pinyinName': { '$regex': name, '$options': 'i' } }).populate('province').exec();
    return { total: cityResults.length, list: limit ? _.first(cityResults, limit) : cityResults };
  },

  async getCityPic (code) {
    // At the moment picture is based on school with highest rating
    let cityId = await City.findOne({ code }).exec();
    let transactions = await School.aggregate([
      { $group: { _id: '$city', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
      { $match: { _id: cityId._id } },
      { $limit: 1 }
    ]).exec();

    let city = await City.populate(transactions, { path: '_id' });
    if (city.length > 0) {
      return city[0].pictureUrl;
    } else {
      return undefined;
    }

  },

  async getMostPopularCities (callback) {

    // At the moment featured schools are schools with the highest ratings
    let transactions = await School.aggregate([
      { $group: { _id: '$city', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
      { $sort: { number: -1 } },
      { $limit: 9 }
    ]).exec();

    return City.populate(transactions, { path: '_id' });
  }
};
