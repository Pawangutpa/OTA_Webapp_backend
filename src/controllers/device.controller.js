const Device = require("../models/device.model");
const Activity = require("../models/activity.model");

/**
 * Register a new device
 * One device can belong to only one user
 */
exports.registerDevice = async (req, res) => {
  const { deviceId, name } = req.body;

  // Normalize device ID (MAC without colon)
  const normalizedId = deviceId.toUpperCase();

  const existing = await Device.findOne({ deviceId: normalizedId });
  if (existing) {
    return res.status(400).json({ message: "Device already registered" });
  }

  const device = await Device.create({
    deviceId: normalizedId,
    name,
    owner: req.user.id,
    firmwareVersion: "1.0.0",
    online: false,
    otaStatus: "IDLE"
  });

  await Activity.create({
    userId: req.user.id,
    deviceId: normalizedId,
    action: "DEVICE_REGISTERED",
    ip: req.ip
  });

  res.status(201).json({
    message: "Device registered successfully",
    device
  });
};

/**
 * Get all devices of logged-in user
 */
exports.getMyDevices = async (req, res) => {
  const devices = await Device.find({ owner: req.user.id });

  res.json(devices);
};

/**
 * Get single device details (ownership enforced)
 */
exports.getDeviceById = async (req, res) => {
  const device = await Device.findOne({
    deviceId: req.params.deviceId,
    owner: req.user.id
  });

  if (!device) {
    return res.status(404).json({ message: "Device not found" });
  }

  res.json(device);
};
