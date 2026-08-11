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
