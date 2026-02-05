const { exec } = require("child_process");
const fs = require("fs");

const IS_PROD = process.platform === "linux";

const PASSWD_FILE = "/etc/mosquitto/passwd";
const ACL_FILE = "/etc/mosquitto/acl/aclfile";

/**
 * =========================
 * ADD / UPDATE MQTT USER
 * =========================
 */
exports.addMqttUser = (username, password) => {
  if (!IS_PROD) {
    console.log("[DEV] Skipping mosquitto_passwd add");
    return;
  }

  exec(
    `sudo mosquitto_passwd -b ${PASSWD_FILE} ${username} ${password}`,
    (err) => {
      if (err) {
        console.error("❌ MQTT user add failed:", err.message);
      } else {
        console.log("✅ MQTT user added:", username);
      }
    }
  );
};

/**
 * =========================
 * REMOVE MQTT USER
 * =========================
 */
exports.removeMqttUser = (username) => {
  if (!IS_PROD) {
    console.log("[DEV] Skipping mosquitto_passwd delete");
    return;
  }

  exec(
    `sudo mosquitto_passwd -D ${PASSWD_FILE} ${username}`,
    (err) => {
      if (err) {
        console.error("❌ MQTT user delete failed:", err.message);
      } else {
        console.log("✅ MQTT user removed:", username);
      }
    }
  );
};

/**
 * =========================
 * ADD DEVICE ACL
 * =========================
 */
exports.addDeviceAcl = (deviceId) => {
  if (!IS_PROD) {
    console.log("[DEV] Skipping ACL add");
    return;
  }

  const aclBlock = `
# DEVICE ${deviceId}
user esp32_${deviceId}
topic write devices/${deviceId}/status
topic write devices/${deviceId}/health
topic write devices/${deviceId}/ota/status
topic read  devices/${deviceId}/command
topic read  devices/${deviceId}/ota
`;

  exec(
    `echo "${aclBlock.replace(/"/g, '\\"')}" | sudo tee -a ${ACL_FILE}`,
    (err) => {
      if (err) {
        console.error("❌ ACL write failed:", err.message);
        return;
      }
      console.log("✅ ACL added for device:", deviceId);
      exports.reloadMosquitto();
    }
  );
};

/**
 * =========================
 * REMOVE DEVICE ACL
 * =========================
 */
exports.removeDeviceAcl = (deviceId) => {
  if (!IS_PROD) {
    console.log("[DEV] Skipping ACL remove");
    return;
  }

  exec(
    `sudo sed -i '/# DEVICE ${deviceId}/,/topic read  devices\\/${deviceId}\\/ota/d' ${ACL_FILE}`,
    (err) => {
      if (err) {
        console.error("❌ ACL remove failed:", err.message);
        return;
      }
      console.log("✅ ACL removed for device:", deviceId);
      exports.reloadMosquitto();
    }
  );
};

/**
 * =========================
 * RELOAD MOSQUITTO
 * =========================
 */
exports.reloadMosquitto = () => {
  if (!IS_PROD) return;

  exec("sudo systemctl reload mosquitto", (err) => {
    if (err) {
      console.error("❌ Mosquitto reload failed:", err.message);
    } else {
      console.log("🔄 Mosquitto reloaded");
    }
  });
};
