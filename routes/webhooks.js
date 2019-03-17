const express = require('express');
const router = express.Router();
const stripeWrapper = require('../stripe/stripe-wrapper');
const winston = require('../config/winstonconfig');

module.exports = function (passport) {

    router.post('/callback', function (req, res) {

        let sig = req.headers['stripe-signature'];

        try {
            let event = stripeWrapper.constructEvent(req.body, sig);

        } catch (error) {
            winston.error(`${error.status || 500} - ${error.message}`);
            res.status(400).end();
        }

        // Return a response
        res.send(200);

    });

    return router;
};
