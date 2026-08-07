import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
tables = ["exams", "exam_eligibility", "exam_patterns", "syllabus_topics", "career_salaries", "exam_resources", "user_bookmarks", "user_study_progress", "ai_interaction_logs", "syllabus_embeddings"]

for table in tables:
    try:
        print(f"Testing insert to {table}...")
        # Try insert dummy
        res = client.table(table).insert({"id": "00000000-0000-0000-0000-000000000000"}).execute()
        print(f"  Insert to {table} succeeded!")
    except Exception as e:
        print(f"  Insert to {table} failed: {e}")
