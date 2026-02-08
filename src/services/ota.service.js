const Device = require("../models/device.model");
const OTA = require("../models/ota.model");
const mqtt = require("../config/mqtt");
const { getBlockedVersions } = require("./s3.service");
const { getProductionVersion, getSignedFirmwareUrl } = require("./s3.service");
const { isNewerVersion } = require("../utils/version.util");

/**
 * Check OTA availability
 */
exports.checkUpdate = async (device) => {
  const latestVersion = await getProductionVersion();

  if (!isNewerVersion(device.firmwareVersion, latestVersion)) {
    return { updateAvailable: false };
  }

  return {
    updateAvailable: true,
    latestVersion
  };
};

/**
 * Start OTA update
 */
exports.startOta = async (device) => {
  if (!device.online) {
    throw new Error("Device offline");
  }

  if (device.otaStatus === "IN_PROGRESS") {
    throw new Error("OTA already running");
  }

  const latestVersion = await getProductionVersion();
  const firmwareUrl = await getSignedFirmwareUrl();

  device.otaStatus = "IN_PROGRESS";
  device.targetVersion = latestVersion; 
  await device.save();

  await OTA.create({
    deviceId: device.deviceId,
    fromVersion: device.firmwareVersion,
    toVersion: latestVersion,
    status: "STARTED"
  });

  mqtt.publish(
    `devices/${device.deviceId}/ota`,
    firmwareUrl
  );

  return { firmwareUrl };
};

