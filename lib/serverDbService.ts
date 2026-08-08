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
        category_slug:exam_categories(slug)
      `),
      supabaseAdmin.from('education_hierarchy').select('*')
    ]);

    return { categories, exams, educationHierarchy };
  } catch (error) {
    console.error('Error in fetchCatalogData:', error);
    return null;
  }
}
