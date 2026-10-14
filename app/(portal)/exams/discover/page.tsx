'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Exam } from '@/lib/examsData';
import { evaluateEligibility, calculateMatchScore } from '@/lib/eligibility';
import { supabase } from '@/lib/supabaseClient';
import { getUserBookmarks, toggleUserBookmark, getUserProfile } from '@/lib/dbService';
import { 
  Compass, Search, Filter, SlidersHorizontal, 
  Bookmark, BookmarkCheck, ArrowRight, UserCheck, Eye, Sparkles, GraduationCap, Building2, ShieldCheck, Banknote, Calendar, Clock
} from 'lucide-react';
import { getCoordinatorExamUpdates, getMasterExams } from '@/lib/coordinatorService';

const STREAM_CATEGORY_PILLS = [
  'All',
  'Engineering & Tech',
  'Civil Services',
  'PSU & Research',
  'Banking'
] as const;

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
  const [exams, setExams] = useState<any[]>([]);
  
  // Dynamic Stream / Category Filter Pill
  const [selectedStreamPill, setSelectedStreamPill] = useState<string>('All');

  // Filter states
  const [filterEdu, setFilterEdu] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterExamCategory, setFilterExamCategory] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [sortBy, setSortBy] = useState('match');

  useEffect(() => {
    const loadData = async () => {
      // 1. Authoritative Master Exams list from Unified Reactive Store
      const masterExams = getMasterExams();

      // Merge coordinator updates from localStorage
      const coordUpdates = getCoordinatorExamUpdates();
      const mergedExams = masterExams.map((exam: any) => {
        const update = coordUpdates.find((u: any) =>
          u.examId?.toLowerCase() === exam.id?.toLowerCase() ||
          u.examId?.toLowerCase() === exam.slug?.toLowerCase() ||
          (u.examName && u.examName.toLowerCase().includes(exam.short_name?.toLowerCase())) ||
          (u.examName && u.examName.toLowerCase().includes(exam.id?.toLowerCase()))
        );
        if (update) {
          let daysToExam: number | null = null;
          if (update.examDate) {
            const diff = new Date(update.examDate).getTime() - Date.now();
            daysToExam = Math.ceil(diff / (1000 * 60 * 60 * 24));
          }
          return {
            ...exam,
            exam_date: update.examDate || exam.exam_date || exam.examDate,
            application_start_date: update.registrationStartDate || exam.application_start_date || exam.registrationWindow?.startDate,
            application_end_date: update.registrationEndDate || exam.application_end_date || exam.registrationWindow?.endDate,
            admit_card_date: update.admitCardDate || exam.admit_card_date || exam.admitCardDate,
            result_date: update.resultDate || exam.result_date || exam.resultDate,
            application_status: update.status === 'Live' ? 'Active' : (update.status || exam.application_status),
            isCoordinatorUpdated: true,
            daysToExam,
            conductingAuthority: update.conductingBody || exam.conductingAuthority || exam.organization,
            organization: update.conductingBody || exam.organization || exam.conductingAuthority
          };
        }
        return exam;
      });
      setExams(mergedExams);

      // 2. Try fetching auth session and profile from DB
      const { data: { session } } = await supabase.auth.getSession();
      
      let dbProfile = null;
      if (session && session.user) {
        dbProfile = await getUserProfile(session.user.id);
      }

      if (dbProfile) {
        setProfile(dbProfile);
      } else {
        // Fallback to local storage if unauthenticated or profile not found
        const localProf = localStorage.getItem('udanpath_onboarding_profile');
        if (localProf) {
          setProfile(JSON.parse(localProf));
        }
      }

      // 3. Load bookmarks
      let bList: string[] = [];
      const savedBookmarks = localStorage.getItem('udanpath_bookmarks');
      if (savedBookmarks) {
        bList = JSON.parse(savedBookmarks);
      }

      // Check auth status for database bookmarks
      if (session && session.user) {
        const syncedBookmarks = await getUserBookmarks(session.user.id, mergedExams);
        if (syncedBookmarks && syncedBookmarks.length > 0) {
          bList = syncedBookmarks;
          localStorage.setItem('udanpath_bookmarks', JSON.stringify(bList));
        }
      }
      setBookmarks(bList);
    };

    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('udanpath_master_store_updated', handleSync);
    window.addEventListener('udanpath_exams_updated', handleSync);
    window.addEventListener('udanpath_coordinator_data_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('udanpath_master_store_updated', handleSync);
      window.removeEventListener('udanpath_exams_updated', handleSync);
      window.removeEventListener('udanpath_coordinator_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const toggleBookmark = async (examId: string) => {
    let updated = [...bookmarks];
    if (bookmarks.includes(examId)) {
      updated = bookmarks.filter(id => id !== examId);
    } else {
      updated = [...bookmarks, examId];
    }
    setBookmarks(updated);
    localStorage.setItem('udanpath_bookmarks', JSON.stringify(updated));

    // Sync database bookmark
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const synced = await toggleUserBookmark(session.user.id, examId, exams);
      if (synced) {
        setBookmarks(synced);
        localStorage.setItem('udanpath_bookmarks', JSON.stringify(synced));
      }
    }
  };

  // Process and Rank Exams
  const getProcessedExams = () => {
    // 1. Map scores & check eligibility
    let list = exams.map((exam) => {
      // Use standard profile for 'find', or custom filter profile for 'browse'
      const checkProfile = activeTab === 'find' 
        ? profile 
        : { 
            ...profile, 
            education: filterEdu === 'all' ? profile.education : filterEdu,
            category: filterCategory === 'all' ? profile.category : filterCategory 
          };

      const evaluation = calculateMatchScore(exam, checkProfile);

      // Compute dynamic days left for registration
      const regEnd = exam.registrationWindow?.endDate || exam.application_end_date;
      let daysLeft: number | null = null;
      if (regEnd) {
        const diff = new Date(regEnd).getTime() - Date.now();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      return {
        ...exam,
        matchScore: evaluation.matchScore,
        matchLevel: evaluation.matchLevel,
        matchingReason: evaluation.matchingReason,
        registrationDaysLeft: daysLeft
      };
    });

    // 2. Apply Stream / Category Filter Pills
    if (selectedStreamPill !== 'All') {
      list = list.filter((e) => {
        const domainStr = (e.domain || '').toLowerCase();
        const catStr = (e.category_name || '').toLowerCase();
        const tags = (e.tags || []).map((t: string) => t.toLowerCase());

        if (selectedStreamPill === 'Engineering & Tech') {
          return domainStr.includes('engineering') || catStr.includes('engineering') || tags.includes('engineering') || tags.includes('tech');
        }
        if (selectedStreamPill === 'Civil Services') {
          return domainStr.includes('civil') || catStr.includes('civil') || tags.includes('civil services') || tags.includes('upsc');
        }
        if (selectedStreamPill === 'PSU & Research') {
          return domainStr.includes('psu') || domainStr.includes('research') || catStr.includes('psu') || catStr.includes('research') || tags.includes('psu') || tags.includes('isro') || tags.includes('barc');
        }
        if (selectedStreamPill === 'Banking') {
          return domainStr.includes('banking') || catStr.includes('banking') || tags.includes('banking') || tags.includes('finance');
        }
        return true;
      });
    }

    // 3. Real-time text search query (title, category, authority, tags)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(e => {
        const nameMatch = (e.name || '').toLowerCase().includes(q);
        const shortNameMatch = (e.short_name || '').toLowerCase().includes(q);
        const domainMatch = (e.domain || '').toLowerCase().includes(q);
        const categoryMatch = (e.category_name || '').toLowerCase().includes(q);
        const authorityMatch = (e.conductingAuthority || e.organization || '').toLowerCase().includes(q);
        const descMatch = (e.description || '').toLowerCase().includes(q);
        const tagsMatch = (e.tags || []).some((t: string) => t.toLowerCase().includes(q));

        return nameMatch || shortNameMatch || domainMatch || categoryMatch || authorityMatch || descMatch || tagsMatch;
      });
    }

    // 4. Secondary filters for Browse All tab
    if (activeTab === 'browse') {
      if (filterExamCategory !== 'all') {
        list = list.filter(e => e.category_name === filterExamCategory || e.domain === filterExamCategory);
      }
      if (filterState !== 'all') {
        list = list.filter(e => e.state === filterState);
      }
    }

    // Filter out NOT_ELIGIBLE only for Find tab if search query is empty
    if (activeTab === 'find' && searchQuery.trim() === '') {
      list = list.filter(e => e.matchLevel !== 'NOT_ELIGIBLE');
    }

    // 5. Sorting
    if (sortBy === 'match') {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'salary') {
      list.sort((a, b) => {
        const aSal = a.salary_information?.approx_in_hand_monthly || 0;
        const bSal = b.salary_information?.approx_in_hand_monthly || 0;
        return bSal - aSal;
      });
    } else if (sortBy === 'alphabetical') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  };

  const processedList = getProcessedExams();
  
  // Split lists for the "Find" tab
  const topRecommendations = activeTab === 'find' ? processedList.filter(e => e.matchScore >= 70) : [];
  const otherMatches = activeTab === 'find' ? processedList.filter(e => e.matchScore < 70) : [];

  const renderExamCard = (exam: any, index: number, isTopMatch = false) => {
    const isSaved = bookmarks.includes(exam.id) || (exam.slug && bookmarks.includes(exam.slug));
    const salary = exam.salary_information?.approx_in_hand_monthly 
      ? `₹${exam.salary_information.approx_in_hand_monthly.toLocaleString()}/mo` 
      : (exam.salary_information?.pay_scale || 'N/A');

    const authorityName = exam.conductingAuthority || exam.organization || 'Exam Board';
    const targetSlug = exam.slug || exam.id;

    return (
      <div 
        key={exam.id || exam.slug || index}
        className={`card bg-card border flex flex-col justify-between transition-all duration-300 relative overflow-hidden rounded-xl ${
          isTopMatch 
            ? 'border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] hover:border-primary' 
            : 'border-border hover:border-primary/30'
        }`}
      >
        {isTopMatch && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-md text-[0.65rem] font-bold bg-background border border-border text-text-muted flex items-center">
                <Building2 className="w-3 h-3 mr-1 text-primary" />
                {authorityName}
              </span>
              {exam.domain && (
                <span className="px-2 py-0.5 rounded text-[0.62rem] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {exam.domain}
                </span>
              )}
              {exam.isCoordinatorUpdated && (
                <span className="px-2 py-0.5 rounded text-[0.62rem] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Schedule
                </span>
              )}
            </div>
            <div className={`px-2.5 py-1 rounded-md text-[0.7rem] font-extrabold flex items-center ${
              exam.matchScore >= 80 ? 'bg-success/10 text-success border border-success/20' : 
              exam.matchScore >= 50 ? 'bg-warning/10 text-warning border border-warning/20' : 
              'bg-background border border-border text-text-muted'
            }`}>
              {isTopMatch && <Sparkles className="w-3 h-3 mr-1" />}
              {exam.matchScore}% Match
            </div>
          </div>
          
          <h3 className="font-extrabold text-[1.1rem] leading-snug mb-2 text-foreground group-hover:text-primary transition-colors">
            {exam.name} <span className="text-text-muted text-sm font-semibold ml-1">({exam.short_name || exam.code})</span>
          </h3>
          
          <div className="space-y-2 text-[0.8rem] text-text-muted border-b border-border/50 pb-4 mb-4 mt-4">
            <div className="flex items-center"><Banknote className="w-4 h-4 mr-2 text-text-subtle" /> <strong>Salary:</strong> &nbsp;{salary}</div>
            <div className="flex items-center"><UserCheck className="w-4 h-4 mr-2 text-text-subtle" /> <strong>Age Limit:</strong> &nbsp;{exam.minimum_age || exam.eligibilityRules?.ageLimit?.min || 18}-{exam.maximum_age || exam.eligibilityRules?.ageLimit?.max || 32} Years</div>
            <div className="flex items-center"><GraduationCap className="w-4 h-4 mr-2 text-text-subtle" /> <strong>Degree:</strong> &nbsp;{exam.eligibilityRules?.degree || exam.minimum_qualification || 'Graduate'}</div>
            
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" /> 
                <strong>Exam Date:</strong> &nbsp;
                <span className="font-extrabold text-foreground">{exam.examDate || exam.exam_date || 'TBA'}</span>
              </div>
              
              {exam.registrationDaysLeft != null && (
                <span className={`px-2 py-0.5 rounded text-[0.68rem] font-bold flex items-center gap-1 ${
                  exam.registrationDaysLeft > 0 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}>
                  <Clock className="w-3 h-3" />
                  {exam.registrationDaysLeft > 0 ? `${exam.registrationDaysLeft} days left to apply` : 'Applications Closed'}
                </span>
              )}
            </div>

            <div className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-text-subtle" /> <strong>Status:</strong> &nbsp;
              <span className={exam.application_status === 'Active' ? 'text-success font-bold' : ''}>{exam.application_status || 'Announced'}</span>
            </div>
          </div>

          <div className="text-[0.75rem] bg-background/50 border border-border p-3 rounded-lg leading-relaxed text-text-muted relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-lg"></div>
            <strong>Why this matches:</strong> {exam.matchingReason}
          </div>
        </div>

        <div className="flex gap-2 p-6 pt-0 mt-auto">
          <Link 
            href={`/exams/${targetSlug}`}
            className={`flex-1 btn py-2.5 text-xs justify-center font-bold ${isTopMatch ? 'btn-primary' : 'bg-background hover:bg-card-hover border border-border'}`}
          >
            <Eye className="w-4 h-4 mr-1.5" /> View Details
          </Link>
          
          <button
            onClick={() => toggleBookmark(exam.id || exam.slug)}
            className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-card-hover transition-colors text-text-muted flex items-center justify-center"
            title="Save Exam"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Header title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Compass className="w-8 h-8 text-primary" />
          </div>
          Discover Competitive Exams
        </h1>
        <p className="text-sm md:text-base text-text-muted mt-2 max-w-2xl">
          Dynamic repository matching your qualifications against verified national, central, and PSU competitive opportunities.
        </p>
      </div>

      {/* Stream/Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-text-muted shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Stream:
        </span>
        {STREAM_CATEGORY_PILLS.map((pill) => (
          <button
            key={pill}
            onClick={() => setSelectedStreamPill(pill)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
              selectedStreamPill === pill
                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                : 'bg-card text-text-muted hover:text-foreground border-border hover:border-primary/40'
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Keyword Search & Reactive Controls */}
      <div className="card bg-card border border-border p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
          <input
            type="text"
            placeholder="Search by title, authority (IIT, UPSC, ISRO, SSC), domain, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-bold text-text-muted whitespace-nowrap">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-semibold w-full md:w-auto"
            >
              <option value="match">Highest Match Score</option>
              <option value="salary">Estimated In-Hand Pay</option>
              <option value="alphabetical">Exam Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('find'); }}
          className={`px-8 py-3.5 font-bold text-sm transition-all duration-300 border-b-2 -mb-[2px] ${
            activeTab === 'find' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-text-muted hover:text-foreground hover:bg-card-hover/50'
          }`}
        >
          🔍 Recommended For You ({activeTab === 'find' ? processedList.length : exams.length})
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-8 py-3.5 font-bold text-sm transition-all duration-300 border-b-2 -mb-[2px] ${
            activeTab === 'browse' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-text-muted hover:text-foreground hover:bg-card-hover/50'
          }`}
        >
          📂 Explore All Catalog ({exams.length})
        </button>
      </div>

      {/* ==================== VACANCY GRID ==================== */}
      {activeTab === 'find' && (
        <div className="space-y-10">
          {topRecommendations.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Top Recommended Matches</h2>
                <span className="text-xs text-text-muted font-normal ml-2">({topRecommendations.length} opportunities)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRecommendations.map((exam, i) => renderExamCard(exam, i, true))}
              </div>
            </section>
          )}

          {otherMatches.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-lg font-bold tracking-tight text-text-muted">Other Opportunities</h2>
                <div className="flex-1 h-px bg-border/50 ml-4"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-95">
                {otherMatches.map((exam, i) => renderExamCard(exam, i, false))}
              </div>
            </section>
          )}

          {topRecommendations.length === 0 && otherMatches.length === 0 && (
            <div className="card bg-card border border-border p-12 text-center text-text-muted select-none rounded-xl">
              <SlidersHorizontal className="w-12 h-12 text-text-subtle mx-auto mb-3" />
              <h4 className="font-bold text-base text-foreground mb-1">No matching exams found</h4>
              <p className="text-xs">Adjust your search keyword or selected category filter.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'browse' && (
        <>
          {processedList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedList.map((exam, i) => renderExamCard(exam, i, exam.matchScore >= 80))}
            </div>
          ) : (
            <div className="card bg-card border border-border p-12 text-center text-text-muted select-none rounded-xl">
              <SlidersHorizontal className="w-12 h-12 text-text-subtle mx-auto mb-3" />
              <h4 className="font-bold text-base text-foreground mb-1">No matching exams found</h4>
              <p className="text-xs">Adjust your search parameters or check your onboarding preferences.</p>
            </div>
          )}
        </>
      )}

    </div>
  );
}
