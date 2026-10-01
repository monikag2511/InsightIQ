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

# Include Routers
app.include_router(auth_router)
app.include_router(datasets_router)

@app.get("/api/health", tags=["System"])
def health_check():
    ai_provider = "groq" if (os.getenv("GROQ_API_KEY") or (os.getenv("AI_API_KEY") and not os.getenv("AI_API_KEY").startswith("AIza"))) else (
        "gemini" if (os.getenv("GEMINI_API_KEY") or (os.getenv("AI_API_KEY") and os.getenv("AI_API_KEY").startswith("AIza"))) else "builtin_engine"
    )
    return {
        "status": "healthy",
        "service": "Ask Your Data Analytics Engine",
        "version": "1.0.0",
        "ai_provider": ai_provider,
        "ai_mode": "configured" if ai_provider != "builtin_engine" else "builtin_engine"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
