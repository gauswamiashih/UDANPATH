'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile } from '@/lib/dbService';
import { 
  User, Award, FileText, CheckCircle2, 
  Sparkles, RefreshCw, Upload, AlertCircle, Bookmark
} from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>({
    fullName: 'Aspirant',
    dob: '2004-01-01',
    category: 'GENERAL',
    education: 'B.Tech',
    branch: 'Computer Engineering',
    cgpa: '8.2',
    goal: 'ISRO Scientist',
    state: 'Gujarat',
    studyHours: '6-8 Hours',
    language: 'English',
    mode: 'Online'
  });

  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
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
          setProfile(JSON.parse(localProf));
          setTargetRole(JSON.parse(localProf).goal || 'Software Engineer');
        }
      }
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
      const res = await fetch("http://localhost:8000/api/v1/ai/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          target_role: targetRole
        })
      });

      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
        showToast("Resume scanned successfully!");
      } else {
        throw new Error("Scanner failed");
      }
    } catch (err) {
      // Fallback local scan response
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

  return (
    <div className="space-y-8 select-none max-w-4xl mx-auto">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-6 bg-card border border-primary/20 text-foreground text-sm font-semibold px-4 py-3 rounded-xl shadow-lg z-50 animate-slide-in">
          ✓ {toastMsg}
        </div>
      )}

      {/* Profile banner */}
      <div className="card bg-card border border-border p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-extrabold flex items-center justify-center text-3xl shadow-lg">
          {profile.fullName.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap mb-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">{profile.fullName}</h2>
            <span className="px-2 py-0.5 rounded bg-primary-light text-primary text-[0.68rem] font-bold">
              {profile.category}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Academic Degree: {profile.education} in {profile.branch} | CGPA: {profile.cgpa}
          </p>
        </div>
      </div>

      {/* Main grids layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Onboarding preferences card summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-card border border-border p-5">
            <h3 className="text-sm font-bold border-b border-border pb-3 mb-4">Onboarding Details</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-2.5">
                <span className="text-text-muted">Domicile State:</span>
                <span className="font-bold">{profile.state}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2.5">
                <span className="text-text-muted">Date of Birth:</span>
                <span className="font-bold">{profile.dob}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2.5">
                <span className="text-text-muted">Target Career Goal:</span>
                <span className="font-bold text-primary">{profile.goal}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2.5">
                <span className="text-text-muted">Study Dedication:</span>
                <span className="font-bold">{profile.studyHours}/Day</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2.5">
                <span className="text-text-muted">Preferred Medium:</span>
                <span className="font-bold">{profile.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Preferred Mode:</span>
                <span className="font-bold">{profile.mode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: ATS Resume Scanner Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-card border border-border p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <FileText className="w-5.5 h-5.5 text-primary" />
              <div>
                <h3 className="text-base font-extrabold text-foreground">AI Resume ATS Compatibility Scanner</h3>
                <p className="text-[0.68rem] text-text-muted mt-0.5">Evaluate keyword gaps, formatting issues, and matches with your target competitive careers.</p>
              </div>
            </div>

            {/* Form submit scan */}
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
                    placeholder="Copy-paste your complete resume content here (Education, Experience, Skills, Projects, etc.)..."
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingScan || !resumeText.trim()}
                  className="w-full btn btn-primary py-2.5 justify-center font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  {loadingScan ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>Scan Resume ATS Score</span>
                </button>
              </form>
            ) : (
              // Results dashboard
              <div className="space-y-6 animate-scale-in">
                
                {/* Score panel progress */}
                <div className="flex items-center gap-6 p-4 rounded-xl border border-border bg-background">
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center rounded-full border-4 border-primary/20 text-primary font-extrabold text-lg">
                    {scanResult.score}%
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">Overall ATS Score</h4>
                    <p className="text-[0.68rem] text-text-muted leading-normal mt-0.5">
                      Your resume has a compatibility rating of {scanResult.score}% for the &apos;{targetRole}&apos; position. Apply optimizations below to reach 90%+.
                    </p>
                  </div>
                </div>

                {/* Skills badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="bg-green-500/5 border border-green-500/10 p-3 rounded-lg">
                    <strong className="text-green-600 dark:text-green-400 block mb-2">✓ Extracted Matching Skills</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.extracted_skills.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-green-500/10 text-[0.65rem]">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                    <strong className="text-red-600 dark:text-red-400 block mb-2">⚠️ Missing High-Yield Keywords</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.missing_skills.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-[0.65rem]">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI checklist suggestions */}
                <div className="space-y-2 bg-background border border-border p-4 rounded-lg">
                  <strong className="text-xs font-bold text-foreground block mb-2">🤖 AI Recommended Modifications</strong>
                  <ul className="space-y-2.5 text-xs text-text-muted pl-1">
                    {scanResult.suggestions.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 items-start leading-relaxed font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setScanResult(null)}
                  className="w-full btn btn-secondary py-2 justify-center font-bold text-xs"
                >
                  Scan another resume
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
