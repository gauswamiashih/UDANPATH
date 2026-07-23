import os
import json
import httpx
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

print("=========================================================")
print("       TESTING GOOGLE OAUTH WITH SUPABASE AUTH           ")
print("=========================================================\n")

try:
    sp = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    res = sp.auth.sign_in_with_oauth({
        "provider": "google",
        "options": {
            "redirect_to": "http://localhost:8000/auth.html"
        }
    })
    
    print("[1] OAuth Provider Initialization:")
    print(f"  URL Generated: {res.url[:120]}...")
    print(f"  Provider: {res.provider}")
    
    if "google" in res.url.lower() or "supabase" in res.url.lower():
        print("  [OK] Supabase Google OAuth URL generated successfully!")
    else:
        print("  [WARN] Unexpected OAuth URL format:", res.url)

    print("\n[2] Testing HTTP GET reachability of Google OAuth authorization endpoint...")
    with httpx.Client(follow_redirects=False) as client:
        r = client.get(res.url)
        print(f"  HTTP Response Status: {r.status_code}")
        if r.status_code in [200, 302, 303, 307]:
            print("  [OK] Google OAuth endpoint is reachable and responding!")
            if "location" in r.headers:
                print(f"  Redirect location: {r.headers['location'][:120]}...")
        else:
            print(f"  [NOTE] Response status: {r.status_code}, Body: {r.text[:200]}")

except Exception as e:
    print(f"❌ Google OAuth test failed: {e}")

print("\n=========================================================")
