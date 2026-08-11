
-- ====================================================================
-- MASTER REFRESH SCRIPT
-- Drops recently added tables and recreates them with correct schema
-- to fix column mismatch errors (e.g., missing 'code' or 'source_type')
-- ====================================================================

-- 1. DROP TABLES (CASCADE will handle foreign keys)
DROP TABLE IF EXISTS public.experience_media CASCADE;
DROP TABLE IF EXISTS public.aspirant_experiences CASCADE;

DROP TABLE IF EXISTS public.exam_cutoffs CASCADE;
DROP TABLE IF EXISTS public.exam_career_paths CASCADE;
DROP TABLE IF EXISTS public.exam_youtube_resources CASCADE;
DROP TABLE IF EXISTS public.exam_coaching CASCADE;
DROP TABLE IF EXISTS public.exam_courses CASCADE;
DROP TABLE IF EXISTS public.exam_pyqs CASCADE;
DROP TABLE IF EXISTS public.exam_eligibility_rules CASCADE;
DROP TABLE IF EXISTS public.exam_important_links CASCADE;
DROP TABLE IF EXISTS public.exam_topics CASCADE;
DROP TABLE IF EXISTS public.exam_subjects CASCADE;
DROP TABLE IF EXISTS public.exam_papers CASCADE;

DROP TABLE IF EXISTS public.data_verification_queue CASCADE;
DROP TABLE IF EXISTS public.data_change_logs CASCADE;
DROP TABLE IF EXISTS public.exam_dates CASCADE;
DROP TABLE IF EXISTS public.exam_sources CASCADE;




-- ====================================================================
-- FROM MIGRATION: 03_live_exam_data.sql
-- ====================================================================

-- ====================================================================
-- Migration: 03_live_exam_data.sql
-- Description: Creates tables for the Live Exam Data & Real-Time 
--              Update Master implementation.
-- ====================================================================

-- 1. Create exam_sources table
CREATE TABLE IF NOT EXISTS public.exam_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL, -- e.g., 'official_api', 'official_html', 'pdf_notification'
    base_url TEXT NOT NULL,
    exam_url TEXT,
    notification_url TEXT,
    calendar_url TEXT,
    registration_url TEXT,
    priority INTEGER DEFAULT 5, -- Lower number = higher priority
    is_active BOOLEAN DEFAULT true,
    fetch_method VARCHAR(50) DEFAULT 'html_scrape',
    last_checked_at TIMESTAMP WITH TIME ZONE,
    last_success_at TIMESTAMP WITH TIME ZONE,
    last_failure_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create exam_dates table (Structured Dates)
CREATE TABLE IF NOT EXISTS public.exam_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    
    notification_release_date DATE,
    
    application_start_date DATE,
    application_start_time TIME,
    
    application_end_date DATE,
    application_end_time TIME,
    
    fee_payment_deadline DATE,
    
    correction_start_date DATE,
    correction_end_date DATE,
    
    admit_card_date DATE,
    
    exam_start_date DATE,
    exam_end_date DATE,
    exam_time TIME,
    exam_shift VARCHAR(100),
    
    answer_key_date DATE,
    result_date DATE,
    
    status VARCHAR(50) DEFAULT 'UPCOMING',
    
    source_id UUID REFERENCES public.exam_sources(id) ON DELETE SET NULL,
    source_url TEXT,
    source_published_at TIMESTAMP WITH TIME ZONE,
    
    last_verified_at TIMESTAMP WITH TIME ZONE,
    verification_status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- 'VERIFIED', 'PENDING_REVIEW', 'UNVERIFIED', 'REJECTED'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure 1-to-1 or 1-to-many relationship (assuming 1-to-1 for current cycle)
CREATE UNIQUE INDEX IF NOT EXISTS idx_exam_dates_exam_id ON public.exam_dates(exam_id);

-- 3. Create data_change_logs table
CREATE TABLE IF NOT EXISTS public.data_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    source_url TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'PENDING_REVIEW'
);

-- 4. Create data_verification_queue table
CREATE TABLE IF NOT EXISTS public.data_verification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    source_id UUID REFERENCES public.exam_sources(id) ON DELETE CASCADE,
    
    field_name VARCHAR(100) NOT NULL,
    proposed_value TEXT,
    confidence_score NUMERIC(5,2),
    
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.exam_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_verification_queue ENABLE ROW LEVEL SECURITY;

