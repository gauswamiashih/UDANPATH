/**
 * coordinatorService.ts
 * Centralized Types, Persistence Service & Data Store for UdanPath Exam Coordinator Architecture.
 */

import { 
  Exam, 
  EXAMS_DATABASE, 
  getExams, 
  saveExams, 
  addExam, 
  deleteExam, 
  updateExamSchedules,
  DEFAULT_UNIFIED_EXAMS,
  MASTER_STORE_KEY
} from './examsData';
export type { Exam } from './examsData';

export interface ExamUpdate {
  id: string;
  examId: string;
  examName: string;
  conductingBody: string;
  academicYear: string;
  registrationStartDate: string;
  registrationEndDate: string;
  admitCardDate: string;
  examDate: string;
  resultDate?: string;
  status: 'Live' | 'Draft' | 'Published' | 'Archived';
  officialNotificationUrl?: string;
  officialApplyUrl?: string;
  updatedAt: string;
}

export interface SyllabusUnit {
  id: string;
  name: string;
  weightagePercentage?: number;
  topics: string[];
}

export interface SyllabusNode {
  id: string;
  examId: string;
  examName?: string;
  subject: string;
  title?: string;
  weightage?: string;
  topics?: string[];
  code?: string;
  units: SyllabusUnit[];
  status: 'Published' | 'Draft';
  lastRevised: string;
}

export interface ResourceItem {
  id: string;
  examId: string;
  examName?: string;
  type: 'pyq' | 'book' | 'solution' | 'official_pdf' | 'mock_test' | 'notes';
  title: string;
  year?: string;
  stage?: string; // e.g. "Prelims", "Mains", "Shift 1", "Session 2"
  authorOrPublisher?: string;
  url: string;
  fileSize?: string;
  rating?: string | number;
  isFree?: boolean;
  status?: 'Live' | 'Draft';
  createdAt?: string;
}

export interface CuratedCourse {
  id: string;
  examId: string;
  examName?: string;
  examCategory?: string;
  name?: string;
  title?: string;
  provider: string; // e.g. "Physics Wallah", "Unacademy", "Made Easy", "Drishti IAS"
  instructor?: string;
  price: string;
  originalPrice?: string;
  duration: string;
  language?: string;
  rating: number;
  reviewsCount?: string;
  badge?: string;
  courseUrl?: string;
  affiliateUrl?: string;
  highlights?: string[];
  features?: string[];
  status?: 'Live' | 'Draft';
  updatedAt: string;
}

export interface EligibilityRule {
  id: string;
  examId: string;
  examName?: string;
  minimumAge?: number;
  maximumAge?: number;
  ageLimit?: string;
  ageRelaxation?: Record<string, number> | string;
  categoryRelaxation?: string;
  requiredDegrees?: string[];
  qualifyingDegree?: string;
  eligibleBranches?: string[];
  branches?: string[];
  minimumPercentage?: number | string;
  minPercentage?: string;
  attemptLimit?: string;
  notes?: string;
  status?: 'Published' | 'Draft';
  updatedAt: string;
}

export interface CoordinatorDataStore {
  examUpdates: ExamUpdate[];
  syllabusNodes: SyllabusNode[];
  resources: ResourceItem[];
  courses: CuratedCourse[];
  eligibilityRules: EligibilityRule[];
}

// ==================== STORAGE KEYS ====================
export const CENTRAL_STORAGE_KEY = 'udanpath_coordinator_data';
export const ACTIVE_ROLE_KEY = 'udanpath_active_role';

export type UserRole = 'student' | 'coordinator';

