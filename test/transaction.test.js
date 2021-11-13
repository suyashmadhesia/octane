const Wallet = require("../wallet/wallet");
const Transaction = require("../wallet/transaction");
const { verifySignature } = require("../utils/utils");

describe("Transcation", () => {
  let transaction, senderWallet, recipient, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = "recipient-public-key";
    amount = 50;

    transaction = new Transaction({ senderWallet, recipient, amount });
  });

  it("has an `id`", () => {
    expect(transaction).toHaveProperty("id");
  });

  describe("outputMap", () => {
    it("has an `outputMap`", () => {
      expect(transaction).toHaveProperty("outputMap");
    });

    it("outputs the amount of the recipien", () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    it("outputs the remaining balance for the `senderWallet`", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });

  describe("input()", () => {
    it("has an `input`", () => {
      expect(transaction).toHaveProperty("input");
    });

    it("has a`timestamp` in input", () => {
      expect(transaction.input).toHaveProperty("timestamp");
    });

    it("sets the amount to the senders wallet balance", () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it("sets the address to the senderWallet public", () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it("sign the input", () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature,
        })
      ).toBe(true);
    });
  });

  describe("validTranscation()", () => {

    let errorMock;

    beforeEach(()=>{
        errorMock = jest.fn();

        global.console.error = errorMock;
    });

    describe("when the transcation is valid", () => {
      it("returns true", () => {
        expect(Transaction.validTransaction(transaction)).toBe(true);
      });
    });

    describe("when the trancation is invalid", () => {
      describe("when the transcation outputMap value is invalid", () => {
        it("returns false and log an error", () => {
          transaction.outputMap[senderWallet.publicKey] = 99999;

          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe("when the transaction input signature is valid", () => {
        it("returns false and console log an error", () => {
          transaction.input.signature = new Wallet().sign("data");

          expect(Transaction.validTransaction(transaction)).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });
});
