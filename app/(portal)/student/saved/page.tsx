'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getExamsFromDb, getUserBookmarks, toggleUserBookmark } from '@/lib/dbService';
import { Bookmark, Eye, Trash2 } from 'lucide-react';

export default function SavedExams() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const initSaved = async () => {
      // 1. Fetch exams from Supabase database
      const dbExams = await getExamsFromDb();
      setExams(dbExams);

      // 2. Load bookmarks from localStorage as initial state
      let bList: string[] = [];
      const saved = localStorage.getItem('udanpath_bookmarks');
      if (saved) {
        bList = JSON.parse(saved);
      }

      // Check auth status for database bookmarks sync
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        const syncedBookmarks = await getUserBookmarks(session.user.id, dbExams);
        if (syncedBookmarks && syncedBookmarks.length > 0) {
          bList = syncedBookmarks;
          localStorage.setItem('udanpath_bookmarks', JSON.stringify(bList));
        }
      }
      setBookmarks(bList);
    };

    initSaved();
  }, []);

  const removeBookmark = async (id: string) => {
    const updated = bookmarks.filter(bid => bid !== id);
    setBookmarks(updated);
    localStorage.setItem('udanpath_bookmarks', JSON.stringify(updated));

    // Sync database bookmark deletion
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const synced = await toggleUserBookmark(session.user.id, id, exams);
      if (synced) {
        setBookmarks(synced);
        localStorage.setItem('udanpath_bookmarks', JSON.stringify(synced));
      }
    }
  };

  const savedExams = exams.filter(e => bookmarks.includes(e.id));

  return (
    <div className="space-y-8 select-none">
      
      {/* Header title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Bookmark className="w-8 h-8 text-primary" /> Bookmarked Exams
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Review details, syllabus progression, and deadlines for your target competitive exams.
        </p>
      </div>

      {/* Grid of Saved Exams */}
      {savedExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedExams.map((exam) => (
            <div 
              key={exam.id}
              className="card bg-card border border-border p-6 flex flex-col justify-between hover:border-primary/25 transition-all"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2 py-0.5 rounded text-[0.68rem] font-bold bg-background border border-border text-text-muted">
                    {exam.conductingBody}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary-light text-primary text-[0.68rem] font-bold">
                    Saved
                  </span>
                </div>

                <h3 className="font-extrabold text-[1.05rem] text-foreground mb-3">{exam.title}</h3>
                
                <div className="space-y-1.5 text-xs text-text-muted border-b border-border/55 pb-3 mb-4">
                  <div>💼 <strong>Salary:</strong> {exam.salaryRange}</div>
                  <div>👤 <strong>Age Limit:</strong> {exam.minAge}-{exam.maxAgeGen} Years</div>
                  <div>📅 <strong>Frequency:</strong> {exam.frequency}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link 
                  href={`/exams/${exam.id}`}
                  className="flex-1 btn btn-primary py-2 text-xs justify-center font-bold"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                </Link>
                <button
                  onClick={() => removeBookmark(exam.id)}
                  className="px-2.5 py-1.5 rounded-lg border border-danger/20 bg-danger/5 hover:bg-danger/10 text-danger transition-colors"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-card border border-border p-12 text-center text-text-muted">
          <Bookmark className="w-12 h-12 text-text-subtle mx-auto mb-3" />
          <h4 className="font-bold text-base text-foreground mb-1">No bookmarked exams yet</h4>
          <p className="text-xs">Browse exams in the Discovery catalog and click the save bookmark icon.</p>
        </div>
      )}

    </div>
  );
}
