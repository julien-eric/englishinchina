const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const helpful = new Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  dateCreated: {type: Date, default: Date.now}
});

const Review = new Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  objectType: Number, /* School:0 */
  foreignId: {type: mongoose.Schema.Types.ObjectId, ref: 'School'},
  comment: String,
  anonymous: Boolean,
  position: Number, /* FT 1, TA 2, HT3 */
  dateEmployed: Date,
  dateReleased: Date,
  dateCreated: {type: Date, default: Date.now},
  helpfuls: [helpful],
  criteria: {
    c1: Number,
    c2: Number,
    c3: Number,
    c4: Number,
    c5: Number,
    c6: Number,
    c7: Number,
    c8: Number
  },
  average_rating: Number
});

Review.post('save', async (document) => {
  console.log('Inserted review : %s : (%s)', document._id, document.comment);
  const schools = require('../controllers/schools');
  await schools.updateAverageRating(document.foreignId);
});

Review.post('remove', (document) => {
  console.log('Removed review : %s : (%s)', document._id, document.comment);
  const schools = require('../controllers/schools');
  schools.updateAverageRating(document.foreignId);
});

module.exports = mongoose.model('Review', Review);

