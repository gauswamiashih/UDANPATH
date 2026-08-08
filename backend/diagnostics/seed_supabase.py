import os
import uuid
import sys
from dotenv import load_dotenv

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

load_dotenv()

from app.core.supabase_client import supabase_backend_service

def make_uuid(name: str) -> str:
    NAMESPACE = uuid.UUID("3d813cbb-be45-4de4-85cf-b7c1f4e156cf")
    return str(uuid.uuid5(NAMESPACE, name))

import os
import uuid
import sys
import json
from dotenv import load_dotenv

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

load_dotenv()

from app.core.supabase_client import supabase_backend_service

def make_uuid(name: str) -> str:
    NAMESPACE = uuid.UUID("3d813cbb-be45-4de4-85cf-b7c1f4e156cf")
    return str(uuid.uuid5(NAMESPACE, name))

def seed_supabase():
    client = supabase_backend_service.get_client()
    if not client:
        print("Error: Supabase client not initialized. Check your environment keys.")
        return

    print("--- SEEDING SUPABASE DATABASE (NEW SCHEMA) ---")

    # 1. Categories
    categories_data = [
        ("cat-civ", "Civil Services", "civil-services", "Administrative and diplomatic careers.", "shield", 1),
        ("cat-eng", "Engineering & Technical", "engineering-technical", "PSU, R&D and core engineering roles.", "cpu", 2),
        ("cat-ssc", "Staff Selection & Railways", "ssc-railway", "Central Government executive and operations.", "landmark", 3),
        ("cat-bnk", "Banking & Finance", "banking-finance", "Nationalized and private sector banking.", "building", 4),
        ("cat-def", "Defence Services", "defence-services", "Officer commission in Army, Navy, Air Force.", "target", 5),
        ("cat-med", "Medical Sciences", "medical-sciences", "Post-graduate clinical and research roles.", "activity", 6),
        ("cat-mgt", "Management & General", "management-general", "MBA, Law and other premier PG entries.", "briefcase", 7),
        ("cat-sch", "Scholarships & Internships", "scholarships-internships", "Fellowships and corporate research roles.", "award", 8)
    ]
    
    categories = []
    for cid, name, slug, desc, icon, order in categories_data:
        categories.append({
            "id": make_uuid(cid),
            "name": name,
            "slug": slug,
            "description": desc,
            "icon_name": icon,
            "display_order": order
        })

    print(f"Upserting {len(categories)} categories...")
    client.table("exam_categories").upsert(categories).execute()

    # 2. Education Hierarchy
    edu_hierarchy = [
        {"id": make_uuid("edu-btech-ce"), "education_level": "Undergraduate", "degree": "B.Tech", "branch_name": "Computer Engineering", "aliases": ["Computer Science", "Computer Science & Engineering", "CS", "CSE", "IT", "Information Technology", "Software Engineering", "AI & ML", "Data Science"], "category_group": "Engineering"},
        {"id": make_uuid("edu-btech-me"), "education_level": "Undergraduate", "degree": "B.Tech", "branch_name": "Mechanical Engineering", "aliases": ["ME", "Mech", "Automobile", "Production"], "category_group": "Engineering"},
        {"id": make_uuid("edu-btech-ee"), "education_level": "Undergraduate", "degree": "B.Tech", "branch_name": "Electrical Engineering", "aliases": ["EE", "Electrical & Electronics", "EEE"], "category_group": "Engineering"},
        {"id": make_uuid("edu-btech-ec"), "education_level": "Undergraduate", "degree": "B.Tech", "branch_name": "Electronics Engineering", "aliases": ["ECE", "Electronics & Communication", "ET"], "category_group": "Engineering"},
        {"id": make_uuid("edu-btech-ce-civil"), "education_level": "Undergraduate", "degree": "B.Tech", "branch_name": "Civil Engineering", "aliases": ["Civil", "CE"], "category_group": "Engineering"},
        {"id": make_uuid("edu-btech-any"), "education_level": "Undergraduate", "degree": "B.Tech", "branch_name": "Any Engineering", "aliases": ["Any Branch", "All Branches"], "category_group": "Engineering"},
        {"id": make_uuid("edu-grad-any"), "education_level": "Undergraduate", "degree": "Graduate", "branch_name": "Any Stream", "aliases": ["Any Degree", "B.A.", "B.Com", "B.Sc"], "category_group": "General"},
        {"id": make_uuid("edu-12th-pcm"), "education_level": "School", "degree": "12th", "branch_name": "Science (PCM)", "aliases": ["PCM", "Physics Chemistry Math", "Science"], "category_group": "School"},
        {"id": make_uuid("edu-12th-any"), "education_level": "School", "degree": "12th", "branch_name": "Any Stream", "aliases": ["Arts", "Commerce", "Science"], "category_group": "School"},
        {"id": make_uuid("edu-10th-any"), "education_level": "School", "degree": "10th", "branch_name": "General", "aliases": ["Matriculation", "SSLC"], "category_group": "School"},
    ]
    print(f"Upserting {len(edu_hierarchy)} education hierarchy mappings...")
    client.table("education_hierarchy").upsert(edu_hierarchy).execute()

    # 3. Comprehensive Exams
    exams = [
        {
            "id": make_uuid("ex-upsc"),
            "category_id": make_uuid("cat-civ"),
            "name": "UPSC Civil Services Examination",
            "short_name": "UPSC_CSE",
            "organization": "Union Public Service Commission",
            "description": "Premier exam for recruitment to IAS, IPS, IFS, and other central services.",
            "qualification_levels": ["Undergraduate", "Postgraduate"],
            "degrees": ["Graduate", "B.Tech", "B.E.", "B.Sc", "B.A.", "B.Com"],
            "branches": ["Any Stream"],
            "eligible_branches": ["Any Stream"],
            "minimum_qualification": "Graduate",
            "minimum_age": 21,
            "maximum_age": 32,
            "age_relaxation": {"OBC": 3, "SC": 5, "ST": 5, "PWD": 10},
            "eligible_categories": ["GENERAL", "OBC", "SC", "ST", "EWS", "PWD"],
            "eligible_states": ["All India"],
            "nationality": "Indian Citizen",
            "minimum_percentage": 0.0,
            "attempt_limit": {"GENERAL": 6, "OBC": 9, "SC": "Unlimited", "ST": "Unlimited"},
            "career_type": "Group A Services",
            "job_type": "Government",
            "salary_information": {"pay_scale": "Level 10 Pay Matrix", "basic_pay": 56100, "approx_in_hand_monthly": 85000, "perks": ["HRA", "DA", "official residence", "vehicle"], "posts": ["IAS", "IPS", "IFS"]},
            "selection_process": ["Prelims", "Mains", "Interview"],
            "exam_pattern": [
                {"stage": "Prelims", "mode": "Offline", "marks": 400, "duration_minutes": 240, "papers": "General Studies I, CSAT"}
            ],
            "application_status": "Upcoming",
            "official_website": "https://upsc.gov.in",
            "verification_status": "Verified"
        },
        {
            "id": make_uuid("ex-gate-cs"),
            "category_id": make_uuid("cat-eng"),
            "name": "GATE 2026 (Computer Science)",
            "short_name": "GATE_CS",
            "organization": "IIT / IISc",
            "description": "Graduate Aptitude Test in Engineering for PG admissions and PSU recruitment.",
            "qualification_levels": ["Undergraduate", "Postgraduate"],
            "degrees": ["B.Tech", "B.E.", "M.Sc", "MCA"],
            "branches": ["Computer Engineering", "Information Technology", "Computer Science"],
            "eligible_branches": ["Computer Engineering", "Computer Science", "Information Technology", "AI & ML", "Software Engineering"],
            "minimum_qualification": "B.Tech / B.E. / 3rd Year",
            "minimum_age": 18,
            "maximum_age": 99,
            "age_relaxation": {},
            "eligible_categories": ["GENERAL", "OBC", "SC", "ST", "EWS", "PWD"],
            "eligible_states": ["All India"],
            "minimum_percentage": 0.0,
            "attempt_limit": {"GENERAL": "Unlimited"},
            "career_type": "PSU / Higher Education",
            "job_type": "Government PSU",
            "salary_information": {"pay_scale": "E2 Level (PSU)", "basic_pay": 60000, "approx_in_hand_monthly": 95000, "posts": ["Executive Engineer", "Scientist"]},
            "selection_process": ["Written Test"],
            "exam_pattern": [
                {"stage": "Computer Based Test", "mode": "Online", "marks": 100, "duration_minutes": 180}
            ],
            "application_status": "Active",
            "official_website": "https://gate2026.iitr.ac.in",
            "verification_status": "Verified"
        },
        {
            "id": make_uuid("ex-isro-cs"),
            "category_id": make_uuid("cat-eng"),
            "name": "ISRO Scientist/Engineer SC (Computer Science)",
            "short_name": "ISRO_SC_CS",
            "organization": "Indian Space Research Organisation",
            "description": "Recruitment for Scientist/Engineer 'SC' position in Computer Science.",
            "qualification_levels": ["Undergraduate"],
            "degrees": ["B.Tech", "B.E."],
            "branches": ["Computer Engineering", "Computer Science"],
            "eligible_branches": ["Computer Engineering", "Computer Science", "Information Technology"],
            "minimum_qualification": "B.Tech / B.E.",
            "minimum_age": 18,
            "maximum_age": 30,
            "age_relaxation": {"OBC": 3, "SC": 5, "ST": 5, "PWD": 10},
            "eligible_categories": ["GENERAL", "OBC", "SC", "ST", "EWS", "PWD"],
            "eligible_states": ["All India"],
            "minimum_percentage": 65.0,
            "attempt_limit": {"GENERAL": "Unlimited"},
            "career_type": "Scientist",
            "job_type": "Government Space Agency",
            "salary_information": {"pay_scale": "Level 10 (7th CPC)", "basic_pay": 56100, "approx_in_hand_monthly": 92000, "posts": ["Scientist / Engineer SC"]},
            "selection_process": ["Written Test", "Interview"],
            "application_status": "Upcoming",
            "official_website": "https://isro.gov.in",
            "verification_status": "Verified"
        },
        {
            "id": make_uuid("ex-rrb-ntpc"),
            "category_id": make_uuid("cat-ssc"),
            "name": "RRB NTPC (Non-Technical Popular Categories)",
            "short_name": "RRB_NTPC",
            "organization": "Railway Recruitment Board",
            "description": "Recruitment for various non-technical posts in Indian Railways.",
            "qualification_levels": ["School", "Undergraduate"],
            "degrees": ["12th", "Graduate", "B.Tech", "B.A.", "B.Com", "B.Sc"],
            "branches": ["Any Stream"],
            "eligible_branches": ["Any Stream"],
            "minimum_qualification": "12th Pass / Graduate",
            "minimum_age": 18,
            "maximum_age": 33,
            "age_relaxation": {"OBC": 3, "SC": 5, "ST": 5, "PWD": 10},
            "eligible_categories": ["GENERAL", "OBC", "SC", "ST", "EWS", "PWD"],
            "eligible_states": ["All India"],
            "minimum_percentage": 50.0,
            "attempt_limit": {"GENERAL": "Unlimited"},
            "career_type": "Railway Operations",
            "job_type": "Government",
            "salary_information": {"pay_scale": "Level 2 to 6", "approx_in_hand_monthly": 45000, "posts": ["Station Master", "Clerk", "Goods Guard"]},
            "selection_process": ["CBT-1", "CBT-2", "Skill Test", "Document Verification"],
            "application_status": "Active",
            "official_website": "https://indianrailways.gov.in",
            "verification_status": "Verified"
        },
        {
            "id": make_uuid("ex-ssc-cgl"),
            "category_id": make_uuid("cat-ssc"),
            "name": "SSC Combined Graduate Level (CGL)",
            "short_name": "SSC_CGL",
            "organization": "Staff Selection Commission",
            "description": "Recruitment for Group B and C posts in various ministries and departments.",
            "qualification_levels": ["Undergraduate"],
            "degrees": ["Graduate", "B.Tech", "B.A.", "B.Com", "B.Sc"],
            "branches": ["Any Stream"],
            "eligible_branches": ["Any Stream"],
            "minimum_qualification": "Graduate",
            "minimum_age": 18,
            "maximum_age": 32,
            "age_relaxation": {"OBC": 3, "SC": 5, "ST": 5, "PWD": 10},
            "eligible_categories": ["GENERAL", "OBC", "SC", "ST", "EWS", "PWD"],
            "eligible_states": ["All India"],
            "minimum_percentage": 0.0,
            "attempt_limit": {"GENERAL": "Unlimited"},
            "career_type": "Group B/C Officers",
            "job_type": "Government",
            "salary_information": {"pay_scale": "Level 4 to 8", "approx_in_hand_monthly": 65000, "posts": ["Income Tax Inspector", "Assistant Section Officer"]},
            "selection_process": ["Tier 1 (CBT)", "Tier 2 (CBT)"],
            "application_status": "Upcoming",
            "official_website": "https://ssc.gov.in",
            "verification_status": "Verified"
        }
    ]

    print(f"Upserting {len(exams)} comprehensive exams...")
    client.table("exams").upsert(exams).execute()

    print("--- SEEDING COMPLETED SUCCESSFULLY ---")

if __name__ == "__main__":
    seed_supabase()
