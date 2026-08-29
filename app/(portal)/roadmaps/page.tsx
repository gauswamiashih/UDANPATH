'use client';

import React, { useState, useEffect } from 'react';
import { getExamsFromDb, getExamMilestones } from '@/lib/dbService';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Milestone, Calendar, Sparkles, CheckCircle2, ChevronRight, Clock
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

  const getTierAndDuration = React.useCallback(() => {
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
  }, [profile.cgpa]);

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
          // Fallback milestones if DB returns empty
          setRoadmapPhases([
            {
              id: 'fallback-1',
              name: 'Phase 1: Foundation',
              timeline: 'Weeks 1-4',
              tasks: ['Understand syllabus & exam pattern', 'Gather study materials', 'Create daily schedule']
            },
            {
              id: 'fallback-2',
              name: 'Phase 2: Core Concepts',
              timeline: 'Months 2-4',
              tasks: ['Complete foundational subjects', 'Start creating short notes', 'Solve topic-wise questions']
            },
            {
              id: 'fallback-3',
              name: 'Phase 3: Deep Dive',
              timeline: 'Months 5-6',
              tasks: ['Cover advanced topics', 'Attempt past 5 year PYQs', 'Weekly revision cycles']
            },
            {
              id: 'fallback-4',
              name: 'Phase 4: Assessment',
              timeline: 'Month 7',
              tasks: ['Attempt full length mock tests', 'Analyze weaker areas', 'Revise short notes']
            }
          ]);
        }
      } else {
        setRoadmapPhases([]);
      }
      setIsLoadingMilestones(false);
    };

    fetchMilestones();
  }, [targetExamId, exams, getTierAndDuration]);

  const selectedExam = exams.find(e => e.id === targetExamId) || exams[0];
  const { tier, duration } = getTierAndDuration();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  if (exams.length === 0 || !selectedExam) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border p-12 text-center text-text-muted rounded-2xl shadow-sm"
        >
          <Milestone className="w-12 h-12 text-primary/50 mx-auto mb-4 animate-pulse" />
          <h4 className="font-bold text-lg text-foreground mb-2">Loading Roadmaps...</h4>
          <p className="text-sm">Fetching dynamic calibrating guides from UdanPath database.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 select-none max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* Header title */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-light text-primary">
              <Milestone className="w-6 h-6" />
            </div>
            My Preparation Roadmaps
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-xl leading-relaxed">
            Dynamic preparation roadmaps automatically calibrated to match your academic tier profile.
          </p>
        </div>

        {/* Target exam selectors */}
        <div className="flex flex-col gap-2 w-full md:w-64 shrink-0">
          <label className="text-[0.7rem] font-bold text-text-muted uppercase tracking-wider">Target Exam Roadmap</label>
          <div className="relative">
            <select
              value={targetExamId}
              onChange={(e) => setTargetExamId(e.target.value)}
              className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all cursor-pointer shadow-sm"
            >
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.conductingBody} — {e.code}</option>
              ))}
            </select>
            <ChevronRight className="w-4 h-4 text-text-subtle absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Target Status Card */}
      <motion.div variants={itemVariants} className="bg-card border border-border p-6 md:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] -mr-32 -mt-32 transition-opacity group-hover:opacity-100 opacity-50"></div>
        <div className="relative z-10">
          <span className="text-[0.7rem] font-black text-primary uppercase tracking-widest block mb-2">Target Exam Selected</span>
          <h2 className="text-xl md:text-2xl font-black text-foreground">{selectedExam.title}</h2>
          <div className="flex items-center gap-3 text-xs font-semibold text-text-muted mt-3 flex-wrap">
            <span className="bg-background px-2.5 py-1 rounded-md border border-border">{selectedExam.conductingBody}</span>
            <span className="bg-background px-2.5 py-1 rounded-md border border-border">{selectedExam.level}</span>
            <span className="bg-success/10 text-success px-2.5 py-1 rounded-md border border-success/20">{selectedExam.salaryRange}</span>
          </div>
        </div>

        <div className="flex gap-4 shrink-0 w-full md:w-auto relative z-10">
          <div className="flex-1 md:flex-initial text-center bg-background border border-border px-5 py-3.5 rounded-xl shadow-inner">
            <span className="text-[0.65rem] font-bold text-text-subtle uppercase tracking-wider block">Academic Standings</span>
            <strong className="text-sm font-black text-foreground block mt-1">{tier}</strong>
          </div>
          <div className="flex-1 md:flex-initial text-center bg-primary-light border border-primary/20 px-5 py-3.5 rounded-xl shadow-inner">
            <span className="text-[0.65rem] font-bold text-primary uppercase tracking-wider block">Prep Duration</span>
            <strong className="text-sm font-black text-primary block mt-1">{duration}</strong>
          </div>
        </div>
      </motion.div>

      {/* Roadmap phases checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Stepwise timelines (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className="bg-card border border-border p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border/60 pb-5 mb-8">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-foreground">
                Milestone Checklist Planner
              </h3>
            </div>

            <div className="space-y-10 relative pl-6 border-l-2 border-border/80 ml-2">
              <AnimatePresence mode="wait">
                {isLoadingMilestones ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 text-text-muted"
                  >
                    <Sparkles className="w-8 h-8 animate-pulse mx-auto mb-3 text-primary/50" />
                    <p className="text-sm font-medium">Generating AI milestones...</p>
                  </motion.div>
                ) : roadmapPhases.length > 0 ? (
                  roadmapPhases.map((phase, phaseIdx) => (
                    <motion.div 
                      key={phase.id} 
                      className="relative space-y-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: phaseIdx * 0.1 }}
                    >
                      {/* Timeline point */}
                      <div className="absolute -left-[35px] top-1.5 w-4 h-4 rounded-full bg-primary ring-4 ring-card"></div>
                      
                      <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                        <strong className="text-sm md:text-base font-black text-foreground block">{phase.name}</strong>
                        <span className="px-3 py-1 rounded-full bg-primary-light text-primary text-[0.68rem] font-bold flex items-center gap-1.5 border border-primary/10">
                          <Clock className="w-3.5 h-3.5" /> {phase.timeline}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {phase.tasks.map((task: string, idx: number) => {
                          const key = `${selectedExam.code}_${phase.id}_${idx}`;
                          const checked = !!completedTasks[key];
                          return (
                            <label 
                              key={idx} 
                              className={cn(
                                "group flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 text-sm font-semibold",
                                checked 
                                  ? 'bg-success/5 border-success/20 text-text-subtle shadow-inner' 
                                  : 'bg-background border-border hover:bg-card-hover text-text-muted hover:text-foreground hover:shadow-sm hover:border-border/80'
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                checked ? "bg-success border-success text-white" : "border-text-subtle group-hover:border-primary"
                              )}>
                                {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                              <span className={cn("transition-all duration-200 leading-snug", checked && 'line-through opacity-70')}>{task}</span>
                            </label>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-text-muted"
                  >
                    <p className="text-sm font-medium">No curated roadmap available for this exam yet.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Daily Time blocks (Right Column) */}
        <div className="space-y-6">
          
          <motion.div variants={itemVariants} className="bg-card border border-border p-6 md:p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 border-b border-border/60 pb-5 mb-6">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-foreground">Action Calendar</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { day: 'Mon - Wed', task: 'Revise Core subject topics (Unit 1 & 2)' },
                { day: 'Thu - Fri', task: 'Practice quantitative aptitude exercises' },
                { day: 'Saturday', task: 'Solve 1 complete Previous Year paper' },
                { day: 'Sunday', task: 'Review weak categories & draft revision cards' }
              ].map((cal, i) => (
                <div key={i} className="group p-4 bg-background border border-border hover:border-primary/30 rounded-xl text-sm leading-relaxed transition-all duration-200">
                  <span className="px-2.5 py-1 rounded-md bg-background border border-border text-foreground text-[0.65rem] font-bold tracking-wider uppercase block w-fit mb-2 shadow-sm group-hover:bg-primary-light group-hover:text-primary group-hover:border-primary/20 transition-colors">{cal.day}</span>
                  <span className="font-semibold text-text-muted group-hover:text-foreground transition-colors">{cal.task}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary-light to-secondary/10 border border-primary/20 p-6 md:p-8 rounded-2xl shadow-inner relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-black text-primary">Topper AI Tip</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed font-medium relative z-10">
              Based on your target of <strong className="text-foreground">{selectedExam.conductingBody}</strong>, mock tests are most vital. Try attempting at least 2 papers weekly in the last 45 days.
            </p>
          </motion.div>

        </div>

      </div>

    </motion.div>
  );
}
