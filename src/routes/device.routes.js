const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const Device = require("../models/device.model");

router.post("/register", auth, async (req, res) => {
  if (await Device.findOne({ deviceId: req.body.deviceId }))
    return res.status(400).json({ message: "Device exists" });

  const device = await Device.create({
    ...req.body,
    owner: req.user.id,
    firmwareVersion: "1.0.0"
  });

  res.json(device);
});

router.get("/", auth, async (req, res) => {
  res.json(await Device.find({ owner: req.user.id }));
});

module.exports = router;
