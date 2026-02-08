/**
 * Authentication Controller
 * -------------------------
 * Handles user registration and login.
 */

"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/* =========================
   Register New User
   ========================= */
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // Basic input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    // Check if user already exists
    const exists = await User.findOne({
      $or: [{ email }, { username }],
    }).lean();

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      username,
      email,
      passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    next(error); // forward to global error handler
  }
}

/* =========================
   Login User
   ========================= */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    // Avoid user enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.blocked) {
      return res.status(403).json({
        success: false,
        message: "User is blocked",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Issue JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};
