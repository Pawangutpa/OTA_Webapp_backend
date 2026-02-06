const express = require("express");
const cors = require("cors");
require("./config/mqtt");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/device", require("./routes/device.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/ota", require("./routes/ota.routes"));


module.exports = app;