// ==================== SEED DATA ====================
export const DEFAULT_EXAM_UPDATES: ExamUpdate[] = [
  {
    id: 'upd-gate-2026',
    examId: 'gate',
    examName: 'GATE 2026 (Graduate Aptitude Test in Engineering)',
    conductingBody: 'IIT Guwahati',
    academicYear: '2026-2027',
    registrationStartDate: '2025-08-28',
    registrationEndDate: '2025-10-12',
    admitCardDate: '2026-01-08',
    examDate: '2026-02-07',
    resultDate: '2026-03-19',
    status: 'Live',
    officialNotificationUrl: 'https://gate2026.iitg.ac.in/notification',
    officialApplyUrl: 'https://gate2026.iitg.ac.in/apply',
    updatedAt: '2026-02-14 10:30 AM',
  },
  {
    id: 'upd-upsc-2026',
    examId: 'upsc-cse',
    examName: 'UPSC Civil Services Examination 2026',
    conductingBody: 'Union Public Service Commission',
    academicYear: '2026',
    registrationStartDate: '2026-02-11',
    registrationEndDate: '2026-03-03',
    admitCardDate: '2026-05-10',
    examDate: '2026-05-24',
    resultDate: '2026-06-28',
    status: 'Live',
    officialNotificationUrl: 'https://upsc.gov.in/examinations/civil-services',
    officialApplyUrl: 'https://upsconline.nic.in',
    updatedAt: '2026-02-12 04:15 PM',
  },
  {
    id: 'upd-ssc-cgl-2026',
    examId: 'ssc-cgl',
    examName: 'SSC Combined Graduate Level (CGL) 2026',
    conductingBody: 'Staff Selection Commission',
    academicYear: '2026',
    registrationStartDate: '2026-06-14',
    registrationEndDate: '2026-07-18',
    admitCardDate: '2026-08-25',
    examDate: '2026-09-12',
    resultDate: '2026-11-05',
    status: 'Published',
    officialNotificationUrl: 'https://ssc.gov.in/notice-board',
    officialApplyUrl: 'https://ssc.gov.in',
    updatedAt: '2026-02-10 09:00 AM',
  },
  {
    id: 'upd-cat-2026',
    examId: 'cat',
    examName: 'Common Admission Test (CAT) 2026',
    conductingBody: 'IIM Kozhikode',
    academicYear: '2026',
    registrationStartDate: '2026-08-01',
    registrationEndDate: '2026-09-20',
    admitCardDate: '2026-11-05',
    examDate: '2026-11-29',
    resultDate: '2027-01-04',
    status: 'Draft',
    officialNotificationUrl: 'https://iimcat.ac.in',
    officialApplyUrl: 'https://iimcat.ac.in',
    updatedAt: '2026-02-01 11:20 AM',
  },
];

export const DEFAULT_SYLLABUS_NODES: SyllabusNode[] = [
  {
    id: 'syl-gate-cs-ds',
    examId: 'gate',
    examName: 'GATE Computer Science & IT',
    subject: 'Algorithms & Data Structures',
    code: 'CS-01',
    status: 'Published',
    lastRevised: '2026-01-15',
    units: [
      {
        id: 'unit-1',
        name: 'Unit 1: Asymptotic Analysis & Recurrences',
        weightagePercentage: 6,
        topics: ['Big-O, Omega, Theta Notations', 'Master Theorem', 'Substitution Method', 'Space Complexity Bounds'],
      },
      {
        id: 'unit-2',
        name: 'Unit 2: Graph Theory & Shortest Path',
        weightagePercentage: 8,
        topics: ['BFS/DFS Traversals', 'Dijkstra and Bellman-Ford', 'Kruskal and Prim MST', 'Topological Sort & DAGs'],
      },
      {
        id: 'unit-3',
        name: 'Unit 3: Dynamic Programming & Greedy',
        weightagePercentage: 7,
        topics: ['0/1 Knapsack Problem', 'Longest Common Subsequence (LCS)', 'Matrix Chain Multiplication', 'Huffman Coding'],
      },
    ],
  },
  {
    id: 'syl-gate-toc-compiler',
    examId: 'gate',
    examName: 'GATE Computer Science & IT',
    subject: 'Theory of Computation & Compiler Design',
    code: 'CS-02',
    status: 'Published',
    lastRevised: '2026-01-20',
    units: [
      {
        id: 'unit-4',
        name: 'Unit 1: Regular & Context-Free Languages',
        weightagePercentage: 7,
        topics: ['DFA and NFA Minimization', 'Pumping Lemma for Regular Languages', 'CFG Ambiguity', 'Pushdown Automata'],
      },
      {
        id: 'unit-5',
        name: 'Unit 2: Syntax Analysis & Lexical Scanning',
        weightagePercentage: 6,
        topics: ['LL(1) Top-Down Parsing', 'LR(0), SLR(1), LALR(1) Parsing', 'Syntax Directed Translation (SDT)', 'Intermediate Code Quadruples'],
      },
    ],
  },
  {
    id: 'syl-upsc-gs2',
    examId: 'upsc-cse',
    examName: 'UPSC CSE Mains',
    subject: 'General Studies Paper II (Governance, Constitution, Polity)',
    code: 'GS-02',
    status: 'Published',
    lastRevised: '2026-02-05',
    units: [
      {
        id: 'unit-6',
        name: 'Unit 1: Indian Constitutional Framework',
        weightagePercentage: 15,
        topics: ['Preamble & Fundamental Rights', 'Federalism & Interstate Councils', 'Separation of Powers', 'Constitutional Amendments & Basic Structure'],
      },
      {
        id: 'unit-7',
        name: 'Unit 2: International Relations & Bilateral Accords',
        weightagePercentage: 12,
        topics: ['India and Neighborhood Dynamics', 'Bilateral & Regional Groupings (QUAD, BRICS, I2U2)', 'Global Multilateral Bodies (WTO, UN, IMF)'],
      },
    ],
  },
];

