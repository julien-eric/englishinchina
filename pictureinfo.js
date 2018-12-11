const splashContent = require('./splash-text');
const awsManager = require('./awsmanager');

module.exports = {

    returnFacebookPicture (file) {
        return `${module.exports.THUMBNAIL}${file}`;
    },

    returnThumbnail (file) {
        if (file == undefined) {
            return '/images/default-user.png';
        }
        return `https://${awsManager.bucketName}.s3.amazonaws.com/${module.exports.THUMBNAIL}${file}`;
    },

    returnLarge (file) {
        if (file) {
            return `https://${awsManager.bucketName}.s3.amazonaws.com/${module.exports.LARGE}${file}`;
        } else {
            return splashContent.image;
        }
    },

    returnCSSBgImageAttr (file) {
        return 'background-image: url(' + this.returnLarge(file) + ');';
    },

    THUMBNAIL: 'th_',
    THUMBNAIL_SIZE: 350,
    FACEBOOK: '',
    LARGE: 'lg_',
    LARGE_SIZE: 1663
};
