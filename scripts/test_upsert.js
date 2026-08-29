const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const userId = '11111111-1111-1111-1111-111111111111'; // dummy
  
  // Test student_profiles
  const { error: spErr } = await supabase.from('student_profiles').upsert([{
    user_id: userId,
  }], { onConflict: 'user_id' });
  console.log('student_profiles error:', spErr?.message);

  // Test user_education
  const { error: eduErr } = await supabase.from('user_education').upsert([{
    user_id: userId,
    education_level_id: '11111111-1111-1111-1111-111111111111'
  }], { onConflict: 'user_id, education_level_id' });
  console.log('user_education error:', eduErr?.message);

  // Test user_preferences
  const { error: prefErr } = await supabase.from('user_preferences').upsert([{
    user_id: userId,
  }], { onConflict: 'user_id' });
  console.log('user_preferences error:', prefErr?.message);
}

test();
