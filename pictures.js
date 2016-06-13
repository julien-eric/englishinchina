var gm = require('gm');
var aws = require('aws-sdk');
var mime = require('mime');
var pictureinfo = require('./pictureinfo');



var resizeImageAsync = function(bucket,gmImage,filename, size, prefix){
    gmImage.resize(size).stream(function(err, stdout, stderr) {

        var buf = new Buffer('');
        stdout.on('data', function(data) {
            buf = Buffer.concat([buf, data]);
            console.log("work work");
        });
        stdout.on('end', function(data) {
            var data = {
                Bucket: "englishinchina",
                Key: prefix + filename,
                Body: buf,
                ContentType: mime.lookup(filename),
                ACL: 'public-read'
            };
            bucket.putObject(data, function(err, res) {
                if(err){
                    console.log(err)
                }
                else{
                    console.log("done");
                }
            });
        });
    });
}

module.exports = {

    createResponsivePictures : function(url, filename, filesize, callback){

        aws.config.update({accessKeyId: "AKIAJFGLJ3FU42D22YKQ", secretAccessKey: "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"});
        var s3 = new aws.S3();
        var s3_params = {
            Bucket: "englishinchina",
            Key: filename
        };
        s3.getObject(s3_params,function(err, data){
            resizeImageAsync(s3, gm(data.Body),filename, pictureinfo.THUMBNAIL_SIZE,  pictureinfo.THUMBNAIL);
            resizeImageAsync(s3, gm(data.Body),filename, pictureinfo.LARGE_SIZE,  pictureinfo.LARGE);
        });
    }

}
