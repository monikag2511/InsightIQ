# Ask Your Data

### AI-Powered Personal Data Analysis & Insights Platform

> **“Upload your data. Ask questions. Discover insights.”**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.13-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pandas](https://img.shields.io/badge/Pandas-2.2+-150458?logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Project Overview

**Ask Your Data** is a modern full-stack web application and AI-powered personal data analysis platform. Users can upload tabular datasets in **CSV, Excel (XLSX, XLS), or JSON**, automatically profile and clean the data, explore statistical metrics and auto-generated charts, and ask natural-language questions about their dataset.

The system is designed with a strict **Source of Truth Principle**:
* User queries are safely mapped into controlled analytical operations.
* **Pandas and Python perform the actual computation directly on the uploaded dataset**.
* Real numerical results are returned to the user, with optional AI explanations.
* **Zero numerical hallucinations**: The LLM is never allowed to invent numerical facts.

---

## 2. Core Architecture & Workflow

```text
User Natural Language Question
              ↓
AI / Engine Interprets Query Intent
              ↓
Controlled Analysis Layer (Safe Predefined Operations)
              ↓
Python / Pandas Executes Deterministic Calculation on Dataset
              ↓
Actual Numerical / Tabular Results Computed
              ↓
AI Explains Results in Simple Language
              ↓
Frontend Displays Response (KPI Metric Cards, Tables, and Charts)
```

---

## 3. Key Features

### 📁 Dataset Ingestion & Validation
- Drag-and-drop upload for **CSV, XLSX, XLS, and JSON** files.
- Automated file validation: size limits (up to 50MB), empty file detection, encoding detection, and corruption checks.
- Automatic column type detection: **Numerical, Categorical, Boolean, Date/Time, and Text**.

### 🔍 Dataset Profiling & Overview
- Instant KPI cards: Rows, Columns, Missing Values, Duplicate Rows, and Composite Data Quality Score (0–100%).
- Column summary table: Column name, data type, missing count, cardinality, and sample values.

### 📋 Spreadsheet Preview
- High-performance paginated table with search, sorting, and column inspection for both original and cleaned datasets.

### 🧹 Data Quality & Automated Cleaning
- **Missing Value Handling**: Remove rows or impute numerical columns (mean/median) and categorical columns (mode).
- **Deduplication**: One-click detection and removal of duplicate rows.
- **Outlier Auditing**: Statistical anomaly detection using **Interquartile Range (IQR)** bounds.

### 📈 Automatic Exploratory Data Analysis (EDA)
- Statistics for numerical features: Mean, Median, Mode, Minimum, Maximum, Standard Deviation, Variance, and Quartiles.
- Statistics for categorical features: Unique count, most frequent value, and frequency distributions.
- Pearson correlation matrix across all continuous features.

### 📊 Intelligent Chart Visualizations
- Auto-recommends optimal charts:
  - **Date + Numerical** $\rightarrow$ Temporal Trend Line Chart
  - **Categorical + Numerical** $\rightarrow$ Ranked Bar Chart / Box Plot
  - **Two Numerical Columns** $\rightarrow$ Scatter Plot
  - **Categorical Distribution** $\rightarrow$ Donut / Pie Chart
  - **Numerical Distribution** $\rightarrow$ Histogram
  - **Correlation Matrix** $\rightarrow$ Heatmap
- Interactive tooltips, responsive layout, and one-click PNG chart export.

### 💬 Ask Your Data — Natural Language Q&A
- Dedicated `/ask` conversational interface and `/dashboard/ask`.
- Computes exact calculations on the dataset without hallucinations.
- Returns rich structured responses: plain-language explanation, KPI cards, sorted tables, and dynamic charts.
- Conversational session history, title generation, and clear chat controls.

### 📑 Executive PDF Reports & Exports
- Multi-page publication-ready PDF reports generated via **ReportLab** (Overview, Quality Score, Statistics, Visual Insights, Correlations, and AI Summary).
- Cleaned dataset download in **CSV** and **Microsoft Excel (.xlsx)** formats.

### 🛍️ Built-in Demo Dataset
- Realistic **Retail Sales Dataset** (1,200 records, 10 columns: `Order_ID`, `Order_Date`, `Customer_Name`, `Region`, `Category`, `Product`, `Quantity`, `Unit_Price`, `Sales`, `Profit`).
- One-click **“Try Demo Dataset”** button on landing page and dashboard.

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16+ (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts |
| **Backend** | Python 3.11 / 3.13, FastAPI, Pandas, NumPy, Scikit-learn, SciPy, OpenPyXL |
| **Database** | PostgreSQL 16 & SQLAlchemy 2.0 (with SQLite zero-config fallback) |
| **PDF Reporting** | ReportLab 4.1+ |
| **AI Gateway** | Controlled Natural Language Parser + Google Gemini / OpenAI REST API integration (with resilient Offline Fallback Engine) |
| **DevOps** | Docker, Docker Compose |

---

## 5. Project Structure

```text
ask-your-data/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Landing Page
│   │   ├── ask/page.tsx                # Dedicated Ask Your Data Chat (/ask)
│   │   ├── login/page.tsx              # User Authentication (Sign In)
│   │   ├── register/page.tsx           # User Registration
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Analytics Layout & Sidebar
│   │   │   ├── page.tsx                # Overview & KPI Cards
│   │   │   ├── preview/page.tsx        # Spreadsheet Data Preview
│   │   │   ├── quality/page.tsx        # Data Quality & Cleaning Module
│   │   │   ├── analytics/page.tsx      # Statistical EDA & Correlation Matrix
│   │   │   ├── visualizations/page.tsx  # Dynamic Visualizations Gallery
│   │   │   ├── ask/page.tsx            # Dashboard Ask Your Data View
│   │   │   ├── insights/page.tsx       # Insights Engine & AI Summary
│   │   │   ├── reports/page.tsx        # PDF Report & Export Center
│   │   │   └── settings/page.tsx       # Settings & Dataset Controls
│   ├── components/
│   │   ├── Navbar.tsx                  # Top Bar with Dataset Switcher & Theme Toggle
│   │   ├── Sidebar.tsx                 # SaaS Sidebar Navigation
│   │   ├── UploadModal.tsx             # Drag-and-Drop File Upload
│   │   └── Charts/
│   │       └── UniversalChart.tsx      # Recharts Visualization Renderer
│   ├── context/
│   │   └── DatasetContext.tsx          # React Context for Datasets & Theme
│   ├── services/
│   │   └── api.ts                      # REST API Client
│   └── types/                          # TypeScript Interfaces
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py                 # JWT Authentication Endpoints
│   │   │   └── datasets.py             # REST Analytics Endpoints
│   │   ├── models/
│   │   │   └── models.py               # PostgreSQL SQLAlchemy Models
│   │   ├── schemas/
│   │   │   └── schemas.py              # Pydantic Schemas
│   │   ├── analysis/
│   │   │   ├── loader.py               # Multi-Format File Ingestion
│   │   │   ├── profiler.py             # Schema Profiling & Quality Scoring
│   │   │   ├── cleaner.py              # Missing Values, Duplicates & Outliers
│   │   │   ├── statistics.py           # Descriptive Statistics & Correlations
│   │   │   ├── visualizer.py           # Visualization Recommendation Engine
│   │   │   ├── insights.py             # Automated Insights Engine
│   │   │   └── query_engine.py         # Safe Natural Language Pandas Engine
│   │   ├── ai/
│   │   │   └── llm_service.py          # AI Explanation & Offline Fallback
│   │   ├── database/
│   │   │   └── session.py              # SQLAlchemy Engine & Session
│   │   ├── services/
│   │   │   ├── auth.py                 # Password Hashing & JWT
│   │   │   └── report_generator.py     # ReportLab PDF Generator
│   │   └── utils/
│   │       └── demo_generator.py       # Retail Sales Dataset Generator
│   ├── tests/
│   │   └── test_insightiq.py           # Pytest Test Suite
│   ├── main.py                         # FastAPI App Entrypoint
│   └── requirements.txt
├── data/
│   └── demo/                           # Retail Sales Demo Dataset
├── docker-compose.yml                  # Docker Compose Orchestration
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. Installation & Setup

### Prerequisites
- **Python**: Version 3.10+
- **Node.js**: Version 18+
- **PostgreSQL** (optional: SQLite is supported out-of-the-box)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/ask-your-data.git
cd ask-your-data
```

### Step 2: Configure Environment Variables
```bash
cp .env.example .env
```
Key variables in `.env`:
* `DATABASE_URL`: Set to your PostgreSQL connection string, e.g., `postgresql://postgres:password@localhost:5432/askyourdata`. (Leave as SQLite default `sqlite:///./insightiq.db` for instant zero-configuration local runs).
* `AI_API_KEY`: (Optional) Your Google Gemini or OpenAI API key. If omitted, the system seamlessly operates in **Built-in Deterministic Analysis Engine Mode**.
* `NEXT_PUBLIC_API_URL`: `http://localhost:8000`

### Step 3: Backend Setup
```bash
# Set up virtual environment
python -m venv backend/venv

# Activate virtual environment
# Windows (PowerShell):
.\backend\venv\Scripts\Activate.ps1
# Linux / macOS:
source backend/venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt email-validator

# Run backend test suite
$env:PYTHONPATH="."; python -m pytest backend/tests -v

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API docs are available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Step 4: Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Example Natural Language Questions

The system accurately calculates answers for questions such as:
1. *“What is the average revenue?”*
2. *“Which category has the highest sales?”*
3. *“Show the top 10 customers.”*
4. *“Which month had the highest sales?”*
5. *“What are the strongest correlations?”*
6. *“Are there any unusual values?”*
7. *“Summarize this dataset.”*
8. *“Show customers with revenue greater than 50000.”*
9. *“Which region performs best?”*
10. *“What percentage of sales comes from the top 10 products?”*

---

## 8. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/datasets/upload` | Upload CSV, XLSX, XLS, or JSON dataset |
| `POST` | `/api/datasets/demo` | Load built-in demo dataset (Retail, SaaS, Workforce) |
| `GET` | `/api/datasets` | List all user datasets |
| `GET` | `/api/datasets/{id}` | Get dataset metadata |
| `GET` | `/api/datasets/{id}/preview` | Spreadsheet view with pagination, search, and sorting |
| `GET` | `/api/datasets/{id}/profile` | Schema profiling, types, and quality scoring |
| `POST` | `/api/datasets/{id}/clean` | Execute imputation, deduplication, and cleaning |
| `GET` | `/api/datasets/{id}/statistics` | Numerical statistics (mean, std, quartiles) & correlation matrix |
| `GET` | `/api/datasets/{id}/visualizations`| Auto-generated chart configurations (Recharts) |
| `GET` | `/api/datasets/{id}/insights` | Automated insights and structured dataset summary |
| `POST` | `/api/datasets/{id}/ask` | Natural language question Q&A endpoint |
| `GET` | `/api/datasets/{id}/history` | Retrieve conversation history |
| `DELETE` | `/api/datasets/{id}/history` | Clear conversation history |
| `POST` | `/api/datasets/{id}/report` | Compile executive PDF report |
| `GET` | `/api/datasets/{id}/reports/{rid}/download` | Download compiled PDF report |
| `GET` | `/api/datasets/{id}/export` | Export cleaned dataset as CSV or Excel |
| `DELETE`| `/api/datasets/{id}` | Delete dataset, profile, and files |

---

## 9. Security & Safety

- **Controlled Analysis Layer**: Never executes arbitrary, unvalidated user-provided Python scripts or raw LLM-generated code.
- **Input Sanitization**: File type, size limit (50MB), and MIME inspection on all uploads.
- **SQL Injection Prevention**: Full ORM isolation via SQLAlchemy / PostgreSQL.
- **Offline Fallback Engine**: Fully functions locally even without external LLM API access.

---

## 10. Docker Deployment

Deploy with Docker Compose:
```bash
docker-compose up --build
```
This launches:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **PostgreSQL**: Port 5432

---

## 11. Testing

Run all backend integration tests:
```bash
$env:PYTHONPATH="."; backend\venv\Scripts\python -m pytest backend/tests -v
```

---

## 12. License

Distributed under the **MIT License**.

**Ask Your Data** — *Upload your data. Ask questions. Discover insights.*
