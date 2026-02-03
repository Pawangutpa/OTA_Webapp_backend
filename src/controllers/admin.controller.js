const User = require("../models/user.model");
const Device = require("../models/device.model");
const { logDeviceActivity } = require("../services/activity.service");
const acl = require("../services/acl.service");

/**
 * GET /api/admin/users
 */
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

/**
 * GET /api/admin/devices
 */
exports.getDevices = async (req, res) => {
  const devices = await Device.find().populate("owner", "email username");
  res.json(devices);
};

/**
 * BLOCK / UNBLOCK USER
 */
exports.toggleUserBlock = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.blocked = !user.blocked;
  await user.save();

  res.json({ blocked: user.blocked });
};

/**
 * BLOCK / UNBLOCK DEVICE
 */
exports.toggleDeviceBlock = async (req, res) => {
  const device = await Device.findOne({ deviceId: req.params.deviceId });
  if (!device) return res.status(404).json({ message: "Device not found" });

  device.blocked = !device.blocked;
  await device.save();

  // Revoke MQTT access if blocked
  if (device.blocked) {
    acl.removeMqttUser(`esp32_${device.deviceId}`);
    acl.removeDeviceAcl(device.deviceId);
  }

  await logDeviceActivity({
    deviceId: device.deviceId,
    action: device.blocked ? "DEVICE_BLOCKED" : "DEVICE_UNBLOCKED"
  });

  res.json({ blocked: device.blocked });
};
