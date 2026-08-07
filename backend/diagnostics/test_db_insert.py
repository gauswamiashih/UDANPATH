import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
try:
    print("Testing insert to exam_categories...")
    res = client.table("exam_categories").insert({
        "name": "Civil Services Test Category",
        "slug": "civil-services-test-cat",
        "description": "Test Category"
    }).execute()
    print("Insert succeeded:", res.data)
except Exception as e:
    print("Insert failed:", e)
