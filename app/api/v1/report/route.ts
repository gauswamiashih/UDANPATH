import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { entity_type, entity_id, error_type, user_comment } = await req.json();

    if (!entity_type || !entity_id || !error_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Attempt to get user from auth (if token provided in cookies/headers)
    // For this simple route, we allow anonymous reports if user is not logged in
    const authHeader = req.headers.get('Authorization');
    let user_id = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        user_id = user.id;
      }
    }

    const { data, error } = await supabase
      .from('user_data_corrections')
      .insert([
        {
          user_id,
          entity_type,
          entity_id,
          error_type,
          user_comment
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting correction report:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Correction Report Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
