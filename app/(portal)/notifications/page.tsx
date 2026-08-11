'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Info, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface AlertItem {
  id: string;
  type: 'info' | 'date' | 'match';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export default function Notifications() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setAlerts(data.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        time: new Date(n.created_at).toLocaleDateString(),
        read: n.read
      })));
    }
    setLoading(false);
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Optimistic UI
    setAlerts(alerts.map(a => ({ ...a, read: true })));
    
    await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
  };

  const markRead = async (id: string) => {
    // Optimistic UI
    setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
    
    await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('id', id);
  };

  const deleteAlert = async (id: string) => {
    // Optimistic UI
    setAlerts(alerts.filter(a => a.id !== id));
    
    await supabase
      .from('user_notifications')
      .delete()
      .eq('id', id);
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-8 select-none max-w-3xl mx-auto">
      
      {/* Header title */}
      <div className="flex justify-between items-center border-b border-border pb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary" /> Notifications
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage your latest competitive exam alerts and personalized system advice.
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllRead}
            className="btn btn-secondary py-1.5 px-3 text-xs font-bold"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Alerts list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-text-muted">
            <Bell className="w-8 h-8 animate-pulse mx-auto mb-2 text-text-subtle" />
            <p className="text-xs">Loading your notifications...</p>
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((a) => {
            return (
              <div 
                key={a.id}
                className={`card border p-4 flex gap-4 transition-all ${
                  a.read 
                    ? 'bg-card border-border opacity-75' 
                    : 'bg-primary-light/10 border-primary/25 shadow-sm shadow-primary/5'
                }`}
              >
                {/* Icon wrapper */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white ${
                  a.type === 'date' 
                    ? 'bg-amber-500' 
                    : a.type === 'match' 
                      ? 'bg-green-500' 
                      : 'bg-primary'
                }`}>
                  {a.type === 'date' ? <Calendar className="w-4.5 h-4.5" /> : a.type === 'match' ? <Sparkles className="w-4.5 h-4.5" /> : <Info className="w-4.5 h-4.5" />}
                </div>

                {/* Content body */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <strong className="text-xs md:text-sm font-extrabold text-foreground leading-snug">{a.title}</strong>
                    <span className="text-[0.65rem] text-text-subtle font-semibold shrink-0">{a.time}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{a.body}</p>

                  <div className="flex gap-3 mt-3 pt-2 border-t border-border/50 text-[0.68rem] font-bold">
                    {!a.read && (
                      <button 
                        onClick={() => markRead(a.id)}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark as Read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteAlert(a.id)}
                      className="text-danger hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card bg-card border border-border p-12 text-center text-text-muted">
            <Bell className="w-12 h-12 text-text-subtle mx-auto mb-3" />
            <h4 className="font-bold text-base text-foreground mb-1">All caught up!</h4>
            <p className="text-xs">No new notifications or exam timeline alerts at this time.</p>
          </div>
        )}
      </div>

    </div>
  );
}
