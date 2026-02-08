/**
 * Authentication Middleware
 * -------------------------
 * Verifies JWT access token and attaches user payload to request.
 */

"use strict";

const jwt = require("jsonwebtoken");

/**
 * Protects routes by validating JWT token.
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Header must exist
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    // Format: Bearer <token>
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    // Handle token-specific errors
    const message =
      error.name === "TokenExpiredError"
        ? "Token expired"
        : "Unauthorized";

    return res.status(401).json({
      success: false,
      message,
    });
  }
}

module.exports = authMiddleware;
