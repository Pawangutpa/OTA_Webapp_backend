const { checkOfflineDevices } = require("../services/deviceMonitor.service");

/**
 * Runs background jobs
 */
exports.startSchedulers = () => {
  console.log("⏱️ Device monitor scheduler started");

  // Run every 10 seconds
  setInterval(async () => {
    try {
      await checkOfflineDevices();
    } catch (err) {
      console.error("Scheduler error:", err.message);
    }
  }, 10 * 1000);
};
