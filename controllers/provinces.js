/**
 * Created by Julz on 1/24/2016.
 */
const Province = require('../models/province');
const School = require('../models/school');
const companiesController = require('./companies');


module.exports = {

  initProvinces(provincesList, callback) {
    Province.count({}, (err, count) => {
      if (count == 0) {
        Province.create(provincesList, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            callback(result);
          }
        });
      }
    });
  },

  getAllProvinces(callback) {
    Province
      .find()
      .sort({name: 1})
      .exec((err, provinces) => {
        callback(provinces);
      });
  },

  getProvinceByCode(code, callback) {
    Province.findOne({code}).exec((err, province) => {
      callback(err, province);
    });
  },

  getProvinceByPinyinName(name, callback) {
    Province.findOne({name}).exec((err, province) => {
      if (err) {
        console.log(err);
      } else {
        callback(province);
      }
    });
  },

  getProvinceByChineseName(cityinfo, provinceCode, callback) {
    Province.findOne({code: chineseName}).exec((err, province) => {
      if (err) {
        console.log(err);
      } else {
        callback(cityinfo, province);
      }
    });
  },

  helpInitCities(cityinfo, provinceCode, callback) {
    Province.findOne({code: provinceCode}).exec((err, province) => {
      if (err) {
        console.log(err);
      } else {
        callback(cityinfo, province);
      }
    });
  },

  getMostPopularProvinces(callback) {
    // At the moment featured schools are schools with the highest ratings
    School.aggregate([
      {$group: {_id: '$province', number: {$sum: 1}, pictureUrl: {$first: '$pictureUrl'}}},
      {$sort: {number: -1}},
      {$limit: 9}
    ]).exec((err, transactions) => {
      if (err) {
        console.log(err);
        return;
      }
      Province.populate(transactions, {path: '_id'}, (err, popularProvinces) => {
        // Your populated translactions are inside populatedTransactions
        if (err) {
          console.log(err);
        } else {
          callback(popularProvinces);
        }
      });
    });
  },

  getMostPopularProvincesbyCompany(companyId, callback) {
    companiesController.findCompanyById(companyId, (company) => {
      School.aggregate([
        {$match: {company: company._id}},
        {$group: {_id: '$province', number: {$sum: 1}, pictureUrl: {$first: '$pictureUrl'}}},
        {$sort: {number: -1}},
        {$limit: 9}
      ]).exec((err, transactions) => {
        if (err) {
          console.log(err);
          return;
        }
        Province.populate(transactions, {path: '_id'}, (err, popularProvinces) => {
          // Your populated translactions are inside populatedTransactions
          if (err) {
            console.log(err);
          } else {
            callback(popularProvinces);
          }
        });
      });
    });
  }
};
