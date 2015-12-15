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
        s3.getObject(s3_params,function(err, data){
            var gmImage = gm(data.Body);
            gmImage.resize(200).stream(function(err, stdout, stderr) {

                var buf = new Buffer('');
                stdout.on('data', function(data) {
                    buf = Buffer.concat([buf, data]);
                    console.log("work work");
                });
                stdout.on('end', function(data) {
                    var data = {
                        Bucket: "englishinchina",
                        Key: "th_" + filename,
                        Body: buf,
                        ContentType: mime.lookup(filename),
                        ACL: 'public-read'
                    };
                    s3.putObject(data, function(err, res) {
                            if(err){
                                console.log(err)
                            }
                            else{
                                console.log("done");
                            }
                    });
                });
            })
        });
    }

}
