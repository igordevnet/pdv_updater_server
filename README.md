# 🛒 POS Updater Server - NestJS API

A robust, secure, and event-driven API built to manage Point of Sale (POS) system updates, ensuring cash registers are always running the latest version with strict hardware validation.
    
## 📋 About the Project

This server acts as the central controller for the **POS Updater** (a C# desktop client). It solves the critical challenge of software distribution in retail environments, guaranteeing that cash registers download the latest system versions silently, autonomously, and securely. 

By leveraging background queues, the API ensures ultra-fast response times for the physical terminals while handling third-party integrations asynchronously.

## ✨ Key Features

- 🔒 **Hardware Authentication (Device ID):** Access and refresh tokens are strictly bound to the machine's physical ID, preventing unauthorized system usage on unregistered computers.
- 🔄 **Token Management:** A complete authentication flow using JWT, ensuring the updater runs seamlessly in the background without requiring daily manual logins.
- ⚡ **Event-Driven Background Jobs:** Uses Redis and BullMQ to decouple heavy third-party tasks. Google Sheets data synchronization happens asynchronously, keeping API response times under 20ms for the POS clients.
- 📊 **Real-Time Dashboarding:** Automatically processes queue jobs to synchronize update logs directly into a Google Spreadsheet, providing the business team with a live view of POS versions across all stores.
- 📦 **Update Traceability:** Logs exactly which machine (`deviceName`) downloaded which system version into the MongoDB database, generating a reliable audit trail.
- 🛡️ **Clean Architecture:** Implemented using **Guards** for route protection, **Interceptors** for global logging, and custom **Decorators** (e.g., `@CurrentUser`).

## 🛠️ Tech Stack

- **Backend:** NestJS, TypeScript, Node.js
- **Database:** MongoDB (via Mongoose)
- **Message Broker & Queues:** Redis, BullMQ
- **External APIs:** Google Sheets API (Google Cloud Platform)
- **Security:** Passport.js, JWT, bcrypt
- **Documentation:** Swagger (OpenAPI)

## 🚀 How to Run the Project

### Prerequisites

- Node.js (v18 or higher)
- MongoDB running locally or via Atlas
- Redis Server (v6.2+ recommended) running locally or via Docker
- Google Cloud Service Account Credentials (for Sheets API)

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/pos_updater_server.git](https://github.com/YOUR_USERNAME/pos_updater_server.git)
   cd pos_updater_server
Install the dependencies:Bashnpm install
Set up the environment variables (create a .env file in the root directory):Snippet de códigoNODE_ENV=development

# Database & Cache
MONGO_URI=yourUri
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Security
SALTROUNDS=yourSaltrounds
AT_KEY=your256BitsAtkey

# Integrations
GOOGLE_SHEET_ID=yourGoogleSheetId
GOOGLE_SHEET_NAME=Sheet0
Start the server:Bash# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
📡 Main API EndpointsFull documentation can be accessed via Swagger at the /api/docs route when the application is running.
