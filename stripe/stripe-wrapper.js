const settings = require('simplesettings');
let stripe = require('stripe')(settings.get('STRIPE_KEY_SECRET'));
let transactionsController = require('../controllers/transactionscontroller');

const SINGLE_LISTING = 'solo';
const BUNDLE_LISTING = 'bundle';

const JOB_LISTING_SOLO_TEST = 'sku_EXKGzFugzvl26a';
const JOB_LISTING_BUNDLE_TEST = 'sku_EY6rShFCRhw0wZ';

const JOB_LISTING_SOLO_LIVE = 'sku_EXJumbclgX3ZmP';
const JOB_LISTING_BUNDLE_LIVE = 'sku_EXKpLoqKxsbaxT';

let StripeWrapper = function () {
    this.SINGLE_LISTING = SINGLE_LISTING;
    this.BUNDLE_LISTING = BUNDLE_LISTING;
};

StripeWrapper.prototype.initTransaction = function (user, clientReferenceId) {
    transactionsController.createTransaction(user, clientReferenceId);
};

StripeWrapper.prototype.getTransaction = function (clientReferenceId) {
    return transactionsController.getTransaction(clientReferenceId);
};

StripeWrapper.prototype.updateTransaction = function (transaction) {
    if (!transaction.clientReferenceId) {
        throw new Error('Cannot update a transaction without a client reference Id');
    }
    return transactionsController.updateTransaction(transaction);
};

StripeWrapper.prototype.getProductSku = function (type) {
    if (settings.get('ENV') != 'production') {

        // STRIPE TEST ENV
        if (type == this.SINGLE_LISTING) {
            return JOB_LISTING_SOLO_TEST;
        } else if (type == this.BUNDLE_LISTING) {
            return JOB_LISTING_BUNDLE_TEST;
        }

    } else {

        // STRIPE LIVE ENV
        if (type == this.SINGLE_LISTING) {
            return JOB_LISTING_SOLO_LIVE;
        } else if (type == this.BUNDLE_LISTING) {
            return JOB_LISTING_BUNDLE_LIVE;
        }
    }
};

StripeWrapper.prototype.returnAmountForProduct = function (sku) {
    if (sku == JOB_LISTING_SOLO_TEST || sku == JOB_LISTING_SOLO_LIVE) {
        return 1;
    } else if (sku = JOB_LISTING_BUNDLE_TEST || sku == JOB_LISTING_BUNDLE_LIVE) {
        return 4;
    } else {
        return 0;
    }
};

StripeWrapper.prototype.constructEvent = function (event, signedHeaders) {
    return stripe.webhooks.constructEvent(event, signedHeaders, this.getWebhookSecret());
};

StripeWrapper.prototype.getPublishableKey = function () {
    return settings.get('STRIPE_PUB_KEY');
};

StripeWrapper.prototype.getWebhookSecret = function () {
    return settings.get('STRIPE_WH_KEY');
};

let stripeWrapper = new StripeWrapper();
module.exports = stripeWrapper;

