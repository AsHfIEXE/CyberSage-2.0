# 🧠 CyberSage v2.0 

> **An Elite, Real-Time Vulnerability Intelligence Platform with Professional Tool Integration and AI-Powered Analysis.**

[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-black?logo=flask)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-5.x-black?logo=socket.io)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)

CyberSage v2.0 is a comprehensive security assessment suite featuring a dynamic web dashboard. It orchestrates a multi-phase scanning engine that integrates industry-standard professional tools, detects complex attack chains, and leverages AI for deeper insights, all streamed in real-time to the user.

---

## 📚 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [Architecture](#️-architecture)
- [Configuration](#-configuration)
- [Advanced Features Explained](#-advanced-features-explained)
- [Troubleshooting](#-troubleshooting)
- [Legal & Ethical Use](#-legal--ethical-use)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)

---

## 🎯 Features

### Core Capabilities
- ✅ **Real-Time Web Dashboard**: Live vulnerability feed, tool activity, and scan progress powered by WebSockets.
- ✅ **Professional Tool Integration**: Orchestrates and parses results from Nmap, Nuclei, Ffuf, SQLMap, and more.
- ✅ **Advanced Vulnerability Detection**: Actively scans for XSS, SQLi, Command Injection, LFI/RFI, IDOR, XXE, and more.
- ✅ **Attack Chain Detection**: Correlates individual findings to identify high-impact, multi-step exploitation paths.
- ✅ **Business Logic Scanner**: Finds flaws that automated scanners miss, such as race conditions, price manipulation, and authentication bypasses.
- ✅ **API Security Testing**: Scans REST and GraphQL endpoints for issues like missing authentication, rate-limiting flaws, and mass assignment.
- ✅ **AI-Powered Analysis**: (Optional) Provides smart insights, risk scoring, and actionable remediation advice using OpenRouter models.

### Technical Highlights
- 🔥 **AJAX-Aware Spider**: Uses a headless browser to crawl modern JavaScript-heavy applications.
- 🧩 **Modular Architecture**: Easily extendable with new, custom scanner modules.
- 📊 **Comprehensive Reporting**: Export professional PDF reports or detailed JSON data.
- 📥 **Third-Party Report Import**: Integrate and view results from Burp Suite, OWASP ZAP, and Nessus.
- 🛰️ **Interactive HTTP Repeater**: Manually send and analyze HTTP requests to verify findings.

---

## 🚀 Quick Start

### Prerequisites
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/products/docker-desktop/) & [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Install (Recommended)

```bash
# Clone or extract the project
git clone https://github.com/AsHfIEXE/CyberSage-2.0
cd CyberSage-2.0

# Run setup script (Linux/Mac)
chmod +x setup.sh
./setup.sh
```

### Docker Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/AsHfIEXE/CyberSage-2.0.git
    cd CyberSage-2.0
    ```

2.  **Configure AI (Optional):**
    To enable AI features, create a `.env` file in the `backend/` directory.
    ```bash
    cp backend/env.example backend/.env
    ```
    Now, edit `backend/.env` and add your [OpenRouter API key](https://openrouter.ai/keys).
    ```env
    OPENROUTER_API_KEY="sk-or-v1-..."
    ```

3.  **Build and Run:**
    From the project's root directory, run:
    ```bash
    docker-compose up --build
    ```

4.  **Access the Application:**
    -   **Frontend Dashboard**: `http://localhost:3000`
    -   **Backend API**: `http://localhost:5000`

---

## 📖 Usage Guide

1.  **Start a Scan**:
    -   Navigate to the dashboard at `http://localhost:3000`.
    -   Enter your target URL or domain (e.g., `https://example.com`).
    -   Select a scan mode:
        -   **⚡ Quick**: Basic, fast checks.
        -   **🔍 Standard**: Comprehensive vulnerability scan.
        -   **🧠 Elite**: Full scan including professional tools, business logic, and AI analysis.
    -   Click **"Start Elite Scan"**.

2.  **Monitor in Real-Time**:
    -   Watch the **Progress Bar** for the current scan phase and completion percentage.
    -   See live findings appear in the **Vulnerability Feed**.
    -   Keep an eye on **Tool Activity** to see which scanners are currently active.
    -   Critical **Attack Chains** will appear as high-priority alerts.

3.  **Analyze Results**:
    -   Click any vulnerability to open a detailed modal with technical information, HTTP history, and remediation advice.
    -   Review the **Blueprint Viewer** to understand the application's structure and discovered assets.
    -   Check the **Scan Charts** and **AI Insights** for a high-level overview and intelligent recommendations.

---

## 🏛️ Architecture

CyberSage uses a decoupled frontend/backend architecture, communicating primarily over WebSockets for a real-time, interactive experience.

```
CyberSage-2.0/
├── backend/
│   ├── app.py                 # Main Flask + SocketIO server
│   ├── core/
│   │   ├── database.py        # SQLite database operations
│   │   ├── scan_orchestrator.py  # Main scan coordinator
│   │   └── ...
│   ├── tools/
│   │   ├── recon.py          # Reconnaissance engine
│   │   ├── vuln_scanner.py   # Core vulnerability scanner
│   │   ├── professional_tools.py # Integration for Nmap, Nuclei, etc.
│   │   └── advanced/
│   │       ├── chain_detector.py
│   │       ├── business_logic.py
│   │       ├── api_security.py
│   │       └── ai_analyzer.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React entrypoint
│   │   ├── components/
│   │   │   ├── Dashboard.jsx  # Main UI layout
│   │   │   ├── ScanControl.jsx
│   │   │   ├── VulnerabilityFeed.jsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useWebSocket.js # WebSocket connection logic
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🔧 Configuration

### API Key for AI Analysis
For AI-powered insights, an OpenRouter API key is required.

1.  Create a file named `.env` inside the `backend/` directory.
2.  Add your API key to it:
    ```env
    # backend/.env
    OPENROUTER_API_KEY="your_api_key_here"
    ```
> Get a free key at **[openrouter.ai](https://openrouter.ai)**. The application will function without it, but AI features will be disabled.

---

## 🚀 Advanced Features Explained

### Attack Chain Detection
CyberSage intelligently connects individual vulnerabilities to reveal how they can be combined into a high-impact attack.
-   **Example Chain**: `Sensitive File Exposure` -> `Credential Extraction` -> `Internal Access`.
-   **Why it Matters**: It elevates the risk of seemingly low-severity findings and helps prioritize remediation by focusing on the most critical paths.

### Business Logic Scanner
This module tests for flaws unique to the application's logic that generic scanners miss.
-   **Race Conditions**: Sends rapid, parallel requests to endpoints like `/redeem-voucher` to check for double-spend flaws.
-   **Price Manipulation**: Attempts to submit negative or zero values in cart/payment forms to bypass server-side validation.

### Professional Tool Integration
The `ScanOrchestrator` acts as a master controller, deploying a suite of best-in-class open-source tools based on the scan configuration. It automates execution, parses the output, and integrates the findings directly into the real-time feed, correlating them with its own discoveries.

---

## 🛠️ Troubleshooting

-   **WebSocket Connection Fails**:
    -   Ensure the backend container is running: `docker ps`.
    -   Check the backend logs for errors: `docker-compose logs backend`.
    -   Verify the backend is accessible at `http://localhost:5000/api/health`.

-   **Frontend Fails to Start**:
    -   Ensure you are in the project root directory when running `docker-compose`.
    -   Check frontend logs: `docker-compose logs frontend`.

-   **No Vulnerabilities Detected**:
    -   Verify the target is accessible from within the Docker container.
    -   Try scanning a known vulnerable application (like OWASP Juice Shop) to confirm the scanner is working.
    -   Check if the target is protected by a WAF that might be blocking scan traffic.

---

## 🔒 Legal & Ethical Use

> ⚠️ **IMPORTANT**: This tool is intended for professional and ethical use only. You must only scan targets that you own or have explicit, written permission to test. Unauthorized scanning of systems is illegal and can lead to severe legal consequences. The developers of CyberSage are not responsible for any misuse of this tool.

---

## 📊 API Reference

### REST Endpoints
-   `GET /api/health`: Checks the health of the backend server.
-   `GET /api/scans`: Retrieves a list of all historical scans.
-   `GET /api/scan/<scan_id>`: Fetches detailed results for a specific scan.
-   `GET /api/scan/<scan_id>/export`: Exports full scan data as JSON.
-   `GET /api/scan/<scan_id>/export/pdf`: Exports a summary report as a PDF.
-   `POST /api/scan/import`: Imports scan data from third-party tools.

### WebSocket Events
*Communication occurs over the `/scan` namespace.*

**Client → Server**
-   `start_scan`: Initiates a new scan. Payload: `{ target, mode, options }`.
-   `stop_scan`: Requests to stop an active scan. Payload: `{ scan_id }`.

**Server → Client**
-   `scan_started`: Confirms a scan has begun.
-   `scan_progress`: Provides percentage and phase updates.
-   `vulnerability_found`: Pushes a new vulnerability in real-time.
-   `chain_detected`: Pushes a new attack chain as a high-priority alert.
-   `ai_insight`: Pushes an AI-generated analysis or recommendation.
-   `scan_completed`: Signals the end of a scan with a summary.

---

## 🤝 Contributing

Contributions are welcome! Here are some areas for improvement:

-   [ ] **Add More Pro Tools**: Integrate tools like `subfinder` or `httpx`.
-   [ ] **Scan Queue System**: Implement a queue to handle multiple concurrent scan requests.
-   [ ] **User Authentication**: Add a login system (JWT-based) to support multiple users.
-   [ ] **Enhanced Reporting**: Improve the PDF report with more charts and detailed remediation.
-   [ ] **CI/CD Pipeline**: Add GitHub Actions for automated testing and builds.
