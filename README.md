# 👁️ NIRIKSHAK — Predictive Cybercrime Intelligence Dashboard

<p align="center">
  <img src="https://raw.githubusercontent.com/SharayuShelke2006/Frontend/main/public/nirikshak-logo.jpg" alt="Nirikshak" width="420" />
</p>

<p align="center">
  <strong>Predictive intelligence for identifying likely cyber-fraud cash withdrawal locations before the cash-out occurs.</strong>
</p>

<p align="center">
  <a href="https://github.com/SharayuShelke2006/Frontend">
    <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=202020" alt="React + TypeScript" />
  </a>
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/GIS-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Analytics-Recharts-8884D8?style=for-the-badge" alt="Recharts" />
  <img src="https://img.shields.io/badge/State-Zustand-443E38?style=for-the-badge" alt="Zustand" />
</p>

<p align="center">
  <a href="#-problem-statement">Problem</a> •
  <a href="#-solution">Solution</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-dashboard-capabilities">Capabilities</a> •
  <a href="#-getting-started">Run Locally</a> •
  <a href="#-data-pipeline">Data Pipeline</a>
</p>

---

## 🧭 What is NIRIKSHAK?

**NIRIKSHAK** is a predictive cybercrime intelligence platform designed for **SIH 2026 Problem Statement SIH26184** under the **Ministry of Home Affairs / Indian Cyber Crime Coordination Centre (I4C), CIS Division**.

The central idea is simple:

> **Do not wait for a fraudulent withdrawal to happen. Use financial, cybercrime, temporal and geospatial signals to forecast where a likely cash withdrawal may happen next, then convert that forecast into actionable intelligence for LEAs, banks/FIs and I4C.**

This repository contains the **GIS and operational dashboard frontend** of NIRIKSHAK. It is designed to visualize predicted risk, investigate supporting intelligence, coordinate alerts and actions, and provide role-specific views for operational stakeholders.

---

# 🎯 Problem Statement

### SIH26184 — Development of a Predictive Analytics Framework for Cybercrime Complaints to Forecast Likely Cash Withdrawal Locations in Advance, Enabling Generation of Actionable Intelligence for Timely and Proactive Cybercrime Intervention.

Cybercrime complaints can generate a large amount of fragmented information across complaints, financial transactions, accounts, banks, ATMs, locations and time windows.

A reactive workflow mainly answers:

> **"What happened?"**

NIRIKSHAK is designed to help answer:

> **"What is likely to happen next, where is it likely to happen, and what should the responsible stakeholders see and act on now?"**

The required outcome is therefore not just a fraud score or a chatbot. The core output is a **forecasted cash-out location with a risk score, time window and supporting intelligence**, presented in a way that can be consumed by human decision-makers.

---

# 🧠 Why This Matters

A cyber-fraud event can move rapidly from a digital transaction to physical cash withdrawal.

Once the withdrawal has already happened, investigators may be dealing with:

- dispersed money movement,
- limited recovery windows,
- multiple jurisdictions,
- fragmented evidence,
- delayed coordination between agencies and financial institutions.

A predictive layer creates an opportunity to intervene **before the final cash-out stage**.

NIRIKSHAK therefore focuses on a closed loop:

**Complaint → Financial Intelligence → Prediction → Geospatial Risk → Alert → Human Action → Outcome Feedback**

This is the key difference between a conventional complaint-management interface and a predictive cybercrime intervention system.

---

# 🚀 Solution Overview

NIRIKSHAK combines several intelligence layers:

### 1. 📥 Data ingestion and preparation
Historical cybercrime, financial and supporting location data are cleaned, normalized and transformed into machine-readable datasets.

### 2. 🤖 Predictive analytics
Historical patterns and transaction context are used to estimate the likelihood of future cash-out activity.

### 3. 🗺️ Geospatial risk modelling
Predictions are mapped to districts, areas and ATM locations so that risk can be interpreted spatially rather than only numerically.

### 4. ⚖️ Risk and decision layer
Predictions are ranked and converted into operational risk levels such as **LOW, MEDIUM, HIGH and CRITICAL**.

### 5. 🧾 Intelligence and explanation
Each prediction can expose supporting paths, recent financial context, explanation factors and a predicted withdrawal window.

### 6. 🔔 Alert and coordination layer
High-value predictions can become operational alerts delivered to the relevant **LEA, Bank/FI and I4C** views.

