const Blockchain = require("../blockchain/blockchain");
const Block = require("../blockchain/block");

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
});
