const redis = require("redis");

const CHANNELS = {
  TEST: 'TEST',
};

class PubSub {
  constructor() {
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();
  }
}
