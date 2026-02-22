/**
 * Mosquitto ACL & User Management Service
 * ---------------------------------------
 * Handles MQTT users and ACL rules for devices.
 *
 * ⚠️ SECURITY CRITICAL:
 * - Runs privileged commands
 * - Must be executed ONLY on backend server
 */

"use strict";

const { execFile } = require("child_process");

/* =========================
   ENV FLAG
   ========================= */

const ACL_ENABLED = process.env.ACL_ENABLED === "true";

const PASSWD_FILE = "/etc/mosquitto/passwd";
const ACL_FILE = "/etc/mosquitto/acl/aclfile";

console.log("[ACL] ENABLED =", ACL_ENABLED);

/* =========================
   UTILS
   ========================= */

function validateIdentifier(value, label) {
  if (!/^[A-Z0-9_-]+$/i.test(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
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

async function addMqttUser(username, password) {
  if (!ACL_ENABLED) {
    console.log("[ACL] Skipped (ACL_ENABLED=false)");
    return;
  }

  validateIdentifier(username, "username");

  await execSafe("sudo", [
    "mosquitto_passwd",
    "-b",
    PASSWD_FILE,
    username,
    password,
  ]);

  console.log("[ACL] MQTT user added:", username);
}

async function removeMqttUser(username) {
  if (!ACL_ENABLED) {
    console.log("[ACL] Skipped (ACL_ENABLED=false)");
    return;
  }

  validateIdentifier(username, "username");

  await execSafe("sudo", [
    "mosquitto_passwd",
    "-D",
    PASSWD_FILE,
    username,
  ]);

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

async function addDeviceAcl(deviceId) {
  if (!ACL_ENABLED) {
    console.log("[ACL] Skipped (ACL_ENABLED=false)");
    return;
  }

  validateIdentifier(deviceId, "deviceId");

  const aclBlock = buildDeviceAcl(deviceId)
    .replace(/"/g, '\\"')
    .replace(/\$/g, "\\$");

  await execSafe("sudo", [
    "bash",
    "-c",
    `echo "${aclBlock}" >> ${ACL_FILE}`,
  ]);

  console.log("[ACL] Device ACL added:", deviceId);

  await reloadMosquitto();
}

async function removeDeviceAcl(deviceId) {
  if (!ACL_ENABLED) {
    console.log("[ACL] Skipped (ACL_ENABLED=false)");
    return;
  }

  validateIdentifier(deviceId, "deviceId");

  const sedExpr = `/# DEVICE ${deviceId}/,/topic read  devices\\/${deviceId}\\/ota/d`;

  await execSafe("sudo", [
    "sed",
    "-i",
    sedExpr,
    ACL_FILE,
  ]);

  console.log("[ACL] Device ACL removed:", deviceId);

  await reloadMosquitto();
}

/* =========================
   MOSQUITTO CONTROL
   ========================= */

async function reloadMosquitto() {
  if (!ACL_ENABLED) return;

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