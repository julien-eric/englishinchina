/**
 * Created by Julz on 1/24/2016.
 */
var Province = require('../models/province');
var School = require('../models/school');


module.exports = {

    initProvinces : function(provincesList, callback){
        Province.count({},function(err,count){
            if(count == 0){
                Province.create(provincesList,function(err, result){
                    if(err){
                        console.log(err);
                    }
                    else{
                        callback(result);
                    }
                });
            }
        });
    },

    getAllProvinces : function(callback) {
        Province.
            find().
            sort({"name": 1}).
            exec(function (err, provinces) {
                    callback(provinces);
            })
    },

    getProvinceByCode : function(code, callback){
        Province.findOne({code:code}).exec(function(err, province){
            if(err){
                console.log(err)
            }
            else{
                callback(province);
            }
        });
    },

    getProvinceByPinyinName : function(name, callback){
        Province.findOne({name:name}).exec(function(err, province){
            if(err){
                console.log(err)
            }
            else{
                callback(province);
            }
        });
    },

    getProvinceByChineseName : function(cityinfo, provinceCode, callback){
        Province.findOne({code:chineseName}).exec(function(err, province){
            if(err){
                console.log(err)
            }
            else{
                callback(cityinfo, province);
            }
        });
    },

    helpInitCities : function(cityinfo, provinceCode, callback){
        Province.findOne({code:provinceCode}).exec(function(err, province){
            if(err){
                console.log(err)
            }
            else{
                callback(cityinfo, province);
            }
        });
    },

    getMostPopularProvinces: function(callback){
        //At the moment featured schools are schools with the highest ratings
        School.aggregate(
            [
                { $group : { _id : "$province" , number : { $sum : 1 }, pictureUrl: { $first: "$pictureUrl" } } },
                { $sort : {number : -1}},
                { $limit : 9 }
            ]).exec(function(err, transactions) {
                if(err)
                {
                    console.log(err);
                    return;
                }
                Province.populate(transactions, {path: '_id'}, function(err, popularProvinces) {
                    // Your populated translactions are inside populatedTransactions
                    if(err){
                        console.log(err);
                    }
                    else{
                        callback(popularProvinces);
                    }
                });
            });
    }
}