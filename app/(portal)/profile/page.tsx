'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile } from '@/lib/dbService';
import { 
  User, Award, FileText, CheckCircle2, 
  Sparkles, RefreshCw, Upload, AlertCircle, Bookmark, Edit3, MapPin, GraduationCap, Target, Clock, Languages
} from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ATS State
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

      if (dbProfile) {
        setProfile(dbProfile);
        setTargetRole((dbProfile.goal as string) || 'Software Engineer');
      } else {
        // Fallback to local storage
        const localProf = localStorage.getItem('udanpath_onboarding_profile');
        if (localProf) {
          const parsed = JSON.parse(localProf);
          setProfile({
            ...parsed,
            completeness: 80, // rough fallback
            goal: parsed.goalName || parsed.goal,
            education: parsed.educationLevelName || parsed.education,
            branch: parsed.branchName || parsed.branch,
            degree: parsed.degreeName || parsed.degree,
            studyHours: parsed.studyHours,
            language: parsed.language,
            mode: parsed.mode,
            state: parsed.state
          });
          setTargetRole(parsed.goalName || parsed.goal || 'Software Engineer');
        }
      }
      setLoading(false);
    };
    
    loadProfile();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
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
    } catch (err) {
      setScanResult({
        score: 75,
        extracted_skills: ["C++", "Java", "Python", "SQL"],
        missing_skills: ["Data Structures & Algorithms", "System Design", "Gate PYQs Practice", "FastAPI"],
        suggestions: [
          "Incorporate metric-driven achievements (e.g., 'Solved 400+ DSA problems on LeetCode').",
          "Include a dedicated section showcasing past GATE/competitive exams scores if applicable.",
          "Rewrite project descriptions using strong active verbs (e.g., 'Orchestrated', 'Optimized')."
        ]
      });
      showToast("Backend connection failed; simulated analysis loaded.");
    } finally {
      setLoadingScan(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading profile data...</div>;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">No Profile Found</h2>
        <p className="text-sm text-text-muted">Please complete your onboarding to see your profile.</p>
        <button onClick={() => router.push('/onboarding')} className="btn btn-primary px-6 py-2">
          Start Onboarding
        </button>
      </div>
    );
  }

  const completeness = profile.completeness || 60;

  return (
    <div className="space-y-8 select-none max-w-5xl mx-auto">
      
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-6 bg-card border border-primary/20 text-foreground text-sm font-semibold px-4 py-3 rounded-xl shadow-lg z-50 animate-slide-in">
          ✓ {toastMsg}
        </div>
      )}

      {/* Profile Header & Completeness */}
      <div className="card bg-card border border-border p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-extrabold flex items-center justify-center text-4xl shadow-lg shrink-0">
          {profile.fullName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 text-center md:text-left w-full space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <h2 className="text-2xl font-extrabold text-foreground">{profile.fullName || 'Aspirant'}</h2>
            <span className="px-2 py-0.5 rounded bg-primary-light text-primary text-[0.68rem] font-bold uppercase">
              {profile.category || 'General'}
            </span>
          </div>
          <p className="text-xs text-text-muted font-semibold">
            Target Goal: <span className="text-primary">{profile.goal || 'Not set'}</span>
          </p>

          <div className="pt-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Profile Completeness</span>
              <span className="text-xs font-extrabold text-primary">{completeness}%</span>
            </div>
            <div className="w-full bg-background h-2 rounded-full overflow-hidden border border-border/50">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 rounded-full"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
            {completeness < 100 && (
              <p className="text-[0.65rem] text-text-subtle mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-secondary" />
                Complete your profile to get the most accurate exam recommendations.
              </p>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <button onClick={() => router.push('/onboarding')} className="btn btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Structured Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic & Location */}
        <div className="card bg-card border border-border p-5 relative">
          <div className="absolute top-4 right-4 cursor-pointer text-primary hover:text-primary-hover" onClick={() => router.push('/onboarding')} title="Edit Basic Info">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold border-b border-border pb-3 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-text-muted" /> Basic Details
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-muted">Date of Birth:</span>
              <span className="font-bold">{profile.dob || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-muted">Gender:</span>
              <span className="font-bold">{profile.gender || '—'}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-text-muted flex items-center gap-1"><MapPin className="w-3 h-3" /> Location:</span>
              <span className="font-bold">{profile.city ? `${profile.city}, ` : ''}{profile.state || '—'}</span>
            </div>
          </div>
        </div>

        {/* Education & Academic */}
        <div className="card bg-card border border-border p-5 relative">
          <div className="absolute top-4 right-4 cursor-pointer text-primary hover:text-primary-hover" onClick={() => router.push('/onboarding')} title="Edit Education">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold border-b border-border pb-3 mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-text-muted" /> Education
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-muted">Level:</span>
              <span className="font-bold">{profile.education || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-muted">Degree / Branch:</span>
              <span className="font-bold">{profile.degree ? `${profile.degree} ${profile.branch ? `(${profile.branch})` : ''}` : '—'}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-text-muted flex items-center gap-1"><Award className="w-3 h-3" /> CGPA/Aggregate:</span>
              <span className="font-bold">{profile.cgpa ? `${profile.cgpa}` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <div className="card bg-card border border-border p-5 relative">
          <div className="absolute top-4 right-4 cursor-pointer text-primary hover:text-primary-hover" onClick={() => router.push('/onboarding')} title="Edit Preferences">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold border-b border-border pb-3 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" /> Study Preferences
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-muted">Study Dedication:</span>
              <span className="font-bold">{profile.studyHours || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-muted">Preferred Mode:</span>
              <span className="font-bold">{profile.mode || '—'}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-text-muted flex items-center gap-1"><Languages className="w-3 h-3" /> Language:</span>
              <span className="font-bold">{profile.language || '—'}</span>
            </div>
          </div>
        </div>

        {/* Goals & Interests */}
        <div className="card bg-card border border-border p-5 relative">
          <div className="absolute top-4 right-4 cursor-pointer text-primary hover:text-primary-hover" onClick={() => router.push('/onboarding')} title="Edit Goals">
            <Edit3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold border-b border-border pb-3 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-text-muted" /> Goals & Interests
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-muted">Primary Goal:</span>
              <span className="font-bold text-primary">{profile.goal || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-text-muted">Target Year:</span>
              <span className="font-bold">{profile.targetYear || 'Not decided'}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-text-muted">Prep Status:</span>
              <span className="font-bold">{profile.preparationStatus || 'Not started'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ATS Resume Scanner Panel */}
      <div className="card bg-card border border-border p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <FileText className="w-5.5 h-5.5 text-primary" />
          <div>
            <h3 className="text-base font-extrabold text-foreground">AI Resume ATS Compatibility Scanner</h3>
            <p className="text-[0.68rem] text-text-muted mt-0.5">Evaluate keyword gaps, formatting issues, and matches with your target competitive careers.</p>
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
                placeholder="e.g. Software Engineer / ISRO Scientist"
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted">Resume Plain Text Content</label>
              <textarea
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full bg-background border border-border rounded-lg px-3.5 py-3 text-xs focus:outline-none focus:border-primary font-mono leading-relaxed"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loadingScan || !resumeText.trim()}
                className="btn btn-primary py-2 px-6 text-sm font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {loadingScan ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loadingScan ? 'Analyzing...' : 'Scan Resume'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4 bg-background border border-border rounded-xl p-4">
              <div>
                <h4 className="text-sm font-extrabold">Match Score for '{targetRole}'</h4>
                <p className="text-xs text-text-muted mt-1">Based on industry standard keyword density.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-card border-4 border-primary flex items-center justify-center font-extrabold text-xl text-primary">
                  {scanResult.score}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths & Keywords Found
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {scanResult.extracted_skills.map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded text-[0.65rem] font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 uppercase">
                  <AlertCircle className="w-3.5 h-3.5" /> Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {scanResult.missing_skills.map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-700 dark:text-red-300 rounded text-[0.65rem] font-bold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">AI Suggestions</h4>
              <ul className="space-y-2">
                {scanResult.suggestions.map((sug: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground">
                    <span className="text-primary mt-0.5">→</span>
                    <span className="leading-relaxed">{sug}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setScanResult(null)}
                className="btn btn-secondary py-1.5 px-4 text-xs font-bold"
              >
                Scan Another Resume
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