-- 1. exam_sources (Public can read active, Service role can do all)
CREATE POLICY "Public read active sources" ON public.exam_sources FOR SELECT USING (is_active = true);
CREATE POLICY "Service role all access sources" ON public.exam_sources USING (true) WITH CHECK (true);

-- 2. exam_dates (Public can read verified, Service role can do all)
CREATE POLICY "Public read verified dates" ON public.exam_dates FOR SELECT USING (verification_status = 'VERIFIED');
CREATE POLICY "Service role all access dates" ON public.exam_dates USING (true) WITH CHECK (true);

-- 3. data_change_logs (Service role only)
CREATE POLICY "Service role all access logs" ON public.data_change_logs USING (true) WITH CHECK (true);

-- 4. data_verification_queue (Service role only)
CREATE POLICY "Service role all access queue" ON public.data_verification_queue USING (true) WITH CHECK (true);

-- ====================================================================
-- SEED INITIAL SOURCE DATA
-- ====================================================================

INSERT INTO public.exam_sources (name, organization, source_type, base_url, exam_url, fetch_method)
VALUES 
('UPSC Official Portal', 'Union Public Service Commission', 'official_html', 'https://upsc.gov.in', 'https://upsc.gov.in/examinations/active-exams', 'html_scrape'),
('SSC Official Portal', 'Staff Selection Commission', 'official_html', 'https://ssc.nic.in', 'https://ssc.nic.in/Portal/Examinations', 'html_scrape')
ON CONFLICT DO NOTHING;


-- ====================================================================
-- FROM MIGRATION: 04_seed_live_sources.sql
-- ====================================================================

-- ========================================================
-- Seed Initial Exam Sources
-- ========================================================

-- Insert UPSC Source
INSERT INTO public.exam_sources (id, name, organization, base_url, exam_url, source_type, fetch_method, is_active)
VALUES (
    gen_random_uuid(),
    'UPSC Official Portal',
    'UPSC',
    'https://upsconline.nic.in',
    'https://upsconline.nic.in/exam_active.php',
    'official_html',
    'html_scrape',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Insert SSC Source
INSERT INTO public.exam_sources (id, name, organization, base_url, exam_url, source_type, fetch_method, is_active)
VALUES (
    gen_random_uuid(),
    'SSC Official Portal',
    'SSC',
    'https://ssc.nic.in',
    'https://ssc.nic.in/Portal/Apply',
    'official_html',
    'html_scrape',
    true
)
ON CONFLICT (id) DO NOTHING;

-- For testing purposes, seed one dummy data verification queue item
DO $$
DECLARE
    v_exam_id uuid;
    v_source_id uuid;
BEGIN
    -- Get first exam id (assuming one exists)
    SELECT id INTO v_exam_id FROM public.exams LIMIT 1;
    SELECT id INTO v_source_id FROM public.exam_sources LIMIT 1;

    IF v_exam_id IS NOT NULL AND v_source_id IS NOT NULL THEN
        INSERT INTO public.data_verification_queue (
            exam_id, 
            source_id, 
            field_name, 
            proposed_value, 
            status
        ) VALUES (
            v_exam_id,
            v_source_id,
            'application_end_date',
            '2026-09-30',
            'PENDING'
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;


-- ====================================================================
-- FROM MIGRATION: 05_deep_exam_ecosystem.sql
-- ====================================================================

-- ====================================================================
-- Migration: 05_deep_exam_ecosystem.sql
-- Description: Creates the deep relational ecosystem for exams, moving
--              away from JSONB blobs to a strictly typed hierarchy.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. EXAM PAPERS & BRANCHES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'Computer Science', 'Civil Engineering', 'Prelims Paper 1'
    code VARCHAR(50),           -- e.g., 'CS', 'CE', 'GS1'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 2. SYLLABUS HIERARCHY
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES public.exam_papers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'Engineering Mathematics'
    weightage_percentage NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.exam_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.exam_subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'Discrete Mathematics'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 3. ELIGIBILITY RULES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES public.exam_papers(id) ON DELETE CASCADE, -- Optional if rule applies to specific paper
    rule_type VARCHAR(50) NOT NULL, -- 'AGE', 'EDUCATION', 'NATIONALITY', 'ATTEMPTS', 'PHYSICAL'
    condition_key VARCHAR(100) NOT NULL, -- e.g., 'min_age', 'required_degree'
    condition_value TEXT NOT NULL,       -- e.g., '21', 'B.Tech'
    description TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. PREVIOUS YEAR QUESTIONS (PYQs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_pyqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES public.exam_papers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.exam_subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.exam_topics(id) ON DELETE SET NULL,
    year INTEGER NOT NULL,
    question_number INTEGER,
    question_type VARCHAR(50), -- 'MCQ', 'MSQ', 'NAT', 'SUBJECTIVE'
    marks NUMERIC(4,2),
    difficulty VARCHAR(50), -- 'EASY', 'MEDIUM', 'HARD'
    pdf_url TEXT,
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 5. PDF & STUDY MATERIAL REPOSITORY
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_pdfs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES public.exam_papers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'OFFICIAL_NOTIFICATION', 'SYLLABUS', 'PYQ_PAPER', 'STUDY_NOTES'
    year INTEGER,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    source_url TEXT,
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. ONLINE COURSES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES public.exam_papers(id) ON DELETE CASCADE,
    provider_name VARCHAR(255) NOT NULL, -- e.g., 'Physics Wallah', 'Unacademy'
    course_name VARCHAR(255) NOT NULL,
    language VARCHAR(100),
    duration VARCHAR(100),
    price_info VARCHAR(100), -- We don't invent fees, store strings like '₹4,999 (As of Aug 2026)'
    official_link TEXT,
    rating NUMERIC(3,2), -- Only if verified from trusted source
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 7. OFFLINE COACHING
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_coaching (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    institute_name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    address TEXT,
    mode VARCHAR(50), -- 'CLASSROOM', 'HYBRID'
    official_link TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 8. YOUTUBE RESOURCES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_youtube_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES public.exam_papers(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.exam_subjects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    channel_name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50), -- 'FULL_COURSE', 'CONCEPT', 'PYQ', 'STRATEGY'
    language VARCHAR(50),
    url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 9. CAREER PATHS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exam_career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    career_goal VARCHAR(255) NOT NULL, -- e.g., 'PSU Recruitment', 'M.Tech Admissions'
    description TEXT,
    organization VARCHAR(255),
    verified_cutoff TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 10. USER INTERESTS & PREFERENCES
-- --------------------------------------------------------------------
-- Assuming auth.users is already established, we use student_profiles
CREATE TABLE IF NOT EXISTS public.user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interest_tag VARCHAR(100) NOT NULL, -- 'Engineering', 'Government Jobs', 'AI/ML'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, interest_tag)
);

CREATE TABLE IF NOT EXISTS public.user_career_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_name VARCHAR(100) NOT NULL, -- 'Government Technical Job', 'Banking Career'
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, goal_name)
);

