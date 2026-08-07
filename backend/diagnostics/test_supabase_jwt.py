import os
import json
import httpx
import jwt
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY").strip('"\' ')
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY").strip('"\' ')

print("--- DECODING JWT KEYS ---")
try:
    decoded_anon = jwt.decode(SUPABASE_ANON_KEY, options={"verify_signature": False})
    print("Decoded Anon Key:", json.dumps(decoded_anon, indent=2))
except Exception as e:
    print("Anon decode error:", e)

try:
    decoded_svc = jwt.decode(SUPABASE_SERVICE_ROLE_KEY, options={"verify_signature": False})
    print("Decoded Service Key:", json.dumps(decoded_svc, indent=2))
except Exception as e:
    print("Service decode error:", e)

print("\n--- TESTING SUPABASE TABLE ENDPOINTS ---")
headers_anon = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json"
}

headers_svc = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

# 1. Auth Health
r_auth = httpx.get(f"{SUPABASE_URL}/auth/v1/health", headers=headers_anon)
print(f"Auth Health (/auth/v1/health): status {r_auth.status_code}, body: {r_auth.text}")

# 2. Storage Buckets
r_storage = httpx.get(f"{SUPABASE_URL}/storage/v1/bucket", headers=headers_svc)
print(f"Storage Buckets (/storage/v1/bucket): status {r_storage.status_code}, body: {r_storage.text}")

# 3. REST Table exams
r_table = httpx.get(f"{SUPABASE_URL}/rest/v1/exams?select=*", headers=headers_svc)
print(f"REST exams table (/rest/v1/exams): status {r_table.status_code}, body: {r_table.text[:300]}")
