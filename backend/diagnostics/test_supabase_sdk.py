import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("1. Creating Supabase Client with Anon Key...")
try:
    sp_anon = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    print("Anon client initialized successfully.")
except Exception as e:
    print("Anon client error:", e)

print("2. Creating Supabase Client with Service Role Key...")
try:
    sp_svc = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print("Service Role client initialized successfully.")
except Exception as e:
    print("Service Role client error:", e)

print("3. Testing client auth status...")
try:
    print("Auth session:", sp_anon.auth.get_session())
except Exception as e:
    print("Auth session status:", e)
