import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hrvaxxyvwwpnoajiixey.supabase.co',
  'sb_publishable_a7l0YybOHB8loG_kVoyveg_2GTXMHfI'
);

async function test() {
  const { data, error } = await supabase.from('exam_milestones').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
test();
