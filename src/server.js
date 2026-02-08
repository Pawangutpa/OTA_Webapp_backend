/**
 * Application Entry Point
 * -----------------------
 * Responsibilities:
 *  - Load environment variables
 *  - Initialize external services (DB, MQTT, schedulers)
 *  - Start HTTP server
 *  - Handle graceful shutdown
 */

"use strict";

/* =========================
   Environment Configuration
   ========================= */
const dotenv = require("dotenv");
dotenv.config();

/**
 * Validate required environment variables early.
 * App should FAIL FAST if critical config is missing.
 */
const REQUIRED_ENVS = ["PORT", "MONGO_URI"];
REQUIRED_ENVS.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[ENV ERROR] Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

/* =========================
   Module Imports
   ========================= */
const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");

require("./config/mqtt"); // MQTT initializes on import
const { startSchedulers, stopSchedulers } = require("./utils/scheduler");

/* =========================
   Application Bootstrap
   ========================= */
async function bootstrap() {
  try {
    // 1️ Connect to database
    await connectDB();
    console.log("[DB] MongoDB connected");

    // 2️ Start background schedulers
    startSchedulers();
    console.log("[SCHEDULER] Background jobs started");

    // 3️ Start HTTP server
    const server = app.listen(process.env.PORT, () => {
      console.log(`[SERVER] Running on port ${process.env.PORT}`);
    });

    // 4️ Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`[SHUTDOWN] Received ${signal}`);

      // Stop background jobs first
      stopSchedulers();
      await disconnectDB();

      // Stop accepting new HTTP requests
      server.close(() => {
        console.log("[SHUTDOWN] HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown); // Ctrl + C
    process.on("SIGTERM", shutdown); // Docker / PM2 / K8s
  } catch (error) {
    console.error("[BOOTSTRAP ERROR]", error);
    process.exit(1);
  }
}

/* =========================
   Start Application
   ========================= */
bootstrap();
