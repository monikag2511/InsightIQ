# 🚀 Deployment Guide: Ask Your Data / InsightIQ

This guide walks you through deploying the full-stack application:
- **Backend (FastAPI)**: Deployed on **Render** (free web service).
- **Frontend (Next.js 16)**: Deployed on **Vercel** (free edge hosting).

---

## Part 1: Deploy Backend to Render

### Option A: Using the Automated Blueprint (Recommended)
1. Go to [dashboard.render.com](https://dashboard.render.com) and log in.
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository: `https://github.com/monikag2511/InsightIQ`.
4. Render will automatically detect [`render.yaml`](./render.yaml).
5. Add your Environment Variables:
   - `GROQ_API_KEY`: *(Your Groq API key from .env)*
   - `GROQ_MODEL`: `openai/gpt-oss-120b`
6. Click **Apply**. Render will install dependencies and start your backend service!

---

### Option B: Manual Web Service Setup on Render
1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** > **Web Service**.
2. Select **Build and deploy from a Git repository** and pick `monikag2511/InsightIQ`.
3. Fill in the service configuration:
   | Setting | Value |
   | :--- | :--- |
   | **Name** | `insightiq-backend` (or your preferred name) |
   | **Language / Environment** | `Python 3` |
   | **Region** | Oregon (US West) or closest to you |
   | **Branch** | `main` |
   | **Root Directory** | *(Leave empty - repo root)* |
   | **Build Command** | `pip install -r backend/requirements.txt` |
   | **Start Command** | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
   | **Instance Type** | Free |

4. Scroll down to **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` |
   | `SECRET_KEY` | `askyourdata-super-secret-production-jwt-key-2026` |
   | `GROQ_API_KEY` | *(Your Groq API key from .env)* |
   | `GROQ_MODEL` | `openai/gpt-oss-120b` |
   | `DATABASE_URL` | *(Your Neon Tech Connection String, e.g. `postgresql://user:pass@ep-xyz-pooler.neon.tech/neondb?sslmode=require`)* |

> [!TIP]
> **Neon Tech Tip**: In your [Neon Console](https://console.neon.tech), copy the **Pooled connection** string (ending with `-pooler.neon.tech/neondb?sslmode=require`). It is optimized for serverless applications and FastAPI concurrency!

5. Click **Create Web Service**.
6. Wait 2-3 minutes for the build to finish. The backend will automatically create all tables (`users`, `datasets`, `conversations`, etc.) on Neon!
7. Once live, copy your backend URL:
   `https://insightiq-backend.onrender.com`

---

## Part 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `monikag2511/InsightIQ`.
4. Configure the project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `frontend` ⚠️ *(Crucial!)*
5. Expand **Environment Variables** and add:
   | Name | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | Your Render URL (e.g. `https://insightiq-backend.onrender.com`) |

6. Click **Deploy**!
7. Vercel will build Next.js (takes ~1 minute) and provide your live URL:
   `https://insight-iq-iota.vercel.app` (or similar).

---

## Part 3: Final Verification & CORS Sync

1. **Verify Backend Health**:
   Open in your browser:
   `https://your-backend.onrender.com/api/health`
   Should return:
   ```json
   {
     "status": "healthy",
     "service": "Ask Your Data Analytics Engine",
     "version": "1.0.0",
     "ai_provider": "groq",
     "ai_model": "openai/gpt-oss-120b"
   }
   ```

2. **Verify AI Diagnostic**:
   `https://your-backend.onrender.com/api/system/ai-status`
   Should return:
   ```json
   {
     "configured": true,
     "provider": "groq",
     "model": "openai/gpt-oss-120b",
     "is_valid": true,
     "status": "Connected to Groq Cloud"
   }
   ```

3. **CORS is Pre-configured**:
   The backend automatically allows all `*.vercel.app` domains out of the box via regex, so your frontend will immediately connect without CORS issues!
   *(Optional)* If you configure a custom domain later (e.g. `https://myinsightiq.com`), add `FRONTEND_URL=https://myinsightiq.com` in your Render Environment Variables.
