const cron = require("node-cron");

// Define the cron job
cron.schedule("* * * * *", async () => {
  console.log("Running a task every minute");

  // Your code to fetch data from GraphQL (from Solidity) goes here
});
