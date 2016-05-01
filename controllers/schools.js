var School = require('./../models/school');
var provincesController = require('./provinces');
var reviews = require('./reviews');
var citiesController = require('./cities');
var imagesController = require('./images');
var async = require('async');

module.exports = {

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

    addSchool : function (school, callback) {

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
                function createSchool(province, city, next){
                    School.create({ user: school._id, name:school.name, description:school.description, schoolType: school.schoolType, province:province, city:city, pictureUrl: school.avatarUrl, averageRating:-1 }, function (err, newSchool){
                        next(err, province, city, newSchool);
                    });
                },
                function createPicture(province, city, createdSchool, next){
                    imagesController.addImage({
                            type: 1,
                            user: null,
                            school: createdSchool,
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
        School.findOneAndUpdate({ _id : school.id }, { name:school.name, description:school.description, province:school.province, photos:school.photos, pictureUrl: school.pictureUrl }, function(err, editedSchool){
            callback(err, editedSchool);
        });
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

        var searchQueryMessage = "You have searched for ";

        if(prov != -1){ //Province is specified
            provincesController.getProvinceByCode(prov, function(provModel){
                if(schoolInfo != ""){
                    searchQueryMessage += '"' + schoolInfo + '" in ' ;
                }
                searchQueryMessage += provModel.name + "(" + provModel.chineseName + ")";

                if(city != -1){ //City is also specified
                    citiesController.getCityByCode(city,function(cityModel){
                        searchQueryMessage += ", " + cityModel.pinyinName + "(" + cityModel.chineseName + ")";
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
                searchQueryMessage += cityModel.pinyinName + "(" + cityModel.chineseName + ")";
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
            School. //Province is not specified
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

    //
    //updateSchoolRating : function(schoolId, rating, numberOfReviews){
    //
    //    var updateRating = function(rating){
    //        School.findOneAndUpdate({ _id : schoolId }, {averageRating:rating}, function(err, editedSchool){
    //            if(err){
    //                console.log(err);
    //            }
    //        });
    //    };
    //
    //    if(numberOfReviews != 0){
    //        School.findOne({_id:schoolId}).exec(function(err,school){
    //            if(school.averageRating == undefined || school.averageRating == -1 ){
    //                updateRating(rating);
    //            }
    //            else{
    //                var newRating = school.averageRating*(numberOfReviews/(numberOfReviews+1)) + rating*(1/(numberOfReviews+1));
    //                updateRating(newRating);
    //            }
    //        });
    //    }
    //    else{
    //        updateRating(rating);
    //    }
    //}
}