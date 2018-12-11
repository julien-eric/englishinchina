const tinify = require('tinify');
const settings = require('simplesettings');
tinify.key = settings.get('TINIFY_API_KEY');

const awsManager = require('./awsmanager');
const pictureinfo = require('./pictureinfo');
const winston = require('./config/winstonconfig');

const resizeImageAsync = async function (filename, prefix) {

    try {
        let source = await tinify.fromUrl(`https://${awsManager.bucketName}.s3.amazonaws.com/${filename}`);
        winston.info(`Creating https://${awsManager.bucketName}.s3.amazonaws.com/${prefix}${filename}`);

        if (prefix == pictureinfo.THUMBNAIL) {
            source = source.resize({
                method: 'scale',
                width: 600
            });
        }

        source.store({
            service: 's3',
            aws_access_key_id: awsManager.key,
            aws_secret_access_key: awsManager.secret,
            region: 'us-east-1',
            path: awsManager.bucketName + '/' + prefix + filename
        });

    } catch (error) {
        winston.error(`${error.status || 500} - ${error.message}`);
    }

};

module.exports = {

    async createResponsivePictures (filename) {
        resizeImageAsync(filename, pictureinfo.THUMBNAIL);
        resizeImageAsync(filename, pictureinfo.LARGE);
    }

};
