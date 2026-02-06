const Device = require("../models/device.model");
const { checkUpdate, startOta } = require("../services/ota.service");

/**
 * GET /api/ota/:deviceId/check
 */
exports.checkOta = async (req, res) => {
  const device = await Device.findOne({
    deviceId: req.params.deviceId.toUpperCase(),
    owner: req.user.id
  });

  if (!device) {
    return res.status(404).json({ message: "Device not found" });
  }

  const result = await checkUpdate(device);

  if (!result.updateAvailable) {
    return res.json({
      updateAvailable: false,
      message: "Firmware is up to date",
      currentVersion: device.firmwareVersion
    });
  }

  res.json({
    updateAvailable: true,
    message: `Update available: ${result.latestVersion}`,
    latestVersion: result.latestVersion,
    currentVersion: device.firmwareVersion
  });
};



/**
 * POST /api/ota/:deviceId/start
 */
exports.startOta = async (req, res) => {
  const device = await Device.findOne({
    deviceId: req.params.deviceId,
    owner: req.user.id
  });

  if (!device) {
    return res.status(404).json({ message: "Device not found" });
  }

  try {
    const result = await startOta(device);
    res.json({ message: "OTA started", ...result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
