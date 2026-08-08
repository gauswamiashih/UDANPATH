'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabaseClient';
import { 
  Sparkles, Compass, Milestone, MessageSquare, 
  ChevronDown, ArrowRight, Sun, Moon, CheckCircle2, ShieldCheck
} from 'lucide-react';

import { User } from '@supabase/supabase-js';

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // FAQs state
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setMounted(true);
    // Get session
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

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col justify-between select-none">
      
      {/* ==================== GLOBAL NAVBAR ==================== */}
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/85 backdrop-blur-md flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-primary/20">
            U
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            UDAN<span className="gradient-text font-extrabold">PATH</span>
          </span>
        </div>

        {/* Action Button Navigation links */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-text-muted" />}
          </button>

          {user ? (
            <Link 
              href="/dashboard"
              className="btn btn-primary py-2 px-4 text-xs font-bold shadow-sm"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/auth/sign-in"
                className="text-xs font-bold text-text-muted hover:text-foreground hidden sm:inline"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/sign-up"
                className="btn btn-primary py-2 px-4 text-xs font-bold shadow-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-24 text-center space-y-8 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

        {/* Badges */}
        <div className="flex justify-center gap-3">
          <span className="px-3.5 py-1 rounded-full bg-primary-light border border-primary/20 text-primary text-[0.68rem] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini 1.5 Pro
          </span>
          <span className="px-3.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[0.68rem] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            🎯 7 Competitive Sectors
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
          Your Personalized AI-Powered <span className="gradient-text font-black">Competitive Exam</span> Roadmap Navigator
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
          Calculate your reservation category age relaxations, aggregate streams eligibility, topper timetables, and track syllabus topics checklist effortlessly with UdanPath.
        </p>

        {/* Actions CTA */}
        <div className="flex justify-center gap-4 flex-wrap pt-4">
          <Link 
            href={user ? "/dashboard" : "/auth/sign-up"}
            className="btn btn-primary py-3 px-6 text-sm font-bold shadow-md bg-gradient-to-br from-primary to-secondary text-white border-none hover:brightness-110 flex items-center gap-2"
          >
            Launch My UdanPath <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ==================== FEATURES MATRIX ==================== */}
        <section className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
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
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index} 
                className="card bg-card border border-border p-6 space-y-3 hover:border-primary/20 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <strong className="text-sm md:text-base font-extrabold text-foreground block">{feat.title}</strong>
                <p className="text-xs md:text-sm text-text-muted leading-relaxed">{feat.body}</p>
              </div>
            );
          })}
        </section>

        {/* ==================== FAQs COLLAPSIBLE ==================== */}
        <section className="pt-16 max-w-3xl mx-auto text-left space-y-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const open = !!faqOpen[index];
              return (
                <div 
                  key={index}
                  className="card bg-card border border-border rounded-xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-4 text-left font-bold text-xs md:text-sm focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 text-xs text-text-muted leading-relaxed border-t border-border/40 pt-3 font-semibold">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-border bg-card/50 py-8 px-6 text-center text-xs text-text-subtle font-semibold select-none mt-16">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white text-[0.62rem] shadow-sm">
              U
            </div>
            <span className="font-extrabold tracking-tight text-foreground">UDANPATH</span>
          </div>
          <div>
            © {new Date().getFullYear()} UdanPath. All Rights Reserved. Built for Indian Aspirants.
          </div>
        </div>
      </footer>

    </div>
  );
}
