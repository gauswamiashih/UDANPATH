import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hrvaxxyvwwpnoajiixey.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getRoles() {
  const { data, error } = await supabase.from('users').select('role');
  if (error) console.error(error);
  else {
    const roles = [...new Set(data.map(d => d.role))];
    console.log("Existing roles:", roles);
  }
}
getRoles();
