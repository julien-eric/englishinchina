const Page = require('../models/page');

module.exports = {

    createPage (url) {
        return Page.create({ url });
    },

    getPage (url) {
        return Page.findOne({ url }).exec();
    },

    setPageSucceeded (url) {
        return Page.findOneAndUpdate({ url }, { succeeded: true }, { new: true }).exec();
    }
};

