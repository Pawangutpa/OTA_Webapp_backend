/**
 * Dashboard Controller
 * --------------------
 * Provides summarized data for user dashboard.
 */

"use strict";

const Device = require("../models/device.model");

/**
 * Get dashboard data for authenticated user
 * GET /api/dashboard
 */
async function getDashboard(req, res, next) {
  try {
    const devices = await Device.find(
      { owner: req.user.id },
      {
        deviceId: 1,
        name: 1,
        online: 1,
        firmwareVersion: 1,
        otaStatus: 1,
        lastSeen: 1,
        blocked: 1,
      },
    )
      .sort({ createdAt: -1 }) // newest first
      .lean();

    return res.json({
      success: true,
      count: devices.length,
      devices,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
};
