const mongoose = require('mongoose');

module.exports = mongoose.model('Company', {
    name: String,
    description: String,
    website: String,
    pictureUrl: String,
    logoUrl: String,
    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }]
});