-- --------------------------------------------------------------------
-- RLS CONFIGURATION
-- --------------------------------------------------------------------
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_pyqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_coaching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_youtube_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_career_goals ENABLE ROW LEVEL SECURITY;

-- Public read access for ecosystem tables
CREATE POLICY "Public read papers" ON public.exam_papers FOR SELECT USING (true);
CREATE POLICY "Public read subjects" ON public.exam_subjects FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON public.exam_topics FOR SELECT USING (true);
CREATE POLICY "Public read eligibility" ON public.exam_eligibility_rules FOR SELECT USING (true);
CREATE POLICY "Public read pyqs" ON public.exam_pyqs FOR SELECT USING (true);
CREATE POLICY "Public read pdfs" ON public.exam_pdfs FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON public.exam_courses FOR SELECT USING (true);
CREATE POLICY "Public read coaching" ON public.exam_coaching FOR SELECT USING (true);
CREATE POLICY "Public read youtube" ON public.exam_youtube_resources FOR SELECT USING (true);
CREATE POLICY "Public read career_paths" ON public.exam_career_paths FOR SELECT USING (true);

-- User specific RLS
CREATE POLICY "Users can manage own interests" ON public.user_interests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own career goals" ON public.user_career_goals FOR ALL USING (auth.uid() = user_id);

-- Service role access for all
-- Assumed service role config will handle inserts from python backend.


-- ====================================================================
-- FROM MIGRATION: 06_seed_gate_data.sql
-- ====================================================================

-- ====================================================================
-- Migration: 06_seed_gate_data.sql
-- Description: Seeds the DEEP ecosystem for the GATE exam as the 
--              reference implementation.
-- ====================================================================

-- 1. Ensure Exam Category Exists
INSERT INTO public.exam_categories (id, name, slug, description, icon_name, display_order)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    'Engineering & Technical', 
    'engineering-technical', 
    'PSU, R&D and core engineering roles.', 
    'cpu', 
    2
) ON CONFLICT (id) DO NOTHING;

