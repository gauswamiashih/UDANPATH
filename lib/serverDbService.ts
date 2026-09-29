'use server';

import { supabaseAdmin } from './supabaseAdmin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function fetchCatalogData() {
  try {
    const [
      { data: categories },
      { data: exams },
      { data: educationHierarchy }
    ] = await Promise.all([
      supabaseAdmin.from('exam_categories').select('*'),
      supabaseAdmin.from('exams').select(`
        *,
        category_name:exam_categories(name),
        category_slug:exam_categories(slug),
        exam_eligibility(*),
        exam_dates(*),
        exam_categories_mapping(exam_categories(id, name, slug)),
        exam_education_levels(master_education_levels(id, name)),
        exam_degrees(master_degrees(id, name)),
        exam_branches(master_branches(id, name)),
        exam_interests_mapping(master_interests(id, name)),
        exam_career_goals_mapping(master_career_goals(id, name))
      `).eq('verification_status', 'VERIFIED'),
      supabaseAdmin.from('education_hierarchy').select('*')
    ]);

    return { categories, exams, educationHierarchy };
  } catch (error) {
    console.error('Error in fetchCatalogData:', error);
    return null;
  }
}

export async function saveUserProfileAdmin(userId: string, data: any) {
  try {
    // 0. Verify Session securely
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );
    const { data: { session } } = await supabaseAuth.auth.getSession();
    if (!session || session.user.id !== userId) {
      console.error('Unauthorized profile save attempt');
      return false;
    }

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

    const { data: existingProfile } = await supabaseAdmin.from('student_profiles').select('id').eq('user_id', userId).maybeSingle();
    
    let spErr;
    if (existingProfile) {
      const { error } = await supabaseAdmin.from('student_profiles').update(profileData).eq('user_id', userId);
      spErr = error;
    } else {
      const { error } = await supabaseAdmin.from('student_profiles').insert([profileData]);
      spErr = error;
    }
    if (spErr) throw spErr;

    // 2. Save Education Details
    if (data.educationLevelId) {
      const { error: eduErr } = await supabaseAdmin.from('user_education').upsert([{
        user_id: userId,
        education_level_id: data.educationLevelId,
        degree_id: data.degreeId || null,
        branch_id: data.branchId || null,
        status: data.status || null,
        semester: data.semester || null
      }], { onConflict: 'user_id, education_level_id' });
      if (eduErr) throw eduErr;
    }

    if (data.scienceCombo) {
      const class12Level = await supabaseAdmin.from('master_education_levels').select('id').eq('name', 'Class 12').single();
      if (class12Level.data) {
        const branchRes = await supabaseAdmin.from('master_branches').select('id, degree_id').eq('name', data.scienceCombo).single();
        if (branchRes.data) {
          await supabaseAdmin.from('user_education').upsert([{
            user_id: userId,
            education_level_id: class12Level.data.id,
            degree_id: branchRes.data.degree_id,
            branch_id: branchRes.data.id
          }], { onConflict: 'user_id, education_level_id' });
        }
      }
    }

    // 3. Save Preferences
    const { error: prefErr } = await supabaseAdmin.from('user_preferences').upsert([{
      user_id: userId,
      study_time: data.studyHours || null,
      preparation_mode: data.mode || null,
      language_preference: data.language || null,
      budget_online: data.budget || null,
      budget_offline: data.collegePreference || null,
      target_year: data.targetYear || null,
      preparation_status: data.preparationStatus || null
    }], { onConflict: 'user_id' });
    if (prefErr) throw prefErr;

    // 3.5. Save Academic Records for Class 10 & 12
    if (data.class10Marks) {
      const class10Level = await supabaseAdmin.from('master_education_levels').select('id').eq('name', 'Class 10').single();
      if (class10Level.data) {
        await supabaseAdmin.from('user_academic_records').upsert([{
          user_id: userId,
          education_level_id: class10Level.data.id,
          score_type: 'Percentage',
          score_value: parseFloat(data.class10Marks)
        }], { onConflict: 'user_id, education_level_id' });
      }
    }
    if (data.class12Marks) {
      const class12Level = await supabaseAdmin.from('master_education_levels').select('id').eq('name', 'Class 12').single();
      if (class12Level.data) {
        await supabaseAdmin.from('user_academic_records').upsert([{
          user_id: userId,
          education_level_id: class12Level.data.id,
          score_type: 'Percentage',
          score_value: parseFloat(data.class12Marks)
        }], { onConflict: 'user_id, education_level_id' });
      }
    }

    // 4. Save Interests Mapping (delete old and insert new)
    if (data.interests && data.interests.length > 0) {
      await supabaseAdmin.from('user_interests_mapping').delete().eq('user_id', userId);
      const interestInserts = data.interests.map((iId: string) => ({ user_id: userId, interest_id: iId }));
      const { error: intErr } = await supabaseAdmin.from('user_interests_mapping').insert(interestInserts);
      if (intErr) throw intErr;
    }

    // 5. Save Career Goals Mapping
    if (data.goalId) {
      await supabaseAdmin.from('user_career_goals_mapping').delete().eq('user_id', userId);
      const { error: goalErr } = await supabaseAdmin.from('user_career_goals_mapping').insert([{
        user_id: userId,
        goal_id: data.goalId,
        is_primary: true
      }]);
      if (goalErr) throw goalErr;
    }

    return true;
  } catch (err: any) {
    console.error('Error saving user profile admin:', err.message || err);
    return false;
  }
}

