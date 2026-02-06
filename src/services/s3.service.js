const s3 = require("../config/s3");

/**
 * Read version.txt from S3
 */
exports.getProductionVersion = async () => {
  const data = await s3.getObject({
    Bucket: process.env.S3_BUCKET,
    Key: "esp32s3/production/version.txt"
  }).promise();

  return data.Body.toString().trim();
};

/**
 * Generate signed URL for firmware.bin
 */
exports.getSignedFirmwareUrl = async () => {
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.S3_BUCKET,
    Key: "esp32s3/production/firmware.bin",
    Expires: 300   // 5 minutes
  });
};

exports.getBlockedVersions = async () => {
  try {
    const data = await s3.getObject({
      Bucket: process.env.S3_BUCKET,
      Key: "esp32s3/rollback/blocked_versions.json"
    }).promise();

    return JSON.parse(data.Body.toString()).blocked_versions || [];
  } catch {
    return [];
  }
};
