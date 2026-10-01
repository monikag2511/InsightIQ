# InsightIQ

### AI-Powered Natural Language Data Analytics & Insight Platform

> **“Turn Data Into Decisions.”**  
> *Upload your data. Ask questions. Discover insights.*

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

**InsightIQ** is a full-stack, enterprise-grade AI analytics platform designed to bridge the gap between raw datasets and decision-makers. Traditional data intelligence requires writing complex SQL queries, building custom Python notebooks, and configuring business intelligence dashboards. InsightIQ transforms raw tabular files (**CSV, XLSX, XLS, and JSON**) into interactive visualizations, data quality audits, exploratory statistical metrics, and deterministic conversational answers using natural language.

---

## 2. Problem Statement & The InsightIQ Solution

### The Challenge
* **Code-Barrier**: Business operators and domain experts often lack the Python/SQL skills needed to extract rapid answers from datasets.
* **LLM Hallucinations**: Standard Generative AI chatbots often invent numerical results, skewing critical business decisions.
* **Dirty Data**: Datasets frequently arrive with missing values, duplicate entries, schema mismatches, and extreme outliers.

### The InsightIQ Architecture
InsightIQ enforces a strict **Controlled Analytical Architecture** where numbers are never fabricated.

```text
User Question
      ↓
AI interprets intent
      ↓
Controlled analysis engine
      ↓
Pandas performs calculation
      ↓
Actual result
      ↓
AI explains result
      ↓
Frontend response (KPI / Table / Chart / Mixed)
```

---

## 3. Core Features

### 📁 Smart Data Ingestion
- Upload **CSV, XLSX, XLS, and JSON** files up to 50MB.
- Automatic column type classification into **Numerical, Categorical, Boolean, Date/Time, and Text**.
- Instant profiling of missing cells, cardinality, and sample values.

### 🧹 Automated Data Quality & Cleaning
- **Missing Value Imputation**: Fill using Mean, Median, Mode, or drop rows.
- **Duplicate Row Detection**: One-click deduplication.
- **Outlier Auditing**: Statistical anomaly detection using **Interquartile Range (IQR)** bounds.
- **Composite Quality Score**: 0–100% data integrity rating updated dynamically.

### 📊 Intelligent Visualization Engine
Rule-based recommendation engine generating interactive Recharts components:
- **Date + Numerical** $\rightarrow$ Temporal Trend Line Chart
- **Categorical + Numerical** $\rightarrow$ Ranked Bar Chart
- **Two Numerical Columns** $\rightarrow$ Correlation Scatter Plot
- **Single Categorical Column** $\rightarrow$ Composition Donut / Pie Chart
- **Numerical Feature** $\rightarrow$ Binned Frequency Histogram
- **Matrix Correlation** $\rightarrow$ Pearson Grid Heatmap

### 🤖 Ask InsightIQ (Natural Language Query Engine)
Conversational interface answering tabular questions deterministically:
- *"What is the average revenue?"* $\rightarrow$ Computes `mean(revenue)` and returns an executive KPI card.
- *"Which category has the highest sales?"* $\rightarrow$ Performs `groupby(category).sum(sales)` and returns a mixed response with an interactive Bar Chart.
- *"Show me the top 10 customers."* $\rightarrow$ Returns a ranked tabular breakdown.
- *"Are there any outliers?"* $\rightarrow$ Audits statistical bounds across all features.
- *"Which month had the highest sales?"* $\rightarrow$ Aggregates time-series by month.

### 💡 Automated Actionable Insights
- Automatic discovery of dominant categories, seasonal peaks, growth trajectories, and significant linear correlations ($r \ge 0.4$).
- Executive 6-part AI summary: Dataset Overview, Key Trends, Important Categories, Potential Problems, Interesting Patterns, and Overall Summary.

