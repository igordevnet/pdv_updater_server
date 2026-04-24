# 🛒 POS Updater Server - NestJS API

<div align="center">
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/mongodb-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white" />
</div>

---

## 📋 About the Project

This server is the core of the **POS Updater** ecosystem, responsible for managing Point of Sale system updates securely and automatically. It solves the critical challenge of keeping retail terminals updated without manual intervention, utilizing rigorous hardware validation and asynchronous processing to ensure high performance.

## ✨ Key Features

- 🔒 **Hardware Authentication (Device ID):** Access and refresh tokens are strictly bound to the machine's physical ID, preventing unauthorized API usage on unregistered terminals.
- 🔄 **Token Management (JWT):** A complete authentication flow allowing the updater to run in the background without requiring daily manual logins.
- ⚡ **Background Queues (BullMQ):** An event-driven architecture using Redis to process heavy tasks in the background (such as Google Sheets synchronization), keeping API response times under 20ms.
- 📊 **Real-Time Dashboard:** Automatic synchronization with Google Sheets for a live view of the versions installed across all stores.
- 📦 **Full Traceability:** Detailed logs in MongoDB documenting which terminal downloaded each version, creating a reliable audit trail.

## 💻 Tech Stack

### ⚡ Back-end & Core
<table>
  <tr>
    <td align="center" width="110">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-original.svg" width="48" height="48" alt="NestJS" />
      <br>NestJS
    </td>
    <td align="center" width="110">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg" width="48" height="48" alt="MongoDB" />
      <br>MongoDB
    </td>
    <td align="center" width="110">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg" width="48" height="48" alt="Redis" />
      <br>Redis
    </td>
    <td align="center" width="110">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="48" height="48" alt="TS" />
      <br>TypeScript
    </td>
    <td align="center" width="110">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg" width="48" height="48" alt="GCP" />
      <br>GCP Sheets
    </td>
  </tr>
</table>

## 🚀 How to Run

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Redis Server (v6.2+)
- Google Cloud Service Account Credentials

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/pos-updater-server.git](https://github.com/your-username/pos-updater-server.git)
2. Install dependencies:

Bash
npm install

3. Set up the .env file in the root directory:

NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pos_updater
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
SALTROUNDS=10
AT_KEY=your_secret_at_key
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SHEET_NAME=Sheet1

4. Start the server:

Bash
npm run start:dev

Developed to transform POS maintenance into an invisible and efficient process.
