# Shivneri Enterprise Mobility 🚀

> **Production-Grade Corporate Commute, Live Fleet Tracking & Autonomous Reassignment Platform**

Shivneri Enterprise Mobility is an end-to-end multi-tenant mobility management and dispatch platform designed for large-scale enterprise campus commutes across Pune's major corporate corridors (Hinjawadi IT Park, Magarpatta Cybercity, Kharadi EON IT Park, Viman Nagar, Yerawada, and Baner).

Built on an entirely open-source GIS and routing stack (OpenStreetMap + Leaflet + OSRM + MongoDB GeoJSON), eliminating expensive third-party proprietary mapping and geocoding API dependencies.

---

## 🌟 Key Capabilities

### 1. 📡 Live Operations & Fleet Tracking (LiveOps)
- **Pune Metropolitan 56-Tile GIS Canvas**: High-density interactive map coverage across Pune corporate corridors.
- **21+ Real-Time Simulated Commuter Cabs**: Dynamic telemetry with realistic speeds, turn-by-turn waypoint interpolation, heading angles, and passenger manifests.
- **Full View Controls**: Flexible toggleable side panels, mini-map, satellite/streets/dark layer styles, and smooth cursor-relative zoom and pan boundaries.
- **Incident Management Center**: Emergency SOS alerts, immediate panic response, and audit log.

### 2. ⚡ Autonomous Dynamic Dispatch & Stop-Level Reassignment
- **Predictive SLA Engine**: Continuously evaluates driver ETAs against employee shift punch-in deadlines.
- **Multi-Factor Scoring Engine**: Evaluates backup candidates across 8 weighted criteria (ETA 30%, Proximity 20%, Route Compatibility 15%, Availability 10%, Vehicle Capacity 10%, Traffic 5%, Driver Compliance 5%, and Driver Workload 5%).
- **Anti-Flapping Protections**: Enforces minimum ETA improvement thresholds (>= 5 min), cooldown intervals (60s), and maximum reassignment limits (2 per ride).
- **Control Tower Escalation**: Gracefully routes unresolvable delays or depleted candidate pools to human dispatch operators.

### 3. 🛡️ TrustPass™ Cryptographic Boarding & Safety Subsystem
- **Mutual Handshake Verification**: Mutual verification between driver and employee before boarding is authorized.
- **Multi-Factor Fallbacks**: Dynamic QR, OTP via SMS/Email/WhatsApp, NFC, and Geofence proximity verification.
- **Night Safety Protocols**: Automatic female escort requirement and enhanced live tracking for evening/night shifts.
- **Audit & Governance**: Complete immutable verification logs with SafeDrop confirmation.

### 4. 🏢 Multi-Tenant Enterprise Administration
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across Super Admin, Org Admin, Dispatcher, and Auditor roles.
- **Vehicle & Driver Compliance**: Real-time license, insurance, PUC, and police verification tracking.
- **Analytics & Carbon Reporting**: Fleet utilization metrics, fuel efficiency, on-time arrivals, and emissions saved.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI** | React 19, TypeScript 5.7, Tailwind CSS v4, Lucide Icons, Recharts |
| **Mapping & GIS** | Leaflet, React-Leaflet, OpenStreetMap Tiles, Custom High-Performance Canvas |
| **Routing Engine** | OSRM (Open Source Routing Machine), TrafficRoutingProvider abstraction |
| **Backend API** | Node.js, Express 5, TypeScript (tsx runtime) |
| **Database** | MongoDB Native Driver / In-Memory 2dsphere GeoJSON Engine |
| **Build Tooling** | Vite 8, `@tailwindcss/vite`, `@vitejs/plugin-react`, oxfmt |

---

## 📁 Repository Structure

```
├── .figma/                  # Figma Make configuration and preview assets
├── server/                  # Backend Express application
│   ├── middleware/          # Authentication & GeoJSON schema validation
│   ├── models/              # TypeScript schemas for Drivers, Rides, and Routes
│   ├── routes/              # Express API endpoints (/api/drivers, /api/rides, /api/routes)
│   ├── services/            # Driver Assignment, Reassignment & Routing Services
│   │   └── routing/         # OSRMProvider, TrafficRoutingProvider, osrmService
│   ├── app.ts               # Express application initialization & middleware
│   ├── config.ts            # Environment and SLA threshold configuration
│   ├── db.ts                # MongoDB & in-memory GeoJSON spatial store
│   └── index.ts             # HTTP server bootstrap entrypoint
├── src/                     # Frontend React application
│   ├── components/          # Reusable UI components
│   │   ├── dispatch/        # Smart Dispatch panels, candidate cards, SLA banners
│   │   ├── map/             # Driver markers, route polylines, map controllers
│   │   ├── trustpass/       # TrustPass QR, OTP, mutual handshake components
│   │   ├── AIChatbot.tsx    # AI Mobility Support Chatbot
│   │   ├── LiveOpsView.tsx  # Full-screen Pune Live Operations dashboard
│   │   └── RoutesView.tsx   # Corporate Cab Routes & live telemetry simulator
│   ├── services/            # Dispatch store, AI predictor, scoring engine, Geolocation
│   ├── test/                # Frontend dynamic dispatch test suite (25 tests)
│   ├── types/               # TypeScript interfaces for dispatch & mobility models
│   ├── App.tsx              # Main enterprise dashboard entry point
│   ├── index.css            # Tailwind CSS v4 global styles & custom keyframe animations
│   └── main.tsx             # React DOM entrypoint
└── test/                    # Backend test suites (Routing, Driver Selection, Reassignment, Geolocation)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 20.x
- **pnpm** or **npm**

### Installation

```bash
# Clone the repository
git clone https://github.com/lxakshaseth/shivneri-enterprise-mobility.git
cd shivneri-enterprise-mobility

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite Development Server (Default port 8443)
npm run dev

# Start Backend API Server (Port 5001)
npm run server
```

The web application will be accessible at `http://localhost:8443` (or the configured `$PORT`).

---

## 🧪 Testing Suites

The platform includes 2 extensive automated test suites covering backend GIS routing and frontend dispatch state management:

### 1. Open-Source Routing & Reassignment Suite
```bash
npm run test
```
Tests:
- **Routing**: Valid coordinates, origin/destination boundaries, OSRM timeout fallbacks, traffic-aware multipliers.
- **Driver Selection**: Fastest ETA vs straight-line distance, offline driver filtering, busy/stale driver handling.
- **Reassignment Rules**: 7 strict reassignment criteria, anti-flapping thresholds, onboard passenger lock.
- **Geolocation**: MongoDB GeoJSON point validation, coordinate bounds checking, stale timestamp detection.

### 2. Smart Dynamic Dispatch & SLA Engine Suite
```bash
npm run test:dispatch
```
Tests 25 end-to-end dispatch scenarios:
- SLA risk prediction and congestion alerts
- Multi-candidate ranking and fallback driver offers
- Cryptographic TrustPass mutual handshake
- Reassignment cooldowns and concurrent race condition locks

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env`:

```ini
# Backend API & Server Port
PORT=5001
BACKEND_PORT=5001

# MongoDB Connection String (defaults to built-in in-memory GeoJSON engine if omitted)
MONGODB_URI=mongodb://localhost:27017/shivneri_mobility

# Open Source Routing Machine Endpoint
OSRM_BASE_URL=https://router.project-osrm.org
ROUTING_PROVIDER=osrm
```

---

## 📜 License

Licensed under the MIT License. Enterprise Mobility Solutions by Shivneri.