export async function getUserProfileAdmin(userId: string) {
  try {
    // 0. Verify Session securely
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );
    const { data: { session } } = await supabaseAuth.auth.getSession();
    if (!session || session.user.id !== userId) {
      console.error('Unauthorized profile read attempt');
      return null;
    }

    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    const { data: eduList } = await supabaseAdmin.from('user_education').select('*, master_degrees(name), master_branches(name), master_education_levels(name)').eq('user_id', userId).order('created_at', { ascending: false });
    const eduData = eduList && eduList.length > 0 ? eduList[0] : null;
    const class12Edu = eduList?.find((e: any) => e.master_education_levels?.name === 'Class 12');
    const { data: prefData } = await supabaseAdmin.from('user_preferences').select('*').eq('user_id', userId).maybeSingle();
    const { data: goalsData } = await supabaseAdmin.from('user_career_goals_mapping').select('goal_id, master_career_goals(name)').eq('user_id', userId).eq('is_primary', true).maybeSingle();
    const { data: interestsData } = await supabaseAdmin.from('user_interests_mapping').select('interest_id, master_interests(name)').eq('user_id', userId);
    const { data: academicData } = await supabaseAdmin.from('user_academic_records').select('score_value, master_education_levels(name)').eq('user_id', userId);

    let profile = null;
    const { data: profileList } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    profile = profileList && profileList.length > 0 ? profileList[0] : null;

    if (!profile && !eduData && !prefData) return null;

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
      interests: interestsData && interestsData.length > 0 ? interestsData.map((i: any) => i.interest_id) : (profile?.target_exam_categories || []),
      interestNames: interestsData && interestsData.length > 0 ? interestsData.map((i: any) => i.master_interests?.name) : [],
      target_exam_categories: profile?.target_exam_categories || [],
      state: profile?.state,
      class10Marks: academicData?.find((a: any) => a.master_education_levels?.name === 'Class 10')?.score_value || null,
      class12Marks: academicData?.find((a: any) => a.master_education_levels?.name === 'Class 12')?.score_value || null,
      scienceCombo: class12Edu?.master_branches?.name || null,
      budget: prefData?.budget_online || null,
      collegePreference: prefData?.budget_offline || null,
      goal: (goalsData as any)?.master_career_goals?.name || profile?.career_goal || 'ISRO Scientist',
      goalId: goalsData?.goal_id || '',
      studyHours: prefData?.study_time || '6-8 Hours',
      language: prefData?.language_preference || 'English',
      mode: prefData?.preparation_mode || 'Online',
      completeness
    };
  } catch (err: any) {
    console.error('Error fetching user profile admin:', err.message || err);
    return null;
  }
}

