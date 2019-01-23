const express = require('express');
const router = express.Router();
const pictures = require('../pictures');
const awsManager = require('../awsmanager');
const uuidv1 = require('uuid/v1');

module.exports = function (passport) {

    /** **********************************************************************************************************
       * pictureUploaded : POST// After original picture is uploaded to S3, server will create responsive images for faster loading times
       * pictureURL : string
       ************************************************************************************************************ */
    router.post('/pictureuploaded', (req, res) => {
        let filename = req.query.url;
        if (filename.indexOf('.jpg') != -1 ||
            filename.indexOf('.png') != -1 ||
            filename.indexOf('.gif') != -1 ||
            filename.indexOf('.tif') != -1 ||
            filename.indexOf('.jpeg') != -1) {

            pictures.createResponsivePictures(req.query.url, req.query.filesize, () => { });

        }
    });

    /** **********************************************************************************************************
       * sign_s3 : GET get signed request to upload to server directly.
       ************************************************************************************************************ */
    router.get('/sign_s3', async (req, res) => {
        try {
            const extension = req.query.file_name.substring(req.query.file_name.indexOf('.'), req.query.file_name.length);
            const fileHash = uuidv1() + extension;
            const s3Params = { Key: fileHash, ContentType: req.query.file_type };
            const signedRequest = await awsManager.getSignedUrl('putObject', s3Params);
            const returnData = {
                signed_request: signedRequest,
                url: fileHash
            };
            res.write(JSON.stringify(returnData));
        } catch (error) {
            res.write('Error while trying to obtain signed request from AWS');
        }
        res.end();
    });

    return router;
};
