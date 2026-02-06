const Device = require("../models/device.model");
const Activity = require("../models/activity.model");
const aclService = require("../services/acl.service");

/**
 * Set LED state (ON / OFF)
 * POST /api/device/:deviceId/led
 */
exports.setLed = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { state } = req.body; // "ON" or "OFF"

    if (!["ON", "OFF"].includes(state)) {
      return res.status(400).json({ message: "Invalid LED state" });
    }

    const device = await Device.findOne({
      deviceId: deviceId.toUpperCase(),
      owner: req.user.id
    });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (!device.online) {
      return res.status(400).json({ message: "Device is offline" });
    }

    mqtt.publish(
      `devices/${device.deviceId}/command`,
      state === "ON" ? "LED_ON" : "LED_OFF"
    );

    res.json({
      message: "LED command sent",
      state
    });

  } catch (err) {
    console.error("LED control error:", err.message);
    res.status(500).json({ message: "LED control failed" });
  }
};
/**
 * Register a new device
 * One device can belong to only one user
 */
exports.registerDevice = async (req, res) => {
  try {
    const { deviceId, name } = req.body;

    const normalizedId = deviceId.toUpperCase();

    const existing = await Device.findOne({ deviceId: normalizedId });
    if (existing) {
      return res.status(400).json({ message: "Device already registered" });
    }

    // 1️⃣ Create device in DB
    const device = await Device.create({
      deviceId: normalizedId,
      name,
      owner: req.user.id,
      firmwareVersion: "1.0.0",
      online: false,
      otaStatus: "IDLE",
      blocked: false
    });

    // 2️⃣ CREATE MQTT USER
    aclService.addMqttUser(
      `esp32_${normalizedId}`,
      normalizedId
    );

    // 3️⃣ ADD DEVICE ACL
    aclService.addDeviceAcl(normalizedId);

    // 4️⃣ Log activity
    await Activity.create({
      userId: req.user.id,
      deviceId: normalizedId,
      action: "DEVICE_REGISTERED",
      ip: req.ip
    });

    console.log("✅ Device registered + MQTT + ACL:", normalizedId);

    res.status(201).json({
      message: "Device registered successfully",
      device
    });

  } catch (err) {
    console.error("❌ Device registration failed:", err);
    res.status(500).json({ message: "Device registration failed" });
  }
};


/**
 * Get all devices of logged-in user
 */
exports.getMyDevices = async (req, res) => {
  const devices = await Device.find({ owner: req.user.id });

  res.json(devices);
};

/**
 * Get single device details (ownership enforced)
 */
exports.getDeviceById = async (req, res) => {
  const device = await Device.findOne({
    deviceId: req.params.deviceId,
    owner: req.user.id
  });

  if (!device) {
    return res.status(404).json({ message: "Device not found" });
  }

  res.json(device);
};
