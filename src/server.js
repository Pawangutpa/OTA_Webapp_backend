require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
require("./config/mqtt");
// Start schedulers
const { startSchedulers } = require("./utils/scheduler");


connectDB();
startSchedulers();
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on ${process.env.PORT}`)
);
