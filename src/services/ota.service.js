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

  const latestVersion = await getProductionVersion();
  const firmwareUrl = await getSignedFirmwareUrl();

  // Create the OTA history record first so we can link it to the device.
  // Without this link the MQTT handler can't update the record's status,
  // leaving it stuck at "STARTED".
  const otaRecord = await OTA.create({
    deviceId: device.deviceId,
    deviceRef: device._id,
    fromVersion: device.firmwareVersion,
    toVersion: latestVersion,
    status: "STARTED"
  });

  device.otaStatus = "IN_PROGRESS";
  device.targetVersion = latestVersion;
  device.currentOtaId = otaRecord._id;
  device.otaStartedAt = new Date();
  await device.save();

  mqtt.publish(
    `devices/${device.deviceId}/ota`,
    firmwareUrl
  );

  return { firmwareUrl };
};

