# -*- coding: utf-8 -*-
"""
UdanPath System Analysis & Design - Complete Diagram Generator
Generates:
1. docs/system_diagrams.md
2. public/system-design/index.html
3. docs/view_diagrams.html
"""

import os
import json
import re

def get_diagrams_data():
    diagrams = [
        # =====================================================================
        # SECTION 1: UML DIAGRAMS (13 DIAGRAMS)
        # =====================================================================
        {
            "id": "uml-use-case",
            "number": 1,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "1. UML Use Case Diagram",
            "purpose": "Defines the complete functional requirements and system boundaries of the UdanPath platform from the perspective of its three primary human actors (Student, Administrator, Exam Coordinator) and external automated systems (Google Gemini AI, Official Exam Scrapers).",
            "actors": "• Student (Aspirant): Registers, builds profile, explores exams, verifies eligibility, checks recommendations, tracks roadmap milestones, consults Gemini AI, and uploads syllabus PDFs.\n• Administrator: Manages user accounts, configures eligibility rules, audits scraped changes, reviews discrepancy queue, monitors API logs.\n• Exam Coordinator: Curates syllabus hierarchy, papers, topics, coaching links, and past year questions (PYQs).\n• Google Gemini AI: Powers AI Advisor chat, document RAG analysis, and personalized study recommendations.\n• Official Exam Portals: Target endpoints (UPSC, SSC, NTA, IITs) scraped for date and notice changes.",
            "flow": "Students interact through authenticated sessions. Core use cases include include/extend dependencies: 'Discover Exams' includes 'Search & Filter', 'View Exam Details' includes 'Check Eligibility', 'Upload PDF' includes 'Gemini RAG Analysis', and 'Verify Live Dates' includes 'Approve/Reject Queue'.",
            "mermaid": """graph LR
  subgraph UdanPath System Boundary
    %% Student Use Cases
    UC1([Register / Login via Supabase Auth])
    UC2([Complete Academic & Category Profile])
    UC3([Discover & Search Competitive Exams])
    UC4([View Exam Details & Syllabus Stages])
    UC5([Check Dynamic Eligibility Status])
    UC6([View AI Recommended Matches])
    UC7([Track Preparation Roadmap Milestones])
    UC8([Chat with Gemini AI Career Advisor])
    UC9([Upload Syllabus PDF for RAG Q&A])
    UC10([Bookmark Exams & Save Resources])
    UC11([Read Verified Aspirant Experiences])
    
    %% Coordinator Use Cases
    UC12([Manage Syllabus Papers & Topics])
    UC13([Curate PYQs & Recommended Coaching])
    
    %% Admin Use Cases
    UC14([Configure Master Eligibility Rules])
    UC15([Audit Scraped Date Discrepancies])
    UC16([Approve / Reject Verification Queue])
    UC17([Broadcast Platform Notifications])
    UC18([Monitor Gemini AI Token Usage])
  end

  %% Actors
  Student((Student / Aspirant))
  Admin((System Administrator))
  Coordinator((Exam Coordinator))
  GeminiAI((Google Gemini AI))
  Scraper((Official Portals Scraper))

  %% Relationships
  Student --> UC1
  Student --> UC2
  Student --> UC3
  Student --> UC4
  Student --> UC5
  Student --> UC6
  Student --> UC7
  Student --> UC8
  Student --> UC9
  Student --> UC10
  Student --> UC11

  Coordinator --> UC12
  Coordinator --> UC13

  Admin --> UC14
  Admin --> UC15
  Admin --> UC16
  Admin --> UC17
  Admin --> UC18

  UC8 -.->|invoke| GeminiAI
  UC9 -.->|vector context| GeminiAI
  Scraper -.->|scraped notices| UC15"""
        },
        {
            "id": "uml-class",
            "number": 2,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "2. UML Class Diagram",
            "purpose": "Models the static structural architecture of the UdanPath platform, detailing domain entities, attributes with visibility and data types, operational methods, and object-oriented relationships (inheritance, aggregation, composition, and associations).",
            "actors": "Core Domain Classes: StudentProfile, UserEducation, Exam, ExamPaper, ExamSubject, ExamTopic, ExamDate, EligibilityRule, EligibilityEngine, MatchmakingEngine, VerificationEngine, AiAdvisorService, RoadmapService.",
            "flow": "A StudentProfile holds multiple UserEducation records. An Exam is composed of multiple ExamPapers, which decompose into ExamSubjects and ExamTopics. EligibilityEngine evaluates StudentProfile against an Exam's EligibilityRules, producing an EligibilityResult consumed by MatchmakingEngine.",
            "mermaid": """classDiagram
  direction TB

  class StudentProfile {
    +UUID userId
    +String fullName
    +Date dob
    +String gender
    +String category
    +String state
    +Integer targetYear
    +List~UserEducation~ educations
    +getAge() int
    +getHighestDegree() String
    +isProfileComplete() boolean
  }

  class UserEducation {
    +UUID id
    +UUID educationLevelId
    +UUID degreeId
    +UUID branchId
    +Integer passingYear
    +Float percentageOrCgpa
    +getDiscipline() String
  }

  class Exam {
    +UUID id
    +String title
    +String slug
    +String conductingBody
    +UUID categoryId
    +String examLevel
    +List~ExamPaper~ papers
    +List~ExamEligibilityRule~ rules
    +ExamDate dates
    +getUpcomingMilestones() List
  }

  class ExamPaper {
    +UUID id
    +UUID examId
    +String name
    +String code
    +List~ExamSubject~ subjects
  }

  class ExamSubject {
    +UUID id
    +UUID paperId
    +String name
    +Float weightagePercentage
    +List~ExamTopic~ topics
  }

  class ExamTopic {
    +UUID id
    +UUID subjectId
    +String name
    +String description
  }

  class ExamDate {
    +UUID id
    +UUID examId
    +Date notificationDate
    +Date applicationStartDate
    +Date applicationEndDate
    +Date examStartDate
    +Date resultDate
    +String verificationStatus
  }

  class ExamEligibilityRule {
    +UUID id
    +UUID examId
    +String ruleType
    +String conditionKey
    +String conditionValue
    +Boolean isMandatory
    +evaluateCondition(profile) boolean
  }

  class EligibilityEngine {
    +evaluate(profile, exam) EligibilityResult
    -checkAgeRelaxation(dob, category, rules) RuleEvaluation
    -checkDegreeHierarchy(educations, rules) RuleEvaluation
    -checkDemographics(profile, rules) RuleEvaluation
  }

  class EligibilityResult {
    +String status
    +Boolean isEligible
    +Float matchPercentage
    +List~String~ criteriaMet
    +List~String~ criteriaFailed
  }

  class MatchmakingEngine {
    +calculateFitScore(profile, exam, eligibility) Float
    -computeInterestScore(preferences, category) Float
    -computeCareerGoalScore(goals, exam) Float
    -computePreferenceWeights(profile) Float
  }

  class VerificationEngine {
    +queueDiscrepancy(examId, field, proposedVal) UUID
    +approveChange(queueId, reviewerId) Boolean
    +rejectChange(queueId, reason) Boolean
  }

  %% Relationships
  StudentProfile "1" *-- "1..*" UserEducation : contains
  Exam "1" *-- "1..*" ExamPaper : composed of
  ExamPaper "1" *-- "1..*" ExamSubject : contains
  ExamSubject "1" *-- "1..*" ExamTopic : details
  Exam "1" *-- "1" ExamDate : scheduled by
  Exam "1" *-- "0..*" ExamEligibilityRule : restricted by
  
  EligibilityEngine ..> StudentProfile : inspects
  EligibilityEngine ..> Exam : evaluates
  EligibilityEngine ..> EligibilityResult : generates
  MatchmakingEngine ..> EligibilityResult : consumes
  VerificationEngine ..> ExamDate : updates"""
        },
        {
            "id": "uml-activity",
            "number": 3,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "3. UML Activity Diagram",
            "purpose": "Illustrates the operational workflow and business logic of the student journey from onboarding and dynamic eligibility determination to AI recommendation ranking, roadmap progression, and study milestone tracking.",
            "actors": "Student, Next.js Web Client, Eligibility Engine, Supabase Database, Gemini AI.",
            "flow": "Starts with user authentication -> profile inspection -> parallel fork for age relaxation and degree hierarchy evaluation -> join -> composite eligibility decision -> AI recommendation generation -> exam roadmap activation -> progress loop -> final exam readiness.",
            "mermaid": """stateDiagram-v2
  [*] --> UserAuthentication
  
  UserAuthentication --> CheckProfileCompletion
  state CheckProfileCompletion <<choice>>
  CheckProfileCompletion --> OnboardingWizard : Profile Incomplete
  CheckProfileCompletion --> LoadStudentDashboard : Profile Complete
  
  OnboardingWizard --> SaveAcademicProfile : Input 10th, 12th, Degree, Branch, Category
  SaveAcademicProfile --> LoadStudentDashboard
  
  state LoadStudentDashboard {
    [*] --> ParallelEvaluation
    
    state ParallelEvaluation {
      state fork_state <<fork>>
      [*] --> fork_state
      fork_state --> EvaluateAgeRelaxation : Check Category & DOB
      fork_state --> MatchDegreeBranch : Verify Hierarchy
      fork_state --> CheckNationalityAttempts : Validate Criteria
      
      state join_state <<join>>
      EvaluateAgeRelaxation --> join_state
      MatchDegreeBranch --> join_state
      CheckNationalityAttempts --> join_state
      join_state --> ConsolidateEligibility
    }
  }

  LoadStudentDashboard --> EligibilityDecision
  state EligibilityDecision <<choice>>
  EligibilityDecision --> FilterOutExam : Status = NOT_ELIGIBLE
  EligibilityDecision --> ComputeRecommendationScore : Status = EXACT or STRONG or RELATED
  
  ComputeRecommendationScore --> RenderPersonalizedRankings
  RenderPersonalizedRankings --> SelectTargetExam
  
  state SelectTargetExam {
    [*] --> ViewSyllabusTree
    ViewSyllabusTree --> AccessPYQsAndCourses
    AccessPYQsAndCourses --> ActivateStudyRoadmap
  }

  ActivateStudyRoadmap --> MilestoneTrackingLoop
  
  state MilestoneTrackingLoop {
    [*] --> CheckTaskDone
    CheckTaskDone --> UpdateProgressPercentage
    UpdateProgressPercentage --> AskGeminiAdvisor : Need Study Strategy?
    AskGeminiAdvisor --> ReceiveTailoredSchedule
    ReceiveTailoredSchedule --> CheckTaskDone
  }

  MilestoneTrackingLoop --> ExamReadinessTarget : 100% Milestones Complete
  ExamReadinessTarget --> [*]"""
        },
        {
            "id": "uml-sequence",
            "number": 4,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "4. UML Sequence Diagram",
            "purpose": "Traces the chronological interaction and message interchange between the Student Client, Next.js Frontend Layer, API Routing Gateway, Eligibility Engine, Matchmaking Engine, Supabase Database, and Gemini AI during a personalized exam recommendation request.",
            "actors": "Student, ClientUI (Next.js), APIRoute, EligibilityEngine, MatchmakingEngine, SupabaseDB (PostgreSQL), GeminiAI.",
            "flow": "Synchronous request to fetch exams -> Token verification -> DB queries for profile and exam master tables -> Rules evaluation loop -> Weighted score calculation -> Optional Gemini AI explanation stream -> Formatted JSON response delivered to UI.",
            "mermaid": """sequenceDiagram
  autonumber
  actor Student as Student (User)
  participant UI as Next.js Client Portal
  participant API as API Route (/api/v1/exams)
  participant EE as Eligibility Engine
  participant ME as Matchmaking Engine
  participant DB as Supabase PostgreSQL
  participant AI as Google Gemini 1.5/2.0

  Student->>UI: Navigates to 'Discover Exams'
  UI->>API: GET /api/v1/recommendations (Bearer JWT)
  
  API->>DB: Query student_profiles & user_education (user_id)
  DB-->>API: Return Profile (DOB: 2003-05-15, Degree: B.Tech CS, Cat: OBC)
  
  API->>DB: Query active exams & exam_eligibility_rules
  DB-->>API: Return Exams List with Rules (GATE, UPSC, ISRO, SSC)
  
  loop For each Exam in Master Catalog
    API->>EE: evaluateEligibility(profile, exam.rules)
    EE->>EE: Check Age Limit with OBC (+3 yr relaxation)
    EE->>EE: Match B.Tech Computer Science to Paper Rules
    EE-->>API: EligibilityResult (Status: EXACT, Score: 50/50)
    
    opt If Status != NOT_ELIGIBLE
      API->>ME: calculateFitScore(profile, exam, EligibilityResult)
      ME->>ME: Add Interest Fit (15) + Career Goal Fit (10) + Preference (10)
      ME-->>API: Composite Score = 85.0 / 100
    end
  end

  API->>API: Sort & Rank Exams by Score descending

  opt Student requests "Explain Match via AI"
    API->>AI: generateExplanation(profileSummary, topExamSummary)
    AI-->>API: Stream formatted guidance & key focus areas
  end

  API-->>UI: 200 OK (JSON with Ranked Exams & Eligibility Badges)
  UI->>Student: Renders Interactive Exam Cards & Eligibility Tag"""
        },
        {
            "id": "uml-communication",
            "number": 5,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "5. UML Communication Diagram",
            "purpose": "Emphasizes the structural organization and object collaborations of the UdanPath subsystem, displaying object link architecture with sequenced numeric messages for the real-time exam query workflow.",
            "actors": "studentUI: ClientView, queryCtrl: ExamController, profService: ProfileService, ruleEngine: EligibilityEngine, examRepo: ExamRepository, auditLog: AuditLogger.",
            "flow": "Objects collaborate via explicit links. Numbers indicate sequence: 1: submitQuery(), 1.1: validateSession(), 2: fetchProfile(), 3: loadExamCatalog(), 4: evaluateRules(), 4.1: checkAge(), 4.2: matchDegrees(), 5: logQueryAudit(), 6: renderResults().",
            "mermaid": """graph TD
  studentUI["1: studentUI : ClientView"]
  queryCtrl["2: queryCtrl : ExamController"]
  profService["3: profService : ProfileService"]
  examRepo["4: examRepo : ExamRepository"]
  ruleEngine["5: ruleEngine : EligibilityEngine"]
  auditLog["6: auditLog : AuditLogger"]

  studentUI -- "1: submitSearchQuery(filterCriteria)" --> queryCtrl
  queryCtrl -- "1.1: validateAuthSession(token)" --> queryCtrl
  
  queryCtrl -- "2: getStudentProfile(userId)" --> profService
  profService -- "2.1: returnProfileDetails()" --> queryCtrl
  
  queryCtrl -- "3: queryMatchingExams(filters)" --> examRepo
  examRepo -- "3.1: returnExamRecords()" --> queryCtrl
  
  queryCtrl -- "4: evaluateEligibility(profile, examList)" --> ruleEngine
  ruleEngine -- "4.1: applyAgeRelaxation(dob, category)" --> ruleEngine
  ruleEngine -- "4.2: verifyDegreeHierarchy(degree, branch)" --> ruleEngine
  ruleEngine -- "4.3: returnConsolidatedResults()" --> queryCtrl
  
  queryCtrl -- "5: recordSearchTelemetry(userId, queryStats)" --> auditLog
  queryCtrl -- "6: deliverRankedExamsPayload()" --> studentUI"""
        },
        {
            "id": "uml-state-machine",
            "number": 6,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "6. UML State Machine Diagram",
            "purpose": "Specifies the complete lifecycle states, events, guards, and transition logic for Exam Date Records and Scraped Official Notices as they transition from raw web ingestion to verified student publication.",
            "actors": "Crawler Daemon, HTML Parser, Normalization Worker, Change Detector, System Admin, Notification Engine.",
            "flow": "Starts at UNINDEXED -> SCRAPED_COLLECTED -> PARSED_NORMALIZED -> EVALUATING_DIFF -> (If diff: PENDING_REVIEW in Verification Queue -> ADMIN_APPROVED -> PUBLISHED_ACTIVE; If no diff: REVERIFIED_UNCHANGED). Includes active exam calendar cycle states.",
            "mermaid": """stateDiagram-v2
  [*] --> UNINDEXED_SOURCE
  
  UNINDEXED_SOURCE --> SCRAPED_COLLECTED : Scheduler Triggers Fetch
  SCRAPED_COLLECTED --> PARSED_NORMALIZED : HTML Parse & Date Extraction
  
  state PARSED_NORMALIZED {
    [*] --> ValidateISOFormat
    ValidateISOFormat --> ValidateLogicalDateSequence : Dates Valid
    ValidateLogicalDateSequence --> [*] : Notification <= Application <= Exam
  }

  PARSED_NORMALIZED --> EVALUATING_DIFF : Compare with Stored exam_dates
  
  state EVALUATING_DIFF <<choice>>
  EVALUATING_DIFF --> REVERIFIED_UNCHANGED : [No Discrepancy Found]
  EVALUATING_DIFF --> DISCREPANCY_FLAGGED : [Date / Notice Diff Detected]
  
  REVERIFIED_UNCHANGED --> [*] : Update last_verified_at timestamp
  
  DISCREPANCY_FLAGGED --> PENDING_ADMIN_VERIFICATION : Insert into data_verification_queue
  
  state PENDING_ADMIN_VERIFICATION {
    [*] --> DisplayInQueue
    DisplayInQueue --> AdminReviewAction
  }

  state AdminReviewAction <<choice>>
  AdminReviewAction --> APPROVED_PUBLISHED : Admin Clicks 'Approve'
  AdminReviewAction --> REJECTED_DISCARDED : Admin Clicks 'Reject' [False Positive]
  
  REJECTED_DISCARDED --> ARCHIVED_LOG : Log in data_change_logs
  ARCHIVED_LOG --> [*]
  
  APPROVED_PUBLISHED --> UPDATE_EXAM_DATES : Commit to public.exam_dates
  UPDATE_EXAM_DATES --> DISPATCH_NOTIFICATION : Broadcast alerts to saved users
  
  state ACTIVE_EXAM_TIMELINE {
    [*] --> NOTIFICATION_LIVE
    NOTIFICATION_LIVE --> REGISTRATION_OPEN : Application Start Date
    REGISTRATION_OPEN --> CORRECTION_WINDOW : Form Edit Period
    CORRECTION_WINDOW --> ADMIT_CARD_RELEASED : Admit Card Date
    ADMIT_CARD_RELEASED --> EXAM_CONDUCTED : Exam Start Date
    EXAM_CONDUCTED --> RESULTS_DECLARED : Result Date
    RESULTS_DECLARED --> CYCLE_ARCHIVED : New Cycle Begins
  }

  DISPATCH_NOTIFICATION --> ACTIVE_EXAM_TIMELINE
  CYCLE_ARCHIVED --> [*]"""
        },
        {
            "id": "uml-component",
            "number": 7,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "7. UML Component Diagram",
            "purpose": "Visualizes the structural modularity, software components, ports, and provided/required interfaces across the frontend client, backend application gateway, persistence layer, and external AI services.",
            "actors": "Next.js Frontend, FastAPI Gateway, Supabase Cloud Platform, Google Gemini AI Engine, Official Govt Portals.",
            "flow": "Frontend components interact with Backend microservices via REST/WebSocket interfaces. Supabase provides Auth (GoTrue), Postgres (DB), and Storage. Backend invokes Gemini Pro API and drives scraper workers targeting official portals.",
            "mermaid": """graph TD
  subgraph Frontend_Client["Frontend Layer (Next.js 16 / React 19)"]
    UI_Pages["Page Views & Portal Dashboard"]
    Comp_Elig["Eligibility Client Component"]
    Comp_Roadmap["Roadmap & Milestone Tracker"]
    Comp_Chat["AI Advisor Interactive Widget"]
    Supa_Client["Supabase Browser Client"]
  end

  subgraph Backend_Gateway["Backend Application Gateway (FastAPI / Node SSR)"]
    API_Router["API Router (/api/v1)"]
    Auth_Guard["JWT Auth & Role Guard"]
    Engine_Elig["Eligibility Evaluation Engine"]
    Engine_Match["Matchmaking & Scoring Engine"]
    Engine_Verify["Verification Queue Service"]
    Worker_Scraper["Scraper Daemon & Adapters"]
  end

  subgraph Supabase_Platform["Persistence Platform (Supabase Managed Cloud)"]
    Port_Auth["GoTrue Auth Service"]
    Port_DB["PostgreSQL 15 Relational DB"]
    Port_Storage["S3 Storage Buckets (PDFs)"]
  end

  subgraph External_AI["AI Intelligence Platform"]
    Gemini_API["Google Gemini 1.5/2.0 API"]
  end

  subgraph Target_Sources["Official Examination Portals"]
    Web_NIC["NIC Portals (UPSC, SSC, NTA)"]
  end

  %% Connections
  UI_Pages -->|HTTP / JSON| API_Router
  Comp_Elig --> Engine_Elig
  Comp_Roadmap --> Port_DB
  Comp_Chat -->|Streaming SSE| API_Router
  Supa_Client -->|Session checks| Port_Auth

  API_Router --> Auth_Guard
  Auth_Guard --> Port_Auth
  API_Router --> Engine_Elig
  API_Router --> Engine_Match
  API_Router --> Engine_Verify
  
  Engine_Elig -->|Read Rules & Profiles| Port_DB
  Engine_Match -->|Read Master Catalog| Port_DB
  Engine_Verify -->|Read / Write Queue| Port_DB
  
  API_Router -->|Prompt & Context| Gemini_API
  
  Worker_Scraper -->|Scrape Notices| Web_NIC
  Worker_Scraper -->|Queue Discrepancies| Engine_Verify
  Worker_Scraper -->|Upload PDFs| Port_Storage"""
        },
        {
            "id": "uml-deployment",
            "number": 8,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "8. UML Deployment Diagram",
            "purpose": "Maps software artifacts to physical execution environments, hardware nodes, networking boundaries, communication protocols, and cloud hosting infrastructure.",
            "actors": "Client Devices, Vercel Edge Network, Render Cloud Containers, Supabase Cloud Platform (AWS), Google Cloud Platform, NIC Servers.",
            "flow": "Users connect via HTTPS TLS 1.3 to Vercel CDN. Next.js handles SSR and static assets. API requests proxy to Render Container running FastAPI. Database queries communicate with Supabase AWS ap-southeast-1. Gemini AI runs on GCP.",
            "mermaid": """graph TD
  subgraph Client_Device["Client Tier (User Devices)"]
    Browser["Modern Web Browser (Chrome, Safari, Firefox)<br/>Desktop & Mobile Viewport"]
  end

  subgraph Vercel_Platform["Vercel Cloud Platform (Edge & SSR)"]
    Edge_CDN["Global Anycast Edge CDN<br/>DDoS Mitigation & Caching"]
    Next_Server["Node.js 20 Serverless Runtime<br/>Next.js 16 SSR & App Router"]
  end

  subgraph Render_Platform["Container Cloud (Render / Cloud Run)"]
    Docker_Node["Docker Linux Container (Debian 12)<br/>FastAPI Gateway + Uvicorn<br/>Python 3.10 Runtime"]
    Worker_Node["Background Cron Worker<br/>Scraper Worker Daemon"]
  end

  subgraph Supabase_AWS["Supabase Managed Cloud (AWS ap-southeast-1)"]
    PG_DB["PostgreSQL 15 Cluster<br/>Row-Level Security & pgvector"]
    GoTrue_Auth["GoTrue Auth Microservice<br/>JWT & OAuth 2.0 Handler"]
    S3_Storage["MinIO / AWS S3 Compatible Storage<br/>Syllabus & PYQ Buckets"]
  end

  subgraph Google_Cloud["Google Cloud Platform (AI Infrastructure)"]
    Gemini_Endpoint["Google Gemini 1.5/2.0 Flash/Pro<br/>gRPC / HTTPS REST API"]
  end

  subgraph Govt_Servers["Official Govt Infrastructure"]
    NIC_Host["National Informatics Centre (NIC)<br/>Official UPSC / SSC / NTA Portals"]
  end

  %% Links with Protocols
  Browser -->|HTTPS / TLS 1.3 : Port 443| Edge_CDN
  Edge_CDN --> Next_Server
  Browser -->|Direct REST / JWT : Port 443| Docker_Node
  Browser -->|Direct Auth Session : Port 443| GoTrue_Auth

  Next_Server -->|Internal API Proxy| Docker_Node
  Docker_Node -->|TCP / SSL : Port 5432 / 6543 (PgBouncer)| PG_DB
  Docker_Node -->|REST API : Port 443| S3_Storage
  Docker_Node -->|REST HTTPS : Port 443| Gemini_Endpoint

  Worker_Node -->|HTTP GET Scrape : Port 443| NIC_Host
  Worker_Node -->|PostgreSQL DB Writes| PG_DB"""
        },
        {
            "id": "uml-object",
            "number": 9,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "9. UML Object Diagram",
            "purpose": "Exhibits a concrete runtime snapshot of specific instantiated objects, showing exact attribute values, data slots, and object relationship links for an active engineering aspirant.",
            "actors": "user_ashish, profile_ashish, edu_btech, exam_gate2026, paper_cs, rule_age, rule_degree, eval_gate, rec_score.",
            "flow": "Runtime instance graph showing user 'Ashish Goswami' with B.Tech in Computer Science evaluating eligibility for GATE 2026, satisfying age criteria and degree requirements to achieve an EXACT eligibility match and score of 96.5.",
            "mermaid": """graph TD
  user["<u>user_ashish : User</u><br/>id = 'usr-8401'<br/>email = 'ashish@example.com'<br/>role = 'student'"]
  
  profile["<u>profile_ashish : StudentProfile</u><br/>fullName = 'Ashish Goswami'<br/>dob = '2003-05-15' (Age: 23)<br/>gender = 'Male'<br/>category = 'OBC'<br/>state = 'Gujarat'<br/>targetYear = 2026"]
  
  edu["<u>edu_btech : UserEducation</u><br/>degree = 'B.Tech'<br/>branch = 'Computer Science & Eng'<br/>passingYear = 2025<br/>cgpa = 8.4"]
  
  exam["<u>exam_gate : Exam</u><br/>id = 'ex-gate-2026'<br/>title = 'GATE 2026'<br/>conductingBody = 'IIT Guwahati'<br/>category = 'Engineering'"]
  
  paper["<u>paper_cs : ExamPaper</u><br/>code = 'CS'<br/>name = 'Computer Science and Information Technology'"]
  
  ruleAge["<u>rule_age : ExamEligibilityRule</u><br/>ruleType = 'AGE'<br/>conditionKey = 'max_age'<br/>conditionValue = 'None'<br/>isMandatory = true"]
  
  ruleEdu["<u>rule_degree : ExamEligibilityRule</u><br/>ruleType = 'EDUCATION'<br/>conditionKey = 'required_degree'<br/>conditionValue = 'B.Tech/BE/MCA'<br/>isMandatory = true"]
  
  evalResult["<u>eval_gate : EligibilityResult</u><br/>status = 'EXACT'<br/>isEligible = true<br/>matchPercentage = 100.0%<br/>reason = 'B.Tech CS directly satisfies GATE CS stage'"]
  
  recScore["<u>rec_gate : RecommendationScore</u><br/>totalScore = 96.5 / 100<br/>interestWeight = 15.0<br/>goalWeight = 10.0<br/>eligibilityScore = 50.0"]

  %% Links
  user --- profile
  profile --- edu
  profile --- evalResult
  evalResult --- recScore
  exam --- paper
  exam --- ruleAge
  exam --- ruleEdu
  evalResult --- exam
  recScore --- exam"""
        },
        {
            "id": "uml-package",
            "number": 10,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "10. UML Package Diagram",
            "purpose": "Organizes the system into high-level logical namespaces, directories, and architectural packages, indicating cross-package compilation dependencies and layering constraints.",
            "actors": "Presentation Package, Core Engines Package, Data Access Package, AI Integrations Package, Scraper Package, Domain Models Package.",
            "flow": "High-level Presentation Layer depends on Domain Engines and Data Access. Core Engines depend on Domain Models and Database Services. AI and Scraper packages encapsulate external API clients.",
            "mermaid": """graph TD
  subgraph PresentationLayer["app::(portal) - Presentation Layer"]
    Pkg_Student["student::* (Aspirant Views)"]
    Pkg_Admin["admin::* (Admin Workspace)"]
    Pkg_Coord["exam-coordinator::* (Coordinator)"]
    Pkg_UI["components::ui (Shared UI Components)"]
  end

  subgraph CoreEngines["lib::engines - Domain Services"]
    Pkg_Elig["eligibilityEngine.ts"]
    Pkg_Match["matchmakingEngine.ts"]
    Pkg_Verify["verificationEngine.ts"]
    Pkg_Roadmap["roadmapService.ts"]
  end

  subgraph DataAccess["lib::data - Data Access Layer"]
    Pkg_SupaClient["supabaseClient.ts"]
    Pkg_SupaAdmin["supabaseAdmin.ts"]
    Pkg_DbService["dbService.ts / serverDbService.ts"]
  end

  subgraph AIIntegration["lib::ai - AI Services Layer"]
    Pkg_Gemini["geminiClient.ts"]
    Pkg_Rag["documentRagService.ts"]
  end

  subgraph Scrapers["backend::scrapers - Data Acquisition"]
    Pkg_Adapters["portalAdapters (UPSC/SSC/NTA)"]
    Pkg_Normalizer["dateNormalizer.py"]
  end

  subgraph DomainModels["types::domain - Type Declarations"]
    Pkg_TypesExam["exams.types.ts"]
    Pkg_TypesUser["profile.types.ts"]
    Pkg_TypesRules["eligibility.types.ts"]
  end

  %% Dependencies
  Pkg_Student ..> CoreEngines : <<import>>
  Pkg_Admin ..> CoreEngines : <<import>>
  Pkg_Coord ..> DataAccess : <<import>>
  Pkg_Student ..> AIIntegration : <<use>>

  CoreEngines ..> DataAccess : <<import>>
  CoreEngines ..> DomainModels : <<reference>>
  
  AIIntegration ..> DataAccess : <<read context>>
  Scrapers ..> DataAccess : <<write changes>>"""
        },
        {
            "id": "uml-composite-structure",
            "number": 11,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "11. UML Composite Structure Diagram",
            "purpose": "Shows the internal structure of the central classifier ExamIntelligenceEngine, displaying its internal parts, input/output ports, and inter-part collaboration connectors.",
            "actors": "ExamIntelligenceEngine Classifier, DemographicParser, RuleHierarchyEvaluator, MatchWeightCalculator, RankingFilter, ContextSynthesizer.",
            "flow": "Requests enter through UserQueryPort, flow through Demographics and Rule Hierarchy parts, are weighted by MatchWeightCalculator, contextualized with AI, and delivered through RecommendationOutputPort.",
            "mermaid": """graph TD
  subgraph Classifier["ExamIntelligenceEngine : Classifier"]
    Port_Input(("p1: UserQueryPort"))
    Port_DB(("p2: DatabaseAccessPort"))
    Port_Output(("p3: RecommendationOutputPort"))
    Port_AI(("p4: AiAdvisorPort"))

    subgraph Internal_Parts["Internal Engine Parts"]
      Part_Parser["demographicParser : DemographicsProcessor"]
      Part_RuleEngine["ruleHierarchyEvaluator : EligibilityEvaluator"]
      Part_Weight["matchWeightCalculator : ScoringMatrix"]
      Part_Rank["rankingFilter : SortingStrategy"]
      Part_Context["contextSynthesizer : AIContextBuilder"]
    end

    %% Internal Connectors
    Port_Input --> Part_Parser
    Part_Parser --> Part_RuleEngine
    Port_DB <--> Part_RuleEngine
    Part_RuleEngine --> Part_Weight
    Part_Weight --> Part_Rank
    Part_Rank --> Port_Output

    Part_Rank -.-> Part_Context
    Part_Context <--> Port_AI
  end"""
        },
        {
            "id": "uml-timing",
            "number": 12,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "12. UML Timing Diagram",
            "purpose": "Captures the timing constraints and state transitions over an elapsed timeline (0 to 1200 milliseconds) for an end-to-end Student AI Advisor Query with RAG context synthesis.",
            "actors": "UserClient, APIGateway, SupabaseDatabase, GeminiAIEndpoint.",
            "flow": "Visualizes state durations across lifelines: Client initiates request at 0ms; Gateway validates JWT (0-150ms); Database executes profile & syllabus queries (150-350ms); Gateway synthesizes prompt (350-450ms); Gemini generates tokens (450-1050ms); Client streams response to complete render at 1200ms.",
            "mermaid": """gantt
  title UML Timing Diagram — Student AI Advisor Query Execution (0 to 1200 ms)
  dateFormat X
  axisFormat %s ms

  section UserClient
  IDLE                  :0, 50
  TRANSMITTING_QUERY    :50, 150
  WAITING_FIRST_TOKEN   :150, 600
  STREAMING_TOKENS      :600, 1150
  RENDER_COMPLETE       :1150, 1200

  section NextJS_APIGateway
  IDLE                  :0, 50
  VERIFY_JWT_SESSION    :50, 150
  FETCH_DB_CONTEXT      :150, 350
  SYNTHESIZE_PROMPT     :350, 450
  PIPE_SSE_STREAM       :450, 1150
  LOG_TRANSACTION       :1150, 1200

  section Supabase_Database
  IDLE                  :0, 150
  QUERY_USER_PROFILE    :150, 250
  QUERY_EXAM_SYLLABUS   :250, 350
  IDLE                  :350, 1150
  INSERT_CHAT_LOG       :1150, 1200

  section Gemini_AI_Engine
  IDLE                  :0, 450
  INFERENCE_PROCESSING  :450, 600
  STREAMING_CHUNKS      :600, 1150
  IDLE                  :1150, 1200"""
        },
        {
            "id": "uml-interaction-overview",
            "number": 13,
            "category": "UML Diagrams",
            "badge": "UML",
            "title": "13. UML Interaction Overview Diagram",
            "purpose": "Provides a high-level architectural overview combining activity diagram decision flows with embedded sequence interaction occurrences for complete student engagement.",
            "actors": "Student, AuthenticationFrame, OnboardingFrame, RecommendationFrame, ExplorationFrame, AIAdvisorFrame, RoadmapFrame.",
            "flow": "Start -> sd: UserLogin -> Decision: Profile Complete? -> (If No: sd: AcademicOnboarding) -> sd: ComputeRecommendations -> Fork: sd: ExploreExamDetails & sd: QueryGeminiAdvisor -> Join -> sd: ActivateRoadmap -> End.",
            "mermaid": """graph TD
  Start([Start]) --> Frame_Auth[["sd: UserAuthentication"]]
  Frame_Auth --> Decision_Profile{Profile Complete?}

  Decision_Profile -->|No| Frame_Onboarding[["sd: CompleteAcademicOnboarding"]]
  Frame_Onboarding --> Frame_Recom[["sd: ComputeRecommendations"]]

  Decision_Profile -->|Yes| Frame_Recom
  
  Frame_Recom --> Fork_Actions{Action Choice}
  
  Fork_Actions --> Frame_Explore[["sd: BrowseExamCatalog & Syllabus"]]
  Fork_Actions --> Frame_AI[["sd: ConsultGeminiAIAdvisor"]]
  
  Frame_Explore --> Join_Roadmap{Save Exam?}
  Frame_AI --> Join_Roadmap
  
  Join_Roadmap -->|Yes| Frame_Roadmap[["sd: TrackPreparationMilestones"]]
  Join_Roadmap -->|No| EndNode([End Session])
  
  Frame_Roadmap --> EndNode"""
        },

        # =====================================================================
        # SECTION 2: DATA FLOW DIAGRAMS (12 DIAGRAMS)
        # =====================================================================
        {
            "id": "dfd-level-0",
            "number": 14,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "14. DFD Level 0 — Context Diagram",
            "purpose": "Establishes the boundary of the UdanPath system, treating it as a single central process communicating with external entities via primary input and output data flows.",
            "actors": "External Entities: Student User, Administrator, Exam Coordinator, Supabase Auth, Supabase Storage, Google Gemini AI, Official Exam Portals (UPSC/SSC/NTA).",
            "flow": "Students provide credentials and profile choices; receive eligibility statuses, recommendations, roadmaps, and AI guidance. Admins provide verification actions; receive discrepancy queues. Gemini receives prompts; returns analysis. Portals supply scraped notices.",
            "mermaid": """graph TD
  Student["External Entity: Student Aspirant"]
  Admin["External Entity: System Administrator"]
  Coordinator["External Entity: Exam Coordinator"]
  SupabaseAuth["External Entity: Supabase GoTrue Auth"]
  SupabaseStorage["External Entity: Supabase S3 Storage"]
  GeminiAI["External Entity: Google Gemini AI"]
  OfficialPortals["External Entity: Official Exam Portals (UPSC, SSC, NTA)"]

  UdanPathProcess((0.0 UDANPATH SYSTEM))

  %% Student Flows
  Student -->|Credentials, Profile Data, Search Queries, Chat Prompts| UdanPathProcess
  UdanPathProcess -->|Auth Tokens, Eligibility Results, Recommendations, Roadmaps, AI Advice| Student

  %% Admin Flows
  Admin -->|Verification Decisions, Rule Updates, Broadcast Notices| UdanPathProcess
  UdanPathProcess -->|Discrepancy Queue, System Logs, Analytics| Admin

  %% Coordinator Flows
  Coordinator -->|Syllabus Data, Papers, PYQ Links| UdanPathProcess
  UdanPathProcess -->|Catalog Confirmation| Coordinator

  %% External Service Flows
  UdanPathProcess <-->|JWT Verification & Session Handshake| SupabaseAuth
  UdanPathProcess <-->|Upload / Download Study Material PDFs| SupabaseStorage
  UdanPathProcess <-->|RAG Prompts & Structured Inference Streams| GeminiAI
  OfficialPortals -->|Scraped HTML & Notice Feeds| UdanPathProcess"""
        },
        {
            "id": "dfd-level-1",
            "number": 15,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "15. DFD Level 1 — System Decomposition",
            "purpose": "Decomposes the Level 0 context bubble into the 12 primary functional processes and reveals the 11 persistent data stores accessed across transactions.",
            "actors": "Processes 1.0 to 12.0; Data Stores D1 to D11; External Entities.",
            "flow": "P1 (Auth), P2 (Profile), P3 (Discovery), P4 (Eligibility), P5 (Recommendations), P6 (Scraper), P7 (Resources), P8 (Roadmaps), P9 (AI Advisor), P10 (PDF RAG), P11 (Notifications), P12 (Verification Queue).",
            "mermaid": """graph TD
  Student["Student"]
  Admin["Admin"]
  Official["Official Portals"]
  Gemini["Gemini AI"]

  %% Processes
  P1((1.0 Auth & Session))
  P2((2.0 Profile Management))
  P3((3.0 Exam Discovery))
  P4((4.0 Eligibility Engine))
  P5((5.0 Recommendations))
  P6((6.0 Live Scraper))
  P7((7.0 Study Resources))
  P8((8.0 Roadmap Milestones))
  P9((9.0 AI Career Advisor))
  P10((10.0 PDF RAG Analyzer))
  P11((11.0 Notification Engine))
  P12((12.0 Verification Queue))

  %% Data Stores
  D1[("D1: Users & Student Profiles")]
  D2[("D2: Exam Master Catalog")]
  D3[("D3: Eligibility Rules")]
  D4[("D4: Courses & Coaching")]
  D5[("D5: PYQs & PDF Storage")]
  D6[("D6: User Bookmarks & Tracking")]
  D7[("D7: Roadmap Milestones")]
  D8[("D8: AI Conversation Logs")]
  D9[("D9: Platform Notifications")]
  D10[("D10: Aspirant Experiences")]
  D11[("D11: Verification Queue & Logs")]

  %% Flows
  Student --> P1
  P1 <--> D1
  
  Student --> P2
  P2 --> D1
  
  Student --> P3
  P3 <--> D2
  
  Student --> P4
  P4 <--> D1
  P4 <--> D3
  P4 --> Student
  
  Student --> P5
  P5 <--> D1
  P5 <--> D2
  P5 --> P4
  P5 --> Student
  
  Student --> P7
  P7 <--> D4
  P7 <--> D5
  P7 <--> D10
  
  Student --> P8
  P8 <--> D7
  P8 <--> D6
  
  Student --> P9
  P9 <--> D1
  P9 <--> D2
  P9 <--> D8
  P9 <--> Gemini
  
  Student --> P10
  P10 <--> D5
  P10 <--> Gemini
  
  P11 <--> D9
  P11 --> Student
  
  Official --> P6
  P6 <--> D2
  P6 --> D11
  
  Admin --> P12
  P12 <--> D11
  P12 --> D2
  P12 --> P11"""
        },
        {
            "id": "dfd-level-2-p1",
            "number": 16,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "16. DFD Level 2 — Process 1.0 (Auth & Session Management)",
            "purpose": "Breaks down Process 1.0 into granular subprocesses covering credential submission, GoTrue token verification, role resolution, and session state maintenance.",
            "actors": "Student, Admin, GoTrue Service, D1 (Users & Profiles).",
            "flow": "1.1 Receive Credentials -> 1.2 Verify JWT / OAuth -> 1.3 Resolve Role (Student/Admin/Coordinator) -> 1.4 Cache Session Context.",
            "mermaid": """graph TD
  User["Student / Admin User"]
  GoTrue["Supabase GoTrue Engine"]
  D1[("D1: Users & Student Profiles")]

  P1_1((1.1 Receive Auth Credentials))
  P1_2((1.2 Validate via GoTrue))
  P1_3((1.3 Resolve Role & Claims))
  P1_4((1.4 Issue JWT Session Context))

  User -->|Email, Password / Google OAuth| P1_1
  P1_1 -->|Credentials Payload| P1_2
  P1_2 <-->|Verify Secret & Token Hash| GoTrue
  P1_2 -->|Valid User ID| P1_3
  P1_3 <-->|Query user role & metadata| D1
  P1_3 -->|Role: student / admin| P1_4
  P1_4 -->|Active Session Token & Cookie| User"""
        },
        {
            "id": "dfd-level-2-p2",
            "number": 17,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "17. DFD Level 2 — Process 2.0 (Student Profile & Preferences)",
            "purpose": "Details the data transformations when a student completes academic onboarding, specifies categories and state, and configures target preferences.",
            "actors": "Student User, D1 (Users & Profiles), D3 (Master Degrees/Branches).",
            "flow": "2.1 Collect Academic History -> 2.2 Validate Degree/Branch IDs -> 2.3 Store Demographics -> 2.4 Set Career Goals & Preferences.",
            "mermaid": """graph TD
  Student["Student User"]
  D1[("D1: Users & Profiles")]
  MasterEdu[("D3: Master Degrees & Branches")]

  P2_1((2.1 Collect Academic History))
  P2_2((2.2 Validate Degree & Branch))
  P2_3((2.3 Record Demographics & Cat))
  P2_4((2.4 Save Goals & Preferences))

  Student -->|10th, 12th, Degree, CGPA| P2_1
  P2_1 --> P2_2
  P2_2 <-->|Validate branch_id & degree_id| MasterEdu
  P2_2 -->|Validated Academic Rows| D1

  Student -->|DOB, Gender, Category, State| P2_3
  P2_3 -->|Profile Row| D1

  Student -->|Target Year, Career Interests, Budget| P2_4
  P2_4 -->|Preferences Row| D1"""
        },
        {
            "id": "dfd-level-2-p3",
            "number": 18,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "18. DFD Level 2 — Process 3.0 (Exam Discovery & Catalog)",
            "purpose": "Models the detailed data transformations during exam searching, filtering by conducting body or level, syllabus consolidation, and bookmark toggling.",
            "actors": "Student, D2 (Exams Catalog), D4 (Courses), D5 (PYQs), D6 (Bookmarks).",
            "flow": "3.1 Parse Search Filters -> 3.2 Query Catalog -> 3.3 Consolidate Syllabus Stages -> 3.4 Fetch Associated Study Materials -> 3.5 Toggle Bookmark.",
            "mermaid": """graph TD
  Student["Student"]
  D2[("D2: Exams & Categories")]
  D4[("D4: Courses & Coaching")]
  D5[("D5: PYQs & PDFs")]
  D6[("D6: User Bookmarks")]

  P3_1((3.1 Parse Search & Filter))
  P3_2((3.2 Query Exam Catalog))
  P3_3((3.3 Consolidate Syllabus Stages))
  P3_4((3.4 Fetch Related Materials))
  P3_5((3.5 Toggle Saved Bookmark))

  Student -->|Keyword, Category, State Filter| P3_1
  P3_1 -->|Normalized Query Filters| P3_2
  P3_2 <-->|Select Matching Exams| D2
  P3_2 -->|Filtered Exam List| Student

  Student -->|Select Specific Exam| P3_3
  P3_3 <-->|Fetch Papers, Subjects, Topics & Dates| D2
  P3_3 -->|Consolidated ID| P3_4
  P3_4 <-->|Fetch Courses, Coaching & PYQs| D4
  P3_4 <-->|Fetch PDF syllabus files| D5
  P3_4 -->|Full Exam Profile Payload| Student

  Student -->|Click Bookmark Button| P3_5
  P3_5 <-->|Insert / Delete Bookmark Record| D6"""
        },
        {
            "id": "dfd-level-2-p4",
            "number": 19,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "19. DFD Level 2 — Process 4.0 (Dynamic Eligibility Engine)",
            "purpose": "Details the multi-stage eligibility evaluation process matching student demographics, age limits with reservation relaxations, degree branch hierarchies, and nationality/attempts.",
            "actors": "Student, D1 (Profiles DB), D3 (Eligibility Rules DB).",
            "flow": "4.1 Fetch Profile -> 4.2 Fetch Exam Rules -> 4.3 Evaluate Age Relaxation -> 4.4 Evaluate Degree & Branch Hierarchy -> 4.5 Validate Demographics -> 4.6 Consolidate Result Status.",
            "mermaid": """graph TD
  Student["Student / Dashboard"]
  D1[("D1: User Profile & Preferences")]
  D3[("D3: Exam Eligibility Rules")]

  P4_1((4.1 Fetch Student Profile))
  P4_2((4.2 Fetch Exam Rules))
  P4_3((4.3 Evaluate Age & Cat Relaxation))
  P4_4((4.4 Evaluate Degree & Branch Hierarchy))
  P4_5((4.5 Validate Demographics))
  P4_6((4.6 Consolidate Status))

  Student -->|Request Eligibility Check| P4_1
  P4_1 <-->|Retrieve Age, DOB, Category, Degrees| D1
  P4_1 -->|Student Demographic Criteria| P4_3
  P4_1 -->|Student Academic Criteria| P4_4
  P4_1 -->|Student Nationality / State| P4_5

  P4_2 <-->|Retrieve Min/Max Age, Category Adders, Degree IDs| D3
  P4_2 -->|Age Limits| P4_3
  P4_2 -->|Degree & Branch Hierarchy Rules| P4_4
  P4_2 -->|State / Nationality Rules| P4_5

  P4_3 -->|Age Evaluation: Met / Exceeded| P4_6
  P4_4 -->|Education Evaluation: Exact / Related / None| P4_6
  P4_5 -->|Demographic Evaluation: Valid| P4_6

  P4_6 -->|Result: EXACT / STRONG / RELATED / NOT_ELIGIBLE| Student"""
        },
        {
            "id": "dfd-level-2-p5",
            "number": 20,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "20. DFD Level 2 — Process 5.0 (Recommendation Engine)",
            "purpose": "Specifies the weighted recommendation algorithm that filters out ineligible exams and scores eligible ones across interest alignment, career goals, and student preferences.",
            "actors": "Student, D1 (Profiles), D2 (Exams Catalog), Process 4.0.",
            "flow": "5.1 Retrieve Profile -> 5.2 Filter Ineligible -> 5.3 Compute Interest Score -> 5.4 Compute Career Goal Score -> 5.5 Compute Preference Score -> 5.6 Calculate Weighted Total -> 5.7 Sort & Rank.",
            "mermaid": """graph TD
  Student["Student Dashboard"]
  D1[("D1: Profile & Preferences")]
  D2[("D2: Exams Catalog")]
  P4["Process 4.0: Eligibility Engine"]

  P5_1((5.1 Retrieve Profile Data))
  P5_2((5.2 Filter Ineligible Exams))
  P5_3((5.3 Compute Interest Fit))
  P5_4((5.4 Compute Career Goal Fit))
  P5_5((5.5 Compute Preference Fit))
  P5_6((5.6 Calculate Weighted Total))
  P5_7((5.7 Sort & Rank Recommendations))

  Student -->|Load Dashboard| P5_1
  P5_1 <-->|Read Education, Category, Goals| D1
  P5_1 --> P5_2

  P5_2 <-->|Scan Active Verified Exams| D2
  P5_2 <-->|Run Eligibility Check| P4
  P5_2 -->|Exclude NOT_ELIGIBLE| P5_3

  P5_3 <-->|Compare target_exam_categories| D1
  P5_3 -->|Interest Score: 0-15| P5_6

  P5_4 <-->|Compare target career goals| D1
  P5_4 -->|Goal Score: 0-10| P5_6

  P5_5 <-->|Compare preparation budget & language| D1
  P5_5 -->|Preference Score: 0-10| P5_6

  P5_2 -->|Eligibility Score: 0-50 & Age Score: 0-15| P5_6

  P5_6 -->|Composite Index: 0-100| P5_7
  P5_7 -->|Ranked Recommended Exams List| Student"""
        },
        {
            "id": "dfd-level-2-p6",
            "number": 21,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "21. DFD Level 2 — Process 6.0 (Live Scraper & Exam Data)",
            "purpose": "Maps the automated web scraping, notice parsing, ISO date normalization, change detection, and queue dispatching for live official exam updates.",
            "actors": "Official Portals, D2 (Exams & Dates DB), D11 (Verification Queue & Logs), Admin.",
            "flow": "6.1 Scheduler Trigger -> 6.2 Scrape Portal HTML -> 6.3 Extract & Normalize Dates -> 6.4 Validate Logical Integrity -> 6.5 Change Detection -> 6.6 Direct Commit / 6.7 Push to Queue -> 6.8 Admin Review.",
            "mermaid": """graph TD
  Official["Official Portals (UPSC/SSC)"]
  Admin["System Administrator"]
  D2[("D2: Exams & Dates DB")]
  D11[("D11: Verification Queue & Logs")]

  P6_1((6.1 Scheduler Trigger))
  P6_2((6.2 Scrape Portal HTML))
  P6_3((6.3 Extract & Normalize Dates))
  P6_4((6.4 Validate Logical Integrity))
  P6_5((6.5 Change Detection vs Stored))
  P6_6((6.6 Direct Status Update))
  P6_7((6.7 Push Discrepancy to Queue))
  P6_8((6.8 Process Admin Review))

  P6_1 -.->|Hourly Cron| P6_2
  P6_2 <-->|HTTP GET target notice URLs| Official
  P6_2 -->|Raw HTML Payload| P6_3
  P6_3 -->|Parsed Standard Dates JSON| P6_4
  P6_4 -->|Validated Date Entities| P6_5

  P6_5 <-->|Read Current Stored Dates| D2

  P6_5 -->|Dates Identical: No Discrepancy| P6_6
  P6_6 -->|Update last_verified_at = now()| D2

  P6_5 -->|Date Difference Detected| P6_7
  P6_7 -->|Insert Pending Review Item| D11

  Admin -->|Approve / Reject Action| P6_8
  P6_8 <-->|Read Pending Queue| D11
  P6_8 -->|Approved: Update exam_dates| D2"""
        },
        {
            "id": "dfd-level-2-p7",
            "number": 22,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "22. DFD Level 2 — Process 7.0 (Study Resources & PYQs Hub)",
            "purpose": "Details how students query past examination questions, online video links, coaching recommendations, and peer aspirant experiences.",
            "actors": "Student, D4 (Courses/Coaching), D5 (PYQs/PDFs), D10 (Aspirant Experiences).",
            "flow": "7.1 Query PYQs by Year -> 7.2 Fetch Online Courses -> 7.3 Retrieve YouTube Playlists -> 7.4 Load Aspirant Experiences.",
            "mermaid": """graph TD
  Student["Student User"]
  D4[("D4: Courses & Coaching")]
  D5[("D5: PYQs & Storage")]
  D10[("D10: Aspirant Experiences")]

  P7_1((7.1 Query PYQs by Year & Stage))
  P7_2((7.2 Fetch Online Courses & Fees))
  P7_3((7.3 Retrieve YouTube Resources))
  P7_4((7.4 Load Verified Experiences))

  Student -->|Select Exam & Subject| P7_1
  P7_1 <-->|Filter Questions & PDF Links| D5
  P7_1 -->|PYQ Paper Sets & Answers| Student

  Student -->|Browse Coaching| P7_2
  P7_2 <-->|Query Providers, Language, Rating| D4
  P7_2 -->|Verified Coaching Cards| Student

  Student -->|View Video Playlists| P7_3
  P7_3 <-->|Select Curated YouTube Links| D4
  P7_3 -->|Free Lecture Links| Student

  Student -->|Read Topper Stories| P7_4
  P7_4 <-->|Fetch Stories & Tips| D10
  P7_4 -->|Aspirant Advice Feed| Student"""
        },
        {
            "id": "dfd-level-2-p8",
            "number": 23,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "23. DFD Level 2 — Process 8.0 (Roadmap & Milestone Tracking)",
            "purpose": "Documents the generation of preparation timelines, division of syllabus into tiered phases, and tracking of individual study tasks.",
            "actors": "Student, D6 (Bookmarks & Progress), D7 (Roadmap Milestones DB).",
            "flow": "8.1 Resolve Target Year -> 8.2 Load Milestone Tiers -> 8.3 Generate Phased Schedule -> 8.4 Track Task Checkboxes -> 8.5 Compute Progress Percentages.",
            "mermaid": """graph TD
  Student["Student User"]
  D6[("D6: User Progress & Tracking")]
  D7[("D7: Roadmap Milestones")]

  P8_1((8.1 Resolve Target Exam & Year))
  P8_2((8.2 Load Milestone Tiers))
  P8_3((8.3 Generate Phased Schedule))
  P8_4((8.4 Track Task Checkboxes))
  P8_5((8.5 Compute Completion Score))

  Student -->|Enroll in Exam Roadmap| P8_1
  P8_1 --> P8_2
  P8_2 <-->|Fetch Phase 1 Foundation, Phase 2 Core, Phase 3 Revision| D7
  P8_2 --> P8_3
  P8_3 -->|Render Milestone Cards| Student

  Student -->|Check Off Syllabus Task| P8_4
  P8_4 <-->|Toggle is_completed = true/false| D6
  P8_4 --> P8_5
  P8_5 <-->|Calculate Completed vs Total Tasks| D6
  P8_5 -->|Progress: 68% Ready| Student"""
        },
        {
            "id": "dfd-level-2-p9",
            "number": 24,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "24. DFD Level 2 — Process 9.0 (AI Career Advisor)",
            "purpose": "Specifies the conversational AI flow: enriching prompts with student demographics and exam criteria, querying Gemini 1.5/2.0, streaming responses, and recording logs.",
            "actors": "Student, Gemini AI, D1 (Profiles), D2 (Exams), D8 (Chat Logs).",
            "flow": "9.1 Authenticate Request -> 9.2 Retrieve Profile & Exam Context -> 9.3 Retrieve Chat History -> 9.4 Build Prompt & Query Gemini -> 9.5 Validate Stream -> 9.6 Save Logs.",
            "mermaid": """graph TD
  Student["Student User (Chat UI)"]
  Gemini["Google Gemini 1.5/2.0 API"]
  D1[("D1: User Profiles")]
  D2[("D2: Exams DB")]
  D8[("D8: Chat Conversation Logs")]

  P9_1((9.1 Authenticate Request))
  P9_2((9.2 Fetch Profile & Exam Context))
  P9_3((9.3 Fetch Recent Chat History))
  P9_4((9.4 Synthesize Prompt & Call Gemini))
  P9_5((9.5 Validate & Stream Reply))
  P9_6((9.6 Save Conversation Log))

  Student -->|User Message + Target Exam ID| P9_1
  P9_1 <-->|Verify User ID| D1
  P9_1 --> P9_2
  
  P9_2 <-->|Read Education & Demographics| D1
  P9_2 <-->|Read Exam Syllabus & Deadlines| D2
  P9_2 --> P9_4

  P9_3 <-->|Read Last 10 Messages| D8
  P9_3 --> P9_4

  P9_4 <-->|Stream Prompt with Context| Gemini
  P9_4 -->|SSE Stream Chunks| P9_5
  P9_5 -->|Real-time Token Stream| Student
  P9_5 -->|Final Completed Response| P9_6
  P9_6 -->|Insert Message Row| D8"""
        },
        {
            "id": "dfd-level-2-p10",
            "number": 25,
            "category": "Data Flow Diagrams (DFD)",
            "badge": "DFD",
            "title": "25. DFD Level 2 — Process 10.0 (PDF/RAG Processing)",
            "purpose": "Models document handling: uploading official syllabus PDFs, text extraction, chunking, vector contextualization, and user document Q&A.",
            "actors": "Student, Gemini AI, D5 (Storage), D8 (Chat Logs).",
            "flow": "10.1 Validate & Store PDF -> 10.2 Extract Clean Text -> 10.3 Chunk Document -> 10.4 Index Chunks -> 10.5 Retrieve Passages -> 10.6 Run Contextual QA with Gemini.",
            "mermaid": """graph TD
  Student["Student"]
  Gemini["Google Gemini AI"]
  D5[("D5: Supabase Storage (PDFs)")]
  D8[("D8: Document Analysis Logs")]

  P10_1((10.1 Validate & Store PDF))
  P10_2((10.2 Extract Clean Text))
  P10_3((10.3 Chunk into Logical Sections))
  P10_4((10.4 Index Chunks / Vector Context))
  P10_5((10.5 Retrieve Relevant Chunks))
  P10_6((10.6 Run Contextual QA))

  Student -->|Uploads Syllabus / Notice PDF| P10_1
  P10_1 <-->|Save Raw PDF File| D5
  P10_1 -->|Binary PDF Stream| P10_2
  P10_2 -->|Clean Text Stream| P10_3
  P10_3 -->|Document Segments| P10_4
  P10_4 <-->|Cache Document Summary| D8

  Student -->|Ask Question About Document| P10_5
  P10_5 <-->|Fetch Matching Chunks| D8
  P10_5 -->|Question + Document Chunks| P10_6
  P10_6 <-->|Inference Analysis| Gemini
  P10_6 -->|Grounded Answer with Citations| Student"""
        },

        # =====================================================================
        # SECTION 3: DATABASE DIAGRAMS (6 DIAGRAMS)
        # =====================================================================
        {
            "id": "db-erd",
            "number": 26,
            "category": "Database Models",
            "badge": "DB",
            "title": "26. Entity Relationship Diagram (ERD)",
            "purpose": "Provides the complete Crow's Foot Entity Relationship Diagram connecting all 25 tables of the UdanPath database, reflecting exact primary keys, foreign keys, and cardinalities.",
            "actors": "Database Tables: users, student_profiles, user_education, master_degrees, master_branches, exams, exam_categories, exam_dates, exam_sources, exam_papers, exam_subjects, exam_topics, exam_eligibility_rules, exam_pyqs, exam_courses, user_bookmarks, exam_milestones, user_study_progress, data_verification_queue, user_notifications, ai_interaction_logs.",
            "flow": "Users link to profiles and bookmarks. Master education tables normalize degree/branch hierarchies. Exams link to categories, dates, papers, syllabus trees, eligibility rules, and verification items.",
            "mermaid": """erDiagram
    users ||--o| student_profiles : "has"
    users ||--o| user_preferences : "configures"
    users ||--o{ user_education : "completes"
    users ||--o{ user_bookmarks : "saves"
    users ||--o{ user_notifications : "receives"
    users ||--o{ ai_interaction_logs : "interacts"

    master_education_levels ||--o{ master_degrees : "contains"
    master_degrees ||--o{ master_branches : "contains"
    user_education }o--|| master_education_levels : "references"
    user_education }o--|| master_degrees : "references"
    user_education }o--|| master_branches : "references"

    exams }o--|| exam_categories : "classified_by"
    exams ||--o| exam_dates : "scheduled_in"
    exams ||--o{ exam_papers : "stages"
    exams ||--o{ exam_eligibility_rules : "restricted_by"
    exams ||--o{ exam_milestones : "split_into"
    exams ||--o{ user_bookmarks : "saved_in"

    exam_dates }o--|| exam_sources : "obtained_from"
    exam_papers ||--o{ exam_subjects : "outlines"
    exam_subjects ||--o{ exam_topics : "details"

    user_study_progress }o--|| exams : "references"
    user_study_progress }o--|| exam_topics : "tracks"
    user_study_progress }o--|| users : "belongs_to"

    data_verification_queue }o--|| exams : "triggers_for"
    data_verification_queue }o--|| exam_sources : "fetched_by"

    users {
        uuid id PK
        varchar email
        varchar role
        timestamptz created_at
    }

    student_profiles {
        uuid id PK
        uuid user_id FK
        varchar full_name
        date dob
        varchar gender
        varchar category
        varchar state
        int target_year
    }

    user_education {
        uuid id PK
        uuid user_id FK
        uuid education_level_id FK
        uuid degree_id FK
        uuid branch_id FK
        int passing_year
        numeric percentage_or_cgpa
    }

    exams {
        uuid id PK
        varchar title
        varchar slug
        uuid category_id FK
        varchar conducting_body
        varchar exam_level
    }

    exam_dates {
        uuid id PK
        uuid exam_id FK
        date notification_release_date
        date application_start_date
        date application_end_date
        date exam_start_date
        date result_date
        varchar verification_status
    }

    exam_eligibility_rules {
        uuid id PK
        uuid exam_id FK
        varchar rule_type
        varchar condition_key
        text condition_value
        boolean is_mandatory
    }

    data_verification_queue {
        uuid id PK
        uuid exam_id FK
        uuid source_id FK
        varchar field_name
        text proposed_value
        varchar status
    }"""
        },
        {
            "id": "db-conceptual",
            "number": 27,
            "category": "Database Models",
            "badge": "DB",
            "title": "27. Conceptual Data Model",
            "purpose": "Outlines high-level enterprise business entities and semantic associations without implementation-specific technical attributes, accessible to both stakeholders and engineers.",
            "actors": "Student Aspirant, Academic Credential, Competitive Exam, Stage/Paper, Syllabus Subject/Topic, Eligibility Rule, Preparation Roadmap, Study Asset, Verification Record.",
            "flow": "A Student Aspirant holds Academic Credentials, qualifies for Competitive Exams based on Eligibility Rules, follows Preparation Roadmaps, accesses Study Assets, while Official Notices generate Verification Records.",
            "mermaid": """graph TD
  Student["Student Aspirant<br/>(Demographics, Reservation, Year)"]
  Credential["Academic Credential<br/>(Level, Degree, Branch, CGPA)"]
  Exam["Competitive Exam<br/>(Body, Tier, Level, Category)"]
  Stage["Stage / Exam Paper<br/>(Prelims, Mains, Technical)"]
  Syllabus["Syllabus Tree<br/>(Subjects, Modules, Topics)"]
  Rule["Eligibility Rule<br/>(Age, Degree, Attempts)"]
  Roadmap["Preparation Roadmap<br/>(Phases, Milestones, Tasks)"]
  StudyAsset["Study Asset<br/>(PYQs, Online Courses, PDFs)"]
  Verification["Verification Record<br/>(Scraped Notice, Status)"]

  Student -- "earned" --> Credential
  Student -- "targets" --> Exam
  Student -- "monitors progress in" --> Roadmap

  Exam -- "subdivided into" --> Stage
  Stage -- "covers" --> Syllabus
  Exam -- "governed by" --> Rule
  Exam -- "offers" --> Roadmap
  Exam -- "supported by" --> StudyAsset
  Exam -- "validated through" --> Verification"""
        },
        {
            "id": "db-logical",
            "number": 28,
            "category": "Database Models",
            "badge": "DB",
            "title": "28. Logical Data Model (LDM)",
            "purpose": "Defines normalized third-normal-form (3NF) relational structures, primary key attributes, alternate keys, foreign key constraints, and relational domain data types.",
            "actors": "Normalized entities: USER, STUDENT_PROFILE, USER_EDUCATION, MASTER_DEGREE, MASTER_BRANCH, EXAM, EXAM_DATE, EXAM_PAPER, EXAM_ELIGIBILITY_RULE, BOOKMARK.",
            "flow": "Shows formal entity-relationship constraints independent of database engine vendor features, ensuring referential integrity and zero transitive dependencies.",
            "mermaid": """erDiagram
    USER ||--|| STUDENT_PROFILE : identifies
    USER ||--o{ USER_EDUCATION : attains
    USER ||--o{ USER_BOOKMARK : stores
    USER ||--o{ STUDY_PROGRESS : tracks

    MASTER_DEGREE ||--o{ MASTER_BRANCH : classifies
    USER_EDUCATION }o--|| MASTER_DEGREE : qualifies_with
    USER_EDUCATION }o--|| MASTER_BRANCH : specializes_in

    EXAM_CATEGORY ||--o{ EXAM : groups
    EXAM ||--|| EXAM_DATE : scheduled_as
    EXAM ||--o{ EXAM_PAPER : comprises
    EXAM ||--o{ EXAM_ELIGIBILITY_RULE : dictates
    EXAM ||--o{ EXAM_MILESTONE : schedules
    EXAM ||--o{ USER_BOOKMARK : bookmarked_by

    EXAM_PAPER ||--o{ EXAM_SUBJECT : divides_into
    EXAM_SUBJECT ||--o{ EXAM_TOPIC : details

    STUDY_PROGRESS }o--|| EXAM_TOPIC : completes

    USER {
        UUID user_id PK
        VARCHAR email UK
        VARCHAR role_name
    }
    STUDENT_PROFILE {
        UUID profile_id PK
        UUID user_id FK
        VARCHAR full_name
        DATE date_of_birth
        VARCHAR category_code
    }
    EXAM {
        UUID exam_id PK
        VARCHAR exam_slug UK
        VARCHAR exam_title
        UUID category_id FK
    }
    EXAM_DATE {
        UUID date_id PK
        UUID exam_id FK
        DATE app_start_date
        DATE app_end_date
        DATE exam_start_date
    }
    EXAM_ELIGIBILITY_RULE {
        UUID rule_id PK
        UUID exam_id FK
        VARCHAR rule_type
        VARCHAR condition_key
        VARCHAR condition_value
    }"""
        },
        {
            "id": "db-physical",
            "number": 29,
            "category": "Database Models",
            "badge": "DB",
            "title": "29. Physical Data Model (PDM)",
            "purpose": "Details physical storage structures for Supabase PostgreSQL 15, including exact column data types, DEFAULT gen_random_uuid(), indexes, ON DELETE CASCADE foreign keys, and RLS policies.",
            "actors": "Physical Tables: users, student_profiles, exams, exam_dates, exam_eligibility_rules, data_verification_queue, user_study_progress.",
            "flow": "Includes PostgreSQL physical constructs: UUID primary keys, B-Tree indexes on slugs and user IDs, JSONB task structures, and RLS policy boundaries.",
            "mermaid": """erDiagram
    public_users ||--o| public_student_profiles : "CASCADE"
    public_exams ||--o| public_exam_dates : "CASCADE"
    public_exams ||--o{ public_exam_papers : "CASCADE"
    public_exams ||--o{ public_exam_eligibility_rules : "CASCADE"
    public_exams ||--o{ public_data_verification_queue : "CASCADE"

    public_users {
        UUID id PK "DEFAULT gen_random_uuid()"
        VARCHAR_255 email "NOT NULL UNIQUE"
        VARCHAR_50 role "DEFAULT 'student'"
        TIMESTAMPTZ created_at "DEFAULT now()"
    }

    public_student_profiles {
        UUID id PK "DEFAULT gen_random_uuid()"
        UUID user_id FK "REFERENCES public_users(id) ON DELETE CASCADE"
        VARCHAR_255 full_name "NOT NULL"
        DATE dob "NOT NULL"
        VARCHAR_50 category "NOT NULL"
        VARCHAR_100 state "NOT NULL"
        INT target_year "DEFAULT 2026"
    }

    public_exams {
        UUID id PK "DEFAULT gen_random_uuid()"
        VARCHAR_255 title "NOT NULL"
        VARCHAR_255 slug "NOT NULL UNIQUE INDEX idx_exams_slug"
        VARCHAR_255 conducting_body "NOT NULL"
        TIMESTAMPTZ created_at "DEFAULT now()"
    }

    public_exam_dates {
        UUID id PK "DEFAULT gen_random_uuid()"
        UUID exam_id FK "REFERENCES public_exams(id) ON DELETE CASCADE"
        DATE application_start_date "NULLABLE"
        DATE application_end_date "NULLABLE"
        DATE exam_start_date "NULLABLE"
        VARCHAR_50 verification_status "DEFAULT 'PENDING_REVIEW'"
    }

    public_exam_eligibility_rules {
        UUID id PK "DEFAULT gen_random_uuid()"
        UUID exam_id FK "REFERENCES public_exams(id) ON DELETE CASCADE"
        VARCHAR_50 rule_type "NOT NULL"
        VARCHAR_100 condition_key "NOT NULL"
        TEXT condition_value "NOT NULL"
        BOOLEAN is_mandatory "DEFAULT true"
    }

    public_data_verification_queue {
        UUID id PK "DEFAULT gen_random_uuid()"
        UUID exam_id FK "REFERENCES public_exams(id) ON DELETE CASCADE"
        VARCHAR_100 field_name "NOT NULL"
        TEXT proposed_value "NOT NULL"
        VARCHAR_50 status "DEFAULT 'PENDING'"
        UUID reviewed_by FK "REFERENCES public_users(id) ON DELETE SET NULL"
    }"""
        },
        {
            "id": "db-schema",
            "number": 30,
            "category": "Database Models",
            "badge": "DB",
            "title": "30. Database Schema Diagram",
            "purpose": "Architectural clustering of database tables into 7 distinct functional schemas/subdomains within PostgreSQL, showing inter-schema relationships and data boundaries.",
            "actors": "Schemas: auth_schema, profile_schema, exam_catalog_schema, syllabus_schema, eligibility_schema, progress_schema, verification_schema.",
            "flow": "Organizes tables into isolated functional clusters: Auth manages tokens; Profile manages educational records; Catalog manages core exam metadata; Syllabus manages stage hierarchies; Eligibility evaluates rules; Progress manages roadmaps; Verification audits scraped dates.",
            "mermaid": """graph TD
  subgraph Auth_Domain["1. Auth & Security Schema"]
    tbl_users["users<br/>(id, email, role, created_at)"]
  end

  subgraph Profile_Domain["2. Student Academic Profile Schema"]
    tbl_profiles["student_profiles<br/>(id, user_id, full_name, dob, category, state)"]
    tbl_education["user_education<br/>(id, user_id, degree_id, branch_id, cgpa)"]
    tbl_prefs["user_preferences<br/>(id, user_id, goals, budget)"]
    tbl_m_degrees["master_degrees"]
    tbl_m_branches["master_branches"]
  end

  subgraph Catalog_Domain["3. Exam Catalog Schema"]
    tbl_exams["exams<br/>(id, title, slug, body, level)"]
    tbl_categories["exam_categories<br/>(id, name, code)"]
    tbl_dates["exam_dates<br/>(id, exam_id, start_date, end_date)"]
    tbl_sources["exam_sources<br/>(id, name, base_url, type)"]
  end

  subgraph Syllabus_Domain["4. Syllabus Hierarchy Schema"]
    tbl_papers["exam_papers<br/>(id, exam_id, name, code)"]
    tbl_subjects["exam_subjects<br/>(id, paper_id, name, weightage)"]
    tbl_topics["exam_topics<br/>(id, subject_id, name, desc)"]
  end

  subgraph Eligibility_Domain["5. Dynamic Eligibility Schema"]
    tbl_rules["exam_eligibility_rules<br/>(id, exam_id, rule_type, condition_key, condition_val)"]
  end

  subgraph Progress_Domain["6. Prep Progress & Roadmaps Schema"]
    tbl_milestones["exam_milestones<br/>(id, exam_id, tier, tasks_json)"]
    tbl_progress["user_study_progress<br/>(id, user_id, topic_id, completed)"]
    tbl_bookmarks["user_bookmarks<br/>(id, user_id, exam_id)"]
  end

  subgraph Audit_Domain["7. Scraping & Verification Schema"]
    tbl_queue["data_verification_queue<br/>(id, exam_id, proposed_val, status)"]
    tbl_changelogs["data_change_logs<br/>(id, exam_id, old_val, new_val)"]
  end

  %% Inter-Schema Foreign Keys
  tbl_users --> tbl_profiles
  tbl_users --> tbl_education
  tbl_profiles --> tbl_prefs
  tbl_education --> tbl_m_degrees
  tbl_education --> tbl_m_branches

  tbl_exams --> tbl_categories
  tbl_exams --> tbl_dates
  tbl_dates --> tbl_sources

  tbl_exams --> tbl_papers
  tbl_papers --> tbl_subjects
  tbl_subjects --> tbl_topics

  tbl_exams --> tbl_rules
  tbl_exams --> tbl_milestones
  tbl_users --> tbl_progress
  tbl_topics --> tbl_progress
  tbl_users --> tbl_bookmarks
  tbl_exams --> tbl_bookmarks

  tbl_exams --> tbl_queue
  tbl_exams --> tbl_changelogs"""
        },
        {
            "id": "db-relational-tables",
            "number": 31,
            "category": "Database Models",
            "badge": "DB",
            "title": "31. Relational Table Diagram (PK/FK Constraints)",
            "purpose": "Comprehensive visual matrix detailing every relational table, its Primary Key (PK), Foreign Keys (FK with target table.column), NOT NULL constraints, and relationship types.",
            "actors": "Relational Tables: users, student_profiles, exams, exam_dates, exam_papers, exam_eligibility_rules, user_bookmarks, data_verification_queue.",
            "flow": "Presents structured tabular schema definitions with foreign key constraints, cascade rules, unique indexes, and default column values.",
            "mermaid": """graph LR
  subgraph TBL_USERS["public.users"]
    U_PK["PK id : UUID"]
    U_EMAIL["email : VARCHAR(255) [UQ, NN]"]
    U_ROLE["role : VARCHAR(50) [NN]"]
  end

  subgraph TBL_PROFILES["public.student_profiles"]
    P_PK["PK id : UUID"]
    P_FK["FK user_id -> users.id [NN, ON DELETE CASCADE]"]
    P_NAME["full_name : VARCHAR(255) [NN]"]
    P_DOB["dob : DATE [NN]"]
    P_CAT["category : VARCHAR(50) [NN]"]
  end

  subgraph TBL_EXAMS["public.exams"]
    E_PK["PK id : UUID"]
    E_SLUG["slug : VARCHAR(255) [UQ, NN]"]
    E_TITLE["title : VARCHAR(255) [NN]"]
    E_BODY["conducting_body : VARCHAR(255)"]
  end

  subgraph TBL_DATES["public.exam_dates"]
    D_PK["PK id : UUID"]
    D_FK["FK exam_id -> exams.id [NN, ON DELETE CASCADE]"]
    D_START["application_start_date : DATE"]
    D_END["application_end_date : DATE"]
    D_EXAM["exam_start_date : DATE"]
    D_STATUS["verification_status : VARCHAR(50)"]
  end

  subgraph TBL_RULES["public.exam_eligibility_rules"]
    R_PK["PK id : UUID"]
    R_FK["FK exam_id -> exams.id [NN, ON DELETE CASCADE]"]
    R_TYPE["rule_type : VARCHAR(50) [NN]"]
    R_KEY["condition_key : VARCHAR(100) [NN]"]
    R_VAL["condition_value : TEXT [NN]"]
  end

  subgraph TBL_QUEUE["public.data_verification_queue"]
    Q_PK["PK id : UUID"]
    Q_FK_E["FK exam_id -> exams.id [NN, ON DELETE CASCADE]"]
    Q_FIELD["field_name : VARCHAR(100) [NN]"]
    Q_PROP["proposed_value : TEXT [NN]"]
    Q_STAT["status : VARCHAR(50) [DEFAULT 'PENDING']"]
  end

  %% Links
  TBL_USERS -- "1 : 1" --> TBL_PROFILES
  TBL_EXAMS -- "1 : 1" --> TBL_DATES
  TBL_EXAMS -- "1 : N" --> TBL_RULES
  TBL_EXAMS -- "1 : N" --> TBL_QUEUE"""
        },

        # =====================================================================
        # SECTION 4: ADDITIONAL SYSTEM DESIGN DIAGRAMS (8 DIAGRAMS)
        # =====================================================================
        {
            "id": "arch-system",
            "number": 32,
            "category": "System Design & Architecture",
            "badge": "ARCH",
            "title": "32. System Architecture Diagram",
            "purpose": "Presents the complete multi-tier enterprise cloud architecture of UdanPath across Presentation, Edge Gateway, Business Services, Persistence, and External AI & Government Integration layers.",
            "actors": "Client Layer, Vercel Edge Layer, Application Engine Layer, Persistence Layer, External Intelligence & Scraper Targets.",
            "flow": "Users connect to Next.js on Vercel Edge; requests route to backend API microservices; Supabase manages Auth, PostgreSQL, and Storage; Gemini AI generates study guidance; background workers crawl official exam websites.",
            "mermaid": """graph TD
  subgraph Layer1["1. Presentation Tier (Client Viewport)"]
    DesktopUI["Desktop Web Browser (Chrome / Firefox / Safari)"]
    MobileUI["Mobile Responsive PWA / Browser"]
  end

  subgraph Layer2["2. Edge & Ingress Tier (Vercel CDN)"]
    EdgeGateway["Vercel Global Edge Network<br/>SSL/TLS Termination, DDoS Shield"]
    NextSSR["Next.js 16 App Router<br/>Server Components & SSR Hydration"]
  end

  subgraph Layer3["3. Business Engine Tier (FastAPI Gateway & Core Logic)"]
    AuthGuard["Authentication & RBAC Middleware"]
    EngineElig["Dynamic Eligibility Engine"]
    EngineMatch["AI Matchmaking & Scoring Engine"]
    EngineRoadmap["Roadmap & Milestones Engine"]
    EngineVerify["Scraper Verification Service"]
    WorkerScraper["Autonomous Crawler Daemon"]
  end

  subgraph Layer4["4. Persistence Tier (Supabase Cloud AWS)"]
    PostgreSQL["PostgreSQL 15 Managed DB<br/>Row-Level Security & pgvector"]
    GoTrue["GoTrue Identity Service<br/>JWT & OAuth Handshake"]
    S3Storage["MinIO / S3 Storage Buckets<br/>Syllabus & PYQ PDF Storage"]
  end

  subgraph Layer5["5. Intelligence & External Tier"]
    GeminiAI["Google Gemini 1.5/2.0 AI<br/>Chat Guidance & Document RAG"]
    GovtPortals["NIC Official Portals<br/>(UPSC, SSC, NTA, IIT GATE)"]
  end

  %% Cross Layer Flow
  DesktopUI --> EdgeGateway
  MobileUI --> EdgeGateway
  EdgeGateway --> NextSSR

  NextSSR --> AuthGuard
  AuthGuard --> EngineElig
  AuthGuard --> EngineMatch
  AuthGuard --> EngineRoadmap
  AuthGuard --> EngineVerify

  EngineElig --> PostgreSQL
  EngineMatch --> PostgreSQL
  EngineRoadmap --> PostgreSQL
  EngineVerify --> PostgreSQL
  AuthGuard --> GoTrue
  NextSSR --> S3Storage

  EngineMatch -.-> GeminiAI
  WorkerScraper --> GovtPortals
  WorkerScraper --> EngineVerify"""
        },
        {
            "id": "arch-flowchart",
            "number": 33,
            "category": "System Design & Architecture",
            "badge": "FLOW",
            "title": "33. End-to-End System Flowchart",
            "purpose": "A comprehensive operational flowchart tracing the complete user journey from initial website landing to career exploration, eligibility validation, recommendations, and study progress tracking.",
            "actors": "Aspirant User, System Flow Nodes, Decision Checkpoints, Database Actions.",
            "flow": "Start -> Login -> Check Profile -> (If empty: Onboarding) -> Run Eligibility Rules -> Is Eligible? -> Compute Match Scores -> Explore Exams -> Enroll in Roadmap -> Check Off Daily Tasks -> Milestone Accomplished -> Ready for Official Exam.",
            "mermaid": """graph TD
  Start([Start: Aspirant Lands on Platform]) --> CheckAuth{Is User Authenticated?}
  
  CheckAuth -->|No| ShowLanding[Display Platform Overview & Public Discover Page]
  ShowLanding --> LoginAction[User Signs In / Signs Up via Supabase Auth]
  LoginAction --> CheckAuth
  
  CheckAuth -->|Yes| CheckProfile{Is Academic Profile Complete?}
  CheckProfile -->|No| OnboardingWizard[Prompt Onboarding Wizard: Education, Degree, Branch, Category, DOB]
  OnboardingWizard --> SaveProfile[Commit Profile to Supabase DB]
  SaveProfile --> CheckProfile
  
  CheckProfile -->|Yes| LoadDashboard[Initialize Student Dashboard]
  LoadDashboard --> RunEligibility[Execute Eligibility Engine across Exam Master Catalog]
  
  RunEligibility --> EvalLoop{Evaluate Each Exam Rule}
  EvalLoop -->|Meets Criteria| MarkEligible[Tag: EXACT / STRONG / RELATED]
  EvalLoop -->|Violates Age/Degree| MarkIneligible[Tag: NOT_ELIGIBLE]
  
  MarkEligible --> ScoreMatches[Run Weighted Matchmaking Engine: Interests + Goals + Budget]
  MarkIneligible --> FilterOut[Exclude from Top Recommendations]
  
  ScoreMatches --> RenderRankings[Display Ranked Exam Recommendations Feed]
  RenderRankings --> UserAction{User Chooses Action}
  
  UserAction -->|View Exam Details| OpenSyllabus[Render Multi-Stage Syllabus Tree & Past Cutoffs]
  UserAction -->|Seek Advice| OpenChat[Converse with Gemini AI Career Advisor]
  UserAction -->|Upload PDF| RunRAG[Upload Official Notice for Contextual QA]
  UserAction -->|Track Roadmap| OpenRoadmap[Activate Structured Study Roadmap]
  
  OpenSyllabus --> SaveBookmark[Bookmark Exam]
  OpenChat --> SaveTips[Save AI Generated Study Strategy]
  RunRAG --> SaveNotes[Save Key Highlights]
  
  SaveBookmark & SaveTips & SaveNotes --> OpenRoadmap
  
  OpenRoadmap --> TrackTasks[Check Off Syllabus Topics as Completed]
  TrackTasks --> CheckProgress{Is 100% Milestones Complete?}
  
  CheckProgress -->|No| ContinueStudy[Receive Exam Date Reminders & Continue Milestones]
  ContinueStudy --> TrackTasks
  
  CheckProgress -->|Yes| ExamReady([Exam Preparation Complete: Ready to Apply Officially])"""
        },
        {
            "id": "arch-data-dictionary",
            "number": 34,
            "category": "System Design & Architecture",
            "badge": "DICT",
            "title": "34. Data Dictionary (Schema Specifications)",
            "purpose": "Structured reference dictionary cataloging all key system tables, primary keys, foreign key references, data types, nullability, default values, and business descriptions.",
            "actors": "users, student_profiles, user_education, exams, exam_dates, exam_eligibility_rules, exam_milestones, data_verification_queue.",
            "flow": "Presents structured metadata definitions for core platform tables ensuring full specification compliance.",
            "mermaid": """graph TD
  subgraph Data_Dictionary_Tables["UdanPath Core Data Entities"]
    subgraph Entity_Users["users (Supabase Auth)"]
      D_U1["id : UUID [PK] — Unique authentication identifier"]
      D_U2["email : VARCHAR(255) [NN, UQ] — User login email address"]
      D_U3["role : VARCHAR(50) — 'student', 'admin', or 'exam_coordinator'"]
      D_U4["created_at : TIMESTAMPTZ — Registration timestamp"]
    end

    subgraph Entity_Profiles["student_profiles"]
      D_P1["id : UUID [PK] — Profile primary key"]
      D_P2["user_id : UUID [FK -> users.id] — One-to-one user mapping"]
      D_P3["full_name : VARCHAR(255) [NN] — Student legal full name"]
      D_P4["dob : DATE [NN] — Date of birth for age limit evaluation"]
      D_P5["category : VARCHAR(50) [NN] — 'GENERAL', 'OBC', 'SC', 'ST', 'EWS'"]
      D_P6["state : VARCHAR(100) [NN] — Domicile state for state quotas"]
      D_P7["target_year : INT — Target examination year (e.g., 2026)"]
    end

    subgraph Entity_Exams["exams"]
      D_E1["id : UUID [PK] — Exam master primary key"]
      D_E2["title : VARCHAR(255) [NN] — Official examination title (e.g., 'GATE 2026')"]
      D_E3["slug : VARCHAR(255) [NN, UQ] — Clean URL identifier (e.g., 'gate-2026')"]
      D_E4["conducting_body : VARCHAR(255) — Organizing authority (e.g., 'IIT Guwahati')"]
      D_E5["exam_level : VARCHAR(50) — 'NATIONAL', 'STATE', 'UNIVERSITY'"]
    end

    subgraph Entity_Dates["exam_dates"]
      D_D1["id : UUID [PK] — Schedule primary key"]
      D_D2["exam_id : UUID [FK -> exams.id] — Related examination"]
      D_D3["notification_release_date : DATE — Official announcement date"]
      D_D4["application_start_date : DATE — Registration window opens"]
      D_D5["application_end_date : DATE — Final submission deadline"]
      D_D6["exam_start_date : DATE — Commencement of examination"]
      D_D7["verification_status : VARCHAR(50) — 'VERIFIED', 'PENDING_REVIEW'"]
    end

    subgraph Entity_Rules["exam_eligibility_rules"]
      D_R1["id : UUID [PK] — Rule identifier"]
      D_R2["exam_id : UUID [FK -> exams.id] — Governing examination"]
      D_R3["rule_type : VARCHAR(50) [NN] — 'AGE', 'EDUCATION', 'NATIONALITY'"]
      D_R4["condition_key : VARCHAR(100) — 'min_age', 'max_age', 'required_degree'"]
      D_R5["condition_value : TEXT — Evaluated criterion (e.g., '21', 'B.Tech')"]
      D_R6["is_mandatory : BOOLEAN — Strict qualification blocker flag"]
    end
  end"""
        },
        {
            "id": "arch-context",
            "number": 35,
            "category": "System Design & Architecture",
            "badge": "C4",
            "title": "35. C4 System Context Diagram",
            "purpose": "A C4 Model Level 1 System Context Diagram mapping software boundaries, human user personas, external enterprise systems, and communication protocols.",
            "actors": "Aspirant Student, Administrator, Exam Coordinator, UdanPath Software System, Supabase Cloud Platform, Google Gemini AI, Official Government Exam Portals.",
            "flow": "Users interact with UdanPath via HTTPS web browsers. UdanPath integrates with Supabase via PostgREST/PgBouncer, Gemini via REST gRPC, and Official Portals via HTTP Scraping.",
            "mermaid": """graph TD
  StudentUser["Person: Student Aspirant<br/>Engineering & civil service aspirants seeking exam guidance"]
  AdminUser["Person: System Administrator<br/>Audits scraped updates and maintains master tables"]
  CoordUser["Person: Exam Coordinator<br/>Curates syllabus, PYQ questions, and study assets"]

  subgraph UdanPathBoundary["System Boundary: UdanPath Platform"]
    UdanPathSystem["Software System: UdanPath Web Platform<br/>Next.js 16 + FastAPI + Supabase<br/>Delivers personalized eligibility, match recommendations, roadmaps, and AI guidance"]
  end

  SupabaseSystem["External System: Supabase Cloud<br/>PostgreSQL 15, GoTrue Auth, MinIO S3 Storage<br/>Stores users, profiles, exams, and PDFs"]
  GeminiSystem["External System: Google Gemini AI<br/>Generative AI endpoints (Gemini 1.5/2.0)<br/>Synthesizes career guidance and answers PDF Q&A"]
  NICSystem["External System: Official Exam Portals<br/>UPSC, SSC, NTA, IIT GATE websites<br/>Authoritative source of dates, syllabus, and notices"]

  %% Interactions
  StudentUser -->|HTTPS: Explores exams, tracks roadmap, chats with AI| UdanPathSystem
  AdminUser -->|HTTPS: Reviews verification queue, configures rules| UdanPathSystem
  CoordUser -->|HTTPS: Curates syllabus hierarchy & PYQs| UdanPathSystem

  UdanPathSystem <-->|PostgreSQL Protocol & REST: Stores data & verifies auth| SupabaseSystem
  UdanPathSystem <-->|HTTPS REST / gRPC: Streams prompts and receives AI output| GeminiSystem
  UdanPathSystem -.->|HTTPS Scraping: Crawls official notification dates| NICSystem"""
        },
        {
            "id": "arch-bpmn",
            "number": 36,
            "category": "System Design & Architecture",
            "badge": "BPMN",
            "title": "36. Business Process Diagram (BPMN 2.0)",
            "purpose": "A formal BPMN 2.0 collaboration diagram showing swimlanes for Student Aspirant, UdanPath Automated Platform, and Official Examination Authority, highlighting events, tasks, and gateways.",
            "actors": "Pools/Swimlanes: Student Aspirant, UdanPath Platform, Official Exam Body.",
            "flow": "Exam body announces date -> Platform scrapes & verifies -> Alerts student -> Student reviews eligibility -> Enrolls in roadmap -> Completes syllabus tasks -> Applies on official portal -> Takes exam.",
            "mermaid": """graph TD
  subgraph Pool_Govt["Pool: Official Exam Authority (e.g., UPSC / IIT GATE)"]
    G_Start((Notice Announced)) --> G_Publish[Publish Notification PDF on Official Portal]
    G_Publish --> G_OpenReg[Open Registration Window]
    G_OpenReg --> G_Conduct[Conduct Examination]
  end

  subgraph Pool_UdanPath["Pool: UdanPath Automated Platform"]
    U_Scrape[Scraper Detects New Notice]
    U_Diff{Discrepancy Found?}
    U_Verify[Admin Reviews in Verification Queue]
    U_UpdateDB[Update Live exam_dates]
    U_Alert[Broadcast Notification to Saved Users]
    U_CalcElig[Calculate Dynamic Eligibility for Active Students]
    U_Roadmap[Generate Tiered Study Roadmap]
  end

  subgraph Pool_Student["Pool: Aspirant Student"]
    S_ReceiveAlert[Receive Push / In-App Notification]
    S_CheckElig[Review Eligibility Breakdown]
    S_Decision{Eligible?}
    S_FollowPlan[Follow Preparation Roadmap Daily]
    S_ApplyOfficial[Apply on Official Govt Portal]
    S_End((Exam Completed))
  end

  %% Inter-Pool Messages
  G_Publish -.->|Notice HTML| U_Scrape
  U_Scrape --> U_Diff
  U_Diff -->|Yes| U_Verify
  U_Diff -->|No| U_UpdateDB
  U_Verify --> U_UpdateDB
  U_UpdateDB --> U_Alert
  U_UpdateDB --> U_CalcElig

  U_Alert -.->|Instant Alert| S_ReceiveAlert
  S_ReceiveAlert --> S_CheckElig
  U_CalcElig -.->|Status EXACT/STRONG| S_CheckElig

  S_CheckElig --> S_Decision
  S_Decision -->|Yes| S_FollowPlan
  S_Decision -->|No| S_ExploreOther[Explore Alternative Recommended Exams]

  S_FollowPlan --> U_Roadmap
  U_Roadmap --> S_FollowPlan
  
  G_OpenReg -.->|Application Window Live| S_ApplyOfficial
  S_ApplyOfficial --> S_End
  G_Conduct -.->|Exam Day| S_End"""
        },
        {
            "id": "arch-ipo",
            "number": 37,
            "category": "System Design & Architecture",
            "badge": "IPO",
            "title": "37. Input–Process–Output (IPO) Diagram",
            "purpose": "A systematic Input-Process-Output breakdown for the 6 core functional subsystems: Academic Profiling, Eligibility Evaluation, AI Matchmaking, Live Scraping, Roadmap Tracking, and AI Advisor.",
            "actors": "Subsystems: Onboarding & Profile, Eligibility Engine, Matchmaking Engine, Scraper Pipeline, Roadmap Tracker, AI Career Advisor.",
            "flow": "Inputs -> Processing Algorithms & Rules -> Concrete Outputs and Deliverables.",
            "mermaid": """graph LR
  subgraph Module_1["1. Student Profiling"]
    I1["INPUT: 10th/12th, Degree, Branch, CGPA, DOB, Category, State"]
    P1["PROCESS: Foreign key resolution, schema validation, normalization"]
    O1["OUTPUT: student_profiles, user_education 3NF records"]
    I1 --> P1 --> O1
  end

  subgraph Module_2["2. Eligibility Engine"]
    I2["INPUT: Student DOB & Category, Degree ID, Exam Rules"]
    P2["PROCESS: Age relaxation (+3yr OBC, +5yr SC/ST), Branch hierarchy match"]
    O2["OUTPUT: Eligibility Status (EXACT/STRONG/RELATED/NOT_ELIGIBLE)"]
    I2 --> P2 --> O2
  end

  subgraph Module_3["3. AI Matchmaking"]
    I3["INPUT: Eligible exams, Career goals, Interests, Budget"]
    P3["PROCESS: Weighted scoring formula: W_elig(50) + W_int(15) + W_goal(10)"]
    O3["OUTPUT: Ranked Recommended Exams (Score 0-100)"]
    I3 --> P3 --> O3
  end

  subgraph Module_4["4. Live Scraper"]
    I4["INPUT: Target portal URLs (UPSC, SSC, NTA)"]
    P4["PROCESS: HTML DOM traversal, regex date parsing, change detection"]
    O4["OUTPUT: data_verification_queue items or live date commits"]
    I4 --> P4 --> O4
  end

  subgraph Module_5["5. Roadmap Tracker"]
    I5["INPUT: Enrolled exam, Target year, Topic completion clicks"]
    P5["PROCESS: Phase grouping (Foundation/Core/Revision), % calculation"]
    O5["OUTPUT: Interactive milestone cards, % completion metric"]
    I5 --> P5 --> O5
  end

  subgraph Module_6["6. Gemini AI Advisor"]
    I6["INPUT: User chat message, Profile context, Exam syllabus"]
    P6["PROCESS: Prompt synthesis, Gemini 1.5/2.0 inference, SSE streaming"]
    O6["OUTPUT: Grounded career advice, structured study strategies"]
    I6 --> P6 --> O6
  end"""
        },
        {
            "id": "arch-crud-matrix",
            "number": 38,
            "category": "System Design & Architecture",
            "badge": "CRUD",
            "title": "38. CRUD Matrix (Actors vs Database Entities)",
            "purpose": "A complete CRUD matrix cross-referencing all 5 system actors and subsystems against all 14 core database entities with Create (C), Read (R), Update (U), and Delete (D) permissions.",
            "actors": "Actors: Student User, System Admin, Exam Coordinator, Live Scraper Worker, Gemini AI Engine.",
            "flow": "Specifies database access control and row-level permissions across all system modules.",
            "mermaid": """graph TD
  subgraph CRUD_Operations["Actors to Entities Access Matrix"]
    Actor_Student["Actor: Student"]
    Actor_Admin["Actor: System Admin"]
    Actor_Coord["Actor: Exam Coordinator"]
    Actor_Scraper["Worker: Live Scraper"]
    Actor_AI["Service: Gemini AI"]

    Entity_Profile["student_profiles"]
    Entity_Exams["exams & exam_dates"]
    Entity_Rules["exam_eligibility_rules"]
    Entity_Syllabus["exam_papers / topics"]
    Entity_Bookmarks["user_bookmarks"]
    Entity_Queue["data_verification_queue"]
    Entity_Logs["ai_interaction_logs"]

    Actor_Student -- "CRUD: Own Profile" --> Entity_Profile
    Actor_Student -- "R: Read Only" --> Entity_Exams
    Actor_Student -- "R: Read Only" --> Entity_Rules
    Actor_Student -- "R: Read Only" --> Entity_Syllabus
    Actor_Student -- "CRUD: Own Bookmarks" --> Entity_Bookmarks
    Actor_Student -- "CR: Insert/Read Own Chat" --> Entity_Logs

    Actor_Admin -- "R: Read All Profiles" --> Entity_Profile
    Actor_Admin -- "CRUD: Full Exam Master" --> Entity_Exams
    Actor_Admin -- "CRUD: Configure Rules" --> Entity_Rules
    Actor_Admin -- "CRUD: Approve/Reject" --> Entity_Queue

    Actor_Coord -- "RU: Curate Syllabus" --> Entity_Syllabus
    Actor_Coord -- "R: Read Exam Master" --> Entity_Exams

    Actor_Scraper -- "R: Read Target Sources" --> Entity_Exams
    Actor_Scraper -- "CR: Propose Date Diffs" --> Entity_Queue

    Actor_AI -- "R: Read Profile & Rules" --> Entity_Profile
    Actor_AI -- "R: Read Syllabus Context" --> Entity_Syllabus
    Actor_AI -- "C: Write Response Tokens" --> Entity_Logs
  end"""
        },
        {
            "id": "arch-rtm",
            "number": 39,
            "category": "System Design & Architecture",
            "badge": "RTM",
            "title": "39. Requirement Traceability Matrix (RTM)",
            "purpose": "A comprehensive bidirectional traceability matrix mapping Functional Requirements (FR-01 to FR-10) and Non-Functional Requirements (NFR-01 to NFR-05) to Use Cases, Code Modules, Database Tables, and Verification Test Cases.",
            "actors": "Functional Requirements: FR-01 (Auth), FR-02 (Profiles), FR-03 (Discovery), FR-04 (Eligibility), FR-05 (Recommendations), FR-06 (Roadmaps), FR-07 (Live Scraper), FR-08 (AI Chat), FR-09 (PDF RAG), FR-10 (Verification).",
            "flow": "Ensures every software requirement is traceable from user needs to implementation code, database schema, and test suite verification.",
            "mermaid": """graph TD
  subgraph Requirements["Functional & Non-Functional Requirements"]
    REQ_FR01["FR-01: Secure Student & Admin Authentication"]
    REQ_FR02["FR-02: Comprehensive Academic Profile Onboarding"]
    REQ_FR03["FR-03: Exam Catalog Search, Filters & Detail Views"]
    REQ_FR04["FR-04: Dynamic Eligibility Evaluation with Age Relaxation"]
    REQ_FR05["FR-05: AI Recommendation Scoring & Ranking"]
    REQ_FR06["FR-06: Interactive Syllabus Roadmaps & Task Checklists"]
    REQ_FR07["FR-07: Live Exam Date Scraping & Change Detection"]
    REQ_FR08["FR-08: Gemini AI Career Advisory Chatbot"]
    REQ_FR09["FR-09: Syllabus PDF Document RAG Analysis"]
    REQ_FR10["FR-10: Admin Verification Queue for Date Discrepancies"]
  end

  subgraph Implementation["Code Implementation Modules"]
    MOD_Auth["lib/supabaseClient.ts, app/auth/*"]
    MOD_Profile["app/onboarding/*, lib/dbService.ts"]
    MOD_Catalog["app/(portal)/student/exams/*, lib/examsData.ts"]
    MOD_Elig["lib/eligibilityEngine.ts"]
    MOD_Match["lib/matchmakingEngine.ts"]
    MOD_Roadmap["app/(portal)/student/roadmaps/*"]
    MOD_Scraper["backend/app/scrapers/*"]
    MOD_AI["app/api/v1/ai/chat/*, lib/geminiClient.ts"]
    MOD_Verify["lib/verificationEngine.ts, app/(portal)/admin/*"]
  end

  subgraph Database_Schema["Database Tables"]
    DB_Users["users, student_profiles, user_preferences"]
    DB_Exams["exams, exam_dates, exam_papers, exam_topics"]
    DB_Rules["exam_eligibility_rules"]
    DB_Milestones["exam_milestones, user_study_progress"]
    DB_Queue["data_verification_queue, data_change_logs"]
    DB_Logs["ai_interaction_logs"]
  end

  subgraph Verification_Tests["Validation Test Cases"]
    TEST_01["TC-01: Auth Session & Role Gate Test"]
    TEST_02["TC-02: Age Relaxation & Degree Match Unit Test"]
    TEST_03["TC-03: Recommendation Weight Scoring Test"]
    TEST_04["TC-04: Scraper Diff Detection & Queue Test"]
    TEST_05["TC-05: Gemini Streaming & Token Limit Test"]
  end

  %% Traceability Links
  REQ_FR01 --> MOD_Auth --> DB_Users --> TEST_01
  REQ_FR02 --> MOD_Profile --> DB_Users --> TEST_01
  REQ_FR03 --> MOD_Catalog --> DB_Exams --> TEST_02
  REQ_FR04 --> MOD_Elig --> DB_Rules --> TEST_02
  REQ_FR05 --> MOD_Match --> DB_Exams --> TEST_03
  REQ_FR06 --> MOD_Roadmap --> DB_Milestones --> TEST_03
  REQ_FR07 --> MOD_Scraper --> DB_Queue --> TEST_04
  REQ_FR08 --> MOD_AI --> DB_Logs --> TEST_05
  REQ_FR09 --> MOD_AI --> DB_Logs --> TEST_05
  REQ_FR10 --> MOD_Verify --> DB_Queue --> TEST_04"""
        }
    ]
    return diagrams

