'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Exam } from '@/lib/examsData';
import { evaluateEligibility } from '@/lib/eligibility';
import { supabase } from '@/lib/supabaseClient';
import { getExamsFromDb, getUserBookmarks, toggleUserBookmark } from '@/lib/dbService';
import { 
  ArrowLeft, ExternalLink, Bookmark, BookmarkCheck, 
  HelpCircle, Bot, Check, Bell, Download, Book, Video, MapPin, Award, Search, Building2
} from 'lucide-react';


// Syllabus sample structure helper
function getFallbackSyllabusStructure() {
  return [
    {
      subject: "Core Technical / GS Core Syllabus",
      units: [
        { name: "Unit 1: Theory of Computation & Algorithms", topics: ["Regular Languages", "Finite Automata", "Sorting & Graph Search", "Dynamic Programming"] },
        { name: "Unit 2: Database Systems & CD", topics: ["ER-model & Relational Design", "Transactions & Concurrency", "Parsing Techniques", "Runtime Code Generation"] },
        { name: "Unit 3: Computer Networks & OS", topics: ["TCP/UDP Routing & IP", "Network Security Protocols", "Process Conformance & Scheduling", "Virtual Memory Blocks"] }
      ]
    },
    {
      subject: "General Aptitude & Reasoning Sections",
      units: [
        { name: "Unit A: Quantitative Aptitude", topics: ["Ratio and Proportions", "Percentages and Interest", "Data Interpretation", "Permutations & Combinations"] },
        { name: "Unit B: Verbal & Critical Reasoning", topics: ["Grammatical Conformance", "Vocabulary Sentences", "Critical Reasoning Paragraphs"] }
      ]
    }
  ];
}

interface ExamDetailProps {
  params: Promise<{ slug: string }>;
}

