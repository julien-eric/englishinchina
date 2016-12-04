var provincesController = require('./provinces');
var City = require('../models/city');
var School = require('../models/school');

module.exports = {

    citiesToPush : new Array(),

    initCities : function(citieslist, callback){
        console.log("BEGINNING INITCITIES")
        City.count({},function(err,count){
            if(count == 0){
                var city;
                for(var i in citieslist){
                    city = citieslist[i];
                    if(city.province == "" || city.province == null)
                        city.province = {"_id": "56a879c04c7fd9141e6f8f89", "code": 13};
                    provincesController.helpInitCities(city, city.province.code, function(cityinfo, province){
                        module.exports.citiesToPush.push({province:province, pinyinName: cityinfo.pinyinName, chineseName: cityinfo.chineseName, code: cityinfo.code, x:cityinfo.x, y:cityinfo.y});
                        var a = 2;
                    });
                }
            }
        });
        callback();

    },

    pushCities: function(citiesList,callback){
        City.create(citiesList, function(err,result){
            if(err){
                console.log(err);
            }
            else{
                console.log("Pushing cities : " + result);
                callback(result);
            }
        });
    },

    getCitiesByProvince: function(provinceCode,callback){
        provincesController.getProvinceByCode(provinceCode, function(err, province){
            if(!err){
                City
                    .find({province:province})
                    .sort({"pinyinName" : 1})
                    .exec(
                    function(err, result){
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

    getAllCities: function(callback){
        City.find(function(err, result){
            if(err){
                console.log(err);
            }
            else{
                callback(result);
            }
        }).populate("province", "code");
    },

    getCityByCode: function(cityCode, callback){
        City.findOne({code:cityCode},function(err, result){
            if(err){
                console.log(err);
            }
            else{
                callback(result);
            }
        });
    },

    getMostPopularCities: function(callback){
        //At the moment featured schools are schools with the highest ratings
        School.aggregate(
            [
                { $group : { _id : "$city" , number : { $sum : 1 }, pictureUrl: { $first: "$pictureUrl" } } },
                { $sort : {number : -1}},
                { $limit : 9 }
            ]).exec(function(err, transactions) {
                if(err)
                {
                    console.log(err);
                    return;
                }
                City.populate(transactions, {path: '_id'}, function(err, popularCities) {
                    // Your populated translactions are inside populatedTransactions
                    if(err){
                        console.log(err);
                    }
                    else{
                        callback(popularCities);
                    }
                });
            });
    }
}