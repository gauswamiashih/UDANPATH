-- =====================================================================
-- UDANPATH: Dynamic Category & Real Data Recommendation Migrations
-- =====================================================================

-- 1. Add verification and freshness columns to exams table
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'DRAFT' CHECK (verification_status IN ('DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
ADD COLUMN IF NOT EXISTS data_version INT DEFAULT 1;

-- To prevent existing exams from disappearing from the frontend, set them to VERIFIED.
UPDATE exams SET verification_status = 'VERIFIED' WHERE verification_status = 'DRAFT' OR verification_status IS NULL;

-- 2. Modify exam_eligibility to handle broad acceptance rules
ALTER TABLE exam_eligibility
ADD COLUMN IF NOT EXISTS accepts_all_degrees BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepts_all_branches BOOLEAN DEFAULT FALSE;

-- 3. Relational Mappings for Exams (Many-to-Many)

-- Exam <-> Master Education Levels
CREATE TABLE IF NOT EXISTS exam_education_levels (
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    education_level_id UUID REFERENCES master_education_levels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_id, education_level_id)
);

-- Exam <-> Master Degrees
CREATE TABLE IF NOT EXISTS exam_degrees (
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    degree_id UUID REFERENCES master_degrees(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_id, degree_id)
);

-- Exam <-> Master Branches
CREATE TABLE IF NOT EXISTS exam_branches (
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES master_branches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_id, branch_id)
);

-- Exam <-> Master Interests
CREATE TABLE IF NOT EXISTS exam_interests_mapping (
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    interest_id UUID REFERENCES master_interests(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_id, interest_id)
);

-- Exam <-> Master Career Goals
CREATE TABLE IF NOT EXISTS exam_career_goals_mapping (
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    career_goal_id UUID REFERENCES master_career_goals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_id, career_goal_id)
);

-- 4. Multiple Categories per Exam
CREATE TABLE IF NOT EXISTS exam_categories_mapping (
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    category_id UUID REFERENCES exam_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (exam_id, category_id)
);

-- Migrate existing single-category links to the many-to-many table
INSERT INTO exam_categories_mapping (exam_id, category_id)
SELECT id, category_id FROM exams WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Optionally, we can drop category_id from exams later, but we will leave it for backward compatibility for now.
