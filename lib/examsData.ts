export interface SyllabusTopicItem {
  id?: string;
  name: string;
  weightage?: string;
  subtopics?: string[];
}

export interface SyllabusUnitItem {
  id?: string;
  name: string;
  weightage?: string | number;
  weightagePercentage?: number;
  topics: string[];
}

export interface SyllabusSubjectItem {
  subject: string;
  units: SyllabusUnitItem[];
}

export interface ExamPYQ {
  year: string | number;
  title: string;
  stage?: string;
  downloadUrl: string;
  fileSize?: string;
}

export interface ExamCuratedCourse {
  id: string;
  name?: string;
  title?: string;
  provider: string;
  instructor?: string;
  faculty?: string;
  price?: string;
  duration?: string;
  rating: number;
  courseUrl?: string;
  enrollUrl?: string;
  badge?: string;
  level?: string;
  highlights?: string[];
  features?: string[];
}

export interface ExamRegistrationWindow {
  startDate: string;
  endDate: string;
  feeDeadline?: string;
  correctionWindow?: string;
}

export interface ExamEligibilityRules {
  degree?: string;
  degrees?: string[];
  minPercentage?: number | string;
  minAge?: number;
  maxAge?: number;
  ageLimit?: any;
  eligibleBranches?: string[];
  ageRelaxation?: Record<string, number>;
}

export interface ExamCutoff {
  category: string;
  score: number | string;
  year: string;
}

export interface CourseComment {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  slug: string;
  dbId?: string;
  code?: string;
  title?: string;
  category?: string;
  tagClass?: string;
  conductingBody?: string;
  conductingAuthority?: string;
  domain?: string;
  [key: string]: any;
  category_id: string | null;
  name: string;
  short_name: string;
  organization: string;
  description: string;
  sub_category?: string;

  // Eligibility & Demographics
  qualification_levels: string[];
  degrees: string[];
  branches: string[];
  eligible_branches: string[];
  minimum_qualification?: string;
  maximum_qualification?: string;
  minimum_age: number;
  maximum_age: number;
  age_relaxation?: Record<string, number>;
  eligible_categories: string[];
  eligible_states: string[];
  nationality: string;
  minimum_percentage: number;
  attempt_limit?: Record<string, number | string>;
  eligibilityRules?: ExamEligibilityRules;

  // Career & Salary
  career_type?: string;
  job_type?: string;
  salary_information?: {
    pay_scale?: string;
    basic_pay?: number;
    approx_in_hand_monthly?: number;
    perks?: string[];
    posts?: string[];
    [key: string]: any;
  };

  // Application & Dates
  application_status: string; // Active, Upcoming, Closed
  application_start_date?: string;
  application_start_time?: string;
  application_end_date?: string;
  application_end_time?: string;
  fee_deadline?: string;
  correction_start_date?: string;
  correction_end_date?: string;
  admit_card_date?: string;
  exam_date?: string;
  exam_time?: string;
  answer_key_date?: string;
  result_date?: string;

  // Dynamic parameters for Step 1
  registrationWindow?: ExamRegistrationWindow;
  admitCardDate?: string;
  examDate?: string;
  resultDate?: string;

  // Process & Content
  selection_process: string[];
  exam_pattern?: any;
  syllabus?: any[];
  syllabusTree?: SyllabusSubjectItem[];
  pyqs?: ExamPYQ[];
  curatedCourses?: ExamCuratedCourse[];
  cutoffs?: ExamCutoff[];

  // URLs & Verification
  official_website?: string;
  officialWebsite?: string;
  official_registration_url?: string;
  official_notification_url?: string;
  source_url?: string;
  last_verified_at?: string;
  verification_status?: string;

  created_at?: string;
  updated_at?: string;

  category_name?: string;
  category_slug?: string;
}

export interface OnlineCourse {
  id: string;
  name: string;
  institute: string;
  price: string;
  duration: string;
  language: string;
  rating: number;
  successRate: string;
  pros: string[];
  cons: string[];
  officialWebsite: string;
  discounts: string;
}

export interface OfflineInstitute {
  id: string;
  name: string;
  institute: string;
  city: string;
  price: string;
  rating: number;
  successRate: string;
  pros: string[];
  cons: string[];
  officialWebsite: string;
}

export interface YouTubeChannel {
  name: string;
  examCategory: string;
  subscribers: string;
  freeQuality: string;
  channelUrl: string;
}

export interface RecommendedBook {
  title: string;
  author: string;
  subject: string;
  recommendedFor: string;
  amazonRating: string;
}

export interface CoachingDatabase {
  onlineCourses: OnlineCourse[];
  offlineInstitutes: OfflineInstitute[];
  youtubeChannels: YouTubeChannel[];
  topBooks: RecommendedBook[];
}

