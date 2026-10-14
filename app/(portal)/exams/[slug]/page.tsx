'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Exam, getExamBySlug, getExams } from '@/lib/examsData';
import { evaluateEligibility } from '@/lib/eligibility';
import { supabase } from '@/lib/supabaseClient';
import { getUserBookmarks, toggleUserBookmark } from '@/lib/dbService';
import { 
  CheckCircle2, ArrowRight, ExternalLink, MessageSquare, 
  Bot, Clock, CheckSquare, Calendar, Building2, MapPin, Target, Sparkles, BookOpen, Bookmark, Download, BookText, FileText, CheckCircle,
  ArrowLeft, BookmarkCheck, Search, Bell, Book, Video, Check, AlertTriangle, Layers, Percent, Trophy, ShieldCheck
} from 'lucide-react';
import { 
  getCoordinatorExamUpdates, 
  getCoordinatorSyllabus, 
  getCoordinatorResources, 
  getCoordinatorCourses,
  getCoordinatorEligibility 
} from '@/lib/coordinatorService';

interface ExamDetailProps {
  params: Promise<{ slug: string }>;
}

export default function ExamDetail({ params }: ExamDetailProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const examSlug = resolvedParams.slug;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({
    fullName: 'Aspirant',
    category: 'GENERAL',
    education: 'B.Tech',
    branch: 'Computer Engineering',
    cgpa: 8.2,
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [pyqYear, setPyqYear] = useState('all');

  // Syllabus checkmarks state persisted in localStorage
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  useEffect(() => {
    const loadExamData = () => {
      // 1. Resolve target exam dynamically from unified reactive store
      const resolved = getExamBySlug(examSlug);

      if (resolved) {
        // Merge coordinator updates from localStorage if available
        const coordUpdates = getCoordinatorExamUpdates();
        const update = coordUpdates.find((u: any) =>
          u.examId?.toLowerCase() === resolved.id?.toLowerCase() ||
          u.examId?.toLowerCase() === resolved.slug?.toLowerCase() ||
          (u.examName && u.examName.toLowerCase().includes(resolved.short_name?.toLowerCase()))
        );

        let finalExam = { ...resolved };
        if (update) {
          finalExam = {
            ...finalExam,
            examDate: update.examDate || finalExam.examDate || finalExam.exam_date,
            exam_date: update.examDate || finalExam.exam_date || finalExam.examDate,
            admitCardDate: update.admitCardDate || finalExam.admitCardDate || finalExam.admit_card_date,
            resultDate: update.resultDate || finalExam.resultDate || finalExam.result_date,
            registrationWindow: {
              startDate: update.registrationStartDate || finalExam.registrationWindow?.startDate || finalExam.application_start_date || '2026-01-01',
              endDate: update.registrationEndDate || finalExam.registrationWindow?.endDate || finalExam.application_end_date || '2026-03-31'
            },
            application_status: update.status === 'Live' ? 'Active' : (update.status || finalExam.application_status),
            conductingAuthority: update.conductingBody || finalExam.conductingAuthority || finalExam.organization,
            organization: update.conductingBody || finalExam.organization || finalExam.conductingAuthority || 'National Exam Board'
          };
        }

        setExam(finalExam);

        // Load dynamic syllabus checkboxes
        const storageKey = `udanpath_syllabus_${finalExam.slug || finalExam.id}_progress`;
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            setCompletedTopics(JSON.parse(stored));
          }
        } catch (e) {
          console.error('Error loading syllabus progress:', e);
        }
      } else {
        setExam(null);
      }
      setLoading(false);
    };

    // Load Profile
    const localProf = localStorage.getItem('udanpath_onboarding_profile');
    if (localProf) {
      try {
        setProfile(JSON.parse(localProf));
      } catch (e) {}
    }

    // Load Bookmarks
    const savedBookmarks = localStorage.getItem('udanpath_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {}
    }

    loadExamData();

    const handleSync = () => {
      loadExamData();
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
  }, [examSlug]);

  const toggleBookmark = async () => {
    if (!exam) return;
    const targetId = exam.slug || exam.id;
    let updated = [...bookmarks];
    if (updated.includes(targetId) || updated.includes(exam.id)) {
      updated = updated.filter(id => id !== targetId && id !== exam.id);
    } else {
      updated = [...updated, targetId];
    }
    setBookmarks(updated);
    localStorage.setItem('udanpath_bookmarks', JSON.stringify(updated));

    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await toggleUserBookmark(session.user.id, exam.id, getExams());
    }

    showToast(updated.includes(targetId) ? 'Saved to bookmarks!' : 'Removed from bookmarks.');
  };

  const toggleSyllabusTopic = (topic: string, checked: boolean) => {
    if (!exam) return;
    const targetId = exam.slug || exam.id;
    const storageKey = `udanpath_syllabus_${targetId}_progress`;

    const updated = {
      ...completedTopics,
      [topic]: checked
    };
    setCompletedTopics(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    showToast(`Marked "${topic}" as ${checked ? 'completed' : 'pending'}.`);
  };

  if (loading) {
    return (
      <div className="card bg-card border border-border p-12 text-center text-text-muted flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-semibold">Resolving exam specifications...</span>
        </div>
      </div>
    );
  }

  // Fallback: Exam Not Found
  if (!exam) {
    return (
      <div className="space-y-6">
        <Link 
          href="/exams/discover"
          className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-foreground hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover Catalog
        </Link>
        <div className="card bg-card border border-border p-12 text-center rounded-2xl max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Exam Not Found</h2>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            The requested exam slug <code className="bg-background px-2 py-0.5 rounded text-primary font-mono text-xs">"{examSlug}"</code> is not registered in the UdanPath dynamic catalog.
          </p>
          <Link 
            href="/exams/discover"
            className="btn btn-primary py-2.5 px-6 font-bold text-sm inline-flex items-center gap-2"
          >
            Explore Available Exams <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic Metrics
  const isSaved = bookmarks.includes(exam.id) || (exam.slug && bookmarks.includes(exam.slug));
  const authority = exam.conductingAuthority || exam.organization || 'Exam Board';
  const salaryString = exam.salary_information?.approx_in_hand_monthly 
    ? `₹${exam.salary_information.approx_in_hand_monthly.toLocaleString()}/mo` 
    : (exam.salary_information?.pay_scale || 'N/A');

  const regStart = exam.registrationWindow?.startDate || exam.application_start_date || 'TBA';
  const regEnd = exam.registrationWindow?.endDate || exam.application_end_date || 'TBA';
  const admitDate = exam.admitCardDate || exam.admit_card_date || 'TBA';
  const examDate = exam.examDate || exam.exam_date || 'TBA';
  const resultDate = exam.resultDate || exam.result_date || 'TBA';

  // Calculate Syllabus Completion Percentage
  const syllabusSubjects = exam.syllabusTree || [];
  let totalTopics = 0;
  let completedCount = 0;
  syllabusSubjects.forEach(sub => {
    (sub.units || []).forEach(unit => {
      (unit.topics || []).forEach(t => {
        totalTopics += 1;
        if (completedTopics[t]) completedCount += 1;
      });
    });
  });
  const syllabusPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  // Filter PYQs
  const pyqList = exam.pyqs || [];
  const filteredPyqs = pyqList.filter(p => {
    if (pyqYear === 'all') return true;
    return String(p.year) === pyqYear;
  });

  const eligibilityReport = evaluateEligibility(exam, profile);

  const tabs = [
    { id: 'overview', label: 'Overview & Timeline' },
    { id: 'syllabus', label: `Syllabus Tree (${syllabusPct}% Done)` },
    { id: 'pattern', label: 'Pattern & Cutoffs' },
    { id: 'pyqs', label: `PYQs & Papers (${pyqList.length})` },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'courses', label: `Curated Courses (${(exam.curatedCourses || []).length})` }
  ];

  return (
    <div className="space-y-6 select-none relative pb-10">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-card border border-primary/30 text-foreground text-sm font-semibold px-4 py-3 rounded-xl shadow-xl z-50 animate-slide-in">
          ✓ {toastMsg}
        </div>
      )}

      {/* Back button */}
      <Link 
        href="/exams/discover"
        className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-foreground hover:underline"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Discover catalog
      </Link>

      {/* Header Panel summary */}
      <div className="card bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center">
              <Building2 className="w-3.5 h-3.5 mr-1" />
              {authority}
            </span>
            {exam.domain && (
              <span className="px-2.5 py-1 rounded-md bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold">
                {exam.domain}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              {exam.application_status || 'Cycle Active'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            {exam.name} <span className="text-text-muted text-lg font-semibold ml-1">({exam.short_name || exam.code})</span>
          </h1>
          <p className="text-xs md:text-sm text-text-muted mt-2 max-w-3xl leading-relaxed">{exam.description}</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button 
            onClick={() => setShowRedirectModal(true)}
            className="flex-1 md:flex-none btn btn-primary py-2.5 px-6 justify-center font-bold text-sm shadow-md"
          >
            Apply Official <ExternalLink className="w-4 h-4 ml-1.5" />
          </button>
          
          <button 
            onClick={toggleBookmark}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-card-hover text-text-muted transition-colors"
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

      {/* Quick Summary Badges Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pay Scale / In-Hand', val: salaryString },
          { label: 'Qualifying Degree', val: exam.eligibilityRules?.degree || exam.eligibilityRules?.degrees?.[0] || exam.minimum_qualification || 'Graduate' },
          { label: 'Age Limit', val: typeof exam.eligibilityRules?.ageLimit === 'string' ? exam.eligibilityRules.ageLimit : `${exam.minimum_age || 18}-${exam.maximum_age || 32} Yrs` },
          { label: 'Syllabus Progress', val: `${syllabusPct}% Tracked (${completedCount}/${totalTopics})` }
        ].map((item, index) => (
          <div key={index} className="card bg-card border border-border p-4 rounded-xl text-center">
            <span className="text-[0.68rem] font-bold text-text-subtle uppercase tracking-wider block mb-1">{item.label}</span>
            <strong className="text-xs md:text-sm font-extrabold text-foreground">{item.val}</strong>
          </div>
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-border bg-background/95 backdrop-blur-md overflow-x-auto py-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              activeTab === tab.id 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'text-text-muted hover:bg-card-hover hover:text-foreground border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB DETAILS ==================== */}
      
      {/* Tab: Overview & Timeline */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card bg-card border border-border p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-extrabold border-b border-border pb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Exam Overview & Guidelines
              </h3>
              <p className="text-xs md:text-sm text-text-muted leading-relaxed">{exam.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
                <div className="bg-background/60 p-3 rounded-lg border border-border/60">
                  <span className="text-text-subtle font-medium block">Conducting Body</span>
                  <strong className="text-foreground mt-0.5 block">{authority}</strong>
                </div>
                <div className="bg-background/60 p-3 rounded-lg border border-border/60">
                  <span className="text-text-subtle font-medium block">Sector / Domain</span>
                  <strong className="text-foreground mt-0.5 block">{exam.domain || exam.category_name || 'Central Exam'}</strong>
                </div>
                <div className="bg-background/60 p-3 rounded-lg border border-border/60">
                  <span className="text-text-subtle font-medium block">Selection Process</span>
                  <strong className="text-foreground mt-0.5 block">{exam.selection_process ? exam.selection_process.join(' → ') : 'Online CBT, Interview'}</strong>
                </div>
                <div className="bg-background/60 p-3 rounded-lg border border-border/60">
                  <span className="text-text-subtle font-medium block">Official Notification</span>
                  <a 
                    href={exam.officialWebsite || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary font-bold mt-0.5 flex items-center gap-1 hover:underline"
                  >
                    View Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Timeline */}
          <div className="card bg-card border border-border p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold border-b border-border pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Dynamic Timeline
            </h3>

            <div className="space-y-4">
              {[
                { label: 'Registration Window', date: `${regStart} to ${regEnd}`, icon: Clock, highlight: true },
                { label: 'Admit Card Release', date: admitDate, icon: CheckSquare },
                { label: 'Examination Date', date: examDate, icon: Calendar, active: true },
                { label: 'Results & Merit List', date: resultDate, icon: Trophy }
              ].map((ev, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-border/80 bg-background">
                  <div className={`p-2 rounded-lg mt-0.5 ${ev.highlight ? 'bg-primary/10 text-primary' : 'bg-card text-text-subtle'}`}>
                    <ev.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.68rem] font-bold text-text-subtle uppercase block">{ev.label}</span>
                    <strong className={`text-xs block mt-0.5 ${ev.highlight ? 'text-primary font-black' : 'text-foreground'}`}>
                      {ev.date}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => showToast('Calendar reminder notifications armed!')}
              className="w-full btn btn-primary py-2 text-xs font-bold justify-center mt-2 flex items-center gap-2"
            >
              <Bell className="w-3.5 h-3.5" /> Sync Timeline to Reminders
            </button>
          </div>
        </div>
      )}

      {/* Tab: Syllabus Tree with Interactive Checkboxes */}
      {activeTab === 'syllabus' && (
        <div className="card bg-card border border-border p-6 rounded-2xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Dynamic Syllabus Tree
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Check off topics as you prepare. Progress is tracked in your local study store.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Progress bar */}
              <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg border border-border">
                <span className="text-xs font-bold text-primary">{syllabusPct}%</span>
                <div className="w-24 h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${syllabusPct}%` }} />
                </div>
              </div>

              {/* Topic search */}
              <div className="relative flex-1 md:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle" />
                <input 
                  type="text"
                  placeholder="Search topics..."
                  value={syllabusSearch}
                  onChange={(e) => setSyllabusSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {syllabusSubjects.map((sub, sIdx) => {
              const q = syllabusSearch.toLowerCase().trim();
              const filteredUnits = (sub.units || []).filter(u => 
                u.name.toLowerCase().includes(q) || 
                (u.topics || []).some(t => t.toLowerCase().includes(q))
              );

              if (filteredUnits.length === 0) return null;

              return (
                <div key={sIdx} className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-border/60">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-2">
                      <BookText className="w-4 h-4" /> {sub.subject}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredUnits.map((unit, uIdx) => (
                      <div key={uIdx} className="bg-background/80 border border-border rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <strong className="text-xs font-bold text-foreground block">{unit.name}</strong>
                          {unit.weightagePercentage != null && (
                            <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                              ~{unit.weightagePercentage}% Wt.
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 pt-1 border-t border-border/40">
                          {(unit.topics || []).filter(t => t.toLowerCase().includes(q)).map((topic, tIdx) => {
                            const checked = !!completedTopics[topic];
                            return (
                              <label key={tIdx} className="flex items-center gap-2.5 text-xs text-text-muted hover:text-foreground cursor-pointer group">
                                <input 
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => toggleSyllabusTopic(topic, e.target.checked)}
                                  className="w-4 h-4 rounded text-primary border-border focus:ring-0 cursor-pointer"
                                />
                                <span className={`transition-all ${checked ? 'line-through text-text-subtle font-normal' : 'font-medium'}`}>
                                  {topic}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {syllabusSubjects.length === 0 && (
              <div className="text-center py-8 text-text-muted text-xs">
                Syllabus specifications will be populated shortly.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Pattern & Cutoffs */}
      {activeTab === 'pattern' && (
        <div className="space-y-6">
          {/* Pattern Table */}
          <div className="card bg-card border border-border p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold border-b border-border pb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" /> Examination Pattern & Section Weights
            </h3>

            {exam.exam_pattern && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-background border border-border text-center">
                  <span className="text-[0.65rem] text-text-subtle uppercase block font-bold">Total Marks</span>
                  <strong className="text-sm font-black text-primary">{exam.exam_pattern.total_marks || 100}</strong>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border text-center">
                  <span className="text-[0.65rem] text-text-subtle uppercase block font-bold">Duration</span>
                  <strong className="text-sm font-black text-foreground">{exam.exam_pattern.duration_minutes || 180} Mins</strong>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border text-center">
                  <span className="text-[0.65rem] text-text-subtle uppercase block font-bold">Total Questions</span>
                  <strong className="text-sm font-black text-foreground">{exam.exam_pattern.total_questions || 'Varies'}</strong>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border text-center">
                  <span className="text-[0.65rem] text-text-subtle uppercase block font-bold">Negative Marking</span>
                  <strong className="text-sm font-black text-amber-400">{exam.exam_pattern.negative_marking || 'Standard'}</strong>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="py-2.5 font-bold">Section / Paper</th>
                    <th className="py-2.5 font-bold">Marks</th>
                    <th className="py-2.5 font-bold">Questions</th>
                    <th className="py-2.5 font-bold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(exam.exam_pattern?.sections) ? exam.exam_pattern.sections : []).map((sec: any, idx: number) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-card-hover/40">
                      <td className="py-3 font-bold text-foreground">{sec.name}</td>
                      <td className="py-3 font-extrabold text-primary">{sec.marks} Marks</td>
                      <td className="py-3 text-text-muted">{sec.questions} Qs</td>
                      <td className="py-3 text-text-muted">{sec.type}</td>
                    </tr>
                  ))}
                  {(!Array.isArray(exam.exam_pattern?.sections) || exam.exam_pattern.sections.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-text-muted">General single-tier computer based test pattern.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cutoffs Table */}
          <div className="card bg-card border border-border p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold border-b border-border pb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" /> Previous Year Qualifying Cutoffs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="py-2.5 font-bold">Year</th>
                    <th className="py-2.5 font-bold">Category</th>
                    <th className="py-2.5 font-bold">Qualifying Cutoff Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(exam.cutoffs || []).map((cut, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-card-hover/40">
                      <td className="py-3 font-bold text-foreground">{cut.year}</td>
                      <td className="py-3 font-semibold text-text-muted">{cut.category}</td>
                      <td className="py-3 font-black text-primary">{cut.score}</td>
                    </tr>
                  ))}
                  {(!exam.cutoffs || exam.cutoffs.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-text-muted">Cutoff statistics published alongside annual merit list.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: PYQs */}
      {activeTab === 'pyqs' && (
        <div className="card bg-card border border-border p-6 rounded-2xl space-y-5">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Previous Year Question Papers (PYQs)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Direct official question papers and verified solution sets.</p>
            </div>
            
            <div className="flex gap-2">
              <select 
                value={pyqYear}
                onChange={(e) => setPyqYear(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-primary"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredPyqs.length > 0 ? (
              filteredPyqs.map((paper, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs md:text-sm text-foreground block">{paper.title}</strong>
                      <span className="text-[0.7rem] text-text-muted mt-0.5 block">Official Academic Exam Paper • Year {paper.year}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (paper.downloadUrl) {
                        window.open(paper.downloadUrl, '_blank');
                      } else {
                        showToast(`Opened paper: ${paper.title}`);
                      }
                    }}
                    className="btn btn-primary py-2 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Paper
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-text-muted py-8 text-xs">
                No past year papers matched selection.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Eligibility */}
      {activeTab === 'eligibility' && (
        <div className="card bg-card border border-border p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-extrabold border-b border-border pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Personalized Eligibility Assessment
          </h3>

          <div className={`p-5 rounded-xl border flex flex-col gap-2 ${
            eligibilityReport.status !== 'NOT_ELIGIBLE' 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex justify-between items-center">
              <strong className="text-sm">Standing Status:</strong>
              <span className={`px-2.5 py-1 rounded text-xs font-extrabold uppercase ${
                eligibilityReport.status !== 'NOT_ELIGIBLE' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {eligibilityReport.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs md:text-sm text-text-muted leading-relaxed">
              {eligibilityReport.reason}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-border bg-background space-y-2">
              <strong className="text-foreground text-sm block">Qualifying Qualifications</strong>
              <p className="text-text-muted">Degree: <span className="text-foreground font-bold">{exam.eligibilityRules?.degree || exam.eligibilityRules?.degrees?.[0] || exam.minimum_qualification || 'Graduate'}</span></p>
              <p className="text-text-muted">Min Percentage: <span className="text-foreground font-bold">{exam.eligibilityRules?.minPercentage || 'Pass Class'}</span></p>
              <p className="text-text-muted">Eligible Streams: <span className="text-foreground font-bold">{exam.eligibilityRules?.eligibleBranches?.join(', ') || exam.eligible_branches?.join(', ') || 'All Streams'}</span></p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background space-y-2">
              <strong className="text-foreground text-sm block">Age Limits & Relaxations</strong>
              <p className="text-text-muted">Age Limits: <span className="text-foreground font-bold">{typeof exam.eligibilityRules?.ageLimit === 'string' ? exam.eligibilityRules.ageLimit : `${exam.minimum_age || 18} to ${exam.maximum_age || 32} Years`}</span></p>
              <div className="text-text-muted pt-1">
                {Object.entries(exam.age_relaxation || {}).map(([cat, yrs]) => (
                  <span key={cat} className="inline-block mr-3 mb-1 px-2 py-0.5 rounded bg-card border border-border text-[0.7rem]">
                    {cat}: +{yrs} yrs
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Curated Courses */}
      {activeTab === 'courses' && (
        <div className="card bg-card border border-border p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-extrabold border-b border-border pb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Curated Batches & Recommended Courses
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(exam.curatedCourses || []).map((c, i) => (
              <div key={c.id || i} className="p-5 rounded-xl border border-border bg-background flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <strong className="text-sm font-bold text-foreground block">{c.title}</strong>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold shrink-0">
                      ★ {c.rating}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted block">Provider: {c.provider} • Duration: {c.duration}</span>
                  {c.level && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[0.68rem] bg-secondary/10 text-secondary font-bold">
                      {c.level}
                    </span>
                  )}
                </div>

                <a
                  href={c.enrollUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary py-2 text-xs font-bold mt-4 justify-center flex items-center gap-1.5"
                >
                  View Course Details <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}

            {(!exam.curatedCourses || exam.curatedCourses.length === 0) && (
              <div className="col-span-2 text-center py-8 text-text-muted text-xs">
                Check the Courses tab on the main navigation for active batches.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Redirect modal for Apply Official */}
      {showRedirectModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-primary" /> Leaving UdanPath
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              You are being redirected to the official conducting authority application portal: <br />
              <strong className="text-foreground">{authority} ({exam.officialWebsite || 'https://nic.in'})</strong>
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowRedirectModal(false)}
                className="btn bg-background border border-border px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRedirectModal(false);
                  window.open(exam.officialWebsite || 'https://nic.in', '_blank');
                }}
                className="btn btn-primary px-4 py-2 text-xs font-bold"
              >
                Proceed to Portal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
