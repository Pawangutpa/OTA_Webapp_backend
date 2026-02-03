const Device = require("../models/device.model");
const { logDeviceActivity } = require("./activity.service");
const { MQTT_TOPICS } = require("../utils/constants");

/**
 * Handle HEALTH payload
 */
async function handleHealth(device, payload) {
  device.online = true;
  device.lastSeen = new Date();

  // Optional fields from firmware
  if (payload.fw) device.firmwareVersion = payload.fw;

  await device.save();

  await logDeviceActivity({
    deviceId: device.deviceId,
    action: "HEALTH_UPDATE"
  });
}

/**
 * Handle STATUS payload (LED)
 */
async function handleStatus(device, payload) {
  device.online = true;
  device.lastSeen = new Date();

  // Store LED state
  device.ledState = payload === "ON";

  await device.save();

  await logDeviceActivity({
    deviceId: device.deviceId,
    action: `LED_${payload}`
  });
}

/**
 * Handle OTA STATUS
 */
async function handleOtaStatus(device, payload) {
  device.otaStatus = payload;
  device.lastSeen = new Date();

  if (payload === "SUCCESS") {
    device.online = true;
  }

  await device.save();

  await logDeviceActivity({
    deviceId: device.deviceId,
    action: `OTA_${payload}`
  });
}

exports.processMqttMessage = async (topic, message) => {
  try {
    const parts = topic.split("/");
    if (parts.length < 3) return;

    const deviceId = parts[1];
    const subTopic = parts.slice(2).join("/");

    const device = await Device.findOne({ deviceId });

    // SECURITY: Ignore unknown / blocked devices
    if (!device || device.blocked) return;

    const payloadStr = message.toString();
    let payload;

    try {
      payload = JSON.parse(payloadStr);
    } catch {
      payload = payloadStr;
    }

    switch (subTopic) {
      case MQTT_TOPICS.HEALTH:
        await handleHealth(device, payload);
        break;

      case MQTT_TOPICS.STATUS:
        await handleStatus(device, payload);
        break;

      case MQTT_TOPICS.OTA_STATUS:
        await handleOtaStatus(device, payload);
        break;
    }
  } catch (err) {
    console.error("MQTT processing error", err.message);
  }
};
