'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabaseClient';
import { 
  Home, Compass, BookOpen, Milestone, MessageSquare, 
  Bell, Bookmark, User, Settings, ShieldAlert, LogOut, Sun, Moon, Sparkles, Search, Menu, X
} from 'lucide-react';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    // Get current user session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        // Safe mock fallback for development if auth not configured
        const localProf = localStorage.getItem('udanpath_onboarding_profile');
        if (localProf) {
          setUser({ email: 'aspirant@udanpath.in', user_metadata: { full_name: JSON.parse(localProf).fullName } });
        } else {
          router.push('/auth/sign-in');
        }
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('udanpath_onboarding_profile');
    router.push('/');
  };

  if (!mounted) return null;

  const sidebarLinks = [
    { label: 'Overview', href: '/dashboard', icon: Home },
    { label: 'Discover Exams', href: '/exams/discover', icon: Compass },
    { label: 'Courses & Coaching', href: '/courses', icon: BookOpen },
    { label: 'My Roadmaps', href: '/roadmaps', icon: Milestone },
    { label: 'AI Assistant', href: '/ai', icon: MessageSquare },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Saved Exams', href: '/saved', icon: Bookmark },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  // Optional Admin Link
  const isAdmin = user?.email === 'admin@udanpath.in' || user?.role === 'admin';

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300">
      
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card shrink-0 sticky top-0 h-screen select-none z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-primary/20">
            U
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            UDAN<span className="gradient-text font-extrabold">PATH</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-[0.92rem] font-semibold transition-all duration-200 ${
                  active 
                    ? 'bg-primary-light text-primary border-l-4 border-primary' 
                    : 'text-text-muted hover:bg-card-hover hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-text-muted'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-[0.92rem] font-semibold transition-all duration-200 ${
                pathname === '/admin' 
                  ? 'bg-red-500/10 text-danger border-l-4 border-danger' 
                  : 'text-text-muted hover:bg-card-hover hover:text-foreground'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-danger" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-border bg-card/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center text-sm shadow-inner">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">
                {user?.user_metadata?.full_name || 'Aspirant'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user?.email || 'aspirant@udanpath.in'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-text-muted" />}
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-danger bg-danger/10 hover:bg-danger/15 rounded-lg transition-colors ml-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== CONTENT CONTAINER ==================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* ==================== TOP NAVIGATION ==================== */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-card/85 backdrop-blur-md flex items-center justify-between px-4 md:px-8 select-none">
          {/* Mobile Brand Menu */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 rounded-md border border-border hover:bg-card-hover"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white shadow-md">
              U
            </div>
          </div>

          {/* Universal Search Bar */}
          <div className="relative max-w-md w-full mx-4 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
            <input 
              type="text"
              placeholder="Search target exams, syllabus topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors font-medium"
            />
          </div>

          {/* Quick Info & Notifications Icon */}
          <div className="flex items-center gap-4">
            <Link 
              href="/notifications" 
              className="relative p-2 rounded-lg hover:bg-card-hover text-text-muted hover:text-foreground transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-card"></span>
            </Link>

            <Link href="/profile" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary font-extrabold flex items-center justify-center text-xs shadow-inner">
                {user?.user_metadata?.full_name?.charAt(0) || 'A'}
              </div>
              <span className="text-sm font-semibold hidden md:inline hover:underline cursor-pointer">
                {user?.user_metadata?.full_name?.split(' ')[0] || 'Aspirant'}
              </span>
            </Link>
          </div>
        </header>

        {/* ==================== MAIN VIEW PORT ==================== */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ==================== MOBILE MENU SIDE-DRAWER ==================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm transition-opacity duration-200">
          <div className="w-64 bg-card h-full flex flex-col border-r border-border p-4 animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white text-sm shadow-md">
                  U
                </div>
                <span className="font-extrabold text-md tracking-tight">UDANPATH</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md border border-border hover:bg-card-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-text-muted hover:bg-card-hover hover:text-foreground transition-all"
                  >
                    <Icon className="w-4.5 h-4.5 text-text-subtle" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-border pt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-card-hover hover:text-foreground"
              >
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-accent" /> : <Moon className="w-4.5 h-4.5 text-text-muted" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MOBILE BOTTOM NAV BAR ==================== */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-card/95 backdrop-blur-md flex items-center justify-around md:hidden z-40 select-none">
        <Link 
          href="/dashboard" 
          className={`flex flex-col items-center gap-1 text-[0.65rem] font-bold ${pathname === '/dashboard' ? 'text-primary' : 'text-text-muted hover:text-foreground'}`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        
        <Link 
          href="/exams/discover" 
          className={`flex flex-col items-center gap-1 text-[0.65rem] font-bold ${pathname === '/exams/discover' ? 'text-primary' : 'text-text-muted hover:text-foreground'}`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </Link>

        <Link 
          href="/ai" 
          className={`flex flex-col items-center gap-1 text-[0.65rem] font-bold ${pathname === '/ai' ? 'text-primary' : 'text-text-muted hover:text-foreground'}`}
        >
          <div className="w-10 h-10 -mt-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span>AI Chat</span>
        </Link>

        <Link 
          href="/saved" 
          className={`flex flex-col items-center gap-1 text-[0.65rem] font-bold ${pathname === '/saved' ? 'text-primary' : 'text-text-muted hover:text-foreground'}`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
        </Link>

        <Link 
          href="/profile" 
          className={`flex flex-col items-center gap-1 text-[0.65rem] font-bold ${pathname === '/profile' ? 'text-primary' : 'text-text-muted hover:text-foreground'}`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>

    </div>
  );
}
