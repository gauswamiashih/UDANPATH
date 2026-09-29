import { supabase } from './supabaseClient';
import { Exam, EXAMS_DATABASE } from './examsData';

import { fetchCatalogData, getUserProfileAdmin } from './serverDbService';

// Fetch all exams from Supabase and map them to the Exam model
export async function getExamsFromDb(): Promise<Exam[]> {
  try {
    const data = await fetchCatalogData();

    // If database is empty or fetch fails, fallback to hardcoded exams
    const useFallback = !data || !data.exams || data.exams.length === 0;

    if (useFallback) {
      console.log("Database empty or unavailable. Falling back to EXAMS_DATABASE.");
      return EXAMS_DATABASE.map(e => ({
        ...e,
        dbId: e.id,
        name: e.title || e.name,
        short_name: e.code || e.short_name,
        organization: e.conductingBody || e.organization,
        category_name: e.category,
        salary_information: {
          pay_scale: e.salaryRange || e.payLevel || 'N/A'
        },
        application_status: e.application_status || 'Upcoming',
        exam_level: e.level,
        qualification_levels: e.minEducation ? [e.minEducation] : ['Graduate'],
        degrees: e.minEducation ? [e.minEducation] : ['Graduate'],
        eligible_branches: e.eligibleStreams || ['All Streams'],
        minimum_age: e.minAge || 18,
        maximum_age: e.maxAgeGen || 30,
        age_relaxation: e.ageRelaxation || { OBC: 3, SC: 5, ST: 5, PWD: 10 }
      })) as Exam[];
    }

    const { exams } = data;

    // Construct the Exam structures directly from the DB response
    return (exams || []).map((e: any) => {
      // The DB now returns a flattened, comprehensive object.
      // We just ensure types are aligned and add the category names from the join.

      const catName = Array.isArray(e.category_name) ? e.category_name[0]?.name : e.category_name?.name;
      const catSlug = Array.isArray(e.category_slug) ? e.category_slug[0]?.slug : e.category_slug?.slug;

      const eligibility = e.exam_eligibility?.[0] || {};
      const dates = e.exam_dates?.[0] || {};

      // Fallback to hardcoded data if completely missing
      const hardcodedExam = EXAMS_DATABASE.find((hc: any) => hc.code === e.short_name);

      return {
        ...e,
        dbId: e.id,
        category_name: catName || 'Government',
        category_slug: catSlug,
        minimum_age: eligibility.min_age || hardcodedExam?.minAge || 18,
        maximum_age: eligibility.max_age_general || hardcodedExam?.maxAgeGen || 30,
        age_relaxation: hardcodedExam?.ageRelaxation || { OBC: 3, SC: 5, ST: 5, PWD: 10 },
        degrees: eligibility.min_education ? [eligibility.min_education] : (hardcodedExam?.minEducation ? [hardcodedExam.minEducation] : ['Graduate']),
        eligible_branches: eligibility.eligible_streams || hardcodedExam?.eligibleStreams || ['All Streams'],
        qualification_levels: eligibility.min_education ? [eligibility.min_education] : (hardcodedExam?.minEducation ? [hardcodedExam.minEducation] : ['Graduate']),
        application_start_date: dates.application_start_date || hardcodedExam?.application_start_date,
        application_end_date: dates.application_end_date || hardcodedExam?.application_end_date,
        exam_date: dates.exam_start_date || hardcodedExam?.exam_date,

        // Verification Metadata
        source_url: e.source_url || hardcodedExam?.officialWebsite,
        source_type: e.source_type || 'Secondary',
        last_verified_at: e.last_verified_date,
        academic_year: e.academic_year,
        verification_status: e.verification_status || 'Unknown'
      } as Exam;
    });
  } catch (err) {
    console.error('Error fetching exams from Supabase, falling back:', err);
    return EXAMS_DATABASE.map(e => ({
      ...e,
      dbId: e.id,
      name: e.title || e.name,
      short_name: e.code || e.short_name,
      organization: e.conductingBody || e.organization,
      category_name: e.category,
      salary_information: {
        pay_scale: e.salaryRange || e.payLevel || 'N/A'
      },
      application_status: e.application_status || 'Upcoming',
      exam_level: e.level,
      qualification_levels: e.minEducation ? [e.minEducation] : ['Graduate'],
      degrees: e.minEducation ? [e.minEducation] : ['Graduate'],
      eligible_branches: e.eligibleStreams || ['All Streams'],
      minimum_age: e.minAge || 18,
      maximum_age: e.maxAgeGen || 30,
      age_relaxation: e.ageRelaxation || { OBC: 3, SC: 5, ST: 5, PWD: 10 }
    })) as Exam[];
  }
}

