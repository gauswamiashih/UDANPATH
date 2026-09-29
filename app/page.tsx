'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  Search, ArrowRight, Menu, X, 
  MapPin, CheckCircle2, CheckCircle, Target, 
  BrainCircuit, BookOpen, GraduationCap,
  TrendingUp, Compass, Sparkles, User as UserIcon,
  FileText, LineChart, ShieldCheck,
  Building2, Rocket, Clock, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    getSession();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  const trendingExams = ['UPSC', 'SSC CGL', 'JEE Main', 'NEET', 'GATE', 'Bank PO', 'CUET'];

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden relative">
      
      {/* Subtle top background blur */}
      <div className="absolute top-0 left-1/4 right-0 h-[600px] bg-gradient-to-b from-[#F5F3FF] to-transparent opacity-60 -z-10 pointer-events-none"></div>

      {/* ==================== 1. PREMIUM HEADER ==================== */}
      <header 
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled ? "bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] py-4" : "bg-transparent border-b border-transparent py-5"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[#7C3AED] flex items-center justify-center font-bold text-white shadow-sm">
                U
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[1.1rem] leading-none tracking-tight text-[#0F172A]">
                  UDANPATH
                </span>
                <span className="text-[0.55rem] font-bold text-[#64748B] tracking-widest uppercase">
                  Your Career Navigation OS
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {[
                { label: 'Home', href: '/', active: true },
                { label: 'Exams', href: '/exams/discover' },
                { label: 'After 10th', href: '/guide?category=after-10th' },
                { label: 'After 12th', href: '/guide?category=after-12th' },
                { label: 'Colleges', href: '/colleges' },
                { label: 'Courses', href: '/courses' },
                { label: 'Jobs', href: '/jobs' },
                { label: 'AI Hub', href: '/ai' },
              ].map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href}
                  className={cn(
                    "text-[0.8rem] font-bold transition-colors relative group py-1",
                    link.active ? "text-[#0F172A]" : "text-[#64748B] hover:text-[#0F172A]"
                  )}
                >
                  {link.label}
                  {link.active && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[3px] bg-primary rounded-t-full"></span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-5">
            <div className="relative group cursor-pointer flex items-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors rounded-full px-3 py-1.5 border border-[#E2E8F0]">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] mr-2" />
              <span className="text-[0.7rem] font-semibold text-[#94A3B8] mr-12">Search exams, colleges...</span>
              <span className="text-[0.6rem] font-extrabold text-[#64748B] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded shadow-sm">⌘K</span>
            </div>
            
            <div className="flex items-center gap-4 ml-2">
              {user ? (
                <Button asChild variant="primary" className="h-9 px-6 rounded-full font-bold text-[0.8rem] bg-primary hover:bg-[#4F46E5] shadow-md shadow-primary/20">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Link href="/auth/sign-in" className="text-[0.8rem] font-bold text-[#0F172A] hover:text-primary transition-colors">
                    Sign In
                  </Link>
                  <Button asChild variant="primary" className="h-9 px-6 rounded-full font-bold text-[0.8rem] bg-primary hover:bg-[#4F46E5] shadow-md shadow-primary/20">
                    <Link href="/auth/sign-up">Get Started &rarr;</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <button 
            className="lg:hidden p-2 text-[#0F172A]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="pt-[100px]"></div>

      <main className="flex-1 w-full relative z-10">
        
        {/* ==================== 2. HERO ==================== */}
        <section className="w-full relative overflow-hidden pb-16 lg:pb-20">
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Background decorative elements */}
            <svg className="absolute left-[-50px] top-[100px] w-[300px] h-[300px] -z-10 opacity-30" viewBox="0 0 300 300" fill="none" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeDasharray="4 4">
              <path d="M0,150 Q150,0 300,150" />
              <defs>
                <linearGradient id="paint0_linear" x1="0" y1="150" x2="300" y2="150" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7C3AED" />
                  <stop offset="1" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>

            {/* LEFT: Confident Typography */}
            <div className="lg:col-span-5 relative z-20">
              <div className="inline-flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[0.65rem] font-bold text-primary uppercase tracking-[0.15em]">
                  India&apos;s AI Career Navigation Platform
                </span>
              </div>
              
              <h1 className="font-extrabold tracking-tight text-[#0F172A] leading-[1.05] text-[clamp(3rem,4.5vw,4.5rem)] mb-4">
                From Confusion<br />
                to <span className="text-primary">Clarity.</span>
              </h1>
              
              <h2 className="text-[clamp(1.5rem,2.2vw,2.2rem)] font-bold text-[#0F172A] leading-tight mb-5">
                Your Career, Guided by <span className="text-primary">AI.</span>
                <svg className="inline-block ml-2 w-[40px] -translate-y-2" viewBox="0 0 100 20" fill="none">
                  <path d="M0,15 Q50,0 100,15" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </h2>
              
              <p className="text-[1.05rem] text-[#64748B] leading-[1.6] font-medium max-w-[420px] mb-8">
                Discover the right exams, understand your eligibility, compare colleges, and get a personalized study roadmap designed around you.
              </p>

              <div className="relative max-w-[460px]">
                <div className="relative bg-white rounded-full shadow-[0_8px_30px_rgba(11,16,32,0.06)] border border-[#E2E8F0] p-1.5 flex items-center hover:shadow-[0_8px_30px_rgba(91,75,255,0.12)] transition-shadow">
                  <div className="pl-4 pr-3">
                    <Search className="w-5 h-5 text-[#94A3B8]" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search exams, colleges, courses or careers..."
                    className="flex-1 h-11 bg-transparent text-[0.9rem] font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                  />
                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-[#4F46E5] transition-colors shadow-sm shrink-0">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2.5 mt-5 items-center pl-2">
                  <span className="text-[0.7rem] font-extrabold text-[#94A3B8] tracking-wider uppercase">Trending:</span>
                  {trendingExams.slice(0, 7).map(exam => (
                    <Link key={exam} href={`/exams/discover?q=${exam}`} className="text-[0.7rem] font-extrabold text-[#0F172A] hover:text-primary transition-colors bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-1 rounded">
                      {exam}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Layered Visual Ecosystem */}
            <div className="lg:col-span-7 relative h-[600px] w-full hidden lg:flex items-center justify-center">
              
              {/* Connected background dashed path */}
              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 700 600">
                <path d="M 0 450 Q 250 150 400 300 T 700 150" stroke="#7C3AED" strokeWidth="1.5" strokeOpacity="0.4" fill="none" strokeDasharray="5 5" />
                {/* Plus marks along the path */}
                <path d="M 120 345 L 130 345 M 125 340 L 125 350" stroke="#7C3AED" strokeWidth="2" strokeOpacity="0.6" />
                <path d="M 550 215 L 560 215 M 555 210 L 555 220" stroke="#7C3AED" strokeWidth="2" strokeOpacity="0.6" />
              </svg>

              {/* Central Student Background Image */}
              <div className="absolute top-[20px] right-0 w-[95%] h-[95%] rounded-[30px] overflow-hidden">
                <Image 
                  src="/images/hero_student.jpg" 
                  alt="Indian Student Career Navigation" 
                  fill 
                  className="object-cover object-[center_top] mix-blend-multiply opacity-[0.85]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-50"></div>
              </div>

              {/* Central Badge */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="absolute top-[280px] right-[200px] z-30"
              >
                <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-primary to-[#7264FF] shadow-[0_10px_30px_rgba(91,75,255,0.4)] flex flex-col items-center justify-center border-4 border-white cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-[1.2rem] text-white mb-0.5">✦</span>
                  <span className="text-[0.55rem] font-extrabold text-white uppercase text-center leading-tight tracking-widest">YOUR<br/>CAREER<br/>PATH</span>
                </div>
                {/* Orbiting rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] border border-white/80 rounded-full"></div>
              </motion.div>

              {/* Card 1 - Match */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="absolute top-[100px] left-[80px] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_12px_30px_rgba(11,16,32,0.08)] border border-[#E2E8F0] w-[220px] z-20 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-[1rem] font-bold text-[#0F172A] leading-tight mb-1">92% Match</h4>
                <p className="text-[0.7rem] font-semibold text-[#64748B] mb-3">UPSC Civil Services</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-success/10 border border-success/20 text-success rounded-full text-[0.65rem] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Eligible
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-primary transition-colors" />
                </div>
              </motion.div>

              {/* Card 2 - Roadmap */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute bottom-[130px] left-[150px] bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_12px_30px_rgba(11,16,32,0.08)] border border-[#E2E8F0] w-[230px] z-20 group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h4 className="text-[0.9rem] font-bold text-[#0F172A] leading-tight">Your Study Roadmap</h4>
                    <p className="text-[0.65rem] font-semibold text-[#64748B]">Day 18 of 90</p>
                  </div>
                </div>
                <div className="w-full bg-[#F1F5F9] h-2 rounded-full mb-3 overflow-hidden">
                  <div className="w-[20%] h-full bg-[#3B82F6] rounded-full"></div>
                </div>
                <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-2">
                  <div className="flex items-start gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-1"></div>
                    <span className="text-[0.7rem] font-bold text-[#0F172A] leading-tight max-w-[120px]">Next: Complete Indian Polity</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#3B82F6] transition-colors" />
                </div>
              </motion.div>
              
            </div>

          </div>
        </section>

        {/* ==================== 3. STATS INTELLIGENCE STRIP ==================== */}
        <section className="bg-[#FCFCFF] py-10 border-y border-[#E2E8F0] relative z-10">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
              
              {[
                { icon: FileText, title: '250+', desc: 'EXAMS', sub: 'Mapped' },
                { icon: Building2, title: '1,200+', desc: 'INSTITUTIONS', sub: 'Tracked' },
                { icon: LineChart, title: '32+', desc: 'PATHWAYS', sub: 'Discovered' },
                { icon: BrainCircuit, title: 'AI-NATIVE', desc: 'GUIDANCE', sub: 'Personalized' },
              ].map((stat, i) => (
                <div key={i} className={cn("flex flex-col items-center text-center group cursor-pointer pt-6 md:pt-0", i === 0 && "pt-0")}>
                  <div className="mb-2 w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] group-hover:text-primary group-hover:border-primary/30 transition-colors shadow-sm">
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <p className="text-[1.8rem] font-extrabold text-[#0F172A] leading-none mb-1 group-hover:scale-105 transition-transform">{stat.title}</p>
                  <p className="text-[0.7rem] font-extrabold text-[#94A3B8] tracking-widest uppercase mb-1">{stat.desc}</p>
                  <p className="text-[0.75rem] font-medium text-[#475569]">{stat.sub}</p>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* ==================== 4. CONNECTED INTELLIGENCE ARCHITECTURE ==================== */}
        <section className="bg-white py-20 lg:py-28 relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 relative z-10">
            
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-[clamp(2rem,3vw,3rem)] font-extrabold text-[#0F172A] leading-tight mb-4">
                Navigate your future with <span className="text-primary">confidence.</span>
              </h2>
              <p className="text-[1rem] font-medium text-[#64748B] leading-relaxed">
                One intelligent system for discovering opportunities, understanding your options, and knowing exactly what to do next.
              </p>
            </div>

            {/* Asymmetric Connected Grid */}
            <div className="relative max-w-4xl mx-auto">
              
              {/* Connecting Path SVG for Desktop */}
              <svg className="hidden md:block absolute inset-0 w-full h-full -z-10 pointer-events-none" viewBox="0 0 800 600">
                <path d="M 200 100 L 600 250 L 200 400 L 600 550" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="6 6" fill="none" />
                <circle cx="200" cy="100" r="4" fill="#7C3AED" />
                <circle cx="600" cy="250" r="4" fill="#F59E0B" />
                <circle cx="200" cy="400" r="4" fill="#10B981" />
                <circle cx="600" cy="550" r="4" fill="#EC4899" />
              </svg>

              <div className="flex flex-col gap-12 md:gap-16 relative">
                
                {/* Stage 1 */}
                <div className="md:w-1/2 md:pr-12 relative group">
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)] hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED] group-hover:scale-110 transition-transform">
                        <Target className="w-6 h-6" />
                      </div>
                      <span className="text-[0.6rem] font-extrabold text-[#94A3B8]">01</span>
                    </div>
                    <h3 className="text-[1.1rem] font-extrabold text-[#0F172A] mb-2 flex items-center justify-between">
                      KNOW WHERE YOU STAND
                      <ArrowRight className="w-4 h-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 group-hover:text-[#7C3AED] transition-all" />
                    </h3>
                    <p className="text-[0.85rem] font-medium text-[#64748B] leading-relaxed">
                      Eligibility analysis based on your education, category and profile.
                    </p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="md:w-1/2 md:ml-auto md:pl-12 relative group">
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] flex items-center justify-center text-[#F59E0B] group-hover:scale-110 transition-transform">
                        <Compass className="w-6 h-6" />
                      </div>
                      <span className="text-[0.6rem] font-extrabold text-[#94A3B8]">02</span>
                    </div>
                    <h3 className="text-[1.1rem] font-extrabold text-[#0F172A] mb-2 flex items-center justify-between">
                      DISCOVER YOUR PATH
                      <ArrowRight className="w-4 h-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 group-hover:text-[#F59E0B] transition-all" />
                    </h3>
                    <p className="text-[0.85rem] font-medium text-[#64748B] leading-relaxed">
                      Explore verified exams, colleges and career opportunities.
                    </p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="md:w-1/2 md:pr-12 relative group">
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <span className="text-[0.6rem] font-extrabold text-[#94A3B8]">03</span>
                    </div>
                    <h3 className="text-[1.1rem] font-extrabold text-[#0F172A] mb-2 flex items-center justify-between">
                      PREPARE WITH DIRECTION
                      <ArrowRight className="w-4 h-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 group-hover:text-[#10B981] transition-all" />
                    </h3>
                    <p className="text-[0.85rem] font-medium text-[#64748B] leading-relaxed">
                      Get adaptive study plans with daily targets and progress tracking.
                    </p>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="md:w-1/2 md:ml-auto md:pl-12 relative group">
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-[0_8px_30px_rgba(236,72,153,0.1)] hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] flex items-center justify-center text-[#EC4899] group-hover:scale-110 transition-transform">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <span className="text-[0.6rem] font-extrabold text-[#94A3B8]">04</span>
                    </div>
                    <h3 className="text-[1.1rem] font-extrabold text-[#0F172A] mb-2 flex items-center justify-between">
                      ASK. UNDERSTAND. ACT.
                      <ArrowRight className="w-4 h-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 group-hover:text-[#EC4899] transition-all" />
                    </h3>
                    <p className="text-[0.85rem] font-medium text-[#64748B] leading-relaxed">
                      Your AI Copilot for exams, colleges, courses and decisions.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ==================== 5. CAREER JOURNEY TIMELINE ==================== */}
        <section className="bg-[#FCFCFF] py-20 lg:py-28 border-y border-[#E2E8F0] overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6">
            
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-[clamp(2rem,3vw,3rem)] font-extrabold text-[#0F172A] leading-tight mb-4">
                From your profile to your <span className="text-primary">future.</span>
              </h2>
            </div>

            <div className="relative max-w-5xl mx-auto">
              {/* Desktop Horizontal Line */}
              <div className="hidden md:block absolute top-[28px] left-[50px] right-[50px] h-[2px] bg-[#E2E8F0] -z-10">
                <div className="absolute top-0 left-0 h-full w-[40%] bg-primary"></div>
              </div>
              
              {/* Mobile Vertical Line */}
              <div className="md:hidden absolute top-[30px] bottom-[30px] left-[27px] w-[2px] bg-[#E2E8F0] -z-10">
                <div className="absolute top-0 left-0 w-full h-[40%] bg-primary"></div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-4">
                {[
                  { num: '01', title: 'Understand You', metric: 'Profile intelligence', icon: UserIcon, active: true },
                  { num: '02', title: 'Discover', metric: '250+ opportunities', icon: Search, active: true },
                  { num: '03', title: 'Match', metric: 'Eligibility + fit', icon: Target, active: false },
                  { num: '04', title: 'Prepare', metric: 'Adaptive roadmap', icon: BookOpen, active: false },
                  { num: '05', title: 'Achieve', metric: 'Progress tracking', icon: Rocket, active: false }
                ].map((step, i) => (
                  <div key={i} className="flex flex-row md:flex-col items-center md:text-center relative group w-full md:w-auto">
                    <div className={cn(
                      "w-14 h-14 rounded-full border-2 flex items-center justify-center shrink-0 md:mb-4 bg-white transition-all duration-300",
                      step.active ? "border-primary text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)]" : "border-[#CBD5E1] text-[#94A3B8]"
                    )}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="ml-6 md:ml-0 flex flex-col md:items-center">
                      <span className="font-extrabold text-[#94A3B8] text-[0.65rem] block mb-1">{step.num}</span>
                      <h3 className="text-[0.95rem] font-extrabold text-[#0F172A] mb-1">{step.title}</h3>
                      <p className={cn("text-[0.7rem] font-bold px-2 py-0.5 rounded", step.active ? "bg-primary/10 text-primary" : "bg-[#F1F5F9] text-[#64748B]")}>{step.metric}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ==================== 6. EXAM DISCOVERY (AI REC ENGINE) ==================== */}
        <section className="bg-white py-20 lg:py-28 border-b border-[#E2E8F0] relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-4">
              <h2 className="text-[clamp(2.5rem,3.5vw,3rem)] font-extrabold text-[#0F172A] leading-[1.05] mb-6">
                Don&apos;t just find exams.<br />Find the exams that fit you.
              </h2>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F5F3FF] border border-[#E2E8F0] rounded-full mb-8">
                <BrainCircuit className="w-4 h-4 text-primary" />
                <span className="text-[0.65rem] font-bold text-primary uppercase tracking-widest">Powered by your profile</span>
              </div>
              <p className="text-[1.05rem] font-medium text-[#64748B] leading-relaxed mb-8">
                Our eligibility engine calculates a precise match based on your education, category, age, and historical cutoffs.
              </p>
              <Button variant="outline" className="h-11 px-6 rounded-full font-bold border-primary text-primary hover:bg-primary/5">
                Explore Recommendations &rarr;
              </Button>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-4">
              
              {/* Exam 1 - High Match */}
              <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#10B981]"></div>
                
                <div className="pl-3 min-w-[220px]">
                  <h4 className="text-[1.1rem] font-extrabold text-[#0F172A] mb-1">UPSC Civil Services</h4>
                  <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-[#10B981] mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                  </div>
                  <p className="text-[0.7rem] font-medium text-[#64748B]">Deadline: 12 Jun 2026</p>
                </div>

                <div className="w-full sm:w-auto flex-1 max-w-xs">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[0.65rem] font-extrabold text-[#94A3B8] uppercase">Match Score</span>
                    <span className="text-[1.2rem] font-extrabold text-[#0F172A] leading-none">92%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '92%' }}></div>
                  </div>
                  <p className="text-[0.65rem] font-semibold text-[#64748B] mt-2 text-right">Strong fit for your B.Tech profile</p>
                </div>
              </div>

              {/* Exam 2 - Good Match */}
              <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#10B981]"></div>
                
                <div className="pl-3 min-w-[220px]">
                  <h4 className="text-[1.1rem] font-extrabold text-[#0F172A] mb-1">SSC CGL</h4>
                  <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-[#10B981] mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                  </div>
                  <p className="text-[0.7rem] font-medium text-[#64748B]">Deadline: 04 Aug 2026</p>
                </div>

                <div className="w-full sm:w-auto flex-1 max-w-xs">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[0.65rem] font-extrabold text-[#94A3B8] uppercase">Match Score</span>
                    <span className="text-[1.2rem] font-extrabold text-[#0F172A] leading-none">85%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B82F6]" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-[0.65rem] font-semibold text-[#64748B] mt-2 text-right">Good fit for your profile</p>
                </div>
              </div>

              {/* Exam 3 - Ineligible */}
              <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 opacity-80">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#EF4444]"></div>
                
                <div className="pl-3 min-w-[220px]">
                  <h4 className="text-[1.1rem] font-extrabold text-[#0F172A] mb-1">GATE Architecture</h4>
                  <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-[#EF4444] mb-2 bg-[#FEF2F2] px-2 py-0.5 rounded w-fit">
                    <AlertCircle className="w-3.5 h-3.5" /> Not Eligible
                  </div>
                  <p className="text-[0.7rem] font-medium text-[#64748B]">Deadline: 10 Feb 2027</p>
                </div>

                <div className="w-full sm:w-auto flex-1 max-w-xs">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[0.65rem] font-extrabold text-[#94A3B8] uppercase">Match Score</span>
                    <span className="text-[1.2rem] font-extrabold text-[#0F172A] leading-none">40%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#94A3B8]" style={{ width: '40%' }}></div>
                  </div>
                  <p className="text-[0.65rem] font-bold text-[#EF4444] mt-2 text-right">Requires B.Arch degree</p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ==================== 7. COLLEGE DECISION INTELLIGENCE ==================== */}
        <section className="bg-[#FCFCFF] py-20 lg:py-28 border-b border-[#E2E8F0] relative overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
            
            <div className="lg:col-span-4 relative">
              <h2 className="text-[clamp(2.5rem,3.5vw,3rem)] font-extrabold text-[#0F172A] leading-[1.05] mb-6">
                Compare possibilities<br />before you commit.
              </h2>
              <p className="text-[1.05rem] font-medium text-[#64748B] leading-relaxed mb-8 max-w-sm">
                Education is a massive investment. Our data-driven comparison tools help you evaluate colleges side by side.
              </p>
              <Button variant="outline" className="h-11 px-6 rounded-full font-bold border-primary text-primary hover:bg-primary/5">
                Compare Colleges &rarr;
              </Button>
            </div>

            <div className="lg:col-span-8">
              
              {/* Decision Panel */}
              <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_8px_30px_rgba(11,16,32,0.04)] overflow-hidden">
                <div className="grid grid-cols-3 bg-[#F8FAFC] border-b border-[#E2E8F0] p-6 pb-5">
                  <div></div>
                  <div className="text-center flex flex-col items-center">
                    <h4 className="font-extrabold text-[#0F172A] text-[1.1rem] leading-tight">NIT TRICHY</h4>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <h4 className="font-extrabold text-[#0F172A] text-[1.1rem] leading-tight">VIT VELLORE</h4>
                  </div>
                </div>
                
                <div className="divide-y divide-[#E2E8F0]">
                  {[
                    { label: 'Average Package', a: '12.5 LPA', b: '8.1 LPA', highlight: 'a' },
                    { label: 'First Year Fees', a: '₹1.7L', b: '₹2.9L', highlight: 'a' },
                    { label: 'Typical Cutoff Rank', a: '~1,500', b: '~8,000', highlight: 'b' },
                    { label: 'Campus Size', a: '800 Acres', b: '372 Acres', highlight: 'a' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 items-center p-5 hover:bg-[#F8FAFC] transition-colors">
                      <div className="text-[0.75rem] font-bold text-[#64748B]">
                        {row.label}
                      </div>
                      <div className={cn("text-center font-extrabold text-[0.95rem]", row.highlight === 'a' ? "text-[#0F172A]" : "text-[#64748B]")}>
                        {row.a}
                      </div>
                      <div className={cn("text-center font-extrabold text-[0.95rem]", row.highlight === 'b' ? "text-[#0F172A]" : "text-[#64748B]")}>
                        {row.b}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-[#F8FAFC] text-center border-t border-[#E2E8F0] p-4">
                  <Link href="/colleges" className="text-[0.8rem] font-bold text-primary hover:text-[#0F172A] transition-colors">
                    View full comparison &rarr;
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ==================== 8. DECISION TRADE-OFFS ==================== */}
        <section className="bg-white py-20 lg:py-28 border-b border-[#E2E8F0]">
          <div className="max-w-[1440px] mx-auto px-6">
            
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-[clamp(2.5rem,3.5vw,3rem)] font-extrabold text-[#0F172A] leading-tight mb-4">
                Don&apos;t just know your options.<br/><span className="text-primary">Understand the trade-offs.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1 */}
              <div className="bg-[#FCFCFF] border border-[#E2E8F0] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-full bg-[#F5F3FF] flex items-center justify-center mb-6">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-[1.3rem] font-extrabold text-[#0F172A] mb-6">EXAM</h3>
                <ul className="space-y-4">
                  {['Preparation time', 'Eligibility rules', 'Competition density', 'Career outcomes'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[0.9rem] font-semibold text-[#475569]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 2 */}
              <div className="bg-[#FCFCFF] border border-[#E2E8F0] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center mb-6">
                  <Building2 className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <h3 className="text-[1.3rem] font-extrabold text-[#0F172A] mb-6">COLLEGE</h3>
                <ul className="space-y-4">
                  {['College quality & tiers', 'Fee structures', 'Placement records', 'Location & campus'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[0.9rem] font-semibold text-[#475569]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 3 */}
              <div className="bg-[#FCFCFF] border border-[#E2E8F0] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-6">
                  <TrendingUp className="w-5 h-5 text-[#10B981]" />
                </div>
                <h3 className="text-[1.3rem] font-extrabold text-[#0F172A] mb-6">CAREER</h3>
                <ul className="space-y-4">
                  {['Required skillsets', 'Growth trajectory', 'Market demand', 'Long-term roadmap'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[0.9rem] font-semibold text-[#475569]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </section>

        {/* ==================== 9. ROADMAP / PREPARATION ==================== */}
        <section className="bg-[#F8FAFC] py-20 lg:py-28 border-b border-[#E2E8F0] overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <h2 className="text-[clamp(2.5rem,3.5vw,3rem)] font-extrabold text-[#0F172A] leading-tight mb-6">
                Know what to do next.
              </h2>
              <p className="text-[1.05rem] font-medium text-[#64748B] leading-relaxed mb-8 max-w-sm">
                Get adaptive study plans with daily targets and progress tracking. The roadmap automatically adjusts to your pace.
              </p>
              <Button asChild variant="primary" className="h-11 px-8 rounded-full font-bold text-[0.85rem] bg-gradient-to-r from-primary to-[#7C3AED] hover:opacity-90">
                <Link href="/roadmaps">View Roadmaps &rarr;</Link>
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-[0_8px_30px_rgba(11,16,32,0.04)] relative">
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-[1.3rem] font-extrabold text-[#0F172A]">UPSC PRELIMS</h4>
                  <p className="text-[0.7rem] font-bold text-[#64748B] uppercase tracking-widest mt-1">210 DAYS LEFT</p>
                </div>
                <div className="text-right">
                  <span className="text-[1.5rem] font-extrabold text-[#10B981]">42%</span>
                  <p className="text-[0.65rem] font-bold text-[#94A3B8] uppercase">Prepared</p>
                </div>
              </div>

              <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden mb-8">
                <div className="h-full bg-[#10B981]" style={{ width: '42%' }}></div>
              </div>

              <div className="space-y-4 mb-8 border-b border-[#E2E8F0] pb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  <span className="text-[0.95rem] font-bold text-[#94A3B8] line-through decoration-[#94A3B8]">Modern History</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/20">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <span className="text-[0.95rem] font-bold text-[#0F172A]">Indian Polity</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#CBD5E1]"></div>
                  <span className="text-[0.95rem] font-medium text-[#64748B]">Economy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#CBD5E1]"></div>
                  <span className="text-[0.95rem] font-medium text-[#64748B]">Geography</span>
                </div>
              </div>

              <div>
                <p className="text-[0.65rem] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-3">TODAY</p>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl flex justify-between items-center mb-4 border-l-4 border-l-primary">
                  <span className="font-bold text-[#0F172A] text-[0.9rem]">Complete Indian Polity</span>
                  <span className="font-bold text-[#64748B] text-[0.75rem] flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> 45 min</span>
                </div>
                
                <p className="text-[0.65rem] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-3">NEXT</p>
                <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl">
                  <span className="font-medium text-[#475569] text-[0.9rem]">Economy — Fundamental Concepts</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ==================== 10. AI COPILOT ==================== */}
        <section className="bg-[#0F172A] py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1E1B4B] via-[#0F172A] to-[#0F172A] pointer-events-none"></div>
          
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
            
            <div className="lg:col-span-5">
              <h2 className="text-[clamp(2.5rem,3.5vw,3rem)] font-extrabold text-white leading-[1.05] mb-6">
                Your career questions.<br/>One intelligent Copilot.
              </h2>
              <p className="text-[1.05rem] font-medium text-slate-400 leading-relaxed mb-10 max-w-md">
                Unlike generic chatbots, the UDANPATH AI Copilot understands your profile, exams, colleges, and goals to give precise, actionable guidance.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" className="h-11 px-6 rounded-full font-bold text-[0.85rem] bg-primary hover:bg-[#4F46E5]">
                  Try AI Copilot &rarr;
                </Button>
                <div className="h-11 px-5 rounded-full border border-slate-700 flex items-center justify-center text-white text-[0.85rem] font-semibold hover:bg-slate-800 transition-colors cursor-pointer">
                  Why this match?
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
              
              {/* Chat Interface */}
              <div className="flex-1 bg-[#1E293B]/80 backdrop-blur border border-slate-700/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 relative">
                {/* AI Glowing indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="text-[0.6rem] font-bold text-primary uppercase">Active</span>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                </div>

                {/* User */}
                <div className="flex items-start gap-4 mt-6">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#334155] rounded-2xl rounded-tl-none p-4 w-full">
                    <p className="text-[0.9rem] font-medium text-white">
                      Can I prepare for UPSC while finishing my B.Tech?
                    </p>
                  </div>
                </div>

                {/* AI */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#D946EF] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(91,75,255,0.4)]">
                    <BrainCircuit className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#0F172A] border border-primary/20 rounded-2xl rounded-tl-none p-5 w-full">
                    <p className="text-[0.9rem] font-medium text-slate-300 mb-5 leading-relaxed">
                      Yes. Based on your profile, you can prepare alongside your degree.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-3 flex justify-between items-center">
                        <h4 className="text-[0.85rem] font-bold text-white">UPSC Civil Services</h4>
                        <span className="text-[0.7rem] font-bold text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded">92% Match</span>
                      </div>
                      <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-3 flex justify-between items-center">
                        <h4 className="text-[0.85rem] font-bold text-white">SSC CGL</h4>
                        <span className="text-[0.7rem] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">85% Match</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Context Sidebar */}
              <div className="md:w-64 bg-[#1E293B]/80 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <h4 className="text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-widest mb-6">Understands Your Context</h4>
                <div className="space-y-5">
                  {[
                    { label: 'Profile & Education' },
                    { label: 'Career Goals' },
                    { label: 'Current Progress' },
                    { label: 'Target Exams' }
                  ].map((ctx, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-[0.85rem] font-medium text-white">{ctx.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ==================== 11. FINAL CTA ==================== */}
        <section className="bg-[#0F172A] relative overflow-hidden py-32 lg:py-40">
          
          {/* Subtle radial glow and network pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1E1B4B] via-[#0F172A] to-[#0F172A] opacity-80 pointer-events-none"></div>
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 1000 1000">
            <pattern id="network" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#7C3AED" />
              <path d="M 2 2 L 40 40" stroke="#7C3AED" strokeWidth="0.5" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#network)" />
          </svg>
          
          <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-[clamp(3rem,4vw,4rem)] font-extrabold text-white leading-[1.05] mb-6">
              Your future shouldn&apos;t be a guessing game.
            </h2>
            <p className="text-[1.1rem] font-medium text-slate-400 mb-10 max-w-xl mx-auto">
              Build your profile. Discover what fits. Know what to do next.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild variant="primary" className="h-12 px-10 rounded-full font-bold text-[1rem] bg-gradient-to-r from-primary to-[#7C3AED] hover:opacity-90 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                <Link href="/auth/sign-up">Start Your Journey &rarr;</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-10 rounded-full font-bold text-[1rem] border-slate-700 bg-transparent hover:bg-slate-800 text-white transition-colors">
                <Link href="/exams/discover">Explore Exams</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* ==================== 12. PREMIUM FOOTER ==================== */}
      <footer className="bg-[#FCFCFF] pt-16 pb-8 px-6 border-t border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto border-b border-[#E2E8F0] pb-16 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center font-bold text-white">
                  U
                </div>
                <span className="font-extrabold text-[1.2rem] leading-none tracking-tight text-[#0F172A]">
                  UDANPATH
                </span>
              </div>
              <p className="text-[0.8rem] font-bold text-[#64748B]">Your Career Navigation OS</p>
            </div>
            
            <div className="col-span-1">
              <h4 className="font-extrabold text-[0.8rem] text-[#0F172A] mb-5">Explore</h4>
              <ul className="space-y-4 text-[0.85rem] font-semibold text-[#64748B]">
                <li><Link href="/exams" className="hover:text-primary transition-colors">Exams</Link></li>
                <li><Link href="/colleges" className="hover:text-primary transition-colors">Colleges</Link></li>
                <li><Link href="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
                <li><Link href="/jobs" className="hover:text-primary transition-colors">Jobs</Link></li>
                <li><Link href="/guide" className="hover:text-primary transition-colors">Career Guide</Link></li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h4 className="font-extrabold text-[0.8rem] text-[#0F172A] mb-5">AI</h4>
              <ul className="space-y-4 text-[0.85rem] font-semibold text-[#64748B]">
                <li><Link href="/ai" className="hover:text-primary transition-colors">AI Copilot</Link></li>
                <li><Link href="/profile" className="hover:text-primary transition-colors">Student DNA</Link></li>
                <li><Link href="/roadmaps" className="hover:text-primary transition-colors">Roadmaps</Link></li>
                <li><Link href="/simulator" className="hover:text-primary transition-colors">Simulator</Link></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-extrabold text-[0.8rem] text-[#0F172A] mb-5">Company</h4>
              <ul className="space-y-4 text-[0.85rem] font-semibold text-[#64748B]">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>

          </div>
        </div>
        
        <div className="max-w-[1440px] mx-auto text-center">
          <div className="text-[0.75rem] font-semibold text-[#94A3B8]">
            © {new Date().getFullYear()} UDANPATH. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
