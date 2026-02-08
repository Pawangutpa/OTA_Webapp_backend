/**
 * Activity Service
 * ----------------
 * Centralized audit logging for user, device, and system actions.
 *
 * IMPORTANT:
 * - Must NEVER throw (logging must not break main flow)
 */

"use strict";

const Activity = require("../models/activity.model");

/**
 * Log an activity event.
 *
 * @param {Object} params
 * @param {string} params.action        - Action performed (enum)
 * @param {string} [params.deviceId]    - Target device ID
 * @param {string} [params.userId]      - User who performed the action
 * @param {string} [params.ip]          - Request IP
 * @param {Object} [params.meta]        - Optional metadata
 */
async function logDeviceActivity({ action, deviceId, userId, ip, meta }) {
  try {
    if (!action) {
      console.warn("[ACTIVITY] Missing action, skipping log");
      return;
    }

    await Activity.create({
      action,
      deviceId,
      userId,
      ip,
      meta,
    });
  } catch (error) {
    // Logging must NEVER crash the request
    console.error("[ACTIVITY] Log failed:", {
      action,
      deviceId,
      error: error.message,
    });
  }
}

module.exports = {
  logDeviceActivity,
};
