'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Sparkles, Compass, Milestone, MessageSquare, 
  ChevronDown, ArrowRight, Sun, Moon, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // FAQs state
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setMounted(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    getSession();
  }, []);

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (!mounted) return null;

  const faqs = [
    { q: "How does the AI Roadmap personalization work?", a: "Our AI engine analyzes your exact educational stream (PCM, Core Engineering, etc.), reservation category (GENERAL, OBC, SC, ST), and domicile state to automatically calculate age relaxations, match percentages, and recommended schedules." },
    { q: "Are the exam timelines and vacancies updated?", a: "Yes, our database indexes current notifications, application starts and deadlines, pay scale metrics, and syllabus changes for major national Indian exams (UPSC CSE, SSC CGL, GATE, Banking PO, NDA, etc.)." },
    { q: "What is the Resume ATS Scanner?", a: "It is an AI career tool that evaluates your pasted resume, compares it against target government/technical job vacancy keywords, highlights gaps, and recommends metric-driven improvements." }
  ];

  const features = [
    { 
      icon: Compass, 
      title: "Category Eligibility Engine", 
      body: "Evaluates qualification degrees and category age relaxations for ISRO, UPSC, SSC, and Banking exams in real time." 
    },
    { 
      icon: Milestone, 
      title: "Adaptive Preparation Roadmaps", 
      body: "Generates Tier 1, 2, and 3 academic study schedules with interactive syllabus checkmarks and dates reminders." 
    },
    { 
      icon: MessageSquare, 
      title: "AI Career Counselor", 
      body: "Conversational streaming advisor preloaded with your onboarding criteria to guide daily topic targets." 
    }
  ];

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/30">
      
      {/* ==================== GLOBAL NAVBAR ==================== */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="fixed top-0 inset-x-0 z-50 h-16 border-b border-glass-border bg-glass-bg backdrop-blur-xl flex items-center justify-between px-6 md:px-12 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-primary/30">
            U
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            UDAN<span className="text-primary">PATH</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-full border border-border bg-card hover:bg-card-hover transition-colors shadow-sm"
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

          {user ? (
            <Link 
              href="/dashboard"
              className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-md hover:shadow-glow transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/auth/sign-in"
                className="text-sm font-semibold text-text-muted hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/sign-up"
                className="px-6 py-2.5 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-16 inset-x-0 bg-card border-b border-border z-40 px-6 py-4 flex flex-col gap-4 shadow-xl"
          >
             <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-text-muted" />}
              <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            {user ? (
              <Link href="/dashboard" className="px-4 py-3 rounded-lg bg-primary text-white font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/sign-in" className="px-4 py-3 rounded-lg border border-border font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/auth/sign-up" className="px-4 py-3 rounded-lg bg-foreground text-background font-semibold text-center" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== HERO SECTION ==================== */}
      <main className="flex-1 w-full flex flex-col items-center justify-center pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <motion.div 
          className="max-w-4xl mx-auto text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badges */}
          <motion.div variants={itemVariants} className="flex justify-center gap-3 flex-wrap">
            <span className="px-4 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4" /> Powered by Gemini 1.5
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Your Personalized AI <span className="text-primary">Competitive Exam</span> Roadmap Navigator
          </motion.h1>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Calculate your reservation category age relaxations, aggregate streams eligibility, topper timetables, and track syllabus topics effortlessly.
          </motion.p>

          {/* Actions CTA */}
          <motion.div variants={itemVariants} className="flex justify-center gap-4 pt-4">
            <Link 
              href={user ? "/dashboard" : "/auth/sign-up"}
              className="group relative px-8 py-4 rounded-full bg-primary text-white font-bold text-sm md:text-base shadow-lg shadow-primary/30 hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative flex items-center gap-2">
                Launch My UdanPath <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* ==================== FEATURES MATRIX ==================== */}
        <motion.section 
          className="mt-32 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="group relative bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feat.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed relative z-10">{feat.body}</p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* ==================== FAQs ==================== */}
        <motion.section 
          className="mt-32 w-full max-w-3xl mx-auto space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-black text-center mb-8">Frequently Asked Questions</motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const open = !!faqOpen[index];
              return (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className={cn(
                    "bg-card border rounded-2xl overflow-hidden transition-all duration-300",
                    open ? "border-primary/30 shadow-md" : "border-border hover:border-border/80 hover:bg-card-hover"
                  )}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-6 text-left font-bold focus:outline-none"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <ChevronDown className={cn("w-5 h-5 text-text-muted transition-transform duration-300 shrink-0", open && "rotate-180 text-primary")} />
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="px-6 text-sm text-text-muted leading-relaxed"
                      >
                        <div className="pb-6 pt-2 border-t border-border/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-glass-border bg-card/30 backdrop-blur-md pt-12 pb-8 px-6 mt-16 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white text-sm shadow-md">
                U
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground">UDANPATH</span>
            </div>
            <p className="text-xs text-text-muted font-medium mt-2 text-center md:text-left">
              Built for Indian Aspirants. Navigating success.
            </p>
          </div>
          
          <div className="text-xs text-text-subtle font-semibold">
            © {new Date().getFullYear()} UdanPath. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
