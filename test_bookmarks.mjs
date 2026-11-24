import { createClient } from '@supabase/supabase-js';

const url = 'https://hrvaxxyvwwpnoajiixey.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('user_bookmarks').select('*').limit(1);
  console.log('Bookmarks Data:', data);
  console.log('Bookmarks Error:', error);
}

test();
