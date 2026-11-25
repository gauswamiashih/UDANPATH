'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MOCK_EXAMS_COLLECTION, 
  MockExam, 
  MockQuestion 
} from '@/lib/mockTestData';
import { 
  Clock, CheckCircle, XCircle, AlertTriangle, Play, Award, 
  RotateCcw, ArrowLeft, ArrowRight, Bookmark, HelpCircle, 
  BarChart3, Brain, Sparkles, Check, ChevronRight, Eye, ShieldCheck
} from 'lucide-react';

type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_marked';

export default function MockTestSimulatorPage() {
  const [selectedExam, setSelectedExam] = useState<MockExam>(MOCK_EXAMS_COLLECTION[0]);
  const [testActive, setTestActive] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);

  // Active Test State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState(false);

  // Student Profile for CBT candidate header
  const [candidateName, setCandidateName] = useState('Gauswami Ashish');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('udanpath_onboarding_profile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.fullName) setCandidateName(parsed.fullName);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Submit Test
  const handleSubmitTest = () => {
    setShowSubmitModal(false);
    setTestSubmitted(true);
    setTestActive(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testActive && !testSubmitted && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testActive, testSubmitted, secondsRemaining]);

  // Start Exam
  const handleStartExam = (exam: MockExam) => {
    setSelectedExam(exam);
    setCurrentQIndex(0);
    setCurrentSection(exam.sections[0] || '');
    setUserAnswers({});
    
    // Initialize question statuses: Question 1 is 'not_answered', others are 'not_visited'
    const initialStatuses: Record<string, QuestionStatus> = {};
    exam.questions.forEach((q, idx) => {
      initialStatuses[q.id] = idx === 0 ? 'not_answered' : 'not_visited';
    });
    setQuestionStatuses(initialStatuses);

    setSecondsRemaining(exam.durationMinutes * 60);
    setTestSubmitted(false);
    setTestActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Jump to specific Question
  const handleNavigateQuestion = (index: number) => {
    const targetQ = selectedExam.questions[index];
    if (!targetQ) return;

    // If current question was not_visited, mark as not_answered
    setQuestionStatuses(prev => {
      const currQ = selectedExam.questions[currentQIndex];
      const prevStatus = prev[currQ.id];
      if (prevStatus === 'not_visited' || !userAnswers[currQ.id]) {
        if (prevStatus !== 'marked_for_review') {
          return { ...prev, [currQ.id]: 'not_answered', [targetQ.id]: prev[targetQ.id] === 'not_visited' ? 'not_answered' : prev[targetQ.id] };
        }
      }
      return { ...prev, [targetQ.id]: prev[targetQ.id] === 'not_visited' ? 'not_answered' : prev[targetQ.id] };
    });

    setCurrentQIndex(index);
    if (targetQ.section !== currentSection) {
      setCurrentSection(targetQ.section);
    }
  };

  // Select Option
  const handleSelectOption = (optIndex: number) => {
    const currentQ = selectedExam.questions[currentQIndex];
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: optIndex }));
  };

  // Save & Next
  const handleSaveAndNext = () => {
    const currentQ = selectedExam.questions[currentQIndex];
    const isAnswered = userAnswers[currentQ.id] !== undefined;

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQ.id]: isAnswered ? 'answered' : 'not_answered'
    }));

    if (currentQIndex < selectedExam.questions.length - 1) {
      handleNavigateQuestion(currentQIndex + 1);
    }
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    const currentQ = selectedExam.questions[currentQIndex];
    const isAnswered = userAnswers[currentQ.id] !== undefined;

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQ.id]: isAnswered ? 'answered_marked' : 'marked_for_review'
    }));

    if (currentQIndex < selectedExam.questions.length - 1) {
      handleNavigateQuestion(currentQIndex + 1);
    }
  };

  // Clear Response
  const handleClearResponse = () => {
    const currentQ = selectedExam.questions[currentQIndex];
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });

    setQuestionStatuses(prev => ({
      ...prev,
      [currentQ.id]: 'not_answered'
    }));
  };


  // Format Seconds
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Compute Results Scorecard
  const computeScorecard = () => {
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let negativeDeducted = 0;

    selectedExam.questions.forEach(q => {
      const chosen = userAnswers[q.id];
      if (chosen === undefined) {
        unattemptedCount++;
      } else if (chosen === q.correctAnswer) {
        score += q.marks;
        correctCount++;
      } else {
        score -= q.negativeMarks;
        negativeDeducted += q.negativeMarks;
        incorrectCount++;
      }
    });

    const finalScore = Math.max(0, Math.round(score * 100) / 100);
    const accuracy = correctCount + incorrectCount > 0 
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
      : 0;

    return {
      finalScore,
      correctCount,
      incorrectCount,
      unattemptedCount,
      negativeDeducted: Math.round(negativeDeducted * 100) / 100,
      accuracy,
      totalPossible: selectedExam.totalMarks
    };
  };

  // Status Counts for Legend
  const getStatusCounts = () => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let answeredMarked = 0;
    let notVisited = 0;

    selectedExam.questions.forEach(q => {
      const st = questionStatuses[q.id] || 'not_visited';
      if (st === 'answered') answered++;
      else if (st === 'not_answered') notAnswered++;
      else if (st === 'marked_for_review') marked++;
      else if (st === 'answered_marked') answeredMarked++;
      else notVisited++;
    });

    return { answered, notAnswered, marked, answeredMarked, notVisited };
  };

  const statusCounts = getStatusCounts();
  const currentQ = selectedExam.questions[currentQIndex];

  // Helper for Palette Status colors
  const getPaletteBg = (st: QuestionStatus, isCurrent: boolean) => {
    if (isCurrent) return 'ring-2 ring-primary ring-offset-2 ring-offset-background font-black scale-105';
    switch (st) {
      case 'answered':
        return 'bg-emerald-600 text-white font-bold';
      case 'not_answered':
        return 'bg-red-600 text-white font-bold';
      case 'marked_for_review':
        return 'bg-purple-600 text-white font-bold rounded-full';
      case 'answered_marked':
        return 'bg-purple-700 text-white font-bold relative after:content-["✓"] after:text-[0.6rem] after:text-emerald-300 after:absolute after:bottom-0 after:right-1';
      default:
        return 'bg-card border border-border text-text-muted hover:border-primary/50';
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-12">
      
      {/* ======================================================== */}
      {/* STATE 1: SELECTION SCREEN (BEFORE TEST) */}
      {/* ======================================================== */}
      {!testActive && !testSubmitted && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary/15 via-secondary/10 to-transparent border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Official Exam Simulation
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                AI CBT Mock Test Simulator
              </h1>
              <p className="text-xs md:text-sm text-text-muted mt-2 max-w-2xl leading-relaxed">
                Experience realistic computer-based tests designed according to the actual TCS iON and NTA examination patterns with negative marking and instant AI performance evaluation.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                CBT
              </div>
              <div>
                <span className="text-[0.7rem] text-text-subtle font-extrabold uppercase block">Aspirant Mode</span>
                <strong className="text-sm font-bold text-foreground block">{candidateName}</strong>
                <span className="text-xs text-emerald-400 font-semibold">Ready for Test Session</span>
              </div>
            </div>
          </div>

          {/* Available Mock Tests Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> Choose Your Targeted CBT Mock
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_EXAMS_COLLECTION.map(exam => {
                const isSelected = selectedExam.id === exam.id;
                return (
                  <div 
                    key={exam.id}
                    onClick={() => setSelectedExam(exam)}
                    className={`card p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md' 
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[0.68rem] bg-secondary/10 text-secondary font-bold">
                          {exam.category}
                        </span>
                        <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" /> {exam.durationMinutes} Mins
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-foreground leading-snug">
                        {exam.title}
                      </h3>
                      
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {exam.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                        <div className="bg-background/60 p-2 rounded-lg border border-border/50 text-center">
                          <span className="text-[0.65rem] text-text-subtle uppercase block">Questions</span>
                          <strong className="font-bold text-foreground">{exam.totalQuestions} MCQs</strong>
                        </div>
                        <div className="bg-background/60 p-2 rounded-lg border border-border/50 text-center">
                          <span className="text-[0.65rem] text-text-subtle uppercase block">Max Marks</span>
                          <strong className="font-bold text-primary">{exam.totalMarks} Pts</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartExam(exam);
                      }}
                      className="w-full btn btn-primary py-2.5 mt-5 font-bold text-xs justify-center flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Start This Test Now
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Guidelines & Color Legend Guide */}
          <div className="card bg-card border border-border p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Official CBT Interface Guidelines & Legend
            </h3>
            <p className="text-xs text-text-muted">
              The question palette on the right side of the test interface will display the status of each question using the exact standard color-coded system:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background">
                <span className="w-7 h-7 rounded bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0">1</span>
                <div>
                  <strong className="text-foreground block text-[0.72rem]">Answered</strong>
                  <span className="text-[0.65rem] text-text-subtle">Recorded</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background">
                <span className="w-7 h-7 rounded bg-red-600 text-white font-black flex items-center justify-center text-xs shrink-0">2</span>
                <div>
                  <strong className="text-foreground block text-[0.72rem]">Not Answered</strong>
                  <span className="text-[0.65rem] text-text-subtle">Visited</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background">
                <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-black flex items-center justify-center text-xs shrink-0">3</span>
                <div>
                  <strong className="text-foreground block text-[0.72rem]">Review</strong>
                  <span className="text-[0.65rem] text-text-subtle">Unanswered</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background">
                <span className="w-7 h-7 rounded bg-card border border-border text-text-muted font-bold flex items-center justify-center text-xs shrink-0">4</span>
                <div>
                  <strong className="text-foreground block text-[0.72rem]">Not Visited</strong>
                  <span className="text-[0.65rem] text-text-subtle">Remaining</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background">
                <span className="w-7 h-7 rounded bg-purple-700 text-emerald-300 font-black flex items-center justify-center text-xs shrink-0">5✓</span>
                <div>
                  <strong className="text-foreground block text-[0.72rem]">Answered & Review</strong>
                  <span className="text-[0.65rem] text-text-subtle">Will be evaluated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STATE 2: ACTIVE CBT EXAMINATION INTERFACE */}
      {/* ======================================================== */}
      {testActive && !testSubmitted && currentQ && (
        <div className="space-y-4">
          
          {/* Top Exam Status Bar */}
          <div className="bg-card border border-border p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-primary text-white font-bold text-xs uppercase tracking-wider">
                {selectedExam.shortName}
              </span>
              <span className="text-xs text-text-muted hidden sm:inline">Candidate: <strong className="text-foreground">{candidateName}</strong></span>
            </div>

            {/* Live Countdown Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
              secondsRemaining < 120 
                ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse' 
                : 'bg-primary/10 border-primary/20 text-primary'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Time Left: {formatTime(secondsRemaining)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuestionPaperModal(true)}
                className="btn bg-background border border-border hover:bg-card-hover px-3 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:text-foreground cursor-pointer"
              >
                Question Paper
              </button>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="btn btn-primary px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Section Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-border pb-1">
            {selectedExam.sections.map(sec => {
              const isCurrent = currentSection === sec;
              return (
                <button
                  key={sec}
                  onClick={() => {
                    setCurrentSection(sec);
                    const firstIdxInSec = selectedExam.questions.findIndex(q => q.section === sec);
                    if (firstIdxInSec >= 0) handleNavigateQuestion(firstIdxInSec);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCurrent 
                      ? 'bg-primary text-white shadow-xs' 
                      : 'bg-card text-text-muted hover:bg-card-hover border border-border'
                  }`}
                >
                  Section: {sec}
                </button>
              );
            })}
          </div>

          {/* Main 2-Column CBT Split (Question on Left, Palette on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Left 3 Columns: Active Question Card */}
            <div className="lg:col-span-3 space-y-4">
              <div className="card bg-card border border-border p-6 rounded-2xl space-y-6 shadow-sm min-h-[460px] flex flex-col justify-between">
                
                {/* Question Header & Marks Badge */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-border">
                    <span className="text-sm font-extrabold text-foreground">
                      Question No. {currentQIndex + 1} of {selectedExam.totalQuestions}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +{currentQ.marks} Marks
                      </span>
                      <span className="text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        -{currentQ.negativeMarks} Negative
                      </span>
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="space-y-3">
                    <p className="text-sm md:text-base font-semibold text-foreground leading-relaxed">
                      {currentQ.question}
                    </p>

                    {currentQ.codeSnippet && (
                      <pre className="p-4 rounded-xl bg-background border border-border font-mono text-xs text-primary overflow-x-auto">
                        {currentQ.codeSnippet}
                      </pre>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const isChosen = userAnswers[currentQ.id] === optIdx;
                      return (
                        <label
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isChosen
                              ? 'bg-primary/10 border-primary ring-2 ring-primary/20 text-foreground font-bold'
                              : 'bg-background hover:bg-card-hover border-border text-text-muted hover:text-foreground font-medium'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQ.id}`}
                            checked={isChosen}
                            onChange={() => handleSelectOption(optIdx)}
                            className="text-primary focus:ring-0 cursor-pointer"
                          />
                          <span className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center text-xs font-bold text-text-subtle shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-xs md:text-sm">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <button
                      onClick={handleMarkForReviewAndNext}
                      className="btn bg-purple-600/10 border border-purple-500/30 text-purple-400 hover:bg-purple-600/20 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Mark for Review & Next
                    </button>
                    <button
                      onClick={handleClearResponse}
                      className="btn bg-background border border-border hover:bg-card-hover px-3.5 py-2 rounded-lg text-xs font-bold text-text-muted cursor-pointer"
                    >
                      Clear Response
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentQIndex === 0}
                      onClick={() => handleNavigateQuestion(currentQIndex - 1)}
                      className="btn bg-background border border-border hover:bg-card-hover disabled:opacity-40 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleSaveAndNext}
                      className="btn btn-primary px-5 py-2 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Save & Next
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right 1 Column: TCS iON Style Question Palette */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card bg-card border border-border p-5 rounded-2xl space-y-5 shadow-sm">
                
                {/* Palette Legend Counters */}
                <div className="space-y-2 border-b border-border pb-4">
                  <h4 className="text-xs font-extrabold uppercase text-text-muted tracking-wider">
                    Question Palette Summary
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-emerald-600 text-white font-bold text-[0.65rem] flex items-center justify-center">
                        {statusCounts.answered}
                      </span>
                      <span className="text-[0.7rem] text-text-muted">Answered</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-red-600 text-white font-bold text-[0.65rem] flex items-center justify-center">
                        {statusCounts.notAnswered}
                      </span>
                      <span className="text-[0.7rem] text-text-muted">Not Answered</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[0.65rem] flex items-center justify-center">
                        {statusCounts.marked}
                      </span>
                      <span className="text-[0.7rem] text-text-muted">Review</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-card border border-border text-text-muted font-bold text-[0.65rem] flex items-center justify-center">
                        {statusCounts.notVisited}
                      </span>
                      <span className="text-[0.7rem] text-text-muted">Not Visited</span>
                    </div>
                  </div>
                </div>

                {/* Question Numbers Grid */}
                <div>
                  <h5 className="text-[0.72rem] font-bold text-text-subtle mb-3 uppercase">
                    Choose a Question:
                  </h5>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedExam.questions.map((q, idx) => {
                      const st = questionStatuses[q.id] || 'not_visited';
                      const isCurrent = idx === currentQIndex;
                      return (
                        <button
                          key={q.id}
                          onClick={() => handleNavigateQuestion(idx)}
                          className={`h-9 rounded-lg text-xs transition-transform flex items-center justify-center cursor-pointer ${getPaletteBg(st, isCurrent)}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Test Button */}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full btn btn-primary py-2.5 rounded-xl font-bold text-xs justify-center cursor-pointer shadow-sm mt-4"
                >
                  Final Submit Exam
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STATE 3: DETAILED SCORECARD & AI EVALUATION (AFTER TEST) */}
      {/* ======================================================== */}
      {testSubmitted && (
        <div className="space-y-8 animate-in fade-in">
          {(() => {
            const results = computeScorecard();
            return (
              <>
                {/* Scorecard Hero Banner */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        ✓ Test Session Completed
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black text-foreground">
                        {selectedExam.title} Scorecard
                      </h2>
                      <p className="text-xs text-text-muted mt-1">
                        Candidate: <strong className="text-foreground">{candidateName}</strong> • Real-time CBT Evaluation Engine
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartExam(selectedExam)}
                        className="btn bg-background border border-border hover:bg-card-hover px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retake Test
                      </button>
                      <button
                        onClick={() => {
                          setTestSubmitted(false);
                          setTestActive(false);
                        }}
                        className="btn btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                      >
                        Choose Another Exam
                      </button>
                    </div>
                  </div>

                  {/* High-level Score Metrics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-background/80 p-4 rounded-xl border border-border">
                      <span className="text-[0.68rem] text-text-subtle uppercase font-extrabold block mb-1">Your Total Score</span>
                      <strong className="text-2xl font-black text-primary block">{results.finalScore} / {results.totalPossible}</strong>
                      <span className="text-[0.65rem] text-text-muted">Scaled Exam Points</span>
                    </div>

                    <div className="bg-background/80 p-4 rounded-xl border border-border">
                      <span className="text-[0.68rem] text-text-subtle uppercase font-extrabold block mb-1">Accuracy</span>
                      <strong className={`text-2xl font-black block ${results.accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {results.accuracy}%
                      </strong>
                      <span className="text-[0.65rem] text-text-muted">{results.correctCount} of {results.correctCount + results.incorrectCount} Attempted</span>
                    </div>

                    <div className="bg-background/80 p-4 rounded-xl border border-border">
                      <span className="text-[0.68rem] text-text-subtle uppercase font-extrabold block mb-1">Correct vs Wrong</span>
                      <div className="flex items-center justify-center gap-3 mt-1">
                        <span className="text-sm font-bold text-emerald-400">✓ {results.correctCount}</span>
                        <span className="text-sm font-bold text-red-400">✗ {results.incorrectCount}</span>
                        <span className="text-sm font-bold text-text-muted">⚪ {results.unattemptedCount}</span>
                      </div>
                      <span className="text-[0.65rem] text-text-muted mt-1 block">Attempt Breakdown</span>
                    </div>

                    <div className="bg-background/80 p-4 rounded-xl border border-border">
                      <span className="text-[0.68rem] text-text-subtle uppercase font-extrabold block mb-1">Negative Deductions</span>
                      <strong className="text-2xl font-black text-red-400 block">-{results.negativeDeducted}</strong>
                      <span className="text-[0.65rem] text-text-muted">Lost to Wrong Answers</span>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Solution & AI Explanations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" /> Detailed Solutions & Answer Key
                  </h3>

                  <div className="space-y-4">
                    {selectedExam.questions.map((q, idx) => {
                      const userChoice = userAnswers[q.id];
                      const isUnattempted = userChoice === undefined;
                      const isCorrect = userChoice === q.correctAnswer;

                      return (
                        <div 
                          key={q.id}
                          className={`card p-6 rounded-2xl border space-y-4 ${
                            isCorrect 
                              ? 'border-emerald-500/30 bg-emerald-500/5' 
                              : isUnattempted 
                              ? 'border-border bg-card' 
                              : 'border-red-500/30 bg-red-500/5'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                                isCorrect 
                                  ? 'bg-emerald-600 text-white' 
                                  : isUnattempted 
                                  ? 'bg-card border border-border text-text-muted' 
                                  : 'bg-red-600 text-white'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-text-subtle">
                                Section: {q.section} • Topic: <strong className="text-foreground">{q.topic}</strong>
                              </span>
                            </div>

                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                              isCorrect 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : isUnattempted 
                                ? 'bg-card text-text-muted border border-border' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {isCorrect ? 'Correct (+ ' + q.marks + ')' : isUnattempted ? 'Unattempted (0)' : 'Incorrect (- ' + q.negativeMarks + ')'}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-foreground leading-relaxed">
                            {q.question}
                          </p>

                          {/* Options breakdown */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                            {q.options.map((opt, optIdx) => {
                              const isThisCorrect = optIdx === q.correctAnswer;
                              const isThisUserPick = optIdx === userChoice;

                              let optBorder = 'border-border bg-background';
                              if (isThisCorrect) optBorder = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-bold';
                              else if (isThisUserPick) optBorder = 'border-red-500/60 bg-red-500/10 text-red-300 font-bold';

                              return (
                                <div key={optIdx} className={`p-3 rounded-xl border flex items-center gap-2.5 ${optBorder}`}>
                                  <span className="w-5 h-5 rounded font-bold text-[0.65rem] flex items-center justify-center bg-card border border-border shrink-0">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                  {isThisCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                                  {isThisUserPick && !isThisCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                                </div>
                              );
                            })}
                          </div>

                          {/* Detailed Explanation */}
                          <div className="p-3.5 rounded-xl bg-background border border-border text-xs text-text-muted space-y-1">
                            <strong className="text-primary block font-bold">💡 Official Solution & Rationale:</strong>
                            <p className="leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBMISSION CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" /> Confirm Test Submission
            </h3>

            <p className="text-xs text-text-muted leading-relaxed">
              Are you sure you want to finish and submit your exam? Here is your session summary:
            </p>

            <div className="p-4 rounded-xl bg-background border border-border grid grid-cols-2 gap-3 text-xs">
              <div>Answered: <strong className="text-emerald-400">{statusCounts.answered + statusCounts.answeredMarked}</strong></div>
              <div>Not Answered: <strong className="text-red-400">{statusCounts.notAnswered}</strong></div>
              <div>Marked for Review: <strong className="text-purple-400">{statusCounts.marked}</strong></div>
              <div>Time Left: <strong className="text-primary">{formatTime(secondsRemaining)}</strong></div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn bg-background border border-border px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Return to Test
              </button>
              <button
                onClick={handleSubmitTest}
                className="btn btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUESTION PAPER PREVIEW MODAL */}
      {/* ======================================================== */}
      {showQuestionPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 max-h-[85vh] flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Question Paper Preview: {selectedExam.shortName}
              </h3>
              <button 
                onClick={() => setShowQuestionPaperModal(false)}
                className="text-text-muted hover:text-foreground text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-2">
              {selectedExam.questions.map((q, idx) => (
                <div key={q.id} className="p-3.5 rounded-xl border border-border bg-background space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Q{idx + 1}. ({q.section})</span>
                    <span className="text-primary">+{q.marks} / -{q.negativeMarks}</span>
                  </div>
                  <p className="text-foreground">{q.question}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowQuestionPaperModal(false)}
              className="w-full btn btn-primary py-2 text-xs font-bold cursor-pointer"
            >
              Resume Test
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

