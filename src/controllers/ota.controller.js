/**
 * OTA Controller
 * --------------
 * Handles firmware update lifecycle for devices.
 */

"use strict";

const Device = require("../models/device.model");
const { checkUpdate, startOta } = require("../services/ota.service");

/* =========================
   OTA CHECK
   ========================= */

/**
 * Check if OTA update is available
 * GET /api/ota/:deviceId/check
 */
async function checkOta(req, res, next) {
  try {
    const deviceId = req.params.deviceId?.trim().toUpperCase();

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Invalid deviceId",
      });
    }

    const device = await Device.findOne({
      deviceId,
      owner: req.user.id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    const result = await checkUpdate(device);

    if (!result.updateAvailable) {
      return res.json({
        success: true,
        updateAvailable: false,
        message: "Firmware is up to date",
        currentVersion: device.firmwareVersion,
      });
    }

    return res.json({
      success: true,
      updateAvailable: true,
      message: `Update available: ${result.latestVersion}`,
      latestVersion: result.latestVersion,
      currentVersion: device.firmwareVersion,
    });
  } catch (error) {
    console.error("[OTA] Check failed:", error);
    next(error);
  }
}

/* =========================
   OTA START
   ========================= */

/**
 * Start OTA update
 * POST /api/ota/:deviceId/start
 */
async function startOtaController(req, res, next) {
  try {
    const deviceId = req.params.deviceId?.trim().toUpperCase();

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Invalid deviceId",
      });
    }

    const device = await Device.findOne({
      deviceId,
      owner: req.user.id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Optional safety checks (recommended)
    if (!device.online) {
      return res.status(400).json({
        success: false,
        message: "Device is offline",
      });
    }

    if (device.otaStatus === "IN_PROGRESS") {
      return res.status(409).json({
        success: false,
        message: "OTA already in progress",
      });
    }

    const result = await startOta(device);

    return res.json({
      success: true,
      message: "OTA started",
      ...result,
    });
  } catch (error) {
    console.error("[OTA] Start failed:", error);
    next(error);
  }
}

module.exports = {
  checkOta,
  startOta: startOtaController,
};
