export const MAJOR_EXAMS = [
  {
    id: "jee",
    name: "Joint Entrance Examination (JEE) Main & Advanced",
    conductingBody: "NTA (Main) & IITs (Advanced)",
    eligibility: "Class 12 with Physics, Chemistry, Mathematics (PCM)",
    minQualification: "12th Pass",
    ageLimit: "No specific age limit for Main, max 2 consecutive attempts for Advanced.",
    requiredSubjects: "PCM",
    pattern: "MCQs, Numerical Value Questions. Online Computer Based Test.",
    difficulty: "Very High",
    leadsTo: "B.Tech, B.E., B.Arch, Integrated M.Tech",
    topColleges: "IITs, NITs, IIITs, GFTIs",
    level: "National",
    careerOpportunities: "Software Engineer, Core Engineer, Data Scientist, Researcher"
  },
  {
    id: "neet",
    name: "National Eligibility cum Entrance Test (NEET)",
    conductingBody: "NTA",
    eligibility: "Class 12 with Physics, Chemistry, Biology (PCB)",
    minQualification: "12th Pass",
    ageLimit: "Minimum 17 years. No upper age limit.",
    requiredSubjects: "PCB",
    pattern: "Offline Pen-Paper Test. MCQs on Physics, Chemistry, Botany, Zoology.",
    difficulty: "High",
    leadsTo: "MBBS, BDS, BAMS, BHMS, BUMS",
    topColleges: "AIIMS, JIPMER, AFMC, State Medical Colleges",
    level: "National",
    careerOpportunities: "Doctor, Surgeon, Medical Officer, Clinical Researcher"
  },
  {
    id: "upsc",
    name: "UPSC Civil Services Examination (CSE)",
    conductingBody: "UPSC",
    eligibility: "Graduation in any discipline",
    minQualification: "Bachelor's Degree",
    ageLimit: "21 to 32 years (General). Relaxations apply.",
    requiredSubjects: "Any stream",
    pattern: "Prelims (Objective) -> Mains (Subjective) -> Interview",
    difficulty: "Extremely High",
    leadsTo: "IAS, IPS, IFS, IRS, Group A Services",
    topColleges: "LBSNAA (Training Academy)",
    level: "National",
    careerOpportunities: "District Magistrate, Police Commissioner, Diplomat"
  },
  {
    id: "gate",
    name: "Graduate Aptitude Test in Engineering (GATE)",
    conductingBody: "IITs & IISc",
    eligibility: "Final year or completed B.Tech/B.E/B.Sc Research",
    minQualification: "Graduation (Engineering/Science)",
    ageLimit: "No upper age limit",
    requiredSubjects: "Respective Engineering/Science Branch",
    pattern: "Online CBT. MCQs, MSQs, NATs.",
    difficulty: "High",
    leadsTo: "M.Tech, Ph.D, PSU Jobs",
    topColleges: "IITs, IISc, NITs, Top PSUs (IOCL, ONGC)",
    level: "National",
    careerOpportunities: "Research Scientist, PSU Executive, Professor"
  },
  {
    id: "cat",
    name: "Common Admission Test (CAT)",
    conductingBody: "IIMs",
    eligibility: "Graduation with minimum 50% marks",
    minQualification: "Bachelor's Degree",
    ageLimit: "No age limit",
    requiredSubjects: "Any stream",
    pattern: "Quantitative Ability, Verbal Ability, Data Interpretation & Logical Reasoning",
    difficulty: "High",
    leadsTo: "MBA, PGDM",
    topColleges: "IIMs, FMS, SPJIMR, MDI",
    level: "National",
    careerOpportunities: "Management Consultant, Investment Banker, Marketing Head, CEO"
  },
  {
    id: "cuet",
    name: "Common University Entrance Test (CUET)",
    conductingBody: "NTA",
    eligibility: "Class 12 in relevant subjects",
    minQualification: "12th Pass",
    ageLimit: "No age limit",
    requiredSubjects: "Varies by course applied",
    pattern: "Online CBT. Language, Domain Subjects, General Test.",
    difficulty: "Moderate",
    leadsTo: "B.A, B.Sc, B.Com, Integrated Programs",
    topColleges: "Delhi University, BHU, JNU, AMU, Central Universities",
    level: "National",
    careerOpportunities: "Academic, Civil Services, Corporate Sector, Media"
  },
  {
    id: "nda",
    name: "National Defence Academy (NDA) Exam",
    conductingBody: "UPSC",
    eligibility: "Class 12 (PCM required for Air Force/Navy)",
    minQualification: "12th Pass",
    ageLimit: "16.5 to 19.5 years",
    requiredSubjects: "PCM (for Navy/Air Force), Any (for Army)",
    pattern: "Maths + General Ability Test (Written) -> SSB Interview",
    difficulty: "High",
    leadsTo: "Training for Indian Army, Navy, Air Force",
    topColleges: "NDA Pune",
    level: "National",
    careerOpportunities: "Commissioned Officer in Armed Forces"
  }
];

