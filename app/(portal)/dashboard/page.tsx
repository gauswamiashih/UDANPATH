'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Exam } from '@/lib/examsData';
import { supabase } from '@/lib/supabaseClient';
import { getUserBookmarks, toggleUserBookmark, getUserProfile } from '@/lib/dbService';
import { calculateMatchScore, evaluateEligibility } from '@/lib/eligibility';
import { 
  Sparkles, CheckCircle2, ArrowRight, Bot, 
  CheckSquare, MessageSquare, Bell, Calendar, Bookmark, BookmarkCheck,
  Building2, GraduationCap, ShieldCheck, Banknote, UserCheck, Activity, Target, Map, Clock, Check
} from 'lucide-react';
import { getCoordinatorExamUpdates, ExamUpdate, getMasterExams } from '@/lib/coordinatorService';

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>({
    fullName: 'Aspirant',
    category: 'GENERAL',
    education: 'B.Tech',
    degree: 'B.Tech',
    branch: 'Computer Engineering',
    cgpa: 8.2,
  });

  const [setupPct, setSetupPct] = useState(80);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recommendedExams, setRecommendedExams] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [coordinatorSchedules, setCoordinatorSchedules] = useState<ExamUpdate[]>([]);

  const computeRecommendations = (profToCheck: any, bList: string[], loadedExams: any[]) => {
    if (!loadedExams || loadedExams.length === 0) return;

    // Filter and score exams using reactive eligibility engine
    const scoredExams = loadedExams.map((exam) => {
      const evaluation = calculateMatchScore(exam, profToCheck);
      
      const regEnd = exam.registrationWindow?.endDate || exam.application_end_date;
      let daysLeft: number | null = null;
      if (regEnd) {
        const diff = new Date(regEnd).getTime() - Date.now();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      // Dynamic Status Badge calculation: 'Eligible', 'Criteria Check', or 'Upcoming'
      let statusBadge: 'Eligible' | 'Criteria Check' | 'Upcoming' = 'Criteria Check';
      let badgeStyle = 'bg-warning/10 text-warning border border-warning/20';

      const isUpcoming = exam.application_status === 'Upcoming' || (daysLeft != null && daysLeft > 45);

      if (isUpcoming) {
        statusBadge = 'Upcoming';
        badgeStyle = 'bg-primary/10 text-primary border border-primary/20';
      } else if (evaluation.matchScore >= 70 || evaluation.matchLevel === 'EXACT_MATCH' || evaluation.matchLevel === 'STRONG_MATCH') {
        statusBadge = 'Eligible';
        badgeStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      }

      return {
        ...exam,
        matchScore: evaluation.matchScore,
        matchLevel: evaluation.matchLevel,
        matchingReason: evaluation.matchingReason,
        registrationDaysLeft: daysLeft,
        statusBadge,
        badgeStyle
      };
    }).filter(e => e.matchLevel !== 'NOT_ELIGIBLE');

    // Sort by Match Score
    scoredExams.sort((a, b) => b.matchScore - a.matchScore);
    setRecommendedExams(scoredExams);

    // Calculate dynamic setup percentage based on profile fields completeness
    let score = 0;
    if (profToCheck.fullName && profToCheck.fullName !== 'Aspirant') score += 10;
    if (profToCheck.dob || profToCheck.date_of_birth) score += 10;
    if (profToCheck.category) score += 10;
    if (profToCheck.education || profToCheck.degree) score += 10;
    if (profToCheck.branch) score += 10;
    if (profToCheck.cgpa) score += 10;
    if (profToCheck.class10Marks || profToCheck.class12Marks) score += 10;
    if (profToCheck.streamName || profToCheck.interests) score += 10;
    if (profToCheck.goal || profToCheck.dreamJob) score += 10;
    if (bList.length > 0) score += 10;
    setSetupPct(Math.min(100, score));
  };

  useEffect(() => {
    const initDashboard = async () => {
      // 1. Authoritative Master Exams list from Unified Reactive Store
      const masterExams = getMasterExams();
      setExams(masterExams);

      // 2. Load bookmarks
      let bList: string[] = [];
      const savedBookmarks = localStorage.getItem('udanpath_bookmarks');
      if (savedBookmarks) {
        try {
          bList = JSON.parse(savedBookmarks);
        } catch (e) {}
      }

      // Check if authenticated to sync bookmarks from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const syncedBookmarks = await getUserBookmarks(session.user.id, masterExams);
        if (syncedBookmarks && syncedBookmarks.length > 0) {
          bList = syncedBookmarks;
          localStorage.setItem('udanpath_bookmarks', JSON.stringify(bList));
        }
      }
      setBookmarks(bList);

      // 3. Load profile locally as immediate fallback
      const localProf = localStorage.getItem('udanpath_onboarding_profile');
      let loadedProfile = profile;
      if (localProf) {
        try {
          loadedProfile = JSON.parse(localProf);
          setProfile(loadedProfile);
        } catch (e) {}
      }
      computeRecommendations(loadedProfile, bList, masterExams);

      // 4. Sync comprehensive profile from Supabase in background
      if (session && session.user) {
        try {
          const dbProfile = await getUserProfile(session.user.id);
          
          if (dbProfile) {
            const mappedProfile = {
              fullName: session.user.user_metadata?.full_name || dbProfile.fullName || loadedProfile.fullName,
              dob: dbProfile.dob || loadedProfile.dob || '2004-01-01',
              category: dbProfile.category || loadedProfile.category || 'GENERAL',
              education: dbProfile.education || loadedProfile.education || 'B.Tech',
              degree: dbProfile.degree || loadedProfile.degree || 'B.Tech',
              branch: dbProfile.branch || loadedProfile.branch || 'Computer Engineering',
              cgpa: parseFloat(dbProfile.cgpa) || loadedProfile.cgpa || 8.2,
              interests: dbProfile.interests || loadedProfile.interests || [],
              goal: dbProfile.goal || loadedProfile.goal || 'ISRO Scientist',
              class10Marks: dbProfile.class10Marks || loadedProfile.class10Marks,
              class12Marks: dbProfile.class12Marks || loadedProfile.class12Marks,
              streamName: dbProfile.streamName || loadedProfile.streamName,
              collegePreference: dbProfile.collegePreference || loadedProfile.collegePreference,
              onboardingCompleted: true
            };
            setProfile(mappedProfile);
            localStorage.setItem('udanpath_onboarding_profile', JSON.stringify(mappedProfile));
            computeRecommendations(mappedProfile, bList, masterExams);
          }
        } catch (err) {
          console.error('Error syncing profile from Supabase:', err);
        }
      }
      setCoordinatorSchedules(getCoordinatorExamUpdates());
    };

    initDashboard();

    const handleSync = () => {
      const updatedMaster = getMasterExams();
      setExams(updatedMaster);
      setCoordinatorSchedules(getCoordinatorExamUpdates());
      const localProf = localStorage.getItem('udanpath_onboarding_profile');
      const curProfile = localProf ? JSON.parse(localProf) : profile;
      const curBookmarks = JSON.parse(localStorage.getItem('udanpath_bookmarks') || '[]');
      computeRecommendations(curProfile, curBookmarks, updatedMaster);
    };

    window.addEventListener('udanpath_master_store_updated', handleSync);
    window.addEventListener('udanpath_exams_updated', handleSync);
    window.addEventListener('udanpath_coordinator_data_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('udanpath_master_store_updated', handleSync);
      window.removeEventListener('udanpath_exams_updated', handleSync);
      window.removeEventListener('udanpath_coordinator_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const toggleBookmark = async (examId: string) => {
    let updated = [...bookmarks];
    if (bookmarks.includes(examId)) {
      updated = bookmarks.filter(id => id !== examId);
    } else {
      updated = [...bookmarks, examId];
    }
    setBookmarks(updated);
    localStorage.setItem('udanpath_bookmarks', JSON.stringify(updated));

    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const synced = await toggleUserBookmark(session.user.id, examId, exams);
      if (synced) {
        setBookmarks(synced);
        localStorage.setItem('udanpath_bookmarks', JSON.stringify(synced));
        updated = synced;
      }
    }

    computeRecommendations(profile, updated, exams);
  };

  // Determine active step index (1-10) in Education Navigator
  const getActiveStep = () => {
    if (!profile.degree && !profile.education) return 1;
    if (recommendedExams.length === 0) return 2;
    if (!profile.branch) return 4;
    if (!profile.collegePreference) return 5;
    if (!profile.skills && (!profile.interests || profile.interests.length === 0)) return 6;
    if (bookmarks.length === 0) return 8;
    if (!profile.goal) return 10;
    return 3;
  };
  const activeStep = getActiveStep();

  const navigatorSteps = [
    { step: 1, title: 'Current Degree', val: profile.degree || profile.education || 'Class 12', icon: GraduationCap, sub: 'Academic State' },
    { step: 2, title: 'Target Exam', val: recommendedExams[0]?.short_name || 'TBD', icon: ShieldCheck, sub: recommendedExams[0]?.statusBadge || 'Matching' },
    { step: 3, title: 'Course Track', val: profile.degree || 'Undergrad', icon: Building2, sub: 'Curriculum' },
    { step: 4, title: 'Branch Spec', val: profile.branch || 'Select Branch', icon: Activity, sub: 'Technical Field' },
    { step: 5, title: 'College Type', val: profile.collegePreference || 'Top Institutes', icon: Banknote, sub: 'Preference' },
    { step: 6, title: 'Core Skills', val: 'Technical Foundation', icon: CheckSquare, sub: 'Syllabus Mapped' },
    { step: 7, title: 'Projects', val: 'Portfolio Review', icon: Bot, sub: 'Practical Prep' },
    { step: 8, title: 'Mock Test Series', val: bookmarks.length > 0 ? `${bookmarks.length} Saved` : 'Practice Exams', icon: BookmarkCheck, sub: 'Simulation' },
    { step: 9, title: 'Final Revision', val: 'PYQs & Notes', icon: MessageSquare, sub: 'Exam Ready' },
    { step: 10, title: 'Career Goal', val: profile.goal || 'Professional', icon: Target, sub: 'Aspiration' }
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* Dynamic Greetings header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Welcome Back, <span className="gradient-text">{profile.fullName}</span>!
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-1">
            Real-time personalized exam recommendations, eligibility matches, and curriculum timelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            {profile.category || 'GENERAL'} Category
          </span>
          {profile.branch && (
            <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold">
              {profile.branch}
            </span>
          )}
        </div>
      </div>

      {/* Visual profile completeness bar card */}
      <div className={`card border p-5 rounded-2xl flex flex-col gap-3.5 transition-colors duration-300 ${
        setupPct < 100 
          ? 'bg-amber-500/5 border-amber-500/20' 
          : 'bg-emerald-500/5 border-emerald-500/20'
      }`}>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <strong className="text-sm font-bold text-foreground">
              Profile Completeness Status: <span className="text-primary font-black">{setupPct}% Complete</span>
            </strong>
          </div>
          <span className="text-xs font-semibold text-text-muted">
            {setupPct < 100 
              ? 'Complete onboarding preferences to unlock highest-precision matches!' 
              : 'Your profile is 100% complete! Matched roadmap is fully calibrated.'}
          </span>
        </div>
        <div className="w-full bg-background h-2.5 rounded-full overflow-hidden border border-border">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500 rounded-full"
            style={{ width: `${setupPct}%` }}
          ></div>
        </div>
      </div>

      {/* Dynamic 10-Step Education & Career Navigator */}
      <div className="card bg-card border border-border p-6 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
          <h3 className="text-base font-extrabold flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Dynamic 10-Step Education & Career Navigator
          </h3>
          <span className="text-xs text-primary font-bold px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
            Step {activeStep} of 10 Active
          </span>
        </div>
        
        <div className="flex gap-3 items-center overflow-x-auto pb-4 scrollbar-thin">
          {navigatorSteps.map((s, idx) => {
            const isCurrent = s.step === activeStep;
            const isDone = s.step < activeStep;

            return (
              <React.Fragment key={s.step}>
                <div className={`flex flex-col items-center text-center min-w-[125px] p-3 rounded-xl border transition-all duration-300 shrink-0 ${
                  isCurrent 
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10 scale-105' 
                    : isDone
                    ? 'bg-background/80 border-emerald-500/30'
                    : 'bg-background/40 border-border opacity-70'
                }`}>
                  <span className={`text-[0.62rem] font-bold uppercase mb-1.5 ${
                    isCurrent ? 'text-primary' : isDone ? 'text-emerald-400' : 'text-text-muted'
                  }`}>
                    {s.step}. {s.title}
                  </span>
                  
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform ${
                    isCurrent 
                      ? 'bg-primary text-white scale-110 shadow-sm' 
                      : isDone
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-card text-text-subtle'
                  }`}>
                    {isDone ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  
                  <strong className="text-xs text-foreground truncate max-w-[110px] block" title={s.val}>
                    {s.val}
                  </strong>
                  <span className="text-[0.65rem] text-text-muted mt-0.5 block truncate max-w-[100px]">
                    {s.sub}
                  </span>
                </div>

                {idx < navigatorSteps.length - 1 && (
                  <ArrowRight className={`w-4 h-4 shrink-0 ${isDone ? 'text-emerald-500/40' : 'text-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main dashboard body layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Recommended Exams & schedule) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recommended Exams */}
          <div className="card bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-5">
              <div>
                <h3 className="text-base md:text-lg font-extrabold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Personalized Recommended Exams
                </h3>
                <p className="text-xs text-text-muted mt-0.5">Ranked by eligibility qualification match score</p>
              </div>
              <Link 
                href="/exams/discover"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Browse All ({exams.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedExams.slice(0, 4).map((exam) => {
                const isSaved = bookmarks.includes(exam.id) || (exam.slug && bookmarks.includes(exam.slug));
                const salary = exam.salary_information?.approx_in_hand_monthly 
                  ? `₹${exam.salary_information.approx_in_hand_monthly.toLocaleString()}/mo` 
                  : (exam.salary_information?.pay_scale || 'N/A');

                const targetSlug = exam.slug || exam.id;
                  
                return (
                  <div 
                    key={exam.id || exam.slug}
                    className="border border-border bg-background rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 hover:shadow-md"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-card border border-border text-text-muted flex items-center">
                          <Building2 className="w-3 h-3 mr-1 text-primary" />
                          {exam.conductingAuthority || exam.organization}
                        </span>
                        
                        {/* Dynamic Status Badges: "Eligible", "Criteria Check", or "Upcoming" */}
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[0.65rem] font-extrabold ${exam.badgeStyle}`}>
                            {exam.statusBadge}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[0.62rem] font-bold bg-primary/10 text-primary border border-primary/20">
                            {exam.matchScore}%
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="font-extrabold text-[0.98rem] leading-snug mb-2 text-foreground">
                        {exam.name} <span className="text-text-muted text-xs font-semibold ml-1">({exam.short_name || exam.code})</span>
                      </h4>
                      
                      <div className="space-y-1.5 text-xs text-text-muted border-b border-border/50 pb-3 mb-3">
                        <div className="flex items-center"><Banknote className="w-3.5 h-3.5 mr-1.5 text-text-subtle" /> <strong>Salary:</strong> &nbsp;{salary}</div>
                        <div className="flex items-center"><UserCheck className="w-3.5 h-3.5 mr-1.5 text-text-subtle" /> <strong>Age:</strong> &nbsp;{exam.minimum_age || 18}-{exam.maximum_age || 32} Yrs</div>
                        <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-primary" /> <strong>Exam Date:</strong> &nbsp;
                          <span className="text-foreground font-semibold">{exam.examDate || exam.exam_date || 'TBA'}</span>
                        </div>
                      </div>

                      <div className="text-[0.7rem] bg-card/60 border border-border p-2.5 rounded-lg leading-relaxed mb-4 text-text-muted">
                        <strong>Match Basis:</strong> {exam.matchingReason}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        href={`/exams/${targetSlug}`}
                        className="flex-1 btn btn-primary py-2 text-xs justify-center font-bold"
                      >
                        View Details
                      </Link>
                      
                      <button
                        onClick={() => toggleBookmark(exam.id || exam.slug)}
                        className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors text-text-muted flex items-center justify-center"
                        title="Save Exam"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4.5 h-4.5 text-primary" />
                        ) : (
                          <Bookmark className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {recommendedExams.length === 0 && (
                <div className="col-span-2 text-center py-8 text-text-muted text-sm border border-dashed border-border rounded-xl">
                  No recommendations found matching active profile qualifications.
                </div>
              )}
            </div>
          </div>

          {/* Daily Schedule timetable */}
          <div className="card bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-base font-extrabold border-b border-border pb-4 mb-4">
              Today&apos;s Daily Study Timetable
            </h3>
            <div className="space-y-3">
              {[
                { time: '06:00 AM - 08:00 AM', task: 'Core Syllabus Revision & Notes Map' },
                { time: '10:00 AM - 12:00 PM', task: 'Objective Problem Solving & CBT Practice' },
                { time: '06:00 PM - 08:00 PM', task: 'Aptitude Reasoning & Weak Areas Review' }
              ].map((slot, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border bg-background"
                >
                  <div className="px-3 py-1.5 rounded bg-primary/10 text-primary text-xs font-bold font-mono">
                    {slot.time}
                  </div>
                  <span className="text-xs md:text-sm font-semibold">{slot.task}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Columns (Quick Actions & deadlines) */}
        <div className="space-y-6">
          
          {/* Quick Career Actions */}
          <div className="card bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-base font-extrabold mb-4">Quick Career Actions</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => router.push('/ai')}
                className="w-full btn btn-primary py-2.5 justify-center font-bold text-sm"
              >
                <Bot className="w-4 h-4 mr-2" /> Ask UdanPath AI Advisor
              </button>
              
              <button 
                onClick={() => router.push('/simulator')}
                className="w-full btn btn-secondary py-2.5 justify-center font-bold text-sm"
              >
                <Activity className="w-4 h-4 mr-2" /> Open What-If Simulator
              </button>
              
              <button 
                onClick={() => router.push('/profile')}
                className="w-full btn btn-secondary py-2.5 justify-center font-bold text-sm"
              >
                <CheckSquare className="w-4 h-4 mr-2" /> Update Education Profile
              </button>

              <button 
                onClick={() => router.push('/saved')}
                className="w-full btn btn-secondary py-2.5 justify-center font-bold text-sm"
              >
                <Bookmark className="w-4 h-4 mr-2" /> Check Bookmarked Exams ({bookmarks.length})
              </button>
            </div>
          </div>

          {/* Real-time Schedule Widget */}
          <div className="card bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                <Clock className="w-4 h-4 text-primary" /> Active Cycles
              </h4>
              <span className="text-[0.65rem] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {coordinatorSchedules.slice(0, 3).map((sched) => (
                <div key={sched.id} className="p-3 rounded-lg border border-border bg-background space-y-1">
                  <div className="flex justify-between items-start">
                    <strong className="text-xs font-bold text-foreground block truncate max-w-[180px]">{sched.examName}</strong>
                    <span className="text-[0.62rem] font-bold text-primary">{sched.academicYear}</span>
                  </div>
                  <div className="text-[0.7rem] text-text-muted flex justify-between">
                    <span>Exam: <strong>{sched.examDate}</strong></span>
                    <span className="text-emerald-400 font-semibold">{sched.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
