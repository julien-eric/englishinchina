module.exports = {

  returnFacebookPicture(file) {
    return `${module.exports.THUMBNAIL}${file}`;
  },

  returnThumbnail(file) {
    if (file == undefined) {
      return '/images/default-user.png';
    }
    return `https://englishinchinaasia.s3.amazonaws.com/${module.exports.THUMBNAIL}${file}`;
  },

  returnLarge(file) {
    return `https://englishinchinaasia.s3.amazonaws.com/${module.exports.LARGE}${file}`;
  },

  trunkFileName(file) {
    return `https://englishinchinaasia.s3.amazonaws.com/${module.exports.LARGE}${file}`;
  },

  THUMBNAIL: 'th_',
  THUMBNAIL_SIZE: 350,
  FACEBOOK: '',
  LARGE: 'lg_',
  LARGE_SIZE: 1663
};
