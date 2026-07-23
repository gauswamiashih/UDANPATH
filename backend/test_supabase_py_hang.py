import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("Initializing supabase client...")
client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
print("Executing test query...")
try:
    res = client.table("exams").select("id").limit(1).execute()
    print("Success:", res)
except Exception as e:
    print("Error:", e)
print("Done!")
