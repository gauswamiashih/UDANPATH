import { createClient } from '@supabase/supabase-js';
import { EXAMS_DATABASE } from '../lib/examsData';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seedEligibility() {
  console.log('Fetching exams from DB...');
  const { data: dbExams, error: fetchErr } = await supabase.from('exams').select('id, short_name');
  
  if (fetchErr || !dbExams) {
    console.error('Error fetching exams:', fetchErr);
    return;
  }
  
  console.log(`Found ${dbExams.length} exams in database.`);
  
  for (const dbExam of dbExams) {
    const hardcodedExam = EXAMS_DATABASE.find(e => e.code === dbExam.short_name);
    if (!hardcodedExam) {
      console.log(`No hardcoded data found for ${dbExam.short_name}`);
      continue;
    }
    
    const eligibilityRecord = {
      exam_id: dbExam.id,
      min_age: hardcodedExam.minAge || 18,
      max_age_general: hardcodedExam.maxAgeGen || 30,
      age_relaxation_obc: hardcodedExam.ageRelaxation?.OBC || 3,
      age_relaxation_sc_st: hardcodedExam.ageRelaxation?.SC || 5,
      age_relaxation_pwd: hardcodedExam.ageRelaxation?.PWD || 10,
      min_education: hardcodedExam.minEducation || '12th',
      eligible_streams: hardcodedExam.eligibleStreams || []
    };
    
    const { error: upsertErr } = await supabase
      .from('exam_eligibility')
      .upsert(eligibilityRecord, { onConflict: 'exam_id' });
      
    if (upsertErr) {
      console.error(`Error inserting eligibility for ${dbExam.short_name}:`, upsertErr);
    } else {
      console.log(`Inserted eligibility for ${dbExam.short_name}`);
    }
  }
  console.log('Seeding complete.');
}

seedEligibility();
