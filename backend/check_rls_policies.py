import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
try:
    print("Querying database policies...")
    # Executing select on pg_policies table or pg_tables
    # Since pg_policies is a system view, postgrest might not expose it unless mapped.
    # Let's try RPC or listing tables
    res = client.table("exam_categories").select("*").limit(1).execute()
    print("Success reading categories:", res.data)
except Exception as e:
    print("Error:", e)
