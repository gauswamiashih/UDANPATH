import { supabase } from './supabaseClient';
import { Exam, EXAMS_DATABASE } from './examsData';

import { fetchCatalogData } from './serverDbService';

// Fetch all exams from Supabase and map them to the Exam model
export async function getExamsFromDb(): Promise<Exam[]> {
  try {
    const data = await fetchCatalogData();
    if (!data) return [];
    
    const { exams } = data;

    if (!exams) return [];

    // Construct the Exam structures directly from the DB response
    return exams.map((e: any) => {
      // The DB now returns a flattened, comprehensive object.
      // We just ensure types are aligned and add the category names from the join.
      
      const catName = Array.isArray(e.category_name) ? e.category_name[0]?.name : e.category_name?.name;
      const catSlug = Array.isArray(e.category_slug) ? e.category_slug[0]?.slug : e.category_slug?.slug;
      
      // Fallback to hardcoded data since exam_eligibility table doesn't exist in Supabase yet
      const hardcodedExam = EXAMS_DATABASE.find((hc: any) => hc.code === e.short_name);

      return {
        ...e,
        category_name: catName || 'Government',
        category_slug: catSlug,
        minimum_age: hardcodedExam?.minAge || 18,
        maximum_age: hardcodedExam?.maxAgeGen || 30,
        age_relaxation: hardcodedExam?.ageRelaxation || { OBC: 3, SC: 5, ST: 5, PWD: 10 },
        degrees: hardcodedExam?.minEducation ? [hardcodedExam.minEducation] : ['Graduate'],
        eligible_branches: hardcodedExam?.eligibleStreams || ['All Streams'],
        qualification_levels: hardcodedExam?.minEducation ? [hardcodedExam.minEducation] : ['Graduate'],
      } as Exam;
    });
  } catch (err) {
    console.error('Error fetching exams from Supabase:', err);
    return [];
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
export async function toggleUserBookmark(userId: string, examId: string, examsList: any[]): Promise<string[]> {
  try {
    const exam = examsList.find(e => e.id === examId);
    if (!exam || !exam.dbId) return [];

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
    return [];
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

    const { data: profileList, error: profErr } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (profErr) {
      console.error('Profile fetch error:', profErr.message, profErr.details, profErr.hint);
      // Don't throw, let it return null instead of crashing
    }

    const profile = profileList && profileList.length > 0 ? profileList[0] : null;

    if (!profile) {
      return null;
    }

    return {
      fullName: userRecord ? userRecord.full_name : 'Aspirant',
      dob: profile.date_of_birth,
      category: profile.category,
      education: profile.highest_qualification,
      branch: profile.stream,
      degree: profile.highest_qualification,
      cgpa: profile.percentage_aggregate,
      interests: profile.target_exam_categories || [],
      target_exam_categories: profile.target_exam_categories || [],
      state: profile.state,
      goal: 'ISRO Scientist', // placeholder for now since goal is not explicitly in DB
      studyHours: '6-8 Hours',
      language: 'English',
      mode: 'Online'
    };
  } catch (err: any) {
    console.error('Error fetching user profile:', err.message || err);
    return null;
  }
}
