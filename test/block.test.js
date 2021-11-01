const Block = require("../block");
const { GENESIS_DATA } = require("../config");
const cryptoHash = require("../crypto-hash");

describe("Block", () => {
  const timestamp = "a-date";
  const lastHash = "foo-hash";
  const hash = "bar-hash";
  const data = ["bl", "data"];
  const block = new Block({ timestamp, lastHash, hash, data });

  it("has a timestamp, lasthash, hash, and data property", () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.timestamp).toEqual(timestamp);
  });

  describe("genesis()", () => {
    const genesisBlock = Block.genesis();

    it("returns a block Instance", () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it("returns the genesis data", () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe("mine()", () => {
    const lastBlock = Block.genesis();
    const data = "mined data";
    const minedBlock = Block.mineBlock({ lastBlock, data });

    it("returns a block instance", () => {
      expect(minedBlock instanceof Block).toBe(true);
    });
    it("set `lastHash` to be the `hash` of the last block", () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });
    it("set the `set data`", () => {
      expect(minedBlock.data).toEqual(data);
    });
    it("set the `timestamp`", () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });
    it("create a SHA-256 hash based on the proper input", () => {
      expect(minedBlock.hash).toEqual(
        cryptoHash(minedBlock.timestamp, lastBlock.hash, data)
      );
    });
  });
});
