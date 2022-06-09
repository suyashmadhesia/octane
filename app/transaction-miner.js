const Transaction = require("../wallet/transaction");
class TransactionMiner {

    constructor({ blockchain, transactionPool, wallet, pubsub }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.pubsub = pubsub;
        this.wallet = wallet;
    }

    mineTransaction() {
        const validTransactions = this.transactionPool.validTransaction();

        validTransactions.push(Transaction.rewardTransaction({ minerWallet: this.wallet }));

        this.blockchain.addBlock({data : validTransactions});

        this.pubsub.broadcastChain();

        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;