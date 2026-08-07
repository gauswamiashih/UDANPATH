import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

print("Checking tables in database:")
tables = ["users", "student_profiles", "exam_categories", "exams", "exam_eligibility", "exam_patterns", "syllabus_topics", "career_salaries", "exam_resources"]
for table in tables:
    try:
        res = supabase.table(table).select("*").limit(1).execute()
        print(f"Table '{table}' query successful, rows returned: {len(res.data)}")
    except Exception as e:
        print(f"Table '{table}' error: {e}")
