const gm = require('gm');
const awsManager = require('./awsmanager');
const pictureinfo = require('./pictureinfo');
const mime = require('mime');

const resizeImageAsync = function(bucket, gmImage, filename, size, prefix) {
  return new Promise(function(resolve, reject) {
    gmImage.resize(size).toBuffer('PNG', function(err, buffer) {
      if (err) reject(err);
      let bucketContent = {Key: prefix + filename, Body: buffer, ContentType: mime.lookup(filename)};
      return resolve(awsManager.putObject(bucket, bucketContent));
    });
  });
};

module.exports = {

  async createResponsivePictures(filename, filesize) {
    let bucket = await awsManager.getObject(filename);
    resizeImageAsync(bucket, gm(bucket.Body), filename, pictureinfo.THUMBNAIL_SIZE, pictureinfo.THUMBNAIL);
    resizeImageAsync(bucket, gm(bucket.Body), filename, pictureinfo.LARGE_SIZE, pictureinfo.LARGE);
  }

};