// =====================================================================
// STEP 1: UNIFIED DEFAULT EXAMS REGISTRY (RICH DATASET)
// =====================================================================
export const DEFAULT_UNIFIED_EXAMS: Exam[] = [
  {
    id: "gate-cs",
    slug: "gate-cs",
    dbId: "gate-cs",
    code: "GATE_CS",
    title: "GATE Computer Science & Information Technology 2026",
    name: "GATE 2026 (Computer Science & IT)",
    short_name: "GATE CS",
    conductingAuthority: "IIT Guwahati / IISc Bangalore",
    organization: "IIT Guwahati",
    conductingBody: "IIT Guwahati",
    domain: "Engineering & Tech",
    category: "Engineering",
    category_name: "Engineering & Tech",
    category_id: null,
    tagClass: "tag-eng",
    registrationWindow: {
      startDate: "2025-08-28",
      endDate: "2025-10-12",
      feeDeadline: "2025-10-14"
    },
    admitCardDate: "2026-01-08",
    examDate: "2026-02-07",
    resultDate: "2026-03-19",
    application_start_date: "2025-08-28",
    application_end_date: "2025-10-12",
    admit_card_date: "2026-01-08",
    exam_date: "2026-02-07",
    result_date: "2026-03-19",
    application_status: "Active",
    minimum_age: 18,
    maximum_age: 99,
    minimum_percentage: 60,
    qualification_levels: ["Graduate", "Post Graduate"],
    degrees: ["B.Tech", "B.E.", "MCA", "M.Sc (CS/IT)"],
    branches: ["Computer Science", "Information Technology", "Computer Engineering"],
    eligible_branches: ["Computer Science", "Information Technology", "Computer Engineering", "Data Science", "AI & ML"],
    nationality: "Indian",
    eligible_categories: ["GENERAL", "OBC", "SC", "ST", "EWS"],
    eligible_states: ["All India"],
    eligibilityRules: {
      degrees: ["B.Tech", "B.E.", "MCA", "M.Sc (CS/IT)"],
      minPercentage: 60,
      minAge: 18,
      maxAge: 99,
      eligibleBranches: ["Computer Science", "Information Technology", "Computer Engineering", "Data Science", "AI & ML"]
    },
    salary_information: {
      pay_scale: "PSU Grade E2 (₹60,000 - ₹1,80,000) / M.Tech Stipend ₹12,400",
      approx_in_hand_monthly: 95000,
      posts: ["Executive Trainee (IOCL/ONGC/NTPC/ISRO/BARC)", "Scientist/Engineer", "M.Tech Scholar"]
    },
    selection_process: ["Computer Based Test (CBT - 100 Marks)", "PSU Interview / CCMT M.Tech Counseling"],
    exam_pattern: [
      { section: "General Aptitude", questions: 10, marks: 15, duration: "Merged (180 mins total)" },
      { section: "Engineering Mathematics & CS Core", questions: 55, marks: 85, duration: "Merged" }
    ],
    cutoffs: [
      { category: "General", score: 27.6, year: "2024" },
      { category: "OBC-NCL / EWS", score: 24.8, year: "2024" },
      { category: "SC / ST / PwD", score: 18.4, year: "2024" }
    ],
    syllabusTree: [
      {
        subject: "Section 1: Engineering Mathematics & Discrete Math",
        units: [
          { name: "Unit 1: Discrete Mathematics", weightage: "8%", topics: ["Propositional and First-order Logic", "Sets, Relations, Functions, Partial Orders and Lattices", "Monoids, Groups & Combinatorics", "Graph Connectivity, Matching, Coloring"] },
          { name: "Unit 2: Linear Algebra & Calculus", weightage: "7%", topics: ["Matrices, Determinants, Systems of Linear Equations", "Eigenvalues and Eigenvectors, LU Decomposition", "Functions of Single Variable, Limit, Continuity and Differentiability"] },
          { name: "Unit 3: Probability and Statistics", weightage: "5%", topics: ["Random Variables: Uniform, Normal, Exponential, Poisson", "Mean, Median, Mode and Standard Deviation", "Conditional Probability and Bayes Theorem"] }
        ]
      },
      {
        subject: "Section 2: Core Computer Science Disciplines",
        units: [
          { name: "Unit 4: Algorithms & Data Structures", weightage: "18%", topics: ["Asymptotic Worst and Average Case Analysis", "Greedy, Dynamic Programming, Divide-and-Conquer", "Graph Search (BFS, DFS), Minimum Spanning Trees, Shortest Paths", "Binary Search Trees, Heaps, Hash Tables"] },
          { name: "Unit 5: Operating Systems & Virtualization", weightage: "12%", topics: ["Processes, Threads, Inter-process Communication", "Concurrency, Synchronization & Deadlock", "CPU and I/O Scheduling Algorithms", "Virtual Memory, Paging, Segmentation, Page Replacement"] },
          { name: "Unit 6: Database Management Systems", weightage: "11%", topics: ["ER Model, Relational Model, Relational Algebra, Tuple Calculus", "SQL Queries, Constraints, Triggers", "Integrity Constraints, Normal Forms (1NF to BCNF)", "Transactions, Serializability, Concurrency Control (2PL), B+ Trees"] },
          { name: "Unit 7: Computer Networks", weightage: "11%", topics: ["OSI and TCP/IP Layering Architecture", "Data Link Layer: Framing, Error Control (CRC), Flow Control (Sliding Window)", "Network Layer: IPv4/IPv6, CIDR, Subnetting, Routing (Distance Vector, Link State)", "Transport Layer: UDP, TCP, Congestion Control (Tahoe, Reno)", "Application Layer: DNS, SMTP, POP, FTP, HTTP"] },
          { name: "Unit 8: Theory of Computation & Compiler Design", weightage: "13%", topics: ["Regular Expressions & Finite Automata", "Context-Free Grammars & Pushdown Automata", "Turing Machines & Undecidability", "Lexical Analysis, Parsing (LL, LR, LALR)", "Syntax-Directed Translation, Intermediate Code Generation"] }
        ]
      },
      {
        subject: "Section 3: General Aptitude",
        units: [
          { name: "Unit 9: Quantitative & Verbal Aptitude", weightage: "15%", topics: ["Numerical Computation & Estimation", "Percentages, Ratios & Data Interpretation", "English Grammar, Vocabulary Sentences", "Critical Reasoning & Deductive Logic"] }
        ]
      }
    ],
    pyqs: [
      { year: "2024", title: "GATE CS 2024 Shift 1 Official Question Paper with Answer Key", downloadUrl: "https://gate.iitk.ac.in/papers/cs2024-s1.pdf", fileSize: "3.2 MB", stage: "Shift 1" },
      { year: "2024", title: "GATE CS 2024 Shift 2 Official Question Paper with Answer Key", downloadUrl: "https://gate.iitk.ac.in/papers/cs2024-s2.pdf", fileSize: "3.1 MB", stage: "Shift 2" },
      { year: "2023", title: "GATE CS 2023 Official Solved Master Question Paper", downloadUrl: "https://gate.iitk.ac.in/papers/cs2023.pdf", fileSize: "2.8 MB", stage: "Master Shift" },
      { year: "2022", title: "GATE CS 2022 Official Question Paper with Detailed Explanations", downloadUrl: "https://gate.iitk.ac.in/papers/cs2022.pdf", fileSize: "2.4 MB", stage: "Session 1" }
    ],
    curatedCourses: [
      { id: "crs-pw-gate", name: "GATE 2026 Parakram Batch (CS & IT)", provider: "Physics Wallah", instructor: "Khaleel Ahmed & Pankaj Sharma", price: "₹4,999", duration: "12 Months", rating: 4.8, courseUrl: "https://pw.live", badge: "Best Seller" },
      { id: "crs-me-gate", name: "MADE EASY Live Online Comprehensive Classroom Program", provider: "MADE EASY", instructor: "Ex-IES & IISc Faculty Panel", price: "₹34,500", duration: "10 Months", rating: 4.9, courseUrl: "https://madeeasy.in", badge: "Top Ranked" },
      { id: "crs-un-gate", name: "Unacademy GATE CS Iconic Batch", provider: "Unacademy", instructor: "Sanchit Jain & Subba Rao", price: "₹14,999", duration: "12 Months", rating: 4.7, courseUrl: "https://unacademy.com" }
    ],
    officialWebsite: "https://gate.iitk.ac.in",
    description: "National benchmark examination for admission to postgraduate engineering programs (M.Tech/Ph.D) and high-paying executive recruitment in Maharatna PSUs like IOCL, ONGC, NTPC, ISRO, and BARC."
  },
  {
    id: "upsc-cse",
    slug: "upsc-cse",
    dbId: "upsc-cse",
    code: "UPSC_CSE",
    title: "UPSC Civil Services Examination 2025-26 (IAS / IPS / IFS)",
    name: "UPSC Civil Services Examination (IAS / IPS)",
    short_name: "UPSC CSE",
    conductingAuthority: "Union Public Service Commission (UPSC)",
    organization: "Union Public Service Commission",
    conductingBody: "Union Public Service Commission",
    domain: "Civil Services",
    category: "Civil Services",
    category_name: "Civil Services",
    category_id: null,
    tagClass: "tag-govt",
    registrationWindow: {
      startDate: "2026-01-22",
      endDate: "2026-02-18",
      feeDeadline: "2026-02-18"
    },
    admitCardDate: "2026-05-10",
    examDate: "2026-05-24",
    resultDate: "2026-06-28",
    application_start_date: "2026-01-22",
    application_end_date: "2026-02-18",
    admit_card_date: "2026-05-10",
    exam_date: "2026-05-24",
    result_date: "2026-06-28",
    application_status: "Active",
    minimum_age: 21,
    maximum_age: 32,
    minimum_percentage: 0,
    qualification_levels: ["Graduate"],
    degrees: ["Graduate", "B.A.", "B.Sc", "B.Com", "B.Tech", "MBBS"],
    branches: ["All Streams"],
    eligible_branches: ["All Streams (BA, B.Sc, B.Com, B.Tech, MBBS)"],
    nationality: "Indian",
    eligible_categories: ["GENERAL", "OBC", "SC", "ST", "EWS"],
    eligible_states: ["All India"],
    age_relaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    eligibilityRules: {
      degrees: ["Graduate", "B.A.", "B.Sc", "B.Com", "B.Tech", "MBBS"],
      minPercentage: 0,
      minAge: 21,
      maxAge: 32,
      eligibleBranches: ["All Streams"],
      ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 }
    },
    salary_information: {
      pay_scale: "7th CPC Pay Matrix Level 10 (Basic ₹56,100 + 50% DA + 27% HRA)",
      approx_in_hand_monthly: 88000,
      posts: ["IAS (Indian Administrative Service)", "IPS (Police Service)", "IFS (Foreign Service)", "IRS (Revenue Service)"]
    },
    selection_process: ["Prelims (Tier-1 Objective)", "Mains (Tier-2 Written Descriptive - 9 Papers)", "Personality Test / Board Interview"],
    cutoffs: [
      { category: "General", score: 75.4, year: "2023" },
      { category: "EWS", score: 68.0, year: "2023" },
      { category: "OBC", score: 74.7, year: "2023" },
      { category: "SC", score: 59.2, year: "2023" },
      { category: "ST", score: 47.8, year: "2023" }
    ],
    syllabusTree: [
      {
        subject: "Stage 1: Civil Services Preliminary Examination",
        units: [
          { name: "Unit 1: General Studies Paper-I", weightage: "200 Marks", topics: ["Current Affairs (National & International)", "History of India & Indian National Movement", "Indian and World Geography", "Indian Polity & Governance (Constitution, Panchayati Raj)", "Economic & Social Development", "General Science & Technology", "Environmental Ecology & Climate Change"] },
          { name: "Unit 2: General Studies Paper-II (CSAT Qualifying 33%)", weightage: "200 Marks", topics: ["Reading Comprehension", "Interpersonal Skills & Communication", "Logical Reasoning & Analytical Ability", "Decision Making & Problem Solving", "Basic Numeracy (Class X level)", "Data Interpretation (Charts, Graphs)"] }
        ]
      },
      {
        subject: "Stage 2: Civil Services Mains Examination",
        units: [
          { name: "Unit 3: Essay Paper (Paper I)", weightage: "250 Marks", topics: ["Philosophical Essays", "Socio-Economic Dimensions", "International Order & Technology"] },
          { name: "Unit 4: General Studies I (Indian Heritage, History, Geography & Society)", weightage: "250 Marks", topics: ["Art, Literature & Architecture", "Modern Indian History (1757-1947)", "Post-Independence Consolidation", "World Geography & Physical Dynamics"] },
          { name: "Unit 5: General Studies II (Governance, Constitution, Polity & IR)", weightage: "250 Marks", topics: ["Indian Constitution Features & Amendments", "Parliament & State Legislatures", "Welfare Schemes & Social Justice", "India & International Relations"] },
          { name: "Unit 6: General Studies III (Economy, Science, Security & Disaster Mgmt)", weightage: "250 Marks", topics: ["Indian Economy & Resource Mobilization", "Agriculture & Food Processing", "Science & Tech Indigenization", "Internal Security Challenges & Cyber Warfare"] },
          { name: "Unit 7: General Studies IV (Ethics, Integrity & Aptitude)", weightage: "250 Marks", topics: ["Ethics & Human Interface", "Attitude & Emotional Intelligence", "Probity in Governance", "Applied Case Studies"] }
        ]
      }
    ],
    pyqs: [
      { year: "2024", title: "UPSC CSE Prelims 2024 GS Paper 1 Official Question Paper", downloadUrl: "https://upsc.gov.in/papers/csp2024-gs1.pdf", fileSize: "1.9 MB", stage: "Prelims GS-1" },
      { year: "2024", title: "UPSC CSE Prelims 2024 CSAT Paper 2 Official Question Paper", downloadUrl: "https://upsc.gov.in/papers/csp2024-csat.pdf", fileSize: "2.1 MB", stage: "Prelims CSAT" },
      { year: "2023", title: "UPSC CSE Mains 2023 GS-I to GS-IV Official Descriptive Papers", downloadUrl: "https://upsc.gov.in/papers/csm2023-gs.pdf", fileSize: "4.2 MB", stage: "Mains" }
    ],
    curatedCourses: [
      { id: "crs-drishti-upsc", name: "UPSC CSE Foundation Batch 2026", provider: "Drishti IAS", instructor: "Dr. Vikas Divyakirti & Panel", price: "₹65,000", duration: "18 Months", rating: 4.9, courseUrl: "https://drishtiias.com", badge: "Flagship" },
      { id: "crs-vision-upsc", name: "Vision IAS GS Comprehensive Classroom Batch", provider: "Vision IAS", instructor: "Vision Senior Academic Faculty", price: "₹85,000", duration: "14 Months", rating: 4.8, courseUrl: "https://visionias.in" }
    ],
    officialWebsite: "https://upsc.gov.in",
    description: "India premier civil service entrance exam for appointment to top administrative (IAS), diplomatic (IFS), and law enforcement (IPS) posts across central and state cadres."
  },
  {
    id: "ssc-cgl",
    slug: "ssc-cgl",
    dbId: "ssc-cgl",
    code: "SSC_CGL",
    title: "SSC Combined Graduate Level Examination 2025-26 (CGL)",
    name: "SSC Combined Graduate Level (CGL)",
    short_name: "SSC CGL",
    conductingAuthority: "Staff Selection Commission (SSC)",
    organization: "Staff Selection Commission",
    conductingBody: "Staff Selection Commission",
    domain: "Civil Services",
    category: "Civil Services",
    category_name: "Civil Services",
    category_id: null,
    tagClass: "tag-govt",
    registrationWindow: {
      startDate: "2025-06-24",
      endDate: "2025-07-27",
      feeDeadline: "2025-07-29"
    },
    admitCardDate: "2025-08-28",
    examDate: "2025-09-12",
    resultDate: "2025-11-15",
    application_start_date: "2025-06-24",
    application_end_date: "2025-07-27",
    admit_card_date: "2025-08-28",
    exam_date: "2025-09-12",
    application_status: "Active",
    minimum_age: 18,
    maximum_age: 30,
    minimum_percentage: 0,
    qualification_levels: ["Graduate"],
    degrees: ["Graduate", "Any Degree"],
    branches: ["All Streams"],
    eligible_branches: ["All Streams"],
    nationality: "Indian",
    eligible_categories: ["GENERAL", "OBC", "SC", "ST", "EWS"],
    eligible_states: ["All India"],
    age_relaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    eligibilityRules: {
      degrees: ["Graduate", "Any Degree"],
      minPercentage: 0,
      minAge: 18,
      maxAge: 30,
      eligibleBranches: ["All Streams"],
      ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 }
    },
    salary_information: {
      pay_scale: "7th CPC Pay Level 7 (Basic ₹44,900 + 50% DA + 27% HRA)",
      approx_in_hand_monthly: 76000,
      posts: ["Assistant Section Officer (MEA/CSS)", "Income Tax Inspector", "Central Excise Inspector", "Assistant Enforcement Officer"]
    },
    selection_process: ["Tier-1 Computer Based Test (200 Marks)", "Tier-2 Computer Based Test + Data Entry Speed Test"],
    syllabusTree: [
      {
        subject: "Tier-1 & Tier-2 Comprehensive Curriculum",
        units: [
          { name: "Unit 1: Quantitative Aptitude", weightage: "35%", topics: ["Arithmetic & Number Systems", "Algebra, Geometry & Mensuration", "Trigonometry & Heights/Distances", "Data Analysis & Statistics"] },
          { name: "Unit 2: General Intelligence & Reasoning", weightage: "30%", topics: ["Analogies & Venn Diagrams", "Coding-Decoding & Number Series", "Critical Reasoning & Syllogisms", "Non-Verbal & Pattern Folding"] },
          { name: "Unit 3: English Language & Comprehension", weightage: "25%", topics: ["Grammar Conformance & Error Spotting", "Active/Passive Voice & Direct/Indirect", "Cloze Test & Reading Passages", "Vocabulary & Idiomatic Phrases"] },
          { name: "Unit 4: General Awareness & Computer Proficiency", weightage: "10%", topics: ["Current Affairs & Static GK", "Indian Constitution & Polity", "Computer Basics (RAM, ROM, OS, Networking)", "Cyber Security & Keyboard Shortcuts"] }
        ]
      }
    ],
    pyqs: [
      { year: "2024", title: "SSC CGL 2024 Tier-1 Official Shift 1 Question Paper", downloadUrl: "https://ssc.gov.in/papers/cgl2024-t1.pdf", fileSize: "1.8 MB", stage: "Tier-1" },
      { year: "2023", title: "SSC CGL 2023 Tier-2 Solved Examination Paper", downloadUrl: "https://ssc.gov.in/papers/cgl2023-t2.pdf", fileSize: "2.4 MB", stage: "Tier-2" }
    ],
    curatedCourses: [
      { id: "crs-un-ssc", name: "SSC CGL 2025 All-Star Target Batch", provider: "Unacademy", instructor: "Gagan Pratap & Ramo Sir", price: "₹3,499", duration: "12 Months", rating: 4.7, courseUrl: "https://unacademy.com", badge: "Trending" }
    ],
    officialWebsite: "https://ssc.gov.in",
    description: "Recruitment for prestigious Group B Gazetted & Non-Gazetted Officer positions across Central Ministries, Income Tax, and Customs."
  },
  {
    id: "isro-sc",
    slug: "isro-sc",
    dbId: "isro-sc",
    code: "ISRO_ICRB",
    title: "ISRO Scientist/Engineer 'SC' Recruitment (ICRB 2026)",
    name: "ISRO Scientist/Engineer 'SC' (ICRB)",
    short_name: "ISRO ICRB",
    conductingAuthority: "Indian Space Research Organisation (ISRO)",
    organization: "ISRO",
    conductingBody: "ISRO",
    domain: "PSU & Research",
    category: "PSU",
    category_name: "PSU & Research",
    category_id: null,
    tagClass: "tag-eng",
    registrationWindow: {
      startDate: "2025-11-15",
      endDate: "2025-12-19",
      feeDeadline: "2025-12-21"
    },
    admitCardDate: "2026-01-20",
    examDate: "2026-02-15",
    resultDate: "2026-03-30",
    application_start_date: "2025-11-15",
    application_end_date: "2025-12-19",
    admit_card_date: "2026-01-20",
    exam_date: "2026-02-15",
    application_status: "Upcoming",
    minimum_age: 18,
    maximum_age: 28,
    minimum_percentage: 65,
    qualification_levels: ["Graduate"],
    degrees: ["B.Tech", "B.E.", "B.Sc (Engg)"],
    branches: ["Computer Science", "Electronics & Communication", "Mechanical Engineering"],
    eligible_branches: ["Computer Science", "Electronics & Communication", "Mechanical Engineering"],
    nationality: "Indian",
    eligible_categories: ["GENERAL", "OBC", "SC", "ST", "EWS"],
    eligible_states: ["All India"],
    age_relaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    eligibilityRules: {
      degrees: ["B.Tech", "B.E.", "B.Sc (Engg)"],
      minPercentage: 65,
      minAge: 18,
      maxAge: 28,
      eligibleBranches: ["Computer Science", "Electronics & Communication", "Mechanical Engineering"],
      ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 }
    },
    salary_information: {
      pay_scale: "7th CPC Pay Level 10 (Basic ₹56,100 + DA + HRA)",
      approx_in_hand_monthly: 86000,
      posts: ["Scientist/Engineer 'SC' (Spacecraft Systems, Payload, Launch Vehicle)"]
    },
    selection_process: ["Written Examination (Part A Discipline 80 Marks + Part B Aptitude 20 Marks)", "Technical Interview (100 Marks)"],
    syllabusTree: [
      {
        subject: "Discipline Core Technical & Space Systems",
        units: [
          { name: "Unit 1: Technical Core Foundation", weightage: "80%", topics: ["Digital Electronics & Microprocessors", "Computer Architecture & Embedded Systems", "Data Structures, Algorithms & OS Concurrency", "Signals, Systems & Control Theory"] },
          { name: "Unit 2: General & Engineering Aptitude", weightage: "20%", topics: ["Numerical Reasoning & Pattern Recognition", "Spatial Aptitude & Mechanical Reasoning", "Logical Deductions & Data Analysis"] }
        ]
      }
    ],
    pyqs: [
      { year: "2023", title: "ISRO ICRB Computer Science Question Paper with Official Keys", downloadUrl: "https://isro.gov.in/papers/icrb2023-cs.pdf", fileSize: "2.1 MB" },
      { year: "2020", title: "ISRO ICRB Scientist 'SC' Solved Technical Paper", downloadUrl: "https://isro.gov.in/papers/icrb2020-cs.pdf", fileSize: "2.6 MB" }
    ],
    curatedCourses: [
      { id: "crs-me-isro", name: "MADE EASY ISRO & DRDO Dedicated Technical Batch", provider: "MADE EASY", instructor: "Senior R&D Faculty", price: "₹18,500", duration: "6 Months", rating: 4.8, courseUrl: "https://madeeasy.in", badge: "Specialized" }
    ],
    officialWebsite: "https://isro.gov.in",
    description: "Direct recruitment of Scientists/Engineers 'SC' into premier research and development space centers under the Department of Space."
  },
  {
    id: "barc-oces",
    slug: "barc-oces",
    dbId: "barc-oces",
    code: "BARC_OCES",
    title: "BARC Scientific Officer Examination (OCES/DGFS 2026)",
    name: "BARC Scientific Officer (OCES/DGFS)",
    short_name: "BARC OCES",
    conductingAuthority: "Bhabha Atomic Research Centre (BARC)",
    organization: "Bhabha Atomic Research Centre",
    conductingBody: "Bhabha Atomic Research Centre",
    domain: "PSU & Research",
    category: "PSU",
    category_name: "PSU & Research",
    category_id: null,
    tagClass: "tag-eng",
    registrationWindow: {
      startDate: "2025-12-30",
      endDate: "2026-01-30",
      feeDeadline: "2026-02-01"
    },
    admitCardDate: "2026-02-25",
    examDate: "2026-03-15",
    resultDate: "2026-04-20",
    application_start_date: "2025-12-30",
    application_end_date: "2026-01-30",
    admit_card_date: "2026-02-25",
    exam_date: "2026-03-15",
    application_status: "Upcoming",
    minimum_age: 18,
    maximum_age: 26,
    minimum_percentage: 60,
    qualification_levels: ["Graduate", "Post Graduate"],
    degrees: ["B.Tech", "B.E.", "M.Sc"],
    branches: ["Mechanical", "Chemical", "Electrical", "Electronics", "Computer Science", "Physics", "Chemistry"],
    eligible_branches: ["Mechanical", "Chemical", "Electrical", "Electronics", "Computer Science", "Physics", "Chemistry"],
    nationality: "Indian",
    eligible_categories: ["GENERAL", "OBC", "SC", "ST", "EWS"],
    eligible_states: ["All India"],
    age_relaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    eligibilityRules: {
      degrees: ["B.Tech", "B.E.", "M.Sc"],
      minPercentage: 60,
      minAge: 18,
      maxAge: 26,
      eligibleBranches: ["Mechanical", "Chemical", "Electrical", "Electronics", "Computer Science", "Physics", "Chemistry"],
      ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 }
    },
    salary_information: {
      pay_scale: "Scientific Officer 'C' Pay Level 10 (Basic ₹56,100 + Allowances)",
      approx_in_hand_monthly: 88000,
      posts: ["Scientific Officer 'C' (Nuclear Power, Radioisotopes, Reactor Physics)"]
    },
    selection_process: ["Online Screening CBT (100 Questions, 300 Marks) OR GATE Score", "Rigorous In-Person Technical Board Interview at BARC Mumbai"],
    syllabusTree: [
      {
        subject: "Discipline Engineering & Applied Nuclear Principles",
        units: [
          { name: "Unit 1: Core Discipline Fundamentals", weightage: "80%", topics: ["Core Engineering Thermodynamics & Fluid Mechanics", "Digital Logic, Data Structures & Compilers", "Nuclear Physics & Radiation Shielding", "Materials Science & Corrosion Engineering"] },
          { name: "Unit 2: Applied Calculations & Chemistry", weightage: "20%", topics: ["Differential Equations & Vector Calculus", "Stoichiometry & Reaction Kinetics", "Numerical Methods & Approximation"] }
        ]
      }
    ],
    pyqs: [
      { year: "2023", title: "BARC OCES Scientific Officer Computer Science Memory Recall Paper", downloadUrl: "https://barconlineexam.com/papers/oces2023.pdf", fileSize: "2.3 MB" }
    ],
    curatedCourses: [
      { id: "crs-barc-special", name: "BARC Scientific Officer Test & Interview Guidance", provider: "MADE EASY", instructor: "DAE & IIT Panel", price: "₹12,000", duration: "4 Months", rating: 4.8, courseUrl: "https://madeeasy.in" }
    ],
    officialWebsite: "https://barconlineexam.com",
    description: "Premier academic and training scheme for appointment as Scientific Officer 'C' across Department of Atomic Energy (DAE) facilities including BARC, IGCAR, RRCAT, and VECC."
  },
  {
    id: "ibps-po",
    slug: "ibps-po",
    dbId: "ibps-po",
    code: "IBPS_PO",
    title: "IBPS Probationary Officer CRP XV (2025-26)",
    name: "IBPS Probationary Officer (CRP XV)",
    short_name: "IBPS PO",
    conductingAuthority: "Institute of Banking Personnel Selection (IBPS)",
    organization: "IBPS",
    conductingBody: "IBPS",
    domain: "Banking",
    category: "Banking",
    category_name: "Banking & Financial",
    category_id: null,
    tagClass: "tag-bank",
    registrationWindow: {
      startDate: "2025-08-01",
      endDate: "2025-08-28",
      feeDeadline: "2025-08-28"
    },
    admitCardDate: "2025-10-05",
    examDate: "2025-10-19",
    resultDate: "2025-11-20",
    application_start_date: "2025-08-01",
    application_end_date: "2025-08-28",
    admit_card_date: "2025-10-05",
    exam_date: "2025-10-19",
    application_status: "Active",
    minimum_age: 20,
    maximum_age: 30,
    minimum_percentage: 0,
    qualification_levels: ["Graduate"],
    degrees: ["Graduate", "Any Degree"],
    branches: ["All Streams"],
    eligible_branches: ["All Streams"],
    nationality: "Indian",
    eligible_categories: ["GENERAL", "OBC", "SC", "ST", "EWS"],
    eligible_states: ["All India"],
    age_relaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    eligibilityRules: {
      degrees: ["Graduate", "Any Degree"],
      minPercentage: 0,
      minAge: 20,
      maxAge: 30,
      eligibleBranches: ["All Streams"],
      ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 }
    },
    salary_information: {
      pay_scale: "12th Bipartite Settlement Scale-I (Basic ₹48,480 + Allowances)",
      approx_in_hand_monthly: 66000,
      posts: ["Probationary Officer / Management Trainee across 11 Public Sector Banks"]
    },
    selection_process: ["Prelims CBT (100 Marks)", "Mains CBT + Descriptive Essay/Letter (225 Marks)", "In-Person Panel Interview (100 Marks)"],
    syllabusTree: [
      {
        subject: "Prelims & Mains Banking Syllabus",
        units: [
          { name: "Unit 1: Reasoning & Computer Aptitude", weightage: "35%", topics: ["Puzzles & Seating Arrangements", "Inequalities, Syllogisms & Blood Relations", "Data Sufficiency & Flowcharts"] },
          { name: "Unit 2: Quantitative Aptitude & Data Interpretation", weightage: "35%", topics: ["Caselets, Bar & Radar Graphs", "Quadratic Equations, Number Series", "Commercial Arithmetic (Profit, CI/SI)"] },
          { name: "Unit 3: Banking & Financial Awareness", weightage: "30%", topics: ["RBI Monetary Policies & Inflation", "Financial Inclusion & Priority Sector Lending", "Capital & Money Markets, Basel III Norms"] }
        ]
      }
    ],
    pyqs: [
      { year: "2024", title: "IBPS PO 2024 Prelims Official Shift 1 Memory-Based Paper", downloadUrl: "https://ibps.in/papers/po2024-pre.pdf", fileSize: "1.6 MB" },
      { year: "2023", title: "IBPS PO 2023 Mains Official Question Paper with Solutions", downloadUrl: "https://ibps.in/papers/po2023-mains.pdf", fileSize: "2.5 MB" }
    ],
    curatedCourses: [
      { id: "crs-adda-bank", name: "Bank MahaPack Plus 2025-26", provider: "Adda247", instructor: "Shantanu Sir & Saurav Sir", price: "₹4,599", duration: "12 Months", rating: 4.7, courseUrl: "https://adda247.com", badge: "Comprehensive" }
    ],
    officialWebsite: "https://ibps.in",
    description: "Management officer cadre entrance for India's 11 major nationalized public sector banks including PNB, BOB, Canara Bank, and Bank of India."
  }
];

