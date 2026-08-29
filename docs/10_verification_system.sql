-- =====================================================================
-- MIGRATION: 10_verification_system.sql
-- Description: Adds Verification Metadata, Testing, and Error tracking
--              to ensure strict AI accuracy and data freshness.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. VERIFICATION METADATA
-- Add tracking columns to critical entities
-- ---------------------------------------------------------------------

-- Alter EXAMS table
ALTER TABLE public.exams
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(100) DEFAULT 'Secondary' CHECK (source_type IN ('Official', 'Trusted Institutional', 'Secondary')),
ADD COLUMN IF NOT EXISTS last_verified_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20),
ADD COLUMN IF NOT EXISTS valid_from DATE,
ADD COLUMN IF NOT EXISTS valid_until DATE,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Unknown' CHECK (verification_status IN ('Verified', 'Needs verification', 'Outdated', 'Unknown'));

-- Alter COLLEGES table
ALTER TABLE public.colleges
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(100) DEFAULT 'Secondary' CHECK (source_type IN ('Official', 'Trusted Institutional', 'Secondary')),
ADD COLUMN IF NOT EXISTS last_verified_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20),
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Unknown' CHECK (verification_status IN ('Verified', 'Needs verification', 'Outdated', 'Unknown'));

-- Alter SCHOLARSHIPS table
ALTER TABLE public.scholarships
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(100) DEFAULT 'Secondary' CHECK (source_type IN ('Official', 'Trusted Institutional', 'Secondary')),
ADD COLUMN IF NOT EXISTS last_verified_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20),
ADD COLUMN IF NOT EXISTS valid_from DATE,
ADD COLUMN IF NOT EXISTS valid_until DATE,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'Unknown' CHECK (verification_status IN ('Verified', 'Needs verification', 'Outdated', 'Unknown'));

-- ---------------------------------------------------------------------
-- 2. USER CORRECTION SYSTEM
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_data_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'Exam', 'College', 'Scholarship'
    entity_id UUID NOT NULL,
    error_type VARCHAR(100) NOT NULL, -- 'Wrong date', 'Outdated', 'Wrong eligibility', etc.
    user_comment TEXT,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Review', 'Resolved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ---------------------------------------------------------------------
-- 3. AI ERROR KNOWLEDGE BASE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    ai_answer TEXT NOT NULL,
    correct_verified_answer TEXT,
    error_category VARCHAR(100) NOT NULL, -- 'Hallucination', 'Outdated data', 'Wrong eligibility', etc.
    source_used TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 4. GOLDEN TEST SET (For Regression Testing)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_golden_test_set (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL, -- 'Eligibility', 'Dates', 'Adversarial', 'Hallucination'
    question TEXT NOT NULL,
    expected_answer TEXT NOT NULL,
    required_source_type VARCHAR(100),
    difficulty VARCHAR(50),
    expected_confidence VARCHAR(50), -- 'High', 'Low'
    last_tested TIMESTAMP WITH TIME ZONE,
    last_test_result VARCHAR(50) CHECK (last_test_result IN ('Pass', 'Fail', 'Untested')) DEFAULT 'Untested',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------
-- 5. RLS CONFIGURATION
-- ---------------------------------------------------------------------
ALTER TABLE public.user_data_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_golden_test_set ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports and read their own reports
CREATE POLICY "Users can insert corrections" ON public.user_data_corrections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own corrections" ON public.user_data_corrections FOR SELECT USING (auth.uid() = user_id);

-- Admins can read all test sets and error logs (assuming admin role or bypassing in service role)
-- Service role bypasses RLS anyway.
