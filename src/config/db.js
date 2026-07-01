/**
 * MongoDB Connection Manager
 * --------------------------
 * Handles MongoDB connection lifecycle using Mongoose.
 */

"use strict";

const mongoose = require("mongoose");
const dns = require("dns");

/**
 * Work around c-ares (Node's DNS resolver used for mongodb+srv SRV/TXT lookups)
 * failing to read the OS DNS config on some Windows networks and falling back
 * to 127.0.0.1, where nothing listens -> "querySrv ECONNREFUSED".
 * Only override when the resolver has no usable server; leaves correctly
 * configured hosts (e.g. production) untouched.
 */
function ensureUsableDnsServers() {
  const servers = dns.getServers();
  const allLoopback = servers.every((s) => s === "127.0.0.1" || s === "::1");
  if (servers.length === 0 || allLoopback) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.warn(
      "[DB] No usable DNS server from OS; using 8.8.8.8/1.1.1.1 for SRV lookups",
    );
  }
}

/**
 * Connects to MongoDB.
 * Fails fast if connection cannot be established.
 */
async function connectDB() {
  try {
    ensureUsableDnsServers();

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
