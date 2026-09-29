-- =====================================================================
-- Migration: 99_fix_db_schema.sql
-- Description: Fixes missing unique constraints and RLS policies 
--              discovered during database check.
-- =====================================================================

-- 1. Fix missing UNIQUE constraint on student_profiles (required for upsert)
ALTER TABLE IF EXISTS public.student_profiles 
  ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);

-- 2. Enable RLS for Advanced Profile tables (if not already enabled)
ALTER TABLE IF EXISTS public.user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for user_education
CREATE POLICY "Users can view own education" ON public.user_education FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own education" ON public.user_education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own education" ON public.user_education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own education" ON public.user_education FOR DELETE USING (auth.uid() = user_id);

-- 4. Create RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 5. Create RLS Policies for student_profiles
CREATE POLICY "Users can view own profile" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);

-- 6. Create RLS Policies for user_academic_records
CREATE POLICY "Users can view own academic records" ON public.user_academic_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own academic records" ON public.user_academic_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own academic records" ON public.user_academic_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own academic records" ON public.user_academic_records FOR DELETE USING (auth.uid() = user_id);
