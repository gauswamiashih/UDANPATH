import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hrvaxxyvwwpnoajiixey.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraint() {
  const { data, error } = await supabase.rpc('get_constraint', { constraint_name: 'users_role_check' });
  if (error) {
     // fallback: try direct sql if we can't run rpc
     console.log("No RPC available for constraint check, error:", error.message);
  } else {
     console.log(data);
  }
}
checkConstraint();
