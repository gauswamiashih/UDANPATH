-- =====================================================================
-- MIGRATION: 09_intelligence_upgrade.sql
-- Description: Creates the extended ecosystem for Education & Career 
--              Intelligence (Courses, Colleges, Careers, Scholarships)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. COURSES & BRANCHES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- e.g., 'B.Tech', 'B.Sc', 'BBA', 'MBBS'
    level VARCHAR(100), -- 'Undergraduate', 'Postgraduate', 'Diploma', 'Certification'
    category VARCHAR(100), -- 'Engineering', 'Medical', 'Management', 'Law'
    description TEXT,
    duration_years NUMERIC(3,1),
    avg_total_fees_min NUMERIC(12,2),
    avg_total_fees_max NUMERIC(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'Computer Science and Engineering'
    description TEXT,
    core_subjects TEXT[],
    future_scope TEXT,
    avg_starting_salary NUMERIC(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 2. COLLEGES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50), -- e.g., 'IIT Bombay'
    institution_type VARCHAR(100), -- 'Government', 'Private', 'Deemed', 'Central University'
    state VARCHAR(100),
    city VARCHAR(100),
    established_year INT,
    nirf_ranking INT,
    accreditation VARCHAR(100), -- e.g., 'NAAC A++'
    placement_rating NUMERIC(3,2), -- 1 to 5
    infrastructure_rating NUMERIC(3,2),
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Link Branches to Colleges (Many-to-Many with cutoffs)
CREATE TABLE IF NOT EXISTS public.college_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL, -- Exam needed for this branch at this college
    total_seats INT,
    closing_rank_general INT, -- Last year cutoff
    closing_rank_obc INT,
    closing_rank_sc INT,
    closing_rank_st INT,
    fees_per_year NUMERIC(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 3. CAREERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL, -- e.g., 'Software Engineer', 'Data Scientist', 'IAS Officer'
    category VARCHAR(100), -- 'IT', 'Government', 'Healthcare'
    description TEXT,
    required_skills TEXT[],
    entry_level_salary NUMERIC(12,2),
    mid_level_salary NUMERIC(12,2),
    future_outlook VARCHAR(100), -- 'High Growth', 'Stable', 'Declining'
    ai_impact VARCHAR(100), -- 'High', 'Medium', 'Low'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 4. SCHOLARSHIPS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255), -- 'Govt of India', 'Reliance Foundation'
    scholarship_type VARCHAR(100), -- 'Merit-Based', 'Means-Based', 'Category-Based'
    amount_description VARCHAR(255), -- 'Up to ₹2,00,000/year'
    eligibility_criteria TEXT,
    min_family_income NUMERIC(12,2),
    max_family_income NUMERIC(12,2),
    deadline DATE,
    official_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 5. UPGRADE STUDENT PROFILES (Living Profile & Student DNA)
-- ---------------------------------------------------------------------
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS class_10_marks NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS class_12_marks NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS science_combo VARCHAR(20), -- 'PCM', 'PCB', 'PCMB'
ADD COLUMN IF NOT EXISTS budget_preference VARCHAR(50), -- 'Low', 'Medium', 'High'
ADD COLUMN IF NOT EXISTS college_preference VARCHAR(100), -- 'Govt Only', 'Any'
ADD COLUMN IF NOT EXISTS academic_strengths TEXT[],
ADD COLUMN IF NOT EXISTS academic_weaknesses TEXT[],
ADD COLUMN IF NOT EXISTS target_colleges TEXT[],
ADD COLUMN IF NOT EXISTS scholarship_needed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completeness INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.student_dna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    aptitude_score INT,
    learning_style VARCHAR(100), -- 'Visual', 'Auditory', 'Kinesthetic'
    self_reported_skills TEXT[],
    ai_inferred_strengths TEXT[],
    ai_inferred_weaknesses TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 6. APPLICATION TRACKER
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    application_number VARCHAR(100),
    status VARCHAR(100) DEFAULT 'Not Started', -- 'Draft', 'Submitted', 'Admit Card', 'Result'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 7. RLS CONFIGURATION
-- ---------------------------------------------------------------------
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

-- Public can read data tables
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public read branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Public read colleges" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Public read college branches" ON public.college_branches FOR SELECT USING (true);
CREATE POLICY "Public read careers" ON public.careers FOR SELECT USING (true);
CREATE POLICY "Public read scholarships" ON public.scholarships FOR SELECT USING (true);

-- User specific RLS
CREATE POLICY "Users can manage own DNA" ON public.student_dna FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own applications" ON public.user_applications FOR ALL USING (auth.uid() = user_id);

-- =====================================================================
-- SEED DATA (A few examples for UI testing)
-- =====================================================================
DO $$
DECLARE
    v_course_btech UUID := gen_random_uuid();
    v_course_bba UUID := gen_random_uuid();
    v_branch_cse UUID := gen_random_uuid();
    v_branch_mech UUID := gen_random_uuid();
    v_college_iitb UUID := gen_random_uuid();
    v_career_swe UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.courses (id, name, level, category, duration_years)
    VALUES 
    (v_course_btech, 'Bachelor of Technology (B.Tech)', 'Undergraduate', 'Engineering', 4.0),
    (v_course_bba, 'Bachelor of Business Administration (BBA)', 'Undergraduate', 'Management', 3.0);

    INSERT INTO public.branches (id, course_id, name, core_subjects, future_scope)
    VALUES 
    (v_branch_cse, v_course_btech, 'Computer Science & Engineering', ARRAY['Data Structures', 'OS', 'Algorithms'], 'High growth in AI, Cloud, and Software Dev'),
    (v_branch_mech, v_course_btech, 'Mechanical Engineering', ARRAY['Thermodynamics', 'Fluid Mechanics'], 'Steady growth in Automotive, Robotics, Manufacturing');

    INSERT INTO public.colleges (id, name, short_name, institution_type, state, city, nirf_ranking)
    VALUES 
    (v_college_iitb, 'Indian Institute of Technology Bombay', 'IIT Bombay', 'Government', 'Maharashtra', 'Mumbai', 3);

    INSERT INTO public.college_branches (college_id, branch_id, total_seats, closing_rank_general, fees_per_year)
    VALUES 
    (v_college_iitb, v_branch_cse, 171, 67, 250000);

    INSERT INTO public.careers (id, title, category, required_skills, future_outlook, ai_impact)
    VALUES 
    (v_career_swe, 'Software Engineer', 'IT', ARRAY['Programming', 'Problem Solving', 'System Design'], 'High Growth', 'Medium');

    INSERT INTO public.scholarships (name, provider, scholarship_type, amount_description, deadline)
    VALUES 
    ('Post Matric Scholarship', 'Government of India', 'Category-Based', 'Full tuition fee waiver', '2026-10-31');
END $$;
