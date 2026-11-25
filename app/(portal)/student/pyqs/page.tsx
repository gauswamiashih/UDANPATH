'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  PYQ_DATABASE, 
  PYQQuestion, 
  AVAILABLE_YEARS, 
  EXAM_OPTIONS 
} from '@/lib/pyqData';
import { 
  Search, Filter, BookOpen, Bookmark, BookmarkCheck, CheckCircle2, 
  XCircle, Lightbulb, ChevronDown, ChevronUp, FileText, Download, 
  Sparkles, Award, RotateCcw, Check, HelpCircle, Layers, ArrowRight, ExternalLink
} from 'lucide-react';
import { getCoordinatorResources, ResourceItem } from '@/lib/coordinatorService';

export default function PYQVaultPage() {
  // Filters State
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewFilter, setViewFilter] = useState<'all' | 'bookmarked' | 'attempted'>('all');
  
  // Interactive Mode: 'practice' (instant feedback) vs 'test' (batch exam mode)
  const [mode, setMode] = useState<'practice' | 'test'>('practice');

  // User Progress & Interactivity State (Persisted in localStorage)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [testBatchSubmitted, setTestBatchSubmitted] = useState<boolean>(false);

  // Coordinator official papers
  const [officialPapers, setOfficialPapers] = useState<ResourceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'official_papers'>('questions');

  // Load persisted bookmarks & responses on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBookmarks = localStorage.getItem('udanpath_pyq_bookmarks');
        if (savedBookmarks) setBookmarkedIds(JSON.parse(savedBookmarks));

        const savedAnswers = localStorage.getItem('udanpath_pyq_answers');
        if (savedAnswers) setUserAnswers(JSON.parse(savedAnswers));
      } catch {
        // ignore
      }

      // Load official question papers from Coordinator store
      try {
        const resources = getCoordinatorResources();
        const pyqResources = resources.filter(r => r.type === 'pyq' || r.type === 'solution');
        setOfficialPapers(pyqResources);
      } catch {
        // ignore
      }
    }
  }, []);

  // Save Bookmarks to localStorage
  const toggleBookmark = (id: string) => {
    const next = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter(bId => bId !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('udanpath_pyq_bookmarks', JSON.stringify(next));
    }
  };

  // Record User Answer
  const handleSelectAnswer = (qId: string, optIndex: number) => {
    const next = { ...userAnswers, [qId]: optIndex };
    setUserAnswers(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('udanpath_pyq_answers', JSON.stringify(next));
    }

    // In practice mode, automatically reveal the solution step once an option is selected
    if (mode === 'practice') {
      setRevealedSolutions(prev => ({ ...prev, [qId]: true }));
    }
  };

  // Toggle Hint
  const toggleHint = (qId: string) => {
    setRevealedHints(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Toggle Solution
  const toggleSolution = (qId: string) => {
    setRevealedSolutions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Reset Progress
  const handleResetProgress = () => {
    if (confirm('Are you sure you want to clear your solved answers and practice progress?')) {
      setUserAnswers({});
      setRevealedHints({});
      setRevealedSolutions({});
      setTestBatchSubmitted(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('udanpath_pyq_answers');
      }
    }
  };

  // Available subjects based on exam filter
  const availableSubjects = useMemo(() => {
    const subset = selectedExam === 'ALL'
      ? PYQ_DATABASE
      : PYQ_DATABASE.filter(q => q.examSlug === selectedExam);
    const set = new Set<string>();
    subset.forEach(q => set.add(q.subject));
    return Array.from(set);
  }, [selectedExam]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return PYQ_DATABASE.filter(q => {
      // Exam Filter
      if (selectedExam !== 'ALL' && q.examSlug !== selectedExam) return false;
      // Year Filter
      if (selectedYear !== 'ALL' && q.year !== selectedYear) return false;
      // Subject Filter
      if (selectedSubject !== 'ALL' && q.subject !== selectedSubject) return false;
      // Difficulty Filter
      if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false;
      // View Filter (Bookmarked / Attempted)
      if (viewFilter === 'bookmarked' && !bookmarkedIds.includes(q.id)) return false;
      if (viewFilter === 'attempted' && userAnswers[q.id] === undefined) return false;
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.question.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesSubject = q.subject.toLowerCase().includes(query);
        if (!matchesText && !matchesTopic && !matchesSubject) return false;
      }
      return true;
    });
  }, [selectedExam, selectedYear, selectedSubject, selectedDifficulty, viewFilter, bookmarkedIds, userAnswers, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredQuestions.length;
    let solved = 0;
    let correct = 0;
    filteredQuestions.forEach(q => {
      if (userAnswers[q.id] !== undefined) {
        solved++;
        if (userAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      }
    });
    const accuracy = solved > 0 ? Math.round((correct / solved) * 100) : 0;
    return { total, solved, correct, accuracy };
  }, [filteredQuestions, userAnswers]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* ======================================================== */}
      {/* HEADER & HERO BANNER */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Authentic Exam Archives
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Year-Wise Interactive PYQ Vault
            </h1>
            <p className="text-text-muted text-sm md:text-base max-w-2xl">
              Master real previous year questions from GATE, UPSC CSE, and SSC CGL. Solve with instant AI concept hints, step-by-step verified explanations, and official question papers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Selector */}
            <div className="flex items-center bg-background border border-border rounded-xl p-1 shadow-sm">
              <button
                onClick={() => { setMode('practice'); setTestBatchSubmitted(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'practice'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                Practice Mode
              </button>
              <button
                onClick={() => setMode('test')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'test'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                Speed Test Mode
              </button>
            </div>

            <button
              onClick={handleResetProgress}
              className="p-2 rounded-xl border border-border bg-background hover:bg-card text-text-muted hover:text-foreground text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset practice responses"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/60">
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl p-3">
            <div className="text-text-muted text-[0.7rem] font-bold uppercase tracking-wider">Filtered PYQs</div>
            <div className="text-xl font-black text-foreground mt-0.5">{stats.total}</div>
          </div>
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl p-3">
            <div className="text-text-muted text-[0.7rem] font-bold uppercase tracking-wider">Attempted</div>
            <div className="text-xl font-black text-primary mt-0.5">{stats.solved} / {stats.total}</div>
          </div>
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl p-3">
            <div className="text-text-muted text-[0.7rem] font-bold uppercase tracking-wider">Accuracy</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.accuracy}%</div>
          </div>
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl p-3">
            <div className="text-text-muted text-[0.7rem] font-bold uppercase tracking-wider">Bookmarked</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{bookmarkedIds.length}</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEW TABS: QUESTIONS vs OFFICIAL PAPERS */}
      {/* ======================================================== */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'questions'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Interactive Questions ({filteredQuestions.length})
        </button>
        <button
          onClick={() => setActiveTab('official_papers')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'official_papers'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" /> Official Papers &amp; Answer Keys ({officialPapers.length})
        </button>
      </div>

      {activeTab === 'questions' ? (
        <>
          {/* ======================================================== */}
          {/* FILTER CONTROLS BAR */}
          {/* ======================================================== */}
          <div className="card bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
            
            {/* Top row: Search and Exam selector */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions, algorithms, constitution articles, quant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Exam Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-background p-1 rounded-xl border border-border">
                {EXAM_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSelectedExam(opt.value); setSelectedSubject('ALL'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedExam === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-text-muted hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom row: Year pills, Subject dropdown, Difficulty pills & View Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
              
              {/* Year Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-text-muted mr-1">Year:</span>
                <button
                  onClick={() => setSelectedYear('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    selectedYear === 'ALL'
                      ? 'bg-primary/20 text-primary border border-primary/30 font-bold'
                      : 'border border-border text-text-muted hover:text-foreground'
                  }`}
                >
                  All
                </button>
                {AVAILABLE_YEARS.map(yr => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      selectedYear === yr
                        ? 'bg-primary/20 text-primary border border-primary/30 font-bold'
                        : 'border border-border text-text-muted hover:text-foreground'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>

              {/* Subject Dropdown */}
              {availableSubjects.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-muted">Subject:</span>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="ALL">All Subjects ({availableSubjects.length})</option>
                    {availableSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-text-muted">Level:</span>
                {['ALL', 'Easy', 'Medium', 'Hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2 py-0.5 rounded text-[0.7rem] font-semibold cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-foreground/10 text-foreground font-bold border border-foreground/20'
                        : 'text-text-muted hover:text-foreground'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Bookmarked / Solved Filter */}
              <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
                <button
                  onClick={() => setViewFilter('all')}
                  className={`px-2 py-0.5 rounded text-[0.7rem] font-semibold cursor-pointer ${
                    viewFilter === 'all' ? 'bg-primary text-primary-foreground font-bold' : 'text-text-muted'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setViewFilter('bookmarked')}
                  className={`px-2 py-0.5 rounded text-[0.7rem] font-semibold flex items-center gap-1 cursor-pointer ${
                    viewFilter === 'bookmarked' ? 'bg-amber-500 text-white font-bold' : 'text-text-muted'
                  }`}
                >
                  <Bookmark className="w-3 h-3" /> Bookmarked
                </button>
                <button
                  onClick={() => setViewFilter('attempted')}
                  className={`px-2 py-0.5 rounded text-[0.7rem] font-semibold flex items-center gap-1 cursor-pointer ${
                    viewFilter === 'attempted' ? 'bg-emerald-600 text-white font-bold' : 'text-text-muted'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> Solved
                </button>
              </div>

            </div>

          </div>

          {/* Speed Test Mode Banner */}
          {mode === 'test' && !testBatchSubmitted && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-foreground">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Speed Test Mode Active:</span> Select your answers for each question without hints. When finished, submit the batch to calculate your score!
                </div>
              </div>
              <button
                onClick={() => setTestBatchSubmitted(true)}
                className="btn btn-primary px-4 py-1.5 text-xs font-bold cursor-pointer shrink-0"
              >
                Submit Batch &amp; Reveal Score
              </button>
            </div>
          )}

          {/* Test Mode Scorecard Banner */}
          {mode === 'test' && testBatchSubmitted && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-emerald-400 font-extrabold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Batch Evaluation Complete!
                </div>
                <p className="text-xs text-text-muted">
                  You attempted <strong>{stats.solved}</strong> out of <strong>{stats.total}</strong> questions. Correct answers: <strong>{stats.correct}</strong> ({stats.accuracy}% accuracy).
                </p>
              </div>
              <button
                onClick={() => setTestBatchSubmitted(false)}
                className="btn btn-secondary px-4 py-1.5 text-xs font-bold cursor-pointer"
              >
                Continue Practice
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* QUESTIONS LIST */}
          {/* ======================================================== */}
          <div className="space-y-6">
            {filteredQuestions.map((q, qIndex) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const selectedOpt = userAnswers[q.id];
              const isCorrect = isAnswered && selectedOpt === q.correctAnswer;
              const isBookmarked = bookmarkedIds.includes(q.id);
              const showHint = revealedHints[q.id];
              const showSolution = revealedSolutions[q.id] || (mode === 'test' && testBatchSubmitted);

              return (
                <div 
                  key={q.id}
                  className="card bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 hover:border-primary/40 transition-colors"
                >
                  {/* Card Header: Meta Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold">
                        {q.exam} • {q.year}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-background border border-border text-xs font-bold text-foreground">
                        {q.subject}
                      </span>
                      <span className="text-[0.7rem] text-text-muted font-medium">
                        {q.topic}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[0.68rem] font-bold px-2 py-0.5 rounded border ${
                        q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {q.difficulty}
                      </span>

                      <span className="text-[0.7rem] font-mono font-bold text-text-muted">
                        +{q.marks} / -{q.negativeMarks}
                      </span>

                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isBookmarked 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                            : 'border-border text-text-muted hover:text-foreground'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark for revision'}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Question Stem */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        {qIndex + 1}
                      </span>
                      <p className="text-sm md:text-base font-semibold text-foreground leading-relaxed whitespace-pre-line">
                        {q.question}
                      </p>
                    </div>

                    {q.codeSnippet && (
                      <pre className="p-3 rounded-xl bg-background border border-border text-xs font-mono text-foreground overflow-x-auto">
                        {q.codeSnippet}
                      </pre>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                    {q.options.map((option, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const isCorrectOption = optIdx === q.correctAnswer;

                      let optClasses = 'border-border bg-background hover:bg-card text-foreground';

                      if (mode === 'practice' && isAnswered) {
                        if (isCorrectOption) {
                          optClasses = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold';
                        } else if (isSelected && !isCorrectOption) {
                          optClasses = 'border-rose-500/50 bg-rose-500/10 text-rose-400';
                        }
                      } else if (mode === 'test' && testBatchSubmitted) {
                        if (isCorrectOption) {
                          optClasses = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold';
                        } else if (isSelected && !isCorrectOption) {
                          optClasses = 'border-rose-500/50 bg-rose-500/10 text-rose-400';
                        }
                      } else if (isSelected) {
                        optClasses = 'border-primary bg-primary/10 text-primary font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs md:text-sm transition-all cursor-pointer ${optClasses}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-[0.7rem] font-bold font-mono">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{option}</span>
                          {mode === 'practice' && isAnswered && isCorrectOption && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          {mode === 'practice' && isAnswered && isSelected && !isCorrectOption && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Card Actions: Hint & Solution Toggles */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleHint(q.id)}
                        className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{showHint ? 'Hide Concept Clue' : 'Need a Concept Hint?'}</span>
                      </button>

                      <button
                        onClick={() => toggleSolution(q.id)}
                        className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{showSolution ? 'Hide Solution' : 'Step-by-Step Solution'}</span>
                        {showSolution ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {q.officialPaperUrl && (
                      <a
                        href={q.officialPaperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-primary flex items-center gap-1 text-[0.7rem] transition-colors"
                      >
                        <span>Official Paper Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Expandable AI Concept Hint Box */}
                  {showHint && (
                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-foreground space-y-1 animate-in fade-in">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" /> AI Concept Clue:
                      </div>
                      <p className="text-text-muted leading-relaxed">
                        {q.hint}
                      </p>
                    </div>
                  )}

                  {/* Expandable Step-by-Step Pedagogical Solution Box */}
                  {showSolution && (
                    <div className="p-4 rounded-xl bg-background border border-border text-xs md:text-sm text-foreground space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between pb-1 border-b border-border/60">
                        <span className="font-bold text-primary flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Correct Option: {String.fromCharCode(65 + q.correctAnswer)} ({q.options[q.correctAnswer]})
                        </span>
                        {isAnswered && (
                          <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded ${
                            isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {isCorrect ? 'Your Answer: Correct (+ ' + q.marks + ')' : 'Your Answer: Incorrect (- ' + q.negativeMarks + ')'}
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed whitespace-pre-line text-text-muted font-normal">
                        {q.solution}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="card bg-card border border-dashed border-border rounded-2xl p-12 text-center space-y-3">
                <HelpCircle className="w-8 h-8 text-text-muted mx-auto" />
                <h4 className="font-bold text-foreground">No PYQs matching your current filters</h4>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Try clearing your search term, switching the subject, or selecting &quot;All Exams&quot;.
                </p>
                <button
                  onClick={() => {
                    setSelectedExam('ALL');
                    setSelectedYear('ALL');
                    setSelectedSubject('ALL');
                    setSelectedDifficulty('ALL');
                    setSearchQuery('');
                    setViewFilter('all');
                  }}
                  className="btn btn-secondary px-4 py-1.5 text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ======================================================== */
        /* OFFICIAL QUESTION PAPERS & ANSWER KEYS DOWNLOADS */
        /* ======================================================== */
        <div className="space-y-4">
          <div className="card bg-card border border-border p-6 rounded-2xl shadow-sm space-y-2">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" /> Official Question Papers Archive
            </h3>
            <p className="text-xs text-text-muted">
              Download certified question papers and final verified answer keys released directly by exam conducting bodies (IITs, UPSC, and SSC).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {officialPapers.map((paper) => (
              <div 
                key={paper.id}
                className="card bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[0.7rem] font-bold">
                      {paper.examName} • {paper.year}
                    </span>
                    <span className="text-[0.68rem] text-text-muted font-mono">
                      {paper.fileSize || 'PDF Document'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-snug">
                    {paper.title}
                  </h4>
                  <div className="text-xs text-text-muted flex items-center gap-2">
                    <span>Stage: <strong>{paper.stage}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{paper.status}</span>
                  </div>
                </div>

                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary py-2 justify-center font-bold text-xs flex items-center gap-2 w-full"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Download Verified PDF</span>
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </a>
              </div>
            ))}

            {officialPapers.length === 0 && (
              <div className="col-span-2 text-center py-12 text-text-muted text-sm border border-dashed border-border rounded-xl">
                No official downloadable papers loaded yet. Coordinator updates will reflect here automatically.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

