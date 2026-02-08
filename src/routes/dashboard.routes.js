/**
 * Dashboard Routes
 * ----------------
 * Provides dashboard data for authenticated users.
 */

"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

/* =========================
   Dashboard Endpoint
   ========================= */

/**
 * Get dashboard data
 * GET /api/dashboard
 */
router.get(
  "/",
  authMiddleware,
  dashboardController.getDashboard
);

module.exports = router;
