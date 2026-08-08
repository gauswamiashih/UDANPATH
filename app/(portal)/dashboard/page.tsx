'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Exam } from '@/lib/examsData';
import { evaluateEligibility, calculateMatchScore } from '@/lib/eligibility';
import { supabase } from '@/lib/supabaseClient';
import { getExamsFromDb, getUserBookmarks, toggleUserBookmark } from '@/lib/dbService';
import { 
  Sparkles, CheckCircle2, ArrowRight, Bot, 
  CheckSquare, MessageSquare, Bell, Calendar, Bookmark, BookmarkCheck,
  Building2, GraduationCap, ShieldCheck, Banknote
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>({
    fullName: 'Aspirant',
    category: 'GENERAL',
    education: 'B.Tech',
    branch: 'Computer Engineering',
    cgpa: 8.2,
  });

  const [setupPct, setSetupPct] = useState(85);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recommendedExams, setRecommendedExams] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const computeRecommendations = (profToCheck: any, bList: string[], loadedExams: any[]) => {
    if (!loadedExams || loadedExams.length === 0) return;

    // Filter and score exams using central calculateMatchScore helper
    const scoredExams = loadedExams.map((exam) => {
      const evaluation = calculateMatchScore(exam, profToCheck);
      return {
        ...exam,
        matchScore: evaluation.matchScore,
        matchLevel: evaluation.matchLevel,
        matchingReason: evaluation.matchingReason
      };
    }).filter(e => e.matchLevel !== 'NOT_ELIGIBLE');

    // Sort by Match Score
    scoredExams.sort((a, b) => b.matchScore - a.matchScore);
    setRecommendedExams(scoredExams);

    // Calculate setup percentage
    let score = 0;
    if (profToCheck.fullName && profToCheck.fullName !== 'Aspirant') score += 15;
    if (profToCheck.dob) score += 15;
    if (profToCheck.category) score += 15;
    if (profToCheck.education) score += 15;
    if (profToCheck.cgpa) score += 15;
    if (profToCheck.goal || profToCheck.dreamJob) score += 15;
    if (bList.length > 0) score += 10;
    setSetupPct(score);
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

      // 3. Load profile
      const localProf = localStorage.getItem('udanpath_onboarding_profile');
      let loadedProfile = profile;
      if (localProf) {
        loadedProfile = JSON.parse(localProf);
        setProfile(loadedProfile);
      }
      computeRecommendations(loadedProfile, bList, dbExams);

      // 4. Sync profile from Supabase in background
      if (session && session.user) {
        try {
          const { data, error } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (data && !error) {
            const mappedProfile = {
              fullName: session.user.user_metadata?.full_name || loadedProfile?.fullName || 'Aspirant',
              dob: data.date_of_birth || loadedProfile?.dob || '2004-01-01',
              category: data.category || loadedProfile?.category || 'GENERAL',
              education: data.highest_qualification || loadedProfile?.education || 'B.Tech',
              branch: data.stream || loadedProfile?.branch || 'Computer Engineering',
              cgpa: parseFloat(data.percentage_aggregate) || loadedProfile?.cgpa || 8.2,
              interests: data.target_exam_categories || loadedProfile?.interests || [],
              goal: loadedProfile?.goal || 'ISRO Scientist',
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
      setBookmarks(synced);
      localStorage.setItem('udanpath_bookmarks', JSON.stringify(synced));
      updated = synced;
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
                      
                      <h4 className="font-extrabold text-[1rem] line-height-1.3 mb-2 text-foreground">
                        {exam.name} <span className="text-text-muted text-xs ml-1">({exam.short_name})</span>
                      </h4>
                      
                      <div className="space-y-1.5 text-xs text-text-muted border-b border-border/50 pb-3 mb-3">
                        <div className="flex items-center"><Banknote className="w-3.5 h-3.5 mr-1.5 text-text-subtle" /> <strong>Salary:</strong> &nbsp;{salary}</div>
                        <div className="flex items-center"><UserCheck className="w-3.5 h-3.5 mr-1.5 text-text-subtle" /> <strong>Age:</strong> &nbsp;{exam.minimum_age}-{exam.maximum_age} Yrs</div>
                        <div className="flex items-center"><GraduationCap className="w-3.5 h-3.5 mr-1.5 text-text-subtle" /> <strong>Eligibility:</strong> &nbsp;{exam.matchLevel?.replace(/_/g, ' ')}</div>
                      </div>

                      <div className="text-[0.7rem] bg-card/50 border border-border p-2.5 rounded-lg leading-relaxed mb-4 text-text-muted">
                        <strong>Match Reason:</strong> {exam.matchingReason}
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
              Today's Daily Study Timetable
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
