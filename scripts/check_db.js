// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking master_education_levels...");
  const { data: edu, error: eduErr } = await supabase.from('master_education_levels').select('*');
  if (eduErr) console.error("Error:", eduErr);
  else console.log(`Found ${edu.length} master_education_levels`);

  console.log("Checking user_education...");
  const { data: userEdu, error: userEduErr } = await supabase.from('user_education').select('*');
  if (userEduErr) console.error("Error:", userEduErr);
  else console.log(`Found ${userEdu.length} user_education`);

  console.log("Checking student_profiles (does it exist?)...");
  const { data: sp, error: spErr } = await supabase.from('student_profiles').select('*').limit(1);
  if (spErr) console.error("Error:", spErr);
  else console.log("student_profiles exists, rows:", sp?.length);
}

check();
