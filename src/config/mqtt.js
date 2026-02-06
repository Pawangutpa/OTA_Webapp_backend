/**
 * MQTT Client (Singleton)
 * -----------------------
 * - Handles all device → backend communication
 * - Receives health, status, and OTA updates from devices
 * - Updates MongoDB device state accordingly
 *
 * IMPORTANT:
 * - This file must be imported ONCE in the entire backend
 * - Never create another mqtt.connect() anywhere else
 */

const mqtt = require("mqtt");
const Device = require("../models/device.model");
const OTA = require("../models/ota.model");

// ==========================
// CREATE MQTT CLIENT (SINGLE INSTANCE)
// ==========================
// Uses WebSocket / TCP URL from environment variables
const client = mqtt.connect(process.env.MQTT_WS_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  keepalive: 60,          // Ping broker every 60s
  reconnectPeriod: 2000   // Retry connection every 2s if disconnected
});

// ==========================
// MQTT CONNECTION EVENTS
// ==========================

/**
 * Fired when backend successfully connects to MQTT broker
 */
client.on("connect", () => {
  console.log("✅ MQTT connected (backend)");

  /**
   * Subscribe to all device → backend topics
   * + is a wildcard for deviceId
   */
  client.subscribe([
    "devices/+/health",       // Periodic heartbeat / health data
    "devices/+/status",       // Device state updates (LED, relay, etc.)
    "devices/+/ota/status"    // OTA progress or result
  ]);
});

/**
 * Fired when MQTT client is trying to reconnect
 */
client.on("reconnect", () => {
  console.log("🔄 MQTT reconnecting...");
});

/**
 * Fired on MQTT error
 */
client.on("error", (err) => {
  console.error("❌ MQTT error:", err.message);
});

// ==========================
// MAIN MESSAGE HANDLER
// ==========================

/**
 * This handler is executed for EVERY incoming MQTT message
 * that matches subscribed topics.
 */
client.on("message", async (topic, message) => {
  try {
    const payloadStr = message.toString();
    console.log(`📡 MQTT → ${topic} : ${payloadStr}`);

    // Example topic: devices/0C5D32DD2568/health
    const parts = topic.split("/");
    if (parts.length < 3) return;

    const deviceId = parts[1].toUpperCase(); // Normalize device ID
    const subTopic = parts.slice(2).join("/"); // health | status | ota/status

    // ==========================
    // SECURITY & VALIDATION
    // ==========================

    /**
     * Ignore messages from:
     * - Unknown devices
     * - Blocked devices
     */
    const device = await Device.findOne({ deviceId });
    if (!device) {
      console.warn(`⚠️ Unknown device ignored: ${deviceId}`);
      return;
    }

    if (device.blocked) {
      console.warn(`⛔ Blocked device ignored: ${deviceId}`);
      return;
    }

    // ==========================
    // HEALTH TOPIC
    // ==========================
    /**
     * Expected payload (JSON):
     * {
     *   heap: number,
     *   uptime: number,
     *   fw: "1.0.0"
     * }
     */
    if (subTopic === "health") {
      let health;
      try {
        health = JSON.parse(payloadStr);
      } catch {
        console.warn(`⚠️ Invalid health payload from ${deviceId}`);
        return;
      }

      // Mark device as alive
      device.online = true;
      device.lastSeen = new Date();

      // Optional firmware-provided fields
      if (health.fw) device.firmwareVersion = health.fw;
      if (health.heap !== undefined) device.lastHeap = health.heap;
      if (health.temp !== undefined) device.lastTemp = health.temp;

      await device.save();
      return;
    }

    // ==========================
    // STATUS TOPIC (LED / RELAY)
    // ==========================
    /**
     * Payload:
     * "ON" or "OFF"
     */
    if (subTopic === "status") {
      device.online = true;
      device.lastSeen = new Date();

      if (payloadStr === "ON" || payloadStr === "OFF") {
        device.ledState = payloadStr === "ON";
      }

      await device.save();
      return;
    }

    // ==========================
    // OTA STATUS TOPIC
    // ==========================
    /**
     * Payload examples:
     * - STARTED
     * - PROGRESS
     * - SUCCESS
     * - FAILED
     */
    if (subTopic === "ota/status") {
      device.lastSeen = new Date();
      device.otaStatus = payloadStr;

      // If OTA succeeded, finalize firmware version
      if (payloadStr === "SUCCESS" && device.targetVersion) {
        device.firmwareVersion = device.targetVersion;
      }

      await device.save();

      // Update OTA history record if exists
      if (device.currentOtaId) {
        await OTA.findByIdAndUpdate(device.currentOtaId, {
          status: payloadStr
        });
      }

      return;
    }

  } catch (err) {
    console.error("❌ MQTT message handling error:", err.message);
  }
});

// ==========================
// EXPORT MQTT CLIENT
// ==========================
/**
 * Export the SINGLE mqtt client instance
 * Import this everywhere instead of creating new clients
 */
module.exports = client;
