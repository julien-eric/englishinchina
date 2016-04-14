var School = require('./../models/school');
var provincesController = require('./provinces');
var citiesController = require('./cities');

module.exports = {

    featuredSchools: function(callback){
        //At the moment featured schools are schools with the highest ratings
        School.
            find().
            sort({"averageRating": -1}).
            limit(3).
            exec(function(err,schoolList){callback(schoolList)});
    },

    loadSchools : function(callback, pageSize, page){
        School.count({},function(err,count){
            School.find()
                .populate("province")
                .populate("city")
                .limit(pageSize)
                .skip(pageSize * page)
                .exec(function(err,schools){
                    callback(count,schools);
                });
        })
    },

    addSchool : function (request, callback) {
        provincesController.getProvinceByCode(request.body.province, function(province){
            citiesController.getCityByCode(request.body.city, function(city){
                School.create({ user: request.user._id, name:request.body.name, description:request.body.description, schoolType: request.body.schoolType, province:province, city:city, pictureUrl: request.body.avatarUrl, averageRating:-1 }, function (err, newSchool){
                        callback(err, newSchool);
                });
            });
        });

    },

    editSchool : function (req, callback) {
        School.findOneAndUpdate({ _id : req.body.id }, { name:req.body.name, description:req.body.description, province:req.body.province, pictureUrl: req.body.avatarUrl }, function(err, editedSchool){
            callback(err, editedSchool);
        });
    },

    findSchoolByName : function(name, callback){
        School.findOne({name:name}).exec(function(err,school){
            callback(school);
        });
    },

    findSchoolById : function(id, callback){
        School.findOne({_id:id}).populate("province").exec(function(err,school){
            callback(school);
        });
    },

    findSchoolsByProvince : function(province, callback){
        School.find({province:province}).exec(function(err,school){
            callback(school);
        });
    },

    searchSchools : function(schoolInfo, prov, city, callback){

        if(prov != -1 && city != -1){

        }

        if(prov != -1){ //Province is specified
            provincesController.getProvinceByCode(prov, function(provModel){
                if(city != -1){ //City is also specified
                    citiesController.getCityByCode(city,function(cityModel){
                        School.
                            find({name: new RegExp(schoolInfo, "i")}).
                            populate("province").
                            populate("city").
                            where('province').equals(provModel).
                            where('city').equals(cityModel).
                            limit(10).
                            exec(function(err,schoolList){callback(schoolList)});
                    });
                }
                else{
                    School.
                        find({name: new RegExp(schoolInfo, "i")}).
                        populate("province").
                        populate("city").
                        where('province').equals(provModel).
                        limit(10).
                        exec(function(err,schoolList){callback(schoolList)});
                }
            });
        }
        else{
            School. //Province is not specified
                find({name: new RegExp(schoolInfo,"i")}).
                populate("province").
                populate("city").
                limit(10).
                exec(function(err,schoolList){callback(schoolList)});
        }
    },

    emptySchoolCollection : function(){
        School.remove({}, function(err) {
            console.log('collection removed')
        });
    },

    updateSchoolRating : function(schoolId, rating, numberOfReviews){

        var updateRating = function(rating){
            School.findOneAndUpdate({ _id : schoolId }, {averageRating:rating}, function(err, editedSchool){
                if(err){
                    console.log(err);
                }
            });
        };

        if(numberOfReviews != 0){
            School.findOne({_id:schoolId}).exec(function(err,school){
                if(school.averageRating == undefined || school.averageRating == -1 ){
                    updateRating(rating);
                }
                else{
                    var newRating = school.averageRating*(numberOfReviews/(numberOfReviews+1)) + rating*(1/(numberOfReviews+1));
                    updateRating(newRating);
                }
            });
        }
        else{
            updateRating(rating);
        }
    }
}