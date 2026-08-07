'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Settings, Sun, Moon, Sparkles, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsView() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>({
    fullName: 'Aspirant',
    category: 'GENERAL',
    education: 'B.Tech',
    branch: 'Computer Engineering'
  });

  useEffect(() => {
    const localProf = localStorage.getItem('udanpath_onboarding_profile');
    if (localProf) {
      setProfile(JSON.parse(localProf));
    }
  }, []);

  const handleResetOnboarding = () => {
    const confirm = window.confirm("Are you sure you want to reset your academic and reservation criteria preferences? This will restart the onboarding wizard.");
    if (confirm) {
      localStorage.removeItem('udanpath_onboarding_profile');
      router.push('/onboarding');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('udanpath_onboarding_profile');
    router.push('/');
  };

  return (
    <div className="space-y-8 select-none max-w-2xl mx-auto">
      
      {/* Header title */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" /> Platform Settings
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Configure visual layout preferences, reset goals, and adjust account access.
        </p>
      </div>

      <div className="card bg-card border border-border p-6 space-y-6">
        
        {/* Theme Settings */}
        <div className="space-y-3">
          <strong className="text-xs font-bold text-foreground uppercase tracking-wider block">Visual Application Theme</strong>
          <p className="text-xs text-text-muted leading-relaxed">
            Select light, dark or automatic system integration for visual rendering.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                theme === 'light' 
                  ? 'bg-primary-light border-primary text-primary' 
                  : 'bg-background border-border hover:bg-card-hover text-text-muted'
              }`}
            >
              <Sun className="w-4 h-4" /> Light Mode
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                theme === 'dark' 
                  ? 'bg-primary-light border-primary text-primary' 
                  : 'bg-background border-border hover:bg-card-hover text-text-muted'
              }`}
            >
              <Moon className="w-4 h-4" /> Dark Mode
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                theme === 'system' 
                  ? 'bg-primary-light border-primary text-primary' 
                  : 'bg-background border-border hover:bg-card-hover text-text-muted'
              }`}
            >
              <Sparkles className="w-4 h-4" /> System Sync
            </button>
          </div>
        </div>

        <hr className="border-border/50" />

        {/* Reset onboarding wizard preferences */}
        <div className="space-y-3">
          <strong className="text-xs font-bold text-foreground uppercase tracking-wider block">Profile Re-Onboarding</strong>
          <p className="text-xs text-text-muted leading-relaxed">
            Reset candidate age, domicile state, degree specialization, branch and reservation category metrics. This re-triggers the onboarding wizard setup on next login.
          </p>
          
          <button
            onClick={handleResetOnboarding}
            className="w-full btn btn-secondary py-2.5 justify-center font-bold text-xs flex items-center gap-1.5 border-dashed border-primary/45"
          >
            <RefreshCw className="w-4 h-4" /> Reset My Academic Standings
          </button>
        </div>

        <hr className="border-border/50" />

        {/* Sign out */}
        <div className="space-y-3">
          <strong className="text-xs font-bold text-foreground uppercase tracking-wider block">Account Logout</strong>
          <p className="text-xs text-text-muted leading-relaxed">
            Exit active user session and clear memory pointers from browser cookies.
          </p>
          
          <button
            onClick={handleSignOut}
            className="w-full btn btn-primary bg-danger text-white hover:bg-red-700 py-2.5 justify-center font-bold text-xs flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Sign Out from Account
          </button>
        </div>

      </div>

    </div>
  );
}
