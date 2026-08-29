'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Exam } from '@/lib/examsData';
import { supabase } from '@/lib/supabaseClient';
import { getExamsFromDb, getUserBookmarks, toggleUserBookmark, getUserProfile } from '@/lib/dbService';
import { calculateAdvancedMatchScore } from '@/lib/eligibilityEngine';
import { 
  Sparkles, CheckCircle2, ArrowRight, Bot, 
  CheckSquare, MessageSquare, Bell, Calendar, Bookmark, BookmarkCheck,
  Building2, GraduationCap, ShieldCheck, Banknote, UserCheck, Activity, Target, Map
} from 'lucide-react';

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
              
              // Advanced metrics mapped if available
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
    <div className="space-y-8 select-none">
      
      {/* Dynamic Greetings header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome Back, <span className="gradient-text font-extrabold">{profile.fullName}</span>!
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Check your personalized matching exams, preparation roadmaps, and AI counselor tips.
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          {profile.category || 'GENERAL'} Category
        </span>
      </div>

      {/* Visual profile completeness bar card */}
      <div className={`card border p-5 flex flex-col gap-3.5 transition-colors duration-300 ${
        setupPct < 100 
          ? 'bg-amber-500/5 border-amber-500/15' 
          : 'bg-green-500/5 border-green-500/15'
      }`}>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <strong className="text-sm font-bold">
              Profile Completeness Status: <span className="text-primary">{setupPct}% Complete</span>
            </strong>
          </div>
          <span className="text-xs font-semibold text-text-muted">
            {setupPct < 100 
              ? 'Save your first target exam to reach 100% setup!' 
              : 'Your profile is 100% complete! Standard roadmaps fully optimized.'}
          </span>
        </div>
        <div className="w-full bg-background h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${setupPct}%` }}
          ></div>
        </div>
      </div>

      {/* Dynamic Profile-Based Career Roadmap (10-Step) */}
      <div className="card bg-card border border-border p-6 shadow-sm overflow-hidden">
        <h3 className="text-md md:text-lg font-extrabold border-b border-border pb-4 mb-6 flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          Your 10-Step Education & Career Navigator
        </h3>
        
        <div className="flex gap-4 items-center overflow-x-auto pb-6 scrollbar-thin">
          
          {/* Step 1: Education */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">1. Current State</span>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <strong className="text-xs">{profile.streamName || profile.education || 'Class 12'}</strong>
            <span className="text-[0.65rem] text-text-muted">{profile.scienceCombo || 'Exploring'}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-border shrink-0" />

          {/* Step 2: Next Exam */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">2. Target Exam</span>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6 text-warning" />
            </div>
            <strong className="text-xs">{recommendedExams[0]?.short_name || 'TBD'}</strong>
            <span className="text-[0.65rem] text-success font-bold">{recommendedExams[0] ? 'Eligible' : ''}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-border shrink-0" />

          {/* Step 3: Course */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0 opacity-80">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">3. Course</span>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
              <Building2 className="w-6 h-6 text-accent" />
            </div>
            <strong className="text-xs">Undergrad</strong>
          </div>
          <ArrowRight className="w-4 h-4 text-border shrink-0" />

          {/* Step 4: Branch */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0 opacity-70">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">4. Branch</span>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-secondary" />
            </div>
            <strong className="text-xs">{profile.branch || 'Select Branch'}</strong>
          </div>
          <ArrowRight className="w-4 h-4 text-border shrink-0" />

          {/* Step 5: College */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0 opacity-60">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">5. College</span>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <Banknote className="w-6 h-6 text-emerald-500" />
            </div>
            <strong className="text-xs">{profile.collegePreference === 'Govt Only' ? 'Top Govt Inst.' : 'Target College'}</strong>
          </div>
          <ArrowRight className="w-4 h-4 text-border shrink-0" />
          
          {/* Step 6: Skills */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0 opacity-50">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">6. Skills</span>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
              <CheckSquare className="w-6 h-6 text-blue-500" />
            </div>
            <strong className="text-xs">Core Tech</strong>
          </div>
          <ArrowRight className="w-4 h-4 text-border shrink-0" />

          {/* Step 7: Projects */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0 opacity-50">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">7. Projects</span>
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
              <Bot className="w-6 h-6 text-purple-500" />
            </div>
            <strong className="text-xs">Portfolio</strong>
          </div>
          <ArrowRight className="w-4 h-4 text-border shrink-0" />

          {/* Step 8: Internships */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0 opacity-50">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">8. Internships</span>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
              <BookmarkCheck className="w-6 h-6 text-amber-500" />
            </div>
            <strong className="text-xs">Experience</strong>
          </div>
          <ArrowRight className="w-4 h-4 text-border shrink-0" />

          {/* Step 9: Final Prep */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0 opacity-50">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">9. Final Prep</span>
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
              <MessageSquare className="w-6 h-6 text-indigo-500" />
            </div>
            <strong className="text-xs">Interviews</strong>
          </div>
          <ArrowRight className="w-4 h-4 text-border shrink-0" />

          {/* Step 10: Career Goal */}
          <div className="flex flex-col items-center text-center min-w-[120px] shrink-0">
            <span className="text-[0.65rem] font-bold text-text-muted uppercase mb-1">10. Career Goal</span>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-success" />
            </div>
            <strong className="text-xs">{profile.goal || 'Professional'}</strong>
            <span className="text-[0.65rem] text-text-muted">Dream Role</span>
          </div>

        </div>
      </div>

      {/* Main dashboard body layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Recommended Exams & schedule) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recommended Exams */}
          <div className="card bg-card border border-border p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-5">
              <h3 className="text-md md:text-lg font-extrabold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Personalized Recommended Exams
              </h3>
              <Link 
                href="/exams/discover"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Browse All Exams <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedExams.slice(0, 4).map((exam) => {
                const isSaved = bookmarks.includes(exam.id);
                const salary = exam.salary_information?.approx_in_hand_monthly 
                  ? `₹${exam.salary_information.approx_in_hand_monthly.toLocaleString()}/mo` 
                  : (exam.salary_information?.pay_scale || 'N/A');
                  
                return (
                  <div 
                    key={exam.id}
                    className="border border-border bg-background rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 hover:shadow-md"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-card border border-border text-text-muted flex items-center">
                          <Building2 className="w-3 h-3 mr-1" />
                          {exam.organization}
                        </span>
                        <div className={`px-2 py-0.5 rounded-md text-[0.65rem] font-extrabold ${
                          exam.matchScore >= 80 ? 'bg-success/10 text-success border border-success/20' : 
                          exam.matchScore >= 50 ? 'bg-warning/10 text-warning border border-warning/20' : 
                          'bg-card border border-border text-text-muted'
                        }`}>
                          {exam.matchScore}% Match
                        </div>
                      </div>
                      
                      <h4 className="font-extrabold text-[1rem] line-height-1.3 mb-2 text-foreground flex items-center gap-2">
                        {exam.name} <span className="text-text-muted text-xs">({exam.short_name})</span>
                        {exam.isCrossDisciplinary && (
                          <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[0.55rem] uppercase font-extrabold tracking-wider border border-accent/20">
                            Alternative Path
                          </span>
                        )}
                      </h4>
                      
                      <div className="space-y-1.5 text-xs text-text-muted border-b border-border/50 pb-3 mb-3">
                        <div className="flex items-center"><Banknote className="w-3.5 h-3.5 mr-1.5 text-text-subtle" /> <strong>Salary:</strong> &nbsp;{salary}</div>
                        <div className="flex items-center"><UserCheck className="w-3.5 h-3.5 mr-1.5 text-text-subtle" /> <strong>Age:</strong> &nbsp;{exam.minimum_age}-{exam.maximum_age} Yrs</div>
                        <div className="flex items-center"><GraduationCap className="w-3.5 h-3.5 mr-1.5 text-text-subtle" /> <strong>Status:</strong> &nbsp;
                          <span className={exam.matchLevel === 'Eligible' ? 'text-success font-bold' : 'text-warning font-bold'}>{exam.matchLevel}</span>
                        </div>
                      </div>

                      <div className={`text-[0.7rem] bg-card/50 border border-border p-2.5 rounded-lg leading-relaxed mb-4 ${exam.matchLevel === 'Eligible' ? 'text-text-muted' : 'text-warning'}`}>
                        <strong>Engine Reason:</strong> {exam.matchingReason}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        href={`/exams/${exam.id}`}
                        className="flex-1 btn btn-primary py-2 text-xs justify-center font-bold"
                      >
                        View Details
                      </Link>
                      
                      <button
                        onClick={() => toggleBookmark(exam.id)}
                        className="px-2 py-1.5 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors text-text-muted flex items-center justify-center"
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
                  No recommendations found. Please update your profile.
                </div>
              )}
            </div>
          </div>

          {/* Daily Schedule timetable */}
          <div className="card bg-card border border-border p-6 shadow-sm">
            <h3 className="text-md md:text-lg font-extrabold border-b border-border pb-4 mb-4">
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
                  <div className="px-3 py-1.5 rounded bg-primary-light text-primary text-xs font-bold font-mono">
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
          <div className="card bg-card border border-border p-6 shadow-sm">
            <h3 className="text-md font-extrabold mb-4">Quick Career Actions</h3>
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
                <CheckSquare className="w-4 h-4 mr-2" /> Upload & Scan Resume
              </button>

              <button 
                onClick={() => router.push('/saved')}
                className="w-full btn btn-secondary py-2.5 justify-center font-bold text-sm"
              >
                <Bookmark className="w-4 h-4 mr-2" /> Check Bookmarked Exams
              </button>
            </div>
          </div>

          {/* What Should I Do Next Widget */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm">
            <h3 className="text-md font-extrabold text-primary mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> What should I do next?
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">1</div>
                <p className="text-sm text-foreground leading-relaxed">
                  Start preparing for <strong className="text-primary">{recommendedExams[0]?.short_name || 'your target exam'}</strong>. Based on your {profile.class12Marks}% marks, you have a solid foundation.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">2</div>
                <p className="text-sm text-foreground leading-relaxed">
                  Verify the latest official notification to ensure age and category-specific cutoffs haven't changed.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">3</div>
                <p className="text-sm text-foreground leading-relaxed">
                  Open the <strong>What-If Simulator</strong> to build a backup plan in case you miss the cutoff.
                </p>
              </div>
            </div>
          </div>

          {/* Exam Deadlines checklists */}
          <div className="card bg-card border border-border p-6 shadow-sm">
            <h3 className="text-md font-extrabold border-b border-border pb-4 mb-4">
              Upcoming Official Deadlines
            </h3>
            <div className="space-y-3">
              {recommendedExams.slice(0, 3).map((exam) => (
                <div 
                  key={exam.id}
                  className="flex justify-between items-center py-3 border-b border-border/50 text-xs"
                >
                  <div className="flex flex-col gap-1">
                    <strong className="font-bold">{exam.organization} Apply</strong>
                    <span className="text-[0.68rem] text-text-muted">{exam.short_name} Registry</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-accent font-bold text-[0.68rem] border border-amber-500/20">
                    Upcoming
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
