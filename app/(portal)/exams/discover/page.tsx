'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getExamsFromDb, getUserBookmarks, toggleUserBookmark, getUserProfile } from '@/lib/dbService';
import { calculateMatchScore } from '@/lib/eligibility';
import { 
  Compass, Search, Bookmark, BookmarkCheck, Building2, UserCheck, Eye, Calendar, ArrowRight, ShieldCheck, Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SearchInput } from '@/components/ui/search-input';
import { cn } from '@/lib/utils';

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
  
  const [filterEdu, setFilterEdu] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterExamCategory, setFilterExamCategory] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [sortBy, setSortBy] = useState('match');

  useEffect(() => {
    const loadData = async () => {
      const dbExams = await getExamsFromDb();
      setExams(dbExams);

      const { data: { session } } = await supabase.auth.getSession();
      
      let dbProfile = null;
      if (session && session.user) {
        dbProfile = await getUserProfile(session.user.id);
      }

      if (dbProfile) {
        setProfile(dbProfile);
      } else {
        const localProf = localStorage.getItem('udanpath_onboarding_profile');
        if (localProf) {
          setProfile(JSON.parse(localProf));
        }
      }

      let bList: string[] = [];
      const savedBookmarks = localStorage.getItem('udanpath_bookmarks');
      if (savedBookmarks) {
        bList = JSON.parse(savedBookmarks);
      }

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

    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const synced = await toggleUserBookmark(session.user.id, examId, exams);
      if (synced) {
        setBookmarks(synced);
        localStorage.setItem('udanpath_bookmarks', JSON.stringify(synced));
      }
    }
  };

  const getProcessedExams = () => {
    let list = exams.map((exam) => {
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

    if (activeTab === 'browse') {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(e => 
          (e.name || '').toLowerCase().includes(q) || 
          (e.organization || '').toLowerCase().includes(q) || 
          (e.short_name || '').toLowerCase().includes(q)
        );
      }
      if (filterExamCategory !== 'all') list = list.filter(e => e.category_name === filterExamCategory);
      if (filterState !== 'all') list = list.filter(e => e.state === filterState);
    }

    if (activeTab === 'find') {
      list = list.filter(e => e.matchLevel !== 'NOT_ELIGIBLE');
    }

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
  const topRecommendations = activeTab === 'find' ? processedList.filter(e => e.matchScore >= 70) : [];
  const otherMatches = activeTab === 'find' ? processedList.filter(e => e.matchScore < 70) : [];

  const renderExamCard = (exam: any, index: number, isTopMatch = false) => {
    const isSaved = bookmarks.includes(exam.id);
    const deadline = exam.important_dates?.application_end 
      ? new Date(exam.important_dates.application_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'TBA';
      
    return (
      <Card 
        key={exam.id}
        className={cn("hover:shadow-md transition-all flex flex-col h-full", isTopMatch && "border-primary/50 shadow-sm")}
      >
        <CardContent className="p-6 flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <Badge variant="neutral" className="text-[0.65rem] uppercase tracking-wider">
                {exam.category_name || 'Central'}
              </Badge>
              <Badge variant={exam.matchScore >= 80 ? 'success' : exam.matchScore >= 50 ? 'warning' : 'neutral'} className="text-[0.65rem]">
                {exam.matchScore}% Match
              </Badge>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold text-lg text-foreground leading-tight">{exam.name}</h3>
              <p className="text-sm font-semibold text-text-muted mt-1">{exam.organization} ({exam.short_name})</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm border-b border-border pb-3">
                <span className="text-text-muted flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Eligibility</span>
                <span className={cn("font-medium", exam.matchLevel === 'Eligible' ? 'text-success' : 'text-warning')}>
                  {exam.matchLevel.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border pb-3">
                <span className="text-text-muted flex items-center"><Calendar className="w-4 h-4 mr-2" /> Deadline</span>
                <span className="font-medium text-foreground">{deadline}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-auto">
            <Button variant={isTopMatch ? "primary" : "outline"} className="flex-1 text-sm h-10" asChild>
              <Link href={`/exams/${exam.id}`}>
                View Details
              </Link>
            </Button>
            <Button 
              variant="icon" 
              className="h-10 w-10 border border-border shrink-0"
              onClick={() => toggleBookmark(exam.id)}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Premium Command/Search Area */}
      <div className="bg-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Discover Your Next Target Exam
          </h1>
          <p className="text-text-muted text-lg">
            Search our comprehensive database and let our AI match you with the best opportunities based on your profile.
          </p>
          <SearchInput 
            placeholder="Search UPSC, GATE, Banking, etc..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveTab('browse');
            }}
            className="h-14 shadow-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('find')}
          className={cn(
            "px-8 py-4 font-bold text-sm transition-all duration-300 border-b-2 whitespace-nowrap",
            activeTab === 'find' ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-foreground hover:bg-background-tertiary"
          )}
        >
          Personalized Recommendations
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={cn(
            "px-8 py-4 font-bold text-sm transition-all duration-300 border-b-2 whitespace-nowrap",
            activeTab === 'browse' ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-foreground hover:bg-background-tertiary"
          )}
        >
          Explore All Exams
        </button>
      </div>

      {/* Filters (Browse All) */}
      {activeTab === 'browse' && (
        <Card className="p-4 flex flex-wrap gap-4 items-center bg-background shadow-none border-border">
          <select value={filterEdu} onChange={(e) => setFilterEdu(e.target.value)} className="bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-foreground min-w-[150px]">
            <option value="all">All Degrees</option>
            <option value="B.Tech">B.Tech / Engineering</option>
            <option value="Graduate">Graduate</option>
            <option value="12th">12th Pass</option>
            <option value="10th">10th Pass</option>
          </select>

          <select value={filterExamCategory} onChange={(e) => setFilterExamCategory(e.target.value)} className="bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-foreground min-w-[150px]">
            <option value="all">All Sectors</option>
            <option value="Engineering">Engineering</option>
            <option value="Medical">Medical</option>
            <option value="Civil Services">Civil Services</option>
            <option value="Banking">Banking</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-foreground min-w-[150px] ml-auto">
            <option value="match">Highest Match Score</option>
            <option value="salary">Salary</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </Card>
      )}

      {/* Results */}
      {activeTab === 'find' && (
        <div className="space-y-12">
          {topRecommendations.length > 0 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-6">Top Matches for Your Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRecommendations.map((exam, i) => renderExamCard(exam, i, true))}
              </div>
            </section>
          )}
          {otherMatches.length > 0 && (
            <section>
              <h2 className="text-xl font-bold tracking-tight mb-6 text-text-muted border-t border-border pt-8">Other Eligible Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherMatches.map((exam, i) => renderExamCard(exam, i, false))}
              </div>
            </section>
          )}
          {topRecommendations.length === 0 && otherMatches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted">
              <Compass className="w-12 h-12 mb-4 text-text-subtle" />
              <h3 className="text-lg font-bold">No recommendations found</h3>
              <p className="text-sm">Update your profile or use Explore All Exams.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedList.length > 0 ? (
            processedList.map((exam, i) => renderExamCard(exam, i, exam.matchScore >= 80))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-muted">
              <Search className="w-12 h-12 mb-4 text-text-subtle" />
              <h3 className="text-lg font-bold">No matching exams found</h3>
              <p className="text-sm">Adjust your filters or search query.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
