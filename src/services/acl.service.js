/**
 * Mosquitto ACL & User Management Service
 * --------------------------------------
 * Handles MQTT users and ACL rules for devices.
 *
 * ⚠️ SECURITY CRITICAL:
 * - Runs privileged commands
 * - Must be executed ONLY on backend server
 */

"use strict";

const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

/* =========================
   ENV & PLATFORM CHECK
   ========================= */

// Explicit prod flag is safer than OS check
const IS_PROD = process.env.NODE_ENV === "production";

const PASSWD_FILE = "/etc/mosquitto/passwd";
const ACL_FILE = "/etc/mosquitto/acl/aclfile";

console.log("[ACL] PROD =", IS_PROD, "NODE_ENV =", process.env.NODE_ENV);

/* =========================
   UTILS
   ========================= */

function validateIdentifier(value, label) {
  if (!/^[A-Z0-9_-]+$/i.test(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function fileExistsOrThrow(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required file not found: ${filePath}`);
  }
}

function execSafe(command, args = []) {
  return new Promise((resolve, reject) => {
    execFile(command, args, (err, stdout, stderr) => {
      if (err) {
        return reject(stderr || err.message);
      }
      resolve(stdout);
    });
  });
}

/* =========================
   MQTT USER MANAGEMENT
   ========================= */

/**
 * Add or update MQTT user
 */
async function addMqttUser(username, password) {
  if (!IS_PROD) {
    console.log("[ACL][DEV] Skipping MQTT user add");
    return;
  }

  validateIdentifier(username, "username");
  fileExistsOrThrow(PASSWD_FILE);

  await execSafe("sudo", [
    "mosquitto_passwd",
    "-b",
    PASSWD_FILE,
    username,
    password,
  ]);

  console.log("[ACL] MQTT user added:", username);
}

/**
 * Remove MQTT user
 */
async function removeMqttUser(username) {
  if (!IS_PROD) {
    console.log("[ACL][DEV] Skipping MQTT user removal");
    return;
  }

  validateIdentifier(username, "username");
  fileExistsOrThrow(PASSWD_FILE);

  await execSafe("sudo", ["mosquitto_passwd", "-D", PASSWD_FILE, username]);

  console.log("[ACL] MQTT user removed:", username);
}

/* =========================
   DEVICE ACL MANAGEMENT
   ========================= */

function buildDeviceAcl(deviceId) {
  return `
# DEVICE ${deviceId}
user esp32_${deviceId}
topic write devices/${deviceId}/status
topic write devices/${deviceId}/health
topic write devices/${deviceId}/ota/status
topic read  devices/${deviceId}/command
topic read  devices/${deviceId}/ota
`;
}

/**
 * Add ACL rules for device
 */
async function addDeviceAcl(deviceId) {
  if (!IS_PROD) {
    console.log("[ACL][DEV] Skipping ACL add");
    return;
  }

  validateIdentifier(deviceId, "deviceId");
  fileExistsOrThrow(ACL_FILE);

  const aclBlock = buildDeviceAcl(deviceId);

  fs.appendFileSync(ACL_FILE, aclBlock);

  console.log("[ACL] Device ACL added:", deviceId);

  await reloadMosquitto();
}

/**
 * Remove ACL rules for device
 */
async function removeDeviceAcl(deviceId) {
  if (!IS_PROD) {
    console.log("[ACL][DEV] Skipping ACL remove");
    return;
  }

  validateIdentifier(deviceId, "deviceId");
  fileExistsOrThrow(ACL_FILE);

  const sedExpr = `/# DEVICE ${deviceId}/,/topic read  devices\\/${deviceId}\\/ota/d`;

  await execSafe("sudo", ["sed", "-i", sedExpr, ACL_FILE]);

  console.log("[ACL] Device ACL removed:", deviceId);

  await reloadMosquitto();
}

/* =========================
   MOSQUITTO CONTROL
   ========================= */

async function reloadMosquitto() {
  if (!IS_PROD) return;

  await execSafe("sudo", ["systemctl", "reload", "mosquitto"]);
  console.log("[ACL] Mosquitto reloaded");
}

/* =========================
   EXPORTS
   ========================= */

module.exports = {
  addMqttUser,
  removeMqttUser,
  addDeviceAcl,
  removeDeviceAcl,
  reloadMosquitto,
};
