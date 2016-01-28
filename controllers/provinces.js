/**
 * Created by Julz on 1/24/2016.
 */
var Province = require('../models/province');


module.exports = {

    initProvinces : function(provincesList){
        /*BatchInsert*/
        Province.create(provincesList,function(err, result){
            if(err){
                console.log(err);
            }
            else{
                console.log("SUCCESS");
                console.log(result);
            }
        });
    },

    fetchProvinces : function(callback){
        /*BatchInsert*/
        Province.find(function(err, result){
            if(err){
                console.log(err);
            }
            else{
                callback(result);
            }
        });
    },

    provinceByCode : function(code, callback){
        Province.findOne({code:code}).exec(function(err, province){
            if(err){
                console.log(err)
            }
            else{
                callback(province);
            }
        });
    },

    provinceByPinyinName : function(name, callback){
        Province.findOne({name:name}).exec(function(err, province){
            if(err){
                console.log(err)
            }
            else{
                callback(province);
            }
        });
    },

    provinceByChineseName : function(cityinfo, chineseName, callback){
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