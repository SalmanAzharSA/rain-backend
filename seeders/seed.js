const mongoose = require("mongoose");
require("dotenv").config();
const { Command } = require("commander");
const User = require("../src/users/users.model");
async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log(`Database connected...`);
  } catch (ex) {
    console.log(ex);
    process.exit(-1);
  }
}

const program = new Command();

program
  .name("Greenpad Database Seeder")
  .description("Seed Database")
  .version("0.1.0");

program
  .command("seed-admin")
  .description("Seed admin user")
  .action(async () => {
    try {
      await connectDB();

      try {
        // Seed
        const newuser = await User.create({
          nickName: process.env.DEFAULT_ADMIN_NAME,
          email: process.env.DEFAULT_ADMIN_EMAIL,
          password: process.env.DEFAULT_ADMIN_PASSWORD,
          role: "admin",
          isEmailVerified: true,
        });
        console.log("Database seeded...", newuser);

        console.log("Database seeded...");
        process.exit(0);
      } catch (ex) {
        console.log(ex);
        throw ex;
      }
    } catch (ex) {
      console.log("Error: ", ex);
      console.log("Exiting application");
      process.exit(-1);
    }
  });

program.parse(process.argv);