export const EXAMS_DATABASE: any[] = DEFAULT_UNIFIED_EXAMS;

export const COACHING_DATABASE: CoachingDatabase = {
  onlineCourses: [
    {
      id: "pw-gate-parakram",
      name: "GATE 2026 Parakram Batch (Computer Science / IT)",
      institute: "Physics Wallah (PW)",
      price: "₹4,999",
      duration: "12 Months",
      language: "Hinglish / English",
      rating: 4.8,
      successRate: "34.5%",
      pros: ["Comprehensive DPPs & Test Series", "Live & Recorded Classes", "Highly Affordable"],
      cons: ["High student volume in live chat"],
      officialWebsite: "https://pw.live",
      discounts: "Use Code UDANPATH10 for 10% Extra Off"
    },
    {
      id: "drishti-upsc-pre-mains",
      name: "UPSC CSE Foundation Batch 2026",
      institute: "Drishti IAS",
      price: "₹65,000",
      duration: "18 Months",
      language: "Hindi / English",
      rating: 4.9,
      successRate: "28.2%",
      pros: ["Top-tier Faculty (Vikas Divyakirti Sir)", "Exhaustive Study Material", "Dedicated Mains Answer Writing"],
      cons: ["Premium price point"],
      officialWebsite: "https://drishtiias.com",
      discounts: "Up to ₹5,000 Scholarship via Drishti Test"
    },
    {
      id: "unacademy-ssc-cgl-plus",
      name: "SSC CGL 2025-26 All-Star Target Batch",
      institute: "Unacademy",
      price: "₹3,499 / yr",
      duration: "12 Months Subscription",
      language: "Hinglish",
      rating: 4.7,
      successRate: "31.0%",
      pros: ["Access to all SSC educators (Gagan Pratap, Remo Sir)", "Unlimited Mock Tests"],
      cons: ["Self-discipline required for subscription model"],
      officialWebsite: "https://unacademy.com",
      discounts: "Use Code UNACADEMY20 for 20% Off"
    },
    {
      id: "adda247-bank-mahapack",
      name: "Bank MahaPack (IBPS PO, SBI PO, RRB)",
      institute: "Adda247",
      price: "₹4,599",
      duration: "12 Months",
      language: "English / Hindi",
      rating: 4.7,
      successRate: "33.8%",
      pros: ["Covers all Banking & Insurance exams", "Live Doubt Support", "Daily E-books & Quizzes"],
      cons: ["Fast-paced lectures"],
      officialWebsite: "https://adda247.com",
      discounts: "Flat 77% Off Active"
    }
  ],
  offlineInstitutes: [
    {
      id: "made-easy-delhi",
      name: "MADE EASY Classroom Program (GATE + ESE)",
      institute: "MADE EASY (Kalu Sarai, New Delhi)",
      city: "New Delhi / Hyderabad",
      price: "₹88,000",
      rating: 4.9,
      successRate: "42.0%",
      pros: ["Undisputed #1 in GATE & ESE Ranks", "Rigorous Test Series", "Experienced IISC/IITian Faculty"],
      cons: ["Intense 8-hour daily schedule"],
      officialWebsite: "https://madeeasy.in"
    },
    {
      id: "vision-ias-delhi",
      name: "Vision IAS General Studies Classroom Program",
      institute: "Vision IAS (Rajendra Nagar, New Delhi)",
      city: "New Delhi / Jaipur / Pune",
      price: "₹1,45,000",
      rating: 4.8,
      successRate: "35.4%",
      pros: ["Best Mains Test Series in India", "Personal Mentorship", "Updated Monthly Current Affairs"],
      cons: ["High batch strength"],
      officialWebsite: "https://visionias.in"
    },
    {
      id: "allen-kota-jee-neet",
      name: "ALLEN Career Institute Classroom Program",
      institute: "ALLEN (Kota, Rajasthan)",
      city: "Kota / Ahmedabad / Delhi",
      price: "₹1,35,000",
      rating: 4.9,
      successRate: "39.8%",
      pros: ["Unmatched Competitive Environment", "Periodic National Rank Tests", "Doubt Counters"],
      cons: ["Relocating to Kota required"],
      officialWebsite: "https://allen.ac.in"
    }
  ],
  youtubeChannels: [
    { name: "Physics Wallah - Alakh Pandey", examCategory: "JEE / NEET / GATE", subscribers: "12.4M", freeQuality: "5/5 Star", channelUrl: "https://youtube.com/@PhysicsWallah" },
    { name: "Drishti IAS", examCategory: "UPSC CSE / State PSC", subscribers: "11.2M", freeQuality: "5/5 Star", channelUrl: "https://youtube.com/@DrishtiIASvideos" },
    { name: "Gagan Pratap Maths", examCategory: "SSC CGL / Railways", subscribers: "4.8M", freeQuality: "4.9/5 Star", channelUrl: "https://youtube.com/@GaganPratapMaths" },
    { name: "Gate Smashers", examCategory: "GATE CS / IT / University Exams", subscribers: "1.6M", freeQuality: "5/5 Star", channelUrl: "https://youtube.com/@GateSmashers" },
    { name: "Unacademy Computer Science", examCategory: "GATE CS / ISRO / BARC", subscribers: "850K", freeQuality: "4.8/5 Star", channelUrl: "https://youtube.com/@UnacademyComputerScience" }
  ],
  topBooks: [
    { title: "Indian Polity (7th Edition)", author: "M. Laxmikanth", subject: "General Studies / UPSC", recommendedFor: "UPSC CSE, State PSC, SSC CGL", amazonRating: "4.8/5" },
    { title: "Quantitative Aptitude for Competitive Examinations", author: "R.S. Aggarwal", subject: "Maths / Aptitude", recommendedFor: "SSC CGL, IBPS PO, RRB NTPC, Campus Placements", amazonRating: "4.7/5" },
    { title: "GATE Computer Science & IT (2026 Edition)", author: "MADE EASY Publications", subject: "CS Core Subjects", recommendedFor: "GATE CS, ISRO Scientist, DRDO, BARC", amazonRating: "4.9/5" },
    { title: "Concepts of Physics (Vol 1 & 2)", author: "H.C. Verma", subject: "Physics", recommendedFor: "JEE Main, JEE Advanced, NEET UG", amazonRating: "4.9/5" }
  ]
};

