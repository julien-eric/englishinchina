var School = require('./models/school');

module.exports = {

    loadSchools : function(callback){
        School.find(function(err,schools){
            callback(schools);
        });
    },

    addSchool : function (req){
        School.create({ name:req.body.name, description:req.body.description, province:req.body.province, pictureUrl: req.body.avatarUrl }, function (err, small){
            if (err) {
                console.log("error");
                return handleError(err);
            }
        });
    },

    findSchoolByName : function(name, callback){
        School.findOne({name:name}).exec(function(err,school){
            callback(school);
        });
    },

    findSchoolById : function(id, callback){
        School.findOne({_id:id}).exec(function(err,school){
            callback(school);
        });
    },

    findSchoolsByProvince : function(province, callback){
        School.find({province:province}).exec(function(err,school){
            callback(school);
        });
    },

    searchSchools : function(schoolInfo, province, city, callback){
        School.
            find({name: new RegExp(schoolInfo, "i")}).
            where('province').equals(province).
            limit(10).
            exec(function(err,schoolList){callback(schoolList)});
    },

    emptySchoolCollection : function(){
        School.remove({}, function(err) {
            console.log('collection removed')
        });
    }

}