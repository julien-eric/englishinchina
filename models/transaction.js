const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Charge = new Schema({
    amount: Number,
    currency: String,
    quantity: Number,
    sku: String,
    type: String
});

const Transaction = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Can\'t initiate a transaction object without referencing a user'] },
    clientReferenceId: { type: String, required: [true, 'Provide a client reference id to initiate a transaction'] },
    status: { type: Number, default: 0 },
    dateInitiated: { type: Date, default: Date.now },
    dateSucceeded: { type: Date },
    charge: {
        type: Charge,
        default: () => ({})
    }
});

module.exports = mongoose.model('Transaction', Transaction);
