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
