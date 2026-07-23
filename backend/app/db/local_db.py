import sqlite3
import os
from typing import Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "local_database.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_local_db():
    print(f"Initializing local SQLite database at: {DB_PATH}")
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create tables matching docs/schema.sql
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exam_categories (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        icon_name TEXT,
        display_order INTEGER DEFAULT 0
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        category_id TEXT REFERENCES exam_categories(id),
        title TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        conducting_body TEXT NOT NULL,
        frequency TEXT,
        exam_level TEXT,
        application_fee_general REAL DEFAULT 0.0,
        application_fee_reserved REAL DEFAULT 0.0,
        official_website TEXT,
        notification_pdf_url TEXT,
        is_featured INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active'
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exam_eligibility (
        id TEXT PRIMARY KEY,
        exam_id TEXT REFERENCES exams(id),
        min_age INTEGER NOT NULL,
        max_age_general INTEGER NOT NULL,
        age_relaxation_obc INTEGER DEFAULT 3,
        age_relaxation_sc_st INTEGER DEFAULT 5,
        age_relaxation_pwd INTEGER DEFAULT 10,
        min_education TEXT NOT NULL,
        eligible_streams TEXT, -- comma-separated
        min_percentage REAL DEFAULT 0.0,
        physical_standards_required INTEGER DEFAULT 0,
        nationality TEXT DEFAULT 'Indian Citizen',
        additional_notes TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exam_patterns (
        id TEXT PRIMARY KEY,
        exam_id TEXT REFERENCES exams(id),
        stage_name TEXT NOT NULL,
        stage_order INTEGER DEFAULT 1,
        mode TEXT,
        total_marks INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        duration_minutes INTEGER NOT NULL,
        negative_marking_ratio TEXT DEFAULT '0.25',
        language_medium TEXT DEFAULT 'English, Hindi'
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS syllabus_topics (
        id TEXT PRIMARY KEY,
        exam_pattern_id TEXT REFERENCES exam_patterns(id),
        subject_name TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        weightage_approx TEXT,
        description TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS career_salaries (
        id TEXT PRIMARY KEY,
        exam_id TEXT REFERENCES exams(id),
        post_name TEXT NOT NULL,
        pay_scale TEXT,
        basic_pay REAL,
        approx_in_hand_monthly REAL NOT NULL,
        perks_and_allowances TEXT,
        growth_hierarchy TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exam_resources (
        id TEXT PRIMARY KEY,
        exam_id TEXT REFERENCES exams(id),
        resource_type TEXT,
        title TEXT NOT NULL,
        author_publisher TEXT,
        url_link TEXT,
        year INTEGER,
        rating REAL DEFAULT 4.5,
        is_free INTEGER DEFAULT 1
    );
    """)

    conn.commit()
    seed_data(cursor)
    conn.commit()
    conn.close()
    print("Local SQLite database initialized and seeded successfully.")

def seed_data(cursor):
    # Check if already seeded
    cursor.execute("SELECT count(*) FROM exam_categories")
    if cursor.fetchone()[0] > 0:
        print("Database already contains data, skipping seed.")
        return

    # 1. Seed Categories
    categories = [
        ("cat-civ", "Civil Services", "civil-services", "Administrative and diplomatic careers.", "shield", 1),
        ("cat-eng", "Engineering & Technical", "engineering-technical", "PSU, R&D and core engineering roles.", "cpu", 2),
        ("cat-ssc", "Staff Selection & Railways", "ssc-railway", "Central Government executive and operations.", "landmark", 3),
        ("cat-bnk", "Banking & Finance", "banking-finance", "Nationalized and private sector banking.", "building", 4),
        ("cat-def", "Defence Services", "defence-services", "Officer commission in Army, Navy, Air Force.", "target", 5),
        ("cat-med", "Medical Sciences", "medical-sciences", "Post-graduate clinical and research roles.", "activity", 6),
        ("cat-mgt", "Management & General", "management-general", "MBA, Law and other premier PG entries.", "briefcase", 7),
        ("cat-sch", "Scholarships & Internships", "scholarships-internships", "Fellowships and corporate research roles.", "award", 8)
    ]
    cursor.executemany("INSERT OR IGNORE INTO exam_categories VALUES (?,?,?,?,?,?)", categories)

    # 2. Seed Exams
    exams = [
        # Civil Services
        ("ex-upsc", "cat-civ", "UPSC Civil Services Examination", "UPSC_CSE", "upsc-civil-services", "Union Public Service Commission", "Annual", "National", 100.0, 0.0, "https://upsc.gov.in", "https://upsc.gov.in/notif.pdf", 1, "active"),
        ("ex-gpsc", "cat-civ", "GPSC Class 1-2 General Services", "GPSC_CSE", "gpsc-general-services", "Gujarat Public Service Commission", "Annual", "State", 100.0, 0.0, "https://gpsc.gujarat.gov.in", "https://gpsc.gujarat.gov.in/notif.pdf", 0, "active"),
        ("ex-mpsc", "cat-civ", "MPSC State Services Examination", "MPSC_CSE", "mpsc-state-services", "Maharashtra Public Service Commission", "Annual", "State", 100.0, 0.0, "https://mpsc.gov.in", "https://mpsc.gov.in/notif.pdf", 0, "active"),
        
        # Engineering & Technical
        ("ex-gate", "cat-eng", "GATE 2026 (Graduate Aptitude Test)", "GATE_2026", "gate-2026", "IIT Roorkee / IISc", "Annual", "National", 1800.0, 900.0, "https://gate2026.iitr.ac.in", "https://gate2026.iitr.ac.in/pdf", 1, "active"),
        ("ex-isro", "cat-eng", "ISRO Scientist / Engineer SC", "ISRO_SC", "isro-scientist-engineer", "Indian Space Research Organisation", "As Announced", "National", 250.0, 0.0, "https://isro.gov.in", "https://isro.gov.in/careers.pdf", 1, "active"),
        ("ex-drdo", "cat-eng", "DRDO Scientist B Entry", "DRDO_SCIENTIST", "drdo-scientist-b", "Defence Research & Development Organisation", "Annual", "National", 100.0, 0.0, "https://drdo.gov.in", "https://drdo.gov.in/careers", 1, "active"),
        ("ex-barc", "cat-eng", "BARC OCES Scientific Officer", "BARC_OCES", "barc-scientific-officer", "Bhabha Atomic Research Centre", "Annual", "National", 500.0, 0.0, "https://barconlineexam.in", "https://barconlineexam.in/pdf", 0, "active"),
        ("ex-nic", "cat-eng", "NIC Scientist B (MeitY)", "NIC_SCIENTIST", "nic-scientist-b", "National Informatics Centre", "As Announced", "National", 800.0, 0.0, "https://calicut.nielit.in", "https://nic.in/pdf", 0, "active"),
        ("ex-ese", "cat-eng", "UPSC Engineering Services Exam", "UPSC_ESE", "upsc-engineering-services", "Union Public Service Commission", "Annual", "National", 200.0, 0.0, "https://upsc.gov.in", "https://upsc.gov.in/ese", 0, "active"),

        # SSC & Railways
        ("ex-ssc", "cat-ssc", "SSC CGL 2025 (Combined Graduate Level)", "SSC_CGL", "ssc-cgl-2025", "Staff Selection Commission", "Annual", "National", 100.0, 0.0, "https://ssc.gov.in", "https://ssc.gov.in/notif", 1, "active"),
        ("ex-rrb", "cat-ssc", "RRB NTPC (Non-Technical Popular)", "RRB_NTPC", "rrb-ntpc", "Railway Recruitment Board", "As Announced", "National", 500.0, 250.0, "https://indianrailways.gov.in", "https://rrb.gov.in", 0, "active"),

        # Banking & Finance
        ("ex-ibps-po", "cat-bnk", "IBPS PO (Probationary Officers)", "IBPS_PO", "ibps-po", "Institute of Banking Personnel Selection", "Annual", "National", 850.0, 175.0, "https://ibps.in", "https://ibps.in/po", 1, "active"),
        ("ex-ibps-so", "cat-bnk", "IBPS SO IT Officer Scale-I", "IBPS_SO_IT", "ibps-so-it", "Institute of Banking Personnel Selection", "Annual", "National", 850.0, 175.0, "https://ibps.in", "https://ibps.in/so", 1, "active"),

        # Defence
        ("ex-nda", "cat-def", "NDA & NA Entrance Examination", "NDA", "nda-entrance", "UPSC", "Bi-Annual", "National", 100.0, 0.0, "https://upsc.gov.in", "https://upsc.gov.in/nda", 0, "active"),
        ("ex-cds", "cat-def", "Combined Defence Services", "CDS", "cds-exam", "UPSC", "Bi-Annual", "National", 200.0, 0.0, "https://upsc.gov.in", "https://upsc.gov.in/cds", 0, "active"),

        # Medical
        ("ex-neet-pg", "cat-med", "NEET PG (Medical Post Graduate)", "NEET_PG", "neet-pg", "National Board of Examinations", "Annual", "National", 4250.0, 3250.0, "https://natboard.edu.in", "https://natboard.edu.in/neetpg", 0, "active"),

        # Management & General
        ("ex-cat", "cat-mgt", "CAT 2025 (Common Admission Test)", "CAT_EXAM", "cat-2025", "Indian Institutes of Management", "Annual", "National", 2400.0, 1200.0, "https://iimcat.ac.in", "https://iimcat.ac.in/notif", 0, "active"),
        ("ex-clat", "cat-mgt", "CLAT (Common Law Admission Test)", "CLAT_EXAM", "clat-law", "Consortium of National Law Universities", "Annual", "National", 4000.0, 3500.0, "https://consortiumofnlus.ac.in", "https://consortiumofnlus.ac.in/pdf", 0, "active"),

        # Scholarships & Internships
        ("ex-pmrf", "cat-sch", "PMRF (Prime Minister Research Fellowship)", "PMRF_SCHOLARSHIP", "pmrf-fellowship", "Ministry of Education", "Annual", "National", 0.0, 0.0, "https://pmrf.in", "https://pmrf.in/guidelines", 0, "active")
    ]
    cursor.executemany("INSERT OR IGNORE INTO exams VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", exams)

    # 3. Seed Eligibility
    eligibility = [
        ("el-upsc", "ex-upsc", 21, 32, 3, 5, 10, "Graduate", "", 0.0, 0, "Indian Citizen", "Attempt limit: 6 for Gen, 9 for OBC, Unlimited for SC/ST."),
        ("el-gate", "ex-gate", 18, 99, 0, 0, 0, "Graduate/Final Year", "B.Tech, B.E., M.Sc, MCA", 0.0, 0, "Indian/International", "No upper age limit for GATE."),
        ("el-isro", "ex-isro", 21, 30, 3, 5, 10, "B.Tech / B.E.", "Computer Science, Mechanical, Civil, EE, EC", 65.0, 0, "Indian Citizen", "Must have first class degree."),
        ("el-drdo", "ex-drdo", 21, 28, 3, 5, 10, "B.Tech / B.E.", "Computer Science, Mechanical, ECE, Chemical", 60.0, 0, "Indian Citizen", "Valid GATE score is mandatory for shortlisting."),
        ("el-ssc", "ex-ssc", 18, 30, 3, 5, 10, "Graduate", "", 0.0, 0, "Indian Citizen", "Age limit varies between 27-32 depending on specific post code."),
        ("el-ibps", "ex-ibps-po", 20, 30, 3, 5, 10, "Graduate", "", 0.0, 0, "Indian Citizen", "Computer literacy preferred.")
    ]
    cursor.executemany("INSERT OR IGNORE INTO exam_eligibility VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", eligibility)

    # 4. Seed Patterns
    patterns = [
        ("pat-upsc-pre", "ex-upsc", "Civil Services Prelims", 1, "Offline (Pen & Paper)", 400, 180, 240, "0.33", "English, Hindi"),
        ("pat-upsc-main", "ex-upsc", "Civil Services Mains", 2, "Offline (Pen & Paper)", 1750, 9, 1620, "0.0", "English, Hindi"),
        ("pat-gate", "ex-gate", "GATE Computer Based Test", 1, "Online (CBT)", 100, 65, 180, "0.33", "English"),
        ("pat-isro", "ex-isro", "ISRO SC Technical Quiz", 1, "Offline (Pen & Paper)", 80, 80, 120, "0.25", "English"),
        ("pat-ssc-t1", "ex-ssc", "SSC CGL Tier-1", 1, "Online (CBT)", 200, 100, 60, "0.50", "English, Hindi")
    ]
    cursor.executemany("INSERT OR IGNORE INTO exam_patterns VALUES (?,?,?,?,?,?,?,?,?,?)", patterns)

    # 5. Seed Syllabus Topics
    syllabus = [
        ("syl-gate-math", "pat-gate", "Engineering Mathematics", "Linear Algebra, Calculus, Probability & Statistics", "15% Weightage", "Core mathematical concepts for computer engineering."),
        ("syl-gate-ds", "pat-gate", "Digital Logic & Computer Organization", "Boolean Algebra, CPU design, Memory Hierarchy", "10% Weightage", "Hardware level fundamentals."),
        ("syl-gate-algo", "pat-gate", "Algorithms & Programming", "Sorting, Searching, Complexity Analysis, C programming", "12% Weightage", "Core programming structures."),
        ("syl-gate-os", "pat-gate", "Operating Systems", "Processes, Threads, CPU Scheduling, Deadlocks, Memory Management", "10% Weightage", "OS design principles.")
    ]
    cursor.executemany("INSERT OR IGNORE INTO syllabus_topics VALUES (?,?,?,?,?,?)", syllabus)

    # 6. Seed Career Salaries
    salaries = [
        ("sal-upsc-ias", "ex-upsc", "IAS Officer (SDM Entry)", "Level 10 Pay Matrix", 56100.0, 85000.0, "HRA, DA, official residence, vehicle", "SDM -> DM -> Commissioner -> Chief Secretary"),
        ("sal-gate-psu", "ex-gate", "Executive Engineer Trainee (IOCL/NTPC)", "E2 Level", 60000.0, 95000.0, "Medical insurance, Performance Related Pay (PRP)", "Engineer -> Manager -> GM -> Director"),
        ("sal-isro-sc", "ex-isro", "Scientist / Engineer SC", "Level 10 (7th CPC)", 56100.0, 92000.0, "Technical Allowance, Housing, Space Incentive", "Scientist SD -> SE -> SF -> SG"),
        ("sal-ssc-aso", "ex-ssc", "Assistant Section Officer (MEA)", "Level 7 Pay Matrix", 44900.0, 72000.0, "Foreign postings allowance, CGHS Medical", "ASO -> Section Officer -> Under Secretary")
    ]
    cursor.executemany("INSERT OR IGNORE INTO career_salaries VALUES (?,?,?,?,?,?,?,?)", salaries)

    # 7. Seed Resources
    resources = [
        ("res-lax", "ex-upsc", "book", "Indian Polity", "M. Laxmikanth (McGraw Hill)", "https://amazon.in", 2023, 4.8, 0),
        ("res-gate-me", "ex-gate", "book", "GATE Computer Science Core Set", "MADE EASY Publications", "https://amazon.in", 2025, 4.9, 0),
        ("res-youtube-gs", "ex-gate", "youtube_channel", "Gate Smashers CS Core lectures", "Varun Singla", "https://youtube.com/@GateSmashers", 2026, 4.9, 1),
        ("res-youtube-drishti", "ex-upsc", "youtube_channel", "Drishti IAS Current Affairs & Interviews", "Vikas Divyakirti", "https://youtube.com/@DrishtiIASvideos", 2026, 4.8, 1)
    ]
    cursor.executemany("INSERT OR IGNORE INTO exam_resources VALUES (?,?,?,?,?,?,?,?,?)", resources)

if __name__ == "__main__":
    init_local_db()
