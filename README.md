<<<<<<< HEAD
# 🚀 IoT Device Management & OTA Backend

A **production-ready IoT backend** for managing ESP32 devices with authentication, MQTT communication, OTA updates, admin controls, audit logging, and dashboards.

This backend is designed for **real-world deployment**, scalability, and security.

---

## 📌 Features

- 🔐 JWT-based Authentication (User & Admin)
- 📟 Device Registration & Control (LED, status)
- 📡 MQTT Device Communication (Mosquitto)
- 🔄 OTA Firmware Update System
- 🧠 Device Health Monitoring & Offline Detection
- 🧾 Audit & Activity Logging
- 🛡️ Role-Based Access Control (RBAC)
- ☁️ AWS S3 Firmware Storage (Signed URLs)
- ⚙️ Scheduler for Background Jobs
- 🧩 Modular, industry-grade architecture

---

## 🏗️ Tech Stack

- **Backend:** Node.js + Express  
- **Database:** MongoDB (Mongoose)  
- **MQTT Broker:** Mosquitto  
- **Authentication:** JWT  
- **OTA Storage:** AWS S3  
- **Scheduler:** Node timers  
- **Platform:** Linux (Production), Windows / Mac (Development)

---
  

## 📂 Project Structure

 - src/
 - ├── app.js
 - ├── server.js
 - ├── config/
 - │   ├── db.js
 - │   ├── mqtt.js
 - │   ├── s3.js
 - ├── models/
 - │   ├── user.model.js
 - │   ├── device.model.js
 - │   ├── ota.model.js
 - │   └── activity.model.js
 - ├── controllers/
 - ├── routes/
 - ├── services/
 - ├── middleware/
 - └── utils/



## 🔐 Authentication APIs

### ➤ Register User


POST /api/auth/register


**Body**

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}


## ➤ Login User
POST /api/auth/login


# Body

{
  "email": "test@example.com",
  "password": "123456"
}

# Response

{
  "token": "JWT_TOKEN"
}


# Use this token in all protected requests:

Authorization: Bearer JWT_TOKEN

## 📟 Device APIs

# ➤ Register Device
POST /api/device/register

{
  "deviceId": "0C5D32DD2568",
  "name": "Living Room ESP32"
}

# ➤ Get My Devices
GET /api/device

# ➤ Control LED
POST /api/device/:deviceId/led

{
  "state": "ON"
}

## 📡 MQTT Topics
# 🔼 Device → Backend
Topic	Purpose
devices/{deviceId}/health	Heartbeat
devices/{deviceId}/status	LED / relay state
devices/{deviceId}/ota/status	OTA progress

# Health Payload

{
  "heap": 20000,
  "uptime": 120,
  "fw": "1.0.0"
}

## 🔽 Backend → Device
# Topic	Purpose
devices/{deviceId}/command	LED commands
devices/{deviceId}/ota	OTA instructions
## 🔄 OTA (Over-The-Air Update)
# ➤ Check OTA
GET /api/ota/:deviceId/check


# Response

{
  "updateAvailable": true,
  "latestVersion": "1.1.0"
}

# ➤ Start OTA
POST /api/ota/:deviceId/start


## Device OTA Status Flow

STARTED → IN_PROGRESS → SUCCESS / FAILED

## ☁️ AWS S3 Structure
 -iot-firmware-bucket/
 -└── esp32s3/
 -    ├── production/
 -    │   ├── firmware.bin        # Latest stable firmware
 -    │   ├── version.txt         # Current production version
 -    │   └── metadata.json       # Firmware metadata (size, checksum, build)
 -    │
 -    ├── releases/
 -    │   ├── v1.0.0/
 -    │   │   ├── firmware.bin
 -    │   │   └── metadata.json
 -    │   │
 -    │   ├── v1.1.0/
 -    │   │   ├── firmware.bin
 -    │   │   └── metadata.json
 -    │   │
 -    │   └── v1.2.0/
 -    │       ├── firmware.bin
 -    │       └── metadata.json
 -    │
 -    └── rollback/
 -        └── blocked_versions.json

