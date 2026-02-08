/**
 * Global Error Handling Middleware
 * --------------------------------
 * Catches all unhandled errors and sends a safe response to clients.
 */

"use strict";

module.exports = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;

  // Log full error details (server-side only)
  console.error("[ERROR]", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Client-safe error response
  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : err.message || "Request failed",
  });
};
