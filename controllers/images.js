var Image = require('./../models/image');

module.exports = {

    getImagesBySchool: function(school, callback){
        Image.find({school:school._id}).exec(function(err,comments){
            if(err){
                console.log(err);
            }
            else{
                callback(comments);
            }
        });
    },

    getImageById: function(id, callback){
        Image.find({_id:id}).populate("user").exec(function(err,image){
            if(err){
                console.log(err);
            }
            else{
                callback(image);
            }
        });
    },

    addImage: function(image, callback){
        Image.create(image, function(err,createdImage){
                callback(err,createdImage);
            }
        );
    },

    deleteImage: function(photoId, callback){
        Image.find({_id : photoId}).remove(callback);
    }


}