// =====================================================================
// STEP 1: PERSISTENCE & HYDRATION ENGINE
// =====================================================================
export const MASTER_STORE_KEY = 'udanpath_master_store';

export function getExams(): Exam[] {
  if (typeof window === 'undefined') return DEFAULT_UNIFIED_EXAMS;
  try {
    const raw = localStorage.getItem(MASTER_STORE_KEY) || localStorage.getItem('udanpath_exams_master');
    if (!raw) {
      saveExams(DEFAULT_UNIFIED_EXAMS);
      return DEFAULT_UNIFIED_EXAMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveExams(DEFAULT_UNIFIED_EXAMS);
    return DEFAULT_UNIFIED_EXAMS;
  } catch (err) {
    console.error('Error reading master store:', err);
    return DEFAULT_UNIFIED_EXAMS;
  }
}

export function saveExams(exams: Exam[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MASTER_STORE_KEY, JSON.stringify(exams));
    localStorage.setItem('udanpath_exams_master', JSON.stringify(exams));
    window.dispatchEvent(new CustomEvent('udanpath_master_store_updated', { detail: exams }));
    window.dispatchEvent(new CustomEvent('udanpath_exams_updated', { detail: exams }));
  } catch (err) {
    console.error('Error saving master exams store:', err);
  }
}

