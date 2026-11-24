import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hrvaxxyvwwpnoajiixey.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUsers() {
  const users = [
    { email: 'student@udanpath.in', password: 'Password123!', role: 'student', full_name: 'Test Student' },
    { email: 'admin@udanpath.in', password: 'Password123!', role: 'admin', full_name: 'Test Admin' },
    { email: 'coordinator@udanpath.in', password: 'Password123!', role: 'exam_coordinator', full_name: 'Test Coordinator' },
  ];

  for (const user of users) {
    console.log(`Creating ${user.email}...`);
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.full_name }
    });

    if (authError && !authError.message.includes('already exists') && !authError.message.includes('already been registered')) {
      console.error(`Error creating auth user ${user.email}:`, authError);
      continue;
    }

    // Get user id (whether just created or already existed)
    let userId = authData?.user?.id;
    if (!userId) {
       const { data: existingUsers } = await supabase.auth.admin.listUsers();
       const found = existingUsers.users.find(u => u.email === user.email);
       userId = found?.id;
    }

    if (userId) {
      // 2. Insert into public.users with the specific role
      const { error: dbError } = await supabase
        .from('users')
        .upsert({ 
          id: userId, 
          email: user.email,
          full_name: user.full_name,
          role: user.role
        });
        
      if (dbError) {
        console.error(`Error setting role for ${user.email}:`, dbError);
      } else {
        console.log(`Successfully created/updated ${user.email} with role ${user.role}`);
      }
    }
  }
}

createTestUsers();
