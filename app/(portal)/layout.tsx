'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Home, Compass, BookOpen, Milestone, MessageSquare, 
  Bell, Bookmark, User, Settings, ShieldAlert, LogOut, Sun, Moon, Search, Menu, X
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
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    setMounted(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
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
      setUser(session?.user || null);
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
    { label: 'Career Guide', href: '/guide', icon: BookOpen },
    { label: 'Courses & Coaching', href: '/courses', icon: BookOpen },
    { label: 'My Roadmaps', href: '/roadmaps', icon: Milestone },
    { label: 'AI Assistant', href: '/ai', icon: MessageSquare },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Saved Exams', href: '/saved', icon: Bookmark },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const isAdmin = user?.email === 'admin@udanpath.in' || user?.role === 'admin';

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300 selection:bg-primary/30">
      
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="hidden md:flex flex-col w-[280px] border-r border-border bg-card shrink-0 sticky top-0 h-screen select-none z-30 transition-all">
        {/* Brand Header */}
        <div className="h-[72px] flex items-center gap-3 px-6 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-primary/20">
            U
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            UDAN<span className="text-primary">PATH</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors duration-200 group"
              >
                {active && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary-light rounded-xl border-l-4 border-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 relative z-10 transition-colors", active ? "text-primary" : "text-text-muted group-hover:text-foreground")} />
                <span className={cn("relative z-10 transition-colors", active ? "text-primary" : "text-text-muted group-hover:text-foreground")}>
                  {link.label}
                </span>
              </Link>
            );
          })}
          
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-border/50">
              <Link
                href="/admin"
                className="relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold text-text-muted hover:text-foreground group transition-colors"
              >
                {pathname === '/admin' && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-danger/10 rounded-xl border-l-4 border-danger"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <ShieldAlert className={cn("w-5 h-5 relative z-10", pathname === '/admin' ? "text-danger" : "text-danger/70")} />
                <span className="relative z-10">Admin Dashboard</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-border bg-card/50 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-secondary/10 text-primary font-bold flex items-center justify-center text-sm shadow-inner border border-primary/20">
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

          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors shadow-sm"
              aria-label="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-text-muted" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== CONTENT CONTAINER ==================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative">
        
        {/* ==================== TOP NAVIGATION ==================== */}
        <header className="sticky top-0 z-20 h-[72px] border-b border-glass-border bg-glass-bg backdrop-blur-xl flex items-center justify-between px-4 md:px-8 select-none transition-all">
          {/* Mobile Brand Menu */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg border border-border hover:bg-card-hover bg-card shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white shadow-lg shadow-primary/20">
              U
            </div>
          </div>

          {/* Universal Search Bar */}
          <motion.div 
            className="relative max-w-md w-full mx-4 hidden md:block"
            animate={{ scale: searchFocused ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", searchFocused ? "text-primary" : "text-text-subtle")} />
            <input 
              type="text"
              placeholder="Search target exams, syllabus topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-background border border-border rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium shadow-inner"
            />
          </motion.div>

          {/* Quick Info & Notifications Icon */}
          <div className="flex items-center gap-6 ml-auto">
            <Link 
              href="/notifications" 
              className="relative p-2.5 rounded-full border border-border bg-card hover:bg-card-hover text-text-muted hover:text-foreground transition-colors shadow-sm group"
            >
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-danger rounded-full ring-2 ring-card animate-pulse"></span>
            </Link>

            <Link href="/profile" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-secondary/10 text-primary font-extrabold flex items-center justify-center text-sm shadow-inner border border-primary/20 group-hover:scale-105 transition-transform">
                {user?.user_metadata?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-bold group-hover:text-primary transition-colors">
                  {user?.user_metadata?.full_name?.split(' ')[0] || 'Aspirant'}
                </span>
                <span className="text-xs text-text-muted">Student</span>
              </div>
            </Link>
          </div>
        </header>

        {/* ==================== MAIN VIEW PORT ==================== */}
        <main className="flex-1 overflow-y-auto w-full relative">
          {/* Subtle background glow for the whole dashboard */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-8 max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ==================== MOBILE MENU SIDE-DRAWER ==================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[280px] bg-card h-full flex flex-col border-r border-border shadow-2xl relative"
            >
              <div className="p-6 flex justify-between items-center border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white text-sm shadow-md">
                    U
                  </div>
                  <span className="font-extrabold text-lg tracking-tight">UDANPATH</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg border border-border bg-background hover:bg-card-hover"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all",
                        active ? "bg-primary-light text-primary" : "text-text-muted hover:bg-card-hover hover:text-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
            <div className="flex-1 cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MOBILE BOTTOM NAV BAR ==================== */}
      <nav className="fixed bottom-0 inset-x-0 h-[72px] border-t border-glass-border bg-glass-bg backdrop-blur-xl flex items-center justify-around md:hidden z-40 select-none pb-safe">
        {[
          { href: '/dashboard', icon: Home, label: 'Home' },
          { href: '/exams/discover', icon: Compass, label: 'Explore' },
          { href: '/ai', icon: MessageSquare, label: 'AI Chat', special: true },
          { href: '/saved', icon: Bookmark, label: 'Saved' },
          { href: '/profile', icon: User, label: 'Profile' }
        ].map(item => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex flex-col items-center gap-1.5 text-[0.65rem] font-bold transition-colors relative",
                active ? "text-primary" : "text-text-muted hover:text-foreground"
              )}
            >
              {item.special ? (
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30 border-4 border-card"
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Icon className="w-5 h-5" />
                </motion.div>
              )}
              <span className={item.special ? "mt-0.5" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
