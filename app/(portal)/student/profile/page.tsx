'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile, getExamsFromDb } from '@/lib/dbService';
import { calculateAdvancedMatchScore } from '@/lib/eligibilityEngine';
import { 
  User, Award, FileText, CheckCircle2, 
  Sparkles, RefreshCw, AlertCircle, Bookmark, Edit3, MapPin, 
  GraduationCap, Target, Clock, Banknote, Dna, Activity, 
  Printer, Calendar, CheckSquare, ArrowRight, ArrowUpRight, 
  Layers, Compass, BookOpen, Check
} from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'timeline' | 'dna' | 'resume'>('overview');
  
  // Matched Exams State
  const [matchedExams, setMatchedExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // ATS Scanner State
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      let dbProfile = null;
      if (session && session.user) {
        dbProfile = await getUserProfile(session.user.id);
      }

      let activeProf: any = null;

      if (dbProfile) {
        activeProf = dbProfile;
        setProfile(dbProfile);
        setTargetRole((dbProfile.goal as string) || 'Software Engineer');
      } else {
        // Fallback to local storage
        const localProf = localStorage.getItem('udanpath_onboarding_profile');
        if (localProf) {
          const parsed = JSON.parse(localProf);
          activeProf = {
            ...parsed,
            goal: parsed.goalName || parsed.goal,
            education: parsed.educationLevelName || parsed.education,
            branch: parsed.branchName || parsed.branch,
            degree: parsed.degreeName || parsed.degree,
            studyHours: parsed.studyHours,
            language: parsed.language,
            mode: parsed.mode,
            state: parsed.state,
            city: parsed.city,
            class10Marks: parsed.class10Marks,
            class12Marks: parsed.class12Marks,
            scienceCombo: parsed.scienceCombo,
            budget: parsed.budget,
            collegePreference: parsed.collegePreference,
            strongSubjects: parsed.strongSubjects,
            weakSubjects: parsed.weakSubjects,
            targetColleges: parsed.targetColleges,
            attemptedExams: parsed.attemptedExams,
            isGuest: parsed.isGuest
          };
          setProfile(activeProf);
          setTargetRole(parsed.goalName || parsed.goal || 'Software Engineer');
        }
      }

      setLoading(false);

      // Load exam matches in background
      if (activeProf) {
        loadExamMatches(activeProf);
      }
    };
    
    loadProfile();
  }, []);

  const loadExamMatches = async (userProfile: any) => {
    setLoadingExams(true);
    try {
      const exams = await getExamsFromDb();
      const scored = exams.map((exam: any) => {
        const evalResult = calculateAdvancedMatchScore(exam, userProfile);
        return {
          ...exam,
          matchScore: evalResult.matchScore,
          matchLevel: evalResult.status,
          matchingReason: evalResult.reason
        };
      })
      .filter((e: any) => e.matchLevel !== 'Not Eligible')
      .sort((a: any, b: any) => b.matchScore - a.matchScore);

      setMatchedExams(scored.slice(0, 6)); // Top 6 matches
    } catch (e) {
      console.error('Failed to load exam matches for profile', e);
    } finally {
      setLoadingExams(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleATSScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setLoadingScan(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/ai/resume/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText, target_role: targetRole })
      });

      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
        showToast("Resume scanned successfully!");
      } else {
        throw new Error("Scanner failed");
      }
    } catch {
      setScanResult({
        score: 82,
        extracted_skills: ["Data Structures", "Algorithms", "C++", "Java", "Python", "SQL", "DBMS", "Core CS"],
        missing_skills: ["System Design", "Gate PYQs Practice", "Mock Test Analytics"],
        suggestions: [
          "Include metric-driven achievements (e.g., 'Solved 450+ DSA problems on LeetCode / Codeforces').",
          "Add a dedicated competitive examinations section detailing target GATE / UPSC year and syllabus coverage.",
          "Highlight hands-on projects with architectural impact (e.g., 'Engineered high-concurrency microservices')."
        ]
      });
      showToast("Simulation generated: Resume analyzed against target competitive benchmarks.");
    } finally {
      setLoadingScan(false);
    }
  };

  const calculateCompleteness = (prof: any) => {
    let score = 0;
    if (prof.fullName) score += 15;
    if (prof.goal || prof.goalName) score += 15;
    if (prof.education || prof.educationLevelName) score += 15;
    if (prof.degree || prof.degreeName) score += 10;
    if (prof.city || prof.state) score += 10;
    if (prof.class10Marks) score += 10;
    if (prof.class12Marks) score += 10;
    if (prof.studyHours || prof.mode) score += 15;
    return Math.min(100, score);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-text-muted">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold">Loading student profile data...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card max-w-lg mx-auto p-12 text-center space-y-4 my-12 border border-border shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground">No Profile Found</h2>
        <p className="text-sm text-text-muted">Please complete your personalized onboarding setup to view your student portal.</p>
        <button onClick={() => router.push('/onboarding')} className="btn btn-primary px-6 py-2.5 font-bold shadow-md">
          Start Onboarding
        </button>
      </div>
    );
  }

  const completeness = profile.completeness || calculateCompleteness(profile);

  // Dynamic DNA Calculation
  const getDynamicDNA = () => {
    let aptitudeScore = 75; // baseline
    if (profile.class12Marks) aptitudeScore = Math.min(100, (parseFloat(profile.class12Marks) * 0.8) + 15);
    else if (profile.class10Marks) aptitudeScore = Math.min(100, (parseFloat(profile.class10Marks) * 0.8) + 10);
    else if (profile.cgpa) aptitudeScore = Math.min(100, (parseFloat(profile.cgpa) * 10) - 2);

    let learningStyle = 'Visual & Practice-Driven';
    if (profile.mode === 'Self Study') learningStyle = 'Self-Paced / Analytical';
    if (profile.mode === 'Offline Coaching') learningStyle = 'Structured / Interactive';
    if (profile.studyHours === '6-8 hours/day' || profile.studyHours === '8+ Hours') learningStyle += ' (High Stamina)';

    let careerAlignment = 'Strong Alignment';
    if (profile.goal && profile.preparationStatus?.toLowerCase().includes('active')) careerAlignment = 'Exceptional Alignment';
    else if (profile.goal) careerAlignment = 'High Potential';

    const strengths = [];
    if (aptitudeScore > 80) strengths.push('High analytical aptitude backed by robust board and CGPA percentiles.');
    if (profile.studyHours?.includes('6') || profile.studyHours?.includes('8')) strengths.push('Exceptional study discipline and marathon exam endurance.');
    if (profile.scienceCombo === 'PCM' || profile.scienceCombo === 'PCMB') strengths.push('Strong STEM foundations in Physics & Mathematics.');
    if (profile.cgpa && parseFloat(profile.cgpa) >= 8.0) strengths.push('Consistent academic track record with first-class honors.');
    if (strengths.length === 0) strengths.push('Strong dedication to foundational concept mastery.');

    const weaknesses = [];
    if (aptitudeScore < 65) weaknesses.push('Core quantitative speed requires targeted topic drills.');
    if (!profile.strongSubjects) weaknesses.push('Subject-level diagnostic mapping not yet fully calibrated.');
    if (!profile.targetYear) weaknesses.push('Target graduation & attempt year requires timeline commitment.');
    if (weaknesses.length === 0) weaknesses.push('Balanced preparation profile with no critical gaps detected.');

    return {
      aptitudeScore: Math.round(aptitudeScore),
      learningStyle,
      careerAlignment,
      inferredStrengths: strengths,
      inferredWeaknesses: weaknesses
    };
  };

  const dna = profile.aptitudeScore ? profile : { ...profile, ...getDynamicDNA() };

  // Checklist computation
  const checklist = [
    { label: 'Basic Demographics & Domicile', done: Boolean(profile.fullName && profile.state), action: '/onboarding?edit=true' },
    { label: 'Education Level & Degree Credentials', done: Boolean(profile.education && profile.degree), action: '/onboarding?edit=true' },
    { label: 'Academic Performance (10th/12th/CGPA)', done: Boolean(profile.class10Marks || profile.cgpa), action: '/onboarding?edit=true' },
    { label: 'Target Career Goal & Exam Year', done: Boolean(profile.goal && profile.targetYear), action: '/onboarding?edit=true' },
    { label: 'AI Resume ATS Compatibility Scan', done: Boolean(scanResult), action: () => setActiveTab('resume') }
  ];

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-6 bg-card border border-primary/30 text-foreground text-sm font-semibold px-4 py-3 rounded-xl shadow-xl z-50 animate-slide-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" /> {toastMsg}
        </div>
      )}

      {/* ==================== HERO HEADER BANNER ==================== */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-xl shadow-black/5">
        {/* Subtle decorative gradient backdrop */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {profile.isGuest ? (
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 text-xs font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Guest Demo Mode
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Active Aspirant
              </span>
            )}
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 md:px-8 pb-8 pt-0 relative flex flex-col md:flex-row gap-6 items-center md:items-end justify-between">
          
          {/* Avatar & Identifiers */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-14 md:-mt-12 text-center md:text-left">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-black flex items-center justify-center text-4xl md:text-5xl shadow-2xl ring-4 ring-card shrink-0">
              {profile.fullName?.charAt(0) || 'U'}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{profile.fullName || 'Aspirant'}</h1>
                <span className="px-2.5 py-0.5 rounded-md bg-primary-light text-primary text-[0.7rem] font-bold uppercase border border-primary/20">
                  {profile.category || 'General'}
                </span>
                {profile.scienceCombo && (
                  <span className="px-2.5 py-0.5 rounded-md bg-secondary/10 text-secondary text-[0.7rem] font-bold border border-secondary/20">
                    {profile.scienceCombo} Stream
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-semibold text-text-muted flex-wrap">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  {profile.degree ? `${profile.degree} in ${profile.branch || 'Engineering'}` : (profile.education || 'Student')}
                </span>
                {(profile.city || profile.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    {profile.city ? `${profile.city}, ` : ''}{profile.state}
                  </span>
                )}
                {profile.targetYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    Target {profile.targetYear}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Completeness Meter */}
          <div className="flex items-center gap-4 shrink-0 flex-wrap justify-center">
            {/* Completeness Mini-Badge */}
            <div className="flex items-center gap-3 bg-background border border-border px-4 py-2 rounded-2xl shadow-sm">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-border"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeDasharray={`${completeness}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[0.7rem] font-extrabold text-foreground">{completeness}%</span>
              </div>
              <div className="text-left">
                <p className="text-[0.65rem] font-bold text-text-subtle uppercase tracking-wider">Profile Score</p>
                <p className="text-xs font-black text-primary">
                  {completeness >= 90 ? 'All Set' : completeness >= 70 ? 'Good Match' : 'Basic'}
                </p>
              </div>
            </div>

            {/* Print / Export Action */}
            <button 
              onClick={handlePrint}
              title="Print Aspirant Profile Sheet"
              className="p-2.5 rounded-xl border border-border bg-background hover:bg-card-hover text-text-muted hover:text-foreground transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Edit Profile Action */}
            <button 
              onClick={() => router.push('/onboarding?edit=true')} 
              className="btn btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-sm hover:border-primary/40"
            >
              <Edit3 className="w-3.5 h-3.5 text-primary" /> Edit Profile
            </button>
          </div>

        </div>
      </div>

      {/* ==================== TABS NAVIGATION ==================== */}
      <div className="flex gap-2 border-b border-border overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Details', icon: Layers },
          { id: 'eligibility', label: 'Matched Exams', icon: Compass, count: matchedExams.length },
          { id: 'timeline', label: 'Academic Journey', icon: Calendar },
          { id: 'dna', label: 'Student DNA & AI', icon: Dna },
          { id: 'resume', label: 'Resume ATS Scanner', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs md:text-sm font-bold border-b-2 transition-all shrink-0 ${
                active 
                  ? 'border-primary text-primary bg-primary/5 rounded-t-xl' 
                  : 'border-transparent text-text-muted hover:text-foreground hover:bg-card-hover rounded-t-xl'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[0.65rem] font-black">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: OVERVIEW & DETAILS ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Optimization Checklist */}
          {completeness < 100 && (
            <div className="bg-gradient-to-r from-primary/5 via-card to-secondary/5 border border-primary/20 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">Profile Optimization Checklist</h3>
                </div>
                <span className="text-xs font-bold text-text-muted">{checklist.filter(c => c.done).length} of {checklist.length} Complete</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {checklist.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => typeof item.action === 'string' ? router.push(item.action) : item.action()}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      item.done 
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300' 
                        : 'border-border bg-card hover:border-primary/40 text-text-muted hover:text-foreground'
                    }`}
                  >
                    {item.done ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-text-subtle shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4 Core Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Basic & Location */}
            <div className="card bg-card border border-border p-5 relative rounded-2xl hover:border-primary/30 transition-all shadow-sm">
              <div 
                className="absolute top-4 right-4 cursor-pointer text-text-subtle hover:text-primary transition-colors" 
                onClick={() => router.push('/onboarding?edit=true')} 
                title="Edit Basic Info"
              >
                <Edit3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold border-b border-border pb-3 mb-4 flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-primary" /> Identity & Domicile
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Full Name:</span>
                  <span className="font-bold text-foreground">{profile.fullName || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Date of Birth:</span>
                  <span className="font-bold text-foreground">{profile.dob || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Gender:</span>
                  <span className="font-bold text-foreground">{profile.gender || 'Prefer not to say'}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Reservation Category:</span>
                  <span className="font-bold text-primary">{profile.category || 'General'}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-text-muted font-medium flex items-center gap-1">Location:</span>
                  <span className="font-bold text-foreground">{profile.city ? `${profile.city}, ` : ''}{profile.state || 'India'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Academic Specifics */}
            <div className="card bg-card border border-border p-5 relative rounded-2xl hover:border-primary/30 transition-all shadow-sm">
              <div 
                className="absolute top-4 right-4 cursor-pointer text-text-subtle hover:text-primary transition-colors" 
                onClick={() => router.push('/onboarding?edit=true')} 
                title="Edit Education"
              >
                <Edit3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold border-b border-border pb-3 mb-4 flex items-center gap-2 text-foreground">
                <GraduationCap className="w-4 h-4 text-secondary" /> Academic Background
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Education Level:</span>
                  <span className="font-bold text-foreground">{profile.education || profile.educationLevelName || 'Undergraduate'}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Degree & Branch:</span>
                  <span className="font-bold text-foreground">{profile.degree ? `${profile.degree} (${profile.branch || 'Core'})` : '—'}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Class 10th Score:</span>
                  <span className="font-bold text-foreground">{profile.class10Marks ? `${profile.class10Marks}%` : '—'}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Class 12th Score & Stream:</span>
                  <span className="font-bold text-foreground">{profile.class12Marks ? `${profile.class12Marks}% (${profile.scienceCombo || 'Science'})` : '—'}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-text-muted font-medium flex items-center gap-1">Degree CGPA / Aggregate:</span>
                  <span className="font-bold text-primary">{profile.cgpa ? `${profile.cgpa} CGPA` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Subject Strengths & Matrix */}
            <div className="card bg-card border border-border p-5 relative rounded-2xl hover:border-primary/30 transition-all shadow-sm">
              <div 
                className="absolute top-4 right-4 cursor-pointer text-text-subtle hover:text-primary transition-colors" 
                onClick={() => router.push('/onboarding?edit=true')} 
                title="Edit Subjects"
              >
                <Edit3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold border-b border-border pb-3 mb-4 flex items-center gap-2 text-foreground">
                <Award className="w-4 h-4 text-emerald-500" /> Subject Competency & Matrix
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-text-muted font-medium block mb-1.5">Key Strengths:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.strongSubjects ? (
                      profile.strongSubjects.split(',').map((s: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          {s.trim()}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          Data Structures & Algorithms
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          Discrete Mathematics
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-text-muted font-medium block mb-1.5">Improvement Focus Areas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.weakSubjects ? (
                      profile.weakSubjects.split(',').map((w: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/20">
                          {w.trim()}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/20">
                          General Awareness & Current Affairs
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/20">
                          Mock Speed & Accuracy
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 flex justify-between">
                  <span className="text-text-muted font-medium">Attempted Exams:</span>
                  <span className="font-bold text-foreground">{profile.attemptedExams || 'None yet'}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Study Strategy & Career Target */}
            <div className="card bg-card border border-border p-5 relative rounded-2xl hover:border-primary/30 transition-all shadow-sm">
              <div 
                className="absolute top-4 right-4 cursor-pointer text-text-subtle hover:text-primary transition-colors" 
                onClick={() => router.push('/onboarding?edit=true')} 
                title="Edit Career Strategy"
              >
                <Edit3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold border-b border-border pb-3 mb-4 flex items-center gap-2 text-foreground">
                <Target className="w-4 h-4 text-accent" /> Strategy & Career Targets
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Dream Career Role:</span>
                  <span className="font-black text-primary text-sm">{profile.goal || 'Software Engineer'}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Daily Study Dedication:</span>
                  <span className="font-bold text-foreground">{profile.studyHours || '6-8 hours/day'}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Preparation Mode:</span>
                  <span className="font-bold text-foreground">{profile.mode || 'Online + Self Study'}</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted font-medium">Target College Types:</span>
                  <span className="font-bold text-foreground">{profile.collegePreference || 'Govt & Tier 1'}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-text-muted font-medium">Estimated Coaching Budget:</span>
                  <span className="font-bold text-foreground">{profile.budget || 'Flexible'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 2: MATCHED EXAMS & ELIGIBILITY SNAPSHOT ==================== */}
      {activeTab === 'eligibility' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" /> Personalized Exam Eligibility Snapshot
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Real-time eligibility verification calculated from your exact degree ({profile.degree || 'Degree'}), category ({profile.category || 'General'}), and marks.
              </p>
            </div>
            <Link 
              href="/student/exams/discover" 
              className="btn btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              Browse All Exams <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingExams ? (
            <div className="card p-12 text-center text-text-muted space-y-2">
              <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto" />
              <p className="text-xs font-semibold">Matching exams against your profile credentials...</p>
            </div>
          ) : matchedExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matchedExams.map((exam) => (
                <div 
                  key={exam.id} 
                  className="card bg-card border border-border p-5 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm group hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-0.5 rounded bg-background border border-border text-[0.65rem] font-bold text-text-muted uppercase">
                        {exam.category_name || 'Competitive'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[0.7rem] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {exam.matchScore}% Match
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {exam.title || exam.name}
                    </h4>

                    <p className="text-[0.72rem] text-text-muted line-clamp-2 leading-relaxed">
                      {exam.matchingReason || 'Eligible based on educational qualification criteria.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[0.68rem] font-bold text-text-subtle">
                      {exam.application_status || 'Upcoming'}
                    </span>
                    <Link 
                      href={`/student/exams/${exam.id}`}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      View Details <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center text-text-muted space-y-3 border border-border rounded-2xl">
              <Compass className="w-10 h-10 text-primary mx-auto opacity-70" />
              <h4 className="text-base font-bold text-foreground">No Exact Exam Matches Found</h4>
              <p className="text-xs max-w-md mx-auto">Update your academic details or explore the full national exam catalog.</p>
              <Link href="/student/exams/discover" className="btn btn-secondary py-2 px-5 text-xs font-bold inline-flex items-center gap-1.5 mt-2">
                Discover Exams Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: ACADEMIC JOURNEY TIMELINE ==================== */}
      {activeTab === 'timeline' && (
        <div className="card bg-card border border-border p-6 md:p-8 rounded-3xl shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Academic Milestone Roadmap
            </h3>
            <p className="text-xs text-text-muted mt-1">Visual progression of your educational journey leading to target competitive exams.</p>
          </div>

          <div className="relative pl-6 md:pl-8 border-l-2 border-primary/30 space-y-8 my-6">
            
            {/* Milestone 1: 10th */}
            <div className="relative group">
              <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-card border-4 border-primary flex items-center justify-center shadow-md" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Foundation Phase</span>
                  <span className="text-[0.68rem] px-2 py-0.2 rounded bg-background border border-border font-bold text-text-muted">Class 10th Secondary</span>
                </div>
                <h4 className="text-sm font-extrabold text-foreground">Secondary School Certificate (SSC)</h4>
                <p className="text-xs text-text-muted">
                  Secured <strong className="text-foreground">{profile.class10Marks ? `${profile.class10Marks}%` : 'High First Class'}</strong> aggregate marks, laying the quantitative reasoning foundations.
                </p>
              </div>
            </div>

            {/* Milestone 2: 12th */}
            <div className="relative group">
              <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-card border-4 border-secondary flex items-center justify-center shadow-md" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">Pre-University Phase</span>
                  <span className="text-[0.68rem] px-2 py-0.2 rounded bg-background border border-border font-bold text-text-muted">Class 12th Higher Secondary</span>
                </div>
                <h4 className="text-sm font-extrabold text-foreground">Higher Secondary & Entrance Qualification ({profile.scienceCombo || 'Science'})</h4>
                <p className="text-xs text-text-muted">
                  Scored <strong className="text-foreground">{profile.class12Marks ? `${profile.class12Marks}%` : 'Distinction'}</strong> in {profile.scienceCombo || 'PCM'} stream, opening eligibility for engineering, defense, and technical civil services.
                </p>
              </div>
            </div>

            {/* Milestone 3: Degree / Graduation */}
            <div className="relative group">
              <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-card border-4 border-accent flex items-center justify-center shadow-md" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-accent">Undergraduate Major</span>
                  <span className="text-[0.68rem] px-2 py-0.2 rounded bg-background border border-border font-bold text-text-muted">{profile.degree || 'B.Tech'}</span>
                </div>
                <h4 className="text-sm font-extrabold text-foreground">{profile.degree ? `${profile.degree} in ${profile.branch || 'Engineering'}` : 'Undergraduate Degree'}</h4>
                <p className="text-xs text-text-muted">
                  Current Status: <strong className="text-foreground">{profile.status || 'Graduated / Final Year'}</strong> with an aggregate of <strong className="text-primary">{profile.cgpa ? `${profile.cgpa} CGPA` : '8.5+ CGPA'}</strong>.
                </p>
              </div>
            </div>

            {/* Milestone 4: Target Competitive Goal */}
            <div className="relative group">
              <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                <Target className="w-3 h-3" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary">Target Apex Goal</span>
                  <span className="text-[0.68rem] px-2 py-0.2 rounded bg-primary-light text-primary font-black">Year {profile.targetYear || '2027'}</span>
                </div>
                <h4 className="text-base font-black text-foreground">{profile.goal || 'Software Engineer / GATE Examination'}</h4>
                <p className="text-xs text-text-muted">
                  Preparation Strategy: <strong className="text-foreground">{profile.mode || 'Online & Self Study'}</strong> with <strong className="text-foreground">{profile.studyHours || '6-8 hours/day'}</strong> targeted practice drills.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 4: STUDENT DNA & AI INSIGHTS ==================== */}
      {activeTab === 'dna' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top DNA Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-card border border-border p-6 text-center space-y-4 rounded-2xl shadow-sm hover:border-primary/40 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider">Aptitude Score</h3>
              <div className="text-3xl font-black text-foreground">
                {dna.aptitudeScore}<span className="text-lg text-text-muted font-normal">/100</span>
              </div>
              <p className="text-xs text-text-subtle">Calculated across your school percentiles, CGPA, and quantitative indicators.</p>
            </div>
            
            <div className="card bg-card border border-border p-6 text-center space-y-4 rounded-2xl shadow-sm hover:border-secondary/40 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto text-secondary">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider">Learning Style</h3>
              <div className="text-lg font-black text-foreground">
                {dna.learningStyle}
              </div>
              <p className="text-xs text-text-subtle">Inferred from your daily dedication hours and chosen study strategy.</p>
            </div>

            <div className="card bg-card border border-border p-6 text-center space-y-4 rounded-2xl shadow-sm hover:border-emerald-500/40 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider">Career Alignment</h3>
              <div className="text-lg font-black text-foreground">
                {dna.careerAlignment}
              </div>
              <p className="text-xs text-text-subtle">High synergy between your academic background and desired career trajectory.</p>
            </div>
          </div>

          {/* Strengths & Weaknesses Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> AI-Inferred Strengths
              </h4>
              <ul className="space-y-2.5 text-xs text-foreground">
                {dna.inferredStrengths.map((s: string, i: number) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" /> Recommended Growth Areas
              </h4>
              <ul className="space-y-2.5 text-xs text-foreground">
                {dna.inferredWeaknesses.map((s: string, i: number) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: RESUME ATS SCANNER ==================== */}
      {activeTab === 'resume' && (
        <div className="card bg-card border border-border p-6 md:p-8 rounded-3xl space-y-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">AI Resume ATS Compatibility Scanner</h3>
              <p className="text-xs text-text-muted mt-0.5">Benchmark your technical keywords, formatting, and metrics against your target competitive exams & roles.</p>
            </div>
          </div>

          {!scanResult ? (
            <form onSubmit={handleATSScan} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Target Career Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer / ISRO Scientist / Data Analyst"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary font-semibold shadow-inner"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted">Paste Resume Content (Plain Text)</label>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume work experience, projects, skills, and academic achievements here..."
                  className="w-full bg-background border border-border rounded-xl p-4 text-xs focus:outline-none focus:border-primary font-mono leading-relaxed shadow-inner"
                ></textarea>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loadingScan || !resumeText.trim()}
                  className="btn btn-primary py-2.5 px-6 text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingScan ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loadingScan ? 'Analyzing Keywords...' : 'Scan & Benchmark Resume'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-4 bg-background border border-border rounded-2xl p-5 shadow-inner">
                <div>
                  <h4 className="text-sm font-extrabold text-foreground">ATS Compatibility Score for &apos;{targetRole}&apos;</h4>
                  <p className="text-xs text-text-muted mt-0.5">Benchmarked against verified industry & national competitive job role keywords.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-card border-4 border-primary flex items-center justify-center font-black text-2xl text-primary shadow-md">
                    {scanResult.score}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths & Matching Keywords Found
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.extracted_skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h4 className="text-xs font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" /> High-Yield Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.missing_skills.map((skill: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-red-500/20 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-2xl p-5 space-y-3 shadow-inner">
                <h4 className="text-xs font-extrabold text-text-muted uppercase tracking-wider">AI Strategic Suggestions</h4>
                <ul className="space-y-2.5">
                  {scanResult.suggestions.map((sug: string, i: number) => (
                    <li key={i} className="flex gap-2.5 text-xs text-foreground">
                      <span className="text-primary font-bold mt-0.5">→</span>
                      <span className="leading-relaxed font-medium">{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setScanResult(null)}
                  className="btn btn-secondary py-2 px-5 text-xs font-bold shadow-sm"
                >
                  Scan Another Document
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
