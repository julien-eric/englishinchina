var Image = require('./../models/image');

module.exports = {

    getAllImages: function(callback){
        Image.find().exec(function(err,images){
            if(err){
                console.log(err);
            }
            else{
                callback(images);
            }
        });
    },

    getImagesBySchool: function(school, callback){
        Image.find({school:school._id}).exec(function(err,images){
            if(err){
                console.log(err);
            }
            else{
                callback(images);
            }
        });
    },

    getImageById: function(id, callback){
        Image.find({_id:id}).populate("user").populate("school").exec(function(err,image){
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
    },

    updateImage: function(image,  callback){
        Image.findOneAndUpdate({ _id : image._id }, { url:image.url}, function(err, editedImage){
            callback(err, editedImage);
        });
    }


}