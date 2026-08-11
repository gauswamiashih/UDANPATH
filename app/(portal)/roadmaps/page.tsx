'use client';

import React, { useState, useEffect } from 'react';
import { getExamsFromDb, getExamMilestones } from '@/lib/dbService';
import { 
  Milestone, Calendar, CheckSquare, Sparkles, 
  MapPin, Clock, Award, ChevronRight, HelpCircle
} from 'lucide-react';

export default function Roadmaps() {
  const [profile, setProfile] = useState<any>({
    fullName: 'Aspirant',
    category: 'GENERAL',
    education: 'B.Tech',
    branch: 'Computer Engineering',
    cgpa: 8.2,
  });

  const [targetExamId, setTargetExamId] = useState('');
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [exams, setExams] = useState<any[]>([]);
  const [roadmapPhases, setRoadmapPhases] = useState<any[]>([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);

  useEffect(() => {
    const loadExams = async () => {
      const dbExams = await getExamsFromDb();
      setExams(dbExams);
      if (dbExams.length > 0) {
        setTargetExamId(dbExams[0].id);
      }
    };
    loadExams();

    // Load local storage profile data
    const localProf = localStorage.getItem('udanpath_onboarding_profile');
    if (localProf) {
      setProfile(JSON.parse(localProf));
    }

    // Load checked items
    const saved = localStorage.getItem('udanpath_roadmap_checked');
    if (saved) {
      setCompletedTasks(JSON.parse(saved));
    }
  }, []);

  const handleTaskToggle = (taskKey: string, checked: boolean) => {
    const updated = { ...completedTasks, [taskKey]: checked };
    setCompletedTasks(updated);
    localStorage.setItem('udanpath_roadmap_checked', JSON.stringify(updated));
  };

  const getTierAndDuration = () => {
    const cgpa = parseFloat(profile.cgpa) || 8.0;
    let tier = "Tier 1";
    let duration = "6 Months";
    
    if (cgpa < 6.0) {
      tier = "Tier 3";
      duration = "14 Months";
    } else if (cgpa < 8.0) {
      tier = "Tier 2";
      duration = "10 Months";
    }
    return { tier, duration };
  };



  useEffect(() => {
    const fetchMilestones = async () => {
      if (!targetExamId) return;
      setIsLoadingMilestones(true);
      const selectedExam = exams.find(e => e.id === targetExamId);
      
      if (selectedExam && selectedExam.dbId) {
        const { tier } = getTierAndDuration();
        const dbPhases = await getExamMilestones(selectedExam.dbId, tier);
        
        if (dbPhases && dbPhases.length > 0) {
          setRoadmapPhases(dbPhases.map(p => ({
            id: p.id,
            name: p.phase_name,
            timeline: p.timeline,
            tasks: p.tasks || []
          })));
        } else {
          setRoadmapPhases([]);
        }
      } else {
        setRoadmapPhases([]);
      }
      setIsLoadingMilestones(false);
    };

    fetchMilestones();
  }, [targetExamId, exams, profile.cgpa]);

  const selectedExam = exams.find(e => e.id === targetExamId) || exams[0];
  const { tier, duration } = getTierAndDuration();

  if (exams.length === 0 || !selectedExam) {
    return (
      <div className="card bg-card border border-border p-12 text-center text-text-muted">
        <Milestone className="w-12 h-12 text-text-subtle mx-auto mb-3" />
        <h4 className="font-bold text-base text-foreground mb-1">Loading Roadmaps...</h4>
        <p className="text-xs">Fetching dynamic calibrating guides from UdanPath database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* Header title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Milestone className="w-8 h-8 text-primary" /> My Preparation Roadmaps
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Dynamic preparation roadmaps automatically calibrated to matches your academic tier profile.
          </p>
        </div>

        {/* Target exam selectors */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-[0.68rem] font-bold text-text-muted uppercase">Target Exam Roadmap</label>
          <select
            value={targetExamId}
            onChange={(e) => setTargetExamId(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.conductingBody} — {e.code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Status Card */}
      <div className="card bg-card border border-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[0.68rem] font-bold text-primary uppercase tracking-wider block mb-1">Target Exam Selected</span>
          <h2 className="text-lg md:text-xl font-extrabold text-foreground">{selectedExam.title}</h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Conducting: {selectedExam.conductingBody} | Level: {selectedExam.level} | Typical Salary: {selectedExam.salaryRange}
          </p>
        </div>

        <div className="flex gap-4 shrink-0">
          <div className="text-center bg-background border border-border px-4 py-2.5 rounded-xl">
            <span className="text-[0.62rem] font-bold text-text-subtle uppercase block">Academic Standings</span>
            <strong className="text-xs font-extrabold text-foreground block mt-1">{tier}</strong>
          </div>
          <div className="text-center bg-background border border-border px-4 py-2.5 rounded-xl">
            <span className="text-[0.62rem] font-bold text-text-subtle uppercase block">Prep Duration</span>
            <strong className="text-xs font-extrabold text-primary block mt-1">{duration}</strong>
          </div>
        </div>
      </div>

      {/* Roadmap phases checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Stepwise timelines (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-card border border-border p-6">
            <h3 className="text-md font-extrabold border-b border-border pb-4 mb-6">
              Milestone Checklist Planner
            </h3>

            <div className="space-y-8 relative pl-4 border-l-2 border-border/80">
              {isLoadingMilestones ? (
                <div className="text-center py-8 text-text-muted">
                  <Sparkles className="w-6 h-6 animate-pulse mx-auto mb-2 text-primary" />
                  <p className="text-xs">Generating AI milestones...</p>
                </div>
              ) : roadmapPhases.length > 0 ? (
                roadmapPhases.map((phase) => (
                  <div key={phase.id} className="relative space-y-3">
                    {/* Timeline point */}
                    <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-primary-light"></div>
                    
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <strong className="text-xs md:text-sm font-extrabold text-foreground block">{phase.name}</strong>
                      <span className="px-2.5 py-0.5 rounded bg-primary-light text-primary text-[0.68rem] font-bold">
                        ⏱️ {phase.timeline}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 pl-2">
                      {phase.tasks.map((task: string, idx: number) => {
                        const key = `${selectedExam.code}_${phase.id}_${idx}`;
                        const checked = !!completedTasks[key];
                        return (
                          <label 
                            key={idx} 
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-all text-xs font-semibold ${
                              checked 
                                ? 'bg-primary-light/30 border-primary/20 text-text-subtle' 
                                : 'bg-background border-border hover:bg-card-hover text-text-muted hover:text-foreground'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => handleTaskToggle(key, e.target.checked)}
                              className="w-4 h-4 text-primary rounded shrink-0 mt-0.5"
                            />
                            <span className={checked ? 'line-through' : ''}>{task}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-muted">
                  <p className="text-sm">No curated roadmap available for this exam yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Time blocks (Right Column) */}
        <div className="space-y-6">
          
          <div className="card bg-card border border-border p-6">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-md font-extrabold">Weekly Action Calendar</h3>
            </div>
            
            <div className="space-y-3.5">
              {[
                { day: 'Mon - Wed', task: 'Revise Core subject topics (Unit 1 & 2)' },
                { day: 'Thu - Fri', task: 'Practice quantitative aptitude exercises' },
                { day: 'Saturday', task: 'Solve 1 complete Previous Year paper' },
                { day: 'Sunday', task: 'Review weak categories & draft revision cards' }
              ].map((cal, i) => (
                <div key={i} className="p-3 bg-background border border-border rounded-lg text-xs leading-relaxed">
                  <span className="px-2 py-0.5 rounded bg-primary-light text-primary text-[0.62rem] font-bold block w-fit mb-1">{cal.day}</span>
                  <span className="font-semibold text-text-muted">{cal.task}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-card border border-border p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <h3 className="text-md font-extrabold mb-2">🤖 Topper AI Tip</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Based on your target of <strong>{selectedExam.conductingBody}</strong>, mock tests are most vital. Try attempting at least 2 papers weekly in the last 45 days.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