export const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: 'res-gate-pyq-2025',
    examId: 'gate',
    examName: 'GATE CSE',
    type: 'pyq',
    title: 'GATE CS 2025 Official Question Paper (Shift 1 & 2)',
    year: '2025',
    stage: 'All Sessions',
    url: 'https://gate.iitk.ac.in/archive/papers/2025_cs.pdf',
    fileSize: '4.2 MB PDF',
    isFree: true,
    status: 'Live',
    createdAt: '2026-01-10',
  },
  {
    id: 'res-gate-solutions-2025',
    examId: 'gate',
    examName: 'GATE CSE',
    type: 'solution',
    title: 'GATE CS 2025 Comprehensive Answer Keys & Step-by-Step Solutions',
    year: '2025',
    stage: 'Final Evaluated',
    url: 'https://gate.iitk.ac.in/archive/solutions/2025_cs_sol.pdf',
    fileSize: '6.8 MB PDF',
    isFree: true,
    status: 'Live',
    createdAt: '2026-01-18',
  },
  {
    id: 'res-cormen-book',
    examId: 'gate',
    examName: 'GATE CSE',
    type: 'book',
    title: 'Introduction to Algorithms (CLRS 4th Edition)',
    authorOrPublisher: 'Thomas H. Cormen, Charles E. Leiserson (MIT Press)',
    url: 'https://mitpress.mit.edu/books/introduction-algorithms-fourth-edition',
    rating: '4.9',
    isFree: false,
    status: 'Live',
    createdAt: '2026-02-01',
  },
  {
    id: 'res-upsc-pyq-mains-2025',
    examId: 'upsc-cse',
    examName: 'UPSC CSE',
    type: 'pyq',
    title: 'UPSC CSE Mains 2025 GS Papers I to IV Compendium',
    year: '2025',
    stage: 'Mains',
    url: 'https://upsc.gov.in/archive/mains2025_gs.pdf',
    fileSize: '8.1 MB PDF',
    isFree: true,
    status: 'Live',
    createdAt: '2026-01-22',
  },
  {
    id: 'res-laxmikanth-polity',
    examId: 'upsc-cse',
    examName: 'UPSC CSE',
    type: 'book',
    title: 'Indian Polity for Civil Services Examination (7th Edition)',
    authorOrPublisher: 'M. Laxmikanth (McGraw Hill)',
    url: 'https://www.mheducation.co.in/indian-polity-7th-edition',
    rating: '4.8',
    isFree: false,
    status: 'Live',
    createdAt: '2026-02-03',
  },
];

export const DEFAULT_CURATED_COURSES: CuratedCourse[] = [
  {
    id: 'crs-pw-gate-super',
    examId: 'gate',
    examName: 'GATE CSE',
    name: 'GATE Parakram 2026 Super Batch (CS & DA)',
    provider: 'Physics Wallah',
    instructor: 'Pankaj Sharma, Khaleel Sir & Team',
    price: '₹5,999',
    duration: '10 Months Comprehensive',
    language: 'Hinglish & English',
    rating: 4.8,
    courseUrl: 'https://www.pw.live/gate',
    highlights: ['1000+ Hrs Live Classes', 'Daily DPPs & Video Solutions', 'National All India Test Series', '24/7 Doubt Resolution Hub'],
    status: 'Live',
    updatedAt: '2026-02-11',
  },
  {
    id: 'crs-drishti-mains',
    examId: 'upsc-cse',
    examName: 'UPSC CSE',
    name: 'UPSC Foundation Prelims-cum-Mains 2026 English',
    provider: 'Drishti IAS',
    instructor: 'Dr. Vikas Divyakirti & Senior Faculty Panel',
    price: '₹65,000',
    duration: '18 Months Integrated',
    language: 'English',
    rating: 4.9,
    courseUrl: 'https://www.drishtiias.com/courses',
    highlights: ['Comprehensive GS 1-4 Coverage', 'Dedicated Essay Mentorship', '1-on-1 Answer Writing Feedback', 'Monthly Current Affairs Hardcopy'],
    status: 'Live',
    updatedAt: '2026-02-08',
  },
  {
    id: 'crs-made-easy-prime',
    examId: 'gate',
    examName: 'GATE CSE',
    name: 'MADE EASY Live-Online GATE 2026 Rank Improver',
    provider: 'MADE EASY',
    instructor: 'B. Singh Sir & Senior Ex-IES Engineers',
    price: '₹28,500',
    duration: '8 Months Target',
    language: 'English',
    rating: 4.7,
    courseUrl: 'https://www.madeeasy.in',
    highlights: ['Rigorous Numerical Problem Practice', 'Handwritten Classroom Workbooks', 'Exam Simulation Mocks', 'PSU Interview Prep Guidance'],
    status: 'Live',
    updatedAt: '2026-02-05',
  },
];

