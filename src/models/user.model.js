/**
 * User Model
 * ----------
 * Represents an authenticated platform user.
 */

"use strict";

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    /* =========================
       Identity
       ========================= */
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    /* =========================
       Authentication
       ========================= */
    passwordHash: {
      type: String,
      required: true,
      select: false, // never return password hash by default
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    blocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   Indexes
   ========================= */

// Login & admin queries
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, blocked: 1 });

module.exports = mongoose.model("User", UserSchema);
