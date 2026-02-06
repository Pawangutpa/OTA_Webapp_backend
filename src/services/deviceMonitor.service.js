const Device = require("../models/device.model");

const OFFLINE_THRESHOLD_MS = 60 * 1000; // 30 seconds

/**
 * Marks devices offline if no heartbeat received
 */
exports.checkOfflineDevices = async () => {
  const now = Date.now();

  const devices = await Device.find({
    online: true,
    lastSeen: { $exists: true }
  });

  for (const device of devices) {
    const lastSeenTime = new Date(device.lastSeen).getTime();

    if (now - lastSeenTime > OFFLINE_THRESHOLD_MS) {
      device.online = false;
      await device.save();

      console.log(
        `🔴 Device ${device.deviceId} marked OFFLINE (lastSeen ${device.lastSeen})`
      );
    }
  }
};
