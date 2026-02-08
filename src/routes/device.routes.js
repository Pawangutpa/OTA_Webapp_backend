/**
 * Device Routes
 * -------------
 * Handles authenticated device operations:
 *  - Register device
 *  - Fetch user devices
 *  - Fetch single device
 *  - Control device features (LED, etc.)
 */

"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const deviceController = require("../controllers/device.controller");

/* =========================
   Device Management
   ========================= */

/**
 * Register a new device to authenticated user
 * POST /api/device/register
 */
router.post("/register", authMiddleware, deviceController.registerDevice);

/**
 * Get all devices owned by authenticated user
 * GET /api/device
 */
router.get("/", authMiddleware, deviceController.getMyDevices);

/**
 * Get single device by deviceId
 * GET /api/device/:deviceId
 */
router.get("/:deviceId", authMiddleware, deviceController.getDeviceById);

/* =========================
   Device Actions
   ========================= */

/**
 * Control device LED
 * POST /api/device/:deviceId/led
 */
router.post("/:deviceId/led", authMiddleware, deviceController.setLed);

module.exports = router;