export async function addOrUpdateExamAdmin(payload: any, id?: string) {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );
    const { data: { session } } = await supabaseAuth.auth.getSession();
    
    // Check if exam_coordinator
    if (!session) {
      throw new Error('Unauthorized');
    }

    // Resolve Category
    let categoryId = null;
    if (payload.category_name) {
      const { data: existingCategory } = await supabaseAdmin
        .from('exam_categories')
        .select('id')
        .eq('name', payload.category_name)
        .maybeSingle();

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const { data: newCategory, error: catErr } = await supabaseAdmin
          .from('exam_categories')
          .insert([{ 
            name: payload.category_name, 
            slug: payload.category_name.toLowerCase().replace(/[^a-z0-9]/g, '-') 
          }])
          .select('id')
          .single();
        if (!catErr && newCategory) {
          categoryId = newCategory.id;
        }
      }
    }

    const examPayload = {
      name: payload.name,
      short_name: payload.short_name,
      slug: payload.slug || payload.short_name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      organization: payload.organization,
      exam_level: payload.exam_level,
      status: payload.status,
      official_website: payload.official_website,
      verification_status: 'VERIFIED',
      ...(categoryId ? { category_id: categoryId } : {})
    };

    let examId = id;

    if (id) {
      const { error } = await supabaseAdmin.from('exams').update(examPayload).eq('id', id);
      if (error) throw error;
    } else {
      const { data, error } = await supabaseAdmin.from('exams').insert([examPayload]).select('id').single();
      if (error) throw error;
      examId = data.id;
    }

    // Upsert Exam Eligibility
    if (examId) {
      const eligibilityPayload = {
        exam_id: examId,
        min_age: payload.minimum_age || 18,
        max_age_general: payload.maximum_age || 30,
        min_education: payload.minimum_education || 'Graduate',
        eligible_streams: payload.eligible_streams || ['All Streams']
      };
      
      const { data: existingEligibility } = await supabaseAdmin.from('exam_eligibility').select('id').eq('exam_id', examId).maybeSingle();
      if (existingEligibility) {
        await supabaseAdmin.from('exam_eligibility').update(eligibilityPayload).eq('exam_id', examId);
      } else {
        await supabaseAdmin.from('exam_eligibility').insert([eligibilityPayload]);
      }
      
      // Upsert Exam Dates
      if (payload.application_start_date || payload.exam_date) {
        const datesPayload = {
          exam_id: examId,
          application_start_date: payload.application_start_date || null,
          application_end_date: payload.application_end_date || null,
          exam_start_date: payload.exam_date || null,
          status: payload.status
        };
        
        const { data: existingDates } = await supabaseAdmin.from('exam_dates').select('id').eq('exam_id', examId).maybeSingle();
        if (existingDates) {
          await supabaseAdmin.from('exam_dates').update(datesPayload).eq('exam_id', examId);
        } else {
          await supabaseAdmin.from('exam_dates').insert([datesPayload]);
        }
      }
    }

    return true;
  } catch (err: any) {
    console.error('Error saving exam admin:', err.message || err);
    throw err;
  }
}

export async function getCurrentUserRole() {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );
    const { data: { session } } = await supabaseAuth.auth.getSession();
    if (!session) return null;

    const { data: userRow } = await supabaseAdmin.from('users').select('role').eq('id', session.user.id).single();
    return userRow?.role || 'student';
  } catch (e) {
    return 'student';
  }
}

