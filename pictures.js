const gm = require('gm');
const aws = require('aws-sdk');
const mime = require('mime');
const pictureinfo = require('./pictureinfo');
const settings = require('simplesettings');


const resizeImageAsync = function(bucket, gmImage, filename, size, prefix) {
  gmImage.resize(size).stream((err, stdout, stderr) => {
    let buf = new Buffer('');
    stdout.on('data', (data) => {
      buf = Buffer.concat([buf, data]);
      console.log('work work');
    });
    stdout.on('end', (data) => {
      let bucketContent = {
        Bucket: 'englishinchinaasia',
        Key: prefix + filename,
        Body: buf,
        ContentType: mime.lookup(filename),
        ACL: 'public-read'
      };
      bucket.putObject(bucketContent, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('done');
        }
      });
    });
  });
};

module.exports = {

  createResponsivePictures(url, filename, filesize, callback) {
    aws.config.update(
      {
        accessKeyId: settings.get('S3_KEY'),
        secretAccessKey: settings.get('S3_SECRET')
      });
    const S3 = new aws.S3();
    const S3Params = {
      Bucket: settings.get('S3_BUCKET'),
      Key: filename
    };
    S3.getObject(S3Params, (err, data) => {
      resizeImageAsync(S3, gm(data.Body), filename, pictureinfo.THUMBNAIL_SIZE, pictureinfo.THUMBNAIL);
      resizeImageAsync(S3, gm(data.Body), filename, pictureinfo.LARGE_SIZE, pictureinfo.LARGE);
    });
  }

};
