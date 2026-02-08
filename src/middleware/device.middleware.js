/**
 * Device Guard Middleware
 * -----------------------
 * Loads device by deviceId, checks block status,
 * and attaches device to request object.
 *
 * Usage:
 *   router.use("/:deviceId", deviceGuard());
 *   router.use("/:deviceId", deviceGuard({ checkOwner: true }));
 */

"use strict";

const Device = require("../models/device.model");

/**
 * @param {Object} options
 * @param {boolean} options.checkOwner - enforce ownership check
 */
function deviceGuard(options = {}) {
  const { checkOwner = false } = options;

  return async (req, res, next) => {
    try {
      const rawDeviceId = req.params.deviceId;

      if (!rawDeviceId) {
        return res.status(400).json({
          success: false,
          message: "deviceId is required",
        });
      }

      const deviceId = rawDeviceId.toUpperCase();

      const query = { deviceId };

      // Optional ownership enforcement
      if (checkOwner) {
        if (!req.user || !req.user.id) {
          return res.status(401).json({
            success: false,
            message: "Unauthorized",
          });
        }
        query.owner = req.user.id;
      }

      const device = await Device.findOne(query);

      if (!device) {
        return res.status(404).json({
          success: false,
          message: "Device not found",
        });
      }

      if (device.blocked) {
        return res.status(403).json({
          success: false,
          message: "Device is blocked",
        });
      }

      // Attach device to request for downstream handlers
      req.device = device;

      next();
    } catch (error) {
      console.error("[DEVICE-GUARD] Error:", error);
      next(error);
    }
  };
}

module.exports = deviceGuard;
