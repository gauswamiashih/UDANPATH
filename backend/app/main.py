"""
UDANPATH - FastAPI Multi-Service API Gateway
Connects Supabase Database, Auth, Storage & Google Gemini AI services with real-time streaming
and comprehensive connection verification endpoints.
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import asyncio
import json
import os
from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
from app.core.supabase_client import supabase_backend_service
from app.core.gemini_client import gemini_ai_service

app = FastAPI(
    title="UDANPATH Service Integration Gateway",
    description="Multi-Service Platform API Gateway powered by Supabase and Google Gemini AI",
    version="4.1.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str = Field(..., example="What are the latest GATE 2026/2027 registration dates?")
    context_exam: Optional[str] = "ALL"

@app.get("/api/v1/health", tags=["Health & System"])
def health_check():
    db_status = supabase_backend_service.verify_database_connection()
    auth_status = supabase_backend_service.verify_auth_connection()
    storage_status = supabase_backend_service.verify_storage_connection()
    ai_status = gemini_ai_service.verify_ai_connection()

    return {
        "status": "online",
        "service": "UDANPATH API Gateway",
        "version": "4.1.0",
        "services": {
            "database": db_status,
            "auth": auth_status,
            "storage": storage_status,
            "gemini_ai": ai_status
        }
    }

@app.get("/api/v1/config/public", tags=["Public Config"])
def get_public_config():
    """Provides public Supabase configuration for the frontend using Anon Key only."""
    url = settings.NEXT_PUBLIC_SUPABASE_URL or settings.SUPABASE_URL or os.getenv("SUPABASE_URL", "")
    anon_key = settings.NEXT_PUBLIC_SUPABASE_ANON_KEY or settings.SUPABASE_ANON_KEY or os.getenv("SUPABASE_ANON_KEY", "")
    
    return {
        "supabase_url": url,
        "supabase_anon_key": anon_key
    }

@app.get("/api/v1/db/verify", tags=["Verification"])
def verify_db():
    """Endpoint to verify database connection."""
    return supabase_backend_service.verify_database_connection()

@app.get("/api/v1/auth/verify", tags=["Verification"])
def verify_auth():
    """Endpoint to verify Supabase auth service."""
    return supabase_backend_service.verify_auth_connection()

@app.get("/api/v1/storage/verify", tags=["Verification"])
def verify_storage():
    """Endpoint to verify Supabase storage service."""
    return supabase_backend_service.verify_storage_connection()

@app.get("/api/v1/ai/verify", tags=["Verification"])
def verify_ai():
    """Endpoint to verify Google Gemini AI connection."""
    return gemini_ai_service.verify_ai_connection()

@app.post("/api/v1/ai/chat", tags=["Gemini AI Engine"])
async def stream_live_ai_chat(req: ChatRequest):
    """Streams real-time Gemini AI response with fallback handling."""
    return StreamingResponse(
        gemini_ai_service.stream_chat_response(req.message, req.context_exam),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
