/**
 * Express Application Setup
 * -------------------------
 * Responsibilities:
 *  - Initialize Express app
 *  - Register global middlewares
 *  - Register routes
 *  - Handle errors & unknown routes
 */

"use strict";

const express = require("express");
const cors = require("cors");

const app = express();

/* =========================
   Global Middlewares
   ========================= */

// Enable CORS (configurable for production)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Parse JSON with size limit (security)
app.use(express.json({ limit: "1mb" }));

// Basic request logger (replace with Winston later)
app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

/* =========================
   Routes
   ========================= */

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/device", require("./routes/device.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/ota", require("./routes/ota.routes"));

/* =========================
   404 Handler
   ========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   Global Error Handler
   ========================= */
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
