// const mqtt = require("mqtt");
// const Device = require("../models/device.model");
// const OTA = require("../models/ota.model");

// // ==========================
// // CREATE MQTT CLIENT (SINGLETON)
// // ==========================
// const client = mqtt.connect(process.env.MQTT_WS_URL, {
//   username: process.env.MQTT_USER,
//   password: process.env.MQTT_PASS,
//   keepalive: 60,
//   reconnectPeriod: 2000
// });

// // ==========================
// // CONNECTION EVENTS
// // ==========================
// client.on("connect", () => {
//   console.log("✅ MQTT connected (backend)");

//   // Subscribe only to device → backend topics
//   client.subscribe("devices/+/health");
//   client.subscribe("devices/+/status");
//   client.subscribe("devices/+/ota/status");
// });

// client.on("reconnect", () => {
//   console.log("🔄 MQTT reconnecting...");
// });

// client.on("error", (err) => {
//   console.error("❌ MQTT error:", err.message);
// });

// // ==========================
// // MESSAGE HANDLER
// // ==========================
// client.on("message", async (topic, message) => {
//   try {
//     const payloadStr = message.toString();
//     console.log(`📡 MQTT → ${topic} : ${payloadStr}`);

//     const parts = topic.split("/");
//     if (parts.length < 3) return;

//     const deviceId = parts[1];
//     const subTopic = parts.slice(2).join("/");

//     // --------------------------
//     // SECURITY CHECK
//     // --------------------------
//     const device = await Device.findOne({ deviceId });
//     if (!device) {
//       console.warn(`⚠️ Unknown device ignored: ${deviceId}`);
//       return;
//     }

//     if (device.blocked) {
//       console.warn(`⛔ Blocked device ignored: ${deviceId}`);
//       return;
//     }

//     // --------------------------
//     // HEALTH (JSON payload)
//     // --------------------------
//     if (subTopic === "health") {
//       let health;
//       try {
//         health = JSON.parse(payloadStr);
//       } catch {
//         console.warn(`⚠️ Invalid health payload from ${deviceId}`);
//         return;
//       }

//       device.online = true;
//       device.lastSeen = new Date();

//       // Optional fields from firmware
//       if (health.fw) device.firmwareVersion = health.fw;
//       if (health.temp !== undefined) device.lastTemp = health.temp;
//       if (health.heap !== undefined) device.lastHeap = health.heap;

//       await device.save();
//       return;
//     }

//     // --------------------------
//     // STATUS (LED ON / OFF)
//     // --------------------------
//     if (subTopic === "status") {
//       device.lastSeen = new Date();
//       device.online = true;

//       if (payloadStr === "ON" || payloadStr === "OFF") {
//         device.ledState = payloadStr === "ON";
//       }

//       await device.save();
//       return;
//     }

//     // --------------------------
//     // OTA STATUS (SUCCESS / FAILED)
//     // --------------------------
//     if (subTopic === "ota/status") {
//       device.lastSeen = new Date();

//       device.otaStatus = payloadStr;

//       if (payloadStr === "SUCCESS") {
//         // Firmware successfully updated
//         if (device.targetVersion) {
//           device.firmwareVersion = device.targetVersion;
//         }
//       }

//       await device.save();

//       // Update OTA history safely
//       if (device.currentOtaId) {
//         await OTA.findByIdAndUpdate(device.currentOtaId, {
//           status: payloadStr
//         });
//       }

//       return;
//     }

//   } catch (err) {
//     console.error("❌ MQTT message handling error:", err.message);
//   }
// });

// // ==========================
// // EXPORT CLIENT
// // ==========================
// module.exports = client;

// config/mqtt.js
const mqtt = require("mqtt");
const Device = require("../models/device.model");
const OTA = require("../models/ota.model");

const client = mqtt.connect(process.env.MQTT_WS_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  keepalive: 60,
  reconnectPeriod: 2000,
});

client.on("connect", () => {
  console.log("✅ MQTT connected (backend)");
  client.subscribe("devices/+/health");
  client.subscribe("devices/+/status");
  client.subscribe("devices/+/ota/status");
});

client.on("message", async (topic, message) => {
  try {
    const payloadStr = message.toString();
    const [, deviceId, subTopic] = topic.split("/");

    const device = await Device.findOne({ deviceId });
    if (!device || device.blocked) return;

    if (subTopic === "health") {
      const health = JSON.parse(payloadStr);
      device.online = true;
      device.lastSeen = new Date();
      if (health.fw) device.firmwareVersion = health.fw;
      await device.save();
    }

    if (subTopic === "status") {
      device.ledState = payloadStr === "ON";
      device.lastSeen = new Date();
      device.online = true;
      await device.save();
    }

    if (subTopic === "ota") {
      device.otaStatus = payloadStr;
      await device.save();
    }
  } catch (err) {
    console.error("❌ MQTT handler error:", err.message);
  }
});

module.exports = client;
