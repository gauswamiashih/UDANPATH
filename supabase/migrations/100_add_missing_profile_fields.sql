-- Add missing fields to student_profiles
ALTER TABLE IF EXISTS public.student_profiles 
  ADD COLUMN IF NOT EXISTS class_10_marks NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS class_12_marks NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS science_combo VARCHAR(50),
  ADD COLUMN IF NOT EXISTS budget VARCHAR(100),
  ADD COLUMN IF NOT EXISTS college_preference VARCHAR(100);
