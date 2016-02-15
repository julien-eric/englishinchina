var provincesController = require('./provinces');
var City = require('../models/city');

module.exports = {

    citiesToPush : new Array(),

    initCities : function(citieslist){
        var ncity;
        for(var city in citieslist){
            ncity = citieslist[city];
            if(ncity.province == "")
                ncity.province = ncity.cnName;
            provincesController.provinceByChineseName(ncity, ncity.province, function(cityinfo, province){
                module.exports.citiesToPush.push({province:province, pinyinName: cityinfo.pyName, chineseName: cityinfo.cnName, code: cityinfo.code, x:cityinfo.x, y:cityinfo.y});
                var a = 2;
            });
        }
    },

    pushCities: function(citiesList){
        City.create(citiesList, function(err,result){
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
            }
        });
    },

    getCitiesByProvince: function(provinceCode,callback){
        provincesController.provinceByCode(provinceCode, function(province){
            City.find({province:province},function(err, result){
                if(err){
                    console.log(err);
                }
                else{
                    callback(result);
                }
            });
        });
    },

    fetchCities: function(callback){
        City.find(function(err, result){
            if(err){
                console.log(err);
            }
            else{
                callback(result);
            }
        });
    },

    cityByCode: function(cityCode, callback){
        City.findOne({code:cityCode},function(err, result){
            if(err){
                console.log(err);
            }
            else{
                callback(result);
            }
        });
    }

}