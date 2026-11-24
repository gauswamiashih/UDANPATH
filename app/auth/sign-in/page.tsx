'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

import { resolveUserRole } from '@/lib/authUtils';
import { getUserProfile } from '@/lib/dbService';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userRole = await resolveUserRole(data.user);

      if (userRole === 'admin') {
        setSuccessMsg('Signed in as Administrator! Directing to Admin Dashboard...');
        setTimeout(() => {
          router.push('/admin');
        }, 400);
      } else if (userRole === 'exam_coordinator') {
        setSuccessMsg('Signed in as Exam Coordinator! Directing to Coordinator Dashboard...');
        setTimeout(() => {
          router.push('/exam-coordinator');
        }, 400);
      } else {
        setSuccessMsg('Successfully signed in! Redirecting...');
        // Check if user has an existing profile in DB or localStorage
        let existingProfile = null;
        try {
          existingProfile = await getUserProfile(data.user.id);
        } catch {
          // Ignore error and rely on local storage fallback
        }
        const localProf = typeof window !== 'undefined' ? localStorage.getItem('udanpath_onboarding_profile') : null;

        setTimeout(() => {
          if (existingProfile || localProf) {
            if (existingProfile && !localProf && typeof window !== 'undefined') {
              localStorage.setItem('udanpath_onboarding_profile', JSON.stringify(existingProfile));
            }
            if (typeof window !== 'undefined') {
              window.location.href = '/student';
            } else {
              router.replace('/student');
            }
          } else {
            if (typeof window !== 'undefined') {
              window.location.href = '/onboarding';
            } else {
              router.replace('/onboarding');
            }
          }
        }, 200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign In failed.');
    }
  };

  const handleGuestMode = () => {
    setLoading(true);
    setSuccessMsg('Launching Guest Demo Mode with full access...');

    const guestProfile = {
      fullName: 'Gauswami Ashish (Demo Aspirant)',
      email: 'ashish.gauswami@udanpath.in',
      dob: '2002-05-15',
      gender: 'Male',
      category: 'GENERAL',
      state: 'Maharashtra',
      city: 'Pune',
      education: 'Undergraduate',
      educationLevelId: 'de8e38fd-6f5c-4032-be90-5a417a914d85',
      educationLevelName: 'Undergraduate',
      degree: 'B.Tech',
      degreeId: 'db69d405-0f06-44a7-a7b2-0dd8e978811a',
      degreeName: 'B.Tech',
      branch: 'Computer Engineering',
      branchId: '932ed610-6f5c-41fb-a242-53ffa6f3d74e',
      branchName: 'Computer Engineering',
      status: 'Completed',
      semester: 'Graduated',
      cgpa: '8.75',
      class10Marks: '92.4',
      class12Marks: '89.6',
      scienceCombo: 'PCM',
      interests: ['IT', 'Software Development', 'AI / ML', 'Cyber Security', 'Government Jobs'],
      goal: 'Software Engineer',
      goalName: 'Software Engineer',
      goalId: 'bd891511-7cc5-4548-9654-a3a3019abab1',
      preparationStatus: 'Active Preparation (6+ months)',
      studyHours: '6-8 hours/day',
      mode: 'Online + Self Study',
      language: 'English',
      targetYear: '2027',
      budget: '₹50,000 - ₹1,00,000',
      collegePreference: 'Govt & Top Tier',
      attemptedExams: 'JEE Main, GATE',
      targetColleges: 'IITs, NITs, Top Engineering Colleges',
      strongSubjects: 'Data Structures, Algorithms, Mathematics',
      weakSubjects: 'General Knowledge, Chemistry',
      isGuest: true
    };

    if (typeof window !== 'undefined') {
      // 1. Set guest cookie so server middleware (proxy.ts) permits navigation to /student!
      document.cookie = "udanpath_guest=true; path=/; max-age=86400; SameSite=Lax";

      // 2. Save rich demo profile
      localStorage.setItem('udanpath_onboarding_profile', JSON.stringify(guestProfile));

      // 3. Preload active bookmarks
      localStorage.setItem('udanpath_bookmarks', JSON.stringify(['gate-cs', 'upsc-cse', 'ssc-cgl']));

      // 4. Preload demo notifications
      const demoNotifications = [
        {
          id: 'guest-notif-1',
          type: 'match',
          title: '🎯 High Eligibility Match: GATE CS 2026',
          body: 'Based on your B.Tech in Computer Engineering (CGPA 8.75), you match 95% of GATE criteria.',
          time: 'Just now',
          read: false,
          examId: 'gate-cs',
          createdAt: new Date().toISOString()
        },
        {
          id: 'guest-notif-2',
          type: 'date',
          title: '📅 Upcoming Registration Deadline',
          body: 'UPSC Civil Services Examination 2025-26 application window is active.',
          time: '2 hours ago',
          read: false,
          examId: 'upsc-cse',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'guest-notif-3',
          type: 'info',
          title: '✨ Welcome to UdanPath Demo Mode',
          body: 'Explore your customized student dashboard, eligibility checks, AI roadmaps, and career guides.',
          time: '1 day ago',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      localStorage.setItem('udanpath_notifications', JSON.stringify(demoNotifications));
      window.dispatchEvent(new CustomEvent('udanpath_notification_updated'));

      // Guaranteed hard navigation to /student
      window.location.href = '/student';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden select-none">
      
      {/* Visual background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5 relative z-10">
        
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-primary/20 mb-3">
            U
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Welcome Back to UdanPath</h2>
          <p className="text-sm text-text-muted mt-1 text-center">
            Sign in to access your AI exam roadmap and timetable
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-bold rounded-lg">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-success/10 border border-success/25 text-success text-xs font-bold rounded-lg">
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-subtle" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@udanpath.in"
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-text-muted" htmlFor="password">
                Password
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-xs font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-subtle" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-2.5 justify-center font-bold text-sm shadow-md mt-6"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                Sign In <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Third Party Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-3 text-xs font-bold text-text-subtle uppercase">Or Quick Access</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        {/* Guest Demo Mode Button */}
        <button
          onClick={handleGuestMode}
          type="button"
          disabled={loading}
          className="w-full mb-3 border border-primary/30 bg-primary/5 hover:bg-primary/10 text-foreground flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-sm hover:border-primary/50 group"
        >
          <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span>Explore Demo (Guest Mode)</span>
          <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full border border-border bg-card hover:bg-card-hover text-foreground flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="text-center mt-6 font-semibold text-xs text-text-muted">
          New to UdanPath?{' '}
          <Link href="/auth/sign-up" className="text-primary hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
