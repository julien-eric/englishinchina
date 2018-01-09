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
            city.province = {_id: '56a879c04c7fd9141e6f8f89', code: 13};
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

  getCitiesByProvince(provinceCode, callback) {
    return provincesController.getProvinceByCode(provinceCode).then((province) => {
      return City.find({province}).sort({pinyinName: 1}).exec();
    });
  },

  getAllCities(callback) {
    return City.find().populate('province', 'code').exec();
  },

  getCityByCode(cityCode, callback) {
    return City.findOne({code: cityCode});
  },

  async getMostPopularCities(callback) {

    // At the moment featured schools are schools with the highest ratings
    let transactions = await School.aggregate([
      {$group: {_id: '$city', number: {$sum: 1}, pictureUrl: {$first: '$pictureUrl'}}},
      {$sort: {number: -1}},
      {$limit: 9}
    ]).exec();

    return City.populate(transactions, {path: '_id'});
  }
};