### 7. 👮 Action and feedback
Investigators can acknowledge alerts, assign actions, record follow-up and submit outcome feedback such as true positive, false positive or unverified.

### 8. 📊 GIS dashboard
The frontend turns the full pipeline into a usable operational surface with maps, queues, drill-downs, analytics and role-specific workflows.

---

# 🏗️ Architecture

The overall solution is designed around an event-to-intelligence pipeline:

<p align="center">
  <img src="./docs/architecture.png" alt="NIRIKSHAK system architecture" width="100%" />
</p>

> The architecture connects complaint intake, secure data ingestion, stream processing, transaction and relationship storage, predictive models, feature storage, spatial clustering, model monitoring and the operational intelligence interfaces for LEAs, banks and I4C.

## 🔄 Operational flow

```text
Complaint
   ↓
Financial / contextual enrichment
   ↓
Data cleaning + normalization
   ↓
Feature engineering
   ↓
Predictive modelling
   ↓
Candidate cash-out locations
   ↓
Geospatial + temporal risk scoring
   ↓
Ranked withdrawal predictions
   ↓
Actionable intelligence
   ↓
Role-specific alerts
   ↓
LEA / Bank / I4C action
   ↓
Outcome feedback
   ↓
Continuous evaluation
```

The architecture deliberately keeps **prediction** separate from **visualization and action management**. The dashboard is the operational presentation layer, not the ML engine itself.

---

# 🖥️ Dashboard Capabilities

The frontend implements role-based operational workflows for four actor types:

| Role | Primary purpose |
|---|---|
| 👮 **LEA** | Investigate cases, inspect risk, review predictions, coordinate actions |
| 🛰️ **I4C** | State-level command, monitoring, escalation and cross-stakeholder coordination |
| 🏦 **Bank / FI** | Receive relevant predicted cash-out alerts and acknowledge operational response |
| 👤 **Citizen** | Submit a cyber-fraud complaint and track its status |

## 🗺️ GIS risk overview

The GIS layer is one of the primary operational views.

It supports:

- Telangana district boundaries
- district-level risk visualization
- district search
- risk-level filtering
- district drill-down
- area-level inspection
- ATM-level inspection
- clickable risk objects
- high-risk ATM identification

The dashboard is built so that GIS supports interpretation of predictive intelligence rather than becoming an isolated map application.

<p align="center">
  <img src="./docs/gis-dashboard.png" alt="NIRIKSHAK Telangana GIS dashboard" width="100%" />
</p>

<p align="center">
  <em>Telangana GIS Overview — district-level risk visualization with ATM locations and drill-down support.</em>
</p>

## 🎯 Predicted Withdrawal Locations

The prediction queue ranks forecasts using risk scores and exposes:

- predicted ATM
- district and area
- risk level
- probability-style signal
- amount at risk
- predicted withdrawal window
- prediction status

This creates a practical workflow for investigators to move from **"there may be a risk"** to **"these locations should be reviewed first"**.

## 🚨 Alert Queue

Alerts are represented as operational records with lifecycle states such as:

```text
GENERATED
   ↓
DELIVERED
   ↓
ACKNOWLEDGED
   ↓
ASSIGNED
   ↓
ACTION_INITIATED
   ↓
RESOLVED / EXPIRED / FALSE_POSITIVE
```

The queue supports filtering by:

- district
- risk severity
- alert status

## 🔎 Prediction intelligence

Prediction detail views expose the evidence behind a forecast instead of presenting only a single score.

A prediction can include:

- prediction ID
- linked case ID
- predicted ATM
- predicted time window
- risk score
- risk level
- supporting path count
- converging path count
- most recent observed transaction
- explanation factors
- freshness of the intelligence
- financial flow/path visualization

## 👮 LEA workflow

The LEA dashboard brings together:

- active cases
- high-risk predictions
- active alerts
- actions in progress
- recent alerts
- district-level maps
- ATM-level drill-down
- pending operational actions
- analytics

## 🛰️ I4C Command Center

The I4C view is designed for coordination across the ecosystem.

It provides:

- active case monitoring
- active alert monitoring
- highlighted district count
- acknowledgement monitoring
- overdue alert awareness
- statewide risk map
- LEA vs Bank coordination status
- recent activity
- searchable case / complaint / ATM intelligence
- analytics

