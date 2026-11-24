'use client';

import { supabase } from './supabaseClient';

export interface AppNotification {
  id: string;
  type: 'info' | 'date' | 'match';
  title: string;
  body: string;
  time: string;
  read: boolean;
  examId?: string;
  createdAt: string;
}

const STORAGE_KEY = 'udanpath_notifications';
const EVENT_NAME = 'udanpath_notification_updated';

// Helper to safely dispatch state change to UI components (e.g. Header Bell)
export function emitNotificationUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
}

// Read raw notifications from local storage
export function getStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed reading notifications from storage', e);
    return [];
  }
}

// Save raw notifications to local storage and alert listeners
export function saveStoredNotifications(items: AppNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    emitNotificationUpdate();
  } catch (e) {
    console.error('Failed writing notifications to storage', e);
  }
}

// Get the count of unread notifications
export function getUnreadCount(): number {
  const items = getStoredNotifications();
  return items.filter(n => !n.read).length;
}

// Initial fallback notifications if user has zero alerts
function getInitialSeedNotifications(savedExamsList: any[] = []): AppNotification[] {
  const now = new Date();
  const list: AppNotification[] = [];

  // If user has any saved exams, generate targeted alerts for them
  savedExamsList.forEach((exam, idx) => {
    const examDate = exam.exam_date || exam.application_start_date || 'Upcoming in 2025';
    list.push({
      id: `seed-saved-${exam.id || idx}`,
      type: 'date',
      title: `Saved Exam Tracker: ${exam.name || exam.title}`,
      body: `You are tracking ${exam.short_name || exam.code || 'this exam'}. Target date: ${examDate}. Complete your syllabus topics in My Roadmaps!`,
      time: 'Today',
      read: false,
      examId: exam.id,
      createdAt: new Date(now.getTime() - idx * 1000 * 60 * 30).toISOString()
    });
  });

  // General seed notifications
  list.push({
    id: 'seed-notif-1',
    type: 'date',
    title: 'UPSC CSE 2025-26 Registration Opening',
    body: 'The preliminary examination cycle notification has been announced. Review qualification requirements and syllabus breakdown.',
    time: 'Yesterday',
    read: false,
    examId: 'upsc-cse',
    createdAt: new Date(now.getTime() - 86400000).toISOString()
  });

  list.push({
    id: 'seed-notif-2',
    type: 'match',
    title: 'New High-Match Competitive Exam Identified',
    body: 'Based on your educational degree and category criteria, you have an 85%+ qualification match with SSC Combined Graduate Level (CGL).',
    time: '2 days ago',
    read: false,
    examId: 'ssc-cgl',
    createdAt: new Date(now.getTime() - 172800000).toISOString()
  });

  list.push({
    id: 'seed-notif-3',
    type: 'info',
    title: 'Welcome to UdanPath Alert Desk',
    body: 'You will receive real-time updates here whenever you save target exams, when application deadlines approach, or when eligibility changes occur.',
    time: '3 days ago',
    read: true,
    createdAt: new Date(now.getTime() - 259200000).toISOString()
  });

  return list;
}

