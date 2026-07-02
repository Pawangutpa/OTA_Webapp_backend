/**
 * OTA Controller
 * --------------
 * Handles firmware update lifecycle for devices.
 */

"use strict";

const Device = require("../models/device.model");
const OTA = require("../models/ota.model");
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
      // Only block a genuinely recent OTA. A stuck IN_PROGRESS (e.g. the device
      // lost WiFi mid-download and never reported FAILED) becomes "stale" after
      // a threshold and can be retried.
      const STALE_MS = Number(process.env.OTA_STALE_MINUTES || 3) * 60 * 1000;
      const startedAt = device.otaStartedAt
        ? new Date(device.otaStartedAt).getTime()
        : 0;

      if (Date.now() - startedAt < STALE_MS) {
        return res.status(409).json({
          success: false,
          message: "OTA already in progress",
        });
      }

      console.warn(`[OTA] Stale in-progress OTA for ${deviceId}; allowing restart`);
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

/* =========================
   OTA CANCEL / RESET
   ========================= */

/**
 * Cancel / reset a stuck OTA.
 * POST /api/ota/:deviceId/cancel
 * Clears IN_PROGRESS so a new OTA can be started immediately (e.g. after a
 * failed download where the device could not report FAILED).
 */
async function cancelOta(req, res, next) {
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

    const prevOtaId = device.currentOtaId;

    device.otaStatus = "IDLE";
    device.targetVersion = undefined;
    device.currentOtaId = undefined;
    device.otaStartedAt = undefined;
    await device.save();

    // Mark the linked history record as FAILED (best-effort)
    if (prevOtaId) {
      await OTA.findByIdAndUpdate(prevOtaId, { status: "FAILED" }).catch(() => {});
    }

    return res.json({
      success: true,
      message: "OTA cancelled/reset",
      otaStatus: "IDLE",
    });
  } catch (error) {
    console.error("[OTA] Cancel failed:", error);
    next(error);
  }
}

module.exports = {
  checkOta,
  startOta: startOtaController,
  cancelOta,
};
