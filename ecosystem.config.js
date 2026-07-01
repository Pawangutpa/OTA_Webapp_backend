module.exports = {
  apps: [
    {
      name: "iot-backend",
      script: "src/server.js",
      cwd: __dirname,

      // IMPORTANT: keep a SINGLE instance (fork mode).
      // The app opens one singleton MQTT client and runs a setInterval
      // scheduler; cluster mode (-i > 1) would duplicate both and cause
      // repeated MQTT handling and offline-check jobs against the same DB.
      instances: 1,
      exec_mode: "fork",

      // Reliability
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "300M",

      // Give bootstrap()'s graceful shutdown time to close Mongo + server
      kill_timeout: 8000,

      // Environment (secrets stay in .env on the server, loaded by dotenv)
      env: {
        NODE_ENV: "production",
      },

      // Logs (paths are gitignored via logs/ and *.log)
      error_file: "logs/iot-backend.error.log",
      out_file: "logs/iot-backend.out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
