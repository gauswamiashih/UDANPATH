import { supabase } from './supabaseClient';

export type UserRole = 'admin' | 'exam_coordinator' | 'student';

export async function resolveUserRole(user: any): Promise<UserRole> {
  if (!user) return 'student';

  const email = (user.email || '').toLowerCase().trim();
  if (email === 'admin@udanpath.in') return 'admin';
  if (email === 'coordinator@udanpath.in') return 'exam_coordinator';

  // Check metadata
  const metaRole = user.user_metadata?.role;
  if (metaRole === 'admin') return 'admin';
  if (metaRole === 'exam_coordinator' || metaRole === 'coordinator') return 'exam_coordinator';

  // Check public.users table
  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (userRow?.role === 'admin') return 'admin';
    if (userRow?.role === 'exam_coordinator' || userRow?.role === 'coordinator') return 'exam_coordinator';
  } catch (err) {
    console.error('Error resolving user role from db:', err);
  }

  return 'student';
}
