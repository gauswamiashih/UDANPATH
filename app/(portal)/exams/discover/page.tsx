'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EXAMS_DATABASE, Exam } from '@/lib/examsData';
import { evaluateEligibility } from '@/lib/eligibility';
import { 
  Compass, Search, Filter, SlidersHorizontal, 
  Bookmark, BookmarkCheck, ArrowRight, UserCheck, Eye
} from 'lucide-react';

export default function DiscoverExams() {
  const [activeTab, setActiveTab] = useState<'find' | 'browse'>('find');
  const [profile, setProfile] = useState<any>({
    fullName: 'Aspirant',
    category: 'GENERAL',
    education: 'B.Tech',
    branch: 'Computer Engineering',
    cgpa: 8.2,
  });

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [filterEdu, setFilterEdu] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('match');

  useEffect(() => {
    // Load local storage profile data
    const localProf = localStorage.getItem('udanpath_onboarding_profile');
    if (localProf) {
      setProfile(JSON.parse(localProf));
    }
    // Load bookmarks
    const savedBookmarks = localStorage.getItem('udanpath_bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  const toggleBookmark = (examId: string) => {
    let updated;
    if (bookmarks.includes(examId)) {
      updated = bookmarks.filter(id => id !== examId);
    } else {
      updated = [...bookmarks, examId];
    }
    setBookmarks(updated);
    localStorage.setItem('udanpath_bookmarks', JSON.stringify(updated));
  };

  // Process and Rank Exams
  const getProcessedExams = () => {
    // 1. Map scores & check eligibility
    let list = EXAMS_DATABASE.map((exam, idx) => {
      // Use standard profile for 'find', or custom filter profile for 'browse'
      const checkProfile = activeTab === 'find' 
        ? profile 
        : { 
            ...profile, 
            education: filterEdu === 'all' ? profile.education : filterEdu,
            category: filterCategory === 'all' ? profile.category : filterCategory 
          };

      const evaluation = evaluateEligibility(exam, checkProfile);
      let matchScore = 95 - idx * 2;
      let statusLabel = 'Eligible';
      
      if (evaluation.status === 'ineligible') {
        matchScore -= 30;
        statusLabel = 'Not Eligible';
      } else if (evaluation.status === 'possibly') {
        matchScore -= 10;
        statusLabel = 'Check Required';
      }

      return {
        ...exam,
        matchScore,
        eligibilityStatus: statusLabel,
        matchingReason: evaluation.reason
      };
    });

    // 2. Apply text search query (for Browse All)
    if (activeTab === 'browse' && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.conductingBody.toLowerCase().includes(q) || 
        e.code.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    if (sortBy === 'match') {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'salary') {
      list.sort((a, b) => {
        // extract first number from salary range
        const aNum = parseInt(a.salaryRange.replace(/[^0-9]/g, '')) || 0;
        const bNum = parseInt(b.salaryRange.replace(/[^0-9]/g, '')) || 0;
        return bNum - aNum;
      });
    } else if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  };

  const processedList = getProcessedExams();

  return (
    <div className="space-y-8 select-none">
      
      {/* Header title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Compass className="w-8 h-8 text-primary" /> Discover Exams
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Auto-match your criteria to competitive vacancies or browse all exams with custom filter options.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('find'); setSearchQuery(''); }}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'find' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-text-muted hover:text-foreground'
          }`}
        >
          🔍 Find Exams For Me (Profile Match)
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'browse' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-text-muted hover:text-foreground'
          }`}
        >
          📂 Browse All Exams
        </button>
      </div>

      {/* ==================== FILTERS BAR (For Browse All) ==================== */}
      {activeTab === 'browse' && (
        <div className="card bg-card border border-border p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="space-y-1.5 col-span-1 md:col-span-2">
            <label className="text-xs font-bold text-text-muted">Keyword Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
              <input
                type="text"
                placeholder="Search UPSC, GATE, Science, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>

          {/* Education Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted">Education Degree</label>
            <select
              value={filterEdu}
              onChange={(e) => setFilterEdu(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary font-semibold"
            >
              <option value="all">All Degrees</option>
              <option value="B.Tech">B.Tech / Engineering</option>
              <option value="Graduate">Graduate (Any Stream)</option>
              <option value="12th">12th Pass</option>
              <option value="10th">10th Pass</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary font-semibold"
            >
              <option value="match">Highest Match Score</option>
              <option value="salary">Estimated In-Hand Pay</option>
              <option value="alphabetical">Exam Name (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* ==================== VACANCY GRID ==================== */}
      {processedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedList.map((exam) => {
            const isSaved = bookmarks.includes(exam.id);
            return (
              <div 
                key={exam.id}
                className="card bg-card border border-border p-6 flex flex-col justify-between hover:border-primary/25 transition-all duration-200"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2 py-0.5 rounded text-[0.68rem] font-bold bg-background border border-border text-text-muted">
                      {exam.conductingBody}
                    </span>
                    <span className="text-xs font-extrabold text-success">
                      {exam.matchScore}% Match
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-[1.05rem] line-height-1.3 mb-3 text-foreground">
                    {exam.title}
                  </h3>
                  
                  <div className="space-y-1.5 text-xs text-text-muted border-b border-border/50 pb-3 mb-3">
                    <div>💼 <strong>Salary:</strong> {exam.salaryRange}</div>
                    <div>👤 <strong>Age Limit:</strong> {exam.minAge}-{exam.maxAgeGen} Years</div>
                    <div>⚡ <strong>Eligibility:</strong> {exam.eligibilityStatus}</div>
                    <div>📅 <strong>Frequency:</strong> {exam.frequency}</div>
                  </div>

                  <div className="text-[0.72rem] bg-background border border-border p-2.5 rounded-lg leading-relaxed mb-4 text-text-muted">
                    🤖 <strong>Match Reason:</strong> {exam.matchingReason}
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
                  <Link 
                    href={`/exams/${exam.id}`}
                    className="flex-1 btn btn-primary py-2 text-xs justify-center font-bold"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                  </Link>
                  
                  <button
                    onClick={() => toggleBookmark(exam.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-card-hover transition-colors text-text-muted"
                    title="Save Exam"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4.5 h-4.5 text-primary" />
                    ) : (
                      <Bookmark className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card bg-card border border-border p-12 text-center text-text-muted select-none">
          <SlidersHorizontal className="w-12 h-12 text-text-subtle mx-auto mb-3" />
          <h4 className="font-bold text-base text-foreground mb-1">No matching exams found</h4>
          <p className="text-xs">Adjust your search parameters or check your onboarding preferences.</p>
        </div>
      )}

    </div>
  );
}
