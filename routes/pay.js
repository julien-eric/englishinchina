const express = require('express');
const router = express.Router();
const stripeWrapper = require('../stripe/stripe-wrapper');
const usersController = require('../controllers/userscontroller');
const scripts = require('../public/scripts');
const winston = require('../config/winstonconfig');
const utils = require('../utils');
const uuidv1 = require('uuid/v1');

module.exports = function (passport) {

    router.get('/', utils.isAuthenticated, async (req, res, next) => {

        let clientReferenceId = uuidv1();
        winston.info('Transaction is loaded | Client Reference ID: ' + clientReferenceId);

        stripeWrapper.initTransaction(req.user, clientReferenceId);

        stripeInfo = {
            pk: stripeWrapper.getPublishableKey(),
            productSkus: [stripeWrapper.getProductSku(stripeWrapper.SINGLE_LISTING), stripeWrapper.getProductSku(stripeWrapper.BUNDLE_LISTING)],
            successUrl: 'http://localhost:3000/pay/success',
            canceledUrl: 'http://localhost:3000/pay/cancelled',
            clientReferenceId: clientReferenceId
        };

        try {
            res.render('pay/pay', {
                title: `Add Payment Method | Second Language World`,
                stripeInfo,
                user: req.user,
                scripts: [scripts.util, scripts.fileUploader, scripts.libmoment,
                scripts.libbsdatetimepicker, scripts.libslider, scripts.typeahead, scripts.addjob, scripts.stepper, scripts.nouislider,
                scripts.libtinyMCE, scripts.tinyMCE, scripts.reviewvalidation, scripts.typeaheadwrapper]
            });

        } catch (error) {
            next(error);
        }
    });

    router.post('/webhook/callback', utils.addRawBody, async function (req, res, next) {

        let signature = req.headers['stripe-signature'];

        try {

            let event = stripeWrapper.constructEvent(req.rawBody, signature);
            let data = event.data.object;
            if (event.type = 'checkout_beta.session_succeeded') {

                winston.info(JSON.stringify(event));

                let transaction = await stripeWrapper.getTransaction(data.client_reference_id);
                transaction.status = 3;
                transaction.dateSucceeded = Date.now();
                transaction.charge = data.display_items[0];

                let updatedTransaction = await stripeWrapper.updateTransaction(transaction);
                if (updatedTransaction.status == 3) {
                    await usersController.updateUser(updatedTransaction.user, { 'employerDetails.availableListings': updatedTransaction.user.employerDetails.availableListings + stripeWrapper.returnAmountForProduct(updatedTransaction.charge.sku) });
                }
            }

            // Webhook was received successfully (regardless of outcome)
            res.send(200);

        } catch (error) {
            winston.error(`${error.status || 500} - ${error.message}`);
            res.status(400).end();
        }
    });

    return router;
};
