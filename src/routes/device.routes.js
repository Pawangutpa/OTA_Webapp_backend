const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const deviceController = require("../controllers/device.controller");

router.post("/register", auth, deviceController.registerDevice);
router.get("/", auth, deviceController.getMyDevices);
router.get("/:deviceId", auth, deviceController.getDeviceById);


router.post("/:deviceId/led", auth, deviceController.setLed);

module.exports = router;