## 📊 Dashboard API
GET /api/dashboard


# Returns:

Device list

Online / Offline status

Firmware version

OTA status

## 🛡️ Admin APIs (Admin Only)
# ➤ Get Users
GET /api/admin/users

# ➤ Get Devices
GET /api/admin/devices

# ➤ Block / Unblock User
POST /api/admin/user/:userId/block

# ➤ Block / Unblock Device
POST /api/admin/device/:deviceId/block

## 🧾 Activity Logging

# Automatically logs:

Device registration

Device block / unblock

OTA events

## Admin actions

Stored in the Activity collection.

## ⚙️ Environment Variables
PORT=3000
MONGO_URI=mongodb://localhost:27017/iot
JWT_SECRET=supersecret

MQTT_WS_URL=mqtt://localhost:1883
MQTT_USER=backend
MQTT_PASS=password

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=XXXX
AWS_SECRET_ACCESS_KEY=XXXX
S3_BUCKET=your-bucket-name

NODE_ENV=production

## 🧪 How to Test (Step-by-Step)
# 1️⃣ Start Services
mongod
mosquitto
node server.js

# 2️⃣ Register User & Login

Use Postman or curl.

# 3️⃣ Register Device
{
  "deviceId": "ABC123",
  "name": "Test ESP32"
}

# 4️⃣ Simulate Device Heartbeat
mosquitto_pub \
-t devices/ABC123/health \
-m '{"heap":18000,"fw":"1.0.0"}'

# 5️⃣ Test LED Control
- mosquitto_sub -t devices/ABC123/command


- Then call:

- POST /api/device/ABC123/led

# 6️⃣ Test OTA

- Update version.txt in S3

- Call /api/ota/:deviceId/check

- Call /api/ota/:deviceId/start

- Publish OTA status from device

## 🚀 Production Notes

- Uses singleton MQTT client

- Uses graceful shutdown

- Uses secure Mosquitto ACL

- Ready for Docker / PM2 / Kubernetes

## 🏁 Final Notes

- This backend is:

✅ Production-ready

✅ Secure

✅ Scalable

✅ IoT-grade

Built with real-world architecture, not demo code.

### 📬 Author

- Pawan Gupta
- Email
pawan246g@gmail.com
=======
# 🚀 IoT Device Management & OTA Backend

A **production-ready IoT backend** for managing ESP32 devices with authentication, MQTT communication, OTA updates, admin controls, audit logging, and dashboards.

This backend is designed for **real-world deployment**, scalability, and security.

---

## 📌 Features

- 🔐 JWT-based Authentication (User & Admin)
- 📟 Device Registration & Control (LED, status)
- 📡 MQTT Device Communication (Mosquitto)
- 🔄 OTA Firmware Update System
- 🧠 Device Health Monitoring & Offline Detection
- 🧾 Audit & Activity Logging
- 🛡️ Role-Based Access Control (RBAC)
- ☁️ AWS S3 Firmware Storage (Signed URLs)
- ⚙️ Scheduler for Background Jobs
- 🧩 Modular, industry-grade architecture

---

## 🏗️ Tech Stack

- **Backend:** Node.js + Express  
- **Database:** MongoDB (Mongoose)  
- **MQTT Broker:** Mosquitto  
- **Authentication:** JWT  
- **OTA Storage:** AWS S3  
- **Scheduler:** Node timers  
- **Platform:** Linux (Production), Windows / Mac (Development)

---
  

## 📂 Project Structure

 ---
src/
├── app.js
├── server.js
├── config/
│   ├── db.js
│   ├── mqtt.js
│   ├── s3.js
├── models/
│   ├── user.model.js
│   ├── device.model.js
│   ├── ota.model.js
│   └── activity.model.js
├── controllers/
├── routes/
├── services/
├── middleware/
└── utils/



## 🔐 Authentication APIs

### ➤ Register User


POST /api/auth/register