// Fetch user's bookmarks from Supabase and map db UUIDs to client-side slugs
export async function getUserBookmarks(userId: string, examsList: any[]): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('exam_id')
      .eq('user_id', userId);
    if (error) throw error;

    const dbIdToSlugMap = new Map<string, string>();
    examsList.forEach(e => {
      if (e.dbId) dbIdToSlugMap.set(e.dbId, e.id);
    });

    return data.map(b => dbIdToSlugMap.get(b.exam_id) || '').filter(Boolean);
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    return [];
  }
}

// Add/Remove bookmark and return the updated bookmarks list
export async function toggleUserBookmark(userId: string, examId: string, examsList: any[]): Promise<string[] | null> {
  try {
    const exam = examsList.find(e => e.id === examId);
    if (!exam || !exam.dbId) return null;

    // Do not attempt to sync if dbId is a hardcoded string (fallback mode), must be a valid UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(exam.dbId)) {
      return null;
    }

    const { data: existing, error: checkErr } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('exam_id', exam.dbId)
      .maybeSingle();

    if (checkErr) throw checkErr;

    if (existing) {
      const { error: delErr } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', existing.id);
      if (delErr) throw delErr;
    } else {
      const { error: insErr } = await supabase
        .from('user_bookmarks')
        .insert([{ user_id: userId, exam_id: exam.dbId }]);
      if (insErr) throw insErr;
    }

    return await getUserBookmarks(userId, examsList);
  } catch (err) {
    console.error('Error toggling bookmark:', err);
    return null;
  }
}

// Fetch user profile from student_profiles table and map it to frontend profile structure
export async function getUserProfile(userId: string): Promise<any> {
  try {
    return await getUserProfileAdmin(userId);
  } catch (err: any) {
    console.error('Error fetching user profile via admin:', err.message || err);
    return null;
  }
}

// Fetch dynamic roadmap milestones for a specific exam and tier
export async function getExamMilestones(examDbId: string, tier: string): Promise<any[]> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(examDbId)) {
      console.warn('Invalid UUID provided for examDbId. Returning empty milestones.');
      return [];
    }

    const { data, error } = await supabase
      .from('exam_milestones')
      .select('*')
      .eq('exam_id', examDbId)
      .eq('tier', tier)
      .order('phase_order', { ascending: true });

    if (error) {
      console.error('Error fetching milestones from Supabase:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Exception fetching milestones:', err);
    return [];
  }
}

// ---------------------------------------------------------------------
// ADVANCED PROFILE MASTER DATA FETCHING
// ---------------------------------------------------------------------

export async function getMasterEducationLevels() {
  const { data, error } = await supabase.from('master_education_levels').select('*').order('display_order');
  if (error) { console.error('Error fetching education levels:', error.message || error); return []; }
  return data;
}

export async function getMasterStreams(levelId?: string) {
  let query = supabase.from('master_streams').select('*');
  if (levelId) query = query.eq('education_level_id', levelId);
  const { data, error } = await query;
  if (error) { console.error('Error fetching streams:', error.message || error); return []; }
  return data;
}

export async function getMasterDegrees(levelId?: string) {
  let query = supabase.from('master_degrees').select('*');
  if (levelId) query = query.eq('education_level_id', levelId);
  const { data, error } = await query;
  if (error) { console.error('Error fetching degrees:', error.message || error); return []; }
  return data;
}

export async function getMasterBranches(degreeId?: string) {
  let query = supabase.from('master_branches').select('*');
  if (degreeId) query = query.eq('degree_id', degreeId);
  const { data, error } = await query;
  if (error) { console.error('Error fetching branches:', error.message || error); return []; }
  return data;
}

export async function getMasterInterests() {
  const { data, error } = await supabase.from('master_interests').select('*').order('category');
  if (error) { console.error('Error fetching interests:', error.message || error); return []; }
  return data;
}

export async function getMasterCareerGoals() {
  const { data, error } = await supabase.from('master_career_goals').select('*').order('category');
  if (error) { console.error('Error fetching career goals:', error.message || error); return []; }
  return data;
}

