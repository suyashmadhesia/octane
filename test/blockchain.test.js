const Blockchain = require("../blockchain/blockchain");
const Block = require("../blockchain/block");
const Wallet = require("../wallet/wallet");
const Transaction = require("../wallet/transaction");

describe("Blockchain", () => {
  let blockchain, newChain, originalChain;
  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
  });
  it("contains a chain array instance", () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it("start a with a genesis block", () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it("adds a new block to the chain", () => {
    const newData = "foo bar";
    blockchain.addBlock({ data: newData });
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });

  describe("isValidChain()", () => {
    beforeEach(() => {
      blockchain.addBlock({ data: "beers" });
      blockchain.addBlock({ data: "Battles" });
      blockchain.addBlock({ data: "Goat" });
    });
    describe("when a chain doesn't start with genesis block", () => {
      it("returns false", () => {
        blockchain.chain[0] = { data: "fake-genesis" };
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });
    describe("chain start from the genesis block and has multiple block", () => {
      describe("and a lastHash reference has been changed", () => {
        it("return false", () => {
          blockchain.chain[2].lastHash = "broken-hash";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("and chain contains invalid block with invalid field..", () => {
        it("returns false", () => {
          blockchain.chain[2].data = "fake-data";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("chain doesn't contains any invalid block", () => {
        it("returns true", () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });
  describe("replaceChain()", () => {
    let errorMock, logMock;
    beforeEach(() => {
      errorMock = jest.fn();
      logMock = jest.fn();
      global.console.error = errorMock;
      global.console.log = logMock;
    });
    describe("when the new chain is not longer", () => {
      beforeEach(() => {
        newChain.chain[0] = { new: "new-chain" };
        blockchain.replaceChain(newChain.chain);
      });
      it("chain doesn't replace", () => {
        expect(blockchain.chain).toEqual(originalChain);
      });
      it("error Mock", () => {
        expect(errorMock).toHaveBeenCalled();
      });
    });
    describe("when the new chain is longer", () => {
      beforeEach(() => {
        newChain.addBlock({ data: "beers" });
        newChain.addBlock({ data: "Battles" });
        newChain.addBlock({ data: "Goat" });
      });
      describe("when the chain is invalid", () => {
        beforeEach(() => {
          newChain.chain[2].hash = "fake-hash";
          blockchain.replaceChain(newChain.chain);
        });
        it("chain doesn't replace", () => {
          expect(blockchain.chain).toEqual(originalChain);
        });
        it("error Mock", () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });
      describe("when the chain is valid", () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        });
        it("chain does replace", () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });
        it("logs about chain replacement", () => {
          expect(logMock).toHaveBeenCalled();
        });
      });
    });
  });
  describe('validTransactionData()', () => {
    let transaction, rewardTransaction, wallet;
    let errorMock, logMock;

    beforeEach(() => {
      errorMock = jest.fn();
      logMock = jest.fn();
      global.console.error = errorMock;
      global.console.log = logMock;
      wallet = new Wallet();
      transaction = wallet.createTransaction({ recipient: 'foo-address', amount: 65 });
      rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
    });

    describe('and the transaction data is valid', () => {
      it('returns true', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
        expect(errorMock).not.toHaveBeenCalled();
      });
    });

    describe('and the transaction data has multiple rewards', () => {
      it('returns false and logs an error', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('and the transaction data has at least one malformed outputMap', () => {
      describe('and the transaction is not a reward transaction', () => {
        it('returns false and logs an error', () => {
          transaction.outputMap[wallet.publicKey] = 999999;

          newChain.addBlock({ data: [transaction, rewardTransaction] });

          expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe('and the transaction is a reward transaction', () => {
        it('returns false and logs an error', () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999;

          newChain.addBlock({ data: [transaction, rewardTransaction] });

          expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });

    describe('and the transaction data has at least one malformed input', () => {
      it('returns false and logs an error', () => {
        wallet.balance = 9000;

        const evilOutputMap = {
          [wallet.publicKey]: 8900,
          fooRecipient: 100
        };

        const evilTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(evilOutputMap)
          },
          outputMap: evilOutputMap
        }

        newChain.addBlock({ data: [evilTransaction, rewardTransaction] });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('and a block contains multiple identical transactions', () => {
      it('returns false and logs an error', () => {
        newChain.addBlock({
          data: [transaction, transaction, transaction, rewardTransaction]
        });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });
  });
});
