-- =====================================================================
-- UDANPATH: Production PostgreSQL Database Schema (Supabase Compliant)
-- "The Ultimate AI Powered Exam Navigation Platform for India"
-- =====================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ---------------------------------------------------------------------
-- 1. USERS & PROFILES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    phone_number VARCHAR(20),
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'content_creator', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    category VARCHAR(20) DEFAULT 'GENERAL' CHECK (category IN ('GENERAL', 'OBC', 'SC', 'ST', 'EWS', 'PWD')),
    state VARCHAR(100),
    highest_qualification VARCHAR(100), -- 10th, 12th, Diploma, Graduate, B.Tech, MBBS, Post-Graduate
    stream VARCHAR(100),
    percentage_aggregate NUMERIC(5, 2),
    target_exam_categories TEXT[], -- Array of target categories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 2. EXAM CATEGORIES & EXAMS
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
    category_id UUID REFERENCES exam_categories(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'UPSC_CSE', 'SSC_CGL', 'IBPS_PO'
    slug VARCHAR(200) UNIQUE NOT NULL,
    conducting_body VARCHAR(150) NOT NULL, -- e.g., UPSC, SSC, NTA, IBPS, RRB
    frequency VARCHAR(50), -- Annual, Bi-Annual, As Announced
    exam_level VARCHAR(50) CHECK (exam_level IN ('National', 'State', 'University')),
    application_fee_general NUMERIC(10, 2) DEFAULT 0.00,
    application_fee_reserved NUMERIC(10, 2) DEFAULT 0.00,
    official_website TEXT,
    notification_pdf_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'closed', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 3. ELIGIBILITY RULES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_eligibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    min_age INT NOT NULL,
    max_age_general INT NOT NULL,
    age_relaxation_obc INT DEFAULT 3,
    age_relaxation_sc_st INT DEFAULT 5,
    age_relaxation_pwd INT DEFAULT 10,
    min_education VARCHAR(100) NOT NULL, -- 10th, 12th, Graduate, etc.
    eligible_streams TEXT[], -- Empty array means all streams
    min_percentage NUMERIC(5, 2) DEFAULT 0.0,
    physical_standards_required BOOLEAN DEFAULT FALSE,
    nationality VARCHAR(100) DEFAULT 'Indian Citizen',
    additional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 4. EXAM PATTERN & SYLLABUS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL, -- e.g., Prelims (Tier-1), Mains (Tier-2), Interview
    stage_order INT DEFAULT 1,
    mode VARCHAR(50) CHECK (mode IN ('Online (CBT)', 'Offline (Pen & Paper)', 'Hybrid')),
    total_marks INT NOT NULL,
    total_questions INT NOT NULL,
    duration_minutes INT NOT NULL,
    negative_marking_ratio VARCHAR(20) DEFAULT '0.25',
    language_medium TEXT[] DEFAULT ARRAY['English', 'Hindi'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS syllabus_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_pattern_id UUID REFERENCES exam_patterns(id) ON DELETE CASCADE,
    subject_name VARCHAR(150) NOT NULL, -- e.g., Quantitative Aptitude, General Studies
    topic_name VARCHAR(150) NOT NULL, -- e.g., Number Systems, Indian Polity
    weightage_approx VARCHAR(50), -- e.g., 10-15% or 15-20 Marks
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 5. SALARY & CAREER PROFILES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    post_name VARCHAR(150) NOT NULL, -- e.g., Assistant Section Officer, IAS Officer, Probationary Officer
    pay_scale VARCHAR(100), -- 7th CPC Pay Matrix Level 7
    basic_pay NUMERIC(12, 2),
    approx_in_hand_monthly NUMERIC(12, 2) NOT NULL,
    perks_and_allowances TEXT[],
    growth_hierarchy TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 6. RESOURCES & PAST PAPERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) CHECK (resource_type IN ('book', 'previous_paper', 'youtube_channel', 'mock_test', 'guide')),
    title VARCHAR(255) NOT NULL,
    author_publisher VARCHAR(150),
    url_link TEXT,
    year INT,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    is_free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 7. USER BOOKMARKS & STUDY PROGRESS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exam_id)
);

CREATE TABLE IF NOT EXISTS user_study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    syllabus_topic_id UUID REFERENCES syllabus_topics(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 8. AI ENGINE LOGS & EMBEDDINGS (pgvector)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_interaction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feature_used VARCHAR(50) CHECK (feature_used IN ('eligibility_checker', 'career_recommender', 'roadmap_generator', 'chat_assistant')),
    prompt_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    model_name VARCHAR(50) DEFAULT 'gpt-4o',
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS syllabus_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    content_chunk TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_exams_category ON exams(category_id);
CREATE INDEX IF NOT EXISTS idx_exams_code ON exams(code);
CREATE INDEX IF NOT EXISTS idx_eligibility_exam ON exam_eligibility(exam_id);
CREATE INDEX IF NOT EXISTS idx_patterns_exam ON exam_patterns(exam_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_embeddings_vector ON syllabus_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