export async function saveUserProfile(userId: string, data: any) {
  try {
    // 1. Update basic demographics in student_profiles
    const profileData = {
      user_id: userId,
      date_of_birth: data.dob,
      category: data.category,
      state: data.state,
      highest_qualification: data.degreeName,
      stream: data.branchName,
      percentage_aggregate: parseFloat(data.cgpa) || null
    };

    const { data: existingProfile } = await supabase.from('student_profiles').select('id').eq('user_id', userId).maybeSingle();
    
    let spErr;
    if (existingProfile) {
      const { error } = await supabase.from('student_profiles').update(profileData).eq('user_id', userId);
      spErr = error;
    } else {
      const { error } = await supabase.from('student_profiles').insert([profileData]);
      spErr = error;
    }
    if (spErr) throw spErr;

    // 2. Save Education Details
    if (data.educationLevelId) {
      const { error: eduErr } = await supabase.from('user_education').upsert([{
        user_id: userId,
        education_level_id: data.educationLevelId,
        degree_id: data.degreeId || null,
        branch_id: data.branchId || null,
        status: data.status || null,
        semester: data.semester || null
      }], { onConflict: 'user_id, education_level_id' });
      if (eduErr) throw eduErr;
    }

    // 3. Save Preferences
    const { error: prefErr } = await supabase.from('user_preferences').upsert([{
      user_id: userId,
      study_time: data.studyHours || null,
      preparation_mode: data.mode || null,
      language_preference: data.language || null,
      target_year: data.targetYear || null,
      preparation_status: data.preparationStatus || null
    }], { onConflict: 'user_id' });
    if (prefErr) throw prefErr;

    // 4. Save Interests Mapping (delete old and insert new)
    if (data.interests && data.interests.length > 0) {
      await supabase.from('user_interests_mapping').delete().eq('user_id', userId);
      const interestInserts = data.interests.map((iId: string) => ({ user_id: userId, interest_id: iId }));
      const { error: intErr } = await supabase.from('user_interests_mapping').insert(interestInserts);
      if (intErr) throw intErr;
    }

    // 5. Save Career Goals Mapping
    if (data.goalId) {
      await supabase.from('user_career_goals_mapping').delete().eq('user_id', userId);
      const { error: goalErr } = await supabase.from('user_career_goals_mapping').insert([{
        user_id: userId,
        goal_id: data.goalId,
        is_primary: true
      }]);
      if (goalErr) throw goalErr;
    }

    return true;
  } catch (err: any) {
    console.error('Error saving user profile:', err.message || err);
    return false;
  }
}

// ---------------------------------------------------------------------
// USER STUDY & ROADMAP PROGRESS TRACKING
// ---------------------------------------------------------------------

export async function getUserTaskProgress(userId: string): Promise<Record<string, boolean>> {
  try {
    const { data, error } = await supabase
      .from('user_study_progress')
      .select('notes, is_completed')
      .eq('user_id', userId);

    if (error || !data) return {};

    const progressMap: Record<string, boolean> = {};
    data.forEach(item => {
      if (item.notes) {
        progressMap[item.notes] = item.is_completed;
      }
    });
    return progressMap;
  } catch (err) {
    console.error('Failed to fetch user task progress:', err);
    return {};
  }
}

export async function saveUserTaskProgress(userId: string, taskKey: string, isCompleted: boolean) {
  try {
    const { data: existing } = await supabase
      .from('user_study_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('notes', taskKey)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_study_progress')
        .update({ is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('user_study_progress')
        .insert([{
          user_id: userId,
          notes: taskKey,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        }]);
    }
  } catch (err) {
    console.error('Failed to save user task progress:', err);
  }
}

// ---------------------------------------------------------------------
// ASPIRANT EXPERIENCES SYSTEM
// ---------------------------------------------------------------------

export async function getAspirantExperiences(examId?: string, onlyVerified = true) {
  try {
    let query = supabase.from('aspirant_experiences').select('*');
    if (examId) {
      query = query.eq('exam_id', examId);
    }
    if (onlyVerified) {
      query = query.in('verification_status', ['VERIFIED', 'PUBLIC_SOURCE', 'SELF_REPORTED']);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('aspirant_experiences table query fallback:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Failed to fetch aspirant experiences:', err);
    return [];
  }
}

export async function submitAspirantExperience(userId: string | null, expData: any) {
  try {
    const record = {
      user_id: userId,
      exam_id: expData.exam_id,
      display_name: expData.display_name || 'Aspirant',
      degree: expData.degree,
      branch: expData.branch,
      academic_score: parseFloat(expData.academic_score) || null,
      academic_score_type: expData.academic_score_type || 'CGPA',
      preparation_duration: expData.preparation_duration,
      daily_study_hours: expData.daily_study_hours,
      preparation_mode: expData.preparation_mode,
      starting_level: expData.starting_level || 'Beginner',
      result_type: expData.result_type || 'Qualified',
      rank: expData.rank || null,
      score: expData.score || null,
      what_worked: expData.what_worked,
      mistakes: expData.mistakes,
      difficulties: expData.difficulties,
      advice: expData.advice,
      verification_status: 'PENDING',
      visibility: 'PUBLIC'
    };

    const { data, error } = await supabase.from('aspirant_experiences').insert([record]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to submit experience:', err.message || err);
    return { success: false, error: err.message || err };
  }
}

export async function verifyAspirantExperience(expId: string, status: 'VERIFIED' | 'REJECTED') {
  try {
    const { error } = await supabase
      .from('aspirant_experiences')
      .update({ verification_status: status })
      .eq('id', expId);

    if (error) throw error;
    return true;
  } catch (err: any) {
    console.error('Failed to update experience status:', err.message || err);
    return false;
  }
}


