const cron = require("node-cron");
i;
// Cron job that runs every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  // Every 10 seconds
  console.log("Fetching SpaceX launches...");
  await fetchLaunches();
});

// You can also test manually by calling the fetchLaunches function right here if needed
// fetchLaunches();
