'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getExamsFromDb, getUserBookmarks, toggleUserBookmark, getUserProfile } from '@/lib/dbService';
import { calculateAdvancedMatchScore } from '@/lib/eligibilityEngine';
import { 
  Sparkles, ArrowRight, Bot, CheckSquare, MessageSquare, 
  Bookmark, BookmarkCheck, Building2, GraduationCap, ShieldCheck, 
  Banknote, UserCheck, Activity, Target, Map, Calendar, AlertCircle, BrainCircuit,
  Clock, Play, BookOpen, Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  const [setupPct, setSetupPct] = useState(85);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recommendedExams, setRecommendedExams] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const computeRecommendations = (profToCheck: any, bList: string[], loadedExams: any[]) => {
    if (!loadedExams || loadedExams.length === 0) return;

    // Filter and score exams using new eligibility engine
    const scoredExams = loadedExams.map((exam) => {
      const evaluation = calculateAdvancedMatchScore(exam, profToCheck);
      return {
        ...exam,
        matchScore: evaluation.matchScore,
        matchLevel: evaluation.status,
        matchingReason: evaluation.reason,
        isCrossDisciplinary: evaluation.isCrossDisciplinary
      };
    }).filter(e => e.matchLevel !== 'Not Eligible');

    // Sort by Match Score
    scoredExams.sort((a, b) => b.matchScore - a.matchScore);
    setRecommendedExams(scoredExams);

    // Calculate setup percentage
    let score = 0;
    if (profToCheck.fullName && profToCheck.fullName !== 'Aspirant') score += 10;
    if (profToCheck.dob) score += 10;
    if (profToCheck.category) score += 10;
    if (profToCheck.education || profToCheck.degree) score += 10;
    if (profToCheck.cgpa) score += 10;
    if (profToCheck.class10Marks) score += 10;
    if (profToCheck.class12Marks) score += 10;
    if (profToCheck.streamName) score += 10;
    if (profToCheck.goal || profToCheck.dreamJob) score += 10;
    if (bList.length > 0) score += 10;
    setSetupPct(Math.min(100, score));
  };

  useEffect(() => {
    const initDashboard = async () => {
      // 1. Fetch exams from Supabase database
      const dbExams = await getExamsFromDb();
      setExams(dbExams);

      // 2. Load bookmarks
      let bList: string[] = [];
      const savedBookmarks = localStorage.getItem('udanpath_bookmarks');
      if (savedBookmarks) {
        bList = JSON.parse(savedBookmarks);
      }

      // Check if authenticated to sync bookmarks from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const syncedBookmarks = await getUserBookmarks(session.user.id, dbExams);
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
        loadedProfile = JSON.parse(localProf);
        setProfile(loadedProfile);
      }
      computeRecommendations(loadedProfile, bList, dbExams);

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
              scienceCombo: dbProfile.scienceCombo || loadedProfile.scienceCombo,
              streamName: dbProfile.streamName || loadedProfile.streamName,
              budget: dbProfile.budget || loadedProfile.budget,
              collegePreference: dbProfile.collegePreference || loadedProfile.collegePreference,
              
              onboardingCompleted: true
            };
            setProfile(mappedProfile);
            localStorage.setItem('udanpath_onboarding_profile', JSON.stringify(mappedProfile));
            computeRecommendations(mappedProfile, bList, dbExams);
          }
        } catch (err) {
          console.error('Error syncing profile from Supabase:', err);
        }
      }
    };

    initDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Sync to Supabase in background if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const synced = await toggleUserBookmark(session.user.id, examId, exams);
      if (synced) {
        setBookmarks(synced);
        localStorage.setItem('udanpath_bookmarks', JSON.stringify(synced));
        updated = synced;
      }
    }

    // Update setup score
    let score = 0;
    if (profile.fullName && profile.fullName !== 'Aspirant') score += 15;
    if (profile.dob) score += 15;
    if (profile.category) score += 15;
    if (profile.education) score += 15;
    if (profile.cgpa) score += 15;
    if (profile.goal || profile.dreamJob) score += 15;
    if (updated.length > 0) score += 10;
    setSetupPct(score);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-12 select-none pb-20 pt-6">
      
      {/* COMMAND CENTER HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#E2E8F0] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[0.65rem] font-bold text-primary uppercase tracking-widest">
              Command Center
            </span>
          </div>
          <h1 className="text-[clamp(2rem,3vw,2.5rem)] font-extrabold tracking-tight text-[#0F172A] leading-none mb-2">
            Welcome back, {profile.fullName.split(' ')[0]}.
          </h1>
          <p className="text-[0.95rem] font-medium text-[#64748B] flex items-center gap-2">
            Targeting <strong className="text-[#0F172A]">{profile.goal || 'Professional'}</strong>
            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]"></span>
            {profile.category || 'GENERAL'} Category
          </p>
        </div>

        {setupPct < 100 && (
          <div className="flex items-center gap-5 bg-white px-5 py-3 rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_rgba(11,16,32,0.03)] w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[0.75rem] font-extrabold text-[#0F172A]">Student DNA</span>
              <span className="text-[0.65rem] font-bold text-[#94A3B8]">{setupPct}% Complete</span>
            </div>
            <div className="w-24 md:w-32 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${setupPct}%` }}></div>
            </div>
            <Button asChild variant="outline" className="h-8 px-3 text-[0.7rem] font-bold border-[#E2E8F0] hover:bg-[#F8FAFC]">
              <Link href="/profile">Complete</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left/Main Column */}
        <div className="xl:col-span-8 space-y-12">
          
          {/* TODAY'S PRIORITY (Cinematic Card) */}
          <section>
            <div className="bg-[#0F172A] rounded-3xl p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/30 to-purple-600/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
              
              <div className="relative z-10 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 border border-white/10 rounded-md mb-5 text-[0.65rem] font-bold text-white uppercase tracking-widest backdrop-blur">
                  <Play className="w-3 h-3 fill-white text-white" /> Action Required
                </div>
                <h3 className="text-[1.8rem] md:text-[2.2rem] font-extrabold text-white leading-tight mb-3">
                  Complete {recommendedExams[0]?.short_name || 'Your'} Syllabus Map
                </h3>
                <p className="text-[0.95rem] text-slate-300 font-medium leading-relaxed max-w-xl mb-6">
                  You are slightly behind schedule on your roadmap. Spend 45 minutes today completing the core fundamental topics for your highest-match exam.
                </p>
                <Button asChild variant="primary" className="h-11 px-8 rounded-full font-bold text-[0.85rem] bg-white text-[#0F172A] hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  <Link href="/roadmaps">
                    Start Session <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="hidden md:flex relative z-10 shrink-0 w-[180px] h-[180px] items-center justify-center">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent -rotate-45"></div>
                <div className="text-center">
                  <span className="block text-3xl font-extrabold text-white">42%</span>
                  <span className="block text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-1">Prepared</span>
                </div>
              </div>
            </div>
          </section>

          {/* CAREER TRAJECTORY (Linear/Notion style timeline) */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[1.1rem] font-extrabold text-[#0F172A]">Career Trajectory</h3>
              <div className="text-[0.7rem] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Phase 2: Discovery</div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_20px_rgba(11,16,32,0.02)] p-1 overflow-x-auto hide-scrollbar">
              <div className="flex items-center min-w-max p-6">
                {[
                  { title: 'Current', sub: profile.streamName || 'Education', icon: GraduationCap, active: true },
                  { title: 'Target Exam', sub: recommendedExams[0]?.short_name || 'TBD', icon: Target, active: true },
                  { title: 'Course', sub: 'Undergrad', icon: Building2, active: false },
                  { title: 'Branch', sub: profile.branch || 'Select', icon: Activity, active: false },
                  { title: 'Goal', sub: profile.goal || 'Professional', icon: Compass, active: false },
                ].map((step, i, arr) => (
                  <div key={i} className="flex items-center">
                    <div className={cn("flex flex-col items-center gap-4 relative z-10 w-[110px]", !step.active && "opacity-50")}>
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all", 
                        step.active ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]"
                      )}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-[0.75rem] font-extrabold text-[#0F172A]">{step.title}</p>
                        <p className="text-[0.65rem] font-medium text-[#64748B] mt-0.5 max-w-[90px] mx-auto line-clamp-1">{step.sub}</p>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-[60px] h-[2px] bg-[#F1F5F9] mx-2 -mt-10 relative">
                         {step.active && arr[i+1].active && <div className="absolute inset-0 bg-primary"></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RECOMMENDED EXAMS */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[1.1rem] font-extrabold text-[#0F172A]">AI Recommendations</h3>
              <Link href="/exams/discover" className="text-[0.8rem] font-bold text-primary hover:text-[#0F172A] transition-colors flex items-center gap-1">
                View Catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recommendedExams.slice(0, 4).map((exam) => {
                const isSaved = bookmarks.includes(exam.id);
                const salary = exam.salary_information?.approx_in_hand_monthly 
                  ? `₹${exam.salary_information.approx_in_hand_monthly.toLocaleString()}/mo` 
                  : (exam.salary_information?.pay_scale || 'N/A');
                  
                return (
                  <div key={exam.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(11,16,32,0.02)] hover:shadow-lg hover:border-primary/30 transition-all flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[0.65rem] font-bold text-[#64748B]">
                          <Building2 className="w-3 h-3" /> {exam.organization}
                        </div>
                        <div className={cn("px-2.5 py-1 rounded text-[0.65rem] font-extrabold", 
                          exam.matchScore >= 80 ? "bg-[#ECFDF5] text-[#10B981]" : 
                          exam.matchScore >= 50 ? "bg-[#FFFBEB] text-[#F59E0B]" : "bg-[#F8FAFC] text-[#94A3B8]"
                        )}>
                          {exam.matchScore}% Match
                        </div>
                      </div>
                      
                      <h4 className="font-extrabold text-[1.1rem] text-[#0F172A] mb-1.5 leading-tight flex items-center flex-wrap gap-2 group-hover:text-primary transition-colors">
                        {exam.name}
                        {exam.isCrossDisciplinary && (
                          <span className="text-[0.6rem] bg-[#F5F3FF] text-[#7C3AED] px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                            Alt Path
                          </span>
                        )}
                      </h4>
                      
                      <div className="space-y-2 mt-4 text-[0.8rem] font-medium text-[#64748B]">
                        <div className="flex items-center"><Banknote className="w-4 h-4 mr-2 text-[#94A3B8]" /> <span>{salary}</span></div>
                        <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-[#94A3B8]" /> <span>Ages {exam.minimum_age}-{exam.maximum_age}</span></div>
                      </div>

                      {exam.matchLevel !== 'Eligible' && (
                         <div className="mt-4 text-[0.7rem] bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444] px-3 py-2 rounded-lg font-bold flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> 
                          <span className="leading-relaxed">{exam.matchingReason}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#F1F5F9]">
                      <Button asChild variant="outline" className="flex-1 h-10 rounded-xl font-bold text-[0.8rem] border-[#E2E8F0] hover:bg-[#F8FAFC]">
                        <Link href={`/exams/${exam.id}`}>View Details</Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-10 w-10 shrink-0 rounded-xl border-[#E2E8F0] hover:bg-[#F8FAFC]"
                        onClick={() => toggleBookmark(exam.id)}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4 text-[#94A3B8]" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {recommendedExams.length === 0 && (
                <div className="md:col-span-2 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                  <Target className="w-10 h-10 text-[#CBD5E1] mb-4" />
                  <p className="text-[0.95rem] font-bold text-[#0F172A]">No recommendations found yet.</p>
                  <p className="text-[0.85rem] font-medium text-[#64748B] mt-1 max-w-sm">
                    Complete your Student DNA profile to let our eligibility engine calculate your best career paths.
                  </p>
                  <Button variant="outline" className="mt-6 font-bold" onClick={() => router.push('/profile')}>Update Profile</Button>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* AI COPILOT INSIGHT */}
          <div className="bg-[#FCFCFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(11,16,32,0.02)] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <BrainCircuit className="w-24 h-24" />
             </div>
             <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center text-primary">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h3 className="text-[0.9rem] font-extrabold text-[#0F172A]">Copilot Insight</h3>
              </div>
              <p className="text-[0.85rem] font-medium text-[#475569] leading-relaxed mb-6">
                Based on your {profile.cgpa} CGPA and interest in {profile.goal}, you should prioritize the quantitative aptitude sections of the {recommendedExams[0]?.short_name || 'upcoming'} exam this month.
              </p>
              <Button asChild variant="outline" className="w-full h-10 rounded-xl font-bold text-[0.8rem] border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]">
                <Link href="/ai"><Bot className="w-4 h-4 mr-2 text-primary" /> Chat with Copilot</Link>
              </Button>
            </div>
          </div>

          {/* UPCOMING DEADLINES */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(11,16,32,0.02)]">
            <h3 className="text-[0.9rem] font-extrabold text-[#0F172A] mb-5 uppercase tracking-widest">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {recommendedExams.slice(0, 3).map((exam, i) => (
                <div key={i} className="flex items-start justify-between group cursor-pointer hover:bg-[#F8FAFC] p-3 -mx-3 rounded-lg transition-colors">
                  <div>
                    <p className="text-[0.85rem] font-bold text-[#0F172A] group-hover:text-primary transition-colors">{exam.short_name} Registry</p>
                    <p className="text-[0.7rem] font-medium text-[#64748B] mt-0.5">{exam.organization}</p>
                  </div>
                  <div className="px-2 py-0.5 bg-[#FFFBEB] text-[#F59E0B] rounded text-[0.65rem] font-bold">Soon</div>
                </div>
              ))}
            </div>
          </div>

          {/* STUDY PROGRESS */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-[0_4px_20px_rgba(11,16,32,0.02)]">
            <h3 className="text-[0.9rem] font-extrabold text-[#0F172A] mb-5 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#94A3B8]" /> Today&apos;s Schedule
            </h3>
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E2E8F0] before:to-transparent">
              {[
                { time: '10:00', period: 'AM', task: 'Objective Problem Solving', done: true },
                { time: '02:00', period: 'PM', task: 'General Science Review', done: false },
                { time: '06:00', period: 'PM', task: 'Aptitude Reasoning', done: false }
              ].map((slot, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                  
                  {/* Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full border-2 bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10",
                    slot.done ? "border-[#10B981] bg-[#10B981]" : "border-[#CBD5E1]"
                  )}>
                    {slot.done && <CheckSquare className="w-2.5 h-2.5 text-white" />}
                  </div>

                  {/* Content */}
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-[#0F172A] text-[0.7rem] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">{slot.time} <span className="text-[#94A3B8]">{slot.period}</span></span>
                    </div>
                    <p className={cn("text-[0.8rem] font-bold", slot.done ? "text-[#94A3B8] line-through decoration-[#94A3B8]" : "text-[#475569]")}>
                      {slot.task}
                    </p>
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
