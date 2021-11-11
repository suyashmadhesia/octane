const hexToBinary = require("hex-to-binary");

const Block = require("../blockchain/block");
const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash = require("../utils/crypto-hash");

describe("Block", () => {
  const timestamp = 2000;
  const lastHash = "foo-hash";
  const hash = "bar-hash";
  const data = ["bl", "data"];
  const nonce = 1;
  const difficulty = 1;
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty,
  });

  it("has a timestamp, lasthash, hash, and data property", () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.timestamp).toEqual(timestamp);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
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
        cryptoHash(
          minedBlock.timestamp,
          minedBlock.nonce,
          minedBlock.difficulty,
          lastBlock.hash,
          data
        )
      );
    });

    it("sets a hash that matches the difficulty criteria", () => {
      expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual(
        "0".repeat(minedBlock.difficulty)
      );
    });
  });

  describe("adjustDifficulty()", () => {
    it("raises the difficulty for a quickly mined block", () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE - 100,
        })
      ).toEqual(block.difficulty + 1);
    });
    it("lower the difficulty for a slowly mined block", () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE + 100,
        })
      ).toEqual(block.difficulty - 1);
    });
  });
});
