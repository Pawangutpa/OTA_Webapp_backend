/**
 * Device Monitor Service
 * ----------------------
 * Responsible for detecting inactive devices
 * and marking them offline based on last heartbeat.
 */

"use strict";

const Device = require("../models/device.model");

// Offline threshold (default: 60 seconds)
const OFFLINE_THRESHOLD_MS =
  Number(process.env.DEVICE_OFFLINE_THRESHOLD || 60) * 1000;

/**
 * Checks online devices and marks inactive ones as offline.
 *
 * @returns {Object} summary of operation
 */
async function checkOfflineDevices() {
  const now = Date.now();

  console.log(`[DEVICE-MONITOR] Running at ${new Date(now).toISOString()}`);

  try {
    // Fetch only required fields (performance optimization)
    const devices = await Device.find(
      {
        online: true,
        lastSeen: { $exists: true },
      },
      {
        deviceId: 1,
        lastSeen: 1,
      },
    ).lean();

    if (!devices.length) {
      console.log("[DEVICE-MONITOR] No online devices found");
      return { checked: 0, markedOffline: 0 };
    }

    const offlineDeviceIds = [];

    for (const device of devices) {
      const lastSeenTime = new Date(device.lastSeen).getTime();

      if (now - lastSeenTime > OFFLINE_THRESHOLD_MS) {
        offlineDeviceIds.push(device.deviceId);
      }
    }

    // Bulk update instead of individual saves
    if (offlineDeviceIds.length > 0) {
      await Device.updateMany(
        { deviceId: { $in: offlineDeviceIds } },
        {
          $set: {
            online: false,
            offlineAt: new Date(),
          },
        },
      );

      console.log(
        `[DEVICE-MONITOR] Marked ${offlineDeviceIds.length} device(s) OFFLINE`,
      );
    }

    return {
      checked: devices.length,
      markedOffline: offlineDeviceIds.length,
    };
  } catch (error) {
    console.error("[DEVICE-MONITOR] Failed to check offline devices:", error);
    throw error; // let scheduler decide what to do
  }
}

module.exports = {
  checkOfflineDevices,
};
