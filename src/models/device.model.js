/**
 * Device Model
 * ------------
 * Represents a physical IoT device registered to a user.
 */

"use strict";

const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema(
  {
    /* =========================
       Identity
       ========================= */
    deviceId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =========================
       Device State
       ========================= */
    online: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastSeen: {
      type: Date,
      index: true,
    },

    ledState: {
      type: Boolean,
      default: false,
    },

    blocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =========================
       Firmware / OTA
       ========================= */
    firmwareVersion: {
      type: String,
      default: "1.0.0",
    },

    targetVersion: {
      type: String,
    },

    otaStatus: {
      type: String,
      enum: ["IDLE", "IN_PROGRESS", "SUCCESS", "FAILED"],
      default: "IDLE",
      index: true,
    },

    currentOtaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OTA",
    },

    /* =========================
       Health Metrics
       ========================= */
    lastTemp: {
      type: Number,
    },

    lastHeap: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================
   Indexes
   ========================= */

// Fast dashboard queries
DeviceSchema.index({ owner: 1, createdAt: -1 });

// Offline device detection
DeviceSchema.index({ online: 1, lastSeen: 1 });

// OTA monitoring
DeviceSchema.index({ otaStatus: 1 });

module.exports = mongoose.model("Device", DeviceSchema);
