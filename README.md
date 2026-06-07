# POS Updater Server

A NestJS API for managing POS/PDV executable updates. It authenticates devices, exposes version-check and download endpoints, tracks which device downloaded which version, and exports update history to Google Sheets asynchronously.

## 🏗️ Architecture

This server is the backend for a desktop POS updater client. The client authenticates with company credentials and a device ID, checks whether its executable is outdated, downloads the correct executable from a configured folder, and reports the installed version back to the server.

* **API:** NestJS + TypeScript REST API
* **Database:** MongoDB via Mongoose
* **Cache:** Nest cache-manager for user and version lookups
* **Queue:** BullMQ backed by Redis for Google Sheets export jobs
* **Security:** JWT access tokens, random refresh tokens, bcrypt hashing, Passport JWT guard
* **Files:** Local/network folder containing per-CNPJ executable files
* **Docs:** Swagger/OpenAPI at `/api-docs` outside production
* **Logging:** Winston console logs plus daily rotating JSON file logs

### Main Flow

1. A company/user is created with `POST /user`.
2. A POS device signs in with credentials, `deviceId`, `deviceName`, and `exeType`.
3. The server returns an access token and refresh token.
4. The POS client calls `GET /updates/check` with a bearer token.
5. The server checks optional forced-update metadata from `force.json`; otherwise it reads the Windows executable version from disk.
6. The POS client downloads the executable with `GET /updates/download` when needed.
7. After installation, the client calls `POST /updates/save`.
8. The server upserts the device update record in MongoDB and queues a Google Sheets export job.

## 🚀 Getting Started

### Prerequisites

* Node.js 20+ recommended
* npm
* MongoDB
* Redis
* Google service-account credentials file named `credentials.json`
* A folder containing the POS executable files grouped by CNPJ

### Running Locally

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Place `credentials.json` in the project root if Google Sheets export is enabled.
4. Make sure MongoDB and Redis are running.
5. Start the API:

```bash
npm run start:dev
```

By default, the API listens on port `3000`.

### Docker Compose

```bash
docker compose up --build
```

The compose file starts the API container and mounts `.env` plus `credentials.json`. It does not start MongoDB or Redis, so `MONGO_URI`, `REDIS_HOST`, and `REDIS_PORT` must point to services reachable from inside the container.

### Docker Build

```bash
docker build -f dockerfile -t pos-updater-server .
docker run --rm -p 3000:3000 --env-file .env pos-updater-server
```

## 📁 Update File Layout

The update service resolves executable files from this structure:

```text
{FOLDER_PATH}/
  {cnpj}/
    PdvFX.exe
    DotMart.exe
    force.json
```

`force.json` is optional. When present and matching the authenticated executable type, it overrides the normal version check response.

Example:

```json
{
  "force": true,
  "cnpj": "35109230000178",
  "exeType": "PdvFX",
  "version": "3.0.0.56"
}
```

Valid `exeType` values are `PdvFX` and `DotMart`.

## 📡 API

Swagger is available at `GET /api-docs` when `NODE_ENV` is not `production`.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/user` | No | Creates a company/user with CNPJ and password. |
| `POST` | `/auth/local/signin` | No | Authenticates a device and returns access/refresh tokens. |
| `POST` | `/auth/refresh` | No | Refreshes an access token using a stored refresh token. |
| `POST` | `/auth/logout` | Bearer | Deletes the stored refresh token for the current device. |
| `GET` | `/updates/check` | Bearer | Returns the target executable version or forced-update data. |
| `GET` | `/updates/download` | Bearer | Streams the latest executable for the authenticated CNPJ and executable type. |
| `POST` | `/updates/save` | Bearer | Saves the downloaded version and queues a Google Sheets export. |

### Sign In

`POST /auth/local/signin`

```json
{
  "name": "name_of_the_company",
  "password": "User_password_123",
  "deviceName": "POS01",
  "deviceId": "MAC-A1-B2-C3-D4",
  "exeType": "PdvFX"
}
```

Response:

```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "random-refresh-token"
}
```

### Refresh Token

`POST /auth/refresh`

```json
{
  "deviceId": "MAC-A1-B2-C3-D4",
  "refreshToken": "random-refresh-token",
  "exeType": "PdvFX"
}
```

### Save Download

`POST /updates/save`

```json
{
  "deviceName": "POS01",
  "version": "3.0.0.52"
}
```

## 🔐 Security

* Passwords and refresh tokens are hashed with bcrypt.
* Access tokens expire after 15 minutes.
* Access tokens include user ID, device ID, company name, CNPJ, and executable type.
* Refresh tokens are stored per `deviceId`, so token refresh is tied to the device identity supplied by the client.
* Protected routes use the Passport JWT strategy.
* A global throttling guard limits requests to 10 per 60 seconds.

## 🧪 Testing

This project uses Jest for unit and e2e tests.

```bash
npm test
npm run test:e2e
npm run test:cov
```

Current tests cover auth, user, token, security, Google Sheets, update service behavior, and basic e2e controller flows with mocked services.

## 🔭 Observability

| Pillar | Implementation | Purpose |
| :--- | :--- | :--- |
| **Logs** | Winston console + daily rotating JSON file logs | Tracks API activity and background processing. |
| **Metrics** | Soon | Metrics are not wired yet. |
| **Traces** | Soon | Distributed tracing is not wired yet. |

Log files are written under `logs/` as `pdv-api-YYYY-MM-DD.log` and are rotated with size/time limits.

## ⚙️ Configuration

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` in example | Runtime environment. Swagger is disabled when set to `production`. |
| `PORT` | `3000` | HTTP server port. |
| `MONGO_URI` | `mongodb://localhost:27017/pdv_updater` | MongoDB connection string. |
| `SALTROUNDS` | Required | Positive integer used by bcrypt. |
| `AT_KEY` | Required | JWT access-token signing secret. |
| `GOOGLE_SHEET_ID` | Required | Target Google spreadsheet ID. |
| `GOOGLE_SHEET_NAME` | `Sheet0` in example | Target sheet/tab name. |
| `FOLDER_PATH` | Required | Base folder where per-CNPJ executable folders live. |
| `REDIS_HOST` | `localhost` | Redis host for BullMQ. |
| `REDIS_PORT` | `6379` | Redis port for BullMQ. |
| `DOTMART_FILE` | `DotMart.exe` | File name used for `DotMart` updates. |
| `POS_FILE` | `PdvFX.exe` | File name used for `PdvFX` updates. |
| `FORCE_JSON` | `force.json` | Optional forced-update metadata file name. |

## 🧩 Notes

* `credentials.json` must exist at the project root because the Google Sheets service loads it from `process.cwd()`.
* The Docker Compose file references `Dockerfile`, while this repo currently stores the image file as `dockerfile`; align the casing if you deploy from a case-sensitive filesystem.
* The update service reads Windows executable version metadata through `win-version-info`.
* Cached user/version lookups use a `300000` TTL value in code.