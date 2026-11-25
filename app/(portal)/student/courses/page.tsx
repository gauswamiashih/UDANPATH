'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  BookOpen, Search, Sparkles, MapPin, 
  Book, Video, ExternalLink, ThumbsUp, ThumbsDown,
  MessageSquare, Star, Send, User, CheckCircle2, ChevronDown, ChevronUp, Filter, GraduationCap
} from 'lucide-react';
import { COACHING_DATABASE, getExams, getCourseReviews, addCourseReview, CourseComment } from '@/lib/examsData';
import { getCoordinatorCourses, getCoordinatorResources } from '@/lib/coordinatorService';

const COURSE_CATEGORY_PILLS = [
  'All',
  'GATE CSE',
  'Systems & Architecture',
  'Aptitude & Math'
] as const;

function getDefaultCommentsForCourse(courseId: string, courseName?: string): CourseComment[] {
  return getCourseReviews(courseId);
}

interface CourseReviewsSectionProps {
  courseId: string;
  courseName: string;
  comments: CourseComment[];
  onAddComment: (courseId: string, comment: { userName: string; rating: number; comment: string }) => void;
}

function CourseReviewsSection({ courseId, courseName, comments, onAddComment }: CourseReviewsSectionProps) {
  const [resolvedUserName, setResolvedUserName] = useState<string>('Bhavik');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentText, setCommentText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. User Identity Resolution in priority order:
    // a) localStorage.getItem('udanpath_onboarding_profile')
    // b) Supabase session user metadata
    // c) Fallback to "Bhavik"
    let resolved = 'Bhavik';
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('udanpath_onboarding_profile');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.fullName?.trim()) {
            resolved = parsed.fullName.trim();
          } else if (parsed.name?.trim()) {
            resolved = parsed.name.trim();
          }
        }
      } catch (e) {
        console.error('Error reading onboarding profile for review identity:', e);
      }
    }

    if (resolved === 'Bhavik') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const metaName = session.user.user_metadata?.full_name;
          const emailName = session.user.email ? session.user.email.split('@')[0] : null;
          if (metaName?.trim()) {
            setResolvedUserName(metaName.trim());
          } else if (emailName?.trim()) {
            setResolvedUserName(emailName.trim());
          } else {
            setResolvedUserName('Bhavik');
          }
        } else {
          setResolvedUserName('Bhavik');
        }
      }).catch(() => {
        setResolvedUserName('Bhavik');
      });
    } else {
      setResolvedUserName(resolved);
    }
  }, []);

  const avgRating = comments.length > 0 
    ? (comments.reduce((acc: number, c: CourseComment) => acc + (c.rating || 5), 0) / comments.length).toFixed(1)
    : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setErrorMsg('Please enter your feedback or review comment.');
      return;
    }

    setErrorMsg(null);
    onAddComment(courseId, {
      userName: resolvedUserName,
      rating: Number(rating) || 5,
      comment: commentText.trim(),
    });

    setRating(5);
    setHoverRating(0);
    setCommentText('');
    setSuccessMsg('Your review has been posted successfully!');

    setTimeout(() => {
      setSuccessMsg(null);
    }, 3500);
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/80 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">
            Student Reviews & Discussion
          </h4>
          <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {comments.length} Review{comments.length === 1 ? '' : 's'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{avgRating} / 5.0</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="max-h-60 overflow-y-auto pr-1 space-y-2.5">
        {comments.length === 0 ? (
          <p className="text-xs text-text-subtle py-3 text-center italic">
            No reviews yet. Be the first to share your thoughts on {courseName}!
          </p>
        ) : (
          comments.map((item) => (
            <div 
              key={item.id} 
              className="bg-background/90 border border-border/80 rounded-lg p-3 space-y-1.5 transition-colors hover:border-border"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <strong className="text-xs font-bold text-foreground truncate">
                    {item.userName}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <Star
                        key={starIndex}
                        className={`w-3 h-3 ${
                          starIndex <= item.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-600/50'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[0.68rem] text-text-subtle">
                    {item.createdAt}
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed break-words pl-8">
                {item.comment}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      <form onSubmit={handleSubmit} className="bg-background/80 border border-border rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Write a Review
          </span>
          <span className="text-[0.65rem] text-text-subtle">Saved automatically</span>
        </div>

        {/* Read-only Authenticated User Identity Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 w-fit">
          <User className="w-3.5 h-3.5 text-primary" />
          <span>Posting as: <strong className="text-foreground">{resolvedUserName}</strong></span>
        </div>

        {/* Rating selection (Interactive stars + Dropdown) */}
        <div className="space-y-1">
          <label className="text-[0.7rem] font-semibold text-text-muted flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Rating
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Interactive Stars Selection */}
            <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg px-2 py-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 hover:scale-110 transition-transform focus:outline-none"
                  aria-label={`Select ${s} star${s > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      (hoverRating || rating) >= s
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-600 hover:text-amber-400/60'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Dropdown Selector */}
            <select
              value={rating}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRating(Number(e.target.value))}
              className="bg-card border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value={5}>5 Stars - Excellent ⭐⭐⭐⭐⭐</option>
              <option value={4}>4 Stars - Very Good ⭐⭐⭐⭐</option>
              <option value={3}>3 Stars - Good ⭐⭐⭐</option>
              <option value={2}>2 Stars - Average ⭐⭐</option>
              <option value={1}>1 Star - Poor ⭐</option>
            </select>
          </div>
        </div>

        {/* Comment / Feedback textarea */}
        <div className="space-y-1">
          <label className="text-[0.7rem] font-semibold text-text-muted flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-primary" /> Comment / Feedback
          </label>
          <textarea
            rows={3}
            placeholder="Share your experience regarding syllabus coverage, faculty pedagogy, doubt clearance, test series..."
            value={commentText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setCommentText(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            className="w-full bg-card border border-border rounded-lg p-2.5 text-xs text-foreground placeholder:text-text-subtle focus:outline-none focus:border-primary resize-none transition-colors"
          />
        </div>

        {/* Error / Success alerts */}
        {errorMsg && (
          <p className="text-[0.72rem] text-red-500 font-semibold bg-red-500/10 border border-red-500/20 rounded-md px-2.5 py-1">
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="text-[0.72rem] text-success font-semibold bg-green-500/10 border border-green-500/20 rounded-md px-2.5 py-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary py-2 px-4 text-xs font-bold w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5" /> Submit Review
        </button>
      </form>
    </div>
  );
}

export default function CoursesPage() {
  const [activeSegment, setActiveSegment] = useState<'courses' | 'centers' | 'books' | 'youtube'>('courses');
  const [courseCategoryPill, setCourseCategoryPill] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbBooks, setDbBooks] = useState<any[]>([]);
  const [dbYoutube, setDbYoutube] = useState<any[]>([]);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [dbCenters, setDbCenters] = useState<any[]>([]);

  // Comments state keyed by courseId
  const [commentsMap, setCommentsMap] = useState<Record<string, CourseComment[]>>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const getStorageKey = (courseId: string) => `udanpath_comments_${courseId}`;

  // Initialize comments from localStorage / unified store
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialMap: Record<string, CourseComment[]> = {};
    const allCourses = dbCourses.length > 0 ? dbCourses : (COACHING_DATABASE.onlineCourses || []);

    allCourses.forEach((c: any, index: number) => {
      const courseId = String(c.id || c.name || c.course_name || `course-${index}`);
      const courseName = c.name || c.course_name;
      try {
        const stored = localStorage.getItem(getStorageKey(courseId));
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialMap[courseId] = parsed;
            return;
          }
        }
      } catch (err) {}

      const initialComments = getCourseReviews(courseId);
      initialMap[courseId] = initialComments;
      try {
        localStorage.setItem(getStorageKey(courseId), JSON.stringify(initialComments));
      } catch (err) {}
    });

    setCommentsMap(initialMap);
  }, [dbCourses]);

  const handleAddComment = (
    courseId: string,
    newCommentData: { userName: string; rating: number; comment: string }
  ) => {
    const newComment: CourseComment = {
      id: 'cmt_' + Date.now(),
      userName: newCommentData.userName.trim(),
      rating: newCommentData.rating,
      comment: newCommentData.comment.trim(),
      createdAt: 'Just now'
    };

    // Update in Unified Store
    addCourseReview(courseId, newComment);

    setCommentsMap((prev: Record<string, CourseComment[]>) => {
      const currentList = prev[courseId] || getCourseReviews(courseId);
      const updatedList = [newComment, ...currentList];

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(getStorageKey(courseId), JSON.stringify(updatedList));
        }
      } catch (err) {}

      return {
        ...prev,
        [courseId]: updatedList
      };
    });
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // 1. Gather courses from Unified Store Exams
        const unifiedExams = getExams();
        const examCourses: any[] = [];
        unifiedExams.forEach(exam => {
          (exam.curatedCourses || []).forEach(cc => {
            examCourses.push({
              id: cc.id,
              name: cc.title,
              institute: cc.provider,
              faculty: (cc as any).faculty || cc.provider,
              duration: cc.duration,
              rating: cc.rating,
              price: 'Verified Batch',
              language: 'English / Hinglish',
              officialWebsite: cc.enrollUrl || '#',
              category: exam.domain || 'Engineering & Tech',
              pros: [cc.level || 'Comprehensive Batch', 'Verified Curriculum', `Mapped to ${exam.short_name || exam.name}`],
              cons: ['High Demand']
            });
          });
        });

        // 2. Fetch coordinator courses
        const coordCourses = getCoordinatorCourses();
        const mappedCoordCourses = coordCourses.map((c: any) => ({
          id: c.id,
          name: c.name || c.title,
          institute: c.provider,
          faculty: c.instructor || c.provider,
          price: c.price,
          duration: c.duration,
          language: c.language || 'English / Hinglish',
          rating: c.rating || 4.8,
          pros: c.highlights || c.features || ['Verified Provider', 'Comprehensive Batch'],
          cons: ['High Demand Batch'],
          officialWebsite: c.courseUrl || c.affiliateUrl || '#',
          discounts: c.badge ? `${c.badge} - Exclusive Offer` : 'Special Batch Access',
        }));

        // 3. Fallback database courses
        const baseCourses = COACHING_DATABASE.onlineCourses || [];

        // Combine and dedup by id/name
        const combined = [...examCourses, ...mappedCoordCourses];
        const existingIds = new Set(combined.map(m => m.id));
        baseCourses.forEach((b: any) => {
          if (!existingIds.has(b.id)) {
            combined.push(b);
          }
        });

        setDbCourses(combined);
        setDbCenters(COACHING_DATABASE.offlineInstitutes || []);
        setDbBooks(COACHING_DATABASE.topBooks || []);
        setDbYoutube(COACHING_DATABASE.youtubeChannels || []);

      } catch (err) {
        console.error('Error fetching coaching resources:', err);
        setDbBooks(COACHING_DATABASE.topBooks || []);
        setDbCourses(COACHING_DATABASE.onlineCourses || []);
        setDbCenters(COACHING_DATABASE.offlineInstitutes || []);
        setDbYoutube(COACHING_DATABASE.youtubeChannels || []);
      }
    };

    fetchResources();

    const handleSync = () => {
      fetchResources();
    };

    window.addEventListener('udanpath_master_store_updated', handleSync);
    window.addEventListener('udanpath_coordinator_data_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('udanpath_master_store_updated', handleSync);
      window.removeEventListener('udanpath_coordinator_data_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const q = searchQuery.toLowerCase().trim();

  // Dynamic Category Filtering for Courses
  let courseList = dbCourses;
  if (courseCategoryPill !== 'All') {
    courseList = courseList.filter((c: any) => {
      const name = (c.course_name || c.name || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const cat = (c.category || '').toLowerCase();
      const prosStr = (c.pros || []).join(' ').toLowerCase();

      if (courseCategoryPill === 'GATE CSE') {
        return name.includes('gate') || cat.includes('gate') || desc.includes('gate') || prosStr.includes('gate') || name.includes('cse');
      }
      if (courseCategoryPill === 'Systems & Architecture') {
        return name.includes('system') || name.includes('architecture') || name.includes('algorithms') || desc.includes('system') || prosStr.includes('system') || prosStr.includes('architecture');
      }
      if (courseCategoryPill === 'Aptitude & Math') {
        return name.includes('aptitude') || name.includes('math') || name.includes('quant') || desc.includes('aptitude') || prosStr.includes('aptitude') || prosStr.includes('math');
      }
      return true;
    });
  }

  // Filter content based on active segment and search query
  const filteredCourses = courseList.filter((c: any) => 
    (c.course_name || c.name || '').toLowerCase().includes(q) || 
    (c.provider_name || c.institute || '').toLowerCase().includes(q) ||
    (c.faculty || c.instructor || '').toLowerCase().includes(q) ||
    (c.language || '').toLowerCase().includes(q)
  );

  const filteredCenters = dbCenters.filter((c: any) => 
    (c.institute_name || c.name || '').toLowerCase().includes(q) || 
    (c.city || '').toLowerCase().includes(q)
  );

  const filteredBooks = dbBooks.filter((b: any) => 
    (b.title || '').toLowerCase().includes(q) || 
    (b.author || '').toLowerCase().includes(q) ||
    (b.subject || '').toLowerCase().includes(q)
  );

  const filteredYoutube = dbYoutube.filter((ch: any) => 
    (ch.name || '').toLowerCase().includes(q) || 
    (ch.examCategory || '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-8 select-none">
      
      {/* Header title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" /> Courses, Faculty Batches & Discussion
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Explore curated courses, faculty profiles, verified platform batches, and peer student reviews.
        </p>
      </div>

      {/* Segment navigation bar */}
      <div className="flex border-b border-border overflow-x-auto gap-2 py-1.5">
        {[
          { id: 'courses', label: '💻 Online Courses & Batches' },
          { id: 'centers', label: '🏛️ Offline Classroom Centers' },
          { id: 'books', label: '📚 Reference Books' },
          { id: 'youtube', label: '🎥 YouTube Guides' }
        ].map((segment) => (
          <button
            key={segment.id}
            onClick={() => { setActiveSegment(segment.id as any); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              activeSegment === segment.id 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'text-text-muted hover:bg-card-hover border-transparent'
            }`}
          >
            {segment.label}
          </button>
        ))}
      </div>

      {/* Category Tabs for Online Courses: ('All', 'GATE CSE', 'Systems & Architecture', 'Aptitude & Math') */}
      {activeSegment === 'courses' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-text-muted shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {COURSE_CATEGORY_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => setCourseCategoryPill(pill)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                courseCategoryPill === pill
                  ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20 scale-105'
                  : 'bg-card text-text-muted hover:text-foreground border-border hover:border-primary/40'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      )}

      {/* Search Filter */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
        <input 
          type="text"
          placeholder={`Search ${activeSegment} by title, faculty, or provider...`}
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary font-medium"
        />
      </div>

      {/* ==================== SEGMENT VIEWPORT ==================== */}

      {/* Online Courses list */}
      {activeSegment === 'courses' && (
        <div className="space-y-6">
          {/* Quick Course Selector for Reviews & Feedback */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  Student Discussion & Verified Reviews
                  <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20">
                    Live Feed
                  </span>
                </h3>
                <p className="text-[0.72rem] text-text-muted">
                  Select any course card to inspect peer feedback or publish your own review.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-muted shrink-0 hidden md:inline">
                Jump to Course:
              </span>
              <select
                value={selectedCourseId || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = e.target.value || null;
                  setSelectedCourseId(val);
                  if (val) {
                    setTimeout(() => {
                      const el = document.getElementById(`course-card-${val}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }
                }}
                className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary font-medium w-full sm:w-auto max-w-[280px]"
              >
                <option value="">-- Select Course ({filteredCourses.length}) --</option>
                {filteredCourses.map((c: any, idx: number) => {
                  const courseId = String(c.id || c.name || c.course_name || `course-${idx}`);
                  const courseName = c.name || c.course_name || `Course ${idx + 1}`;
                  const comments = commentsMap[courseId] || getCourseReviews(courseId);
                  return (
                    <option key={courseId} value={courseId}>
                      {courseName.length > 32 ? courseName.slice(0, 32) + '...' : courseName} ({comments.length} reviews)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((c: any, index: number) => {
              const courseId = String(c.id || c.name || c.course_name || `course-${index}`);
              const courseName = c.name || c.course_name || 'Course';
              const comments = commentsMap[courseId] || getCourseReviews(courseId);
              const isSelected = selectedCourseId === courseId;
              
              const avgRating = comments.length > 0 
                ? (comments.reduce((acc: number, curr: CourseComment) => acc + (curr.rating || 5), 0) / comments.length).toFixed(1)
                : String(c.rating || '4.5');

              const facultyName = c.faculty || c.instructor || c.provider || c.institute || 'Senior Faculty';

              return (
                <div 
                  key={courseId} 
                  id={`course-card-${courseId}`}
                  className={`card bg-card border ${
                    isSelected 
                      ? 'border-primary ring-1 ring-primary/40 shadow-xl' 
                      : 'border-border hover:border-primary/30'
                  } p-6 flex flex-col justify-between transition-all rounded-2xl`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[0.68rem] font-bold bg-background border border-border text-text-muted">
                        {c.institute || c.provider || 'Provider'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCourseId(isSelected ? null : courseId)}
                        className="flex items-center gap-1 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                        title="Click to view reviews"
                      >
                        <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                        <span>{avgRating} Rating ({comments.length})</span>
                      </button>
                    </div>

                    <h3 className="font-extrabold text-[1.1rem] text-foreground mb-1">
                      {courseName}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-4 flex-wrap">
                      <span className="font-semibold text-primary">Faculty: {facultyName}</span>
                      <span>•</span>
                      <span>Duration: {c.duration || 'Flexible'}</span>
                      <span>•</span>
                      <span>Medium: {c.language || 'English / Hinglish'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                      <div className="space-y-1 bg-background border border-border p-3 rounded-xl text-emerald-400">
                        <strong className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> Highlights:</strong>
                        <ul className="list-disc pl-4 space-y-0.5 text-[0.7rem] text-text-muted">
                          {(c.pros || []).length > 0 ? c.pros.map((pro: string, i: number) => <li key={i}>{pro}</li>) : <li>Comprehensive Material</li>}
                        </ul>
                      </div>
                      <div className="space-y-1 bg-background border border-border p-3 rounded-xl text-amber-400">
                        <strong className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Pedagogy:</strong>
                        <ul className="list-disc pl-4 space-y-0.5 text-[0.7rem] text-text-muted">
                          <li>Daily Practice DPPs</li>
                          <li>Weekly Mock Quizzes</li>
                        </ul>
                      </div>
                    </div>

                    {c.price && (
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 text-xs text-primary font-bold mb-4 flex justify-between items-center">
                        <span>Batch Access: {c.price}</span>
                        {c.discounts && <span className="text-[0.68rem] font-semibold text-text-muted">{c.discounts}</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex gap-2">
                      <a
                        href={c.officialWebsite || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 btn btn-primary py-2.5 text-xs justify-center font-bold flex items-center gap-1.5"
                      >
                        Visit Batch Platform <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setSelectedCourseId(isSelected ? null : courseId)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-primary text-white border-primary' 
                            : 'bg-background hover:bg-card-hover border-border text-text-muted'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {comments.length}
                        {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Context-Aware Review System (Appended immediately) */}
                    {isSelected && (
                      <CourseReviewsSection
                        courseId={courseId}
                        courseName={courseName}
                        comments={comments}
                        onAddComment={handleAddComment}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {filteredCourses.length === 0 && (
              <div className="col-span-2 text-center py-12 text-text-muted text-xs border border-dashed border-border rounded-2xl">
                No courses found matching selected category filter or keyword.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Classroom Centers list */}
      {activeSegment === 'centers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCenters.map((c: any, index: number) => (
            <div key={c.id || index} className="card bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-extrabold text-[1.1rem] text-foreground">{c.institute_name || c.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                    ★ {c.rating || 4.7}
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-subtle" /> Location: {c.city}
                </p>
                <div className="text-xs text-text-muted space-y-1 mb-4">
                  <p>Batch Fees: <strong className="text-foreground">{c.price || 'Contact for schedule'}</strong></p>
                  <p>Courses Offered: {c.courses_offered ? c.courses_offered.join(', ') : 'GATE, UPSC, ESE'}</p>
                </div>
              </div>

              <a
                href={c.officialWebsite || '#'}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary py-2 text-xs font-bold justify-center flex items-center gap-1.5"
              >
                Inquire Admissions <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Reference Books list */}
      {activeSegment === 'books' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBooks.map((b: any, index: number) => (
            <div key={index} className="card bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-extrabold text-sm md:text-base text-foreground">{b.title}</h3>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">
                    ★ {b.amazonRating || '4.8'}
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-2">Author / Publisher: <strong className="text-foreground">{b.author}</strong></p>
                <span className="inline-block px-2 py-0.5 rounded text-[0.7rem] bg-secondary/10 text-secondary font-bold">
                  {b.subject}
                </span>
              </div>

              <div className="pt-4 border-t border-border mt-4 flex justify-between items-center text-xs">
                <span className="text-text-muted">Recommended for: {b.recommendedFor}</span>
                <Book className="w-4 h-4 text-text-subtle" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YouTube Guides list */}
      {activeSegment === 'youtube' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredYoutube.map((ch: any, index: number) => (
            <div key={index} className="card bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-extrabold text-[1.05rem] text-foreground">{ch.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-xs font-bold">
                    YouTube
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-2">Educator: {ch.educatorName || 'Senior Faculty'} • {ch.subscribers || '1M+ subscribers'}</p>
                <p className="text-xs text-text-muted">{ch.specialty || 'Free conceptual lectures and problem solving'}</p>
              </div>

              <a
                href={ch.channelUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary py-2 text-xs font-bold justify-center flex items-center gap-1.5 mt-4"
              >
                Open Channel <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