export default function ExamDetail({ params }: ExamDetailProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const examId = resolvedParams.slug;

  const [exam, setExam] = useState<Exam | null>(null);
  const [liveDates, setLiveDates] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
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
  const [syllabusSearch, setSyllabusSearch] = useState('');
  const [pyqYear, setPyqYear] = useState('all');
  const [pyqStage, setPyqStage] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  // Deep Ecosystem States
  const [papers, setPapers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [eligibilityRules, setEligibilityRules] = useState<any[]>([]);
  const [pyqs, setPyqs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [coaching, setCoaching] = useState<any[]>([]);
  const [youtube, setYoutube] = useState<any[]>([]);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  
  // AI and Experience States
  const [experiences, setExperiences] = useState<any[]>([]);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [prepLevel, setPrepLevel] = useState('Beginner');

  // Syllabus checkmarks state
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});

  const fetchSyllabus = async (dbExamId: string, examCode: string) => {
    try {
      const { data: patterns } = await supabase
        .from('exam_patterns')
        .select('id')
        .eq('exam_id', dbExamId);
      
      let mappedSyllabus = null;
      if (patterns && patterns.length > 0) {
        const patIds = patterns.map(p => p.id);
        const { data: topics } = await supabase
          .from('syllabus_topics')
          .select('*')
          .in('exam_pattern_id', patIds);
        
        if (topics && topics.length > 0) {
          const subjectsMap = new Map<string, string[]>();
          topics.forEach(t => {
            const subject = t.subject_name;
            const topic = t.topic_name;
            if (!subjectsMap.has(subject)) {
              subjectsMap.set(subject, []);
            }
            subjectsMap.get(subject)!.push(topic);
          });

          mappedSyllabus = Array.from(subjectsMap.entries()).map(([subName, topicList]) => {
            const units: any[] = [];
            const chunkSize = 4;
            for (let i = 0; i < topicList.length; i += chunkSize) {
              const chunk = topicList.slice(i, i + chunkSize);
              units.push({
                name: `Unit ${Math.floor(i / chunkSize) + 1}: ${subName} Core Concepts`,
                topics: chunk
              });
            }

            return {
              subject: subName,
              units
            };
          });
        }
      }

      const syllabusListToUse = mappedSyllabus || getFallbackSyllabusStructure();
      setSyllabusList(syllabusListToUse);

      // Load syllabus checkmarks
      const stored: Record<string, boolean> = {};
      syllabusListToUse.forEach((sub: any) => {
        sub.units.forEach((unit: any) => {
          unit.topics.forEach((topic: any) => {
            const key = `udanpath_syllabus_${examCode}_${topic}`;
            stored[topic] = localStorage.getItem(key) === 'true';
          });
        });
      });
      setCompletedTopics(stored);
    } catch (err) {
      console.error('Error fetching syllabus:', err);
      const fallbackList = getFallbackSyllabusStructure();
      setSyllabusList(fallbackList);
    }
  };

  useEffect(() => {
    const loadExamDetails = async () => {
      try {
        // 1. Fetch all exams from Supabase database for bookmark resolution
        const dbExams = await getExamsFromDb();
        setExams(dbExams);

        const res = await fetch(`http://localhost:8000/api/v1/exams/${examId}`);
        if (res.ok) {
          const data = await res.json();
          setExam(data.exam);
          setLiveDates(data.live_dates);
          
          setPapers(data.papers || []);
          setSubjects(data.subjects || []);
          setTopics(data.topics || []);
          setEligibilityRules(data.eligibility_rules || []);
          setPyqs(data.pyqs || []);
          setCourses(data.courses || []);
          setCoaching(data.coaching || []);
          setYoutube(data.youtube || []);
          setCareerPaths(data.career_paths || []);
          setPdfs(data.pdfs || []);
          setExperiences(data.experiences || []);

          if (data.papers && data.papers.length > 0) {
             const syllabusData = data.subjects.map((sub: any) => {
                 const subTopics = data.topics.filter((t: any) => t.subject_id === sub.id).map((t: any) => t.name);
                 return {
                     subject: sub.name,
                     units: [
                         { name: `${sub.name} Topics`, topics: subTopics }
                     ]
                 }
             });
             setSyllabusList(syllabusData);
          } else {
             await fetchSyllabus(data.exam.id, data.exam.short_name);
          }
        }
      } catch (err) {
        console.error('Error fetching deep exam data:', err);
      }

      // 3. Load profile data
      const localProf = localStorage.getItem('udanpath_onboarding_profile');
      if (localProf) {
        setProfile(JSON.parse(localProf));
      }

      // 4. Load bookmarks
      let bList: string[] = [];
      const savedBookmarks = localStorage.getItem('udanpath_bookmarks');
      if (savedBookmarks) {
        bList = JSON.parse(savedBookmarks);
      }

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

    loadExamDetails();
  }, [examId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const toggleBookmark = async () => {
    if (!exam) return;
    let updated = [...bookmarks];
    if (bookmarks.includes(exam.id)) {
      updated = bookmarks.filter(id => id !== exam.id);
    } else {
      updated = [...bookmarks, exam.id];
    }
    setBookmarks(updated);
    localStorage.setItem('udanpath_bookmarks', JSON.stringify(updated));

    // Sync database bookmark
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const synced = await toggleUserBookmark(session.user.id, exam.id, exams);
      setBookmarks(synced);
      localStorage.setItem('udanpath_bookmarks', JSON.stringify(synced));
      updated = synced;
    }

    showToast(updated.includes(exam.id) ? 'Exam saved to bookmarks!' : 'Exam removed from bookmarks.');
  };

  const handleApplyNow = () => {
    setShowRedirectModal(true);
  };

  const toggleSyllabusTopic = (topic: string, checked: boolean) => {
    if (!exam) return;
    const key = `udanpath_syllabus_${exam.short_name}_${topic}`;
    localStorage.setItem(key, String(checked));
    setCompletedTopics(prev => ({ ...prev, [topic]: checked }));
    showToast(`Marked "${topic}" as ${checked ? 'completed' : 'incomplete'}.`);
  };

  if (!exam) {
    return (
      <div className="card bg-card border border-border p-12 text-center text-text-muted">
        Exam not found in database.
      </div>
    );
  }

  // Calculate user eligibility report
  const eligibilityReport = evaluateEligibility(exam, profile);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'syllabus', label: 'Syllabus' },
    { id: 'pattern', label: 'Pattern' },
    { id: 'dates', label: 'Important Dates' },
    { id: 'pyqs', label: 'PYQs' },
    { id: 'resources', label: 'Resources' },
    { id: 'courses', label: 'Courses & Coaching' },
    { id: 'roadmap', label: 'Topper Roadmap' },
    { id: 'experiences', label: 'Aspirant Experiences' },
    { id: 'advice', label: 'Personal Advice' }
  ];


  // Topper Strategy roadmap planner details
  const getRoadmapPhases = () => {
    const cgpa = parseFloat(profile.cgpa) || 8.0;
    let tier = "Tier 1";
    let duration = "6 Months (Accelerated)";
    if (cgpa < 6.0) {
      tier = "Tier 3";
      duration = "14 Months (Foundations First)";
    } else if (cgpa < 8.0) {
      tier = "Tier 2";
      duration = "10 Months (Standard Balanced)";
    }

    return {
      tier,
      duration,
      phases: [
        { name: "Phase 1: Understand Exam", time: "Weeks 1-2", tasks: ["Understand Exam Syllabus & stages structure", "Solve one diagnostics diagnostic paper", "Establish daily slots calendar"] },
        { name: "Phase 2: Build Foundation", time: "Months 1-2", tasks: ["Complete basic conceptual theory", "Review Standard Reference formulas", "Implement structured note taking maps"] },
        { name: "Phase 3: Complete Syllabus", time: "Months 3-5", tasks: ["Finish core technical chapters", "Complete daily quantitative study hours", "Solve topicwise checkmarks"] },
        { name: "Phase 4: Solved PYQs", time: "Month 6", tasks: ["Attempt past 10 years papers", "Practice timed OMR/CBT answer sheets", "Identify recurring themes"] },
        { name: "Phase 5: Revision & Mocks", time: "Month 7", tasks: ["Full length mock tests quizzes", "Daily formula review cards", "Physical health schedule prep"] }
      ]
    };
  };

  const topperRoadmap = getRoadmapPhases();

  // PYQs list real data only
  const pyqList = pyqs.map(p => ({
    year: p.year.toString(),
    stage: p.question_type || "prelims",
    title: `${exam.short_name} ${p.year} - Q${p.question_number} (${p.difficulty})`,
    format: "Question Bank"
  }));

  const filteredPyqs = pyqList.filter(p => {
    const matchesY = pyqYear === 'all' || p.year === pyqYear;
    const matchesS = pyqStage === 'all' || p.stage === pyqStage;
    return matchesY && matchesS;
  });

  const isSaved = bookmarks.includes(exam.id);

  const salaryString = exam.salary_information?.approx_in_hand_monthly 
      ? `₹${exam.salary_information.approx_in_hand_monthly.toLocaleString()}/mo` 
      : (exam.salary_information?.pay_scale || 'N/A');

  return (
    <div className="space-y-6 select-none relative pb-10">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-6 bg-card border border-primary/20 text-foreground text-sm font-semibold px-4 py-3 rounded-xl shadow-lg z-50 animate-slide-in">
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
      <div className="card bg-card border border-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded bg-primary-light border border-primary/10 text-primary text-xs font-bold flex items-center">
              <Building2 className="w-3 h-3 mr-1" />
              {exam.organization}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-green-500/10 text-success text-xs font-bold">
              {exam.application_status}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-foreground">{exam.name}</h1>
          <p className="text-xs text-text-muted mt-2 max-w-2xl leading-relaxed">{exam.description}</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleApplyNow}
            className="flex-1 md:flex-none btn btn-primary py-2.5 px-5 justify-center font-bold text-sm shadow-md"
          >
            Apply Now <ExternalLink className="w-4 h-4 ml-1.5" />
          </button>
          
          <button 
            onClick={toggleBookmark}
            className="p-2.5 rounded-lg border border-border bg-card hover:bg-card-hover text-text-muted transition-colors"
            title="Save Exam"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Summary Badges Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Pay Scale Estimate', val: salaryString },
          { label: 'Minimum Qualification', val: exam.minimum_qualification || (exam.qualification_levels && exam.qualification_levels.length > 0 ? exam.qualification_levels[0] : 'Graduate') },
          { label: 'Age Limit range', val: `${exam.minimum_age || 18}-${exam.maximum_age || 32} Yrs` },
          { label: 'Category', val: exam.category_name || 'Government' }
        ].map((item, index) => (
          <div key={index} className="card bg-card border border-border p-4 text-center">
            <span className="text-[0.68rem] font-bold text-text-subtle uppercase tracking-wider block mb-1">{item.label}</span>
            <strong className="text-xs font-extrabold text-foreground">{item.val}</strong>
          </div>
        ))}
      </div>

      {/* Sticky Tabs Bar Switcher */}
      <div className="sticky top-16 z-10 flex gap-2 border-b border-border bg-background/95 backdrop-blur-md overflow-x-auto py-2.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id 
                ? 'bg-primary-light text-primary border border-primary/20' 
                : 'text-text-muted hover:bg-card-hover hover:text-foreground border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB DETAILS PANES ==================== */}
      
      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="card bg-card border border-border p-6 space-y-4">
          <h3 className="text-md font-extrabold border-b border-border pb-3 mb-2">General Overview</h3>
          <p className="text-sm text-text-muted leading-relaxed">{exam.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
            <div>
              <strong>Conducting Body:</strong> {exam.organization}
            </div>
            <div>
              <strong>Level:</strong> {exam.category_name}
            </div>
            <div>
              <strong>Selection Process:</strong> {exam.selection_process ? exam.selection_process.join(', ') : 'Written Exam, Interview'}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Eligibility */}
      {activeTab === 'eligibility' && (
        <div className="card bg-card border border-border p-6 space-y-5">
          <h3 className="text-md font-extrabold border-b border-border pb-3">Eligibility Evaluation Report</h3>
          
          {/* Eligibility Card status */}
          <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
            eligibilityReport.status !== 'NOT_ELIGIBLE' 
              ? 'bg-green-500/5 border-green-500/20' 
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className="flex justify-between items-center">
              <strong className="text-sm">Evaluated Standing:</strong>
              <span className={`px-2.5 py-1 rounded text-xs font-extrabold uppercase ${
                eligibilityReport.status !== 'NOT_ELIGIBLE' 
                  ? 'bg-green-500/10 text-success' 
                  : 'bg-red-500/10 text-danger'
              }`}>
                {eligibilityReport.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs md:text-sm text-text-muted leading-relaxed">
              {eligibilityReport.reason}
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs md:text-sm">
            <div>
              <strong>Target Streams Eligible:</strong>
              <ul className="list-disc pl-5 mt-1 text-xs text-text-muted space-y-1">
                {exam.eligible_branches?.map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
            <div>
              <strong>Age Relaxations modifications:</strong>
              <div className="mt-1 text-xs text-text-muted">
                {Object.entries(exam.age_relaxation || {}).map(([cat, yrs]) => (
                  <span key={cat} className="mr-3">{cat}: +{yrs} years</span>
                ))}
              </div>
            </div>
            <div>
              <strong>Attempts Allowances:</strong>
              <div className="mt-1 text-xs text-text-muted">
                {Object.entries(exam.attempt_limit || {}).map(([cat, att]) => (
                  <span key={cat} className="mr-3">{cat}: {att}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Syllabus */}
      {activeTab === 'syllabus' && (
        <div className="card bg-card border border-border p-6 space-y-5">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-4">
            <h3 className="text-md font-extrabold">Syllabus checklists tracker</h3>
            
            {/* Syllabus topic search */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
              <input 
                type="text"
                placeholder="Search topics..."
                value={syllabusSearch}
                onChange={(e) => setSyllabusSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>

          <div className="space-y-6">
            {syllabusList.map((sub: any, subIdx: number) => {
              const q = syllabusSearch.toLowerCase().trim();
              const filteredUnits = sub.units.filter((unit: any) => 
                unit.name.toLowerCase().includes(q) || 
                unit.topics.some((t: any) => t.toLowerCase().includes(q))
              );
 
               if (filteredUnits.length === 0) return null;
 
               return (
                 <div key={subIdx} className="space-y-4">
                   <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                     📁 {sub.subject}
                   </h4>
                   <div className="space-y-3.5 pl-2">
                     {filteredUnits.map((unit: any, uIdx: number) => (
                       <div key={uIdx} className="border-l border-border pl-4 space-y-2">
                         <strong className="text-xs md:text-sm text-foreground block">{unit.name}</strong>
                         <div className="flex flex-col gap-1.5 pl-2">
                           {unit.topics.filter((t: any) => t.toLowerCase().includes(q)).map((topic: any, tIdx: number) => {
                            const checked = !!completedTopics[topic];
                            return (
                              <label key={tIdx} className="flex items-center gap-2 text-xs text-text-muted cursor-pointer hover:text-foreground">
                                <input 
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => toggleSyllabusTopic(topic, e.target.checked)}
                                  className="w-4 h-4 text-primary rounded"
                                />
                                <span className={checked ? 'line-through text-text-subtle' : ''}>{topic}</span>
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
          </div>
        </div>
      )}

      {/* Tab: Pattern */}
      {activeTab === 'pattern' && (
        <div className="card bg-card border border-border p-6 space-y-4">
          <h3 className="text-md font-extrabold border-b border-border pb-3">Exam Pattern stages breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="py-2.5 font-bold">Stage Name</th>
                  <th className="py-2.5 font-bold">Mode</th>
                  <th className="py-2.5 font-bold">Total Marks</th>
                  <th className="py-2.5 font-bold">Paper Outline</th>
                </tr>
              </thead>
              <tbody>
                {exam.exam_pattern?.map((st, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="py-3 font-bold text-foreground">{st.stage_name}</td>
                    <td className="py-3 font-semibold">{st.mode}</td>
                    <td className="py-3 font-extrabold text-primary">{st.total_marks} Marks</td>
                    <td className="py-3 text-text-muted">{st.language_medium?.join(', ')}</td>
                  </tr>
                ))}
                {!exam.exam_pattern || exam.exam_pattern.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-text-muted">No pattern available.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Dates */}
      {activeTab === 'dates' && (
        <div className="card bg-card border border-border p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-border pb-3 flex-wrap gap-2">
            <h3 className="text-md font-extrabold">Important Date Timeline</h3>
            {liveDates && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-500/10 text-success text-[0.65rem] font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> 
                Verified Live ({liveDates.source?.name}) 
                {liveDates.last_verified_at && ` - ${new Date(liveDates.last_verified_at).toLocaleDateString()}`}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {[
              { label: "Notification Release", date: liveDates?.notification_release_date || (exam.official_notification_url ? 'Available' : 'Tentative') },
              { label: "Online Registration Starts", date: liveDates?.application_start_date || exam.application_start_date || 'TBA' },
              { label: "Application Submission Deadline", date: liveDates?.application_end_date || exam.application_end_date || 'TBA' },
              { label: "Fee Payment Deadline", date: liveDates?.fee_payment_deadline || exam.fee_deadline || 'TBA' },
              { label: "Preliminary Exam Date", date: liveDates?.exam_start_date || exam.exam_date || 'TBA' }
            ].map((ev, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-background flex-wrap"
              >
                <div>
                  <strong className="text-xs md:text-sm text-foreground block">{ev.label}</strong>
                  <span className="text-[0.72rem] text-text-muted mt-0.5 block">Scheduled: <span className="font-semibold text-foreground">{ev.date}</span></span>
                </div>
                <button
                  onClick={() => showToast(`Reminder configured for ${ev.label}!`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-light hover:bg-primary-light/80 text-primary text-xs font-bold"
                >
                  <Bell className="w-3.5 h-3.5" /> Add Reminder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: PYQs */}
      {activeTab === 'pyqs' && (
        <div className="card bg-card border border-border p-6 space-y-5">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border pb-4">
            <h3 className="text-md font-extrabold">Solved Previous Years papers</h3>
            <div className="flex gap-2">
              <select 
                value={pyqYear}
                onChange={(e) => setPyqYear(e.target.value)}
                className="bg-background border border-border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <select 
                value={pyqStage}
                onChange={(e) => setPyqStage(e.target.value)}
                className="bg-background border border-border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Stages</option>
                <option value="prelims">Prelims / Stage-1</option>
                <option value="mains">Mains / Stage-2</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredPyqs.length > 0 ? (
              filteredPyqs.map((paper, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                >
                  <div>
                    <strong className="text-xs md:text-sm text-foreground block">{paper.title}</strong>
                    <span className="text-[0.68rem] text-text-subtle mt-0.5 block">Format: {paper.format} | Year: {paper.year}</span>
                  </div>
                  <button
                    onClick={() => showToast(`Started downloading ${paper.title}...`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded btn btn-primary text-xs font-bold"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-text-muted py-6 text-xs select-none">
                No question papers matched selection criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Resources */}
      {activeTab === 'resources' && (
        <div className="card bg-card border border-border p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-extrabold border-b border-border pb-3">Standard Reference Books</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-border bg-background flex items-start gap-3">
                <Book className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs md:text-sm text-foreground block leading-tight">General Reference Material</strong>
                  <span className="text-[0.68rem] text-text-muted block mt-1">Recommended for general syllabus preparation</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-extrabold border-b border-border pb-3">Recommended Free YouTube tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {youtube.length > 0 ? youtube.map((y, i) => (
                <div key={i} className="p-3.5 rounded-lg border border-border bg-background flex items-start gap-3">
                  <Video className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs md:text-sm text-foreground block leading-tight">{y.title} ({y.channel_name})</strong>
                    <span className="text-xs text-primary mt-1 block hover:underline cursor-pointer" onClick={() => window.open(y.url, '_blank')}>Watch now</span>
                  </div>
                </div>
              )) : (
                <div className="p-3.5 rounded-lg border border-border bg-background flex items-start gap-3">
                  <Video className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs md:text-sm text-foreground block leading-tight">Free online video courses & strategy videos</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Courses & Coaching */}
      {activeTab === 'courses' && (
        <div className="card bg-card border border-border p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-extrabold border-b border-border pb-3">Matched Premium Online Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c, i) => (
                <div key={c.id || i} className="p-4 rounded-lg border border-border bg-background flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <strong className="text-xs md:text-sm text-foreground leading-tight block">{c.course_name || c.name}</strong>
                      <span className="px-1.5 py-0.5 rounded bg-primary-light text-primary text-[0.65rem] font-bold">
                        ★ {c.rating || 4.5}
                      </span>
                    </div>
                    <span className="text-[0.68rem] text-text-muted block">Provider: {c.provider_name || c.institute} | Duration: {c.duration || 'N/A'}</span>
                    <strong className="text-xs text-primary mt-2 block">Price: {c.price_info || c.price}</strong>
                  </div>
                  <button
                    onClick={() => window.open(c.official_link || c.officialWebsite, '_blank')}
                    className="w-full btn btn-secondary py-1.5 text-xs font-bold mt-4 justify-center"
                  >
                    Visit Course portal
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-extrabold border-b border-border pb-3">Matched Classroom Offline centers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaching.map((c, i) => (
                <div key={c.id || i} className="p-4 rounded-lg border border-border bg-background flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <strong className="text-xs md:text-sm text-foreground leading-tight block">{c.institute_name || c.name}</strong>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-accent text-[0.65rem] font-bold">
                        ★ {c.rating || 4.7}
                      </span>
                    </div>
                    <span className="text-[0.68rem] text-text-muted block flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-text-subtle" /> Locations: {c.city}
                    </span>
                    <strong className="text-xs text-secondary mt-2 block">Estimate fees: {c.price}</strong>
                  </div>
                  <button
                    onClick={() => window.open(c.officialWebsite, '_blank')}
                    className="w-full btn btn-secondary py-1.5 text-xs font-bold mt-4 justify-center"
                  >
                    Contact Center
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Topper Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="card bg-card border border-border p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3 mb-2 flex-wrap gap-2">
            <div>
              <h3 className="text-md font-extrabold">Topper Roadmap Timeline</h3>
              <p className="text-xs text-text-muted mt-0.5">Customized preparation schedule for academic standings.</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-gradient-to-br from-primary to-secondary text-white text-[0.68rem] font-extrabold uppercase">
              {topperRoadmap.tier} roadmap
            </span>
          </div>

          <p className="text-xs font-semibold text-text-muted">
            Background classification: <span className="text-foreground">{topperRoadmap.tier}</span>. Ideal study dedication: <span className="text-foreground">{topperRoadmap.duration}</span>.
          </p>

          <div className="space-y-4 pt-3">
            {topperRoadmap.phases.map((ph, idx) => (
               <div key={idx} className="relative border-l-2 border-primary pl-5 pb-1">
                 <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-primary-light"></div>
                 <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                   <strong className="text-xs md:text-sm text-foreground">{ph.name}</strong>
                   <span className="text-[0.65rem] bg-card border border-border rounded px-2 py-0.5 text-text-muted font-bold">
                     {ph.time}
                   </span>
                 </div>
                 <div className="flex flex-col gap-1">
                   {ph.tasks.map((task, tIdx) => (
                     <label key={tIdx} className="flex items-center gap-2 text-xs text-text-muted cursor-pointer hover:text-foreground">
                       <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                       <span>{task}</span>
                     </label>
                   ))}
                 </div>
               </div>
             ))}
           </div>
           </div>
         </div>
       )}

      {/* Tab: Aspirant Experiences */}
      {activeTab === 'experiences' && (
        <div className="card bg-card border border-border p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-3 mb-2 flex-wrap gap-2">
            <div>
              <h3 className="text-md font-extrabold">Real Aspirant Experiences</h3>
              <p className="text-xs text-text-muted mt-0.5">Verified preparation journeys from similar students.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {experiences.length > 0 ? experiences.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-background space-y-4">
                <div className="flex justify-between items-start flex-wrap gap-2 border-b border-border pb-3">
                  <div>
                    <strong className="text-sm md:text-base text-foreground block">{exp.display_name}</strong>
                    <span className="text-[0.68rem] text-text-subtle block mt-1">{exp.degree} in {exp.branch} • {exp.academic_score_type}: {exp.academic_score}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded bg-primary-light text-primary text-[0.65rem] font-bold">
                      {exp.verification_status}
                    </span>
                    <span className="text-[0.68rem] font-bold text-success">
                      {exp.result_type} {exp.rank ? `(${exp.rank})` : ''}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><span className="text-[0.65rem] text-text-muted block">Duration</span><strong className="text-xs">{exp.preparation_duration}</strong></div>
                  <div><span className="text-[0.65rem] text-text-muted block">Daily Study</span><strong className="text-xs">{exp.daily_study_hours}</strong></div>
                  <div><span className="text-[0.65rem] text-text-muted block">Mode</span><strong className="text-xs">{exp.preparation_mode}</strong></div>
                  <div><span className="text-[0.65rem] text-text-muted block">Starting Level</span><strong className="text-xs">{exp.starting_level}</strong></div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <strong className="text-xs text-foreground block mb-1">What Worked</strong>
                    <p className="text-[0.72rem] text-text-muted leading-relaxed">{exp.what_worked}</p>
                  </div>
                  <div>
                    <strong className="text-xs text-foreground block mb-1">Mistakes & Difficulties</strong>
                    <p className="text-[0.72rem] text-text-muted leading-relaxed">{exp.mistakes} {exp.difficulties}</p>
                  </div>
                  <div>
                    <strong className="text-xs text-foreground block mb-1">Final Advice</strong>
                    <p className="text-[0.72rem] text-text-muted leading-relaxed italic border-l-2 border-primary/40 pl-3">{exp.advice}</p>
                  </div>
                </div>

                {exp.experience_media && exp.experience_media.length > 0 && (
                  <div className="pt-3 border-t border-border mt-3">
                    <strong className="text-xs text-foreground block mb-2">Media & Interviews</strong>
                    <div className="flex gap-2 flex-wrap">
                      {exp.experience_media.map((media: any, mIdx: number) => (
                        <a key={mIdx} href={media.url} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-card hover:bg-card-hover border border-border text-xs text-primary font-semibold transition-colors">
                          <Video className="w-3.5 h-3.5" />
                          {media.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center text-text-muted py-6 text-xs select-none">
                No experiences recorded for this exam yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Personal Advice */}
      {activeTab === 'advice' && (
        <div className="card bg-card border border-border p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-md font-extrabold flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /> AI Personal Advice</h3>
              <p className="text-xs text-text-muted mt-0.5">Get actionable next steps tailored to your profile and stage.</p>
            </div>
          </div>
          
          <div className="bg-background border border-border p-4 rounded-xl space-y-4">
             <div className="flex flex-col gap-2">
               <label className="text-xs font-bold text-foreground">What is your current preparation level?</label>
               <select 
                 value={prepLevel} 
                 onChange={(e) => setPrepLevel(e.target.value)}
                 className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary max-w-sm"
               >
                 <option value="Not Started">Not Started</option>
                 <option value="Beginner">Beginner / Just Started</option>
                 <option value="Intermediate">Intermediate / Foundation Built</option>
                 <option value="Advanced">Advanced / Doing PYQs</option>
                 <option value="Revision">Revision & Mock Stage</option>
               </select>
             </div>
             
             <button 
               onClick={async () => {
                 setIsGeneratingAdvice(true);
                 try {
                   const res = await fetch('http://localhost:8000/api/v1/ai/personal-advice', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({
                       user_profile: profile,
                       exam_id: exam.id,
                       preparation_level: prepLevel
                     })
                   });
                   const data = await res.json();
                   setAiAdvice(data.advice);
                 } catch (err) {
                   setAiAdvice("Failed to generate advice. Ensure backend is running.");
                 }
                 setIsGeneratingAdvice(false);
               }}
               disabled={isGeneratingAdvice}
               className="btn btn-primary py-2 px-6 text-xs font-bold"
             >
               {isGeneratingAdvice ? 'Analyzing Profile...' : 'Generate My Personal Advice'}
             </button>
          </div>

          {aiAdvice && (
            <div className="p-5 rounded-xl border border-primary/20 bg-primary-light/5 text-sm text-foreground leading-relaxed shadow-sm">
              <div className="font-semibold text-primary mb-3 text-xs flex items-center gap-1.5"><Check className="w-4 h-4" /> Your Actionable Next Steps:</div>
              <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
                {aiAdvice}
              </div>
            </div>
          )}
        </div>
      )}

       {/* ==================== LEAVING PORTAL REDIRECT MODAL ==================== */}
       {showRedirectModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
           <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 text-center animate-scale-in">
             <div className="w-12 h-12 rounded-full bg-amber-500/10 text-accent flex items-center justify-center mx-auto mb-4">
               <ExternalLink className="w-6 h-6" />
             </div>
             <h3 className="font-extrabold text-base text-foreground mb-2">Leaving UdanPath</h3>
             <p className="text-xs text-text-muted leading-relaxed mb-6">
               You are leaving UdanPath to access the official application registration portal. Make sure to cross-reference all eligibility details on the official platform before applying.
             </p>
             <div className="flex gap-2">
               <button 
                 onClick={() => setShowRedirectModal(false)}
                 className="flex-1 btn btn-secondary py-2 text-xs justify-center font-bold"
               >
                 Cancel
               </button>
               <a 
                 href={exam.official_website}
                 target="_blank"
                 rel="noopener noreferrer"
                 onClick={() => setShowRedirectModal(false)}
                 className="flex-1 btn btn-primary py-2 text-xs justify-center font-bold text-center block"
               >
                 Proceed
               </a>
             </div>
           </div>
         </div>
       )}

    </div>
  );
}
