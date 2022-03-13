const uuid = require("uuid");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const { verifySignature } = require("../utils/utils");

class Transaction {
  constructor({ senderWallet, recipient, amount, outputMap, input }) {
    this.id = uuid.v1();
    this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });
    this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }

  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};

    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  static validTransaction(transaction) {
    const {
      input: { address, amount, signature },
      outputMap,
    } = transaction;

    const outputTotal = Object.values(outputMap).reduce(
      (total, outputAmount) => total + outputAmount
    );

    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid signature ${address}`);
      return false;
    }

    return true;
  }

  update({ senderWallet, recipient, amount }) {
    this.outputMap[recipient] = amount;
    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;
    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  static rewardTransaction({minerWallet}){
    return new this({
      input : REWARD_INPUT,
      outputMap : {
        [minerWallet.publicKey] : MINING_REWARD,
      }
    });
  }
}

module.exports = Transaction;
