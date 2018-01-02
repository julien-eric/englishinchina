const Image = require('./../models/image');

module.exports = {

  getAllImages(callback) {
    Image.find().exec((err, images) => {
      if (err) {
        console.log(err);
      } else {
        callback(images);
      }
    });
  },

  getImagesBySchool(school, callback) {
    Image.find({school: school._id}).exec((err, images) => {
      if (err) {
        console.log(err);
      } else {
        callback(images);
      }
    });
  },

  getImageById(id, callback) {
    Image.find({_id: id}).populate('user').populate('school').exec((err, image) => {
      if (err) {
        console.log(err);
      } else {
        callback(image);
      }
    });
  },

  addImage(image, callback) {
    return Image.create(image, (err, createdImage) => {
      callback(err, createdImage);
    });
  },

  deleteImage(photoId, callback) {
    Image.find({_id: photoId}).remove(callback);
  },

  updateImage(image, callback) {
    Image.findOneAndUpdate({_id: image._id}, {url: image.url}, (err, editedImage) => {
      callback(err, editedImage);
    });
  },


};
