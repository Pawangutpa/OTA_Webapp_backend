/**
 * Firmware Service
 * ----------------
 * Handles firmware metadata and secure download URLs from S3.
 */

"use strict";

const s3 = require("../config/s3");

/* =========================
   ENV VALIDATION
   ========================= */
const REQUIRED_ENVS = ["S3_BUCKET"];
REQUIRED_ENVS.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`[FIRMWARE] Missing env variable: ${key}`);
  }
});

/* =========================
   CONSTANTS
   ========================= */
const BUCKET = process.env.S3_BUCKET;

const PATHS = {
  VERSION: "esp32s3/production/version.txt",
  FIRMWARE: "esp32s3/production/firmware.bin",
  BLOCKED: "esp32s3/rollback/blocked_versions.json",
};

const SIGNED_URL_TTL = Number(process.env.FIRMWARE_URL_TTL || 300); // seconds

/* =========================
   SIMPLE IN-MEMORY CACHE
   ========================= */
let cachedVersion = null;
let cachedBlockedVersions = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

function isCacheValid() {
  return Date.now() - cacheTime < CACHE_TTL;
}

/* =========================
   READ PRODUCTION VERSION
   ========================= */
async function getProductionVersion() {
  try {
    if (cachedVersion && isCacheValid()) {
      return cachedVersion;
    }

    const data = await s3
      .getObject({
        Bucket: BUCKET,
        Key: PATHS.VERSION,
      })
      .promise();

    cachedVersion = data.Body.toString().trim();
    cacheTime = Date.now();

    return cachedVersion;
  } catch (error) {
    console.error(
      "[FIRMWARE] Failed to read production version:",
      error.message,
    );
    throw new Error("Unable to read firmware version");
  }
}

/* =========================
   SIGNED FIRMWARE URL
   ========================= */
async function getSignedFirmwareUrl() {
  try {
    return s3.getSignedUrl("getObject", {
      Bucket: BUCKET,
      Key: PATHS.FIRMWARE,
      Expires: SIGNED_URL_TTL,
    });
  } catch (error) {
    console.error("[FIRMWARE] Failed to generate signed URL:", error.message);
    throw new Error("Unable to generate firmware URL");
  }
}

/* =========================
   BLOCKED VERSIONS
   ========================= */
async function getBlockedVersions() {
  try {
    if (cachedBlockedVersions && isCacheValid()) {
      return cachedBlockedVersions;
    }

    const data = await s3
      .getObject({
        Bucket: BUCKET,
        Key: PATHS.BLOCKED,
      })
      .promise();

    const parsed = JSON.parse(data.Body.toString());
    cachedBlockedVersions = parsed.blocked_versions || [];
    cacheTime = Date.now();

    return cachedBlockedVersions;
  } catch (error) {
    // Missing file is acceptable → no blocked versions
    console.warn("[FIRMWARE] No blocked versions file found");
    return [];
  }
}

module.exports = {
  getProductionVersion,
  getSignedFirmwareUrl,
  getBlockedVersions,
};
