const mongoose = require('mongoose');

module.exports = mongoose.model('City', {
  province: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },
  pinyinName: String,
  chineseName: String,
  x: Number,
  y: Number,
  code: Number
});
