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
