const mongoose = require("mongoose");

module.exports = mongoose.model("OTA", new mongoose.Schema({
  deviceId: String,
  fromVersion: String,
  toVersion: String,
  status: String,
  reason: String
}, { timestamps: true }));
