var gm = require('gm');
var fs = require('fs');
var aws = require('aws-sdk');
var mime = require('mime');
var request = require('request');


module.exports = {

    createResponsivePictures : function(url, filename, filesize, callback){

        aws.config.update({accessKeyId: "AKIAJFGLJ3FU42D22YKQ", secretAccessKey: "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"});
        var s3 = new aws.S3();
        var s3_params = {
            Bucket: "englishinchina",
            Key: filename
        };
        //var file = fs.createWriteStream('./public/images/' + filename);
        s3.getObject(s3_params,function(err, data){
            var gmImage = gm(data.Body);
            gmImage.resize(200);
            gmImage.write("./public/images/" + filename, function (err) {
                console.log("ERROR" + err)
            });
        //}).createReadStream().pipe(file);
        });
    },

    uploadToAmazonS3 : function(gmImage){
        s3Bucket.putObject(data, function(err, data){
            if (err) {
                console.log(err);
                console.log('Error uploading data: ', data);
            } else {
                console.log('succesfully uploaded the image!');
            }
        });
    }
}
