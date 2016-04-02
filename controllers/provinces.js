/**
 * Created by Julz on 1/24/2016.
 */
var Province = require('../models/province');


module.exports = {

    initProvinces : function(provincesList){
        Province.create(provincesList,function(err, result){
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
            }
        });
    },

    getAllProvinces : function(callback){
        Province.find(function(err, provinces){
            if(err){
                console.log(err);
            }
            else{
                callback(provinces);
            }
        });
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

    getProvinceByChineseName : function(cityinfo, chineseName, callback){
        Province.findOne({chineseName:chineseName}).exec(function(err, province){
            if(err){
                console.log(err)
            }
            else{
                callback(cityinfo, province);
            }
        });
    }
}