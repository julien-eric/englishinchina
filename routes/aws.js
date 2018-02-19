const express = require('express');
const router = express.Router();
const pictures = require('../pictures');
const awsManager = require('../awsmanager');

module.exports = function(passport) {

  /** **********************************************************************************************************
     * pictureUploaded : POST// After original picture is uploaded to S3, server will create responsive images for faster loading times
     * pictureURL : string
     ************************************************************************************************************ */
  router.post('/pictureuploaded', (req, res) => {
    pictures.createResponsivePictures(req.query.url, req.query.filename, req.query.filesize, () => {
    });
  });

  /** **********************************************************************************************************
     * sign_s3 : GET get signed request to upload to server directly.
     ************************************************************************************************************ */
  router.get('/sign_s3', async (req, res) => {
    try {
      const s3Params = {Key: req.query.file_name, ContentType: req.query.file_type};
      const signedRequest = await awsManager.getSignedUrl('putObject', s3Params);
      const returnData = {
        signed_request: signedRequest,
        url: req.query.file_name
      };
      res.write(JSON.stringify(returnData));
    } catch (error) {
      res.write('Error while trying to obtain signed request from AWS');
    }
    res.end();
  });

  return router;
};