export const STREAMS = {
  science: [
    {
      combo: "Physics, Chemistry, Mathematics (PCM)",
      description: "Primarily for Engineering, Architecture, and Pure Sciences.",
      exams: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "MHT CET", "NDA"],
      courses: ["B.Tech", "B.E.", "B.Arch", "B.Sc (Physics/Maths/Chem)", "BCA"],
      colleges: ["IITs", "NITs", "BITS Pilani", "State Engineering Colleges"],
      careerOptions: ["Software Engineer", "Mechanical Engineer", "Data Scientist", "Architect", "Commercial Pilot"]
    },
    {
      combo: "Physics, Chemistry, Biology (PCB)",
      description: "Primarily for Medical, Dental, and Allied Health Sciences.",
      exams: ["NEET UG", "AIIMS Nursing", "ICAR AIEEA"],
      courses: ["MBBS", "BDS", "B.Sc Nursing", "B.Pharm", "Biotechnology"],
      colleges: ["AIIMS", "JIPMER", "AFMC", "Government Medical Colleges"],
      careerOptions: ["Doctor", "Surgeon", "Dentist", "Pharmacist", "Clinical Researcher"]
    },
    {
      combo: "Physics, Chemistry, Maths, Biology (PCMB)",
      description: "Keeps both Medical and Engineering options open.",
      exams: ["JEE Main", "NEET UG", "CUET"],
      courses: ["B.Tech (Biotech)", "MBBS", "B.Sc Agriculture"],
      colleges: ["Top Engineering and Medical Colleges"],
      careerOptions: ["Biomedical Engineer", "Geneticist", "Bioinformatics Specialist"]
    }
  ],
  commerce: [
    {
      combo: "Commerce with Maths",
      description: "Ideal for Finance, Accounting, and Business Management.",
      exams: ["CA Foundation", "CUET", "IPMAT"],
      courses: ["B.Com (Hons)", "BBA", "B.Sc Economics", "Chartered Accountancy (CA)"],
      colleges: ["SRCC", "Christ University", "IIM Indore (IPM)"],
      careerOptions: ["Chartered Accountant", "Investment Banker", "Financial Analyst", "Actuary"]
    },
    {
      combo: "Commerce without Maths",
      description: "Focuses on Management, Law, and general Commerce.",
      exams: ["CLAT", "CUET", "Company Secretary (CS) CSEET"],
      courses: ["B.Com", "BBA", "BA LLB", "CS"],
      colleges: ["NLUs", "Delhi University", "Symbiosis"],
      careerOptions: ["Corporate Lawyer", "Company Secretary", "HR Manager", "Marketing Executive"]
    }
  ],
  arts: [
    {
      combo: "Arts/Humanities",
      description: "Broad spectrum covering Social Sciences, Languages, and Fine Arts.",
      exams: ["CUET", "CLAT", "NIFT Entrance", "NID DAT"],
      courses: ["BA (History/Pol Science/Psychology)", "BA LLB", "B.Des", "Journalism (BMM)"],
      colleges: ["JNU", "Delhi University", "NID", "NIFT"],
      careerOptions: ["Civil Servant", "Psychologist", "Journalist", "Fashion Designer", "Lawyer", "Author"]
    }
  ]
};

