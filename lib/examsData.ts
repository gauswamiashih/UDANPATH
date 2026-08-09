export interface Exam {
  id: string;
  dbId?: string;
  code?: string;
  title?: string;
  category?: string;
  tagClass?: string;
  conductingBody?: string;
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

  // Process & Content
  selection_process: string[];
  exam_pattern?: any[];
  syllabus?: any[];

  // URLs & Verification
  official_website?: string;
  official_registration_url?: string;
  official_notification_url?: string;
  source_url?: string;
  last_verified_at?: string;
  verification_status?: string;

  created_at?: string;
  updated_at?: string;

  // Joined from categories
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

export const EXAMS_DATABASE: any[] = [
  {
    id: "upsc-cse",
    code: "UPSC_CSE",
    title: "UPSC Civil Services Examination 2025-26 (IAS / IPS / IFS)",
    category: "UPSC",
    tagClass: "tag-govt",
    conductingBody: "Union Public Service Commission",
    level: "National",
    frequency: "Annual (Notification Every Feb)",
    minEducation: "Graduate",
    eligibleStreams: ["All Streams (BA, B.Sc, B.Com, B.Tech, MBBS)"],
    minAge: 21,
    maxAgeGen: 32,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: 6, OBC: 9, SC_ST: "Unlimited till 37 yrs" },
    salaryRange: "₹85,000 - ₹2,50,000 / month",
    payLevel: "7th CPC Pay Matrix Level 10 (Basic ₹56,100 + 50% DA + 27% HRA)",
    posts: ["IAS (Indian Administrative Service)", "IPS (Police Service)", "IFS (Foreign Service)", "IRS (Revenue Service)"],
    applicationFee: "₹100 (Female/SC/ST/PwBD Exempted)",
    stages: [
      { stage: "Prelims (Tier-1)", mode: "Offline (OMR)", marks: 400, papers: "GS Paper-1 (200 marks) + CSAT (200 marks, qualifying 33%)" },
      { stage: "Mains (Tier-2)", mode: "Offline Written Descriptive", marks: 1750, papers: "9 Papers (Essay, GS I-IV, 2 Optional Papers, Language Papers)" },
      { stage: "Personality Test (Interview)", mode: "In-Person Board Interview", marks: 275, papers: "DOP&T Personality Board Assessment" }
    ],
    topBooks: [
      "Indian Polity (7th Edition) by M. Laxmikanth",
      "Indian Art and Culture by Nitin Singhania",
      "Certificate Physical and Human Geography by Goh Cheng Leong",
      "Environment (9th Edition) by Shankar IAS Academy"
    ],
    youtubeChannels: ["Drishti IAS", "Unacademy IAS", "Sleepy Classes", "StudyIQ IAS"],
    officialWebsite: "https://upsc.gov.in",
    notificationPdf: "https://upsc.gov.in/sites/default/files/Notif-CSP-24-engl-140224.pdf",
    description: "India's premier civil service entrance exam for appointment to top administrative (IAS), diplomatic (IFS), and law enforcement (IPS) posts."
  },
  {
    id: "ssc-cgl",
    code: "SSC_CGL",
    title: "SSC Combined Graduate Level 2024-25 (CGL)",
    category: "SSC",
    tagClass: "tag-govt",
    conductingBody: "Staff Selection Commission",
    level: "National",
    frequency: "Annual",
    minEducation: "Graduate",
    eligibleStreams: ["All Streams"],
    minAge: 18,
    maxAgeGen: 30,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: "Unlimited till 30 yrs", OBC: "Unlimited till 33 yrs", SC_ST: "Unlimited till 35 yrs" },
    salaryRange: "₹70,000 - ₹88,000 / month (X-Cities)",
    payLevel: "7th CPC Pay Level 7 (Basic ₹44,900 + 50% DA + 27% HRA)",
    posts: ["Assistant Section Officer (MEA/CSS)", "Income Tax Inspector", "Central Excise Inspector", "Assistant Enforcement Officer"],
    applicationFee: "₹100 (Women/SC/ST/Ex-Servicemen Exempted)",
    stages: [
      { stage: "Tier-1 (Prelims)", mode: "Online CBT", marks: 200, papers: "Reasoning (50), Quant (50), English (50), General Awareness (50)" },
      { stage: "Tier-2 (Mains)", mode: "Online CBT", marks: 390, papers: "Maths (90), Reasoning (90), English (135), GA (75), Computer Test (Qualifying)" }
    ],
    topBooks: [
      "Quantitative Aptitude for Competitive Exams by R.S. Aggarwal",
      "Word Power Made Easy by Norman Lewis",
      "Lucent's General Knowledge (Updated 2025 Edition)",
      "Verbal & Non-Verbal Reasoning by R.S. Aggarwal"
    ],
    youtubeChannels: ["Ramo Sir (REMO Math)", "Gagan Pratap Maths", "Aditya Ranjan Talks", "SSC Adda247"],
    officialWebsite: "https://ssc.gov.in",
    notificationPdf: "https://ssc.gov.in/notifications/cgl-2024.pdf",
    description: "Recruitment for Group B Gazetted & Non-Gazetted Officer positions across Central Ministries, Income Tax, and Customs."
  },
  {
    id: "ibps-po",
    code: "IBPS_PO",
    title: "IBPS Probationary Officer CRP XIV (2024-25)",
    category: "Banking",
    tagClass: "tag-bank",
    conductingBody: "Institute of Banking Personnel Selection",
    level: "National",
    frequency: "Annual (Notification Every Aug)",
    minEducation: "Graduate",
    eligibleStreams: ["All Streams"],
    minAge: 20,
    maxAgeGen: 30,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: "Unlimited till 30 yrs", OBC: "Unlimited till 33 yrs", SC_ST: "Unlimited till 35 yrs" },
    salaryRange: "₹62,000 - ₹68,000 / month",
    payLevel: "12th Bipartite Settlement Scale-I (Basic ₹48,480 + Allowances)",
    posts: ["Probationary Officer in 11 Public Sector Banks (PNB, BOB, Canara, Bank of India)"],
    applicationFee: "₹850 (Gen/OBC) / ₹175 (SC/ST/PWD)",
    stages: [
      { stage: "Prelims CBT", mode: "Online CBT", marks: 100, papers: "English (30), Quant (35), Reasoning (35) - 60 Minutes" },
      { stage: "Mains CBT + Essay", mode: "Online CBT + Descriptive", marks: 225, papers: "Reasoning (60), Data Analysis (60), Banking GA (40), English (40) + Letter/Essay (25)" },
      { stage: "Interview", mode: "In-Person Panel Interview", marks: 100, papers: "Banking & Financial Awareness Interview" }
    ],
    topBooks: [
      "Fast Track Objective Arithmetic by Rajesh Verma",
      "Analytical Reasoning by M.K. Pandey",
      "Banking & Financial Awareness by Arihant Experts"
    ],
    youtubeChannels: ["Adda247 Banking", "Testbook Bank", "Guidely", "Nimisha Bansal"],
    officialWebsite: "https://ibps.in",
    notificationPdf: "https://ibps.in/crp-po-mt-xiv-notification.pdf",
    description: "Management officer cadre entrance for India's 11 major nationalized public sector banks."
  },
  {
    id: "rrb-ntpc",
    code: "RRB_NTPC",
    title: "RRB NTPC CEN 05/2024 & CEN 06/2024",
    category: "Railway",
    tagClass: "tag-govt",
    conductingBody: "Railway Recruitment Control Board",
    level: "National",
    frequency: "Annual / Periodic",
    minEducation: "12th Pass / Graduate",
    eligibleStreams: ["All Streams"],
    minAge: 18,
    maxAgeGen: 33,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: "Unlimited till 33 yrs", OBC: "Unlimited till 36 yrs", SC_ST: "Unlimited till 38 yrs" },
    salaryRange: "₹55,000 - ₹68,000 / month (Level 6)",
    payLevel: "7th CPC Pay Level 2 to Level 6 (Basic ₹35,400 for Station Master)",
    posts: ["Station Master", "Goods Train Manager", "Commercial Apprentice", "Junior Clerk Typist"],
    applicationFee: "₹500 (Gen/OBC) / ₹250 (SC/ST/Female)",
    stages: [
      { stage: "CBT-1", mode: "Online CBT", marks: 100, papers: "General Awareness (40), Mathematics (30), Reasoning (30)" },
      { stage: "CBT-2", mode: "Online CBT", marks: 120, papers: "General Awareness (50), Mathematics (35), Reasoning (35)" },
      { stage: "CBAT Aptitude Test", mode: "Computer Aptitude Test", marks: 0, papers: "Qualifying Skill Assessment for Station Master" }
    ],
    topBooks: [
      "Lucent General Knowledge (Updated)",
      "Quantitative Aptitude by R.S. Aggarwal",
      "Speedy Railway Science & Samanya Gyan"
    ],
    youtubeChannels: ["WiFiStudy", "MD Classes", "Exampur Railway", "Adda247"],
    officialWebsite: "https://indianrailways.gov.in",
    notificationPdf: "https://indianrailways.gov.in/rrb-ntpc-notification.pdf",
    description: "Recruitment for station management, train management, and administrative positions across Indian Railway zones."
  },
  {
    id: "jee-main",
    code: "JEE_MAIN",
    title: "JEE Main 2025 (Joint Entrance Examination)",
    category: "Engineering",
    tagClass: "tag-eng",
    conductingBody: "National Testing Agency (NTA)",
    level: "National",
    frequency: "Bi-Annual (Session 1 Jan & Session 2 April)",
    minEducation: "12th Pass (Physics, Chemistry, Maths)",
    eligibleStreams: ["Science (PCM)"],
    minAge: 16,
    maxAgeGen: 25,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, PWD: 0 },
    attempts: { GENERAL: "3 Consecutive Years", OBC: "3 Consecutive Years", SC_ST: "3 Consecutive Years" },
    salaryRange: "N/A (Admission to 31 NITs, 26 IIITs & JEE Advanced Qualification)",
    payLevel: "B.Tech / B.E. Degree Admission",
    posts: ["Engineering Admission to NITs, IIITs, CFTIs & JEE Advanced eligibility"],
    applicationFee: "₹1,000 (Male Gen) / ₹800 (Female/SC/ST)",
    stages: [
      { stage: "Paper-1 (B.E./B.Tech)", mode: "Online CBT", marks: 300, papers: "Physics (100), Chemistry (100), Mathematics (100) - MCQ & Numerical" }
    ],
    topBooks: [
      "Concepts of Physics (Vol 1 & 2) by H.C. Verma",
      "Organic Chemistry by O.P. Tandon",
      "Mathematics for JEE Main by Cengage"
    ],
    youtubeChannels: ["Physics Wallah - Alakh Pandey", "Unacademy JEE", "Mohit Tyagi (Competishun)", "Vedantu JEE"],
    officialWebsite: "https://jeemain.nta.ac.in",
    notificationPdf: "https://jeemain.nta.ac.in/docs/jee-main-2024-information-bulletin.pdf",
    description: "National entrance test for admission to NITs, IIITs, GFTIs and qualification for IIT entrance exam."
  },
  {
    id: "neet-ug",
    code: "NEET_UG",
    title: "NEET UG 2025 (National Eligibility cum Entrance Test)",
    category: "Medical",
    tagClass: "tag-med",
    conductingBody: "National Testing Agency (NTA)",
    level: "National",
    frequency: "Annual (May)",
    minEducation: "12th Pass (Physics, Chemistry, Biology)",
    eligibleStreams: ["Science (PCB)"],
    minAge: 17,
    maxAgeGen: 99,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, PWD: 0 },
    attempts: { GENERAL: "No Limit", OBC: "No Limit", SC_ST: "No Limit" },
    salaryRange: "N/A (Admission to MBBS, BDS, BAMS, BHMS)",
    payLevel: "MBBS Degree Admission",
    posts: ["Admission to AIIMS New Delhi, JIPMER, State Government Medical Colleges"],
    applicationFee: "₹1,700 (Gen) / ₹1,600 (OBC-NCL) / ₹1,000 (SC/ST)",
    stages: [
      { stage: "Pen & Paper Test", mode: "Offline (OMR)", marks: 720, papers: "Biology (360), Physics (180), Chemistry (180) - 200 Questions" }
    ],
    topBooks: [
      "NCERT Biology Class 11 & 12 (Mandatory 100% Coverage)",
      "Objective Physics by D.C. Pandey",
      "Modern's ABC of Chemistry"
    ],
    youtubeChannels: ["Physics Wallah NEET", "Unacademy NEET", "Aakash BYJU'S NEET", "Dr. Anand Mani"],
    officialWebsite: "https://neet.nta.online",
    notificationPdf: "https://neet.nta.online/docs/NEET_UG_Information_Bulletin.pdf",
    description: "Single window national medical entrance test for admission to undergraduate MBBS/BDS programs across all medical colleges."
  },
  {
    id: "nda-exam",
    code: "NDA_NA",
    title: "NDA & NA I & II 2025 (National Defence Academy)",
    category: "Defence",
    tagClass: "tag-def",
    conductingBody: "Union Public Service Commission",
    level: "National",
    frequency: "Bi-Annual (NDA I in April & NDA II in Sept)",
    minEducation: "12th Pass (PCM for Air Force/Navy)",
    eligibleStreams: ["Science (PCM) for Navy/Air Force; Any stream for Army"],
    minAge: 16,
    maxAgeGen: 19,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, PWD: 0 },
    attempts: { GENERAL: "Age-bound", OBC: "Age-bound", SC_ST: "Age-bound" },
    salaryRange: "₹56,100 + MSP ₹15,500 = ₹71,600 / month (Stipend during 4-yr training)",
    payLevel: "Lieutenant Rank (Pay Level 10)",
    posts: ["Commissioned Officer in Indian Army, Indian Navy, Indian Air Force"],
    applicationFee: "₹100 (SC/ST/Female Exempted)",
    stages: [
      { stage: "Written Exam", mode: "Offline OMR", marks: 900, papers: "Mathematics (300 marks) + General Ability Test GAT (600 marks)" },
      { stage: "SSB Interview", mode: "5-Day Officer Intelligence & Personality Test", marks: 900, papers: "Psychological Tests, Group Tasks, Personal Interview" }
    ],
    topBooks: [
      "Pathfinder for NDA & NA Entrance Examination by Arihant",
      "SSB Interview: The Complete Guide by Dr. N.K. Natarajan"
    ],
    youtubeChannels: ["Centurion Defence Academy", "Major Kalshi Classes", "Defence Wallah", "CDS Journey"],
    officialWebsite: "https://upsc.gov.in",
    notificationPdf: "https://upsc.gov.in/sites/default/files/Notif-NDA-NA-I-2024.pdf",
    description: "Joint services academy entrance for young aspirants to join Indian Armed Forces as officers directly after 12th."
  },
  {
    id: "ssc-chsl",
    code: "SSC_CHSL",
    title: "SSC Combined Higher Secondary Level (CHSL)",
    category: "SSC",
    tagClass: "tag-govt",
    conductingBody: "Staff Selection Commission",
    level: "National",
    frequency: "Annual",
    minEducation: "12th Pass",
    eligibleStreams: ["All Streams"],
    minAge: 18,
    maxAgeGen: 27,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: "Unlimited till age limit", OBC: "Unlimited till age limit", SC_ST: "Unlimited till age limit" },
    salaryRange: "₹19,900 - ₹81,100 / month",
    payLevel: "Level 2 to Level 4",
    posts: ["LDC", "JSA", "DEO"],
    applicationFee: "₹100",
    stages: [{ stage: "Tier-1", mode: "CBT", marks: 200, papers: "Objective" }],
    officialWebsite: "https://ssc.gov.in",
    description: "Recruitment for 12th pass students in various ministries."
  },
  {
    id: "ssc-mts",
    code: "SSC_MTS",
    title: "SSC Multi Tasking Staff (MTS)",
    category: "SSC",
    tagClass: "tag-govt",
    conductingBody: "Staff Selection Commission",
    level: "National",
    frequency: "Annual",
    minEducation: "10th Pass",
    eligibleStreams: ["All Streams"],
    minAge: 18,
    maxAgeGen: 25,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: "Unlimited till age limit", OBC: "Unlimited till age limit", SC_ST: "Unlimited till age limit" },
    salaryRange: "₹18,000 - ₹56,900 / month",
    payLevel: "Level 1",
    posts: ["MTS", "Havaldar"],
    applicationFee: "₹100",
    stages: [{ stage: "CBT", mode: "Online CBT", marks: 150, papers: "Objective" }],
    officialWebsite: "https://ssc.gov.in",
    description: "Recruitment for 10th pass students."
  },
  {
    id: "rrb-group-d",
    code: "RRB_GROUP_D",
    title: "RRB Group D (Level 1)",
    category: "Railway",
    tagClass: "tag-govt",
    conductingBody: "RRB",
    level: "National",
    frequency: "Periodic",
    minEducation: "10th Pass",
    eligibleStreams: ["All Streams", "ITI"],
    minAge: 18,
    maxAgeGen: 33,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: "Unlimited till age limit", OBC: "Unlimited till age limit", SC_ST: "Unlimited till age limit" },
    salaryRange: "₹18,000 / month",
    payLevel: "Level 1",
    posts: ["Track Maintainer", "Helper", "Assistant"],
    applicationFee: "₹500",
    stages: [{ stage: "CBT", mode: "Online CBT", marks: 100, papers: "Objective" }],
    officialWebsite: "https://indianrailways.gov.in",
    description: "Level 1 posts in various departments of Indian Railways."
  },
  {
    id: "rrb-alp",
    code: "RRB_ALP",
    title: "RRB Assistant Loco Pilot & Technician",
    category: "Railway",
    tagClass: "tag-govt",
    conductingBody: "RRB",
    level: "National",
    frequency: "Periodic",
    minEducation: "ITI / Diploma",
    eligibleStreams: ["Fitter", "Electrician", "Mechanical", "Electrical", "Automobile", "Electronics"],
    minAge: 18,
    maxAgeGen: 30,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: "Unlimited till age limit", OBC: "Unlimited till age limit", SC_ST: "Unlimited till age limit" },
    salaryRange: "₹19,900 / month",
    payLevel: "Level 2",
    posts: ["Assistant Loco Pilot", "Technician"],
    applicationFee: "₹500",
    stages: [{ stage: "CBT", mode: "Online CBT", marks: 75, papers: "Objective" }],
    officialWebsite: "https://indianrailways.gov.in",
    description: "Recruitment for Assistant Loco Pilot and Technicians."
  },
  {
    id: "ssc-je",
    code: "SSC_JE",
    title: "SSC Junior Engineer (JE)",
    category: "SSC",
    tagClass: "tag-eng",
    conductingBody: "Staff Selection Commission",
    level: "National",
    frequency: "Annual",
    minEducation: "Diploma",
    eligibleStreams: ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering"],
    minAge: 18,
    maxAgeGen: 30,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: "Unlimited till age limit", OBC: "Unlimited till age limit", SC_ST: "Unlimited till age limit" },
    salaryRange: "₹35,400 - ₹1,12,400 / month",
    payLevel: "Level 6",
    posts: ["Junior Engineer"],
    applicationFee: "₹100",
    stages: [{ stage: "Paper-1", mode: "CBT", marks: 200, papers: "Objective" }],
    officialWebsite: "https://ssc.gov.in",
    description: "Recruitment for Junior Engineers in Civil, Electrical, Mechanical."
  },
  {
    id: "gate-cs",
    code: "GATE_CS",
    title: "GATE Computer Science & IT",
    category: "Engineering",
    tagClass: "tag-eng",
    conductingBody: "IIT / IISc",
    level: "National",
    frequency: "Annual",
    minEducation: "Graduate",
    eligibleStreams: ["Computer Science", "Information Technology", "Computer Engineering"],
    minAge: 18,
    maxAgeGen: 99,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, PWD: 0 },
    attempts: { GENERAL: "No Limit", OBC: "No Limit", SC_ST: "No Limit" },
    salaryRange: "N/A",
    payLevel: "M.Tech / PSU",
    posts: ["M.Tech Admission", "PSU Recruitment"],
    applicationFee: "₹1800",
    stages: [{ stage: "CBT", mode: "Online CBT", marks: 100, papers: "Technical" }],
    officialWebsite: "https://gate.iitk.ac.in",
    description: "Entrance for PG programs and PSU recruitment in CS/IT."
  },
  {
    id: "gate-me",
    code: "GATE_ME",
    title: "GATE Mechanical Engineering",
    category: "Engineering",
    tagClass: "tag-eng",
    conductingBody: "IIT / IISc",
    level: "National",
    frequency: "Annual",
    minEducation: "Graduate",
    eligibleStreams: ["Mechanical Engineering", "Production Engineering"],
    minAge: 18,
    maxAgeGen: 99,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, PWD: 0 },
    attempts: { GENERAL: "No Limit", OBC: "No Limit", SC_ST: "No Limit" },
    salaryRange: "N/A",
    payLevel: "M.Tech / PSU",
    posts: ["M.Tech Admission", "PSU Recruitment"],
    applicationFee: "₹1800",
    stages: [{ stage: "CBT", mode: "Online CBT", marks: 100, papers: "Technical" }],
    officialWebsite: "https://gate.iitk.ac.in",
    description: "Entrance for PG programs and PSU recruitment in Mechanical."
  },
  {
    id: "gate-ce",
    code: "GATE_CE",
    title: "GATE Civil Engineering",
    category: "Engineering",
    tagClass: "tag-eng",
    conductingBody: "IIT / IISc",
    level: "National",
    frequency: "Annual",
    minEducation: "Graduate",
    eligibleStreams: ["Civil Engineering"],
    minAge: 18,
    maxAgeGen: 99,
    ageRelaxation: { OBC: 0, SC: 0, ST: 0, PWD: 0 },
    attempts: { GENERAL: "No Limit", OBC: "No Limit", SC_ST: "No Limit" },
    salaryRange: "N/A",
    payLevel: "M.Tech / PSU",
    posts: ["M.Tech Admission", "PSU Recruitment"],
    applicationFee: "₹1800",
    stages: [{ stage: "CBT", mode: "Online CBT", marks: 100, papers: "Technical" }],
    officialWebsite: "https://gate.iitk.ac.in",
    description: "Entrance for PG programs and PSU recruitment in Civil."
  },
  {
    id: "isro-cs",
    code: "ISRO_SC_CS",
    title: "ISRO Scientist/Engineer (Computer Science)",
    category: "Engineering",
    tagClass: "tag-eng",
    conductingBody: "ISRO",
    level: "National",
    frequency: "Periodic",
    minEducation: "Graduate",
    eligibleStreams: ["Computer Science", "Information Technology", "Computer Engineering"],
    minAge: 18,
    maxAgeGen: 28,
    ageRelaxation: { OBC: 3, SC: 5, ST: 5, PWD: 10 },
    attempts: { GENERAL: "Unlimited till age limit", OBC: "Unlimited till age limit", SC_ST: "Unlimited till age limit" },
    salaryRange: "₹56,100 / month",
    payLevel: "Level 10",
    posts: ["Scientist/Engineer 'SC'"],
    applicationFee: "₹250",
    stages: [{ stage: "Written", mode: "Offline", marks: 240, papers: "Technical" }],
    officialWebsite: "https://isro.gov.in",
    description: "Recruitment for Scientists in Computer Science."
  }
];

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
