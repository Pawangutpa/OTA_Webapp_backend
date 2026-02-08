/**
 * OTA Model
 * ---------
 * Stores firmware update history per device.
 */

"use strict";

const mongoose = require("mongoose");

const OTASchema = new mongoose.Schema(
  {
    /* =========================
       Device Info
       ========================= */
    deviceId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    deviceRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      index: true,
    },

    /* =========================
       Firmware Versions
       ========================= */
    fromVersion: {
      type: String,
      required: true,
    },

    toVersion: {
      type: String,
      required: true,
    },

    /* =========================
       OTA Status
       ========================= */
    status: {
      type: String,
      enum: [
        "QUEUED",
        "STARTED",
        "IN_PROGRESS",
        "SUCCESS",
        "FAILED",
      ],
      default: "QUEUED",
      index: true,
    },

    /* =========================
       Failure / Metadata
       ========================= */
    reason: {
      type: String,
      trim: true,
    },

    progress: {
      type: Number, // 0–100
      min: 0,
      max: 100,
    },

    /* =========================
       Audit Info
       ========================= */
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   Indexes
   ========================= */

// Latest OTA per device
OTASchema.index({ deviceId: 1, createdAt: -1 });

// Monitor running / failed OTAs
OTASchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("OTA", OTASchema);
