const Image = require('./../models/image');

module.exports = {

  getAllImages() {
    return Image.find().exec();
  },

  getImagesBySchool(school) {
    return Image.find({school: school._id}).exec();
  },

  getImageById(id) {
    return Image.find({_id: id}).populate('user').populate('school').exec();
  },

  addImage(image) {
    return Image.create(image);
  },

  deleteImage(photoId) {
    return Image.find({_id: photoId}).remove().exec();
  },

  updateImage(image) {
    return Image.findOneAndUpdate({_id: image._id}, {url: image.url});
  }

};
