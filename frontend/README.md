# InsightIQ — Frontend Architecture & Guide

Welcome to the frontend application of **InsightIQ**, an enterprise-grade AI-powered tabular data analytics and insight platform. The frontend is built on **Next.js 16+ (App Router)**, **React 19**, **TypeScript**, and styled with **Tailwind CSS v4** featuring a responsive glassmorphic analytics design system.

---

## 🚀 Key Modules & Pages

The application is structured under the Next.js App Router (`frontend/app/`):

| Route | Name | Description |
|---|---|---|
| `/` | **Landing Page** | Portfolio-ready product presentation with interactive live preview, feature deep-dive, architecture diagram, and one-click demo dataset loading. |
| `/login` & `/register` | **Authentication** | JWT-based authentication with instant guest demo login and credential validation. |
| `/dashboard` | **Overview Hub** | Executive summary cards (Row count, Missing values, Column breakdown, Quality score, Quick queries). |
| `/dashboard/preview` | **Data Preview Table** | Spreadsheet-like virtualized data table with server-side pagination, sorting, search, and column filter drawers. |
| `/dashboard/quality` | **Quality & Cleaning** | Missing value imputation (Mean/Median/Mode/Drop), duplicate removal, IQR outlier detection, and clean dataset export. |
| `/dashboard/analytics` | **Statistical EDA** | Summary statistics (Mean, Median, Std Dev, Min, Max, Skewness, Kurtosis), distributions, and Pearson correlation matrix. |
| `/dashboard/visualizations` | **Smart Auto-Charts** | Intelligent visualizer automatically recommending Line, Bar, Scatter, Boxplot, and Donut charts based on column datatypes. |
| `/dashboard/ask` | **Ask InsightIQ** | Conversational chat interface executing natural language analytical queries deterministically via Pandas with AI insights. |
| `/dashboard/insights` | **Automated Insights** | Automated 6-section analytical breakdown: executive overview, key trends, dominant categories, anomalies, and recommendations. |
| `/dashboard/reports` | **Executive Reports** | One-click publication-grade PDF report generation (via ReportLab) and dataset export to CSV / Excel (.xlsx). |
| `/dashboard/settings` | **Settings** | API key management (Gemini / OpenAI optional fallback), system health status, and theme controls. |

---

## 🛠️ Tech Stack & Libraries

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & State:** React 19, TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with dark/light mode toggle
- **Visualizations:** [Recharts](https://recharts.org/) (Line, Bar, Area, Scatter, Pie/Donut, Heatmap)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Fetching:** Native fetch SDK with token authorization and auto-refresh in [`services/api.ts`](services/api.ts)
- **Global Context:** [`DatasetContext.tsx`](context/DatasetContext.tsx) managing current active dataset, profile cache, demo datasets, and theme preferences.

---

## 📁 Directory Structure

```text
frontend/
├── app/
│   ├── dashboard/
│   │   ├── analytics/page.tsx      # Descriptive stats & correlation
│   │   ├── ask/page.tsx            # Ask InsightIQ Natural Language Chat
│   │   ├── insights/page.tsx       # Auto-generated deep insights
│   │   ├── preview/page.tsx        # Interactive paginated spreadsheet
│   │   ├── quality/page.tsx        # Data cleaning & outlier audit
│   │   ├── reports/page.tsx        # PDF & tabular export generator
│   │   ├── settings/page.tsx       # System preferences & API keys
│   │   ├── visualizations/page.tsx # Auto-recommended Recharts
│   │   ├── layout.tsx              # Analytics dashboard layout & sidebar
│   │   └── page.tsx                # Dashboard summary & KPI overview
│   ├── login/page.tsx              # User login
│   ├── register/page.tsx           # User registration
│   ├── layout.tsx                  # Root layout & providers
│   ├── page.tsx                    # Landing page
│   └── globals.css                 # Global styles & Tailwind v4 theme tokens
├── components/
│   ├── Navbar.tsx                  # Marketing navigation header
│   ├── Sidebar.tsx                 # Dashboard navigation with dataset switcher
│   ├── Topbar.tsx                  # Dashboard header with dataset dropdown
│   ├── UploadModal.tsx             # Drag-and-drop file uploader & demo dataset selector
│   └── ChartCard.tsx               # Reusable responsive chart container
├── context/
│   └── DatasetContext.tsx          # Global dataset & auth state provider
├── services/
│   └── api.ts                      # Full REST API Client for the FastAPI backend
└── public/
    └── insightiq_preview.png       # Application preview graphic
```

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` if custom backend URL is desired:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production
```bash
npm run build
npm start
```
