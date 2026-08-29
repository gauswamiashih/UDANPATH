'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile } from '@/lib/dbService';
import { 
  User, Award, FileText, CheckCircle2, 
  Sparkles, RefreshCw, Upload, AlertCircle, Bookmark, Edit3, MapPin, GraduationCap, Target, Clock, Languages, Banknote, Dna, Activity
} from 'lucide-react';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'dna'>('overview');

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
            goal: parsed.goalName || parsed.goal,
            education: parsed.educationLevelName || parsed.education,
            branch: parsed.branchName || parsed.branch,
            degree: parsed.degreeName || parsed.degree,
            studyHours: parsed.studyHours,
            language: parsed.language,
            mode: parsed.mode,
            state: parsed.state,
            class10Marks: parsed.class10Marks,
            class12Marks: parsed.class12Marks,
            scienceCombo: parsed.scienceCombo,
            budget: parsed.budget,
            collegePreference: parsed.collegePreference
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

  const calculateCompleteness = (prof: any) => {
    let score = 0;
    if (prof.fullName) score += 10;
    if (prof.goal || prof.goalName) score += 15;
    if (prof.education || prof.educationLevelName) score += 15;
    if (prof.city || prof.state) score += 10;
    if (prof.class10Marks) score += 10;
    if (prof.class12Marks) score += 10;
    if (prof.stream || prof.streamName) score += 10;
    if (prof.budget) score += 10;
    if (prof.collegePreference) score += 10;
    return Math.min(100, score);
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

  const completeness = profile.completeness || calculateCompleteness(profile);

  // Dynamic DNA Calculation
  const getDynamicDNA = () => {
    let aptitudeScore = 70; // baseline
    if (profile.class12Marks) aptitudeScore = Math.min(100, (parseFloat(profile.class12Marks) * 0.8) + 15);
    else if (profile.class10Marks) aptitudeScore = Math.min(100, (parseFloat(profile.class10Marks) * 0.8) + 10);
    else if (profile.cgpa) aptitudeScore = Math.min(100, (parseFloat(profile.cgpa) * 10) - 5);

    let learningStyle = 'Visual / Practical';
    if (profile.mode === 'Self Study') learningStyle = 'Independent / Text-based';
    if (profile.mode === 'Offline Coaching') learningStyle = 'Structured / Auditory';
    if (profile.studyHours === '8+ Hours') learningStyle += ' (Intensive)';

    let careerAlignment = 'Moderate';
    if (profile.goal && profile.preparationStatus === 'Exam Ready') careerAlignment = 'Very Strong';
    else if (profile.goal && profile.preparationStatus !== 'Not Started') careerAlignment = 'Strong';

    const strengths = [];
    if (aptitudeScore > 85) strengths.push('High academic percentile indicating strong fundamentals.');
    if (profile.studyHours === '6-8 Hours' || profile.studyHours === '8+ Hours') strengths.push('High dedication and study stamina.');
    if (profile.scienceCombo === 'PCMB') strengths.push('Versatile science background (Maths & Bio).');
    if (profile.preparationStatus === 'Exam Ready') strengths.push('Fully prepared for upcoming target exams.');
    if (strengths.length === 0) strengths.push('Building foundational knowledge.');

    const weaknesses = [];
    if (aptitudeScore < 60) weaknesses.push('Academic fundamentals may require extra revision.');
    if (profile.studyHours === '< 1 Hour') weaknesses.push('Study hours might be insufficient for competitive exams.');
    if (profile.budget === 'Low' && profile.collegePreference === 'Private Only') weaknesses.push('Budget constraints contradict private college preference.');
    if (profile.preparationStatus === 'Not Started') weaknesses.push('Preparation has not officially started.');
    if (weaknesses.length === 0) weaknesses.push('No major structural weaknesses detected.');

    return {
      aptitudeScore: Math.round(aptitudeScore),
      learningStyle,
      careerAlignment,
      inferredStrengths: strengths,
      inferredWeaknesses: weaknesses
    };
  };

  const dna = profile.aptitudeScore ? profile : { ...profile, ...getDynamicDNA() };

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

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-foreground'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('dna')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'dna' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-foreground'}`}
        >
          <Dna className="w-4 h-4" /> Student DNA
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          
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
              {profile.scienceCombo && (
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-text-muted">Science Stream:</span>
                  <span className="font-bold">{profile.scienceCombo}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-text-muted">Class 10 / 12 %:</span>
                <span className="font-bold">{profile.class10Marks || '—'} / {profile.class12Marks || '—'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-text-muted flex items-center gap-1"><Award className="w-3 h-3" /> CGPA/Aggregate:</span>
                <span className="font-bold">{profile.cgpa ? `${profile.cgpa}` : '—'}</span>
              </div>
            </div>
          </div>

          {/* Study Preferences & Budget */}
          <div className="card bg-card border border-border p-5 relative">
            <div className="absolute top-4 right-4 cursor-pointer text-primary hover:text-primary-hover" onClick={() => router.push('/onboarding')} title="Edit Preferences">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold border-b border-border pb-3 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" /> Preferences & Budget
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-text-muted">Study Dedication:</span>
                <span className="font-bold">{profile.studyHours || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-text-muted">College Preference:</span>
                <span className="font-bold">{profile.collegePreference || '—'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-text-muted flex items-center gap-1"><Banknote className="w-3 h-3" /> Est. Budget:</span>
                <span className="font-bold">{profile.budget || '—'}</span>
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
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Student DNA Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-card border border-border p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Aptitude Score</h3>
              <div className="text-3xl font-extrabold text-foreground">
                {dna.aptitudeScore}<span className="text-lg text-text-muted font-normal">/100</span>
              </div>
              <p className="text-xs text-text-subtle">Based on your academic performance and reported interests.</p>
            </div>
            
            <div className="card bg-card border border-border p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto text-secondary">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Learning Style</h3>
              <div className="text-xl font-extrabold text-foreground">
                {dna.learningStyle}
              </div>
              <p className="text-xs text-text-subtle">Inferred from your preparation mode and study hours.</p>
            </div>

            <div className="card bg-card border border-border p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Career Alignment</h3>
              <div className="text-xl font-extrabold text-foreground">
                {dna.careerAlignment}
              </div>
              <p className="text-xs text-text-subtle">Your current path matches your skills and budget well.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase">
                <CheckCircle2 className="w-4 h-4" /> AI-Inferred Strengths
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                {dna.inferredStrengths.map((s: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2 uppercase">
                <AlertCircle className="w-4 h-4" /> Areas for Improvement
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                {dna.inferredWeaknesses.map((s: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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
                <h4 className="text-sm font-extrabold">Match Score for &apos;{targetRole}&apos;</h4>
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