## 🏦 Bank / FI Response Queue

The bank-facing workflow focuses on operational response to predicted cash-outs relevant to the institution.

It provides:

- incoming alerts
- pending acknowledgement
- acknowledged alerts
- target district / area
- ATM information
- predicted time windows

## 📈 Analytics

The analytics layer currently includes dashboard visualizations for:

- case resolution status
- alert severity mix
- new cases over the last 14 days
- alerts generated over the last 14 days
- predicted risk signals for the next 24 hours
- cybercrime pattern concentration
- financial exposure versus spatial proximity

These views are intended to make the system useful not only for individual incidents but also for **trend monitoring and prioritization**.

## 🧾 Audit and notifications

The frontend also exposes:

- notifications
- alert lifecycle state
- action history
- audit timeline
- recent system activity

This is important because intelligence without traceability is difficult to operationalize in a multi-stakeholder environment.

---

# 🧩 Frontend Technology Stack

| Layer | Technology |
|---|---|
| UI | **React 18 + TypeScript** |
| Build | **Vite 5** |
| Styling | **Tailwind CSS** |
| Routing | **React Router** |
| GIS | **Leaflet + React Leaflet** |
| Map clustering | **Leaflet MarkerCluster** |
| Geospatial helpers | **Turf** |
| Analytics | **Recharts** |
| State management | **Zustand** |
| Deployment | **Vercel-ready configuration** |

---

# 📁 Repository Structure

A simplified view of the frontend architecture:

```text
Frontend/
├── public/
│   ├── Bank_Logos/
│   ├── district-badges/
│   ├── data/
│   │   ├── actions.json
│   │   ├── alerts.json
│   │   ├── areas.geojson
│   │   ├── atms.json
│   │   ├── audit.json
│   │   ├── cases.json
│   │   ├── districts.geojson
│   │   ├── flagship.json
│   │   ├── notifications.json
│   │   ├── paths.json
│   │   ├── predictions.json
│   │   ├── state.geojson
│   │   └── withdrawals.json
│   ├── nirikshak-icon.png
│   └── nirikshak-logo.jpg
│
├── scripts/
│   └── prepare-data.mjs
│
├── src/
│   ├── components/
│   │   ├── analytics/
│   │   ├── layout/
│   │   ├── map/
│   │   └── shared/
│   ├── lib/
│   │   ├── data.ts
│   │   ├── demoData.ts
│   │   └── selectors.ts
│   ├── pages/
│   │   ├── GIS
│   │   ├── prediction
│   │   ├── alert
│   │   ├── case
│   │   ├── LEA
│   │   ├── I4C
│   │   ├── Bank / FI
│   │   └── Citizen
│   ├── state/
│   │   └── store.ts
│   ├── types/
│   │   └── contract.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── gis_implementation.py
├── tailwind.config.js
├── vite.config.ts
├── vercel.json
└── package.json
```

---

# 🔌 Data Contract and Backend Readiness

One of the important design choices in this repository is that frontend entities follow an explicit domain contract.

Examples include:

- `DistrictRisk`
- `Atm`
- `Prediction`
- `PredictedPath`
- `Case`
- `Alert`
- `ActionRecord`
- `OutcomeRecord`
- `AuditEvent`
- `NotificationItem`

The type definitions are intentionally structured around a future API boundary so that fixture JSON can be replaced by live backend responses without redesigning the entire UI.

The frontend therefore separates:

**data contract → state → selectors → UI components → role-specific pages**

This makes the dashboard easier to integrate with the broader NIRIKSHAK backend, prediction engine and alerting services.

---

# 🧪 Demo Mode and Current Prototype Architecture

This repository is currently a **prototype / demonstration frontend**, and that distinction matters.

The dashboard does not claim that its bundled JSON files are live government data.

Instead, the current prototype uses:

- prepared fixture JSON
- GeoJSON boundaries
- deterministic demo-risk generation
- simulated predictions and alerts
- browser-side state management
- cross-tab synchronization using browser storage events

The demo data generator creates realistic-looking operational variation across districts, areas, ATMs, cases, predictions and alerts so that the dashboard can demonstrate the intended end-to-end workflow.

### Cross-tab demonstration

The current state layer can synchronize mutable demo state between multiple tabs of the same browser using `localStorage` and the browser `storage` event.

