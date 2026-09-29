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
  Bell, Bookmark, User, Settings, ShieldAlert, LogOut, Sun, Moon, Search, Menu, X, BrainCircuit, LineChart, Book
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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

  const sidebarGroups = [
    {
      title: 'Command',
      links: [
        { label: 'Dashboard', href: '/dashboard', icon: Home },
        { label: 'My Roadmaps', href: '/roadmaps', icon: Milestone },
      ]
    },
    {
      title: 'Intelligence',
      links: [
        { label: 'AI Copilot', href: '/ai', icon: BrainCircuit },
        { label: 'Discover Exams', href: '/exams/discover', icon: Compass },
        { label: 'Decision Lab', href: '/simulator', icon: LineChart },
      ]
    },
    {
      title: 'Academics',
      links: [
        { label: 'Career Guide', href: '/guide', icon: BookOpen },
        { label: 'Courses', href: '/courses', icon: Book },
        { label: 'Saved', href: '/saved', icon: Bookmark },
      ]
    }
  ];

  const isAdmin = user?.email === 'admin@udanpath.in' || user?.role === 'admin';

  return (
    <div className="min-h-screen flex bg-background-tertiary text-foreground transition-colors duration-300 font-sans selection:bg-primary-light">
      
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="hidden md:flex flex-col w-[280px] border-r border-border bg-white shrink-0 sticky top-0 h-screen select-none z-30 transition-all shadow-sm">
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-lg shadow-sm">
            U
          </div>
          <span className="font-bold text-xl tracking-tight">
            UDANPATH
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {sidebarGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="px-4 text-xs font-bold text-text-subtle uppercase tracking-wider mb-2">{group.title}</h4>
              {group.links.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                      active ? "bg-primary text-white shadow-md shadow-primary/20" : "text-text-muted hover:bg-background-tertiary hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
          
          <div className="space-y-1 pt-4 border-t border-border">
             <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  pathname === '/profile' ? "bg-primary text-white shadow-md" : "text-text-muted hover:bg-background-tertiary hover:text-foreground"
                )}
              >
                <User className="w-5 h-5" />
                <span>Student DNA</span>
              </Link>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  pathname === '/settings' ? "bg-primary text-white shadow-md" : "text-text-muted hover:bg-background-tertiary hover:text-foreground"
                )}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
          </div>

          {isAdmin && (
            <div className="pt-2">
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  pathname === '/admin' ? "bg-danger text-white shadow-md shadow-danger/20" : "text-danger hover:bg-danger/10"
                )}
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Intelligence Console</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer User Info */}
        <div className="p-4 border-t border-border bg-white flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center text-sm shadow-sm">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {user?.user_metadata?.full_name || 'Aspirant'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user?.email || 'aspirant@udanpath.in'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between px-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-text-muted hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleSignOut} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== CONTENT CONTAINER ==================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 relative">
        
        {/* ==================== TOP NAVIGATION ==================== */}
        <header className="sticky top-0 z-20 h-20 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 select-none transition-all border-b border-border">
          {/* Mobile Brand Menu */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-white border border-border text-foreground shadow-sm hover:shadow-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-sm">
              U
            </div>
          </div>

          {/* Universal Search Bar - Desktop */}
          <div className="relative max-w-lg w-full hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input 
              type="text"
              placeholder="Search exams, syllabus, roadmaps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm font-medium"
            />
          </div>

          {/* Quick Info & Notifications Icon */}
          <div className="flex items-center gap-4 ml-auto">
            <button 
              className="md:hidden p-2 rounded-lg bg-white border border-border text-text-muted shadow-sm"
              onClick={() => setMobileSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>
            
            <Link 
              href="/notifications" 
              className="relative p-2.5 rounded-full bg-white border border-border text-text-muted hover:text-primary transition-colors shadow-sm"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-danger border-2 border-white rounded-full"></span>
            </Link>
          </div>
        </header>

        {/* ==================== MOBILE SEARCH MODAL ==================== */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 inset-x-0 z-50 p-4 bg-white border-b border-border shadow-lg md:hidden"
            >
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Search anything..."
                    className="w-full bg-background-tertiary border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                <button onClick={() => setMobileSearchOpen(false)} className="p-2 text-text-muted">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== MAIN VIEW PORT ==================== */}
        <main className="flex-1 overflow-y-auto w-full relative p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto w-full"
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
            className="fixed inset-0 z-50 flex md:hidden bg-foreground/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[280px] bg-white h-full flex flex-col shadow-2xl relative"
            >
              <div className="h-20 flex justify-between items-center px-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-sm">
                    U
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-background-tertiary text-text-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                {sidebarGroups.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="px-4 text-xs font-bold text-text-subtle uppercase tracking-wider mb-2">{group.title}</h4>
                    {group.links.map((link) => {
                      const Icon = link.icon;
                      const active = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                            active ? "bg-primary text-white shadow-md shadow-primary/20" : "text-text-muted"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </motion.div>
            <div className="flex-1 cursor-pointer" onClick={() => setMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MOBILE BOTTOM NAV BAR ==================== */}
      <nav className="fixed bottom-0 inset-x-0 h-20 bg-white border-t border-border flex items-center justify-around md:hidden z-40 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        {[
          { href: '/dashboard', icon: Home, label: 'Home' },
          { href: '/exams/discover', icon: Compass, label: 'Explore' },
          { href: '/ai', icon: BrainCircuit, label: 'Copilot', special: true },
          { href: '/roadmaps', icon: Milestone, label: 'Roadmap' },
          { href: '/profile', icon: User, label: 'DNA' }
        ].map(item => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex flex-col items-center gap-1 text-[0.65rem] font-bold transition-colors relative",
                active ? "text-primary" : "text-text-muted"
              )}
            >
              {item.special ? (
                <div className="w-12 h-12 -mt-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg border-4 border-white">
                  <Icon className="w-5 h-5" />
                </div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className={item.special ? "mt-1" : "mt-1"}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
