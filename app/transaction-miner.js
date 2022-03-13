class TransactionMiner {

    constructor({blockchain, transactionPool, wallet, pubsub}){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.pubsub = pubsub;
        this.wallet = wallet;
    }

    mineTransaction() {
        // get transaction pool's valid transactions.

        // generate the miner reward

        // add a block consisting of these transaction to the blockchain

        // clear the pool
    }
}

module.exports = TransactionMiner;