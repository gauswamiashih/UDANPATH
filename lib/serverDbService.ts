'use server';

import { supabaseAdmin } from './supabaseAdmin';

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
