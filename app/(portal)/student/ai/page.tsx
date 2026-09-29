'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, FileText, Brain, MessageSquare, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AICounselor() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 select-none">
      
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border p-8 md:p-12 rounded-3xl shadow-sm text-center relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Bot className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="px-3.5 py-1.5 rounded-full bg-primary-light text-primary text-xs font-bold border border-primary/20 inline-flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Coming Soon
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              AI Assistant & Career Advisor — Coming Soon
            </h1>
            <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto leading-relaxed font-medium">
              We are building an intelligent, profile-aware AI assistant to give you personalized exam recommendations, study timetables, and automated career counseling.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link 
              href="/student" 
              className="btn btn-primary px-6 py-3 font-bold text-sm inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Capability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-6 rounded-2xl space-y-3"
        >
          <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">Smart Career Guidance</h3>
          <p className="text-xs text-text-muted leading-relaxed font-medium">
            AI-driven analysis tailored to your specific branch, CGPA, target vacancies, and preparation timeline.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-6 rounded-2xl space-y-3"
        >
          <div className="p-3 rounded-xl bg-accent/10 text-accent w-fit">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">AI PDF Analysis & RAG — Coming Soon</h3>
          <p className="text-xs text-text-muted leading-relaxed font-medium">
            Upload exam notifications, official syllabi, or notes and ask instant questions from your documents.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border p-6 rounded-2xl space-y-3"
        >
          <div className="p-3 rounded-xl bg-success/10 text-success w-fit">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-foreground">Personal Exam Advice — Coming Soon</h3>
          <p className="text-xs text-text-muted leading-relaxed font-medium">
            Personalized strategy insights based on real historical cutoffs and aspirant preparation journeys.
          </p>
        </motion.div>

      </div>

    </div>
  );
}
