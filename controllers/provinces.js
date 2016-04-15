/**
 * Created by Julz on 1/24/2016.
 */
var Province = require('../models/province');


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
                if (err) {
                    console.log(err);
                }
                else {
                    callback(provinces);
                }
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
    }
}