const Device = require("../models/device.model");
const { checkUpdate, startOta } = require("../services/ota.service");

/**
 * GET /api/ota/:deviceId/check
 */
exports.checkOta = async (req, res) => {
  try {
    

    // ✅ DEFINE deviceId PROPERLY
    const deviceId = req.params.deviceId.trim().toUpperCase();

   

    const device = await Device.findOne({
      deviceId: deviceId,
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

    return res.json({
      updateAvailable: true,
      message: `Update available: ${result.latestVersion}`,
      latestVersion: result.latestVersion,
      currentVersion: device.firmwareVersion
    });

  } catch (err) {
    console.error("❌ OTA check error:", err);
    res.status(500).json({ message: "OTA check failed" });
  }
};




/**
 * POST /api/ota/:deviceId/start
 */
exports.startOta = async (req, res) => {
  try {
    const deviceId = req.params.deviceId.trim().toUpperCase();

   

    const device = await Device.findOne({
      deviceId: deviceId,
      owner: req.user.id
    });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const result = await startOta(device);
    res.json({ message: "OTA started", ...result });

  } catch (err) {
    console.error("❌ OTA start error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

