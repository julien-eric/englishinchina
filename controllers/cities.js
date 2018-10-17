const provincesController = require('./provinces');
const City = require('../models/city');
const School = require('../models/school');

module.exports = {

  citiesToPush: [],

  initCities(citieslist, callback) {
    console.log('BEGINNING INITCITIES');
    City.count({}, (err, count) => {
      if (count === 0) {
        let city;
        for (const i in citieslist) {
          city = citieslist[i];
          if (city.province === '' || city.province === null) {
            city.province = { _id: '56a879c04c7fd9141e6f8f89', code: 13 };
          }
          provincesController.helpInitCities(city.province.code, (cityinfo, province) => {
            module.exports.citiesToPush.push({
              province,
              pinyinName: cityinfo.pinyinName,
              chineseName: cityinfo.chineseName,
              code: cityinfo.code,
              x: cityinfo.x,
              y: cityinfo.y
            });
          });
        }
      }
    });
    callback();
  },

  pushCities(citiesList, callback) {
    City.create(citiesList, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Pushing cities : ${result}`);
        callback(result);
      }
    });
  },

  async getProvinceCitiesByCode(provinceCode) {
    let province = await provincesController.getProvinceByCode(provinceCode);
    return City.find({ province }).sort({ pinyinName: 1 }).exec();
  },

  async getProvinceCitiesById(provinceId) {
    let province = await provincesController.getProvinceById(provinceId);
    return City.find({ province }).sort({ pinyinName: 1 }).exec();
  },

  async getAllCities() {
    return City.find().populate('province', 'code').exec();
  },

  async getCityByCode(cityCode) {
    return City.findOne({ code: cityCode }).populate('province', 'code').exec();
  },

  async getCityByPinyinName(name) {
    return City.find(
      { 'pinyinName': { "$regex": name, "$options": "i" } },
      function (err, docs) {}
    ).populate('province').exec();
  },


  async getCityPic(code) {
    // At the moment picture is based on school with highest rating
    let cityId = await City.findOne({ code }).exec();
    let transactions = await School.aggregate([
      { $group: { _id: '$city', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
      { $match: { _id: cityId._id } },
      { $limit: 1 }
    ]).exec();
    
    let city = await City.populate(transactions, { path: '_id' });
    if(city.length > 0 ) {
      return city[0].pictureUrl;
    } else {
      return undefined;
    }

  },

  async getMostPopularCities(callback) {

    // At the moment featured schools are schools with the highest ratings
    let transactions = await School.aggregate([
      { $group: { _id: '$city', number: { $sum: 1 }, pictureUrl: { $first: '$pictureUrl' } } },
      { $sort: { number: -1 } },
      { $limit: 9 }
    ]).exec();

    return City.populate(transactions, { path: '_id' });
  }
};
