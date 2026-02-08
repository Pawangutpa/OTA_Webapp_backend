/**
 * Device Controller
 * -----------------
 * Handles device lifecycle and device actions.
 */

"use strict";

const Device = require("../models/device.model");
const Activity = require("../models/activity.model");
const aclService = require("../services/acl.service");
const mqtt = require("../config/mqtt");

/* =========================
   Device Actions
   ========================= */

/**
 * Control device LED
 * POST /api/device/:deviceId/led
 */
async function setLed(req, res, next) {
  try {
    const { deviceId } = req.params;
    const { state } = req.body;

    if (!["ON", "OFF"].includes(state)) {
      return res.status(400).json({
        success: false,
        message: "Invalid LED state",
      });
    }

    const device = await Device.findOne({
      deviceId: deviceId.toUpperCase(),
      owner: req.user.id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    if (!device.online) {
      return res.status(400).json({
        success: false,
        message: "Device is offline",
      });
    }

    // Publish MQTT command
    mqtt.publish(
      `devices/${device.deviceId}/command`,
      state === "ON" ? "LED_ON" : "LED_OFF",
    );

    return res.json({
      success: true,
      message: "LED command sent",
      state,
    });
  } catch (error) {
    console.error("[DEVICE] LED control failed:", error);
    next(error);
  }
}

/* =========================
   Device Registration
   ========================= */

/**
 * Register a new device
 * One device can belong to only one user
 */
async function registerDevice(req, res, next) {
  try {
    const { deviceId, name } = req.body;

    if (!deviceId || !name) {
      return res.status(400).json({
        success: false,
        message: "deviceId and name are required",
      });
    }

    const normalizedId = deviceId.toUpperCase();

    const existing = await Device.findOne({ deviceId: normalizedId }).lean();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Device already registered",
      });
    }

    // 1️⃣ Create device in DB
    const device = await Device.create({
      deviceId: normalizedId,
      name,
      owner: req.user.id,
      firmwareVersion: "1.0.0",
      online: false,
      otaStatus: "IDLE",
      blocked: false,
    });

    // 2️⃣ Create MQTT user
    await aclService.addMqttUser(`esp32_${normalizedId}`, normalizedId);

    // 3️⃣ Add MQTT ACL
    await aclService.addDeviceAcl(normalizedId);

    // 4️⃣ Log activity
    await Activity.create({
      userId: req.user.id,
      deviceId: normalizedId,
      action: "DEVICE_REGISTERED",
      ip: req.ip,
    });

    console.log("[DEVICE] Registered:", normalizedId);

    return res.status(201).json({
      success: true,
      message: "Device registered successfully",
      device,
    });
  } catch (error) {
    console.error("[DEVICE] Registration failed:", error);
    next(error);
  }
}

/* =========================
   Device Queries
   ========================= */

/**
 * Get all devices of authenticated user
 */
async function getMyDevices(req, res, next) {
  try {
    const devices = await Device.find({ owner: req.user.id }).lean();

    return res.json({
      success: true,
      devices,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single device (ownership enforced)
 */
async function getDeviceById(req, res, next) {
  try {
    const device = await Device.findOne({
      deviceId: req.params.deviceId.toUpperCase(),
      owner: req.user.id,
    }).lean();

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    return res.json({
      success: true,
      device,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  setLed,
  registerDevice,
  getMyDevices,
  getDeviceById,
};
