const mongoose = require("mongoose");

module.exports = mongoose.model("Activity", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  deviceId: String,
  action: String,
  ip: String
}, { timestamps: true }));