This is useful for demonstrations such as:

```text
Tab A → acknowledge alert
        ↓
Shared browser state
        ↓
Tab B → updated alert status
```

This mechanism is a **prototype simulation of real-time coordination**, not a replacement for a production event-streaming backend.

In production, this layer would be replaced by authenticated APIs and real-time messaging infrastructure.

---

# 📊 Data Pipeline

The frontend is backed by a dedicated data preparation and modelling repository.

### 🔗 Data cleaning / preprocessing repository

👉 **[NIRIKSHAK / AML Data Pipeline](https://github.com/YashBhavsar29/AML)**

The companion repository contains the data preparation and analytical workflow used to transform transaction and pattern data into usable datasets.

Examples of data artifacts in that repository include:

- account and transaction datasets
- fraud-expanded datasets
- laundering pattern files
- pattern extraction scripts
- pattern validation workflows
- synthetic bank mappings
- synthetic district mappings
- district distance matrices
- ATM coverage data
- pattern matching outputs
- reusable prepared data

The relationship between the two repositories is:

```text
             ┌──────────────────────────────┐
             │   AML / Data Pipeline Repo   │
             │  Cleaning + preparation +    │
             │  pattern / dataset workflows │
             └──────────────┬───────────────┘
                            │
                            │ prepared datasets
                            ▼
             ┌──────────────────────────────┐
             │      NIRIKSHAK Frontend      │
             │ GIS + intelligence + alerts  │
             │ cases + analytics + actions  │
             └──────────────────────────────┘
```

---

# 🗺️ Why GIS is Central

The problem statement is explicitly about **forecasting likely cash withdrawal locations**.

That means the system needs more than a tabular risk score.

GIS allows the operator to answer:

- Which district is currently more exposed?
- Which areas inside that district are higher risk?
- Which ATM is the predicted location?
- How are multiple risky locations distributed spatially?
- Which local LEA unit should receive the intelligence?
- Which bank/FI is associated with the predicted ATM?
- What is the predicted time window?

The frontend therefore follows a hierarchy:

```text
State
  ↓
District
  ↓
Area
  ↓
ATM
  ↓
Prediction
  ↓
Alert
  ↓
Operational Action
```

That hierarchy mirrors how intelligence can move from strategic monitoring to field-level intervention.

---

# 🔐 Security and Privacy Design Considerations

The prototype incorporates several principles that are important for a future operational implementation:

### Role separation
Different routes and workflows are guarded by role:

```text
CITIZEN
LEA
BANK
I4C
```

### Masked sensitive information
The domain model is structured to represent masked victim/account information rather than exposing raw personal details in the operational UI.

### Human-in-the-loop action
Predictions are presented as **decision support**. The system is not designed to autonomously dictate police action.

### Auditability
Alert, action and system events can be recorded through audit structures to support traceability.

### Production hardening still required
A production implementation would additionally require strong authentication, authorization, encryption, API security, secrets management, secure audit storage, rate limiting, tamper resistance, observability and formal privacy controls.

---

# ⚙️ Getting Started

## Prerequisites

Install:

- **Node.js 18+**
- **npm**

Check your environment:

```bash
node --version
npm --version
```

## Installation

Clone the repository:

```bash
git clone https://github.com/SharayuShelke2006/Frontend.git
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

---

# 🛠️ Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run prepare-data` | Run the frontend data preparation helper |

For a production-style build:

```bash
npm run build
npm run preview
```

---

# ☁️ Deployment

The repository already contains a `vercel.json` rewrite configuration for SPA routing.

This allows client-side routes such as:

```text
/login
/lea-dashboard
/i4c
/bank
/gis
/predictions
/alerts
/cases
/notifications
/audit
```

to resolve through the application entry point when deployed on Vercel.

---

# 🧑‍💻 Main Operational Routes

| Route | Purpose |
|---|---|
| `/login` | Role selection |
| `/lea-dashboard` | LEA overview |
| `/lea-dashboard/district/:districtId` | District-specific LEA view |
| `/i4c` | I4C command center |
| `/bank` | Bank / FI response queue |
| `/gis` | Telangana GIS overview |
| `/gis/districts/:districtId` | District GIS drill-down |
| `/atms/:atmId` | ATM intelligence detail |
| `/predictions` | Prediction queue |
| `/predictions/:predictionId` | Prediction detail |
| `/alerts` | Alert queue |
| `/alerts/:alertId` | Alert detail |
| `/cases` | Case list |
| `/cases/:caseId` | Case detail |
| `/notifications` | Notifications |
| `/audit` | Audit timeline |
| `/banks/directory` | Bank directory |
| `/banks/:bankId` | Bank detail |
| `/coordinators` | Coordinator directory |
| `/coordinators/:districtId` | Coordinator detail |
| `/citizen/` | Citizen portal |
| `/citizen/complaint` | Complaint submission |
| `/citizen/track` | Complaint tracking |

---

# 🔬 Evaluation Philosophy

A predictive cybercrime platform should not be judged only by visual quality.

The broader NIRIKSHAK system is intended to be evaluated on:

### Predictive performance
Can the system correctly rank likely withdrawal locations?

### Spatial relevance
Does the prediction meaningfully narrow the search area?

### Temporal relevance
Does the system provide an operationally useful withdrawal window?

### Actionability
Can LEAs and banks understand what they should review?

### Explainability
Can the operator see why a prediction was generated?

### Coordination
Can intelligence move from a prediction to an alert and then to an action?

### Feedback
Can actual outcomes be used to measure true positives, false positives and unverified cases?

The frontend is therefore designed around the final operational questions rather than around isolated visual components.

---

# 🧠 Design Principles

NIRIKSHAK follows a few core principles:

**Prediction over reaction**  
Focus on likely future cash-out locations rather than only classifying already-completed fraud.

**Intelligence over raw data**  
Convert transactions and patterns into ranked, contextual, actionable signals.

**GIS as an interpretation layer**  
Use geospatial visualization to help operators understand and act on predictions.

**Human decision support**  
ML should assist investigators and coordinators, not autonomously dictate enforcement actions.

**Explainability matters**  
A prediction without supporting evidence is difficult to operationalize.

**Simple data contracts**  
The dashboard should remain replaceable and integrable as backend services mature.

**Clear separation of demo and production**  
Synthetic or simulated data must not be confused with live government or financial-institution data.

---

# 🧱 Current Repository Scope

This repository is primarily responsible for the **frontend and GIS operational layer**.

It includes:

- role-based dashboard experiences
- map visualization
- district and ATM drill-down
- prediction queues
- prediction detail views
- alert management
- case management
- bank/FI workflows
- I4C command center
- citizen complaint flow
- analytics
- notifications
- audit timeline
- demo-state synchronization
- frontend data contracts

The predictive ML and data engineering work is maintained separately and is linked above.

---

# 📚 Supporting Documentation

The repository also contains:

**Nirikshak Frontend Data / UI Specification**

`Nirikshak_Frontend_Data_UI_Specification.pdf`

This document describes the frontend-oriented data and UI contract used to structure the dashboard.

---

# 👥 Team — Vajra Innovators

| Member | Primary responsibility |
|---|---|
| **Yash Bhavsar** | System Architecture, Backend, Orchestration, Risk / Decision Layer |
| **Vinay Gaddam** | AI / ML, Predictive Analytics, Feature Engineering |
| **Sharayu Shelke** | Frontend, GIS and Visualization |
| **Harshada Khajure** | LEA Interface, QA and Documentation |
| **Mahesh** | Backend / API Engineering |
| **Pranav** | AI / GenAI, Intelligence Layer and Presentation |

---

# 🔗 Related Repositories

### 🎨 NIRIKSHAK Frontend — this repository
https://github.com/SharayuShelke2006/Frontend

### 🧪 Data Cleaning / Analytical Pipeline
https://github.com/YashBhavsar29/AML

---

# ⚠️ Prototype Disclaimer

This project is a **hackathon prototype for SIH 2026**.

The current frontend uses **fixture, synthetic and simulated demonstration data** to reproduce the intended operational workflow. It must not be interpreted as a live connection to I4C, NCRP, banks, ATMs or government systems.

A production deployment would require integration with authorized data sources, secure APIs, institutional identity systems, real-time event infrastructure, model-serving services, operational data governance and formal security controls.

---

# 📄 License

No open-source license has been declared for this repository at the time of writing.

---

<p align="center">
  <strong>NIRIKSHAK</strong><br/>
  <sub>From complaint intelligence to proactive cash-out intervention.</sub>
</p>