export function getExamBySlug(slug: string): Exam | undefined {
  const list = getExams();
  const target = (slug || '').toLowerCase().trim();
  return list.find(e => 
    e.slug?.toLowerCase() === target ||
    e.id?.toLowerCase() === target ||
    e.code?.toLowerCase() === target ||
    e.short_name?.toLowerCase() === target ||
    e.name?.toLowerCase() === target ||
    (e.slug && e.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === target.replace(/[^a-z0-9]/g, ''))
  );
}

export function addExam(newExam: Partial<Exam>): Exam[] {
  const current = getExams();
  const id = newExam.id || newExam.slug || ('exam-' + Date.now());
  const slug = newExam.slug || newExam.id || id;

  const fullExam: Exam = {
    id,
    slug,
    dbId: id,
    name: newExam.name || newExam.title || 'Target Exam',
    title: newExam.title || newExam.name || 'Target Exam',
    short_name: newExam.short_name || newExam.code || slug.toUpperCase(),
    code: newExam.code || newExam.short_name || slug.toUpperCase(),
    conductingAuthority: newExam.conductingAuthority || newExam.organization || newExam.conductingBody || 'National Exam Body',
    organization: newExam.organization || newExam.conductingAuthority || newExam.conductingBody || 'National Exam Body',
    conductingBody: newExam.conductingBody || newExam.conductingAuthority || newExam.organization || 'National Exam Body',
    domain: newExam.domain || newExam.category || 'Engineering & Tech',
    category: newExam.category || newExam.domain || 'Engineering',
    category_name: newExam.category_name || newExam.category || newExam.domain || 'Engineering & Tech',
    category_id: null,
    registrationWindow: newExam.registrationWindow || {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    admitCardDate: newExam.admitCardDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    examDate: newExam.examDate || new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    application_start_date: newExam.registrationWindow?.startDate || new Date().toISOString().split('T')[0],
    application_end_date: newExam.registrationWindow?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    admit_card_date: newExam.admitCardDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    exam_date: newExam.examDate || new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    application_status: newExam.application_status || 'Active',
    eligibilityRules: newExam.eligibilityRules || {
      degrees: newExam.degrees || ['Graduate'],
      minPercentage: newExam.minimum_percentage || 0,
      minAge: newExam.minimum_age || 18,
      maxAge: newExam.maximum_age || 32,
      eligibleBranches: newExam.eligible_branches || ['All Streams']
    },
    qualification_levels: newExam.qualification_levels || ['Graduate'],
    degrees: newExam.degrees || ['Graduate'],
    branches: newExam.branches || ['All Streams'],
    eligible_branches: newExam.eligible_branches || ['All Streams'],
    nationality: 'Indian',
    eligible_categories: ['GENERAL', 'OBC', 'SC', 'ST', 'EWS'],
    eligible_states: ['All India'],
    minimum_age: newExam.minimum_age || 18,
    maximum_age: newExam.maximum_age || 32,
    minimum_percentage: newExam.minimum_percentage || 0,
    syllabusTree: newExam.syllabusTree || [
      {
        subject: "Core Examination Syllabus",
        units: [
          { name: "Unit 1: Foundational Principles", topics: ["Topic 1.1", "Topic 1.2", "Topic 1.3"] },
          { name: "Unit 2: Advanced Core Applications", topics: ["Topic 2.1", "Topic 2.2", "Topic 2.3"] }
        ]
      }
    ],
    pyqs: newExam.pyqs || [
      { year: "2024", title: `${newExam.short_name || 'Target'} 2024 Official Paper`, downloadUrl: "#", fileSize: "2.5 MB" }
    ],
    curatedCourses: newExam.curatedCourses || [],
    description: newExam.description || 'National level competitive examination.',
    officialWebsite: newExam.officialWebsite || 'https://upsc.gov.in',
    salary_information: newExam.salary_information || {
      pay_scale: 'Level 10 (7th CPC) / ₹56,100',
      approx_in_hand_monthly: 85000
    },
    selection_process: newExam.selection_process || ['Written Examination', 'Interview'],
    ...newExam
  } as Exam;

  const existingIdx = current.findIndex(e => e.id === id || e.slug === slug);
  let updatedList: Exam[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = { ...updatedList[existingIdx], ...fullExam };
  } else {
    updatedList = [fullExam, ...current];
  }

  saveExams(updatedList);
  return updatedList;
}

export function deleteExam(idOrSlug: string): Exam[] {
  const current = getExams();
  const target = (idOrSlug || '').toLowerCase().trim();
  const updatedList = current.filter(e => 
    e.id.toLowerCase() !== target && 
    e.slug?.toLowerCase() !== target && 
    e.short_name?.toLowerCase() !== target
  );
  saveExams(updatedList);
  return updatedList;
}

export function updateExamSchedules(examId: string, scheduleData: any): Exam[] {
  const current = getExams();
  const target = (examId || '').toLowerCase().trim();
  const updatedList = current.map(e => {
    if (e.id.toLowerCase() === target || e.slug?.toLowerCase() === target || e.short_name?.toLowerCase() === target) {
      const regStart = scheduleData.startDate || scheduleData.registrationStartDate || e.registrationWindow?.startDate;
      const regEnd = scheduleData.endDate || scheduleData.registrationEndDate || e.registrationWindow?.endDate;
      const admit = scheduleData.admitCardDate || e.admitCardDate;
      const examDt = scheduleData.examDate || e.examDate;
      const resDt = scheduleData.resultDate || e.resultDate;
      const status = scheduleData.status === 'Live' ? 'Active' : (scheduleData.status || e.application_status);

      return {
        ...e,
        registrationWindow: {
          ...e.registrationWindow,
          startDate: regStart,
          endDate: regEnd
        },
        application_start_date: regStart,
        application_end_date: regEnd,
        admitCardDate: admit,
        admit_card_date: admit,
        examDate: examDt,
        exam_date: examDt,
        resultDate: resDt,
        result_date: resDt,
        application_status: status
      };
    }
    return e;
  });
  saveExams(updatedList);
  return updatedList;
}

export function getCourseReviews(courseId: string): CourseComment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`udanpath_comments_${courseId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading course reviews:', e);
  }
  return [];
}

export function addCourseReview(courseId: string, reviewItem: CourseComment): CourseComment[] {
  if (typeof window === 'undefined') return [reviewItem];
  const current = getCourseReviews(courseId);
  const updated = [reviewItem, ...current];
  try {
    localStorage.setItem(`udanpath_comments_${courseId}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('udanpath_comments_updated', { detail: { courseId, reviews: updated } }));
  } catch (e) {
    console.error('Error saving course review:', e);
  }
  return updated;
}
