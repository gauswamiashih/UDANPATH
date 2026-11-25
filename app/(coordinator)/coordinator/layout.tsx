'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, Layers, FileText, 
  BookMarked, GraduationCap, ShieldCheck, Target, LogOut,
  Sun, Moon, Menu, X, Bell, RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getActiveRole } from '@/lib/coordinatorService';

interface CoordinatorLayoutProps {
  children: React.ReactNode;
}

export default function CoordinatorLayout({ children }: CoordinatorLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Strict Role-Based Isolation: If current role is 'student', block and redirect
    const role = getActiveRole();
    if (role === 'student') {
      router.replace('/dashboard');
      return;
    }
    setAuthorized(true);

    const handleRoleChange = (e: any) => {
      if (e.detail === 'student') {
        router.replace('/dashboard');
      }
    };

    window.addEventListener('udanpath_role_changed', handleRoleChange);
    return () => window.removeEventListener('udanpath_role_changed', handleRoleChange);
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('udanpath_active_role');
    router.push('/auth/sign-in');
  };

  if (!mounted || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-text-muted">Verifying Coordinator Access...</p>
        </div>
      </div>
    );
  }

  const coordinatorLinks = [
    { label: 'Operations Overview', href: '/coordinator', icon: LayoutDashboard },
    { label: 'Manage Competitive Exams', href: '/coordinator/exams', icon: Target },
    { label: 'Manage Exam Schedules', href: '/coordinator/schedules', icon: Calendar },
    { label: 'Manage Syllabus Trees', href: '/coordinator/syllabus', icon: Layers },
    { label: 'Upload PYQs & Resources', href: '/coordinator/pyqs', icon: FileText },
    { label: 'Curate Courses & Batches', href: '/coordinator/courses', icon: BookMarked },
    { label: 'Configure Eligibility Rules', href: '/coordinator/eligibility', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300 selection:bg-primary/30">
      
      {/* ==================== COORDINATOR DESKTOP SIDEBAR ==================== */}
      <aside className="hidden md:flex flex-col w-[290px] border-r border-border bg-card shrink-0 sticky top-0 h-screen select-none z-30 transition-all">
        
        {/* Brand & Role Header */}
        <div className="h-[76px] flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block">
                UDAN<span className="text-primary">PATH</span>
              </span>
              <span className="text-[0.65rem] font-extrabold tracking-wider text-emerald-400 uppercase">
                Coordinator Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[0.65rem] font-extrabold text-text-subtle uppercase tracking-wider">
            Academic Operations
          </div>

          {coordinatorLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  active 
                    ? 'bg-primary-light text-primary border border-primary/20 shadow-sm' 
                    : 'text-text-muted hover:text-foreground hover:bg-card-hover'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  active ? 'text-primary' : 'text-text-muted group-hover:text-foreground'
                }`} />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: Role Switcher & Theme Control */}
        <div className="p-4 border-t border-border bg-card/60 flex flex-col gap-3">
          <div className="bg-background/80 border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              EC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Academic Coordinator</p>
              <p className="text-[0.65rem] text-text-muted truncate">Exam Content Lead</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors shadow-sm"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-text-muted" />}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 rounded-lg transition-all shadow-sm group"
              title="Sign Out of Coordinator Console"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative">
        
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-[72px] border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 select-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg border border-border hover:bg-card-hover bg-card md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Coordinator Active Session
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Clean Sign Out Header Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-danger/30 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-bold transition-all shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
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
                <div className="p-5 flex justify-between items-center border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center font-extrabold text-white text-sm shadow-md">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm tracking-tight block">UDANPATH</span>
                      <span className="text-[0.65rem] text-emerald-400 font-bold">Coordinator</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg border border-border bg-background"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                  {coordinatorLinks.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          active ? 'bg-primary-light text-primary' : 'text-text-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-border">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-danger/10 text-danger border border-danger/20 text-xs font-bold hover:bg-danger/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
              <div className="flex-1 cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
