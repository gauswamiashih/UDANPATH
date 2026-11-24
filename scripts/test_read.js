require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testFetch() {
  const { data, error } = await supabase.from('user_education').select('*').limit(1);
  console.log('user_education (anon read):', data, error);
}
testFetch();
