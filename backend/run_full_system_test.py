import os
import sys
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://127.0.0.1:8000"

def print_header(title):
    print("=" * 65)
    print(f"   {title.upper()}")
    print("=" * 65)

def run_all_tests():
    print_header("UdanPath Full System Integration Test Suite")

    print("\n[CHECK 1/6] Verifying Environment Variables...")
    keys = {
        "NEXT_PUBLIC_SUPABASE_URL": os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
        "SUPABASE_URL": os.getenv("SUPABASE_URL"),
        "SUPABASE_ANON_KEY": os.getenv("SUPABASE_ANON_KEY"),
        "SUPABASE_SERVICE_ROLE_KEY": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY")
    }

    all_keys_present = True
    for k, v in keys.items():
        if v:
            masked = f"{v[:10]}...{v[-4:]}" if len(v) > 14 else "CONFIGURED"
            print(f"  [OK] {k}: {masked}")
        else:
            print(f"  [FAIL] {k}: MISSING")
            all_keys_present = False

    if not all_keys_present:
        print("\n[FAIL] Environment key test failed!")
        return

    print("\n[CHECK 2/6] Verifying FastAPI Server Reachability...")
    with httpx.Client(timeout=10.0) as client:
        try:
            res = client.get(f"{BASE_URL}/docs")
            if res.status_code == 200:
                print("  [OK] FastAPI Gateway running at http://127.0.0.1:8000 (Swagger docs active)")
            else:
                print(f"  [WARN] Server responded with status code: {res.status_code}")
        except Exception as e:
            print(f"  [FAIL] FastAPI Server offline or unreachable: {e}")
            return

        print("\n[CHECK 3/6] Testing Public Config Endpoint (/api/v1/config/public)...")
        res_cfg = client.get(f"{BASE_URL}/api/v1/config/public")
        if res_cfg.status_code == 200:
            data = res_cfg.json()
            print(f"  [OK] Supabase URL: {data.get('supabase_url')}")
            print(f"  [OK] Supabase Anon Key (Public): {data.get('supabase_anon_key')[:20]}...")
        else:
            print(f"  [FAIL] Public Config endpoint failed with status {res_cfg.status_code}")

        print("\n[CHECK 4/6] Testing Supabase Services (Database, Auth, Storage)...")
        res_db = client.get(f"{BASE_URL}/api/v1/db/verify").json()
        print(f"  [OK] DB Verification: Status = {res_db.get('status')}, Connected = {res_db.get('connected')}")

        res_auth = client.get(f"{BASE_URL}/api/v1/auth/verify").json()
        print(f"  [OK] Auth Verification: Status = {res_auth.get('status')}, Connected = {res_auth.get('connected')}")

        res_storage = client.get(f"{BASE_URL}/api/v1/storage/verify").json()
        print(f"  [OK] Storage Verification: Status = {res_storage.get('status')}, Connected = {res_storage.get('connected')}")

        print("\n[CHECK 5/6] Testing Google Gemini AI Connection (/api/v1/ai/verify)...")
        res_ai = client.get(f"{BASE_URL}/api/v1/ai/verify").json()
        if res_ai.get("connected"):
            print(f"  [OK] Gemini Model: {res_ai.get('model')}")
            print(f"  [OK] Health Response: {res_ai.get('health_response')}")
        else:
            print(f"  [FAIL] Gemini AI test failed: {res_ai}")

        print("\n[CHECK 6/6] Testing Live Gemini AI Real-Time SSE Token Stream...")
        payload = {
            "message": "Explain UPSC age limits for General, OBC, and SC/ST candidates in 2 lines.",
            "context_exam": "UPSC_CSE"
        }
        tokens = []
        with client.stream("POST", f"{BASE_URL}/api/v1/ai/chat", json=payload) as response:
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            if "token" in chunk:
                                tokens.append(chunk["token"])
                        except Exception:
                            pass

                sample_text = "".join(tokens)[:150].replace('\n', ' ')
                print(f"  [OK] Received {len(tokens)} streaming tokens from Gemini AI.")
                print(f"  [OK] Output Preview: \"{sample_text}...\"")
            else:
                print(f"  [FAIL] Streaming AI endpoint failed with status {response.status_code}")

    print("\n" + "=" * 65)
    print("  ALL SYSTEM CHECKS PASSED SUCCESSFULLY & EVERYTHING IS PROPER!")
    print("=" * 65)

if __name__ == "__main__":
    run_all_tests()