### 📑 Executive PDF & Dataset Export
- Publication-quality vector PDF reports generated via **ReportLab**.
- One-click export of cleaned datasets to **CSV** or **Microsoft Excel (.xlsx)**.

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16+ (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts |
| **Backend** | Python 3.11 / 3.13, FastAPI, Pandas, NumPy, Scikit-learn, SciPy, OpenPyXL |
| **Database** | PostgreSQL 16 (production/Docker) & SQLAlchemy 2.0 (with SQLite zero-config fallback) |
| **Authentication** | JWT (JSON Web Tokens) with passlib & bcrypt hashing |
| **Document Engine**| ReportLab 4.1+ (PDF compilation) |
| **AI Gateway** | Controlled NLP Intent Parser + Google Gemini / OpenAI REST integration (with offline Fallback Engine) |
| **DevOps** | Docker, Docker Compose |

---

## 5. System Workflow

```text
Upload Dataset (CSV/XLSX/JSON)
      ↓
Automatic Data Profiling & Quality Scoring
      ↓
Data Cleaning & Anomaly Remediation
      ↓
Exploratory Data Analysis (EDA) & Pearson Correlations
      ↓
Intelligent Chart Recommendations
      ↓
Conversational Natural Language Queries
      ↓
Executive PDF & Spreadsheet Export
```

---

## 6. Project Structure

```text
InsightIQ/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Modern SaaS Landing Page
│   │   ├── login/page.tsx              # User Authentication (Sign In)
│   │   ├── register/page.tsx           # User Registration
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Analytics Sidebar & Header
│   │   │   ├── page.tsx                # Overview & 5 KPI Cards
│   │   │   ├── preview/page.tsx        # Spreadsheet Table with Backend Pagination
│   │   │   ├── quality/page.tsx        # Data Quality & Cleaning Module
│   │   │   ├── analytics/page.tsx      # Statistical EDA & Correlation Matrix
│   │   │   ├── visualizations/page.tsx  # Auto-Generated Recharts Gallery
│   │   │   ├── ask/page.tsx            # Ask InsightIQ Conversational Interface
│   │   │   ├── insights/page.tsx       # Actionable Data Insights & AI Summary
│   │   │   ├── reports/page.tsx        # Executive Report & Export Center
│   │   │   └── settings/page.tsx       # System Environment & Dataset Controls
│   ├── components/
│   │   ├── Navbar.tsx                  # Header with Dataset Switcher & Dark Mode
│   │   ├── Sidebar.tsx                 # Navigation Sidebar
│   │   ├── UploadModal.tsx             # Drag-and-Drop Ingestion Modal
│   │   └── Charts/
│   │       └── UniversalChart.tsx      # Recharts Dynamic Chart Renderer
│   ├── context/
│   │   └── DatasetContext.tsx          # Global Dataset & Theme State
│   ├── services/
│   │   └── api.ts                      # Full REST API Client SDK
│   └── types/                          # TypeScript Definitions
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py                 # JWT Authentication Endpoints
│   │   │   └── datasets.py             # 15+ Core REST Analytics Endpoints
│   │   ├── models/
│   │   │   └── models.py               # SQLAlchemy Database Models
│   │   ├── schemas/
│   │   │   └── schemas.py              # Pydantic Request/Response Models
│   │   ├── analysis/
│   │   │   ├── loader.py               # Multi-Format File Ingestion
│   │   │   ├── profiler.py             # Schema Inference & Quality Scoring
│   │   │   ├── cleaner.py              # Data Imputation & Deduplication
│   │   │   ├── statistics.py           # Descriptive Statistics & Correlations
│   │   │   ├── visualizer.py           # Chart Recommendation Engine
│   │   │   ├── insights.py             # Actionable Insights Generator
│   │   │   └── query_engine.py         # Controlled Natural Language Pandas Engine
│   │   ├── ai/
│   │   │   └── llm_service.py          # LLM Gateway & Resilient Fallback Engine
│   │   ├── database/
│   │   │   └── session.py              # Database Sessionmaker
│   │   ├── services/
│   │   │   ├── auth.py                 # Password Hashing & Token Verification
│   │   │   └── report_generator.py     # ReportLab PDF Compiler
│   │   └── utils/
│   │       └── demo_generator.py       # Realistic Retail Dataset Synthesizer
│   ├── tests/
│   │   └── test_insightiq.py           # Full Pytest Test Suite
│   ├── main.py                         # FastAPI Entrypoint
│   └── requirements.txt
├── data/
│   └── demo/                           # Synthesized Retail Sales Demo Dataset
├── docker-compose.yml                  # Full-Stack Multi-Container Orchestration
├── .env.example
├── .gitignore
└── README.md
```

---

## 7. Installation & Quick Start

### Prerequisites
- **Python**: Version 3.10+ (tested on Python 3.11 and 3.13)
- **Node.js**: Version 18+ (tested on Node v24)
- **Git**

### Clone the Repository
```bash
git clone https://github.com/your-username/InsightIQ.git
cd InsightIQ
```

---

### Backend Setup

1. **Create and Activate Virtual Environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv backend/venv
   .\backend\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv backend/venv
   source backend/venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r backend/requirements.txt email-validator
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   *(By default, SQLite is used out-of-the-box. To use PostgreSQL, set `DATABASE_URL=postgresql://user:password@localhost:5432/insightiq`)*.

4. **Run Pytest Test Suite**:
   ```bash
   pytest backend/tests
   ```

5. **Start Backend Server**:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   API Documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### Frontend Setup

1. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Next.js Development Server**:
   ```bash
   npm run dev
   ```

3. **Open the Web Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

### Docker Deployment

To spin up PostgreSQL, the FastAPI backend, and the Next.js frontend with a single command:
```bash
docker-compose up --build
```

---

## 8. Built-in Realistic Retail Demo Dataset

InsightIQ includes an autonomous realistic dataset generator (`backend/app/utils/demo_generator.py`) modeling **Global Retail Sales**:
- **Dimensions**: `Order_ID`, `Order_Date`, `Customer_Name`, `Region`, `Category`, `Product`, `Quantity`, `Unit_Price`, `Sales`, `Profit`.
- **Realistic Features**: Realistic category margins, seasonal Q4 spikes, volume discounts, controlled missing values, and statistical outliers to showcase data cleaning and audits.
- Click **“Try Demo Dataset”** anywhere in the interface to explore immediately!

---

## 9. Example Natural Language Questions

InsightIQ's controlled query engine accurately processes questions such as:
* *“What is the average revenue?”*
* *“Which category has the highest sales?”*
* *“Show me the top 10 customers.”*
* *“Which month had the highest sales?”*
* *“Which region is performing best?”*
* *“What are the strongest correlations?”*
* *“Are there any outliers?”*
* *“Summarize this dataset.”*
* *“Show customers with revenue above 50000.”*

---

## 10. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new analyst account |
| `POST` | `/api/auth/login` | Login and receive JWT bearer token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/datasets/upload` | Upload CSV, XLSX, XLS, or JSON dataset |
| `POST` | `/api/datasets/demo` | Initialize Global Retail Sales demo dataset |
| `GET` | `/api/datasets` | List all available datasets |
| `GET` | `/api/datasets/{id}` | Retrieve dataset metadata |
| `GET` | `/api/datasets/{id}/preview` | Spreadsheet view with backend pagination and search |
| `GET` | `/api/datasets/{id}/profile` | Schema inference and data quality audit |
| `POST` | `/api/datasets/{id}/clean` | Execute imputation, deduplication, and outlier trimming |
| `GET` | `/api/datasets/{id}/statistics` | Descriptive statistics (mean, std, IQR) and correlation matrix |
| `GET` | `/api/datasets/{id}/visualizations`| Intelligent visualization payloads (Recharts) |
| `GET` | `/api/datasets/{id}/insights` | Actionable insights and strategic summary |
| `POST` | `/api/datasets/{id}/ask` | Natural language question query engine |
| `GET` | `/api/datasets/{id}/history` | Retrieve conversational message history |
| `DELETE` | `/api/datasets/{id}/history` | Clear conversational history |
| `POST` | `/api/datasets/{id}/report` | Compile executive ReportLab PDF report |
| `GET` | `/api/datasets/{id}/export` | Export dataset as CSV or Excel |
| `DELETE`| `/api/datasets/{id}` | Delete dataset, profile, and files |

---

## 11. Security & Quality Standards

- **Zero Arbitrary Execution**: Never evaluates unvalidated or LLM-generated Python code.
- **Secure Password Hashing**: Passwords hashed with salted `bcrypt`.
- **Sanitized Uploads**: Enforces 50MB file size limits and validates MIME signatures and parsing integrity before persistence.
- **Resilient Fallback Mode**: Gracefully operates 100% offline without any API keys, fulfilling all analytical operations deterministically.

---

## 12. Testing

The backend includes a comprehensive pytest suite covering ingestion, quality scoring, cleaning, statistics, query answering, and authentication:
```bash
pytest backend/tests -v
```

---

## 13. License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

**InsightIQ** — *Turn Data Into Decisions.*
