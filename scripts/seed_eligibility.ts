import { createClient } from '@supabase/supabase-js';
import { EXAMS_DATABASE } from '../lib/examsData';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seedEligibility() {
  console.log('Upserting exams into DB...');

  for (const hardcodedExam of EXAMS_DATABASE) {
    // 1. Upsert exam
    const examRecord = {
      short_name: hardcodedExam.code,
      name: hardcodedExam.title,
      description: hardcodedExam.description,
      organization: hardcodedExam.conductingBody,
      application_status: hardcodedExam.application_status || 'Upcoming',
      qualification_levels: [hardcodedExam.minEducation],
      degrees: hardcodedExam.minEducation === 'Graduate' ? ['B.Tech', 'B.E.', 'B.Sc', 'B.A.', 'B.Com', 'BCA', 'BBA'] : [hardcodedExam.minEducation],
      branches: hardcodedExam.eligibleStreams || [],
      eligible_branches: hardcodedExam.eligibleStreams || [],
      minimum_age: hardcodedExam.minAge || 18,
      maximum_age: hardcodedExam.maxAgeGen || 30,
      eligible_categories: ['All'],
      eligible_states: ['All India'],
      nationality: 'Indian',
      minimum_percentage: 0,
      selection_process: hardcodedExam.stages?.map((s: any) => s.stage) || []
    };

    const { data: insertedExam, error: examErr } = await supabase
      .from('exams')
      .upsert(examRecord, { onConflict: 'short_name' })
      .select('id')
      .single();

    if (examErr || !insertedExam) {
      console.error(`Error inserting exam ${hardcodedExam.code}:`, examErr);
      continue;
    } else {
      console.log(`Inserted/Updated exam ${hardcodedExam.code}`);
    }
  }
  console.log('Seeding complete.');
}

seedEligibility();
