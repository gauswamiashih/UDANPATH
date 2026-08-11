-- ====================================================================
-- Migration: 01_dynamic_roadmaps.sql
-- Description: Creates the exam_milestones table to support dynamic 
--              preparation roadmaps per exam.
-- ====================================================================

-- 1. Create the exam_milestones table
CREATE TABLE IF NOT EXISTS public.exam_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL, -- e.g., 'Tier 1', 'Tier 2', 'Tier 3'
    duration_months INTEGER NOT NULL,
    phase_order INTEGER NOT NULL,
    phase_name VARCHAR(255) NOT NULL,
    timeline VARCHAR(100) NOT NULL,
    tasks JSONB NOT NULL, -- Array of strings/objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure we don't have duplicate phases for the same exam and tier
    UNIQUE(exam_id, tier, phase_order)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.exam_milestones ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone (public/anon) to read milestones
CREATE POLICY "Enable read access for all users on exam_milestones"
ON public.exam_milestones
FOR SELECT
USING (true);

-- Allow authenticated admins (if applicable) or service_role to manage them
CREATE POLICY "Enable all access for service role on exam_milestones"
ON public.exam_milestones
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Insert sample dynamic roadmap data for standard exams
-- Note: Assuming you have exams named 'UPSC CSE' and 'GATE' in your exams table.
-- The following uses a subquery to find the exam_id. If it doesn't match, it will be skipped.

INSERT INTO public.exam_milestones (exam_id, tier, duration_months, phase_order, phase_name, timeline, tasks)
SELECT e.id, 'Tier 1', 6, 1, 'Phase 1: Syllabus Sync', 'Weeks 1-2', '["Study official notification syllabus", "Purchase Laxmikanth for Polity", "Establish 6-hour daily slots"]'::jsonb
FROM public.exams e WHERE e.name ILIKE '%UPSC%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.exam_milestones (exam_id, tier, duration_months, phase_order, phase_name, timeline, tasks)
SELECT e.id, 'Tier 1', 6, 2, 'Phase 2: Foundation', 'Months 1-2', '["Complete NCERTs", "Draft personal short notes", "Weekly current affairs digests"]'::jsonb
FROM public.exams e WHERE e.name ILIKE '%UPSC%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.exam_milestones (exam_id, tier, duration_months, phase_order, phase_name, timeline, tasks)
SELECT e.id, 'Tier 1', 6, 3, 'Phase 3: Exhaustive Coverage', 'Months 3-4', '["Complete optional subjects", "Solve 1,500+ objective questions", "Introductory answer writing"]'::jsonb
FROM public.exams e WHERE e.name ILIKE '%UPSC%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.exam_milestones (exam_id, tier, duration_months, phase_order, phase_name, timeline, tasks)
SELECT e.id, 'Tier 1', 6, 4, 'Phase 4: PYQs', 'Month 5', '["Attempt past 10 years solved papers", "Refine speed and accuracy", "Revise weaker subtopics"]'::jsonb
FROM public.exams e WHERE e.name ILIKE '%UPSC%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.exam_milestones (exam_id, tier, duration_months, phase_order, phase_name, timeline, tasks)
SELECT e.id, 'Tier 1', 6, 5, 'Phase 5: Full Mocks', 'Month 6', '["Attempt 10 full-length mocks", "Study revision maps daily", "Maintain sleep hygiene"]'::jsonb
FROM public.exams e WHERE e.name ILIKE '%UPSC%' LIMIT 1
ON CONFLICT DO NOTHING;
