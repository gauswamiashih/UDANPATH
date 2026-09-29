import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hrvaxxyvwwpnoajiixey.supabase.co";
  const supabaseAnonKey = 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmF4eHl2d3dwbm9hamlpeGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NjQ4MjYsImV4cCI6MjEwMDM0MDgyNn0.dVCy66ZQkHs_vUfcOmFzXKAYmuR-8UFtsHhaa_iAKeQ";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error('Supabase Auth Timeout')), 3000)
      )
    ]);
    user = data?.user || null;
  } catch (error) {
    console.error("Proxy Auth Error: Supabase project might be paused or unreachable.", error);
  }

  const path = request.nextUrl.pathname;

  // 1. FIRST SCREEN MUST BE SIGN-IN
  // If the user goes to '/' and is not authenticated, redirect to sign-in.
  if (!user && path === '/') {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Allow unrestricted access to auth pages
  if (path.startsWith('/auth')) {
    // If logged in and tries to access auth pages, redirect to their dashboard
    if (user) {
      const role = await getUserRole(supabase, user.id);
      return redirectToRoleDashboard(role, request.url);
    }
    return response;
  }

  // If trying to access any protected route and not logged in, redirect to sign in
  if (!user && path !== '/') {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // If logged in, enforce role-based access control
  if (user) {
    const role = await getUserRole(supabase, user.id);
    
    // If they hit the root URL while logged in, redirect to their proper dashboard
    if (path === '/') {
      return redirectToRoleDashboard(role, request.url);
    }

    const isStudentRoute = path.startsWith('/student');
    const isExamCoordRoute = path.startsWith('/exam-coordinator');
    const isAdminRoute = path.startsWith('/admin');

    if (role === 'student') {
      if (isAdminRoute || isExamCoordRoute) {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    } else if (role === 'exam_coordinator') {
      if (isAdminRoute || isStudentRoute) {
        return NextResponse.redirect(new URL('/exam-coordinator', request.url));
      }
    } else if (role === 'admin') {
      if (isStudentRoute || isExamCoordRoute) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } else {
      if (path !== '/student') {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    }
  }

  return response;
}

async function getUserRole(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (data?.role) return data.role;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: adminData } = await adminClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (adminData?.role) return adminData.role;
  }

  return 'student'; // Default fallback
}

function redirectToRoleDashboard(role: string, baseUrl: string) {
  if (role === 'admin') {
    return NextResponse.redirect(new URL('/admin', baseUrl));
  } else if (role === 'exam_coordinator') {
    return NextResponse.redirect(new URL('/exam-coordinator', baseUrl));
  }
  return NextResponse.redirect(new URL('/student', baseUrl));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
