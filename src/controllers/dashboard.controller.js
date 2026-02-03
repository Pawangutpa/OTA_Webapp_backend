const Device = require("../models/device.model");

exports.getDashboard = async (req, res) => {
  const devices = await Device.find({ owner: req.user.id });
  res.json(devices);
};