def build_markdown_document(diagrams):
    lines = [
        "# UDANPATH — COMPLETE SYSTEM ANALYSIS & DESIGN DIAGRAM SUITE",
        "",
        "This document contains the authoritative, complete set of **39 software engineering and system architecture diagrams** for **UdanPath** (The Ultimate AI-Powered Exam Navigation & Career Architecture Platform for India).",
        "",
        "Every diagram reflects the actual production architecture, Next.js 16 App Router structure, Supabase PostgreSQL schema, Google Gemini AI integration, and live date scraping services of the UdanPath repository.",
        "",
        "---",
        "",
        "## TABLE OF CONTENTS",
        "",
        "### Section 1: UML Diagrams",
        "1. [1. UML Use Case Diagram](#1-uml-use-case-diagram)",
        "2. [2. UML Class Diagram](#2-uml-class-diagram)",
        "3. [3. UML Activity Diagram](#3-uml-activity-diagram)",
        "4. [4. UML Sequence Diagram](#4-uml-sequence-diagram)",
        "5. [5. UML Communication Diagram](#5-uml-communication-diagram)",
        "6. [6. UML State Machine Diagram](#6-uml-state-machine-diagram)",
        "7. [7. UML Component Diagram](#7-uml-component-diagram)",
        "8. [8. UML Deployment Diagram](#8-uml-deployment-diagram)",
        "9. [9. UML Object Diagram](#9-uml-object-diagram)",
        "10. [10. UML Package Diagram](#10-uml-package-diagram)",
        "11. [11. UML Composite Structure Diagram](#11-uml-composite-structure-diagram)",
        "12. [12. UML Timing Diagram](#12-uml-timing-diagram)",
        "13. [13. UML Interaction Overview Diagram](#13-uml-interaction-overview-diagram)",
        "",
        "### Section 2: Data Flow Diagrams (DFD)",
        "14. [14. DFD Level 0 — Context Diagram](#14-dfd-level-0--context-diagram)",
        "15. [15. DFD Level 1 — System Decomposition](#15-dfd-level-1--system-decomposition)",
        "16. [16. DFD Level 2 — Process 1.0 (Auth & Session Management)](#16-dfd-level-2--process-10-auth--session-management)",
        "17. [17. DFD Level 2 — Process 2.0 (Student Profile & Preferences)](#17-dfd-level-2--process-20-student-profile--preferences)",
        "18. [18. DFD Level 2 — Process 3.0 (Exam Discovery & Catalog)](#18-dfd-level-2--process-30-exam-discovery--catalog)",
        "19. [19. DFD Level 2 — Process 4.0 (Dynamic Eligibility Engine)](#19-dfd-level-2--process-40-dynamic-eligibility-engine)",
        "20. [20. DFD Level 2 — Process 5.0 (Recommendation Engine)](#20-dfd-level-2--process-50-recommendation-engine)",
        "21. [21. DFD Level 2 — Process 6.0 (Live Scraper & Exam Data)](#21-dfd-level-2--process-60-live-scraper--exam-data)",
        "22. [22. DFD Level 2 — Process 7.0 (Study Resources & PYQs Hub)](#22-dfd-level-2--process-70-study-resources--pyqs-hub)",
        "23. [23. DFD Level 2 — Process 8.0 (Roadmap & Milestone Tracking)](#23-dfd-level-2--process-80-roadmap--milestone-tracking)",
        "24. [24. DFD Level 2 — Process 9.0 (AI Career Advisor)](#24-dfd-level-2--process-90-ai-career-advisor)",
        "25. [25. DFD Level 2 — Process 10.0 (PDF/RAG Processing)](#25-dfd-level-2--process-100-pdfrag-processing)",
        "",
        "### Section 3: Database Models & Schema",
        "26. [26. Entity Relationship Diagram (ERD)](#26-entity-relationship-diagram-erd)",
        "27. [27. Conceptual Data Model](#27-conceptual-data-model)",
        "28. [28. Logical Data Model (LDM)](#28-logical-data-model-ldm)",
        "29. [29. Physical Data Model (PDM)](#29-physical-data-model-pdm)",
        "30. [30. Database Schema Diagram](#30-database-schema-diagram)",
        "31. [31. Relational Table Diagram (PK/FK Constraints)](#31-relational-table-diagram-pkfk-constraints)",
        "",
        "### Section 4: System Design, Architecture & Matrices",
        "32. [32. System Architecture Diagram](#32-system-architecture-diagram)",
        "33. [33. End-to-End System Flowchart](#33-end-to-end-system-flowchart)",
        "34. [34. Data Dictionary (Schema Specifications)](#34-data-dictionary-schema-specifications)",
        "35. [35. C4 System Context Diagram](#35-c4-system-context-diagram)",
        "36. [36. Business Process Diagram (BPMN 2.0)](#36-business-process-diagram-bpmn-20)",
        "37. [37. Input–Process–Output (IPO) Diagram](#37-inputprocessoutput-ipo-diagram)",
        "38. [38. CRUD Matrix (Actors vs Database Entities)](#38-crud-matrix-actors-vs-database-entities)",
        "39. [39. Requirement Traceability Matrix (RTM)](#39-requirement-traceability-matrix-rtm)",
        "",
        "---",
        ""
    ]

    for diag in diagrams:
        lines.append(f"## {diag['title']}")
        lines.append(f"### Category: {diag['category']}")
        lines.append("### Purpose")
        lines.append(diag['purpose'])
        lines.append("")
        if diag.get('actors'):
            lines.append("### Actors & Components")
            lines.append(diag['actors'])
            lines.append("")
        if diag.get('flow'):
            lines.append("### Flow & Technical Relationships")
            lines.append(diag['flow'])
            lines.append("")
        lines.append("```mermaid")
        lines.append(diag['mermaid'].strip())
        lines.append("```")
        lines.append("")
        lines.append("---")
        lines.append("")

    return "\n".join(lines)

