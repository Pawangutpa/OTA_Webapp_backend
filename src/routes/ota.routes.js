/**
 * OTA Routes
 * ----------
 * Handles Over-The-Air firmware update operations:
 *  - Check if firmware update is available
 *  - Start OTA update process
 */

"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const otaController = require("../controllers/ota.controller");

/* =========================
   OTA Endpoints
   ========================= */

/**
 * Check OTA update availability
 * GET /api/ota/:deviceId/check
 */
router.get("/:deviceId/check", authMiddleware, otaController.checkOta);

/**
 * Start OTA update
 * POST /api/ota/:deviceId/start
 */
router.post("/:deviceId/start", authMiddleware, otaController.startOta);

module.exports = router;