// Ensure and retrieve all user notifications, combining Supabase DB and local storage
export async function fetchAllNotifications(allExams: any[] = []): Promise<AppNotification[]> {
  let items = getStoredNotifications();

  // 1. If user is authenticated in Supabase, sync from user_notifications table
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const { data: dbData } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (dbData && dbData.length > 0) {
        const mappedDb: AppNotification[] = dbData.map((d: any) => ({
          id: d.id,
          type: (d.type as any) || 'info',
          title: d.title,
          body: d.body,
          time: new Date(d.created_at).toLocaleDateString(),
          read: !!d.read,
          createdAt: d.created_at
        }));

        // Merge DB with local items avoiding duplicate IDs
        const existingIds = new Set(mappedDb.map(m => m.id));
        const merged = [...mappedDb, ...items.filter(i => !existingIds.has(i.id))];
        items = merged;
      }
    }
  } catch (err) {
    console.warn('Could not sync notifications with Supabase, relying on local store:', err);
  }

  // 2. Cross-reference with bookmarked exams in localStorage
  let savedIds: string[] = [];
  try {
    const rawSaved = localStorage.getItem('udanpath_bookmarks');
    if (rawSaved) {
      savedIds = JSON.parse(rawSaved);
    }
  } catch (e) {
    console.error('Error reading saved bookmarks:', e);
  }

  // Generate notification for any saved exam that does not have an alert yet
  if (savedIds.length > 0 && allExams.length > 0) {
    let hasNewSaved = false;
    savedIds.forEach((sId) => {
      const alreadyHas = items.some(item => item.examId === sId);
      if (!alreadyHas) {
        const examObj = allExams.find(e => e.id === sId || e.dbId === sId);
        if (examObj) {
          const examDate = examObj.exam_date || examObj.application_start_date || 'Upcoming';
          items.unshift({
            id: `notif-saved-${examObj.id}-${Date.now()}`,
            type: 'date',
            title: `Target Exam Saved: ${examObj.name || examObj.title}`,
            body: `You saved ${examObj.short_name || examObj.code || 'this exam'} to your target watchlist. Application dates: ${examObj.application_start_date || 'TBA'} to ${examObj.application_end_date || 'TBA'}. Target exam date: ${examDate}. Review the syllabus progression roadmap!`,
            time: 'Just now',
            read: false,
            examId: examObj.id,
            createdAt: new Date().toISOString()
          });
          hasNewSaved = true;
        }
      }
    });
    if (hasNewSaved) {
      saveStoredNotifications(items);
    }
  }

  // 3. If still empty, seed default realistic notifications
  if (items.length === 0) {
    const relevantSavedExams = allExams.filter(e => savedIds.includes(e.id));
    items = getInitialSeedNotifications(relevantSavedExams);
    saveStoredNotifications(items);
  }

  return items;
}

// Add a notification when an exam is bookmarked
export async function notifyExamSaved(exam: {
  id: string;
  name?: string;
  title?: string;
  short_name?: string;
  code?: string;
  application_start_date?: string;
  application_end_date?: string;
  exam_date?: string;
}) {
  const items = getStoredNotifications();
  const examTitle = exam.name || exam.title || 'Exam';
  const examCode = exam.short_name || exam.code || '';
  const dateInfo = exam.exam_date || exam.application_start_date || 'Scheduled for 2025';

  const newAlert: AppNotification = {
    id: `notif-saved-${exam.id}-${Date.now()}`,
    type: 'date',
    title: `Target Exam Saved: ${examTitle}`,
    body: `You saved ${examCode ? `(${examCode}) ` : ''}to your target tracker. Key Dates: Application starts ${exam.application_start_date || 'soon'}, Target exam: ${dateInfo}. Track your preparation milestones and syllabus checklists in My Roadmaps!`,
    time: 'Just now',
    read: false,
    examId: exam.id,
    createdAt: new Date().toISOString()
  };

  // Add to top of list
  const updated = [newAlert, ...items.filter(i => !(i.examId === exam.id && i.title.startsWith('Target Exam Saved')))];
  saveStoredNotifications(updated);

  // Sync with Supabase DB if user is logged in
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await supabase.from('user_notifications').insert([{
        user_id: session.user.id,
        type: newAlert.type,
        title: newAlert.title,
        body: newAlert.body,
        read: false
      }]);
    }
  } catch (err) {
    console.warn('Could not sync bookmark notification to Supabase:', err);
  }
}

// Mark single notification as read
export async function markNotificationAsRead(id: string) {
  const items = getStoredNotifications();
  const updated = items.map(n => n.id === id ? { ...n, read: true } : n);
  saveStoredNotifications(updated);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      await supabase.from('user_notifications').update({ read: true }).eq('id', id);
    }
  } catch (err) {
    console.warn('Could not mark read in Supabase:', err);
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  const items = getStoredNotifications();
  const updated = items.map(n => ({ ...n, read: true }));
  saveStoredNotifications(updated);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await supabase.from('user_notifications').update({ read: true }).eq('user_id', session.user.id);
    }
  } catch (err) {
    console.warn('Could not mark all read in Supabase:', err);
  }
}

// Delete single notification
export async function deleteNotificationById(id: string) {
  const items = getStoredNotifications();
  const updated = items.filter(n => n.id !== id);
  saveStoredNotifications(updated);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      await supabase.from('user_notifications').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Could not delete from Supabase:', err);
  }
}

// Clear all notifications
export async function clearAllNotificationsList() {
  saveStoredNotifications([]);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await supabase.from('user_notifications').delete().eq('user_id', session.user.id);
    }
  } catch (err) {
    console.warn('Could not clear from Supabase:', err);
  }
}
