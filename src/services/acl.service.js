const fs = require("fs");
const { exec } = require("child_process");

const IS_PROD = process.platform === "linux";

const PASSWD_FILE = "/etc/mosquitto/passwd";
const ACL_FILE = "/etc/mosquitto/acl/aclfile";

/**
 * Add or update MQTT user password
 */
exports.addMqttUser = (username, password) => {
  if (!IS_PROD) {
    console.log("[DEV] Skipping mosquitto_passwd");
    return;
  }

  exec(
    `mosquitto_passwd -b ${PASSWD_FILE} ${username} ${password}`,
    (err) => {
      if (err) console.error("MQTT user add failed", err.message);
    }
  );
};

/**
 * Remove MQTT user
 */
exports.removeMqttUser = (username) => {
  if (!IS_PROD) return;

  exec(
    `mosquitto_passwd -D ${PASSWD_FILE} ${username}`,
    (err) => {
      if (err) console.error("MQTT user delete failed", err.message);
    }
  );
};

/**
 * Add device ACL
 */
exports.addDeviceAcl = (deviceId) => {
  if (!IS_PROD) return;

  const aclBlock = `
# DEVICE ${deviceId}
user esp32_${deviceId}
topic write devices/${deviceId}/status
topic write devices/${deviceId}/health
topic write devices/${deviceId}/ota/status
topic read  devices/${deviceId}/command
topic read  devices/${deviceId}/ota
`;

  fs.appendFileSync(ACL_FILE, aclBlock);
  exports.reloadMosquitto();
};

/**
 * Remove device ACL
 */
exports.removeDeviceAcl = (deviceId) => {
  if (!IS_PROD) return;

  let acl = fs.readFileSync(ACL_FILE, "utf8");
  const regex = new RegExp(`# DEVICE ${deviceId}[\\s\\S]*?ota\\n`, "g");
  acl = acl.replace(regex, "");
  fs.writeFileSync(ACL_FILE, acl);

  exports.reloadMosquitto();
};

/**
 * Reload Mosquitto ACL
 */
exports.reloadMosquitto = () => {
  exec("systemctl reload mosquitto", (err) => {
    if (err) console.error("Mosquitto reload failed", err.message);
  });
};
