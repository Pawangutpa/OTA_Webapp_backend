const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "user" },
  blocked: { type: Boolean, default: false },
  lastLogin: Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
