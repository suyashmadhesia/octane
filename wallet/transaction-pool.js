const Transaction = require('./transaction');
class TransactionPool {
    constructor() {
        this.transactionMap = {};
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    }

    existingTransaction({ inputAddress }) {
        const transaction = Object.values(this.transactionMap);

        return transaction.find(transaction => transaction.input.address === inputAddress);
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    }

    validTransaction() {
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction));
    }

    clear() {
        this.transactionMap = {};
    }
}


module.exports = TransactionPool;