/**
 * Admin Routes
 * ------------
 * Restricted endpoints for administrative operations.
 * Access:
 *  - Authenticated users
 *  - Admin role only
 */

"use strict";

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const adminController = require("../controllers/admin.controller");

/* =========================
   Security: Auth + Role
   ========================= */
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

/* =========================
   Admin Endpoints
   ========================= */

/**
 * Get all users
 * GET /api/admin/users
 */
router.get("/users", adminController.getUsers);

/**
 * Get all devices
 * GET /api/admin/devices
 */
router.get("/devices", adminController.getDevices);

/**
 * Block / Unblock a user
 * POST /api/admin/user/:userId/block
 */
router.post("/user/:userId/block", adminController.toggleUserBlock);

/**
 * Block / Unblock a device
 * POST /api/admin/device/:deviceId/block
 */
router.post("/device/:deviceId/block", adminController.toggleDeviceBlock);

module.exports = router;
