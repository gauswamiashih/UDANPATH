'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getUserProfile, getExamsFromDb } from '@/lib/dbService';
import { calculateAdvancedMatchScore } from '@/lib/eligibilityEngine';
import { simulateWhatIfScenario } from '@/lib/matchmakingEngine';
import { Activity, Sparkles, SlidersHorizontal, RefreshCcw, ArrowRight, TrendingDown, Target, Building2, BookOpen, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SimulatorPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Simulation State
  const [activeScenario, setActiveScenario] = useState('Current Plan');
  const [simulatedProfile, setSimulatedProfile] = useState<any>(null);
  const [simulatedExams, setSimulatedExams] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const runEngine = useCallback((prof: any, allExams: any[]) => {
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
  }, []);

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
  }, [runEngine]);

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
    { name: 'Current Plan', icon: Target, color: 'text-primary' },
    { name: 'Fail JEE', icon: TrendingDown, color: 'text-[#EF4444]' },
    { name: 'Score 85% in Boards', icon: Activity, color: 'text-[#10B981]' },
    { name: 'Budget is Low', icon: Zap, color: 'text-[#F59E0B]' },
    { name: 'Switch to PCB', icon: RefreshCcw, color: 'text-[#3B82F6]' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
        <p className="text-[0.8rem] font-bold text-[#64748B] uppercase tracking-widest">Loading Engine...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-6">
          <Target className="w-8 h-8 text-[#94A3B8]" />
        </div>
        <h2 className="text-[1.5rem] font-extrabold text-[#0F172A] mb-2">No Profile Found</h2>
        <p className="text-[0.95rem] font-medium text-[#64748B] mb-8">Set up your Student DNA to use the What-If Simulator and discover your career paths.</p>
        <Button asChild variant="primary" className="h-11 px-8 rounded-full font-bold">
          <Link href="/onboarding">Start Onboarding &rarr;</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-10 select-none pb-20 pt-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#E2E8F0] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#F5F3FF] border border-[#E2E8F0] rounded mb-3 text-[0.65rem] font-extrabold text-primary uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" /> What-If Simulator (Beta)
          </div>
          <h1 className="text-[clamp(2rem,3vw,2.5rem)] font-extrabold tracking-tight text-[#0F172A] leading-none mb-3">
            Simulate your future.
          </h1>
          <p className="text-[0.95rem] font-medium text-[#64748B] max-w-2xl">
            Test Plan B and Plan C scenarios instantly to see how your career roadmap shifts when conditions change.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Scenarios */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-[#FCFCFF] rounded-2xl border border-[#E2E8F0] p-6 shadow-[0_4px_20px_rgba(11,16,32,0.02)] sticky top-[100px]">
            <h3 className="text-[0.7rem] font-extrabold text-[#94A3B8] uppercase tracking-widest flex items-center gap-2 mb-6">
              <SlidersHorizontal className="w-4 h-4" /> Toggle Scenarios
            </h3>
            <div className="space-y-3">
              {scenarios.map((s, idx) => {
                const isActive = activeScenario === s.name;
                const Icon = s.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleScenarioChange(s.name)}
                    className={cn(
                      "w-full text-left px-4 py-3.5 rounded-xl border flex items-center justify-between transition-all group",
                      isActive 
                        ? "bg-[#0F172A] border-[#0F172A] shadow-lg" 
                        : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", 
                        isActive ? "bg-white/10" : "bg-[#F1F5F9] group-hover:bg-white"
                      )}>
                        <Icon className={cn("w-4 h-4", isActive ? "text-white" : s.color)} />
                      </div>
                      <span className={cn("text-[0.85rem] font-bold", isActive ? "text-white" : "text-[#0F172A]")}>
                        {s.name}
                      </span>
                    </div>
                    {isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
              <p className="text-[0.7rem] font-medium text-[#64748B] leading-relaxed">
                <strong className="text-[#0F172A]">How it works:</strong> The engine modifies your simulated DNA parameters (like rank or budget) and instantly re-calculates all eligible exams and pathways.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Output */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          
          {/* Snapshot Board */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-[0_4px_20px_rgba(11,16,32,0.02)] relative overflow-hidden">
            {activeScenario !== 'Current Plan' && (
              <div className="absolute top-0 right-0 bg-[#FFFBEB] text-[#F59E0B] px-4 py-2 rounded-bl-2xl font-extrabold text-[0.7rem] uppercase tracking-widest flex items-center gap-1.5 border-b border-l border-[#FDE68A]">
                <Sparkles className="w-3.5 h-3.5" /> Simulated Reality
              </div>
            )}
            
            <h3 className="text-[1.2rem] font-extrabold text-[#0F172A] mb-8">Simulated Profile DNA</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors cursor-default">
                <span className="text-[0.65rem] text-[#64748B] uppercase font-extrabold tracking-widest mb-1.5">Stream</span>
                <span className="text-[0.95rem] font-extrabold text-[#0F172A]">{simulatedProfile.streamName || 'Science'}</span>
                <span className="text-[0.7rem] font-medium text-[#64748B] mt-0.5">{simulatedProfile.scienceCombo || '—'}</span>
              </div>
              
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors cursor-default">
                <span className="text-[0.65rem] text-[#64748B] uppercase font-extrabold tracking-widest mb-1.5">Target Goal</span>
                <span className="text-[0.95rem] font-extrabold text-[#0F172A]">{simulatedProfile.goalName || simulatedProfile.goal || '—'}</span>
              </div>
              
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors cursor-default">
                <span className="text-[0.65rem] text-[#64748B] uppercase font-extrabold tracking-widest mb-1.5">Expected Rank</span>
                <span className={cn("text-[0.95rem] font-extrabold", simulatedProfile.rank === 999999 ? "text-[#EF4444]" : "text-[#0F172A]")}>
                  {simulatedProfile.rank === 999999 ? 'Low / DNQ' : (simulatedProfile.rank || 'Top 1000')}
                </span>
              </div>

              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors cursor-default">
                <span className="text-[0.65rem] text-[#64748B] uppercase font-extrabold tracking-widest mb-1.5">Budget</span>
                <span className={cn("text-[0.95rem] font-extrabold", simulatedProfile.budget === 'low' ? "text-[#F59E0B]" : "text-[#0F172A]")}>
                  {simulatedProfile.budget || 'Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* New Opportunities */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center text-primary">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-[1.2rem] font-extrabold text-[#0F172A]">Shifted Exam Landscape</h3>
            </div>
            
            <div className="space-y-4">
              {simulatedExams.slice(0, 4).map(exam => (
                <div key={exam.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 md:p-6 shadow-[0_4px_20px_rgba(11,16,32,0.02)] flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-primary/30 hover:shadow-md transition-all">
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-extrabold text-[1.1rem] text-[#0F172A] leading-tight">
                        {exam.name}
                      </h4>
                      <span className={cn("px-2.5 py-1 rounded text-[0.65rem] font-extrabold uppercase tracking-wider",
                        exam.matchScore >= 80 ? "bg-[#ECFDF5] text-[#10B981]" : "bg-[#FFFBEB] text-[#F59E0B]"
                      )}>
                        {exam.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-[0.85rem] font-medium text-[#64748B] leading-relaxed max-w-2xl">
                      {exam.matchingReason}
                    </p>
                  </div>

                  <div className="w-full md:w-auto shrink-0 border-t border-[#F1F5F9] md:border-t-0 pt-4 md:pt-0">
                    <Button asChild variant="outline" className="w-full md:w-auto h-10 rounded-xl font-bold text-[0.8rem] border-[#E2E8F0] hover:bg-[#F8FAFC]">
                      <Link href={`/exams/${exam.id}`}>Examine Path &rarr;</Link>
                    </Button>
                  </div>
                </div>
              ))}

              {simulatedExams.length === 0 && (
                <div className="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-2xl p-12 text-center flex flex-col items-center">
                  <TrendingDown className="w-10 h-10 text-[#94A3B8] mb-4" />
                  <p className="text-[1rem] font-extrabold text-[#0F172A]">No eligible exams for this scenario.</p>
                  <p className="text-[0.85rem] font-medium text-[#64748B] mt-1">This specific combination limits traditional pathways.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
