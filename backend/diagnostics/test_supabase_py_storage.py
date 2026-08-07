import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

print("Initializing supabase client with anon key...")
client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
print("Executing list_buckets...")
try:
    res = client.storage.list_buckets()
    print("Success:", res)
except Exception as e:
    print("Error:", e)
print("Done!")
