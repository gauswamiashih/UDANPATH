'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Compass, GraduationCap, Map, 
  Settings, Calculator, Briefcase, Info, Rocket
} from 'lucide-react';
import { 
  MAJOR_EXAMS, STREAMS, ENGINEERING_BRANCHES, ALTERNATIVE_PATHS 
} from '@/lib/careerGuideData';
import { motion } from 'framer-motion';

export default function CareerGuide() {
  const [activeTab, setActiveTab] = useState<'exams' | 'streams' | 'engineering' | 'alternatives' | 'decision'>('exams');

  // Decision Engine State
  const [deStream, setDeStream] = useState('');
  const [deInterest, setDeInterest] = useState('');

  return (
    <div className="space-y-6 pb-20 select-none">
      
      {/* HEADER */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Indian Education & Career Guide</h1>
            <p className="text-text-muted text-sm mt-1 max-w-2xl font-semibold">
              The ultimate student journey roadmap. Map out your path from Class 12 streams to competitive exams, colleges, and your dream career.
            </p>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {[
          { id: 'exams', label: 'Major Exams', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'streams', label: 'Stream Mapping', icon: <Map className="w-4 h-4" /> },
          { id: 'engineering', label: 'Engineering Deep Dive', icon: <Settings className="w-4 h-4" /> },
          { id: 'alternatives', label: 'Alternative Paths', icon: <Rocket className="w-4 h-4" /> },
          { id: 'decision', label: 'Which Path Is Right?', icon: <Calculator className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all border ${
              activeTab === tab.id 
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                : 'bg-card text-text-muted border-border hover:bg-card-hover hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT SECTIONS */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >

        {/* 1. MAJOR EXAMS TAB */}
        {activeTab === 'exams' && (
          <div className="grid gap-4 md:grid-cols-2">
            {MAJOR_EXAMS.map((exam) => (
              <div key={exam.id} className="bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-primary group-hover:text-primary-hover transition-colors">{exam.name}</h3>
                    <p className="text-xs text-text-subtle font-bold uppercase tracking-wider">{exam.conductingBody} • {exam.level}</p>
                  </div>
                  <span className="bg-background border border-border text-text-muted px-2 py-1 rounded text-[0.65rem] font-bold">
                    {exam.difficulty}
                  </span>
                </div>
                <div className="space-y-3 text-xs font-medium text-text-muted">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong className="text-foreground">Eligibility:</strong> {exam.eligibility}</div>
                    <div><strong className="text-foreground">Age Limit:</strong> {exam.ageLimit}</div>
                  </div>
                  <div><strong className="text-foreground">Pattern:</strong> {exam.pattern}</div>
                  <div className="pt-2 border-t border-border mt-2">
                    <strong className="text-foreground text-sm block mb-1">Career Journey:</strong>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      Exam <span className="text-text-subtle">→</span> {exam.leadsTo} <span className="text-text-subtle">→</span> {exam.careerOpportunities.split(',')[0]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. STREAMS MAP TAB */}
        {activeTab === 'streams' && (
          <div className="space-y-8">
            {Object.entries(STREAMS).map(([streamName, groups]) => (
              <div key={streamName} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="bg-background px-6 py-4 border-b border-border">
                  <h2 className="text-xl font-black capitalize text-foreground">{streamName} Stream Paths</h2>
                </div>
                <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map((group, idx) => (
                    <div key={idx} className="space-y-4">
                      <div>
                        <h4 className="font-bold text-primary">{group.combo}</h4>
                        <p className="text-xs text-text-muted mt-1">{group.description}</p>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-xs space-y-2 border border-border font-medium">
                        <div><strong className="text-foreground block mb-0.5">Exams:</strong> {group.exams.join(', ')}</div>
                        <div><strong className="text-foreground block mb-0.5">Courses:</strong> {group.courses.join(', ')}</div>
                        <div><strong className="text-foreground block mb-0.5">Colleges:</strong> {group.colleges.join(', ')}</div>
                        <div><strong className="text-foreground block mb-0.5">Careers:</strong> {group.careerOptions.join(', ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. ENGINEERING TAB */}
        {activeTab === 'engineering' && (
          <div className="grid gap-4 md:grid-cols-2">
            {ENGINEERING_BRANCHES.map((branch, idx) => (
              <div key={idx} className="bg-card border border-border p-6 rounded-2xl flex flex-col">
                <h3 className="text-lg font-bold text-foreground mb-1">{branch.name}</h3>
                <p className="text-xs text-text-muted font-medium mb-4">{branch.focus}</p>
                
                <div className="grid grid-cols-2 gap-3 text-xs mb-4 flex-1">
                  <div className="bg-background rounded-lg p-2.5 border border-border">
                    <strong className="text-foreground block mb-0.5 flex items-center gap-1"><GraduationCap className="w-3 h-3"/> Skills</strong>
                    <span className="text-text-muted">{branch.skills}</span>
                  </div>
                  <div className="bg-background rounded-lg p-2.5 border border-border">
                    <strong className="text-foreground block mb-0.5 flex items-center gap-1"><Briefcase className="w-3 h-3"/> Salary</strong>
                    <span className="text-text-muted">{branch.salaryRange}</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-3 text-xs font-semibold text-primary">
                  <strong className="block mb-0.5 text-primary-hover">Career Roles:</strong> {branch.career}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. ALTERNATIVES TAB */}
        {activeTab === 'alternatives' && (
          <div className="grid gap-6 md:grid-cols-3">
            {ALTERNATIVE_PATHS.map((category, idx) => (
              <div key={idx} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-base font-black text-foreground mb-4 pb-2 border-b border-border">{category.category}</h3>
                <div className="space-y-4">
                  {category.options.map((opt, i) => (
                    <div key={i}>
                      <h4 className="text-sm font-bold text-primary">{opt.name}</h4>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">{opt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. DECISION ENGINE TAB */}
        {activeTab === 'decision' && (
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
            <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center">
              <Calculator className="w-10 h-10 text-white mx-auto mb-3" />
              <h2 className="text-2xl font-black text-white">Which Path Is Right For You?</h2>
              <p className="text-white/80 text-sm font-medium mt-1">Select your profile to get personalized recommendations</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Your Class 12 Stream</label>
                  <select 
                    value={deStream} 
                    onChange={(e) => setDeStream(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Stream...</option>
                    <option value="pcm">Science (PCM)</option>
                    <option value="pcb">Science (PCB)</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts / Humanities</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Your Primary Interest</label>
                  <select 
                    value={deInterest} 
                    onChange={(e) => setDeInterest(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Interest...</option>
                    <option value="tech">Technology & Coding</option>
                    <option value="healthcare">Healthcare & Medicine</option>
                    <option value="business">Business & Finance</option>
                    <option value="govt">Government & Admin (UPSC)</option>
                    <option value="creative">Creative & Design</option>
                  </select>
                </div>
              </div>

              {/* Recommendation Engine Result */}
              {(deStream && deInterest) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 bg-primary/10 border border-primary/20 rounded-xl p-6"
                >
                  <h3 className="text-lg font-black text-primary flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5" /> Recommendation
                  </h3>
                  
                  {deStream === 'pcm' && deInterest === 'tech' && (
                    <div className="text-sm font-medium text-foreground space-y-2">
                      <p><strong>Path:</strong> Prepare for <strong>JEE Main & Advanced</strong>.</p>
                      <p><strong>Target Course:</strong> B.Tech in Computer Science or AI/ML.</p>
                      <p><strong>Top Goal:</strong> IITs, NITs, IIITs.</p>
                    </div>
                  )}
                  {deStream === 'pcm' && deInterest === 'govt' && (
                    <div className="text-sm font-medium text-foreground space-y-2">
                      <p><strong>Path:</strong> Prepare for <strong>NDA</strong> or pursue B.Tech and prepare for <strong>UPSC CSE / GATE (PSU)</strong>.</p>
                    </div>
                  )}
                  {deStream === 'pcb' && deInterest === 'healthcare' && (
                    <div className="text-sm font-medium text-foreground space-y-2">
                      <p><strong>Path:</strong> Focus entirely on <strong>NEET UG</strong>.</p>
                      <p><strong>Target Course:</strong> MBBS or BDS.</p>
                    </div>
                  )}
                  {deStream === 'commerce' && deInterest === 'business' && (
                    <div className="text-sm font-medium text-foreground space-y-2">
                      <p><strong>Path:</strong> Pursue <strong>CA Foundation</strong> or <strong>CUET</strong> for top B.Com/BBA colleges.</p>
                      <p><strong>Future:</strong> Prepare for <strong>CAT</strong> for an MBA from IIMs.</p>
                    </div>
                  )}
                  {deStream === 'arts' && deInterest === 'govt' && (
                    <div className="text-sm font-medium text-foreground space-y-2">
                      <p><strong>Path:</strong> Pursue BA (Pol Science/History) via <strong>CUET</strong> from DU/JNU.</p>
                      <p><strong>Target Course:</strong> Start foundation preparation for <strong>UPSC CSE</strong> during graduation.</p>
                    </div>
                  )}
                  
                  {!((deStream === 'pcm' && (deInterest === 'tech' || deInterest === 'govt')) ||
                     (deStream === 'pcb' && deInterest === 'healthcare') ||
                     (deStream === 'commerce' && deInterest === 'business') ||
                     (deStream === 'arts' && deInterest === 'govt')) && (
                    <div className="text-sm font-medium text-foreground">
                      <p>This is a unique combination! We recommend exploring Interdisciplinary courses like B.Des, Integrated Law (CLAT), or BCA depending on your exact skills.</p>
                    </div>
                  )}
                </motion.div>
              )}
              {!(deStream && deInterest) && (
                <div className="mt-8 text-center text-text-muted text-sm font-medium py-8 border border-dashed border-border rounded-xl">
                  Select your stream and interest above to generate a roadmap.
                </div>
              )}
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}

// Ensure Sparkles icon works since it was missed in imports above
import { Sparkles } from 'lucide-react';
