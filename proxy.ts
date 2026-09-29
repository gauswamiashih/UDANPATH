import { createServerClient } from '@supabase/ssr';
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

  const pathname = request.nextUrl.pathname;

  // 1. Admin Route Protection: Must be authenticated AND have admin role
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/sign-in';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

    const isAdmin = 
      user.email === 'admin@udanpath.in' || 
      user.app_metadata?.role === 'admin' || 
      user.user_metadata?.role === 'admin' || 
      user.role === 'admin';

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return response;
  }

  // 2. Protected User Portal Routes
  const userProtectedPaths = [
    '/dashboard', 
    '/onboarding', 
    '/roadmaps', 
    '/notifications', 
    '/saved', 
    '/profile', 
    '/settings', 
    '/simulator'
  ];

  const isUserProtected = userProtectedPaths.some((path) => pathname.startsWith(path));

  if (isUserProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/sign-in';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // 3. Auth Route Loop Prevention: If already logged in, redirect away from sign-in/sign-up
  const isAuthPath = pathname.startsWith('/auth/sign-in') || pathname.startsWith('/auth/sign-up');
  if (isAuthPath && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    const url = request.nextUrl.clone();
    url.pathname = (redirectTo && redirectTo.startsWith('/')) ? redirectTo : '/dashboard';
    url.searchParams.delete('redirectTo');
    return NextResponse.redirect(url);
  }

  return response;
}

// Export both named conventions and default for maximum Next.js compatibility
export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