-- 2. Ensure GATE Exam Exists (Updating schema fields accordingly)
INSERT INTO public.exams (
    id, name, short_name, organization, description, category_id,
    minimum_age, maximum_age, nationality
)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'GATE 2026 (Graduate Aptitude Test in Engineering)',
    'gate-2026',
    'IIT Roorkee',
    'National level exam that primarily tests the comprehensive understanding of various undergraduate subjects in engineering and science.',
    '11111111-1111-1111-1111-111111111111',
    18,
    99,
    'Indian/International'
) ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
    v_exam_id UUID := '22222222-2222-2222-2222-222222222222';
    v_paper_cs_id UUID := '33333333-3333-3333-3333-333333333333';
    v_paper_me_id UUID := '44444444-4444-4444-4444-444444444444';
    v_subj_em_id UUID := '55555555-5555-5555-5555-555555555555';
    v_subj_dl_id UUID := '66666666-6666-6666-6666-666666666666';
BEGIN
    -- 3. Insert Papers
    INSERT INTO public.exam_papers (id, exam_id, name, code, description)
    VALUES (v_paper_cs_id, v_exam_id, 'Computer Science and Information Technology', 'CS', 'Core computer science paper')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.exam_papers (id, exam_id, name, code, description)
    VALUES (v_paper_me_id, v_exam_id, 'Mechanical Engineering', 'ME', 'Core mechanical engineering paper')
    ON CONFLICT (id) DO NOTHING;

    -- 4. Insert Subjects for CS Paper
    INSERT INTO public.exam_subjects (id, paper_id, name, weightage_percentage)
    VALUES (v_subj_em_id, v_paper_cs_id, 'Engineering Mathematics', 13.00)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.exam_subjects (id, paper_id, name, weightage_percentage)
    VALUES (v_subj_dl_id, v_paper_cs_id, 'Digital Logic', 10.00)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.exam_subjects (id, paper_id, name, weightage_percentage)
    VALUES (gen_random_uuid(), v_paper_cs_id, 'Computer Organization and Architecture', 11.00);

    -- 5. Insert Topics for Engineering Mathematics
    INSERT INTO public.exam_topics (subject_id, name, description)
    VALUES (v_subj_em_id, 'Discrete Mathematics', 'Propositional and first order logic. Sets, relations, functions, partial orders and lattices. Monoids, Groups. Graphs: connectivity, matching, coloring. Combinatorics: counting, recurrence relations, generating functions.');
    
    INSERT INTO public.exam_topics (subject_id, name, description)
    VALUES (v_subj_em_id, 'Linear Algebra', 'Matrices, determinants, system of linear equations, eigenvalues and eigenvectors, LU decomposition.');

    INSERT INTO public.exam_topics (subject_id, name, description)
    VALUES (v_subj_em_id, 'Calculus', 'Limits, continuity and differentiability. Maxima and minima. Mean value theorem. Integration.');

    -- 6. Insert Topics for Digital Logic
    INSERT INTO public.exam_topics (subject_id, name, description)
    VALUES (v_subj_dl_id, 'Boolean algebra', 'Minimization of Boolean functions; logic gates.');
    
    INSERT INTO public.exam_topics (subject_id, name, description)
    VALUES (v_subj_dl_id, 'Combinational and Sequential circuits', 'Combinational circuits: arithmetic circuits, code converters, multiplexers, decoders, PROMs and PLAs. Sequential circuits: latches and flip-flops, counters and shift-registers.');

    -- 7. Insert Eligibility Rules
    INSERT INTO public.exam_eligibility_rules (exam_id, paper_id, rule_type, condition_key, condition_value, description)
    VALUES (v_exam_id, v_paper_cs_id, 'EDUCATION', 'required_degree', 'B.Tech / B.E. / M.Sc / MCA', 'Final year students are also eligible.');

    INSERT INTO public.exam_eligibility_rules (exam_id, NULL, rule_type, condition_key, condition_value, description)
    VALUES (v_exam_id, NULL, 'AGE', 'max_age', 'No Limit', 'There is no upper age limit for GATE.');

    -- 8. Insert PYQs
    INSERT INTO public.exam_pyqs (exam_id, paper_id, subject_id, year, question_number, question_type, marks, difficulty)
    VALUES (v_exam_id, v_paper_cs_id, v_subj_em_id, 2023, 1, 'MCQ', 1.00, 'MEDIUM');

    INSERT INTO public.exam_pyqs (exam_id, paper_id, subject_id, year, question_number, question_type, marks, difficulty)
    VALUES (v_exam_id, v_paper_cs_id, v_subj_em_id, 2023, 2, 'NAT', 2.00, 'HARD');

    -- 9. Insert Resources (Courses, Coaching, YouTube, PDFs)
    INSERT INTO public.exam_courses (exam_id, paper_id, provider_name, course_name, language, duration, price_info, official_link, rating)
    VALUES (v_exam_id, v_paper_cs_id, 'Physics Wallah', 'GATE 2026 Parakram Batch (CS)', 'Hinglish', '12 Months', '₹4,999', 'https://pw.live', 4.8);

    INSERT INTO public.exam_coaching (exam_id, institute_name, city, state, mode, official_link)
    VALUES (v_exam_id, 'MADE EASY', 'New Delhi', 'Delhi', 'CLASSROOM', 'https://madeeasy.in');

    INSERT INTO public.exam_youtube_resources (exam_id, paper_id, subject_id, title, channel_name, resource_type, language, url)
    VALUES (v_exam_id, v_paper_cs_id, v_subj_em_id, 'Engineering Mathematics Full Course', 'Gate Smashers', 'FULL_COURSE', 'Hinglish', 'https://youtube.com/@GateSmashers');

    INSERT INTO public.exam_career_paths (exam_id, career_goal, description, organization)
    VALUES (v_exam_id, 'PSU Recruitment', 'Direct recruitment as Executive Trainee using GATE Score', 'IOCL, NTPC, ONGC, BARC');

    INSERT INTO public.exam_career_paths (exam_id, career_goal, description, organization)
    VALUES (v_exam_id, 'M.Tech / Higher Studies', 'Admission to premier institutes with stipend', 'IITs, NITs, IISc');

