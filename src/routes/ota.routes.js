const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/ota.controller");

router.get("/:deviceId/check", auth, controller.checkOta);
router.post("/:deviceId/start", auth, controller.startOta);

module.exports = router;
