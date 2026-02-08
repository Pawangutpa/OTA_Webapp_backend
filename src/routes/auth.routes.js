/**
 * Authentication Routes
 * ---------------------
 * Handles user authentication:
 *  - User registration
 *  - User login
 */

"use strict";

const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

/* =========================
   Auth Endpoints
   ========================= */

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post("/register", authController.register);

/**
 * Authenticate user and issue JWT
 * POST /api/auth/login
 */
router.post("/login", authController.login);

module.exports = router;
