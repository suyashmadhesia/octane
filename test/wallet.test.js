const Wallet = require("../wallet/wallet");
const Transaction = require("../wallet/transaction");
const { verifySignature } = require("../utils/utils");

describe("Wallet", () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it("has a `balance`", () => {
    expect(wallet).toHaveProperty("balance");
  });

  it("has a `publicKey`", () => {
    // console.log(wallet.publicKey);
    expect(wallet).toHaveProperty("publicKey");
  });

  describe("signing data", () => {
    const data = "foo-bar";

    it("verifies a signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data),
        })
      ).toBe(true);
    });

    it("does not verifies an invalid signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data),
        })
      ).toBe(false);
    });
  });
  describe("createTranscation()", () => {
    describe("and the amout exceed the balance", () => {
      it("throws an error", () => {
        expect(() =>
          wallet.createTransaction({
            amount: 999999,
            recipient: "foo-recipient",
          })
        ).toThrow("Amount exceeds balance");
      });
    });

    describe("and the amount is valid", () => {
      let transaction, amount, recipient;

      beforeEach(() => {
        amount = 50;
        recipient = "foo-recipient";
        transaction = wallet.createTransaction({ amount, recipient });
      });

      it("create an instace of `Transaction`", () => {
        expect(transaction instanceof Transaction).toBe(true);
      });

      it("matches the transaction input with wallet ", () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it("outputs the amount the recipient", () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });
  });
});
