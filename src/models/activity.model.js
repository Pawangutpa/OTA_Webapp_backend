/**
 * Activity Model
 * --------------
 * Stores audit logs for user, device, and admin actions.
 */

"use strict";

const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    // User who performed the action (optional for system events)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // Target device (if applicable)
    deviceId: {
      type: String,
      index: true,
      uppercase: true,
      trim: true,
    },

    // Action performed
    action: {
      type: String,
      required: true,
      enum: [
        "DEVICE_REGISTERED",
        "DEVICE_BLOCKED",
        "DEVICE_UNBLOCKED",
        "DEVICE_OFFLINE",
        "LED_ON",
        "LED_OFF",
        "OTA_STARTED",
        "OTA_PROGRESS",
        "OTA_SUCCESS",
        "OTA_FAILED",
        "USER_BLOCKED",
        "USER_UNBLOCKED",
      ],
      index: true,
    },

    // IP address of requester (admin / user)
    ip: {
      type: String,
      trim: true,
    },

    // Optional metadata for future use
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   Indexes
   ========================= */

// Fast lookups for dashboards & audits
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ deviceId: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", ActivitySchema);
