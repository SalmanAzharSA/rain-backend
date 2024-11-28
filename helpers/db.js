const mongoose = require("mongoose");
const { database } = require("../configs");

(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(database.uri);
    console.log(`Database connected...`);
  } catch (ex) {
    console.log("Error connecting to Database...", ex);
    console.log("Exiting application");
    process.exit(-1);
  }
})();

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to db");
});

mongoose.connection.on("error", (err) => {
  console.log(err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection disconnected...");
});

mongoose.connection.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});


// // Self-invoking async function to establish the database connection
// (async () => {
//   try {
//     mongoose.set("strictQuery", false); // Disable strict query filtering (optional)
//     await mongoose.connect(database.uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Database connected...");
//   } catch (ex) {
//     console.log("Error connecting to Database...", ex);
//     console.log("Exiting application");
//     process.exit(-1); // Exit with error
//   }
// })();

// // Mongoose connection events
// mongoose.connection.on("connected", () => {
//   console.log("Mongoose connected to the database");
// });

// mongoose.connection.on("error", (err) => {
//   console.log("Mongoose connection error:", err.message);
// });

// mongoose.connection.on("disconnected", () => {
//   console.log("Mongoose connection disconnected");
// });

// // Graceful shutdown on SIGINT
// process.on("SIGINT", async () => {
//   console.log("SIGINT signal received: closing MongoDB connection");
//   await mongoose.connection.close(); // Close the connection
//   console.log("MongoDB connection closed.");
//   process.exit(0); // Exit the process cleanly
// });
