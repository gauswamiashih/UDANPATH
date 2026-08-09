// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Fetching exams...");
  const { data: exams, error: examsErr } = await supabase.from('exams').select('id, short_name, title');
  console.log(examsErr ? 'Error:' + examsErr : `Found ${exams?.length} exams.`);
  
  console.log("Fetching exam_eligibility...");
  const { data: elig, error: eligErr } = await supabase.from('exam_eligibility').select('*');
  console.log(eligErr ? 'Error:' + eligErr : `Found ${elig?.length} eligibility records.`);
  
  if (elig && elig.length > 0) {
    console.log("First eligibility record:", elig[0]);
  }
}
test();
