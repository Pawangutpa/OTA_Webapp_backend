const Device = require("../models/device.model");

module.exports = async (req, res, next) => {
  const device = await Device.findOne({
    deviceId: req.params.deviceId.toUpperCase()
  });

  if (!device) {
    return res.status(404).json({ message: "Device not found" });
  }

  if (device.blocked) {
    return res.status(403).json({ message: "Device is blocked" });
  }

  req.device = device;
  next();
};