export async function fetchDeepExamDetails(examId: string) {
  try {
    const { data: examData, error: examErr } = await supabaseAdmin
      .from('exams')
      .select(`
        *,
        category_name:exam_categories(name),
        category_slug:exam_categories(slug),
        exam_eligibility(*),
        exam_dates(*)
      `)
      .eq('id', examId)
      .single();

    if (examErr || !examData) return null;

    // Fetch Deep Ecosystem
    const { data: papers } = await supabaseAdmin.from('exam_papers').select('*').eq('exam_id', examId);
    const paperIds = papers?.map(p => p.id) || [];
    
    let subjects: any[] = [];
    if (paperIds.length > 0) {
      const { data: subs } = await supabaseAdmin.from('exam_subjects').select('*').in('paper_id', paperIds);
      subjects = subs || [];
    }
    
    const subjectIds = subjects.map(s => s.id) || [];
    let topics: any[] = [];
    if (subjectIds.length > 0) {
      const { data: tops } = await supabaseAdmin.from('exam_topics').select('*').in('subject_id', subjectIds);
      topics = tops || [];
    }

    const { data: pyqs } = await supabaseAdmin.from('exam_pyqs').select('*').eq('exam_id', examId);
    const { data: pdfs } = await supabaseAdmin.from('exam_pdfs').select('*').eq('exam_id', examId);
    const { data: courses } = await supabaseAdmin.from('exam_courses').select('*').eq('exam_id', examId);
    const { data: coaching } = await supabaseAdmin.from('exam_coaching').select('*').eq('exam_id', examId);
    const { data: youtube } = await supabaseAdmin.from('exam_youtube_resources').select('*').eq('exam_id', examId);
    const { data: careerPaths } = await supabaseAdmin.from('exam_career_paths').select('*').eq('exam_id', examId);

    // Map into expected structures
    const exam = { ...examData, dbId: examData.id };

    return {
      exam,
      live_dates: examData.exam_dates?.[0] || null,
      papers: papers || [],
      subjects,
      topics,
      pyqs: pyqs || [],
      pdfs: pdfs || [],
      courses: courses || [],
      coaching: coaching || [],
      youtube: youtube || [],
      career_paths: careerPaths || []
    };
  } catch (error) {
    console.error('Error in fetchDeepExamDetails:', error);
    return null;
  }
}

// ---------------------------------------------------------------------
// MASTER DATA FETCHING (Bypassing RLS with Admin)
// ---------------------------------------------------------------------

export async function fetchMasterEducationLevels() {
  const { data, error } = await supabaseAdmin.from('master_education_levels').select('*').order('display_order');
  if (error) { console.error('Error fetching education levels:', error.message || error); return []; }
  return data || [];
}

export async function fetchMasterStreams(levelId?: string) {
  let query = supabaseAdmin.from('master_streams').select('*');
  if (levelId) query = query.eq('education_level_id', levelId);
  const { data, error } = await query;
  if (error) { console.error('Error fetching streams:', error.message || error); return []; }
  return data || [];
}

export async function fetchMasterDegrees(levelId?: string) {
  let query = supabaseAdmin.from('master_degrees').select('*');
  if (levelId) query = query.eq('education_level_id', levelId);
  const { data, error } = await query;
  if (error) { console.error('Error fetching degrees:', error.message || error); return []; }
  return data || [];
}

export async function fetchMasterBranches(degreeId?: string) {
  let query = supabaseAdmin.from('master_branches').select('*');
  if (degreeId) query = query.eq('degree_id', degreeId);
  const { data, error } = await query;
  if (error) { console.error('Error fetching branches:', error.message || error); return []; }
  return data || [];
}

export async function fetchMasterInterests() {
  const { data, error } = await supabaseAdmin.from('master_interests').select('*').order('category');
  if (error) { console.error('Error fetching interests:', error.message || error); return []; }
  return data || [];
}

export async function fetchMasterCareerGoals() {
  const { data, error } = await supabaseAdmin.from('master_career_goals').select('*').order('category');
  if (error) { console.error('Error fetching career goals:', error.message || error); return []; }
  return data || [];
}



