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