export const ENGINEERING_BRANCHES = [
  {
    name: "Computer Science Engineering (CSE)",
    focus: "Software development, algorithms, data structures, OS, databases.",
    difficulty: "High (High competition)",
    skills: "Programming, Logic, Problem Solving",
    career: "Software Developer, Systems Engineer, Cloud Architect",
    salaryRange: "₹6 Lakhs - ₹40+ Lakhs P.A.",
    futureScope: "Excellent. High demand in all sectors."
  },
  {
    name: "Artificial Intelligence & Machine Learning (AI/ML)",
    focus: "Neural networks, deep learning, NLP, data models.",
    difficulty: "Very High",
    skills: "Advanced Maths, Python/R, Statistical Analysis",
    career: "AI Engineer, ML Scientist, Data Scientist",
    salaryRange: "₹8 Lakhs - ₹50+ Lakhs P.A.",
    futureScope: "Exponential growth. Shaping the future of tech."
  },
  {
    name: "Electronics & Communication (ECE)",
    focus: "Circuits, microprocessors, signal processing, telecommunications.",
    difficulty: "High",
    skills: "Circuit Design, Math, Programming (Embedded C)",
    career: "Embedded Systems Engineer, Network Engineer, VLSI Designer",
    salaryRange: "₹4 Lakhs - ₹25 Lakhs P.A.",
    futureScope: "Strong. Critical for IoT, 5G, and semiconductor industry."
  },
  {
    name: "Mechanical Engineering",
    focus: "Thermodynamics, kinematics, fluid mechanics, manufacturing.",
    difficulty: "High",
    skills: "Physics, CAD, Mechanics",
    career: "Mechanical Design Engineer, Automotive Engineer, Production Manager",
    salaryRange: "₹3.5 Lakhs - ₹15 Lakhs P.A.",
    futureScope: "Stable. Essential in manufacturing, auto, and aerospace."
  },
  {
    name: "Civil Engineering",
    focus: "Structural design, construction materials, environmental engineering.",
    difficulty: "Moderate to High",
    skills: "Project Management, Structural Analysis, AutoCAD",
    career: "Structural Engineer, Construction Manager, Urban Planner",
    salaryRange: "₹3 Lakhs - ₹12 Lakhs P.A.",
    futureScope: "Evergreen. Driven by infrastructure development."
  },
  {
    name: "Aerospace Engineering",
    focus: "Aerodynamics, propulsion, avionics, spacecraft design.",
    difficulty: "Very High",
    skills: "Fluid Dynamics, Advanced Physics, Precision",
    career: "Aerospace Designer, Avionics Engineer, ISRO/DRDO Scientist",
    salaryRange: "₹6 Lakhs - ₹20 Lakhs P.A.",
    futureScope: "Growing rapidly with private space sectors."
  }
];

export const ALTERNATIVE_PATHS = [
  {
    category: "Short-Term & Skill-Based",
    options: [
      { name: "Polytechnic / Diploma", description: "3-year practical engineering course after 10th or 12th. Leads to junior engineer roles." },
      { name: "ITI", description: "Industrial Training Institute courses for technical trades (Electrician, Fitter)." },
      { name: "Digital Marketing Certification", description: "Learn SEO, SEM, Social Media. High demand in modern businesses." }
    ]
  },
  {
    category: "Non-Engineering Tech",
    options: [
      { name: "BCA", description: "Bachelor of Computer Applications. Great alternative to B.Tech CSE." },
      { name: "B.Sc Data Science", description: "Focuses heavily on statistics and data analytics without core engineering subjects." }
    ]
  },
  {
    category: "Creative & Design",
    options: [
      { name: "B.Des", description: "Bachelor of Design (Fashion, Product, UI/UX). Exams: UCEED, NID DAT." },
      { name: "Animation & VFX", description: "Specialized degree/diploma for media and entertainment." }
    ]
  }
];
