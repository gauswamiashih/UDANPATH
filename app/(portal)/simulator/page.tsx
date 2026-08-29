'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile, getExamsFromDb } from '@/lib/dbService';
import { calculateAdvancedMatchScore } from '@/lib/eligibilityEngine';
import { simulateWhatIfScenario } from '@/lib/matchmakingEngine';
import { Activity, Sparkles, SlidersHorizontal, RefreshCcw, ArrowRight, TrendingDown, Target, Building2, BookOpen } from 'lucide-react';

export default function SimulatorPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Simulation State
  const [activeScenario, setActiveScenario] = useState('Current Plan');
  const [simulatedProfile, setSimulatedProfile] = useState<any>(null);
  const [simulatedExams, setSimulatedExams] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const dbExams = await getExamsFromDb();
      setExams(dbExams);

      let loadedProf = null;
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        loadedProf = await getUserProfile(session.user.id);
      }
      if (!loadedProf) {
        const local = localStorage.getItem('udanpath_onboarding_profile');
        if (local) loadedProf = JSON.parse(local);
      }

      if (loadedProf) {
        setProfile(loadedProf);
        setSimulatedProfile(loadedProf);
        runEngine(loadedProf, dbExams);
      }
      setLoading(false);
    };
    init();
  }, []);

  const runEngine = (prof: any, allExams: any[]) => {
    const scoredExams = allExams.map((exam) => {
      const evaluation = calculateAdvancedMatchScore(exam, prof);
      return {
        ...exam,
        matchScore: evaluation.matchScore,
        matchLevel: evaluation.status,
        matchingReason: evaluation.reason
      };
    }).filter(e => e.matchLevel !== 'Not Eligible');
    
    scoredExams.sort((a, b) => b.matchScore - a.matchScore);
    setSimulatedExams(scoredExams);
  };

  const handleScenarioChange = (scenario: string) => {
    setActiveScenario(scenario);
    if (scenario === 'Current Plan') {
      setSimulatedProfile(profile);
      runEngine(profile, exams);
      return;
    }

    const modified = simulateWhatIfScenario(scenario, profile);
    setSimulatedProfile(modified);
    runEngine(modified, exams);
  };

  const scenarios = [
    { name: 'Current Plan', icon: <Target className="w-4 h-4" /> },
    { name: 'Fail JEE', icon: <TrendingDown className="w-4 h-4 text-red-500" /> },
    { name: 'Score 85% in Boards', icon: <Activity className="w-4 h-4 text-emerald-500" /> },
    { name: 'Budget is Low', icon: <Activity className="w-4 h-4 text-amber-500" /> },
    { name: 'Switch to PCB', icon: <RefreshCcw className="w-4 h-4 text-blue-500" /> },
  ];

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading simulator...</div>;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">No Profile Found</h2>
        <p className="text-sm text-text-muted">Set up your profile to use the What-If Simulator.</p>
        <button onClick={() => router.push('/onboarding')} className="btn btn-primary px-6 py-2">
          Start Onboarding
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Activity className="w-7 h-7 text-primary" />
            What-If Simulator <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[0.6rem] uppercase tracking-wider font-extrabold align-middle">Beta</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Test Plan B and Plan C scenarios to see how your career roadmap shifts instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Column: Scenarios */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider flex items-center gap-2 mb-4">
            <SlidersHorizontal className="w-4 h-4" /> Toggle Scenarios
          </h3>
          <div className="space-y-2">
            {scenarios.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleScenarioChange(s.name)}
                className={`w-full text-left px-4 py-3 rounded-xl border flex items-center gap-3 transition-all ${
                  activeScenario === s.name 
                    ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20' 
                    : 'bg-card border-border hover:border-primary/40'
                }`}
              >
                {s.icon}
                <span className={`text-sm font-bold ${activeScenario === s.name ? 'text-primary' : 'text-foreground'}`}>
                  {s.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Simulated Output */}
        <div className="md:col-span-3 space-y-6">
          <div className="card bg-card border border-border p-6 shadow-sm relative overflow-hidden">
            {activeScenario !== 'Current Plan' && (
              <div className="absolute top-0 right-0 bg-warning/10 text-warning px-4 py-1 rounded-bl-xl border-l border-b border-warning/20 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Simulated View
              </div>
            )}
            
            <h3 className="text-lg font-extrabold mb-4">Simulated Profile Snapshot</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-background border border-border rounded-lg text-center">
                <span className="block text-[0.65rem] text-text-muted uppercase font-bold mb-1">Stream</span>
                <span className="text-sm font-extrabold">{simulatedProfile.streamName || 'Science'}</span>
                <span className="block text-xs text-text-muted">{simulatedProfile.scienceCombo || '—'}</span>
              </div>
              
              <div className="p-3 bg-background border border-border rounded-lg text-center">
                <span className="block text-[0.65rem] text-text-muted uppercase font-bold mb-1">Target Goal</span>
                <span className="text-sm font-extrabold">{simulatedProfile.goalName || simulatedProfile.goal || '—'}</span>
              </div>
              
              <div className="p-3 bg-background border border-border rounded-lg text-center">
                <span className="block text-[0.65rem] text-text-muted uppercase font-bold mb-1">Expected Rank</span>
                <span className="text-sm font-extrabold">{simulatedProfile.rank === 999999 ? 'Low / DNQ' : (simulatedProfile.rank || 'Top 1000')}</span>
              </div>

              <div className="p-3 bg-background border border-border rounded-lg text-center">
                <span className="block text-[0.65rem] text-text-muted uppercase font-bold mb-1">Budget</span>
                <span className="text-sm font-extrabold text-amber-500">{simulatedProfile.budget || 'Standard'}</span>
              </div>
            </div>
          </div>

          <div className="card bg-card border border-border p-6 shadow-sm">
            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Shifted Exam Recommendations
            </h3>
            
            <div className="space-y-4">
              {simulatedExams.slice(0, 3).map(exam => (
                <div key={exam.id} className="p-4 bg-background border border-border rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-primary/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-md">{exam.name} <span className="text-text-muted text-xs font-normal">({exam.short_name})</span></h4>
                      <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${
                        exam.matchScore >= 80 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {exam.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-xs text-text-muted max-w-md leading-relaxed line-clamp-2">
                      {exam.matchingReason}
                    </p>
                  </div>
                  <button onClick={() => router.push(`/exams/${exam.id}`)} className="shrink-0 btn btn-secondary text-xs py-1.5 px-4 font-bold flex items-center gap-1">
                    Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {simulatedExams.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">No eligible exams for this scenario.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
