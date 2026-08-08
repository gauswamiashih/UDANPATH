-- =====================================================================
-- UDANPATH: COMPREHENSIVE EXAM DISCOVERY SCHEMA MIGRATION
-- =====================================================================

-- This script upgrades the existing schema to support granular 
-- profile-based discovery and comprehensive exam details.

-- ---------------------------------------------------------------------
-- 1. DROP EXISTING CONSTRAINTS/TABLES IF NEEDED FOR CLEAN UP
-- ---------------------------------------------------------------------
-- Note: In a production environment with real data, we would use ALTER TABLE. 
-- Assuming a fresh migration/re-seed for this major upgrade.
DROP TABLE IF EXISTS exam_resources CASCADE;
DROP TABLE IF EXISTS career_salaries CASCADE;
DROP TABLE IF EXISTS syllabus_topics CASCADE;
DROP TABLE IF EXISTS exam_patterns CASCADE;
DROP TABLE IF EXISTS exam_eligibility CASCADE;
DROP TABLE IF EXISTS user_bookmarks CASCADE;
DROP TABLE IF EXISTS user_study_progress CASCADE;
DROP TABLE IF EXISTS syllabus_embeddings CASCADE;
DROP TABLE IF EXISTS ai_interaction_logs CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS exam_categories CASCADE;
DROP TABLE IF EXISTS education_hierarchy CASCADE;

-- Note: student_profiles and users tables are kept or altered below to prevent auth wiping.

-- ---------------------------------------------------------------------
-- 2. EDUCATION HIERARCHY MAPPING
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS education_hierarchy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    education_level VARCHAR(100) NOT NULL, -- e.g., 'Undergraduate', 'Postgraduate', 'School'
    degree VARCHAR(100) NOT NULL,          -- e.g., 'B.Tech', 'B.Sc', '12th'
    branch_name VARCHAR(150),              -- e.g., 'Computer Engineering'
    aliases TEXT[],                        -- e.g., ['CS', 'Computer Science', 'IT']
    category_group VARCHAR(100),           -- e.g., 'Engineering', 'Medical'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 3. EXAM CATEGORIES & EXAMS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Core Identity
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) UNIQUE NOT NULL,
    organization VARCHAR(150) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES exam_categories(id) ON DELETE SET NULL,
    sub_category VARCHAR(100),
    
    -- Eligibility & Demographics
    qualification_levels TEXT[], -- ['10th', '12th', 'Undergraduate', 'Postgraduate']
    degrees TEXT[], -- ['B.Tech', 'B.E.', 'Any Graduation']
    branches TEXT[], -- Used for strict display
    eligible_branches TEXT[], -- ['Computer Engineering', 'Mechanical Engineering', 'Any Engineering']
    minimum_qualification VARCHAR(100),
    maximum_qualification VARCHAR(100),
    minimum_age INT DEFAULT 18,
    maximum_age INT DEFAULT 32,
    age_relaxation JSONB DEFAULT '{}'::jsonb, -- e.g. {"OBC": 3, "SC": 5, "ST": 5}
    eligible_categories TEXT[], -- ['GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'PWD']
    eligible_states TEXT[], -- ['All India'] or specific states
    nationality VARCHAR(100) DEFAULT 'Indian Citizen',
    minimum_percentage NUMERIC(5,2) DEFAULT 0.00,
    attempt_limit JSONB DEFAULT '{}'::jsonb, -- e.g. {"GENERAL": 6, "OBC": 9, "SC": "Unlimited"}
    
    -- Career & Salary
    career_type VARCHAR(100),
    job_type VARCHAR(100),
    salary_information JSONB DEFAULT '{}'::jsonb,
    
    -- Application & Dates
    application_status VARCHAR(50) DEFAULT 'Upcoming', -- 'Active', 'Upcoming', 'Closed'
    application_start_date DATE,
    application_start_time TIME,
    application_end_date DATE,
    application_end_time TIME,
    fee_deadline DATE,
    correction_start_date DATE,
    correction_end_date DATE,
    admit_card_date DATE,
    exam_date DATE,
    exam_time TIME,
    answer_key_date DATE,
    result_date DATE,
    
    -- Process & Content
    selection_process TEXT[], -- ['Prelims', 'Mains', 'Interview']
    exam_pattern JSONB DEFAULT '[]'::jsonb,
    syllabus JSONB DEFAULT '[]'::jsonb,
    
    -- URLs & Verification
    official_website TEXT,
    official_registration_url TEXT,
    official_notification_url TEXT,
    source_url TEXT,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    verification_status VARCHAR(50) DEFAULT 'Unverified',
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 4. UPDATE STUDENT PROFILES 
-- ---------------------------------------------------------------------
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS education_level VARCHAR(100),
ADD COLUMN IF NOT EXISTS degree VARCHAR(100),
ADD COLUMN IF NOT EXISTS branch VARCHAR(150),
ADD COLUMN IF NOT EXISTS semester VARCHAR(50),
ADD COLUMN IF NOT EXISTS graduation_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS cgpa NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS career_goal VARCHAR(255),
ADD COLUMN IF NOT EXISTS preferred_exam_categories TEXT[],
ADD COLUMN IF NOT EXISTS preferred_job_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50),
ADD COLUMN IF NOT EXISTS study_preference VARCHAR(100);

-- Migrate old `highest_qualification` to `degree` and `stream` to `branch` if empty
UPDATE student_profiles 
SET degree = highest_qualification WHERE degree IS NULL AND highest_qualification IS NOT NULL;

UPDATE student_profiles 
SET branch = stream WHERE branch IS NULL AND stream IS NOT NULL;

-- ---------------------------------------------------------------------
-- 5. OTHER RELATION TABLES (Bookmarks, Resources, etc)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exam_id)
);

CREATE TABLE IF NOT EXISTS exam_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) CHECK (resource_type IN ('book', 'previous_paper', 'youtube_channel', 'mock_test', 'guide', 'pyq')),
    title VARCHAR(255) NOT NULL,
    author_publisher VARCHAR(150),
    url_link TEXT,
    year INT,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    is_free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 6. INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_exams_category ON exams(category_id);
CREATE INDEX IF NOT EXISTS idx_exams_short_name ON exams(short_name);
CREATE INDEX IF NOT EXISTS idx_exams_app_status ON exams(application_status);
CREATE INDEX IF NOT EXISTS idx_edu_hierarchy_degree ON education_hierarchy(degree);
