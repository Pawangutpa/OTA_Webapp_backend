const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const ctrl = require("../controllers/admin.controller");

router.use(auth);
router.use(role("admin"));

router.get("/users", ctrl.getUsers);
router.get("/devices", ctrl.getDevices);
router.post("/user/:userId/block", ctrl.toggleUserBlock);
router.post("/device/:deviceId/block", ctrl.toggleDeviceBlock);

module.exports = router;
