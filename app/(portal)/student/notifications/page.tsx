'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Bell, Check, Trash2, Info, Calendar, Sparkles, 
  Bookmark, Eye, RefreshCw, CheckCheck, Compass
} from 'lucide-react';
import { getExamsFromDb } from '@/lib/dbService';
import { 
  AppNotification, 
  fetchAllNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotificationById, 
  clearAllNotificationsList,
  notifyExamSaved
} from '@/lib/notificationService';

export default function Notifications() {
  const [alerts, setAlerts] = useState<AppNotification[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'date' | 'match'>('all');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const dbExams = await getExamsFromDb();
      setExams(dbExams);
      const notifs = await fetchAllNotifications(dbExams);
      setAlerts(notifs);
    } catch (e) {
      console.error('Error loading notifications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();

    // Listen for notification updates dispatched from other pages/components
    const handleUpdate = () => {
      loadAll();
    };
    window.addEventListener('udanpath_notification_updated', handleUpdate);
    return () => {
      window.removeEventListener('udanpath_notification_updated', handleUpdate);
    };
  }, [loadAll]);

  const handleMarkAllRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    await markAllNotificationsAsRead();
  };

  const handleMarkRead = async (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    await markNotificationAsRead(id);
  };

  const handleDelete = async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await deleteNotificationById(id);
  };

  const handleClearAll = async () => {
    if (confirm('Clear all notifications?')) {
      setAlerts([]);
      await clearAllNotificationsList();
    }
  };

  // Test simulation helper to immediately demonstrate receiving a new notification
  const handleSimulateAlert = () => {
    if (exams.length > 0) {
      const randomExam = exams[Math.floor(Math.random() * exams.length)];
      notifyExamSaved(randomExam);
    } else {
      notifyExamSaved({
        id: 'upsc-cse',
        name: 'UPSC Civil Services Examination 2025-26',
        short_name: 'UPSC CSE',
        application_start_date: 'Feb 14, 2025',
        exam_date: 'May 25, 2025'
      });
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.read;
    if (filter === 'date') return a.type === 'date';
    if (filter === 'match') return a.type === 'match';
    return true;
  });

  return (
    <div className="space-y-8 select-none max-w-3xl mx-auto">
      
      {/* Header title */}
      <div className="flex justify-between items-start md:items-center border-b border-border pb-4 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Bell className="w-7 h-7 text-primary" /> Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Real-time tracking for your saved competitive exams, deadlines, and eligibility updates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="btn btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}

          {alerts.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-card-hover text-text-muted hover:text-danger text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}

          <button 
            onClick={handleSimulateAlert}
            className="btn btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Generate a test notification from catalog"
          >
            <Sparkles className="w-3.5 h-3.5" /> Test Alert
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'all' 
              ? 'bg-primary text-white shadow-sm' 
              : 'bg-card border border-border text-text-muted hover:text-foreground'
          }`}
        >
          All ({alerts.length})
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            filter === 'unread' 
              ? 'bg-primary text-white shadow-sm' 
              : 'bg-card border border-border text-text-muted hover:text-foreground'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>

        <button
          onClick={() => setFilter('date')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            filter === 'date' 
              ? 'bg-primary text-white shadow-sm' 
              : 'bg-card border border-border text-text-muted hover:text-foreground'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Saved & Dates
        </button>

        <button
          onClick={() => setFilter('match')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            filter === 'match' 
              ? 'bg-primary text-white shadow-sm' 
              : 'bg-card border border-border text-text-muted hover:text-foreground'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Matches
        </button>
      </div>

      {/* Alerts list */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="text-center py-16 text-text-muted">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-xs font-semibold">Syncing your exam notifications...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((a) => {
            const isSavedType = a.type === 'date';
            const isMatchType = a.type === 'match';

            return (
              <div 
                key={a.id}
                className={`card border p-4.5 rounded-xl flex gap-4 transition-all duration-200 ${
                  a.read 
                    ? 'bg-card/70 border-border/80 opacity-80' 
                    : 'bg-primary-light/10 border-primary/30 shadow-sm shadow-primary/5'
                }`}
              >
                {/* Icon wrapper */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white ${
                  isSavedType 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                    : isMatchType 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                      : 'bg-gradient-to-br from-primary to-secondary'
                }`}>
                  {isSavedType ? (
                    <Calendar className="w-5 h-5" />
                  ) : isMatchType ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                {/* Content body */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-xs md:text-sm font-extrabold text-foreground leading-snug">
                        {a.title}
                      </strong>
                      {!a.read && (
                        <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                      )}
                    </div>
                    <span className="text-[0.68rem] text-text-subtle font-semibold shrink-0">
                      {a.time}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed mb-3">
                    {a.body}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-[0.72rem] font-bold flex-wrap">
                    <div className="flex items-center gap-3">
                      {a.examId && (
                        <Link 
                          href={`/student/exams/${a.examId}`}
                          className="text-primary hover:underline flex items-center gap-1 font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Exam Details
                        </Link>
                      )}

                      {!a.read && (
                        <button 
                          onClick={() => handleMarkRead(a.id)}
                          className="text-text-muted hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 text-success" /> Mark as Read
                        </button>
                      )}
                    </div>

                    <button 
                      onClick={() => handleDelete(a.id)}
                      className="text-text-subtle hover:text-danger flex items-center gap-1 transition-colors ml-auto"
                      title="Delete this notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card bg-card border border-border p-12 text-center text-text-muted space-y-4">
            <Bell className="w-12 h-12 text-text-subtle mx-auto mb-1 opacity-60" />
            <h4 className="font-bold text-base text-foreground">
              {filter === 'unread' ? 'No unread notifications' : 'All caught up!'}
            </h4>
            <p className="text-xs max-w-sm mx-auto leading-relaxed">
              {filter === 'unread' 
                ? 'You have read all your alerts. Switch to "All" to view previous notifications.' 
                : 'Bookmark target exams in Discover or evaluate your eligibility to receive automated timeline alerts.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link 
                href="/student/exams/discover"
                className="btn btn-primary text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" /> Discover Target Exams
              </Link>
              <Link 
                href="/student/saved"
                className="btn btn-secondary text-xs py-2 px-4 font-bold inline-flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" /> View Saved Exams
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
