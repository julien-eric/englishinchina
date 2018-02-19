const gm = require('gm');
const awsManager = require('./awsmanager');
const pictureinfo = require('./pictureinfo');
const mime = require('mime');

const resizeImageAsync = function(bucket, gmImage, filename, size, prefix) {
  return new Promise(function(resolve, reject) {
    gmImage.resize(size).stream((err, stdout, stderr) => {
      let buffer = new Buffer('');

      // Collecting data as image is being resized on server
      stdout.on('data', (data) => {
        buffer = Buffer.concat([buffer, data]);
        console.log('Resizing image');
      });

      // When all has been processed put newly resized image on S3
      stdout.on('end', (data) => {
        let bucketContent = {Key: prefix + filename, Body: buffer, ContentType: mime.lookup(filename)};
        return awsManager.putObject(bucket, bucketContent);
      });

    });
  });
};

module.exports = {

  async createResponsivePictures(url, filename, filesize, callback) {
    let bucket = await awsManager.S3.getObject(filename);
    resizeImageAsync(bucket, gm(bucket.Body), filename, pictureinfo.THUMBNAIL_SIZE, pictureinfo.THUMBNAIL);
    resizeImageAsync(bucket, gm(bucket.Body), filename, pictureinfo.LARGE_SIZE, pictureinfo.LARGE);
  }

};
