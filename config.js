const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 5;
const STARTING_BALANCE = 1000;

const GENESIS_DATA = {
  timestamp: 1,
  lastHash: "______",
  hash: "hash-one",
  data: [],
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
};

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE };
