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
