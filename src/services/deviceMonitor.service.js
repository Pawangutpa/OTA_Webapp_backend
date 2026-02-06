const Device = require("../models/device.model");

const OFFLINE_THRESHOLD_MS = 60 * 1000; // 60 seconds

/**
 * Marks devices offline if no heartbeat received
 */
exports.checkOfflineDevices = async () => {
  const now = Date.now();

  console.log("⏱️ Scheduler running at", new Date(now).toISOString());

  const devices = await Device.find({
    online: true,
    lastSeen: { $exists: true }
  });

  console.log(`🔍 Checking ${devices.length} online devices`);

  for (const device of devices) {
    const lastSeenTime = new Date(device.lastSeen).getTime();
    const diff = now - lastSeenTime;

    console.log(
      `📟 Device ${device.deviceId} lastSeen ${diff} ms ago`
    );

    if (diff > OFFLINE_THRESHOLD_MS) {
      device.online = false;
      await device.save();

      console.log(
        `🔴 Device ${device.deviceId} marked OFFLINE`
      );
    }
  }
};
