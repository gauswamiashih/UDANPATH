import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("--- DEBUGGING GEMINI API ---")
try:
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"
    res = httpx.get(url)
    print(f"Gemini list models status: {res.status_code}")
    print(f"Gemini response body snippet: {res.text[:500]}")
except Exception as e:
    print(f"Gemini list models error: {e}")

print("\n--- DEBUGGING SUPABASE REST ---")
try:
    # Test Supabase REST with apikey and Authorization header
    headers_anon = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    url_db = f"{SUPABASE_URL}/rest/v1/"
    res = httpx.get(url_db, headers=headers_anon)
    print(f"Supabase REST with Anon Key status: {res.status_code}")
    print(f"Supabase REST body: {res.text[:300]}")

    headers_service = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"
    }
    res_svc = httpx.get(url_db, headers=headers_service)
    print(f"Supabase REST with Service Role Key status: {res_svc.status_code}")
    print(f"Supabase REST Service body: {res_svc.text[:300]}")
except Exception as e:
    print(f"Supabase REST error: {e}")
