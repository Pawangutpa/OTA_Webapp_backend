/**
 * Scheduler Manager
 * -----------------
 * Responsible for running and controlling background jobs.
 */

"use strict";

const { checkOfflineDevices } = require("../services/deviceMonitor.service");

// Store interval references for graceful shutdown
let deviceMonitorInterval = null;

// Configurable interval (default: 60 seconds)
const DEVICE_MONITOR_INTERVAL =
  Number(process.env.DEVICE_MONITOR_INTERVAL || 60) * 1000;

/**
 * Starts all background schedulers
 */
function startSchedulers() {
  if (deviceMonitorInterval) {
    console.warn("[SCHEDULER] Device monitor already running");
    return;
  }

  console.log("[SCHEDULER] Device monitor started");

  // Prevent overlapping executions
  let isRunning = false;

  deviceMonitorInterval = setInterval(async () => {
    if (isRunning) {
      console.warn("[SCHEDULER] Previous device monitor job still running");
      return;
    }

    isRunning = true;
    try {
      await checkOfflineDevices();
      console.log("[SCHEDULER] Device monitor completed");
    } catch (error) {
      console.error("[SCHEDULER] Device monitor failed:", error);
    } finally {
      isRunning = false;
    }
  }, DEVICE_MONITOR_INTERVAL);
}

/**
 * Stops all background schedulers (for graceful shutdown)
 */
function stopSchedulers() {
  if (deviceMonitorInterval) {
    clearInterval(deviceMonitorInterval);
    deviceMonitorInterval = null;
    console.log("[SCHEDULER] Device monitor stopped");
  }
}

module.exports = {
  startSchedulers,
  stopSchedulers,
};