export const DEFAULT_ELIGIBILITY_RULES: EligibilityRule[] = [
  {
    id: 'elig-gate-rules',
    examId: 'gate',
    examName: 'GATE (Engineering & Tech)',
    minimumAge: 18,
    maximumAge: 99,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, PWD: 0 },
    requiredDegrees: ['B.Tech', 'B.E.', 'B.Sc (Engg)', 'M.Sc', 'MCA', 'Integrated M.Tech'],
    eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Electrical', 'Mechanical', 'Civil', 'All Allied Engineering'],
    minimumPercentage: 0, // No minimum percentage requirement
    attemptLimit: 'Unlimited (No Cap)',
    notes: 'Students in pre-final (3rd year) and final (4th year) of undergraduate degree are fully eligible.',
    status: 'Published',
    updatedAt: '2026-01-25',
  },
  {
    id: 'elig-upsc-rules',
    examId: 'upsc-cse',
    examName: 'UPSC Civil Services Examination',
    minimumAge: 21,
    maximumAge: 32,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10, ExServiceman: 5 },
    requiredDegrees: ['Graduation (Any recognized UGC/AICTE degree)'],
    eligibleBranches: ['All Streams (Engineering, Arts, Commerce, Medicine, Science)'],
    minimumPercentage: 0,
    attemptLimit: '6 Attempts (General), 9 (OBC), Unlimited up to age limit (SC/ST)',
    notes: 'Must be an Indian Citizen for IAS and IPS. Candidates appearing in final semester examinations may apply conditionally.',
    status: 'Published',
    updatedAt: '2026-02-02',
  },
  {
    id: 'elig-ssc-cgl-rules',
    examId: 'ssc-cgl',
    examName: 'SSC Combined Graduate Level',
    minimumAge: 18,
    maximumAge: 32,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    requiredDegrees: ["Bachelor's Degree in any discipline"],
    eligibleBranches: ['All Disciplines & Branches'],
    minimumPercentage: 0,
    attemptLimit: 'Unlimited up to prescribed age brackets',
    notes: 'Statistical Investigator Grade II requires 60% in Mathematics at 10+2 level or Statistics as a degree subject.',
    status: 'Published',
    updatedAt: '2026-01-30',
  },
];

export const DEFAULT_STORE: CoordinatorDataStore = {
  examUpdates: DEFAULT_EXAM_UPDATES,
  syllabusNodes: DEFAULT_SYLLABUS_NODES,
  resources: DEFAULT_RESOURCES,
  courses: DEFAULT_CURATED_COURSES,
  eligibilityRules: DEFAULT_ELIGIBILITY_RULES,
};

// ==================== ROLE SWITCHER HELPERS ====================
export function getActiveRole(): UserRole {
  if (typeof window === 'undefined') return 'student';
  try {
    const role = localStorage.getItem(ACTIVE_ROLE_KEY) as UserRole;
    return role === 'coordinator' ? 'coordinator' : 'student';
  } catch {
    return 'student';
  }
}

export function setActiveRole(role: UserRole): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
    window.dispatchEvent(new CustomEvent('udanpath_role_changed', { detail: role }));
  } catch (err) {
    console.error('Error writing active role:', err);
  }
}

