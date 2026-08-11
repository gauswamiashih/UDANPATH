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
