const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, unique: true },
  name: String,

  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Device state
  online: { type: Boolean, default: false },
  lastSeen: Date,
  ledState: Boolean,

  // Firmware / OTA
  firmwareVersion: String,
  targetVersion: String,        // version being installed
  otaStatus: String,
  currentOtaId: mongoose.Schema.Types.ObjectId,

  // Health
  lastTemp: Number,
  lastHeap: Number,

  blocked: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model("Device", deviceSchema);
