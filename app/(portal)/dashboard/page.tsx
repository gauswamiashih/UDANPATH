'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EXAMS_DATABASE, Exam } from '@/lib/examsData';
import { evaluateEligibility } from '@/lib/eligibility';
import { supabase } from '@/lib/supabaseClient';
import { 
  Sparkles, CheckCircle2, ArrowRight, Bot, 
  CheckSquare, MessageSquare, Bell, Calendar, Bookmark, BookmarkCheck
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

  useEffect(() => {
    // Load local storage profile data
    const localProf = localStorage.getItem('udanpath_onboarding_profile');
    let loadedProfile = null;
    if (localProf) {
      loadedProfile = JSON.parse(localProf);
      setProfile(loadedProfile);
    }

    // Load saved bookmarks from local storage
    const savedBookmarks = localStorage.getItem('udanpath_bookmarks');
    const bList = savedBookmarks ? JSON.parse(savedBookmarks) : [];
    setBookmarks(bList);

    // Calculate setup percentage
    let score = 0;
    const profToCheck = loadedProfile || profile;
    if (profToCheck.fullName && profToCheck.fullName !== 'Aspirant') score += 15;
    if (profToCheck.dob) score += 15;
    if (profToCheck.category) score += 15;
    if (profToCheck.education) score += 15;
    if (profToCheck.cgpa) score += 15;
    if (profToCheck.goal || profToCheck.dreamJob) score += 15;
    if (bList.length > 0) score += 10;
    setSetupPct(score);

    // Filter and score exams
    const exams = EXAMS_DATABASE.map((exam, idx) => {
      const evaluation = evaluateEligibility(exam, profToCheck);
      let matchScore = 95 - idx * 2;
      let statusLabel = 'Eligible';
      
      if (evaluation.status === 'ineligible') {
        matchScore -= 30;
        statusLabel = 'Not Eligible';
      } else if (evaluation.status === 'possibly') {
        matchScore -= 10;
        statusLabel = 'Check Required';
      } else if (evaluation.status === 'more_info') {
        statusLabel = 'More Info Needed';
      }

      return {
        ...exam,
        matchScore,
        eligibilityStatus: statusLabel,
        matchingReason: evaluation.reason
      };
    });

    // Sort by Match Score
    exams.sort((a, b) => b.matchScore - a.matchScore);
    setRecommendedExams(exams);
  }, []);

  const toggleBookmark = (examId: string) => {
    let updated;
    if (bookmarks.includes(examId)) {
      updated = bookmarks.filter(id => id !== examId);
    } else {
      updated = [...bookmarks, examId];
    }
    setBookmarks(updated);
    localStorage.setItem('udanpath_bookmarks', JSON.stringify(updated));

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
          <div className="card bg-card border border-border p-6">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-5">
              <h3 className="text-md md:text-lg font-extrabold">Personalized Recommended Exams</h3>
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
                return (
                  <div 
                    key={exam.id}
                    className="border border-border bg-background rounded-xl p-4 flex flex-col justify-between hover:border-primary/30 transition-all duration-200"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-2 py-0.5 rounded text-[0.68rem] font-bold bg-card border border-border text-text-muted">
                          {exam.conductingBody}
                        </span>
                        <span className="text-xs font-extrabold text-success">
                          {exam.matchScore}% Match
                        </span>
                      </div>
                      
                      <h4 className="font-extrabold text-[0.95rem] line-height-1.3 mb-3 text-foreground">
                        {exam.title}
                      </h4>
                      
                      <div className="space-y-1.5 text-xs text-text-muted border-b border-border/50 pb-3 mb-3">
                        <div>💼 <strong>Salary:</strong> {exam.salaryRange}</div>
                        <div>👤 <strong>Age Limit:</strong> {exam.minAge}-{exam.maxAgeGen} Years</div>
                        <div>⚡ <strong>Eligibility:</strong> {exam.eligibilityStatus}</div>
                        <div>📅 <strong>Frequency:</strong> {exam.frequency}</div>
                      </div>

                      <div className="text-[0.72rem] bg-card border border-border p-2.5 rounded-lg leading-relaxed mb-4 text-text-muted">
                        🤖 <strong>Why this matches:</strong> {exam.matchingReason}
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
                        className="px-2 py-1.5 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors text-text-muted"
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
            </div>
          </div>

          {/* Daily Schedule timetable */}
          <div className="card bg-card border border-border p-6">
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
          <div className="card bg-card border border-border p-6">
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
          <div className="card bg-card border border-border p-6">
            <h3 className="text-md font-extrabold border-b border-border pb-4 mb-4">
              Upcoming Official Deadlines
            </h3>
            <div className="space-y-3">
              {recommendedExams.slice(0, 3).map((exam) => (
                <div 
                  key={exam.id}
                  className="flex justify-between items-center py-2 border-b border-border/50 text-xs"
                >
                  <div className="flex flex-col gap-0.5">
                    <strong className="font-bold">{exam.conductingBody} Apply</strong>
                    <span className="text-[0.68rem] text-text-muted">{exam.code} Registry</span>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-accent font-bold text-[0.68rem]">
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