// ==================== CENTRAL PERSISTENCE ====================
export function getCoordinatorData(): CoordinatorDataStore {
  if (typeof window === 'undefined') return DEFAULT_STORE;
  try {
    const raw = localStorage.getItem(CENTRAL_STORAGE_KEY);
    if (!raw) {
      // Initialize with default store
      saveCoordinatorData(DEFAULT_STORE);
      return DEFAULT_STORE;
    }
    const parsed = JSON.parse(raw);
    return {
      examUpdates: Array.isArray(parsed.examUpdates) && parsed.examUpdates.length > 0 ? parsed.examUpdates : DEFAULT_EXAM_UPDATES,
      syllabusNodes: Array.isArray(parsed.syllabusNodes) && parsed.syllabusNodes.length > 0 ? parsed.syllabusNodes : DEFAULT_SYLLABUS_NODES,
      resources: Array.isArray(parsed.resources) && parsed.resources.length > 0 ? parsed.resources : DEFAULT_RESOURCES,
      courses: Array.isArray(parsed.courses) && parsed.courses.length > 0 ? parsed.courses : DEFAULT_CURATED_COURSES,
      eligibilityRules: Array.isArray(parsed.eligibilityRules) && parsed.eligibilityRules.length > 0 ? parsed.eligibilityRules : DEFAULT_ELIGIBILITY_RULES,
    };
  } catch (err) {
    console.error('Error reading central coordinator store:', err);
    return DEFAULT_STORE;
  }
}

export function saveCoordinatorData(data: CoordinatorDataStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CENTRAL_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('udanpath_coordinator_data_updated', { detail: data }));
  } catch (err) {
    console.error('Error writing central coordinator store:', err);
  }
}

// ==================== MODULE SPECIFIC CRUD ====================

// 1. Exam Schedules
export function getCoordinatorExamUpdates(): ExamUpdate[] {
  return getCoordinatorData().examUpdates;
}

