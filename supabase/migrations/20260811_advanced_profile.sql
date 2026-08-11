-- =====================================================================
-- UDANPATH: Advanced User Profile & Personalization Master Schema
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. MASTER DATA TABLES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS master_education_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS master_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    education_level_id UUID REFERENCES master_education_levels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(education_level_id, name)
);

CREATE TABLE IF NOT EXISTS master_degrees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    education_level_id UUID REFERENCES master_education_levels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(education_level_id, name)
);

CREATE TABLE IF NOT EXISTS master_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    degree_id UUID REFERENCES master_degrees(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(degree_id, name)
);

CREATE TABLE IF NOT EXISTS master_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS master_career_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100),
    name VARCHAR(100) UNIQUE NOT NULL
);

-- ---------------------------------------------------------------------
-- 2. NORMALIZED USER PROFILE TABLES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    education_level_id UUID REFERENCES master_education_levels(id),
    degree_id UUID REFERENCES master_degrees(id),
    branch_id UUID REFERENCES master_branches(id),
    stream_id UUID REFERENCES master_streams(id),
    status VARCHAR(50), -- 'Currently Studying', 'Completed', 'Dropped'
    semester VARCHAR(50),
    passing_year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, education_level_id)
);

CREATE TABLE IF NOT EXISTS user_academic_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    education_level_id UUID REFERENCES master_education_levels(id),
    score_type VARCHAR(20), -- 'Percentage', 'CGPA', 'Grade'
    score_value NUMERIC(5, 2),
    board_university VARCHAR(255),
    UNIQUE(user_id, education_level_id)
);

CREATE TABLE IF NOT EXISTS user_interests_mapping (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES master_interests(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, interest_id)
);

CREATE TABLE IF NOT EXISTS user_career_goals_mapping (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES master_career_goals(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, goal_id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    study_time VARCHAR(50),
    preparation_mode VARCHAR(50),
    language_preference VARCHAR(50),
    budget_online VARCHAR(50),
    budget_offline VARCHAR(50),
    target_year INT,
    preparation_status VARCHAR(100),
    preferred_learning_formats TEXT[], 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_target_exams_mapping (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, exam_id)
);

-- ---------------------------------------------------------------------
-- 3. SEEDING MASTER DATA (Idempotent)
-- ---------------------------------------------------------------------

-- Education Levels
INSERT INTO master_education_levels (name, display_order) VALUES 
('Class 10', 1), ('Class 11', 2), ('Class 12', 3), ('ITI', 4), ('Diploma', 5), 
('Undergraduate', 6), ('Post-Graduation', 7), ('PhD', 8)
ON CONFLICT (name) DO NOTHING;

-- Streams for Class 12
WITH level_12 AS (SELECT id FROM master_education_levels WHERE name = 'Class 12')
INSERT INTO master_streams (education_level_id, name)
SELECT id, val FROM level_12, unnest(ARRAY['Science', 'Commerce', 'Arts / Humanities', 'Vocational']) AS val
ON CONFLICT DO NOTHING;

-- Degrees for Diploma
WITH level_dip AS (SELECT id FROM master_education_levels WHERE name = 'Diploma')
INSERT INTO master_degrees (education_level_id, name)
SELECT id, val FROM level_dip, unnest(ARRAY['Diploma in Computer Engineering', 'Diploma in Mechanical Engineering', 'Diploma in Civil Engineering', 'Diploma in Electrical Engineering', 'Diploma in IT']) AS val
ON CONFLICT DO NOTHING;

-- Degrees for Undergraduate
WITH level_ug AS (SELECT id FROM master_education_levels WHERE name = 'Undergraduate')
INSERT INTO master_degrees (education_level_id, name)
SELECT id, val FROM level_ug, unnest(ARRAY['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'B.A.', 'BCA', 'BBA', 'B.Pharm', 'LLB', 'MBBS']) AS val
ON CONFLICT DO NOTHING;

-- Degrees for Post-Graduation
WITH level_pg AS (SELECT id FROM master_education_levels WHERE name = 'Post-Graduation')
INSERT INTO master_degrees (education_level_id, name)
SELECT id, val FROM level_pg, unnest(ARRAY['M.Tech', 'M.E.', 'M.Sc', 'M.Com', 'M.A.', 'MBA', 'MCA', 'LLM', 'MD/MS']) AS val
ON CONFLICT DO NOTHING;

-- Branches for B.Tech
WITH degree_btech AS (SELECT id FROM master_degrees WHERE name = 'B.Tech')
INSERT INTO master_branches (degree_id, name)
SELECT id, val FROM degree_btech, unnest(ARRAY['Computer Engineering', 'Computer Science', 'Information Technology', 'AI & Machine Learning', 'Data Science', 'Cyber Security', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Aerospace Engineering', 'Biotechnology']) AS val
ON CONFLICT DO NOTHING;

-- Branches for B.Sc
WITH degree_bsc AS (SELECT id FROM master_degrees WHERE name = 'B.Sc')
INSERT INTO master_branches (degree_id, name)
SELECT id, val FROM degree_bsc, unnest(ARRAY['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Biology', 'Statistics', 'IT']) AS val
ON CONFLICT DO NOTHING;

-- Branches for B.Com
WITH degree_bcom AS (SELECT id FROM master_degrees WHERE name = 'B.Com')
INSERT INTO master_branches (degree_id, name)
SELECT id, val FROM degree_bcom, unnest(ARRAY['Accounting', 'Finance', 'Banking', 'Business']) AS val
ON CONFLICT DO NOTHING;

-- Interests
INSERT INTO master_interests (category, name) VALUES 
('TECHNOLOGY', 'IT'),
('TECHNOLOGY', 'Software Development'),
('TECHNOLOGY', 'AI / ML'),
('TECHNOLOGY', 'Data Science'),
('TECHNOLOGY', 'Cyber Security'),
('GOVERNMENT', 'Government Jobs'),
('GOVERNMENT', 'Civil Services'),
('GOVERNMENT', 'PSU'),
('GOVERNMENT', 'Defence'),
('GOVERNMENT', 'Railway'),
('GOVERNMENT', 'Banking'),
('MANAGEMENT', 'Management'),
('MANAGEMENT', 'Finance'),
('MANAGEMENT', 'Marketing')
ON CONFLICT (name) DO NOTHING;

-- Career Goals
INSERT INTO master_career_goals (category, name) VALUES 
('Government', 'Government Technical Job'),
('Government', 'IAS Officer'),
('Government', 'Bank PO'),
('Private', 'Software Engineer'),
('Private', 'AI/ML Engineer'),
('Private', 'Cyber Security Expert'),
('Academic', 'Higher Studies'),
('Academic', 'Research')
ON CONFLICT (name) DO NOTHING;
