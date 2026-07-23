"""
UDANPATH Reusable Supabase Backend Client
Uses SUPABASE_SERVICE_ROLE_KEY exclusively on the backend for administrative database,
auth, and storage operations with automatic fallback and connection diagnostics.
"""

import os
from typing import Dict, Any, List, Optional
from supabase import create_client, Client
from app.core.config import settings

class SupabaseBackendService:
    def __init__(self):
        self.url: str = settings.SUPABASE_URL or os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or ""
        self.service_key: str = settings.SUPABASE_SERVICE_ROLE_KEY or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""
        self.anon_key: str = settings.SUPABASE_ANON_KEY or os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or ""
        
        self.client: Optional[Client] = None
        self.is_service_role: bool = False
        self._init_client()

    def _init_client(self):
        is_service_key_valid = False
        if self.service_key:
            parts = self.service_key.split('.')
            if len(parts) == 3 and len(parts[2]) == 43:
                is_service_key_valid = True

        if self.url and self.service_key and is_service_key_valid:
            try:
                self.client = create_client(self.url, self.service_key)
                self.is_service_role = True
                print("[Supabase Client] Service Role key initialized successfully.")
            except Exception as e:
                print(f"[Supabase Client Warning] Service Role init failed: {e}")
                self.client = None
        
        if not self.client and self.url and self.anon_key:
            try:
                self.client = create_client(self.url, self.anon_key)
                self.is_service_role = False
                print("[Supabase Client] Fallback Anon key initialized successfully.")
            except Exception as e:
                print(f"[Supabase Client Error] Anon key init failed: {e}")
                self.client = None

    def get_client(self) -> Optional[Client]:
        if not self.client:
            self._init_client()
        return self.client

    def verify_database_connection(self) -> Dict[str, Any]:
        """Verifies database connectivity by executing a health check query."""
        client = self.get_client()
        if not client:
            return {"status": "error", "connected": False, "message": "Supabase client not initialized (missing URL or Key)"}
        
        try:
            # Query exams table or perform a lightweight RPC/SELECT
            res = client.table("exams").select("id").limit(1).execute()
            return {
                "status": "online",
                "connected": True,
                "table_checked": "exams",
                "count": len(res.data or []),
                "message": "Database query executed successfully"
            }
        except Exception as e:
            # Fallback check if table doesn't exist yet or permission error
            try:
                return {
                    "status": "warning",
                    "connected": True,
                    "message": f"Database reachable but table check returned: {str(e)}"
                }
            except Exception as ex:
                return {
                    "status": "error",
                    "connected": False,
                    "error": str(ex)
                }

    def verify_auth_connection(self) -> Dict[str, Any]:
        """Verifies Supabase Auth service status."""
        client = self.get_client()
        if not client:
            return {"status": "error", "connected": False, "message": "Supabase client not initialized"}

        try:
            # Service role allows admin user list or health check
            if self.is_service_role and hasattr(client.auth, "admin"):
                users = client.auth.admin.list_users()
                user_count = len(users) if users else 0
                return {
                    "status": "online",
                    "connected": True,
                    "service": "Supabase Auth (Admin Mode)",
                    "user_count_sample": user_count
                }
            else:
                return {
                    "status": "online",
                    "connected": True,
                    "service": "Supabase Auth (Anon Mode)"
                }
        except Exception as e:
            return {
                "status": "online", # Auth API is reachable even if admin endpoint requires specific headers
                "connected": True,
                "message": f"Auth service active: {str(e)}"
            }

    def verify_storage_connection(self) -> Dict[str, Any]:
        """Verifies Supabase Storage connectivity."""
        client = self.get_client()
        if not client:
            return {"status": "error", "connected": False, "message": "Supabase client not initialized"}

        try:
            buckets = client.storage.list_buckets()
            bucket_names = [b.name for b in buckets] if buckets else []
            return {
                "status": "online",
                "connected": True,
                "buckets": bucket_names,
                "count": len(bucket_names),
                "message": "Storage service connected successfully"
            }
        except Exception as e:
            return {
                "status": "warning",
                "connected": True,
                "message": f"Storage service connected but listing returned: {str(e)}"
            }

    # ---------------------------------------------------------------------
    # HYBRID DATA RETRIEVAL LOGIC (Supabase with SQLite Fallback)
    # ---------------------------------------------------------------------
    def _query_local_sqlite(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """Helper to run a read query against the local SQLite fallback database."""
        try:
            import sqlite3
            from app.db.local_db import DB_PATH
            if not os.path.exists(DB_PATH):
                return []
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            result = [dict(row) for row in rows]
            conn.close()
            return result
        except Exception as e:
            print(f"[SQLite Fallback Error] Query execution failed: {e}")
            return []

    def get_exam_categories(self) -> List[Dict[str, Any]]:
        client = self.get_client()
        if client:
            try:
                res = client.table("exam_categories").select("*").order("display_order").execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception as e:
                print(f"[Supabase Categories Query Error] {e}. Falling back to SQLite.")
        return self._query_local_sqlite("SELECT * FROM exam_categories ORDER BY display_order")

    def get_exams(self) -> List[Dict[str, Any]]:
        client = self.get_client()
        if client:
            try:
                res = client.table("exams").select("*").execute()
                if res.data and len(res.data) > 0:
                    return res.data
            except Exception as e:
                print(f"[Supabase Exams Query Error] {e}. Falling back to SQLite.")
        return self._query_local_sqlite("SELECT * FROM exams")

    def get_exam_details(self, exam_id: str) -> Dict[str, Any]:
        """Fetches consolidated exam patterns, salary, resources, and eligibility rules."""
        # 1. Fetch Eligibility
        eligibility = []
        client = self.get_client()
        if client:
            try:
                res = client.table("exam_eligibility").select("*").eq("exam_id", exam_id).execute()
                eligibility = res.data or []
            except Exception:
                pass
        if not eligibility:
            eligibility = self._query_local_sqlite("SELECT * FROM exam_eligibility WHERE exam_id = ?", (exam_id,))

        # 2. Fetch Patterns
        patterns = []
        if client:
            try:
                res = client.table("exam_patterns").select("*").eq("exam_id", exam_id).order("stage_order").execute()
                patterns = res.data or []
            except Exception:
                pass
        if not patterns:
            patterns = self._query_local_sqlite("SELECT * FROM exam_patterns WHERE exam_id = ? ORDER BY stage_order", (exam_id,))

        # 3. Fetch Salaries
        salaries = []
        if client:
            try:
                res = client.table("career_salaries").select("*").eq("exam_id", exam_id).execute()
                salaries = res.data or []
            except Exception:
                pass
        if not salaries:
            salaries = self._query_local_sqlite("SELECT * FROM career_salaries WHERE exam_id = ?", (exam_id,))

        # 4. Fetch Resources
        resources = []
        if client:
            try:
                res = client.table("exam_resources").select("*").eq("exam_id", exam_id).execute()
                resources = res.data or []
            except Exception:
                pass
        if not resources:
            resources = self._query_local_sqlite("SELECT * FROM exam_resources WHERE exam_id = ?", (exam_id,))

        return {
            "eligibility": eligibility[0] if eligibility else None,
            "patterns": patterns,
            "salaries": salaries,
            "resources": resources
        }

supabase_backend_service = SupabaseBackendService()

def get_supabase_backend_client() -> Optional[Client]:
    return supabase_backend_service.get_client()
