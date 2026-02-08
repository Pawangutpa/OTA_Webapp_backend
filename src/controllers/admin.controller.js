/**
 * Admin Controller
 * ----------------
 * Restricted administrative operations.
 */

"use strict";

const User = require("../models/user.model");
const Device = require("../models/device.model");
const { logDeviceActivity } = require("../services/activity.service");
const aclService = require("../services/acl.service");

/* =========================
   GET USERS
   ========================= */

/**
 * GET /api/admin/users
 */
async function getUsers(req, res, next) {
  try {
    const limit = Number(req.query.limit || 50);
    const page = Number(req.query.page || 1);
    const skip = (page - 1) * limit;

    const users = await User.find(
      {},
      { passwordHash: 0 } // never expose password hashes
    )
      .limit(limit)
      .skip(skip)
      .lean();

    return res.json({
      success: true,
      page,
      limit,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
}

/* =========================
   GET DEVICES
   ========================= */

/**
 * GET /api/admin/devices
 */
async function getDevices(req, res, next) {
  try {
    const limit = Number(req.query.limit || 50);
    const page = Number(req.query.page || 1);
    const skip = (page - 1) * limit;

    const devices = await Device.find()
      .populate("owner", "email username")
      .limit(limit)
      .skip(skip)
      .lean();

    return res.json({
      success: true,
      page,
      limit,
      count: devices.length,
      devices,
    });
  } catch (error) {
    next(error);
  }
}

/* =========================
   BLOCK / UNBLOCK USER
   ========================= */

/**
 * POST /api/admin/user/:userId/block
 */
async function toggleUserBlock(req, res, next) {
  try {
    const { userId } = req.params;

    // Prevent admin from blocking themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.blocked = !user.blocked;
    await user.save();

    console.log(
      `[ADMIN] User ${user._id} ${user.blocked ? "BLOCKED" : "UNBLOCKED"} by ${req.user.id}`
    );

    return res.json({
      success: true,
      blocked: user.blocked,
    });
  } catch (error) {
    next(error);
  }
}

/* =========================
   BLOCK / UNBLOCK DEVICE
   ========================= */

/**
 * POST /api/admin/device/:deviceId/block
 */
async function toggleDeviceBlock(req, res, next) {
  try {
    const deviceId = req.params.deviceId.toUpperCase();

    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    device.blocked = !device.blocked;
    await device.save();

    // Revoke MQTT access if blocked
    if (device.blocked) {
      await aclService.removeMqttUser(`esp32_${device.deviceId}`);
      await aclService.removeDeviceAcl(device.deviceId);
    }

    await logDeviceActivity({
      deviceId: device.deviceId,
      action: device.blocked
        ? "DEVICE_BLOCKED"
        : "DEVICE_UNBLOCKED",
      performedBy: req.user.id,
    });

    console.log(
      `[ADMIN] Device ${device.deviceId} ${device.blocked ? "BLOCKED" : "UNBLOCKED"} by ${req.user.id}`
    );

    return res.json({
      success: true,
      blocked: device.blocked,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getDevices,
  toggleUserBlock,
  toggleDeviceBlock,
};
