var School = require('./../models/school');
var provincesController = require('./provinces');
var reviews = require('./reviews');
var Review = require('./../models/review');
var citiesController = require('./cities');
var imagesController = require('./images');
var jadeutilityfunctions = require('./../routes/jadeutilityfunctions');
var async = require('async');

module.exports = {

    getAllSchools: function(callback){
        School.find().exec(function(err,schoolList){
            if(err){console.log(err);}
            else{callback(schoolList);}
        });
    },

    featuredSchools: function(callback){
        //At the moment featured schools are schools with the highest ratings
        School.find()
            .sort({"averageRating": -1})
            .where({"validated":true})
            .limit(3)
            .exec(function(err,schoolList){callback(err, schoolList)});
    },

    getSchools : function(callback, pageSize, page){
        getSchools(callback,pageSize,page,null);
    },

    getSchools : function(callback, pageSize, page, admin){
        var adminInfo = {"validated":true};
        if(admin == true){
            adminInfo = {}
        }
        School.count()
            .where({"validated":true})
            .exec(function(err,count) {
                School.find()
                    .populate("province")
                    .populate("city")
                    .where(adminInfo)
                    .limit(pageSize)
                    .skip(pageSize * page)
                    .exec(function (err, schools) {
                        callback(count, schools);
                    })
            })
    },

    addSchool : function (user, school, callback) {

        async.waterfall([

                function getProvince(next){
                    provincesController.getProvinceByCode(school.province, function(err, province){
                        if(!err){
                            next(null, province);
                        }
                    });
                },
                function getCity(province,next){
                    citiesController.getCityByCode(school.city, function(city){
                        next(null, province,city);
                    });
                },
                function createSchool(province, city, next){
                    School.create({ user: user._id, name:school.name, description:school.description, website: school.website, schoolType: school.schoolType, province:province, city:city, pictureUrl: school.avatarUrl, averageRating:-1 }, function (err, newSchool){
                        next(err, province, city, newSchool);
                    });
                },
                function createPicture(province, city, createdSchool, next){
                    imagesController.addImage({
                            type: 1,
                            user: null,
                            school: createdSchool,
                            description: createdSchool.name,
                            url: createdSchool.pictureUrl,
                            date: Date.now()
                        },
                        function(err, image){
                            if(!err){
                                var xschool = createdSchool.toObject()
                                xschool.photos.push(image);
                                School.findOneAndUpdate({_id : xschool._id}, xschool, callback);
                            }
                            else{
                                callback(err, createdSchool);
                            }
                            //next(err, province, city, image);
                    });
                }
            ],
            function(err,callback){
                if(err){
                    console.log(err);
                    //res.redirect('/');
                }
            }
        )
    },

    deleteSchool: function (id, callback) {
        School.find({_id : id}).remove(callback);
    },

    editSchool : function (school, callback) {

        async.waterfall([

                function getProvince(next){
                    provincesController.getProvinceByCode(school.province, function(province){
                        next(null, province);
                    });
                },
                function getCity(province,next){
                    citiesController.getCityByCode(school.city, function(city){
                        next(null, province,city);
                    });
                },
                function getOldSchool(province, city, next){
                    module.exports.findSchoolById(school.id, function(oldSchool){
                        next(null, oldSchool, province, city);
                    })
                },
                function updateSchool(oldSchool, province, city, next){
                    var newPicture = false;
                    var newSchool = {province:province._id, city:city._id};
                    if(oldSchool.name !== school.name){newSchool.name = school.name}
                    if(oldSchool.description !== school.description){newSchool.description = school.description}
                    if(oldSchool.website !== school.website){newSchool.website = school.website}
                    if(oldSchool.schoolType !== school.schoolType){newSchool.schoolType = school.schoolType}
                    if(oldSchool.pictureUrl !== school.avatarUrl){
                        newSchool.pictureUrl = school.avatarUrl
                        newPicture = true;
                    }

                    School.findOneAndUpdate({ _id : school.id }, newSchool, function(err, editedSchool){
                        if(err){
                            console.log(err)
                        }
                        else{
                            if(newPicture){
                                next(null,editedSchool);
                            }
                            else{
                                callback(err, editedSchool);
                            }
                        }
                    });
                },
                function createPicture(editedSchool, next){
                    imagesController.addImage({
                            type: 1,
                            user: null,
                            school: editedSchool,
                            description: editedSchool.name,
                            url: editedSchool.pictureUrl,
                            date: Date.now()
                        },
                        function(err, image){
                            if(!err){
                                var xschool = editedSchool.toObject()
                                xschool.photos.push(image);
                                School.findOneAndUpdate({_id : xschool._id}, xschool, callback);
                            }
                            else{
                                callback(err, editedSchool);
                            }
                        });
                }

            ],
            function(err,callback){
                if(err){
                    console.log(err);
                    //res.redirect('/');
                }
            }
        )
    },

    updatePictures: function (school, callback) {
        School.findOneAndUpdate({ _id : school._id }, { photos:school.photos}, function(err, editedSchool){
            callback(err, editedSchool);
        });
    },

    validateSchool : function (id, callback, validate) {
        var valida = true;
        if(typeof(validate) === "boolean"){
            valida = validate;
        }
        School.findOneAndUpdate({ _id : id }, { validated: valida }, function(err, validatedSchool){
            callback(err, validatedSchool);
        });
    },

    findSchoolByName : function(name, callback){
        School.findOne({name:name}).exec(function(err,school){
            callback(school);
        });
    },

    findSchoolById : function(id, callback){
        School.findOne({_id:id}).populate("province").populate("city").populate("photos").exec(function(err,school){
            callback(school);
        });
    },

    findSchoolsByProvince : function(province, callback){
        School.find({province:province}).exec(function(err,school){
            callback(school);
        });
    },

    searchSchools : function(schoolInfo, prov, city, callback){

        var searchQueryMessage = "";

        if(prov != -1){ //Province is specified
            provincesController.getProvinceByCode(prov, function(err,provModel){
                if(!err){
                    if(schoolInfo != ""){
                        searchQueryMessage += '"' + schoolInfo + '" in ' ;
                    }
                    searchQueryMessage += provModel.name + "(" + provModel.chineseName + ")";

                    if(city != -1){ //City is also specified
                        citiesController.getCityByCode(city,function(cityModel){
                            searchQueryMessage += ", " + jadeutilityfunctions.capitalize(cityModel.pinyinName) + "(" + cityModel.chineseName + ")";
                            School.
                                find({name: new RegExp(schoolInfo, "i")}).
                                populate("province").
                                populate("city").
                                where('province').equals(provModel).
                                where('city').equals(cityModel).
                                limit(10).
                                exec(function(err,schoolList){callback(schoolList, searchQueryMessage)});
                        });
                    }
                    else{
                        School.
                            find({name: new RegExp(schoolInfo, "i")}).
                            populate("province").
                            populate("city").
                            where('province').equals(provModel).
                            exec(function(err,schoolList){callback(schoolList, searchQueryMessage)});
                    }
                }
                else{
                    School. //Province and City is not specified
                        find({name: new RegExp(schoolInfo,"i")}).
                        populate("province").
                        populate("city").
                        limit(10).
                        exec(function(err,schoolList){callback(schoolList, searchQueryMessage)});
                }
            });
        }
        else if(city != -1){
            citiesController.getCityByCode(city,function(cityModel){
                if(schoolInfo != ""){
                    searchQueryMessage += '"' + schoolInfo + '" in ' ;
                }
                searchQueryMessage += jadeutilityfunctions.capitalize(cityModel.pinyinName) + "(" + cityModel.chineseName + ")";
                School. //Province is not specified
                    find({name: new RegExp(schoolInfo,"i")}).
                    populate("province").
                    populate("city").
                    where('city').equals(cityModel).
                    limit(10).
                    exec(function(err,schoolList){callback(schoolList, searchQueryMessage)});
            });

        }
        else{
            School. //Province and City is not specified
                find({name: new RegExp(schoolInfo,"i")}).
                populate("province").
                populate("city").
                limit(10).
                exec(function(err,schoolList){callback(schoolList, searchQueryMessage)});
        }
    },

    emptySchoolCollection : function(){
        School.remove({}, function(err) {
            console.log('collection removed')
        });
    },

    updateCoverPicture : function(schoolId, newPictureUrl, callback){
        School.findOneAndUpdate({ _id : schoolId }, {pictureUrl:newPictureUrl}, function(err, editedSchool){
            if(err){
                console.log(err);
            }
            callback(editedSchool);
        });
    },

    updateAverageRating : function(schoolId){
        reviews.findReviews(schoolId, function(reviews){
            var averageScore = 0;
            var criteria = {c1:0,c2:0,c3:0,c4:0,c5:0,c6:0,c7:0,c8:0};
            for(var review in reviews){
                averageScore += reviews[review].average_rating;
                criteria.c1 += reviews[review].criteria.c1;
                criteria.c2 += reviews[review].criteria.c2;
                criteria.c3 += reviews[review].criteria.c3;
                criteria.c4 += reviews[review].criteria.c4;
                criteria.c5 += reviews[review].criteria.c5;
                criteria.c6 += reviews[review].criteria.c6;
                criteria.c7 += reviews[review].criteria.c7;
                criteria.c8 += reviews[review].criteria.c8;
            }
            averageScore = averageScore/reviews.length;
            criteria.c1 = criteria.c1/reviews.length;
            criteria.c2 = criteria.c2/reviews.length;
            criteria.c3 = criteria.c3/reviews.length;
            criteria.c4 = criteria.c4/reviews.length;
            criteria.c5 = criteria.c5/reviews.length;
            criteria.c6 = criteria.c6/reviews.length;
            criteria.c7 = criteria.c7/reviews.length;
            criteria.c8 = criteria.c8/reviews.length;

            School.findOneAndUpdate({ _id : schoolId }, {averageRating:averageScore, criteria:criteria}, function(err, editedSchool){
                if(err){
                    console.log(err);
                }
            });
        });
    }
}