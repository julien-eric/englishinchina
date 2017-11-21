const mongoose = require('mongoose');

module.exports = mongoose.model('School', {
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  name: String,
  description: String,
  website: String,
  address: String,
  phone: String,
  province: {type: mongoose.Schema.Types.ObjectId, ref: 'Province'},
  city: {type: mongoose.Schema.Types.ObjectId, ref: 'City'},
  company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
  schoolType: Number,
  pictureUrl: String,
  criteria: {
    c1: Number,
    c2: Number,
    c3: Number,
    c4: Number,
    c5: Number,
    c6: Number,
    c7: Number,
    c8: Number,
  },
  averageRating: Number,
  validated: Boolean,
  photos: [{type: mongoose.Schema.Types.ObjectId, ref: 'Image'}],
});