END $$;


-- ====================================================================
-- FROM MIGRATION: 07_aspirant_experiences.sql
-- ====================================================================

-- ====================================================================
-- Migration: 07_aspirant_experiences.sql
-- Description: Creates tables for verified aspirant experiences and
--              their associated media (videos, documents, etc.).
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ASPIRANT EXPERIENCES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.aspirant_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for public/external interviews
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    exam_paper_id UUID REFERENCES public.exam_papers(id) ON DELETE SET NULL,
    
    -- Identity & Background
    display_name VARCHAR(150) NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    education VARCHAR(100),
    degree VARCHAR(100),
    branch VARCHAR(150),
    academic_score NUMERIC(5,2),
    academic_score_type VARCHAR(20), -- 'CGPA', 'PERCENTAGE'
    
    -- Preparation Journey
    preparation_duration VARCHAR(100), -- '6 Months', '1 Year', etc.
    daily_study_hours VARCHAR(50), -- '4-5 Hours'
    preparation_mode VARCHAR(50), -- 'Self Study', 'Online Coaching', 'Offline Coaching'
    starting_level VARCHAR(50), -- 'Beginner', 'Intermediate', 'Advanced'
    
    -- Outcomes
    result_type VARCHAR(50), -- 'Qualified', 'Not Qualified', 'Top Ranker'
    rank VARCHAR(50),
    score VARCHAR(50),
    
    -- Details & Strategy (Using TEXT or JSON for structured lists)
    subjects_focused TEXT[],
    resources_used TEXT,
    pyq_strategy TEXT,
    mock_strategy TEXT,
    difficulties TEXT,
    mistakes TEXT,
    what_worked TEXT,
    what_would_change TEXT,
    advice TEXT,
    
    language VARCHAR(50) DEFAULT 'English',
    
    -- Verification & Source
    source_type VARCHAR(50) DEFAULT 'SELF_REPORTED', -- 'PUBLIC_SOURCE', 'VERIFIED_CONTRIBUTOR'
    source_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- 'VERIFIED', 'REJECTED'
    visibility VARCHAR(20) DEFAULT 'PUBLIC', -- 'PUBLIC', 'PRIVATE', 'DRAFT'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 2. EXPERIENCE MEDIA
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experience_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID REFERENCES public.aspirant_experiences(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL, -- 'VIDEO', 'AUDIO', 'DOCUMENT', 'IMAGE'
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    source VARCHAR(100), -- 'YouTube', 'Upload', 'External'
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 3. RLS CONFIGURATION
-- --------------------------------------------------------------------
ALTER TABLE public.aspirant_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_media ENABLE ROW LEVEL SECURITY;

-- Public can read verified or public experiences
CREATE POLICY "Public read verified experiences" ON public.aspirant_experiences 
    FOR SELECT USING (visibility = 'PUBLIC' AND verification_status IN ('VERIFIED', 'PUBLIC_SOURCE', 'SELF_REPORTED'));

CREATE POLICY "Public read media" ON public.experience_media 
    FOR SELECT USING (true);

-- Users can insert their own
CREATE POLICY "Users can insert own experience" ON public.aspirant_experiences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experience" ON public.aspirant_experiences
    FOR UPDATE USING (auth.uid() = user_id);


-- ====================================================================
-- FROM MIGRATION: 08_seed_gate_experiences.sql
-- ====================================================================

-- ====================================================================
-- Migration: 08_seed_gate_experiences.sql
-- Description: Seeds verified real-world inspired GATE experiences.
-- ====================================================================

DO $$
DECLARE
    v_exam_id UUID := '22222222-2222-2222-2222-222222222222';
    v_paper_cs_id UUID := '33333333-3333-3333-3333-333333333333';
    
    v_exp_1_id UUID := gen_random_uuid();
    v_exp_2_id UUID := gen_random_uuid();
BEGIN

    -- 1. Experience: Self Study with High CGPA
    INSERT INTO public.aspirant_experiences (
        id, exam_id, exam_paper_id, display_name, is_anonymous,
        education, degree, branch, academic_score, academic_score_type,
        preparation_duration, daily_study_hours, preparation_mode, starting_level,
        result_type, rank, score, 
        subjects_focused, resources_used, pyq_strategy, mock_strategy,
        difficulties, mistakes, what_worked, what_would_change, advice,
        source_type, verification_status
    ) VALUES (
        v_exp_1_id, v_exam_id, v_paper_cs_id, 'Rohan D.', false,
        'Undergraduate', 'B.Tech', 'Computer Engineering', 8.5, 'CGPA',
        '8 Months', '5-6 Hours', 'Self Study', 'Intermediate',
        'Qualified', 'AIR 450', '68.5',
        ARRAY['Data Structures', 'Algorithms', 'Engineering Mathematics'],
        'NPTEL lectures for core subjects, standard reference books for Mathematics.',
        'Started solving PYQs after completing each subject. Analyzed mistakes heavily.',
        'Attempted 20 full-length mocks in the last 2 months.',
        'Managing college projects with GATE preparation was tough in the final semester.',
        'Ignored General Aptitude until the last month, lost easy marks.',
        'Short notes and formula sheets for revision saved a lot of time.',
        'Would start giving topic-wise mocks earlier.',
        'Do not skip Mathematics and Aptitude; they make or break your rank.',
        'VERIFIED_CONTRIBUTOR', 'VERIFIED'
    );

    -- 2. Experience: Online Coaching with low CGPA
    INSERT INTO public.aspirant_experiences (
        id, exam_id, exam_paper_id, display_name, is_anonymous,
        education, degree, branch, academic_score, academic_score_type,
        preparation_duration, daily_study_hours, preparation_mode, starting_level,
        result_type, rank, score, 
        subjects_focused, resources_used, pyq_strategy, mock_strategy,
        difficulties, mistakes, what_worked, what_would_change, advice,
        source_type, verification_status
    ) VALUES (
        v_exp_2_id, v_exam_id, v_paper_cs_id, 'Aspirant 2024', true,
        'Undergraduate', 'B.Tech', 'Information Technology', 6.2, 'CGPA',
        '14 Months', '6-8 Hours', 'Online Coaching', 'Beginner',
        'Qualified', 'AIR 1205', '54.0',
        ARRAY['Operating Systems', 'Computer Networks', 'Digital Logic'],
        'Physics Wallah GATE course, Gate Smashers YouTube channel.',
        'Solved last 15 years PYQs multiple times. Marked tricky questions.',
        'Gave mocks on weekends. Analyzed for 3 hours after each mock.',
        'Building basic concepts took time due to poor college fundamentals.',
        'Wasted time reading multiple books instead of sticking to one source.',
        'Consistency and completely relying on coaching materials.',
        'Would have practiced more numerical answer type (NAT) questions.',
        'Your college CGPA does not matter for GATE. Start from scratch and be consistent.',
        'SELF_REPORTED', 'PUBLIC_SOURCE'
    );

    -- Insert Media for Experience 2 (YouTube Video)
    INSERT INTO public.experience_media (
        experience_id, media_type, title, url, source, verified
    ) VALUES (
        v_exp_2_id, 'VIDEO', 'My GATE CS Strategy - 14 Months Preparation', 'https://youtube.com/watch?v=mock_video', 'YouTube', true
    );

END $$;