export function saveCoordinatorExamUpdate(item: ExamUpdate): ExamUpdate[] {
  const data = getCoordinatorData();
  const index = data.examUpdates.findIndex(u => u.id === item.id);
  let updatedList: ExamUpdate[];
  if (index >= 0) {
    updatedList = [...data.examUpdates];
    updatedList[index] = { ...item, updatedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  } else {
    updatedList = [{ ...item, updatedAt: 'Just now' }, ...data.examUpdates];
  }
  data.examUpdates = updatedList;
  saveCoordinatorData(data);

  // Cross-synchronize schedules with unified master exams store
  try {
    updateExamSchedules(item.examId, item);
  } catch (err) {
    console.error('Error syncing exam update to master store:', err);
  }

  return updatedList;
}

export function deleteCoordinatorExamUpdate(id: string): ExamUpdate[] {
  const data = getCoordinatorData();
  data.examUpdates = data.examUpdates.filter(u => u.id !== id);
  saveCoordinatorData(data);
  return data.examUpdates;
}

// 2. Syllabus
export function getCoordinatorSyllabus(examId?: string): SyllabusNode[] {
  const list = getCoordinatorData().syllabusNodes;
  if (examId) {
    return list.filter(s => s.examId.toLowerCase() === examId.toLowerCase());
  }
  return list;
}

export function saveCoordinatorSyllabus(item: SyllabusNode): SyllabusNode[] {
  const data = getCoordinatorData();
  const index = data.syllabusNodes.findIndex(s => s.id === item.id);
  let updatedList: SyllabusNode[];
  if (index >= 0) {
    updatedList = [...data.syllabusNodes];
    updatedList[index] = { ...item, lastRevised: new Date().toISOString().split('T')[0] };
  } else {
    updatedList = [{ ...item, lastRevised: new Date().toISOString().split('T')[0] }, ...data.syllabusNodes];
  }
  data.syllabusNodes = updatedList;
  saveCoordinatorData(data);
  return updatedList;
}

export function saveCoordinatorSyllabusList(list: SyllabusNode[]): SyllabusNode[] {
  const data = getCoordinatorData();
  data.syllabusNodes = list;
  saveCoordinatorData(data);
  return list;
}

export function deleteCoordinatorSyllabus(id: string): SyllabusNode[] {
  const data = getCoordinatorData();
  data.syllabusNodes = data.syllabusNodes.filter(s => s.id !== id);
  saveCoordinatorData(data);
  return data.syllabusNodes;
}

// 3. Resources (PYQs & Books)
export function getCoordinatorResources(examId?: string): ResourceItem[] {
  const list = getCoordinatorData().resources;
  if (examId) {
    return list.filter(r => r.examId.toLowerCase() === examId.toLowerCase());
  }
  return list;
}

export function saveCoordinatorResource(item: ResourceItem): ResourceItem[] {
  const data = getCoordinatorData();
  const index = data.resources.findIndex(r => r.id === item.id);
  let updatedList: ResourceItem[];
  if (index >= 0) {
    updatedList = [...data.resources];
    updatedList[index] = item;
  } else {
    updatedList = [item, ...data.resources];
  }
  data.resources = updatedList;
  saveCoordinatorData(data);
  return updatedList;
}

export function saveCoordinatorResources(list: ResourceItem[]): ResourceItem[] {
  const data = getCoordinatorData();
  data.resources = list;
  saveCoordinatorData(data);
  return list;
}

export function deleteCoordinatorResource(id: string): ResourceItem[] {
  const data = getCoordinatorData();
  data.resources = data.resources.filter(r => r.id !== id);
  saveCoordinatorData(data);
  return data.resources;
}

// 4. Curated Courses
export function getCoordinatorCourses(examId?: string): CuratedCourse[] {
  const list = getCoordinatorData().courses;
  if (examId) {
    return list.filter(c => c.examId.toLowerCase() === examId.toLowerCase());
  }
  return list;
}

export function saveCoordinatorCourse(item: CuratedCourse): CuratedCourse[] {
  const data = getCoordinatorData();
  const index = data.courses.findIndex(c => c.id === item.id);
  let updatedList: CuratedCourse[];
  if (index >= 0) {
    updatedList = [...data.courses];
    updatedList[index] = { ...item, updatedAt: new Date().toLocaleDateString() };
  } else {
    updatedList = [{ ...item, updatedAt: 'Just now' }, ...data.courses];
  }
  data.courses = updatedList;
  saveCoordinatorData(data);
  return updatedList;
}

export function saveCoordinatorCourses(list: CuratedCourse[]): CuratedCourse[] {
  const data = getCoordinatorData();
  data.courses = list;
  saveCoordinatorData(data);
  return list;
}

export function deleteCoordinatorCourse(id: string): CuratedCourse[] {
  const data = getCoordinatorData();
  data.courses = data.courses.filter(c => c.id !== id);
  saveCoordinatorData(data);
  return data.courses;
}

// 5. Eligibility Rules
export function getCoordinatorEligibility(examId?: string): EligibilityRule[] {
  const list = getCoordinatorData().eligibilityRules;
  if (examId) {
    return list.filter(e => e.examId.toLowerCase() === examId.toLowerCase());
  }
  return list;
}

export function saveCoordinatorEligibility(item: EligibilityRule): EligibilityRule[] {
  const data = getCoordinatorData();
  const index = data.eligibilityRules.findIndex(e => e.id === item.id);
  let updatedList: EligibilityRule[];
  if (index >= 0) {
    updatedList = [...data.eligibilityRules];
    updatedList[index] = { ...item, updatedAt: new Date().toLocaleDateString() };
  } else {
    updatedList = [{ ...item, updatedAt: 'Just now' }, ...data.eligibilityRules];
  }
  data.eligibilityRules = updatedList;
  saveCoordinatorData(data);
  return updatedList;
}

export function saveCoordinatorEligibilityList(list: EligibilityRule[]): EligibilityRule[] {
  const data = getCoordinatorData();
  data.eligibilityRules = list;
  saveCoordinatorData(data);
  return list;
}

export function deleteCoordinatorEligibility(id: string): EligibilityRule[] {
  const data = getCoordinatorData();
  data.eligibilityRules = data.eligibilityRules.filter(e => e.id !== id);
  saveCoordinatorData(data);
  return data.eligibilityRules;
}

// Reset to official initial state
export function resetCoordinatorToDefaults(): CoordinatorDataStore {
  saveCoordinatorData(DEFAULT_STORE);
  return DEFAULT_STORE;
}

// ==================== MASTER EXAMS CRUD (TASK 3) ====================
// ==================== MASTER EXAMS CRUD (TASK 3) ====================
export const EXAMS_MASTER_STORAGE_KEY = MASTER_STORE_KEY;

export const DEFAULT_MASTER_EXAMS: Exam[] = DEFAULT_UNIFIED_EXAMS;

export function getMasterExams(): Exam[] {
  return getExams();
}

export function saveMasterExams(list: Exam[]): void {
  saveExams(list);
}

export function addMasterExam(exam: Partial<Exam>): Exam[] {
  return addExam(exam);
}

export function deleteMasterExam(id: string): Exam[] {
  return deleteExam(id);
}

export function resetMasterExams(): Exam[] {
  saveExams(DEFAULT_UNIFIED_EXAMS);
  return DEFAULT_UNIFIED_EXAMS;
}


