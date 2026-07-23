import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

print("Initializing supabase client with anon key...")
client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
print("Executing select query...")
try:
    res = client.table("exams").select("id").limit(1).execute()
    print("Success, exams found:", len(res.data))
except Exception as e:
    print("Error:", e)
print("Done!")