**Body**

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}


## ➤ Login User
POST /api/auth/login


# Body

{
  "email": "test@example.com",
  "password": "123456"
}

# Response

{
  "token": "JWT_TOKEN"
}


# Use this token in all protected requests:

Authorization: Bearer JWT_TOKEN

## 📟 Device APIs

# ➤ Register Device
POST /api/device/register

{
  "deviceId": "0C5D32DD2568",
  "name": "Living Room ESP32"
}

# ➤ Get My Devices
GET /api/device

# ➤ Control LED
POST /api/device/:deviceId/led

{
  "state": "ON"
}

## 📡 MQTT Topics
# 🔼 Device → Backend
Topic	Purpose
devices/{deviceId}/health	Heartbeat
devices/{deviceId}/status	LED / relay state
devices/{deviceId}/ota/status	OTA progress

# Health Payload

{
  "heap": 20000,
  "uptime": 120,
  "fw": "1.0.0"
}

## 🔽 Backend → Device
# Topic	Purpose
devices/{deviceId}/command	LED commands
devices/{deviceId}/ota	OTA instructions
## 🔄 OTA (Over-The-Air Update)
# ➤ Check OTA
GET /api/ota/:deviceId/check


# Response

{
  "updateAvailable": true,
  "latestVersion": "1.1.0"
}

# ➤ Start OTA
POST /api/ota/:deviceId/start


## Device OTA Status Flow

STARTED → IN_PROGRESS → SUCCESS / FAILED

## ☁️ AWS S3 Structure
s3://your-bucket/
 └── esp32s3/
     ├── production/
     │   ├── firmware.bin
     │   └── version.txt
     └── rollback/
         └── blocked_versions.json


version.txt

1.1.0

## 📊 Dashboard API
GET /api/dashboard


# Returns:

Device list

Online / Offline status

Firmware version

OTA status

## 🛡️ Admin APIs (Admin Only)
# ➤ Get Users
GET /api/admin/users

# ➤ Get Devices
GET /api/admin/devices

# ➤ Block / Unblock User
POST /api/admin/user/:userId/block

# ➤ Block / Unblock Device
POST /api/admin/device/:deviceId/block

## 🧾 Activity Logging

# Automatically logs:

Device registration

Device block / unblock

OTA events

## Admin actions

Stored in the Activity collection.

## ⚙️ Environment Variables
PORT=3000
MONGO_URI=mongodb://localhost:27017/iot
JWT_SECRET=supersecret

MQTT_WS_URL=mqtt://localhost:1883
MQTT_USER=backend
MQTT_PASS=password

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=XXXX
AWS_SECRET_ACCESS_KEY=XXXX
S3_BUCKET=your-bucket-name

NODE_ENV=production

## 🧪 How to Test (Step-by-Step)
# 1️⃣ Start Services
mongod
mosquitto
node server.js

# 2️⃣ Register User & Login

Use Postman or curl.

# 3️⃣ Register Device
{
  "deviceId": "ABC123",
  "name": "Test ESP32"
}

# 4️⃣ Simulate Device Heartbeat
mosquitto_pub \
-t devices/ABC123/health \
-m '{"heap":18000,"fw":"1.0.0"}'

# 5️⃣ Test LED Control
mosquitto_sub -t devices/ABC123/command


Then call:

POST /api/device/ABC123/led

# 6️⃣ Test OTA

Update version.txt in S3

Call /api/ota/:deviceId/check

Call /api/ota/:deviceId/start

Publish OTA status from device

## 🚀 Production Notes

Uses singleton MQTT client

Uses graceful shutdown

Uses secure Mosquitto ACL

Ready for Docker / PM2 / Kubernetes

## 🏁 Final Notes

This backend is:

✅ Production-ready

✅ Secure

✅ Scalable

✅ IoT-grade

Built with real-world architecture, not demo code.

### 📬 Author

Pawan Gupta
pawan246g@gmail.com
>>>>>>> 1cdbff8 (hashing in model update)
