const Transaction = require('../models/transaction');

module.exports = {

    createTransaction (user, clientReferenceId) {
        return Transaction.create({ user, clientReferenceId });
    },

    getTransaction (clientReferenceId) {
        return Transaction.findOne({ clientReferenceId }).exec();
    },

    updateTransaction (transaction) {
        return Transaction.findOneAndUpdate({ clientReferenceId: transaction.clientReferenceId }, transaction, { new: true }).populate('user').exec();
    }
};

