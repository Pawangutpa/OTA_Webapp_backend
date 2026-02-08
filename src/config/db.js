/**
 * MongoDB Connection Manager
 * --------------------------
 * Handles MongoDB connection lifecycle using Mongoose.
 */

"use strict";

const mongoose = require("mongoose");

/**
 * Connects to MongoDB.
 * Fails fast if connection cannot be established.
 */
async function connectDB() {
  try {
    // Prevent duplicate connections in dev / hot-reload scenarios
    if (mongoose.connection.readyState === 1) {
      console.warn("[DB] MongoDB already connected");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false,        // Disable auto-indexing in production
      maxPoolSize: 10,         // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Fail fast if Mongo is unreachable
    });

    console.log("[DB] MongoDB connected");
  } catch (error) {
    console.error("[DB] MongoDB connection failed:", error.message);
    process.exit(1); // Fatal error → exit process
  }
}

/**
 * Gracefully disconnects MongoDB.
 * Used during application shutdown.
 */
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log("[DB] MongoDB disconnected");
  }
}

/**
 * Connection event listeners (optional but useful)
 */
mongoose.connection.on("error", (err) => {
  console.error("[DB] MongoDB runtime error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[DB] MongoDB disconnected unexpectedly");
});

module.exports = {
  connectDB,
  disconnectDB,
};
