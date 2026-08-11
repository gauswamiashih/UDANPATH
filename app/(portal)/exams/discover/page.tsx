'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Exam } from '@/lib/examsData';
import { evaluateEligibility, calculateMatchScore } from '@/lib/eligibility';
import { supabase } from '@/lib/supabaseClient';
import { getExamsFromDb, getUserBookmarks, toggleUserBookmark, getUserProfile } from '@/lib/dbService';
import { 
  Compass, Search, Filter, SlidersHorizontal, 
  Bookmark, BookmarkCheck, ArrowRight, UserCheck, Eye, Sparkles, GraduationCap, Building2, ShieldCheck, Banknote
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
  const [exams, setExams] = useState<any[]>([]);
  
  // Filter states
  const [filterEdu, setFilterEdu] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterExamCategory, setFilterExamCategory] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [sortBy, setSortBy] = useState('match');

  useEffect(() => {
    const loadData = async () => {
      // 1. Fetch exams from Supabase database
      const dbExams = await getExamsFromDb();
      setExams(dbExams);

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
        const syncedBookmarks = await getUserBookmarks(session.user.id, dbExams);
        if (syncedBookmarks && syncedBookmarks.length > 0) {
          bList = syncedBookmarks;
          localStorage.setItem('udanpath_bookmarks', JSON.stringify(bList));
        }
      }
      setBookmarks(bList);
    };

    loadData();
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
    let list = exams.map((exam, idx) => {
      // Use standard profile for 'find', or custom filter profile for 'browse'
      const checkProfile = activeTab === 'find' 
        ? profile 
        : { 
            ...profile, 
            education: filterEdu === 'all' ? profile.education : filterEdu,
            category: filterCategory === 'all' ? profile.category : filterCategory 
          };

      const evaluation = calculateMatchScore(exam, checkProfile);

      return {
        ...exam,
        matchScore: evaluation.matchScore,
        matchLevel: evaluation.matchLevel,
        matchingReason: evaluation.matchingReason
      };
    });

    // 2. Apply text search query and advanced filters (for Browse All)
    if (activeTab === 'browse') {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(e => 
          (e.name || '').toLowerCase().includes(q) || 
          (e.organization || '').toLowerCase().includes(q) || 
          (e.short_name || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
        );
      }
      if (filterExamCategory !== 'all') {
        list = list.filter(e => e.category_name === filterExamCategory);
      }
      if (filterState !== 'all') {
        list = list.filter(e => e.state === filterState);
      }
    }

    // Filter out NOT_ELIGIBLE only for Find tab
    if (activeTab === 'find') {
      list = list.filter(e => e.matchLevel !== 'NOT_ELIGIBLE');
    }

    // 3. Sorting
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
    const isSaved = bookmarks.includes(exam.id);
    const salary = exam.salary_information?.approx_in_hand_monthly 
      ? `₹${exam.salary_information.approx_in_hand_monthly.toLocaleString()}/mo` 
      : (exam.salary_information?.pay_scale || 'N/A');

    return (
      <div 
        key={exam.id}
        className={`card bg-card border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
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
            <span className="px-2.5 py-1 rounded-md text-[0.65rem] font-bold bg-background border border-border text-text-muted flex items-center">
              <Building2 className="w-3 h-3 mr-1" />
              {exam.organization}
            </span>
            <div className={`px-2.5 py-1 rounded-md text-[0.7rem] font-extrabold flex items-center ${
              exam.matchScore >= 80 ? 'bg-success/10 text-success border border-success/20' : 
              exam.matchScore >= 50 ? 'bg-warning/10 text-warning border border-warning/20' : 
              'bg-background border border-border text-text-muted'
            }`}>
              {isTopMatch && <Sparkles className="w-3 h-3 mr-1" />}
              {exam.matchScore}% Match
            </div>
          </div>
          
          <h3 className="font-extrabold text-[1.1rem] line-height-1.3 mb-2 text-foreground group-hover:text-primary transition-colors">
            {exam.name} <span className="text-text-muted text-sm font-semibold ml-1">({exam.short_name})</span>
          </h3>
          
          <div className="space-y-2 text-[0.8rem] text-text-muted border-b border-border/50 pb-4 mb-4 mt-4">
            <div className="flex items-center"><Banknote className="w-4 h-4 mr-2 text-text-subtle" /> <strong>Salary:</strong> &nbsp;{salary}</div>
            <div className="flex items-center"><UserCheck className="w-4 h-4 mr-2 text-text-subtle" /> <strong>Age Limit:</strong> &nbsp;{exam.minimum_age}-{exam.maximum_age} Years</div>
            <div className="flex items-center"><GraduationCap className="w-4 h-4 mr-2 text-text-subtle" /> <strong>Level:</strong> &nbsp;{exam.matchLevel.replace(/_/g, ' ')}</div>
            <div className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-text-subtle" /> <strong>Status:</strong> &nbsp;
              <span className={exam.application_status === 'Active' ? 'text-success font-bold' : ''}>{exam.application_status}</span>
            </div>
          </div>

          <div className="text-[0.75rem] bg-background/50 border border-border p-3 rounded-lg leading-relaxed text-text-muted relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-lg"></div>
            <strong>Why this matches:</strong> {exam.matchingReason}
          </div>
        </div>

        <div className="flex gap-2 p-6 pt-0 mt-auto">
          <Link 
            href={`/exams/${exam.id}`}
            className={`flex-1 btn py-2.5 text-xs justify-center font-bold ${isTopMatch ? 'btn-primary' : 'bg-background hover:bg-card-hover border border-border'}`}
          >
            <Eye className="w-4 h-4 mr-1.5" /> View Details
          </Link>
          
          <button
            onClick={() => toggleBookmark(exam.id)}
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
          Discover Exams
        </h1>
        <p className="text-sm md:text-base text-text-muted mt-2 max-w-2xl">
          We analyzed your profile against our comprehensive database of competitive exams to find the perfect opportunities for you.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('find'); setSearchQuery(''); }}
          className={`px-8 py-3.5 font-bold text-sm transition-all duration-300 border-b-2 -mb-[2px] ${
            activeTab === 'find' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-text-muted hover:text-foreground hover:bg-card-hover/50'
          }`}
        >
          🔍 Recommended For You
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-8 py-3.5 font-bold text-sm transition-all duration-300 border-b-2 -mb-[2px] ${
            activeTab === 'browse' 
              ? 'border-primary text-primary bg-primary/5' 
              : 'border-transparent text-text-muted hover:text-foreground hover:bg-card-hover/50'
          }`}
        >
          📂 Explore All Exams
        </button>
      </div>

      {/* ==================== FILTERS BAR (For Browse All) ==================== */}
      {activeTab === 'browse' && (
        <div className="card bg-card border border-border p-5 grid grid-cols-1 md:grid-cols-6 gap-4">
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

          {/* Exam Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted">Exam Sector</label>
            <select
              value={filterExamCategory}
              onChange={(e) => setFilterExamCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary font-semibold"
            >
              <option value="all">All Sectors</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Civil Services">Civil Services</option>
              <option value="Banking">Banking</option>
              <option value="Defence">Defence</option>
              <option value="Railway">Railway</option>
            </select>
          </div>

          {/* State Domicile Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-muted">State</label>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary font-semibold"
            >
              <option value="all">All India / Central</option>
              <option value="Delhi">Delhi</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>
        </div>
      )}

      {/* ==================== VACANCY GRID ==================== */}
      
      {activeTab === 'find' && (
        <div className="space-y-10">
          {topRecommendations.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Top Matches for Your Profile</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRecommendations.map((exam, i) => renderExamCard(exam, i, true))}
              </div>
            </section>
          )}

          {otherMatches.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-lg font-bold tracking-tight text-text-muted">Other Eligible Exams</h2>
                <div className="flex-1 h-px bg-border/50 ml-4"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-90">
                {otherMatches.map((exam, i) => renderExamCard(exam, i, false))}
              </div>
            </section>
          )}

          {topRecommendations.length === 0 && otherMatches.length === 0 && (
            <div className="card bg-card border border-border p-12 text-center text-text-muted select-none">
              <SlidersHorizontal className="w-12 h-12 text-text-subtle mx-auto mb-3" />
              <h4 className="font-bold text-base text-foreground mb-1">No matching exams found</h4>
              <p className="text-xs">Adjust your search parameters or check your onboarding preferences.</p>
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
            <div className="card bg-card border border-border p-12 text-center text-text-muted select-none">
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
