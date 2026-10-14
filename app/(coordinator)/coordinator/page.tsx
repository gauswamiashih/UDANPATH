'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, Layers, FileText, BookMarked, GraduationCap, 
  Plus, ArrowRight, ShieldCheck, CheckCircle2, Clock, 
  Sparkles, AlertCircle
} from 'lucide-react';
import { 
  getCoordinatorData,
  ExamUpdate, SyllabusNode, ResourceItem, CuratedCourse, EligibilityRule
} from '@/lib/coordinatorService';

export default function CoordinatorOverview() {
  const [data, setData] = useState<{
    examUpdates: ExamUpdate[];
    syllabusNodes: SyllabusNode[];
    resources: ResourceItem[];
    courses: CuratedCourse[];
    eligibilityRules: EligibilityRule[];
  } | null>(null);

  const loadData = () => {
    setData(getCoordinatorData());
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card to-emerald-500/10 border border-border p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <ShieldCheck className="w-4 h-4" />
            <span>COORDINATOR OPERATIONS CONTROL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Exam Content & Operations Hub
          </h1>
          <p className="text-sm text-text-muted max-w-2xl">
            Manage live examination timelines, syllabus breakdowns, previous year papers, curated coaching batches, and dynamic eligibility policies.
          </p>
        </div>

        {/* Real-time Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-border/60">
          <Link href="/coordinator/schedules" className="bg-background/60 backdrop-blur border border-border/80 rounded-xl p-3.5 hover:border-primary/50 transition-all group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">Exam Schedules</span>
              <Calendar className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-2xl font-extrabold text-foreground block">{data.examUpdates.length}</span>
            <span className="text-[0.65rem] text-emerald-400 font-semibold">Active Cycles</span>
          </Link>

          <Link href="/coordinator/syllabus" className="bg-background/60 backdrop-blur border border-border/80 rounded-xl p-3.5 hover:border-primary/50 transition-all group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">Syllabus Trees</span>
              <Layers className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-2xl font-extrabold text-foreground block">{data.syllabusNodes.length}</span>
            <span className="text-[0.65rem] text-emerald-400 font-semibold">Configured Subjects</span>
          </Link>

          <Link href="/coordinator/pyqs" className="bg-background/60 backdrop-blur border border-border/80 rounded-xl p-3.5 hover:border-primary/50 transition-all group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">PYQ & Resources</span>
              <FileText className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-2xl font-extrabold text-foreground block">{data.resources.length}</span>
            <span className="text-[0.65rem] text-emerald-400 font-semibold">Verified Materials</span>
          </Link>

          <Link href="/coordinator/courses" className="bg-background/60 backdrop-blur border border-border/80 rounded-xl p-3.5 hover:border-primary/50 transition-all group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">Curated Batches</span>
              <BookMarked className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-2xl font-extrabold text-foreground block">{data.courses.length}</span>
            <span className="text-[0.65rem] text-emerald-400 font-semibold">Live Recommendations</span>
          </Link>

          <Link href="/coordinator/eligibility" className="bg-background/60 backdrop-blur border border-border/80 rounded-xl p-3.5 hover:border-primary/50 transition-all group col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">Eligibility Rules</span>
              <GraduationCap className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-2xl font-extrabold text-foreground block">{data.eligibilityRules.length}</span>
            <span className="text-[0.65rem] text-emerald-400 font-semibold">Active Policies</span>
          </Link>
        </div>
      </div>

      {/* Module Navigation Jump Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-foreground">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="card bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all space-y-4 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                Exam Schedules & Timelines
              </h3>
              <p className="text-xs text-text-muted">
                Maintain registration start and close deadlines, admit card releases, exam dates, and official URLs.
              </p>
            </div>
            <Link
              href="/coordinator/schedules"
              className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              <span>Manage Schedules ({data.examUpdates.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all space-y-4 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                Syllabus & Unit Hierarchy
              </h3>
              <p className="text-xs text-text-muted">
                Create structured multi-unit trees with weightage percentages and individual topic tags for student tracking.
              </p>
            </div>
            <Link
              href="/coordinator/syllabus"
              className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              <span>Manage Syllabus Trees ({data.syllabusNodes.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all space-y-4 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                Past Papers & Resources
              </h3>
              <p className="text-xs text-text-muted">
                Upload shift-wise previous question papers, verified answer solutions, and standard textbook recommendations.
              </p>
            </div>
            <Link
              href="/coordinator/pyqs"
              className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              <span>Manage Resources ({data.resources.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all space-y-4 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <BookMarked className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                Curated Batches & Courses
              </h3>
              <p className="text-xs text-text-muted">
                Publish validated coaching batches, faculty credentials, pricing, and curriculum highlights.
              </p>
            </div>
            <Link
              href="/coordinator/courses"
              className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              <span>Manage Courses ({data.courses.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="card bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all space-y-4 group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                Eligibility Engine Rules
              </h3>
              <p className="text-xs text-text-muted">
                Configure degree requirements, age limits with reservation category adjustments, and minimum aggregate percentages.
              </p>
            </div>
            <Link
              href="/coordinator/eligibility"
              className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform"
            >
              <span>Configure Rules ({data.eligibilityRules.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>Recent Academic Publishing Logs</span>
        </h3>

        <div className="divide-y divide-border/60 text-xs">
          {data.examUpdates.slice(0, 4).map((upd) => (
            <div key={upd.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <div>
                  <strong className="text-foreground block">{upd.examName}</strong>
                  <span className="text-[0.7rem] text-text-muted">
                    Exam Date set to: <strong className="text-primary">{upd.examDate}</strong> by {upd.conductingBody}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[0.68rem] px-2 py-0.5 rounded bg-background border border-border text-text-muted font-mono">
                  {upd.status}
                </span>
                <span className="text-[0.68rem] text-text-subtle">{upd.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
