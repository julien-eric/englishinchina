const _ = require('underscore');
const aws = require('aws-sdk');
const settings = require('simplesettings');

let AwsManager = function () {
  aws.config.update({ accessKeyId: settings.get('S3_KEY'), secretAccessKey: settings.get('S3_SECRET') });
  this.S3 = new aws.S3();
};

AwsManager.prototype.getSignedUrl = function (operation, s3Params) {
  s3Params = _.defaults(s3Params, {
    Bucket: settings.get('S3_BUCKET'),
    Key: 'filename_' + Date.now(),
    Expires: 60,
    ContentType: 'jpg',
    ACL: 'public-read'
  });
  return this.S3.getSignedUrl(operation, s3Params);
};

AwsManager.prototype.getObject = function (filename) {
  const s3Params = { Bucket: settings.get('S3_BUCKET'), Key: filename };
  return this.S3.getObject(s3Params).promise();
};

AwsManager.prototype.putObject = function (object, s3Params) {

  s3Params = _.defaults(s3Params, {
    Bucket: settings.get('S3_BUCKET'),
    Key: 'xx_file_' + Date.now(),
    Body: s3Params.Body,
    ContentType: 'jpg',
    ACL: 'public-read'
  });
  return this.S3.putObject(s3Params).promise();

};

let awsManager = new AwsManager;
module.exports = awsManager;
