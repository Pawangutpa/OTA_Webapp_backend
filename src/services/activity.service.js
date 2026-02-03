const Activity = require("../models/activity.model");

/**
 * Log user/device activity
 */
exports.logDeviceActivity = async ({
  deviceId,
  action
}) => {
  try {
    await Activity.create({
      deviceId,
      action
    });
  } catch (err) {
    console.error("Activity log failed", err.message);
  }
};
