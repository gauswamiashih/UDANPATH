'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  BookOpen, Search, Sparkles, MapPin, 
  Book, Video, ExternalLink, ThumbsUp, ThumbsDown
} from 'lucide-react';

export default function CoursesAndCoaching() {
  const [activeSegment, setActiveSegment] = useState<'courses' | 'centers' | 'books' | 'youtube'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbBooks, setDbBooks] = useState<any[]>([]);
  const [dbYoutube, setDbYoutube] = useState<any[]>([]);
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [dbCenters, setDbCenters] = useState<any[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data, error } = await supabase
          .from('exam_resources')
          .select('*');
        
        if (data && !error) {
          const books = data.filter(r => r.resource_type === 'book').map(r => ({
            title: r.title,
            author: r.author_publisher || 'Unknown',
            subject: 'Recommended Reference Book',
            recommendedFor: 'Competitive Exams Preparation',
            amazonRating: String(r.rating || '4.5')
          }));
          setDbBooks(books);
        }
        
        const res = await fetch('/api/v1/coaching');
        if (res.ok) {
           const coachingData = await res.json();
           setDbCourses(coachingData.online || []);
           setDbCenters(coachingData.offline || []);
           
           const ytMapped = (coachingData.youtube || []).map((r: any) => ({
             name: r.title || r.name || 'Channel',
             examCategory: r.exam_id ? 'Targeted Exam' : 'All competitive exams',
             subscribers: '1M+',
             freeQuality: '5/5 Stars',
             channelUrl: r.url || r.url_link || 'https://youtube.com'
           }));
           setDbYoutube(ytMapped);
        }
      } catch (err) {
        console.error('Error fetching coaching resources:', err);
      }
    };

    fetchResources();
  }, []);

  const q = searchQuery.toLowerCase().trim();

  // Filter content based on active segment and search query
  const filteredCourses = dbCourses.filter(c => 
    (c.course_name || c.name || '').toLowerCase().includes(q) || 
    (c.provider_name || c.institute || '').toLowerCase().includes(q) ||
    (c.language || '').toLowerCase().includes(q)
  );

  const filteredCenters = dbCenters.filter(c => 
    (c.institute_name || c.name || '').toLowerCase().includes(q) || 
    (c.city || '').toLowerCase().includes(q)
  );

  const filteredBooks = dbBooks.filter(b => 
    (b.title || '').toLowerCase().includes(q) || 
    (b.author || '').toLowerCase().includes(q) ||
    (b.subject || '').toLowerCase().includes(q)
  );

  const filteredYoutube = dbYoutube.filter(ch => 
    (ch.name || '').toLowerCase().includes(q) || 
    (ch.examCategory || '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-8 select-none">
      
      {/* Header title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" /> Courses & Coaching Resources
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Review top-tier online batches, offline classroom programs, recommended books, and top YouTube channels.
        </p>
      </div>

      {/* Segment navigation bar */}
      <div className="flex border-b border-border overflow-x-auto gap-2 py-1.5">
        {[
          { id: 'courses', label: '💻 Online Courses' },
          { id: 'centers', label: '🏛️ Offline Classroom Centers' },
          { id: 'books', label: '📚 Reference Books' },
          { id: 'youtube', label: '🎥 YouTube Guides' }
        ].map((segment) => (
          <button
            key={segment.id}
            onClick={() => { setActiveSegment(segment.id as any); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeSegment === segment.id 
                ? 'bg-primary-light text-primary border border-primary/20' 
                : 'text-text-muted hover:bg-card-hover border border-transparent'
            }`}
          >
            {segment.label}
          </button>
        ))}
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-subtle" />
        <input 
          type="text"
          placeholder={`Search ${activeSegment}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary font-semibold"
        />
      </div>

      {/* ==================== SEGMENT VIEWPORT ==================== */}

      {/* Online Courses list */}
      {activeSegment === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((c) => (
            <div key={c.id} className="card bg-card border border-border p-6 flex flex-col justify-between hover:border-primary/25 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[0.68rem] font-bold bg-background border border-border text-text-muted">
                    {c.institute || c.provider_name || 'Institute'}
                  </span>
                  <span className="text-xs font-extrabold text-success bg-green-500/10 px-2 py-0.5 rounded-full">
                    ★ {c.rating || 4.5} Rating
                  </span>
                </div>

                <h3 className="font-extrabold text-[1.05rem] text-foreground mb-1">{c.name || c.course_name}</h3>
                <p className="text-xs text-text-muted mb-4">Duration: {c.duration || 'N/A'} | Medium: {c.language || 'English'}</p>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div className="space-y-1 bg-background border border-border p-2.5 rounded-lg text-green-600 dark:text-green-400">
                    <strong className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> Pros:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-[0.7rem] text-text-muted">
                      {(c.pros || []).length > 0 ? c.pros.map((pro: string, i: number) => <li key={i}>{pro}</li>) : <li>Expert Faculty</li>}
                    </ul>
                  </div>
                  <div className="space-y-1 bg-background border border-border p-2.5 rounded-lg text-red-600 dark:text-red-400">
                    <strong className="flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5" /> Cons:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-[0.7rem] text-text-muted">
                      {(c.cons || []).length > 0 ? c.cons.map((con: string, i: number) => <li key={i}>{con}</li>) : <li>Paced Learning</li>}
                    </ul>
                  </div>
                </div>

                <div className="bg-primary-light border border-primary/10 rounded-lg p-2.5 text-xs text-primary font-bold mb-4">
                  🎁 Discount: {c.discounts || 'Check Website for Offers'}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                <strong className="text-sm font-bold text-foreground">Fees: {c.price || c.price_info || 'Check Website'}</strong>
                <a 
                  href={c.officialWebsite || c.official_link || '#'}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1"
                >
                  Apply Online <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offline Centers list */}
      {activeSegment === 'centers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCenters.map((c) => (
            <div key={c.id} className="card bg-card border border-border p-6 flex flex-col justify-between hover:border-secondary/25 transition-all">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[0.68rem] font-bold bg-background border border-border text-text-muted flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-text-subtle" /> {c.city || 'Multiple Cities'}
                  </span>
                  <span className="text-xs font-extrabold text-accent bg-amber-500/10 px-2 py-0.5 rounded-full">
                    ★ {c.rating || 4.7} (Toppers Favorite)
                  </span>
                </div>

                <h3 className="font-extrabold text-[1.05rem] text-foreground mb-1">{c.name || c.institute_name}</h3>
                <p className="text-xs text-text-muted mb-4">Institute: {c.institute || c.institute_name} | Success Rate: {c.successRate || 'Verified'}</p>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div className="space-y-1 bg-background border border-border p-2.5 rounded-lg text-green-600 dark:text-green-400">
                    <strong className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> Highlights:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-[0.7rem] text-text-muted">
                      {(c.pros || []).length > 0 ? c.pros.map((pro: string, i: number) => <li key={i}>{pro}</li>) : <li>Classroom Support</li>}
                    </ul>
                  </div>
                  <div className="space-y-1 bg-background border border-border p-2.5 rounded-lg text-red-600 dark:text-red-400">
                    <strong className="flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5" /> Limit:</strong>
                    <ul className="list-disc pl-4 space-y-0.5 text-[0.7rem] text-text-muted">
                      {(c.cons || []).length > 0 ? c.cons.map((con: string, i: number) => <li key={i}>{con}</li>) : <li>Fixed Schedule</li>}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                <strong className="text-sm font-bold text-foreground">Fees: {c.price || c.price_info || 'Check Website'}</strong>
                <a 
                  href={c.officialWebsite || c.official_link || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1"
                >
                  Visit Center Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Books Reference list */}
      {activeSegment === 'books' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBooks.map((b, i) => (
            <div key={i} className="card bg-card border border-border p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                <Book className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <strong className="text-xs md:text-sm font-bold text-foreground block truncate">{b.title}</strong>
                  <span className="text-[0.68rem] font-bold text-success">★ {b.amazonRating}</span>
                </div>
                <span className="text-[0.68rem] text-text-muted mt-0.5 block">Author: {b.author} | Subject: {b.subject}</span>
                <span className="text-[0.68rem] text-text-subtle mt-1.5 block">Recommended for: {b.recommendedFor}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YouTube Channels list */}
      {activeSegment === 'youtube' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredYoutube.map((ch, i) => (
            <div key={i} className="card bg-card border border-border p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <strong className="text-xs md:text-sm font-bold text-foreground block truncate">{ch.name}</strong>
                  <span className="text-[0.68rem] font-bold text-text-muted">{ch.subscribers} Subscribers</span>
                </div>
                <span className="text-[0.68rem] text-text-muted mt-0.5 block">Exams: {ch.examCategory} | Content Rating: {ch.freeQuality}</span>
                <a 
                  href={ch.channelUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[0.68rem] font-semibold text-primary hover:underline flex items-center gap-0.5 mt-2"
                >
                  Go to channel <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
