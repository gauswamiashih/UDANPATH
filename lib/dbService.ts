import { supabase } from './supabaseClient';
import { Exam, EXAMS_DATABASE } from './examsData';

import { fetchCatalogData } from './serverDbService';

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

      // Fallback to hardcoded data since exam_eligibility table doesn't exist in Supabase yet
      const hardcodedExam = EXAMS_DATABASE.find((hc: any) => hc.code === e.short_name);

      return {
        ...e,
        dbId: e.id,
        category_name: catName || 'Government',
        category_slug: catSlug,
        minimum_age: hardcodedExam?.minAge || 18,
        maximum_age: hardcodedExam?.maxAgeGen || 30,
        age_relaxation: hardcodedExam?.ageRelaxation || { OBC: 3, SC: 5, ST: 5, PWD: 10 },
        degrees: hardcodedExam?.minEducation ? [hardcodedExam.minEducation] : ['Graduate'],
        eligible_branches: hardcodedExam?.eligibleStreams || ['All Streams'],
        qualification_levels: hardcodedExam?.minEducation ? [hardcodedExam.minEducation] : ['Graduate'],

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
    const { data: userRecord, error: userErr } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    if (userErr) {
      console.error('User fetch error:', userErr.message, userErr.details, userErr.hint);
    }

    // Try to fetch from the new normalized tables first
    const { data: eduData } = await supabase.from('user_education').select('*, master_degrees(name), master_branches(name), master_education_levels(name)').eq('user_id', userId).maybeSingle();
    const { data: prefData } = await supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle();
    const { data: goalsData } = await supabase.from('user_career_goals_mapping').select('goal_id, master_career_goals(name)').eq('user_id', userId).eq('is_primary', true).maybeSingle();

    // Fallback to legacy student_profiles if new data doesn't exist
    let profile = null;
    const { data: profileList, error: profErr } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (profErr) {
      console.error('Profile fetch error:', profErr.message, profErr.details, profErr.hint);
    }

    profile = profileList && profileList.length > 0 ? profileList[0] : null;

    if (!profile && !eduData && !prefData) {
      return null; // No profile found anywhere
    }

    // Calculate completeness (rough estimate for UI)
    const completeness = Math.min(100, Math.round(((eduData ? 40 : 0) + (prefData ? 30 : 0) + (goalsData ? 30 : 0)) || (profile ? 50 : 0)));

    return {
      fullName: userRecord ? userRecord.full_name : 'Aspirant',
      dob: profile?.date_of_birth,
      category: profile?.category || 'GENERAL',
      education: eduData?.master_education_levels?.name || profile?.highest_qualification,
      educationLevelId: eduData?.education_level_id || '',
      branch: eduData?.master_branches?.name || profile?.stream,
      branchId: eduData?.branch_id || '',
      degree: eduData?.master_degrees?.name || profile?.highest_qualification,
      degreeId: eduData?.degree_id || '',
      cgpa: profile?.percentage_aggregate,
      interests: profile?.target_exam_categories || [],
      target_exam_categories: profile?.target_exam_categories || [],
      state: profile?.state,
      goal: (goalsData as any)?.master_career_goals?.name || profile?.career_goal || 'ISRO Scientist',
      goalId: goalsData?.goal_id || '',
      studyHours: prefData?.study_time || '6-8 Hours',
      language: prefData?.language_preference || 'English',
      mode: prefData?.preparation_mode || 'Online',
      completeness
    };
  } catch (err: any) {
    console.error('Error fetching user profile:', err.message || err);
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

