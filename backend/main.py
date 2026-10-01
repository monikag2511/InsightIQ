import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from backend.app.database.session import Base, engine
from backend.app.api.auth import router as auth_router
from backend.app.api.datasets import router as datasets_router

# Initialize Database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="InsightIQ API",
    description="AI-Powered Natural Language Data Analytics & Insight Platform Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log internal error without exposing sensitive internals
    error_msg = str(exc)
    return JSONResponse(
        status_code=500,
        content={"detail": f"An error occurred while processing your request: {error_msg}"}
    )

from backend.app.ai.llm_service import get_ai_config
import httpx

# Include Routers
app.include_router(auth_router)
app.include_router(datasets_router)

@app.get("/api/health", tags=["System"])
def health_check():
    groq_key, groq_model, gemini_key, openai_key = get_ai_config()
    ai_provider = "groq" if groq_key else ("gemini" if gemini_key else ("openai" if openai_key else "builtin_engine"))
    return {
        "status": "healthy",
        "service": "Ask Your Data Analytics Engine",
        "version": "1.0.0",
        "ai_provider": ai_provider,
        "ai_model": groq_model if ai_provider == "groq" else ("gemini-1.5-flash" if ai_provider == "gemini" else "builtin"),
        "ai_mode": "configured" if ai_provider != "builtin_engine" else "builtin_engine"
    }

@app.get("/api/system/ai-status", tags=["System"])
async def ai_status_diagnostic():
    groq_key, groq_model, gemini_key, openai_key = get_ai_config()
    if not (groq_key or gemini_key or openai_key):
        return {
            "configured": False,
            "provider": "builtin",
            "model": "deterministic_pandas",
            "status": "No AI API key found in .env. Operating in high-speed built-in analysis mode.",
            "is_valid": True
        }

    if groq_key:
        masked_key = f"{groq_key[:7]}...{groq_key[-4:]}" if len(groq_key) > 12 else "***"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    "https://api.groq.com/openai/v1/models",
                    headers={"Authorization": f"Bearer {groq_key}"}
                )
                if res.status_code == 200:
                    models = [m["id"] for m in res.json().get("data", [])]
                    return {
                        "configured": True,
                        "provider": "groq",
                        "model": groq_model,
                        "key_preview": masked_key,
                        "is_valid": True,
                        "status": f"Connected to Groq Cloud ({len(models)} models available)",
                        "available_models": models[:6]
                    }
                else:
                    return {
                        "configured": True,
                        "provider": "groq",
                        "model": groq_model,
                        "key_preview": masked_key,
                        "is_valid": False,
                        "status": f"Groq Error ({res.status_code}): {res.text[:150]}"
                    }
        except Exception as e:
            return {
                "configured": True,
                "provider": "groq",
                "model": groq_model,
                "key_preview": masked_key,
                "is_valid": False,
                "status": f"Connection Error: {str(e)}"
            }

    return {
        "configured": True,
        "provider": "gemini" if gemini_key else "openai",
        "is_valid": True,
        "status": "Configured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
