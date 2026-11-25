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
  const isGuest = request.cookies.get('udanpath_guest')?.value === 'true';
  const isCoordDemo = request.cookies.get('udanpath_coordinator_demo')?.value === 'true' || request.cookies.get('udanpath_role')?.value === 'coordinator';

  // 1. FIRST SCREEN MUST BE SIGN-IN
  // If the user goes to '/' and is not authenticated and not a guest/coordinator, redirect to sign-in.
  if (!user && !isGuest && !isCoordDemo && path === '/') {
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

  // If Coordinator Demo
  if (isCoordDemo && !user) {
    if (path === '/') {
      return NextResponse.redirect(new URL('/coordinator', request.url));
    }
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/coordinator', request.url));
    }
    // Allow coordinator demo to access /coordinator, /exam-coordinator, /student/exams/discover, /system-design, /student/settings
    return response;
  }

  // If Guest Aspirant
  if (isGuest && !user) {
    if (path === '/') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    if (path.startsWith('/admin') || path.startsWith('/exam-coordinator') || path.startsWith('/coordinator')) {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    // Allow guest to access student portal, onboarding, exams, system-design, etc.
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
    const isExamCoordRoute = path.startsWith('/exam-coordinator') || path.startsWith('/coordinator');
    const isAdminRoute = path.startsWith('/admin');

    if (role === 'student') {
      if (isAdminRoute || isExamCoordRoute) {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    } else if (role === 'exam_coordinator' || role === 'coordinator') {
      if (isAdminRoute || isStudentRoute) {
        return NextResponse.redirect(new URL('/coordinator', request.url));
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
  try {
    const { data } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', userId)
      .maybeSingle();

    if (data?.email?.toLowerCase() === 'coordinator@udanpath.in' || data?.role === 'exam_coordinator' || data?.role === 'coordinator') {
      return 'exam_coordinator';
    }
    if (data?.email?.toLowerCase() === 'admin@udanpath.in' || data?.role === 'admin') {
      return 'admin';
    }
    if (data?.role) return data.role;
  } catch (e) {
    console.error('Error fetching user role in proxy:', e);
  }

  return 'student'; // Default fallback
}

function redirectToRoleDashboard(role: string, baseUrl: string) {
  if (role === 'admin') {
    return NextResponse.redirect(new URL('/admin', baseUrl));
  } else if (role === 'exam_coordinator' || role === 'coordinator') {
    return NextResponse.redirect(new URL('/coordinator', baseUrl));
  }
  return NextResponse.redirect(new URL('/student', baseUrl));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