def build_standalone_html(diagrams):
    diagrams_json = json.dumps(diagrams, indent=2)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UdanPath — System Analysis & Design Diagram Generator</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
    <style>
        :root {{
            --bg-base: #070a13;
            --bg-surface: #0d121f;
            --bg-card: rgba(17, 24, 39, 0.75);
            --border-card: rgba(255, 255, 255, 0.08);
            --border-focus: rgba(59, 130, 246, 0.5);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-dim: #64748b;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --primary-glow: rgba(59, 130, 246, 0.2);
            --accent: #8b5cf6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --sidebar-w: 360px;
        }}

        [data-theme="light"] {{
            --bg-base: #f8fafc;
            --bg-surface: #ffffff;
            --bg-card: rgba(255, 255, 255, 0.9);
            --border-card: rgba(0, 0, 0, 0.1);
            --border-focus: rgba(59, 130, 246, 0.6);
            --text-main: #0f172a;
            --text-muted: #475569;
            --text-dim: #64748b;
            --primary: #2563eb;
            --primary-hover: #1d4ed8;
            --primary-glow: rgba(37, 99, 235, 0.15);
            --accent: #7c3aed;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-base);
            color: var(--text-main);
            height: 100vh;
            display: flex;
            overflow: hidden;
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.07) 0%, transparent 40%);
        }}

        /* Sidebar Styling */
        .sidebar {{
            width: var(--sidebar-w);
            background-color: var(--bg-surface);
            border-right: 1px solid var(--border-card);
            display: flex;
            flex-direction: column;
            height: 100%;
            flex-shrink: 0;
            z-index: 20;
            backdrop-filter: blur(16px);
        }}

        .brand-header {{
            padding: 22px 24px;
            border-bottom: 1px solid var(--border-card);
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%);
        }}

        .brand-header h1 {{
            font-size: 1.35rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #60a5fa 0%, #c084fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .brand-header p {{
            font-size: 0.72rem;
            color: var(--text-dim);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 4px;
            font-weight: 600;
        }}

        .search-box {{
            padding: 14px 18px;
            border-bottom: 1px solid var(--border-card);
        }}

        .search-input-wrap {{
            position: relative;
            display: flex;
            align-items: center;
        }}

        .search-input {{
            width: 100%;
            padding: 9px 14px 9px 36px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border-card);
            border-radius: 8px;
            color: var(--text-main);
            font-family: inherit;
            font-size: 0.85rem;
            outline: none;
            transition: all 0.2s;
        }}

        .search-input:focus {{
            border-color: var(--border-focus);
            box-shadow: 0 0 0 3px var(--primary-glow);
            background: rgba(255, 255, 255, 0.06);
        }}

        .search-icon {{
            position: absolute;
            left: 12px;
            color: var(--text-dim);
            pointer-events: none;
            font-size: 0.85rem;
        }}

        .category-filter {{
            padding: 10px 18px;
            display: flex;
            gap: 6px;
            overflow-x: auto;
            border-bottom: 1px solid var(--border-card);
            scrollbar-width: none;
        }}

        .category-filter::-webkit-scrollbar {{
            display: none;
        }}

        .cat-chip {{
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 0.72rem;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border-card);
            color: var(--text-muted);
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
        }}

        .cat-chip:hover {{
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.08);
        }}

        .cat-chip.active {{
            background: var(--primary);
            color: #ffffff;
            border-color: var(--primary);
        }}

        .diagram-list {{
            list-style: none;
            overflow-y: auto;
            flex-grow: 1;
            padding: 12px 14px;
        }}

        .diagram-list::-webkit-scrollbar {{
            width: 5px;
        }}

        .diagram-list::-webkit-scrollbar-thumb {{
            background: rgba(255, 255, 255, 0.12);
            border-radius: 4px;
        }}

        .diagram-item {{
            padding: 10px 14px;
            margin-bottom: 6px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.86rem;
            color: var(--text-muted);
            border: 1px solid transparent;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }}

        .diagram-item:hover {{
            background: rgba(255, 255, 255, 0.04);
            color: var(--text-main);
        }}

        .diagram-item.active {{
            background: var(--primary-glow);
            color: #60a5fa;
            border-color: rgba(59, 130, 246, 0.4);
            font-weight: 600;
        }}

        .badge-chip {{
            font-size: 0.68rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.08);
            letter-spacing: 0.5px;
            min-width: 38px;
            text-align: center;
        }}

        .diagram-item.active .badge-chip {{
            background: var(--primary);
            color: #ffffff;
        }}

        .diagram-item-title {{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex-grow: 1;
        }}

        /* Main Viewport */
        .main-content {{
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            position: relative;
        }}

        .top-navbar {{
            padding: 16px 32px;
            border-bottom: 1px solid var(--border-card);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-card);
            backdrop-filter: blur(12px);
            z-index: 10;
        }}

        .active-diag-meta h2 {{
            font-size: 1.35rem;
            font-weight: 700;
            letter-spacing: -0.3px;
            display: flex;
            align-items: center;
            gap: 10px;
        }}

        .diag-category-badge {{
            font-size: 0.72rem;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 6px;
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
            text-transform: uppercase;
        }}

        .toolbar {{
            display: flex;
            align-items: center;
            gap: 10px;
        }}

        .view-toggle {{
            display: flex;
            background: rgba(255, 255, 255, 0.05);
            padding: 3px;
            border-radius: 8px;
            border: 1px solid var(--border-card);
        }}

        .toggle-btn {{
            padding: 6px 12px;
            border: none;
            background: none;
            color: var(--text-muted);
            font-family: inherit;
            font-size: 0.8rem;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .toggle-btn.active {{
            background: var(--primary);
            color: #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }}

        .action-btn {{
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 7px 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-card);
            border-radius: 8px;
            color: var(--text-main);
            font-family: inherit;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .action-btn:hover {{
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
        }}

        .action-btn.primary {{
            background: var(--primary);
            border-color: var(--primary);
            color: #ffffff;
        }}

        .action-btn.primary:hover {{
            background: var(--primary-hover);
        }}

        .theme-toggle {{
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-card);
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.2s;
        }}

        .theme-toggle:hover {{
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.1);
        }}

        /* Viewport Canvas */
        .workspace-body {{
            flex-grow: 1;
            padding: 24px 32px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }}

        /* Metadata Details Card */
        .meta-card {{
            background: var(--bg-card);
            border: 1px solid var(--border-card);
            border-radius: 12px;
            padding: 20px 24px;
            backdrop-filter: blur(12px);
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }}

        .meta-col h3 {{
            font-size: 0.82rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #60a5fa;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }}

        .meta-col p {{
            font-size: 0.86rem;
            color: var(--text-muted);
            line-height: 1.55;
        }}

        .meta-col ul {{
            padding-left: 18px;
            font-size: 0.84rem;
            color: var(--text-muted);
            line-height: 1.5;
        }}

        .meta-col li {{
            margin-bottom: 4px;
        }}

        /* Diagram Canvas Area */
        .canvas-container {{
            flex-grow: 1;
            min-height: 540px;
            background: #090d16;
            border: 1px solid var(--border-card);
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5);
        }}

        [data-theme="light"] .canvas-container {{
            background: #f1f5f9;
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
        }}

        /* Canvas Floating Controls */
        .canvas-controls {{
            position: absolute;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 8px;
            background: rgba(15, 23, 42, 0.85);
            padding: 6px;
            border-radius: 8px;
            border: 1px solid var(--border-card);
            backdrop-filter: blur(8px);
            z-index: 5;
        }}

        .ctrl-btn {{
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 6px;
            color: var(--text-main);
            font-size: 1rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .ctrl-btn:hover {{
            background: var(--primary);
        }}

        /* Source Code Container */
        .source-container {{
            display: none;
            flex-grow: 1;
            background: #07090e;
            border: 1px solid var(--border-card);
            border-radius: 12px;
            padding: 20px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            color: #34d399;
            overflow: auto;
            position: relative;
            white-space: pre;
            line-height: 1.5;
        }}

        .copy-code-btn {{
            position: absolute;
            top: 16px;
            right: 16px;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid var(--border-card);
            border-radius: 6px;
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .copy-code-btn:hover {{
            background: var(--primary);
            border-color: var(--primary);
        }}

        /* Loading Spinner */
        .spinner {{
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            width: 44px;
            height: 44px;
            animation: spin 0.8s linear infinite;
            display: none;
            position: absolute;
        }}

        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}

        /* Print Media Styling */
        @media print {{
            body {{
                background: white !important;
                color: black !important;
                height: auto !important;
                overflow: visible !important;
                display: block !important;
            }}
            .sidebar, .top-navbar, .canvas-controls, .copy-code-btn, .theme-toggle, .view-toggle, .action-btn {{
                display: none !important;
            }}
            .main-content {{
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
            }}
            .workspace-body {{
                padding: 0 !important;
            }}
            .canvas-container {{
                background: white !important;
                border: 1px solid #ccc !important;
                min-height: 800px !important;
                box-shadow: none !important;
                page-break-inside: avoid;
            }}
            .meta-card {{
                background: #f8fafc !important;
                border: 1px solid #ccc !important;
                color: black !important;
                box-shadow: none !important;
                margin-bottom: 20px !important;
            }}
            .meta-col h3 {{
                color: #1e3a8a !important;
            }}
            .meta-col p, .meta-col li {{
                color: #333 !important;
            }}
        }}
    </style>
</head>
<body data-theme="dark">

    <!-- Sidebar Navigation -->
    <aside class="sidebar">
        <div class="brand-header">
            <h1>
                <span>🧭</span> UdanPath Studio
            </h1>
            <p>System Analysis & Design Portal</p>
        </div>

        <div class="search-box">
            <div class="search-input-wrap">
                <span class="search-icon">🔍</span>
                <input type="text" id="search-input" class="search-input" placeholder="Search 39 diagrams...">
            </div>
        </div>

        <div class="category-filter" id="category-filter">
            <button class="cat-chip active" data-cat="ALL">All (39)</button>
            <button class="cat-chip" data-cat="UML Diagrams">UML (13)</button>
            <button class="cat-chip" data-cat="Data Flow Diagrams (DFD)">DFD (12)</button>
            <button class="cat-chip" data-cat="Database Models">Database (6)</button>
            <button class="cat-chip" data-cat="System Design & Architecture">System Design (8)</button>
        </div>

        <ul class="diagram-list" id="diagram-list">
            <!-- Populated via Javascript -->
        </ul>
    </aside>

    <!-- Main Workspace -->
    <main class="main-content">
        <header class="top-navbar">
            <div class="active-diag-meta">
                <h2 id="view-title">
                    <span id="title-text">1. UML Use Case Diagram</span>
                    <span id="category-badge" class="diag-category-badge">UML</span>
                </h2>
            </div>

            <div class="toolbar">
                <div class="view-toggle">
                    <button class="toggle-btn active" id="btn-view-visual">Visual Diagram</button>
                    <button class="toggle-btn" id="btn-view-source">Mermaid Source</button>
                </div>

                <button class="action-btn" id="btn-export-svg" title="Download standalone vector SVG">
                    📥 SVG
                </button>
                <button class="action-btn" id="btn-export-png" title="Download high-resolution PNG">
                    🖼️ PNG
                </button>
                <button class="action-btn" id="btn-export-pdf" title="Export printable PDF">
                    📄 PDF
                </button>
                <button class="action-btn" id="btn-print" title="Print Diagram">
                    🖨️ Print
                </button>

                <button class="theme-toggle" id="btn-theme-toggle" title="Toggle Dark/Light Mode">
                    🌙
                </button>
            </div>
        </header>

        <section class="workspace-body">
            <!-- Meta Specs Card -->
            <div class="meta-card">
                <div class="meta-col">
                    <h3>🎯 Purpose & Scope</h3>
                    <p id="meta-purpose">Loading...</p>
                </div>
                <div class="meta-col" id="col-actors">
                    <h3>👥 Actors & Components</h3>
                    <div id="meta-actors">Loading...</div>
                </div>
                <div class="meta-col" id="col-flow">
                    <h3>⚡ Technical Flow & Relationships</h3>
                    <div id="meta-flow">Loading...</div>
                </div>
            </div>

            <!-- Visual Diagram Viewport -->
            <div class="canvas-container" id="canvas-container">
                <div class="spinner" id="canvas-loader"></div>
                <div id="diagram-render" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>

                <div class="canvas-controls">
                    <button class="ctrl-btn" id="ctrl-zoom-in" title="Zoom In">+</button>
                    <button class="ctrl-btn" id="ctrl-zoom-out" title="Zoom Out">−</button>
                    <button class="ctrl-btn" id="ctrl-reset" title="Reset View">⟲</button>
                    <button class="ctrl-btn" id="ctrl-fullscreen" title="Fullscreen">⛶</button>
                </div>
            </div>

            <!-- Source Code Viewport -->
            <div class="source-container" id="source-container">
                <button class="copy-code-btn" id="btn-copy-code">Copy Mermaid Code</button>
                <code id="source-code-content"></code>
            </div>
        </section>
    </main>

    <!-- Load Mermaid.js ESM -->
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

        // Complete Injected Diagrams Database
        const DIAGRAMS_DB = {diagrams_json};

        let activeIdx = 0;
        let activeTab = 'visual'; // 'visual' | 'source'
        let currentFilter = 'ALL';
        let searchQuery = '';
        let panZoomInstance = null;

        // Initialize Mermaid
        mermaid.initialize({{
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Outfit, sans-serif',
            flowchart: {{
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }},
            sequence: {{
                useMaxWidth: true,
                showSequenceNumbers: true
            }},
            er: {{
                useMaxWidth: true,
                fontSize: 12
            }},
            class: {{
                useMaxWidth: true
            }}
        }});

        window.mermaid = mermaid;

        // DOM Elements
        const listContainer = document.getElementById('diagram-list');
        const searchInput = document.getElementById('search-input');
        const categoryFilterContainer = document.getElementById('category-filter');
        const titleText = document.getElementById('title-text');
        const categoryBadge = document.getElementById('category-badge');
        const metaPurpose = document.getElementById('meta-purpose');
        const metaActors = document.getElementById('meta-actors');
        const metaFlow = document.getElementById('meta-flow');
        const diagramRender = document.getElementById('diagram-render');
        const canvasLoader = document.getElementById('canvas-loader');
        const sourceCodeContent = document.getElementById('source-code-content');
        const canvasContainer = document.getElementById('canvas-container');
        const sourceContainer = document.getElementById('source-container');
        const btnViewVisual = document.getElementById('btn-view-visual');
        const btnViewSource = document.getElementById('btn-view-source');
        const btnCopyCode = document.getElementById('btn-copy-code');
        const btnExportSvg = document.getElementById('btn-export-svg');
        const btnExportPng = document.getElementById('btn-export-png');
        const btnExportPdf = document.getElementById('btn-export-pdf');
        const btnPrint = document.getElementById('btn-print');
        const btnThemeToggle = document.getElementById('btn-theme-toggle');

        // Format bullets helper
        function formatBullets(text) {{
            if (!text) return '<p>N/A</p>';
            let lines = text.split('\\n');
            let html = '';
            let inList = false;

            for (let line of lines) {{
                line = line.trim();
                if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {{
                    if (!inList) {{
                        html += '<ul>';
                        inList = true;
                    }}
                    let itemText = line.replace(/^[•\\-*]\\s*/, '');
                    itemText = itemText.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                    html += `<li>${{itemText}}</li>`;
                }} else if (line) {{
                    if (inList) {{
                        html += '</ul>';
                        inList = false;
                    }}
                    let pText = line.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                    html += `<p style="margin-bottom:6px;">${{pText}}</p>`;
                }}
            }}
            if (inList) html += '</ul>';
            return html || '<p>N/A</p>';
        }}

        // Populate Sidebar
        function renderSidebar() {{
            listContainer.innerHTML = '';
            const filtered = DIAGRAMS_DB.filter((diag, index) => {{
                const matchesCat = (currentFilter === 'ALL' || diag.category === currentFilter);
                const matchesQuery = (!searchQuery || 
                    diag.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    diag.purpose.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return matchesCat && matchesQuery;
            }});

            if (filtered.length === 0) {{
                listContainer.innerHTML = `<li style="padding:20px; text-align:center; color:var(--text-dim); font-size:0.85rem;">No matching diagrams found</li>`;
                return;
            }}

            filtered.forEach((diag) => {{
                const originalIndex = DIAGRAMS_DB.findIndex(d => d.id === diag.id);
                const li = document.createElement('li');
                li.className = `diagram-item ${{originalIndex === activeIdx ? 'active' : ''}}`;
                li.innerHTML = `
                    <span class="badge-chip">${{diag.badge || '#' + diag.number}}</span>
                    <span class="diagram-item-title">${{diag.title}}</span>
                `;
                li.addEventListener('click', () => switchDiagram(originalIndex));
                listContainer.appendChild(li);
            }});
        }}

        // Switch Active Diagram
        async function switchDiagram(idx) {{
            activeIdx = idx;
            const diag = DIAGRAMS_DB[idx];

            titleText.textContent = diag.title;
            categoryBadge.textContent = diag.badge || diag.category;
            metaPurpose.textContent = diag.purpose || 'N/A';
            metaActors.innerHTML = formatBullets(diag.actors);
            metaFlow.innerHTML = formatBullets(diag.flow);
            sourceCodeContent.textContent = diag.mermaid;

            // Update active state in sidebar
            document.querySelectorAll('.diagram-item').forEach((item) => {{
                item.classList.remove('active');
            }});
            renderSidebar();

            // Render Mermaid Visual
            diagramRender.innerHTML = '';
            canvasLoader.style.display = 'block';

            if (panZoomInstance) {{
                panZoomInstance.destroy();
                panZoomInstance = null;
            }}

            try {{
                const uniqueId = `mermaid-${{diag.id}}-${{Date.now()}}`;
                const cleanCode = diag.mermaid.trim();
                const {{ svg }} = await window.mermaid.render(uniqueId, cleanCode);

                canvasLoader.style.display = 'none';
                diagramRender.innerHTML = svg;

                const svgElem = diagramRender.querySelector('svg');
                if (svgElem) {{
                    svgElem.setAttribute('width', '100%');
                    svgElem.setAttribute('height', '100%');
                    svgElem.style.maxWidth = 'none';
                    svgElem.style.maxHeight = 'none';
                    svgElem.style.width = '100%';
                    svgElem.style.height = '100%';

                    panZoomInstance = svgPanZoom(svgElem, {{
                        zoomEnabled: true,
                        controlIconsEnabled: false,
                        fit: true,
                        center: true,
                        minZoom: 0.05,
                        maxZoom: 20
                    }});
                }}
            }} catch (err) {{
                console.error("Mermaid Render Failure: ", err);
                canvasLoader.style.display = 'none';
                diagramRender.innerHTML = `
                    <div style="padding: 24px; text-align: center; color: #ef4444; border: 1px dashed rgba(239, 68, 68, 0.4); border-radius: 8px; background: rgba(239, 68, 68, 0.05);">
                        <p style="font-weight: 700; margin-bottom: 6px;">Rendering Error in ${{diag.title}}</p>
                        <p style="font-size: 0.82rem; font-family: monospace; opacity: 0.85;">${{err.message || err}}</p>
                    </div>
                `;
            }}
        }}

        // Switch View Tab (Visual vs Source)
        function switchTab(tab) {{
            activeTab = tab;
            if (tab === 'visual') {{
                btnViewVisual.classList.add('active');
                btnViewSource.classList.remove('active');
                canvasContainer.style.display = 'flex';
                sourceContainer.style.display = 'none';
            }} else {{
                btnViewVisual.classList.remove('active');
                btnViewSource.classList.add('active');
                canvasContainer.style.display = 'none';
                sourceContainer.style.display = 'block';
            }}
        }}

        // Export as SVG
        function exportSvg() {{
            const svgElem = diagramRender.querySelector('svg');
            if (!svgElem) return alert('No diagram rendered to export.');
            
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgElem);
            if (!source.match(/^<svg[^>]+xmlns="http\\:\\/\\/www\\.w3\\.org\\/2000\\/svg"/)) {{
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }}
            
            const blob = new Blob([source], {{ type: 'image/svg+xml;charset=utf-8' }});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${{DIAGRAMS_DB[activeIdx].id}}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }}

        // Export as PNG
        function exportPng() {{
            const svgElem = diagramRender.querySelector('svg');
            if (!svgElem) return alert('No diagram rendered to export.');

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElem);
            const svgBlob = new Blob([svgString], {{ type: 'image/svg+xml;charset=utf-8' }});
            const URLObj = window.URL || window.webkitURL || window;
            const blobURL = URLObj.createObjectURL(svgBlob);

            const image = new Image();
            image.onload = () => {{
                const bbox = svgElem.getBBox();
                const canvas = document.createElement('canvas');
                const scale = 2; // High-DPI scale
                canvas.width = Math.max(bbox.width * scale, 1200);
                canvas.height = Math.max(bbox.height * scale, 800);
                const ctx = canvas.getContext('2d');

                // Fill background
                const isDark = document.body.getAttribute('data-theme') !== 'light';
                ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                const pngURL = canvas.toDataURL('image/png');

                const a = document.createElement('a');
                a.href = pngURL;
                a.download = `${{DIAGRAMS_DB[activeIdx].id}}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URLObj.revokeObjectURL(blobURL);
            }};
            image.src = blobURL;
        }}

        // Export as PDF
        function exportPdf() {{
            const svgElem = diagramRender.querySelector('svg');
            if (!svgElem) return alert('No diagram rendered to export.');

            const {{ jsPDF }} = window.jspdf;
            const doc = new jsPDF({{
                orientation: 'landscape',
                unit: 'pt',
                format: 'a4'
            }});

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElem);
            const svgBlob = new Blob([svgString], {{ type: 'image/svg+xml;charset=utf-8' }});
            const blobURL = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {{
                const canvas = document.createElement('canvas');
                canvas.width = img.width * 2;
                canvas.height = img.height * 2;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataURL = canvas.toDataURL('image/png');

                // A4 landscape dimensions: 842 x 595 pt
                doc.setFontSize(14);
                doc.text(DIAGRAMS_DB[activeIdx].title, 40, 40);
                doc.setFontSize(9);
                doc.text("Project: UdanPath — Architecture & Engineering Specification", 40, 56);

                doc.addImage(dataURL, 'PNG', 40, 70, 762, 480);
                doc.save(`${{DIAGRAMS_DB[activeIdx].id}}.pdf`);
                URL.revokeObjectURL(blobURL);
            }};
            img.src = blobURL;
        }}

        // Canvas Zoom Controls
        document.getElementById('ctrl-zoom-in').addEventListener('click', () => {{
            if (panZoomInstance) panZoomInstance.zoomIn();
        }});

        document.getElementById('ctrl-zoom-out').addEventListener('click', () => {{
            if (panZoomInstance) panZoomInstance.zoomOut();
        }});

        document.getElementById('ctrl-reset').addEventListener('click', () => {{
            if (panZoomInstance) {{
                panZoomInstance.reset();
                panZoomInstance.fit();
                panZoomInstance.center();
            }}
        }});

        document.getElementById('ctrl-fullscreen').addEventListener('click', () => {{
            if (!document.fullscreenElement) {{
                canvasContainer.requestFullscreen().catch(err => alert(err.message));
            }} else {{
                document.exitFullscreen();
            }}
        }});

        // Copy Mermaid Code
        btnCopyCode.addEventListener('click', () => {{
            navigator.clipboard.writeText(DIAGRAMS_DB[activeIdx].mermaid);
            btnCopyCode.textContent = '✓ Copied!';
            setTimeout(() => {{
                btnCopyCode.textContent = 'Copy Mermaid Code';
            }}, 2000);
        }});

        // Tab events
        btnViewVisual.addEventListener('click', () => switchTab('visual'));
        btnViewSource.addEventListener('click', () => switchTab('source'));

        // Export & Print events
        btnExportSvg.addEventListener('click', exportSvg);
        btnExportPng.addEventListener('click', exportPng);
        btnExportPdf.addEventListener('click', exportPdf);
        btnPrint.addEventListener('click', () => window.print());

        // Theme Toggle
        btnThemeToggle.addEventListener('click', () => {{
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', newTheme);
            btnThemeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
            
            // Re-render Mermaid with updated theme
            window.mermaid.initialize({{
                startOnLoad: false,
                theme: newTheme === 'light' ? 'neutral' : 'dark'
            }});
            switchDiagram(activeIdx);
        }});

        // Category Filter Chips
        categoryFilterContainer.querySelectorAll('.cat-chip').forEach(chip => {{
            chip.addEventListener('click', () => {{
                categoryFilterContainer.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentFilter = chip.getAttribute('data-cat');
                renderSidebar();
            }});
        }});

        // Search Input
        searchInput.addEventListener('input', (e) => {{
            searchQuery = e.target.value.trim();
            renderSidebar();
        }});

        // Initial Start
        renderSidebar();
        switchDiagram(0);
    </script>
</body>
</html>
"""
    return html

def main():
    root = "d:\\MINOR-PROJECT_84"
    md_output = os.path.join(root, "docs", "system_diagrams.md")
    html_docs_output = os.path.join(root, "docs", "view_diagrams.html")
    html_public_output = os.path.join(root, "public", "system-design", "index.html")

    diagrams = get_diagrams_data()
    import sys
    sys.stdout.reconfigure(encoding='utf-8')

    print(f"Total diagrams prepared: {len(diagrams)}")

    # 1. Generate docs/system_diagrams.md
    print(f"Writing Markdown documentation to {md_output}...")
    md_content = build_markdown_document(diagrams)
    with open(md_output, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"SUCCESS: Created {md_output} ({len(md_content)} bytes)")

    # 2. Generate standalone HTML Viewer
    print("Generating HTML viewer template...")
    html_content = build_standalone_html(diagrams)

    with open(html_docs_output, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"SUCCESS: Created {html_docs_output} ({len(html_content)} bytes)")

    with open(html_public_output, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"SUCCESS: Created {html_public_output} ({len(html_content)} bytes)")

    print("Success! System Analysis & Design Diagram Generator compiled successfully.")

if __name__ == "__main__":
    main()
