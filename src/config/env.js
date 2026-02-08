/**
 * Load environment variables from .env file
 * This must be the very first import in the application
 */
require("dotenv").config();

/**
 * List of required environment variables
 * Add/remove keys here as your system grows
 */
const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "JWT_SECRET",
  "MQTT_WS_URL",
  "MQTT_USER",
  "MQTT_PASS",
  "S3_BUCKET",
  "AWS_REGION"
];

/**
 * Find missing environment variables
 */
const missingVars = REQUIRED_ENV_VARS.filter(
  (key) => !process.env[key]
);

/**
 * Fail fast if any required env variable is missing
 * This prevents the app from running in a broken state
 */
if (missingVars.length > 0) {
  console.error("[ENV] Missing required environment variables:");
  missingVars.forEach((key) => console.error(`   - ${key}`));
  process.exit(1);
}

console.log("[ENV] All required environment variables loaded");
