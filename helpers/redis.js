// const redis = require("redis");
// const configs = require("../configs");

// const client = redis.createClient({
//   url: configs.redis.host
// });

// client.on('connect', () => {
//   console.log('Client connected to redis...')
// })

// client.on('ready', () => {
//   console.log('Client connected to redis and ready to use...')
// })

// client.on('error', (err) => {
//   console.log(err.message)
// })

// client.on('end', () => {
//   console.log('Client disconnected from redis')
// })

// // process.on('SIGINT', () => {
// //   client.quit()
// // })
// // Handle process termination signals
// process.on('SIGINT', async () => {
//   console.log('SIGINT signal received: closing Redis client');
//   await client.quit();
//   console.log('Redis client closed.');
//   process.exit(0);
// });

// module.exports = client;

const redis = require("redis");
const configs = require("../configs");

const client = redis.createClient({
  url: configs.redis.host,
});

client.on("connect", () => {
  console.log("Redis client connected.");
});

client.on("ready", () => {
  console.log("Redis client is ready.");
});

client.on("error", (err) => {
  console.error("Redis error:", err.message);
});

client.on("end", () => {
  console.log("Redis client disconnected.");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received: closing Redis client.");
  if (client && client.isOpen) { // Check if the client is open
    console.log("SIGINT received: closing Redis client.");
    await client.quit(); // Gracefully close the Redis client
    console.log("Redis client closed.");
  }
  process.exit(0);
});

module.exports = client;
