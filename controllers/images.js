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