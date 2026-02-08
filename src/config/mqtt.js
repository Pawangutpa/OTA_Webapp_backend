/**
 * MQTT Client (Singleton)
 * -----------------------
 * Handles all device → backend communication.
 *
 * IMPORTANT:
 * - Must be imported ONLY once (server bootstrap)
 * - Never create mqtt.connect() elsewhere
 */

"use strict";

const mqtt = require("mqtt");
const Device = require("../models/device.model");
const OTA = require("../models/ota.model");

/* =========================
   ENV VALIDATION
   ========================= */
const REQUIRED_ENVS = ["MQTT_WS_URL", "MQTT_USER", "MQTT_PASS"];
REQUIRED_ENVS.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[MQTT CONFIG ERROR] Missing ${key}`);
    process.exit(1);
  }
});

/* =========================
   MQTT CLIENT (SINGLETON)
   ========================= */
const client = mqtt.connect(process.env.MQTT_WS_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  keepalive: 60,
  reconnectPeriod: 2000,
  clean: true,
});

/* =========================
   CONNECTION EVENTS
   ========================= */
client.on("connect", () => {
  console.log("[MQTT] Connected");

  client.subscribe([
    "devices/+/health",
    "devices/+/status",
    "devices/+/ota/status",
  ]);
});

client.on("reconnect", () => {
  console.warn("[MQTT] Reconnecting...");
});

client.on("error", (err) => {
  console.error("[MQTT] Error:", err.message);
});

/* =========================
   MESSAGE HANDLER
   ========================= */
client.on("message", async (topic, message) => {
  const payload = message.toString();

  try {
    // Topic validation
    const parts = topic.split("/");
    if (parts.length < 3 || parts[0] !== "devices") return;

    const deviceId = parts[1].toUpperCase();
    const subTopic = parts.slice(2).join("/");

    // Fetch device (lean for speed)
    const device = await Device.findOne({ deviceId });
    if (!device || device.blocked) return;

    // Mark device online
    const now = new Date();
    device.online = true;
    device.lastSeen = now;

    /* =========================
       HEALTH
       ========================= */
    if (subTopic === "health") {
      let health;
      try {
        health = JSON.parse(payload);
      } catch {
        console.warn(`[MQTT] Invalid health payload from ${deviceId}`);
        return;
      }

      if (health.fw) device.firmwareVersion = health.fw;
      if (health.heap !== undefined) device.lastHeap = health.heap;
      if (health.temp !== undefined) device.lastTemp = health.temp;

      await device.save();
      return;
    }

    /* =========================
       STATUS
       ========================= */
    if (subTopic === "status") {
      if (payload === "ON" || payload === "OFF") {
        device.ledState = payload === "ON";
      }

      await device.save();
      return;
    }

    /* =========================
       OTA STATUS
       ========================= */
    if (subTopic === "ota/status") {
      device.otaStatus = payload;

      if (payload === "SUCCESS" && device.targetVersion) {
        device.firmwareVersion = device.targetVersion;
      }

      await device.save();

      if (device.currentOtaId) {
        await OTA.findByIdAndUpdate(device.currentOtaId, {
          status: payload,
          updatedAt: now,
        });
      }

      return;
    }
  } catch (err) {
    console.error("[MQTT] Message handler error:", err.message);
  }
});

/* =========================
   EXPORT CLIENT
   ========================= */
module.exports = client;
