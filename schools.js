var School = require('./models/school');
var provincesController = require('./controllers/provinces');

module.exports = {

    featuredSchools: function(callback){
        //TODO: Define How featured schools will be determined
        School.
            find().
            limit(3).
            exec(function(err,schoolList){callback(schoolList)});
    },

    loadSchools : function(callback, pageSize, page){
        School.count({},function(err,count){
            School.find()
                .populate("province")
                .limit(pageSize)
                .skip(pageSize * page)
                .exec(function(err,schools){
                    callback(count,schools);
                });
        })
    },

    addSchool : function (req, callback) {
        provincesController.provinceByCode(req.body.province, function(province){
            School.create({ user: req.user._id, name:req.body.name, description:req.body.description, province:province, pictureUrl: req.body.avatarUrl, averageRating:-1 }, function (err, newSchool){
                callback(err, newSchool);
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

    searchSchools : function(schoolInfo, province, city, callback){
        if(province != -1){
            School.
                find({name: new RegExp(schoolInfo, "i")}).
                populate("province").
                where('province').equals(province).
                limit(10).
                exec(function(err,schoolList){callback(schoolList)});
        }
        else{
            School.
                find({name: new RegExp(schoolInfo, "i")}).
                limit(10).
                exec(function(err,schoolList){callback(schoolList)});
        }
    },

    emptySchoolCollection : function(){
        School.remove({}, function(err) {
            console.log('collection removed')
        });
    },

    updateSchoolRating : function(schoolId, rating,numberOfReviews){

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