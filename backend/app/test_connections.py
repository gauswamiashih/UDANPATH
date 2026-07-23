"""
UDANPATH Automated Connection Verification Script
Tests Database, Auth, Storage, and Gemini AI connections.
"""

import sys
import json
from app.core.supabase_client import supabase_backend_service
from app.core.gemini_client import gemini_ai_service

def main():
    print("=========================================================")
    print("   UDANPATH MULTI-SERVICE CONNECTION VERIFICATION TEST   ")
    print("=========================================================\n")

    print("[1/4] Verifying Supabase Database Connection...")
    db_res = supabase_backend_service.verify_database_connection()
    print(f"Result: {json.dumps(db_res, indent=2)}\n")

    print("[2/4] Verifying Supabase Auth Service...")
    auth_res = supabase_backend_service.verify_auth_connection()
    print(f"Result: {json.dumps(auth_res, indent=2)}\n")

    print("[3/4] Verifying Supabase Storage Service...")
    storage_res = supabase_backend_service.verify_storage_connection()
    print(f"Result: {json.dumps(storage_res, indent=2)}\n")

    print("[4/4] Verifying Google Gemini AI Connection...")
    ai_res = gemini_ai_service.verify_ai_connection()
    print(f"Result: {json.dumps(ai_res, indent=2)}\n")

    print("=========================================================")
    print("              VERIFICATION TEST COMPLETED                ")
    print("=========================================================")

if __name__ == "__main__":
    main()
