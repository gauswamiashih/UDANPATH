"""
UDANPATH Server-Side Authentication & Authorization
Verifies Supabase JWTs against Supabase Auth service and enforces role-based access control.
"""

import os
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status

try:
    from app.core.config import settings
except Exception:
    class _SettingsFallback:
        SUPABASE_URL = None
        SUPABASE_ANON_KEY = None
        SUPABASE_SERVICE_ROLE_KEY = None
    settings = _SettingsFallback()

try:
    from app.core.supabase_client import supabase_backend_service
except Exception:
    supabase_backend_service = None


def _verify_token_via_rest(supabase_url: str, anon_key: str, token: str) -> Optional[Dict[str, Any]]:
    """Verifies token via standard library urllib without requiring external dependencies."""
    try:
        auth_url = f"{supabase_url.rstrip('/')}/auth/v1/user"
        req = urllib.request.Request(
            auth_url,
            headers={
                "apikey": anon_key,
                "Authorization": f"Bearer {token}",
                "User-Agent": "UDANPATH-Backend-Auth/1.0"
            },
            method="GET"
        )
        with urllib.request.urlopen(req, timeout=6.0) as resp:
            if resp.status == 200:
                body = resp.read().decode("utf-8")
                return json.loads(body)
    except Exception:
        pass
    return None


async def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies the Supabase JWT token server-side.
    Attempts verification via Supabase Python SDK client first, then falls back
    to direct HTTP verification against the Supabase Auth /user endpoint.
    """
    if not token or not token.strip():
        return None

    # 1. Attempt verification via Supabase Python client if initialized
    if supabase_backend_service and hasattr(supabase_backend_service, "get_client"):
        try:
            client = supabase_backend_service.get_client()
            if client:
                res = client.auth.get_user(token)
                if hasattr(res, "user") and res.user:
                    u = res.user
                    return {
                        "id": getattr(u, "id", None),
                        "email": getattr(u, "email", None),
                        "app_metadata": getattr(u, "app_metadata", {}) or {},
                        "user_metadata": getattr(u, "user_metadata", {}) or {},
                        "role": getattr(u, "role", None),
                    }
                elif isinstance(res, dict) and "id" in res:
                    return res
        except Exception:
            # SDK verification failed; proceed to verify via REST API
            pass

    # 2. Direct HTTP verification against Supabase Auth service endpoint
    supabase_url = (
        getattr(settings, "SUPABASE_URL", None) or 
        os.getenv("SUPABASE_URL") or 
        os.getenv("NEXT_PUBLIC_SUPABASE_URL") or 
        "https://hrvaxxyvwwpnoajiixey.supabase.co"
    )
    
    anon_key = (
        getattr(settings, "SUPABASE_ANON_KEY", None) or 
        os.getenv("SUPABASE_ANON_KEY") or 
        getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", None) or 
        os.getenv("SUPABASE_SERVICE_ROLE_KEY") or 
        os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmF4eHl2d3dwbm9hamlpeGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NjQ4MjYsImV4cCI6MjEwMDM0MDgyNn0.dVCy66ZQkHs_vUfcOmFzXKAYmuR-8UFtsHhaa_iAKeQ"
    )

    if supabase_url and anon_key:
        return _verify_token_via_rest(supabase_url, anon_key, token)

    return None


def check_is_admin(user: Dict[str, Any]) -> bool:
    """
    Checks if a verified user has administrator privileges.
    Checks user email and server-authoritative app_metadata role claims.
    """
    if not user:
        return False

    email = user.get("email")
    if email and email.lower() == "admin@udanpath.in":
        return True

    app_metadata = user.get("app_metadata", {})
    if isinstance(app_metadata, dict):
        if app_metadata.get("role") == "admin" or "admin" in app_metadata.get("roles", []):
            return True

    user_metadata = user.get("user_metadata", {})
    if isinstance(user_metadata, dict) and user_metadata.get("role") == "admin":
        return True

    if user.get("role") == "admin":
        return True

    return False


async def get_current_admin_user(
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> Dict[str, Any]:
    """
    FastAPI dependency that enforces authentication and admin authorization.
    Rejects unauthenticated requests with HTTP 401.
    Rejects authenticated non-admin users with HTTP 403.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: Missing Authorization header"
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'"
        )

    token = parts[1]
    user = await verify_supabase_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session"
        )

    if not check_is_admin(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin privileges required"
        )

    return user
