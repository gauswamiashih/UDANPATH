# UDANPATH — COMPLETE SYSTEM DIAGRAM SET (UML, DFD & SYSTEM ARCHITECTURE)

This document contains the complete set of system diagrams for **UdanPath** (The Ultimate AI-Powered Exam Navigation Platform for India). The diagrams reflect the actual codebase structure, database tables, and API services of the UdanPath system.

---

## TABLE OF CONTENTS
1. [System Context Diagram](#1-system-context-diagram)
2. [Use Case Diagram](#2-use-case-diagram)
3. [Use Case Relationships](#3-use-case-relationships)
4. [DFD Level 0 (Context-Level DFD)](#4-dfd-level-0-context-level-dfd)
5. [DFD Level 1 (System Decomposition)](#5-dfd-level-1-system-decomposition)
6. [DFD Level 2 — Exam Discovery](#6-dfd-level-2-exam-discovery)
7. [DFD Level 2 — Eligibility Engine](#7-dfd-level-2-eligibility-engine)
8. [DFD Level 2 — Recommendation Engine](#8-dfd-level-2-recommendation-engine)
9. [DFD Level 2 — AI Advisor](#9-dfd-level-2-ai-advisor)
10. [DFD Level 2 — PDF/RAG Processing](#10-dfd-level-2-pdfrag-processing)
11. [DFD Level 2 — Live Exam Data Management](#11-dfd-level-2-live-exam-data-management)
12. [Activity Diagram — Complete Student Journey](#12-activity-diagram-complete-student-journey)
13. [Activity Diagram — Exam Recommendation](#13-activity-diagram-exam-recommendation)
14. [Activity Diagram — AI Advisor](#14-activity-diagram-ai-advisor)
15. [Activity Diagram — PDF/RAG](#15-activity-diagram-pdfrag)
16. [Sequence Diagram — Login](#16-sequence-diagram-login)
17. [Sequence Diagram — Profile & Recommendation](#17-sequence-diagram-profile-recommendation)
18. [Sequence Diagram — Exam Discovery](#18-sequence-diagram-exam-discovery)
19. [Sequence Diagram — AI Advisor](#19-sequence-diagram-ai-advisor)
20. [Sequence Diagram — PDF/RAG](#20-sequence-diagram-pdfrag)
21. [Sequence Diagram — Live Exam Data Update](#21-sequence-diagram-live-exam-data-update)
22. [Sequence Diagram — Notification](#22-sequence-diagram-notification)
23. [Class Diagram](#23-class-diagram)
24. [ER Diagram / Database Relationship Diagram](#24-er-diagram-database-relationship-diagram)
25. [Component Diagram](#25-component-diagram)
26. [Deployment Diagram](#26-deployment-diagram)
27. [Admin Workflow Diagram](#27-admin-workflow-diagram)
28. [Data Flow for Real Exam Data](#28-data-flow-for-real-exam-data)

---

## 1. System Context Diagram
### Purpose
Establishes the boundary of the UdanPath system, showing how it serves as the central hub connecting students, administrators, authentication systems, databases, storage buckets, Google Gemini AI services, and external official examination portals.

### Actors & Components
*   **Student**: Interacts with the platform to discover exams, view recommendations, configure their profile, track progress, and converse with the AI Advisor.
*   **Admin**: Manages system databases, verifies scraped updates, and monitors system logs.
*   **Supabase (Auth/DB/Storage)**: Handles session management, storage of PDF/Syllabus files, and user/exam relational databases.
*   **Google Gemini AI**: Provides chat endpoints, personal advice synthesis, resume checks, and document RAG summaries.
*   **Official Exam Sources**: Web services like UPSC/SSC portals scraped by the system scheduler.

### Flow & Relationships
The student logs in through Supabase Auth, retrieves exam lists from Supabase DB, gets advice from Gemini, and uploads PDFs to Storage. The scheduler checks official portals, updating databases or queueing verification logs for Admin review.

```mermaid
graph TD
  Student[Student] <--> |Profile, Search, Chat, Milestones| UdanPath((UdanPath System))
  Admin[Admin] <--> |Approve Verification Queue, Logs| UdanPath
  UdanPath <--> |OAuth / JWT Session verification| SupabaseAuth[Supabase Auth]
  UdanPath <--> |Relational Profile & Exam Tables| SupabaseDB[(Supabase PostgreSQL)]
  UdanPath <--> |Upload & Download Study PDFs| SupabaseStorage[(Supabase Storage)]
  UdanPath <--> |Prompts, RAG context & Response streams| GeminiAI[Google Gemini AI]
  UdanPath -.-> |Scrapes exam calendars & notices| OfficialSources["Official Exam Portals (UPSC/SSC)"]
```

---

## 2. Use Case Diagram
### Purpose
Defines the functional requirements of the UdanPath platform from the perspective of its two main actors: the **Student** (end user) and the **Admin** (system operator).

```mermaid
graph LR
  subgraph UdanPath System Boundary
    %% Student Use Cases
    UC1([Register / Login])
    UC2([Google Auth Login])
    UC3([Complete Profile])
    UC4([Edit Profile & Preferences])
    UC5([Discover Exams])
    UC6([Search & Filter Exams])
    UC7([View Exam Details & Syllabus])
    UC8([Check Eligibility])
    UC9([View Recommended Exams])
    UC10([Apply via Official URL])
    UC11([Save Exams & Bookmarks])
    UC12([View Courses & Coaching])
    UC13([Access YT Videos & PYQs])
    UC14([Read Aspirant Experiences])
    UC15([Follow Prep Roadmap])
    UC16([Track Progress Milestones])
    UC17([Receive Dates Notifications])
    UC18([Use AI Advisor Chat])
    UC19([Upload PDF & Ask Questions])
    UC20([Get Personal Advice])
    
    %% Admin Use Cases
    UC21([Admin Secure Login])
    UC22([Manage Users & Profiles])
    UC23([Manage Exam Master Data])
    UC24([Manage Eligibility Rules])
    UC25([Review Scraped Date Changes])
    UC26([Approve / Reject verification queue])
    UC27([Manage Courses, Coaching & YT Links])
    UC28([Publish Aspirant Experiences])
    UC29([Manage Roadmaps])
    UC30([Broadcast Notifications])
    UC31([Monitor AI Usage Logs])
  end

  Student((Student)) --> UC1
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
  Student --> UC12
  Student --> UC13
  Student --> UC14
  Student --> UC15
  Student --> UC16
  Student --> UC17
  Student --> UC18
  Student --> UC19
  Student --> UC20

  Admin((Admin)) --> UC21
  Admin --> UC22
  Admin --> UC23
  Admin --> UC24
  Admin --> UC25
  Admin --> UC26
  Admin --> UC27
  Admin --> UC28
  Admin --> UC29
  Admin --> UC30
  Admin --> UC31
```

---

## 3. Use Case Relationships
### Purpose
Exhibits the structured dependencies between core functional use cases, specifically focusing on `<<include>>` and `<<extend>>` UML notations to clarify system modularity.

```mermaid
graph TD
  UC_Discover([Discover Exams]) -->|include| UC_Search([Search Exams])
  UC_Discover -->|include| UC_Filter([Filter Exams])
  
  UC_ViewDetail([View Exam Details]) -->|include| UC_CheckElig([Check Eligibility])
  UC_ViewDetail -->|include| UC_ViewDates([View Important Dates])
  UC_ViewDetail -->|include| UC_ViewSyllabus([View Syllabus])
  
  UC_SaveRes([Save Study Resources]) -.->|extend| UC_ViewDetail
  
  UC_UseAI([Use AI Advisor]) -.->|extend| UC_GetAdvice([Get Personal Exam Advice])
  UC_UseAI -.->|extend| UC_UploadPDF([Upload PDF & Ask Questions])
  
  UC_UploadPDF -->|include| UC_StorePDF([Store PDF Document])
  UC_UploadPDF -->|include| UC_AnalyzePDF([Gemini Text Analysis])
  UC_AnalyzePDF -->|include| UC_Chunk([Chunk Document Text])
  
  UC_AskPDF([Ask Questions about PDF]) -->|include| UC_Retrieve([Retrieve Relevant Chunks])
  
  UC_Verify([Verify Data Changes]) -->|include| UC_FetchQueue([Fetch Verification Queue])
  UC_Verify -->|include| UC_ApproveReject([Approve / Reject proposed values])
```

---

## 4. DFD Level 0 (Context-Level DFD)
### Purpose
Draws the high-level boundary of data processing in UdanPath, illustrating the input and output data streams between the main processing bubble and external actors/entities.

```mermaid
graph TD
  Student[Student / User]
  Admin[Admin User]
  SupabaseAuth[Supabase Auth Provider]
  SupabaseStorage[Supabase Storage]
  GeminiAI[Google Gemini AI]
  OfficialSources[Official Exam Portals]

  UdanPath((UDANPATH SYSTEM))

  %% Student flows
  Student -->|Credentials, Profile Info, Search/Filter Queries| UdanPath
  Student -->|Uploaded PDFs, Chat Messages, Preferences| UdanPath
  UdanPath -->|Auth Token, Eligibility Results, Recommendations| Student
  UdanPath -->|Roadmaps, Notifications, AI advice streams| Student

  %% Admin flows
  Admin -->|Credentials, Queue Actions, Data Updates| UdanPath
  UdanPath -->|Verification Items, System Usage Logs| Admin

  %% Auth Provider
  UdanPath -->|Verify Token Requests| SupabaseAuth
  SupabaseAuth -->|JWT Session Status| UdanPath

  %% GCS Storage
  UdanPath -->|Syllabus PDFs, Resume Files| SupabaseStorage
  SupabaseStorage -->|File URL references| UdanPath

  %% Gemini AI
  UdanPath -->|Constructed Context Prompts & RAG Chunks| GeminiAI
  GeminiAI -->|Text analysis, Study schedules, Chat replies| UdanPath

  %% Scraper Sources
  OfficialSources -->|Web Scraped HTML / Notifications| UdanPath
```

---

## 5. DFD Level 1 (System Decomposition)
### Purpose
Decomposes the core system into 12 distinct processes and exposes the main data stores accessed during transactions.

```mermaid
graph TD
  %% External Entities
  Student[Student]
  Admin[Admin]
  Official[Official Sources]
  Gemini[Gemini AI]

  %% Processes
  P1((P1: Auth & Session Management))
  P2((P2: Profile Management))
  P3((P3: Exam Discovery))
  P4((P4: Eligibility Engine))
  P5((P5: Recommendation Engine))
  P6((P6: Exam Data Manager))
  P7((P7: Resource Hub))
  P8((P8: Roadmap & Milestones))
  P9((P9: AI Advisor))
  P10((P10: PDF/RAG Analyzer))
  P11((P11: Notification System))
  P12((P12: Verification Queue))

  %% Data Stores
  D1[(D1: Users & Profiles)]
  D2[(D2: Exams & Categories)]
  D3[(D3: Eligibility Rules)]
  D4[(D4: Courses & Coaching)]
  D5[(D5: PYQs & PDF Storage)]
  D6[(D6: Mapping & Bookmarks)]
  D7[(D7: Roadmap milestones)]
  D8[(D8: AI Chats & Logs)]
  D9[(D9: Notifications)]
  D10[(D10: Aspirant Experiences)]
  D11[(D11: Verification queue)]

  %% Flows: Student
  Student -->|Credentials| P1
  P1 <-->|Read/Write user logins| D1
  Student -->|Profile selections| P2
  P2 -->|Save Education, Preferences, Goals| D1
  
  Student -->|Search & Filter params| P3
  P3 <-->|Read exams, Categories, Papers| D2
  
  Student -->|View Details| P4
  P4 -->|Read User Profile| D1
  P4 -->|Read rules| D3
  P4 -->|Output status| Student
  
  Student -->|Open Dashboard| P5
  P5 -->|Read profile details| D1
  P5 -->|Trigger evaluation| P4
  P5 -->|Filter & Rank| D2
  P5 -->|Display List| Student
  
  Student -->|Get PYQs & Coaching| P7
  P7 -->|Read resources| D4
  P7 -->|Read experience files| D10
  P7 -->|Fetch past papers| D5
  
  Student -->|Follow roadmap| P8
  P8 -->|Load phase details| D7
  P8 <-->|Track checked tasks| D6
  
  Student -->|Converses| P9
  P9 -->|Read profile context| D1
  P9 -->|Read exam details| D2
  P9 <-->|Log chat| D8
  P9 <-->|Query Gemini| Gemini

  Student -->|Upload document| P10
  P10 -->|Save PDF| D5
  P10 -->|Send to analysis| Gemini
  P10 -->|Save summary| D8
  
  Student -->|Receive alerts| P11
  P11 <-->|Write/Read alerts| D9
  
  %% Flows: Admin & Scraper
  Official -->|Raw HTML| P6
  P6 -->|Compare dates| D2
  P6 -->|Write change logs| D11
  P6 -->|Queue modifications| P12
  
  P12 <-->|Fetch pending reviews| D11
  Admin -->|Approve / Reject changes| P12
  P12 -->|Update dates & status| D2
  P12 -->|Trigger system alert| P11
```

---

## 6. DFD Level 2 — Exam Discovery
### Purpose
Exposes the granular data transitions occurring when a student searches, filters, or views consolidation details of competitive examinations.

```mermaid
graph TD
  Student[Student]
  D2[(D2: Exams & Categories)]
  D4[(D4: Courses & Coaching)]
  D5[(D5: PYQs & PDFs)]
  D6[(D6: Bookmarks)]

  P3_1((P3.1: Parse Search & Filter request))
  P3_2((P3.2: Query Exam Catalog))
  P3_3((P3.3: Consolidate details))
  P3_4((P3.4: Fetch related materials))
  P3_5((P3.5: Toggle Saved bookmarks))

  Student -->|Text query, Category filter| P3_1
  P3_1 -->|Cleaned filters| P3_2
  P3_2 <-->|Select matching rows| D2
  P3_2 -->|List of exams| Student
  
  Student -->|Click Exam details| P3_3
  P3_3 <-->|Fetch Papers, Subjects, Topics & Dates| D2
  P3_3 -->|Consolidated ID| P3_4
  P3_4 <-->|Fetch courses & coaching links| D4
  P3_4 <-->|Fetch PDF paths & PYQ years| D5
  P3_4 -->|Full exam profiles & study assets| Student

  Student -->|Toggle bookmark| P3_5
  P3_5 <-->|Write / Delete bookmark mapping| D6
```

---

## 7. DFD Level 2 — Eligibility Engine
### Purpose
Models how the system automatically checks student criteria (Age, Education Level, Degree, Branch, Category, and State) against specific rules defined per exam.

```mermaid
graph TD
  Student[Student / Dashboard]
  D1[(D1: User Profile & Preferences)]
  D3[(D3: Eligibility Rules)]

  P4_1((P4.1: Fetch Student Profile))
  P4_2((P4.2: Fetch Exam Rules))
  P4_3((P4.3: Evaluate Age & Category Relaxation))
  P4_4((P4.4: Evaluate Degree/Branch Hierarchy))
  P4_5((P4.5: Validate Demographics))
  P4_6((P4.6: Consolidate Eligibility Result))

  Student -->|Request eligibility check| P4_1
  P4_1 <-->|Retrieve age, DOB, Category, State, Degrees| D1
  P4_1 -->|Profile criteria| P4_3
  P4_1 -->|Profile criteria| P4_4
  P4_1 -->|Profile criteria| P4_5

  P4_2 <-->|Retrieve min/max ages, Relaxations, degrees| D3
  P4_2 -->|Age limits| P4_3
  P4_2 -->|Degree/Branch rules| P4_4
  P4_2 -->|States/Nationality rules| P4_5

  P4_3 -->|Age status & reason| P4_6
  P4_4 -->|Education status & reason| P4_6
  P4_5 -->|Demographics status & reason| P4_6

  P4_6 -->|Eligibility Status: EXACT, STRONG, RELATED, NOT_ELIGIBLE| Student
```

---

## 8. DFD Level 2 — Recommendation Engine
### Purpose
Exhibits the data paths for personalized exam recommendation calculations, highlighting that eligibility checks execute prior to interest or career goal scoring.

```mermaid
graph TD
  Student[Student Dashboard]
  D1[(D1: Profile & Preferences)]
  D2[(D2: Exams Catalog)]
  
  P5_1((P5.1: Retrieve Student Demographics))
  P5_2((P5.2: Filter out ineligible exams))
  P5_3((P5.3: Compute Interest fit score))
  P5_4((P5.4: Compute Career Goal fit score))
  P5_5((P5.5: Compute Preference fit score))
  P5_6((P5.6: Calculate weighted recommendation index))
  P5_7((P5.7: Sort & Rank recommendations))

  Student -->|Open page request| P5_1
  P5_1 <-->|Load age, category, state, education| D1
  P5_1 -->|Profile demographics| P5_2
  
  P5_2 <-->|Scan verified exams| D2
  %% Cross call to eligibility engine (conceptualized as process here)
  P5_2 -->|Ineligible exams excluded| P5_3
  
  P5_3 <-->|Compare target_exam_categories and master_interests| D1
  P5_3 -->|Interest match score 0-15| P5_6
  
  P5_4 <-->|Compare target career goals| D1
  P5_4 -->|Career match score 0-10| P5_6

  P5_5 <-->|Compare preparation levels, Budget, Language| D1
  P5_5 -->|Preference match score 0-10| P5_6

  P5_2 -->|Education match score 0-50 & Age score 0-15| P5_6

  P5_6 -->|Composite matching score 0-99| P5_7
  P5_7 -->|Ranked recommended exams| Student
```

---

## 9. DFD Level 2 — AI Advisor
### Purpose
Shows the flow of querying the Gemini AI Advisor, integrating profile and exam details to return personalized assistance while recording the conversation log.

```mermaid
graph TD
  Student[Student / Chat UI]
  Gemini[Google Gemini AI]
  D1[(D1: Profiles DB)]
  D2[(D2: Exams DB)]
  D8[(D8: Conversations Log)]

  P9_1((P9.1: Authenticate Request))
  P9_2((P9.2: Retrieve Profile & Exam Context))
  P9_3((P9.3: Retrieve Chat History))
  P9_4((P9.4: Build Prompt & Request Gemini))
  P9_5((P9.5: Clean & Validate AI reply))
  P9_6((P9.6: Save logs))

  Student -->|User message, Selected agent| P9_1
  P9_1 <-->|Check Auth Token| D1
  P9_1 -->|Verified User ID| P9_2
  
  P9_2 <-->|Fetch current profile| D1
  P9_2 <-->|Fetch selected exam requirements| D2
  P9_2 -->|Profile & Exam context variables| P9_4

  P9_3 <-->|Fetch last 10 messages| D8
  P9_3 -->|Conversation history| P9_4

  P9_4 <-->|Generate content stream| Gemini
  P9_4 -->|Raw stream response| P9_5
  
  P9_5 -->|Validated text stream| Student
  P9_5 -->|Final clean answer| P9_6
  P9_6 -->|Write new message log| D8
```

---

## 10. DFD Level 2 — PDF/RAG Processing
### Purpose
Shows the two distinct paths of document handling: indexing uploaded documents via Gemini natively, and retrieval QA context building.

```mermaid
graph TD
  Student[Student]
  Gemini[Google Gemini AI]
  D5[(D5: Supabase Storage)]
  D8[(D8: System Chat Logs)]

  P10_1((P10.1: Validate and store PDF))
  P10_2((P10.2: Extract text & structure))
  P10_3((P10.3: Analyze Document with Gemini))
  P10_4((P10.4: Retrieve relevant contexts))
  P10_5((P10.5: Run contextual QA))

  %% Path A - Upload
  Student -->|Uploads PDF file| P10_1
  P10_1 <-->|Save raw file| D5
  P10_1 -->|Verified PDF file stream| P10_2
  P10_2 -->|Raw text content| P10_3
  P10_3 <-->|Process document structure| Gemini
  P10_3 -->|Structured summary & Topics analysis| Student

  %% Path B - QA
  Student -->|Ask question about document| P10_4
  P10_4 <-->|Fetch PDF summary & history logs| D8
  P10_4 -->|Prompt context| P10_5
  P10_5 <-->|Analyze user prompt with PDF data| Gemini
  P10_5 -->|RAG Answer text| Student
```

---

## 11. DFD Level 2 — Live Exam Data Management
### Purpose
Documents the automated date verification loop, showing parser inputs, change detection, and how discrepancies flow to the admin queue.

```mermaid
graph TD
  Official[Official Exam Portal]
  Admin[Admin Panel]
  D2[(D2: Exams & Dates DB)]
  D11[(D11: Verification Logs & Queue)]

  P6_1((P6.1: Scheduler triggers fetch))
  P6_2((P6.2: Adapt and scrape website HTML))
  P6_3((P6.3: Extract and Normalize Dates))
  P6_4((P6.4: Validate structure))
  P6_5((P6.5: Run Change Detection))
  P6_6((P6.6: Auto-update Database))
  P6_7((P6.7: Push to Queue))
  P6_8((P6.8: Process Admin manual action))

  P6_1 -.->|Periodic trigger| P6_2
  P6_2 <-->|Fetch UPSC/SSC active exam URL| Official
  P6_2 -->|Raw HTML payload| P6_3
  P6_3 -->|Normalized dates JSON| P6_4
  P6_4 -->|Validated dates| P6_5

  P6_5 <-->|Read current stored dates| D2
  
  %% Decision path: No changes
  P6_5 -.->|No discrepancy| P6_6
  P6_6 -->|Update source status success| D2

  %% Decision path: Change detected
  P6_5 -->|Dates changed| P6_7
  P6_7 -->|Write data change logs| D11
  P6_7 -->|Insert pending verification items| D11

  Admin -->|Click Approve / Reject| P6_8
  P6_8 <-->|Fetch pending queues| D11
  P6_8 -->|Approved update payloads| D2
```

---

## 12. Activity Diagram — Complete Student Journey
### Purpose
Visualizes the sequential workflow of a student onboarding onto UdanPath, completing personalization, obtaining recommendations, and tracking exam readiness.

```mermaid
stateDiagram-v2
  [*] --> Start
  Start --> Register_Login
  Register_Login --> Complete_Profile : Onboarding
  
  state Complete_Profile {
    [*] --> Choose_Education
    Choose_Education --> Select_Degree_Branch
    Select_Degree_Branch --> Specify_Averages
    Specify_Averages --> Set_Interests_Goals
    Set_Interests_Goals --> Configure_Preferences
    Configure_Preferences --> [*]
  }

  Complete_Profile --> Save_Profile_Details
  Save_Profile_Details --> Calculate_Eligibility
  Calculate_Eligibility --> Generate_Recommendations
  Generate_Recommendations --> Student_Dashboard

  state Student_Dashboard {
    [*] --> Choices
    Choices --> Explore_All_Exams : Manual Search
    Choices --> View_Recommended_List : Personalized Match
    Choices --> Open_AI_Advisor : Seek Help
    Choices --> Upload_PDF_RAG : Syllabus Check
  }

  Explore_All_Exams --> View_Exam_Details
  View_Recommended_List --> View_Exam_Details
  
  state View_Exam_Details {
    [*] --> Check_Official_Dates
    Check_Official_Dates --> View_Syllabus_Structure
    View_Syllabus_Structure --> Access_PYQs_Materials
    Access_PYQs_Materials --> [*]
  }

  View_Exam_Details --> Save_Bookmark
  Save_Bookmark --> Initialize_Preparation_Roadmap
  
  state Initialize_Preparation_Roadmap {
    [*] --> Fetch_Milestones
    Fetch_Milestones --> Track_Preparation_Progress
    Track_Preparation_Progress --> Receive_Date_Reminders
    Receive_Date_Reminders --> [*]
  }

  Open_AI_Advisor --> Ask_Career_Questions
  Ask_Career_Questions --> Generate_Study_Plan
  Generate_Study_Plan --> Track_Preparation_Progress

  Upload_PDF_RAG --> Extract_Key_Topics
  Extract_Key_Topics --> Compare_With_Roadmap

  Track_Preparation_Progress --> End
  End --> [*]
```

---

## 13. Activity Diagram — Exam Recommendation
### Purpose
Outlines the execution path of the recommendation logic, demonstrating that a candidate is evaluated for mandatory eligibility constraints prior to preference scoring.

```mermaid
graph TD
  Start([Start]) --> LoadProfile[Load User Profile]
  LoadProfile --> IsProfileComplete{Is Profile Complete?}
  
  IsProfileComplete -->|No| PromptProfile[Prompt: Complete Profile]
  PromptProfile --> LoadProfile
  
  IsProfileComplete -->|Yes| FetchExams[Fetch Active Exams list from Database]
  FetchExams --> GetNextExam[Get Next Exam in List]
  
  GetNextExam --> EvaluateAge{Evaluate Age Limits?}
  EvaluateAge -->|Outside Range| ExcludeExam[Exclude Exam from recommendations]
  
  EvaluateAge -->|Within Range| EvaluateEducation{Evaluate Education Levels?}
  EvaluateEducation -->|Mismatch| ExcludeExam
  
  EvaluateEducation -->|Match / Broad Acceptance| MatchDegrees{Evaluate Degrees & Branches?}
  MatchDegrees -->|Ineligible| ExcludeExam
  
  MatchDegrees -->|Eligible| CalcScore[Calculate Weighted Match Score]
  
  CalcScore --> ScoreInterest[Score Category & Interests Match: +15]
  ScoreInterest --> ScoreGoals[Score Career Goals Alignment: +10]
  ScoreInterest --> ScoreState[Score State Regional Relevance: +10]
  ScoreInterest --> AddEduWeight[Add Education/Branch Match Rank Weight: +50]
  ScoreInterest --> AddAgeWeight[Add Age Margin Weight: +15]
  
  AddEduWeight & AddAgeWeight & ScoreState & ScoreGoals & ScoreInterest --> AggregateScore[Sum Weights & Normalize to Max 99%]
  
  ExcludeExam --> CheckMoreExams{More Exams in List?}
  AggregateScore --> CheckMoreExams
  
  CheckMoreExams -->|Yes| GetNextExam
  CheckMoreExams -->|No| SortRank[Sort Exams by Match Score Descending]
  
  SortRank --> DisplayDash[Render Recommended Exams on Dashboard]
  DisplayDash --> End([End])
```

---

## 14. Activity Diagram — AI Advisor
### Purpose
Visualizes the decision hierarchy of the AI Advisor, demonstrating how context (User Profile, Exam DB, and History) is compiled before hitting Gemini.

```mermaid
graph TD
  Start([Start]) --> UserQuery[User Submits Question]
  UserQuery --> Authenticate[Authenticate User Session]
  
  Authenticate --> CheckExamContext{Is Exam Context Selected?}
  CheckExamContext -->|Yes| FetchExamDB[Retrieve Exam & Syllabus Details from Database]
  CheckExamContext -->|No| SkipExamContext[Default: Context = ALL]
  
  FetchExamDB & SkipExamContext --> CheckProfileReq{Does request require personalization?}
  CheckProfileReq -->|Yes| FetchProfileDB[Retrieve User Education, Category & Preferences]
  CheckProfileReq -->|No| SkipProfile[Default: Profile = Generic]
  
  FetchProfileDB & SkipProfile --> CheckHistory{Does conversation history exist?}
  CheckHistory -->|Yes| FetchHistory[Retrieve last 10 messages in Conversation]
  CheckHistory -->|No| ClearHistory[Default: History = Empty]
  
  FetchHistory & ClearHistory --> BuildPrompt[Synthesize Prompt Context variables]
  BuildPrompt --> CallGemini[Call Gemini API - Stream request]
  
  CallGemini --> StreamResponse[Receive Response chunks]
  StreamResponse --> ValidateHal{Validate: Contains fake date/fees?}
  
  ValidateHal -->|No| RenderResponse[Render Answer in UI chat bubble]
  ValidateHal -->|Yes| ReplaceHallucination[Inject system verification warning placeholder]
  ReplaceHallucination --> RenderResponse
  
  RenderResponse --> SaveLog[Save new message to database log]
  SaveLog --> End([End])
```

---

## 15. Activity Diagram — PDF/RAG
### Purpose
Illustrates the document processing and contextual question-answering workflow for user-uploaded syllabus or resource PDF files.

```mermaid
graph TD
  Start([Start]) --> UserUpload[Student Uploads PDF Document]
  UserUpload --> ValidateFile{Is File size < 10MB & PDF format?}
  
  ValidateFile -->|No| ShowError[Show Error: Invalid Document]
  ShowError --> End([End])
  
  ValidateFile -->|Yes| UploadStorage[Save Document in Supabase Storage bucket]
  UploadStorage --> ExtractText[Extract Raw Unicode Text from PDF]
  
  ExtractText --> SendToGemini[Send Text to Gemini AI Document Analyzer]
  SendToGemini --> StructureAnalysis[Extract Key Topics, Important Rules & Weightage Summary]
  
  StructureAnalysis --> SaveSummary[Store Analysis summary in AI logs database]
  SaveSummary --> RenderAnalysis[Display Analysis dashboard with interactive FAQ options]
  
  RenderAnalysis --> UserQuestion[Student asks question about PDF]
  UserQuestion --> FetchContext[Fetch PDF text context summaries]
  FetchContext --> AskContextGemini[Ask Gemini with PDF text as Prompt Context]
  
  AskContextGemini --> DisplayAnswer[Display RAG Answers]
  DisplayAnswer --> End
```

---

## 16. Sequence Diagram — Login
### Purpose
Displays the authentication exchange sequence between the student client, frontend middleware, backend API, and Supabase security providers.

```mermaid
sequenceDiagram
  autonumber
  actor Student as Student
  participant UI as Frontend (Next.js)
  participant API as Backend (FastAPI Gateway)
  participant Auth as Supabase Auth Service
  participant DB as Supabase PostgreSQL

  Student ->> UI: Input Email & Password (or click Google Sign-In)
  UI ->> Auth: authenticate(credentials)
  activate Auth
  Auth -->> UI: returns JWT Token & User Metadata
  deactivate Auth
  
  Note over UI: Token stored in cookie / state session

  UI ->> API: HTTP GET /api/v1/health (Headers: Authorization Bearer JWT)
  activate API
  API ->> Auth: verify_token(JWT)
  Auth -->> API: Token valid (User ID: 123)
  
  API ->> DB: SELECT * FROM student_profiles WHERE user_id = '123'
  activate DB
  DB -->> API: return profile record (CGPA, Degree, etc.)
  deactivate DB

  API -->> UI: return consolidated user profile details
  deactivate API

  UI -->> Student: Render Student Personalized Dashboard
```

---

## 17. Sequence Diagram — Profile & Recommendation
### Purpose
Illustrates how the frontend and backend interact with the eligibility and recommendation engines in real-time when a profile is completed or loaded.

```mermaid
sequenceDiagram
  autonumber
  actor Student as Student
  participant UI as Next.js Client
  participant API as FastAPI Gateway
  participant DB as Supabase DB
  participant EE as Eligibility Engine (lib/eligibility.ts)
  participant RE as Recommendation Engine (Matching Algorithm)

  Student ->> UI: Fill qualifications (Degree, Branch, Category, DOB)
  UI ->> API: POST /api/v1/profile/save (Profile Data)
  activate API
  
  API ->> DB: Insert/Upsert user_education & user_preferences
  DB -->> API: Transaction Success

  API ->> DB: Select all exams (category, code, organization)
  activate DB
  DB -->> API: Return raw exams catalog
  deactivate DB

  API ->> EE: evaluateEligibility(exam, userProfile)
  activate EE
  Note over EE: Age verification & degree checks
  EE -->> API: EligibilityResult (EXACT_MATCH, etc.)
  deactivate EE

  API ->> RE: calculateMatchScore(exam, userProfile, EligibilityResult)
  activate RE
  Note over RE: Heuristics: Interests + Goals
  RE -->> API: MatchingResult (Score: 92%, Reason)
  deactivate RE

  API ->> DB: Insert recommendations cache / mapping log
  API -->> UI: Return sorted recommendation payload
  deactivate API

  UI -->> Student: Render ranked exams carousel on dashboard
```

---

## 18. Sequence Diagram — Exam Discovery
### Purpose
Traces the execution sequence when a student searches, filters, or views specific parameters (dates, syllabus, resources) of a competitive exam.

```mermaid
sequenceDiagram
  autonumber
  actor Student as Student
  participant UI as Next.js Portal UI
  participant API as FastAPI Gateway
  participant DB as Supabase DB

  Student ->> UI: Input text search (e.g. "GATE") & Select category (e.g. "UPSC")
  UI ->> API: GET /api/v1/exams?category_slug=upsc
  activate API
  API ->> DB: SELECT * FROM exams JOIN categories
  DB -->> API: returns matched exams array
  API -->> UI: returns filtered exams list JSON
  deactivate API
  UI -->> Student: Render matching exams grid

  Student ->> UI: Click "View Exam Details" (GATE)
  UI ->> API: GET /api/v1/exams/gate-cs
  activate API
  
  par Fetch Core & Live Dates
    API ->> DB: SELECT * FROM exam_dates WHERE exam_id = 'gate-uuid'
    DB -->> API: returns dates (application, start, end)
  and Fetch Papers & Syllabus
    API ->> DB: SELECT * FROM exam_papers JOIN subjects JOIN topics
    DB -->> API: returns syllabus hierarchy tree
  and Fetch PYQs & Resources
    API ->> DB: SELECT * FROM exam_pyqs & exam_courses & exam_coaching
    DB -->> API: returns resources payload
  end

  API -->> UI: Consolidate data (exam, live_dates, papers, courses, pyqs)
  deactivate API
  UI -->> Student: Render complete GATE details page
```

---

## 19. Sequence Diagram — AI Advisor
### Purpose
Traces the API exchange between the chatbot interface, the backend integration router, database profiles, and the Google Gemini streaming API.

```mermaid
sequenceDiagram
  autonumber
  actor Student as Student
  participant ChatUI as Interactive Chat UI
  participant Gateway as FastAPI Router
  participant DB as Supabase DB
  participant Gemini as Google Gemini Models API

  Student ->> ChatUI: Input prompt ("Should I prepare for UPSC ESE?")
  ChatUI ->> Gateway: POST /api/v1/ai/chat (Prompt, History, UserProfile)
  activate Gateway

  Gateway ->> DB: Fetch current chat conversation history (D8)
  DB -->> Gateway: returns last 10 messages

  Gateway ->> DB: Fetch selected exam context ("UPSC ESE")
  DB -->> Gateway: returns UPSC eligibility rules and stages

  Note over Gateway: Build structured system prompt (inject context variables)

  Gateway ->> Gemini: Send Prompt context (stream content call)
  activate Gemini
  
  loop Stream Response Chunk
    Gemini -->> Gateway: returns text chunk (e.g., "Yes, because your B.Tech...")
    Gateway -->> ChatUI: stream text/event-stream chunk to browser
    ChatUI -->> Student: renders text dynamically
  end
  
  deactivate Gemini
  Gateway ->> DB: Write prompt & complete response text log to ai_interaction_logs
  deactivate Gateway
```

---

## 20. Sequence Diagram — PDF/RAG
### Purpose
Exhibits the sequence of text parsing, summary synthesis, and response retrieval for uploaded documents.

```mermaid
sequenceDiagram
  autonumber
  actor Student as Student
  participant UI as Upload Console
  participant API as FastAPI Router
  participant Store as Supabase Storage
  participant Gemini as Google Gemini AI

  Student ->> UI: Select PDF file (e.g. syllabus_2026.pdf) and click upload
  UI ->> Store: upload_file(storage_path)
  activate Store
  Store -->> UI: returns file URL reference
  deactivate Store

  UI ->> API: POST /api/v1/ai/rag/upload (filename, content_text)
  activate API
  
  Note over API: Extract plain text context from file request

  API ->> Gemini: generate_content(Syllabus parser prompt + text_chunk)
  activate Gemini
  Gemini -->> API: return structured analysis (Topics, weightage, rules)
  deactivate Gemini

  API -->> UI: return status success & analysis JSON
  deactivate API
  UI -->> Student: Render PDF outline & topics overview on screen
```

---

## 21. Sequence Diagram — Live Exam Data Update
### Purpose
Traces the background scheduler routine, from scraping official portals to change detection, verification queues, admin approvals, and final writes.

```mermaid
sequenceDiagram
  autonumber
  participant Sched as Background Scheduler (scheduler.py)
  participant Adap as UPSC/SSC Adapters
  participant Web as Official Exam Portal (HTML website)
  participant DB as Supabase Database
  participant Queue as data_verification_queue
  actor Admin as Administrator
  participant Client as Student Frontend Client

  loop Every 6 Hours
    Sched ->> Adap: Trigger fetch_sources_job()
    activate Adap
    Adap ->> Web: HTTP GET Active Examination Calendar URL
    Web -->> Adap: returns Raw HTML page
    
    Adap ->> Adap: parse(raw_html) & extract dates
    Adap ->> Adap: validate(parsed_data) structure
    
    Adap ->> DB: Compare dates with existing exams tables
    
    alt Date matches database
      Adap ->> DB: update_source_status(success=true)
    else Discrepancy detected
      Adap ->> Queue: Insert PENDING change items (exam_id, field_name, proposed_value)
      Adap ->> DB: update_source_status(success=true, flag="DISCREPANCY")
    end
    deactivate Adap
  end

  Admin ->> Queue: GET /api/v1/admin/verification-queue
  Queue -->> Admin: returns pending date changes list
  Admin ->> Queue: POST /api/v1/admin/verification/{item_id}/approve
  activate Queue
  Queue ->> DB: Upsert approved dates into exam_dates table
  Queue ->> Queue: Mark item status = 'APPROVED'
  Queue -->> Admin: Return success message
  deactivate Queue

  Client ->> DB: GET verified exam calendar details
  DB -->> Client: returns updated dates JSON
  Client -->> Student: displays corrected exam application deadline (Live Update)
```

---

## 22. Sequence Diagram — Notification
### Purpose
Visualizes the automated triggering of alerts when exam status changes or deadlines approach.

```mermaid
sequenceDiagram
  autonumber
  participant Job as Live Exam Update / Scraper
  participant DB as Supabase Database
  participant NS as Notification Service
  participant Client as Next.js Client
  actor Student as Student

  Job ->> DB: Upsert updated verified exam dates (e.g. UPSC CSE application open)
  DB -->> Job: Transaction saved

  Job ->> NS: Trigger alert broadcast (exam_id, message_type: 'date_change')
  activate NS

  NS ->> DB: SELECT user_id FROM user_target_exams_mapping WHERE exam_id = 'upsc-uuid'
  DB -->> NS: returns target users list

  loop For each subscriber
    NS ->> DB: INSERT INTO user_notifications (user_id, type: 'date', title, body, read: false)
  end
  deactivate NS

  Client ->> DB: Poll/Query user_notifications where user_id = mine
  DB -->> Client: return unread notifications array (1 alert)
  Client -->> Student: Renders red dot badge and plays subtle alert sound
  Student ->> Client: Clicks notification (Mark as read)
  Client ->> DB: UPDATE user_notifications SET read = true
```

---

## 23. Class Diagram
### Purpose
Presents the object-oriented structure of UdanPath's entities, showing attributes and methods in standard UML class notations.

```mermaid
classDiagram
    direction TB
    class User {
        +UUID id
        +String email
        +String full_name
        +String avatar_url
        +String phone_number
        +String role
        +Boolean is_active
        +Boolean is_verified
        +login()
        +logout()
        +updateProfile()
    }
    
    class Profile {
        +UUID id
        +UUID user_id
        +Date date_of_birth
        +String gender
        +String category
        +String state
        +String highest_qualification
        +String stream
        +Decimal percentage_aggregate
    }
    
    class UserEducation {
        +UUID id
        +UUID user_id
        +UUID education_level_id
        +UUID degree_id
        +UUID branch_id
        +String status
        +String semester
        +Int passing_year
    }

    class UserPreferences {
        +UUID user_id
        +String study_time
        +String preparation_mode
        +String language_preference
        +String budget_online
        +String budget_offline
        +Int target_year
        +String preparation_status
        +String[] preferred_learning_formats
    }

    class Exam {
        +UUID id
        +UUID category_id
        +String name
        +String short_name
        +String slug
        +String organization
        +String frequency
        +String exam_level
        +Decimal fee_general
        +Decimal fee_reserved
        +String official_website
        +String notification_pdf_url
        +Boolean is_featured
        +String status
    }

    class ExamCategory {
        +UUID id
        +String name
        +String slug
        +String description
        +String icon_name
        +Int display_order
    }

    class ExamPaper {
        +UUID id
        +UUID exam_id
        +String name
        +String code
        +String description
    }

    class ExamSubject {
        +UUID id
        +UUID paper_id
        +String name
        +Decimal weightage_percentage
    }

    class ExamTopic {
        +UUID id
        +UUID subject_id
        +String name
        +String description
    }

    class EligibilityRule {
        +UUID id
        +UUID exam_id
        +UUID paper_id
        +String rule_type
        +String condition_key
        +String condition_value
        +String description
        +Boolean is_mandatory
    }

    class ExamDate {
        +UUID id
        +UUID exam_id
        +Date notification_release_date
        +Date application_start_date
        +Date application_end_date
        +Date exam_start_date
        +String status
        +UUID source_id
        +String verification_status
    }

    class ExamSource {
        +UUID id
        +String name
        +String organization
        +String source_type
        +String base_url
        +String exam_url
        +Boolean is_active
        +String fetch_method
        +DateTime last_checked_at
    }

    class ExamPYQ {
        +UUID id
        +UUID exam_id
        +UUID paper_id
        +Int year
        +String question_type
        +String pdf_url
        +Boolean verified
    }

    class ExamPDF {
        +UUID id
        +UUID exam_id
        +String title
        +String document_type
        +String storage_path
        +Boolean verified
    }

    class ExamCourse {
        +UUID id
        +UUID exam_id
        +String provider_name
        +String course_name
        +String price_info
        +String official_link
        +Boolean is_verified
    }

    class ExamCoaching {
        +UUID id
        +UUID exam_id
        +String institute_name
        +String city
        +String mode
        +Boolean is_verified
    }

    class ExamYoutubeResource {
        +UUID id
        +UUID exam_id
        +String title
        +String channel_name
        +String url
        +Boolean is_verified
    }

    class ExamMilestone {
        +UUID id
        +UUID exam_id
        +String tier
        +Int duration_months
        +Int phase_order
        +String phase_name
        +JSONB tasks
    }

    class UserStudyProgress {
        +UUID id
        +UUID user_id
        +UUID exam_id
        +UUID syllabus_topic_id
        +Boolean is_completed
        +DateTime completed_at
    }

    class AspirantExperience {
        +UUID id
        +UUID exam_id
        +String display_name
        +String rank
        +String score
        +String[] subjects_focused
        +String advice
        +String verification_status
    }

    class ExperienceMedia {
        +UUID id
        +UUID experience_id
        +String media_type
        +String title
        +String url
    }

    class UserNotification {
        +UUID id
        +UUID user_id
        +String type
        +String title
        +String body
        +Boolean read
    }

    class AIConversation {
        +UUID id
        +UUID user_id
        +String feature_used
        +String prompt_text
        +String response_text
        +DateTime created_at
    }

    User "1" -- "1" Profile : owns
    User "1" -- "*" UserEducation : builds
    User "1" -- "1" UserPreferences : configures
    User "1" -- "*" UserNotification : receives
    User "1" -- "*" AIConversation : queries
    
    Profile "1" -- "*" UserStudyProgress : tracks
    
    Exam "*" -- "1" ExamCategory : belongs_to
    Exam "1" -- "*" ExamPaper : contains
    Exam "1" -- "*" EligibilityRule : restricts
    Exam "1" -- "*" ExamDate : schedules
    Exam "1" -- "*" ExamPYQ : references
    Exam "1" -- "*" ExamPDF : hosts
    Exam "1" -- "*" ExamCourse : recommends
    Exam "1" -- "*" ExamCoaching : lists
    Exam "1" -- "*" ExamYoutubeResource : guides
    Exam "1" -- "*" ExamMilestone : structures
    Exam "1" -- "*" AspirantExperience : inspires
    
    ExamPaper "1" -- "*" ExamSubject : outlines
    ExamSubject "1" -- "*" ExamTopic : details
    
    AspirantExperience "1" -- "*" ExperienceMedia : embeds
    ExamDate "*" -- "1" ExamSource : fetched_from
```

---

## 24. ER Diagram / Database Relationship Diagram
### Purpose
Exhibits the database relations, keys, mapping constraints, and cardinality representing the exact production schema inside Supabase.

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar hashed_password
        varchar full_name
        varchar avatar_url
        varchar role
        timestamp created_at
    }

    student_profiles {
        uuid id PK
        uuid user_id FK
        date date_of_birth
        varchar category
        varchar state
        varchar highest_qualification
        varchar stream
        numeric percentage_aggregate
    }

    master_education_levels {
        uuid id PK
        varchar name UK
        int display_order
    }

    master_degrees {
        uuid id PK
        uuid education_level_id FK
        varchar name
    }

    master_branches {
        uuid id PK
        uuid degree_id FK
        varchar name
    }

    user_education {
        uuid id PK
        uuid user_id FK
        uuid education_level_id FK
        uuid degree_id FK
        uuid branch_id FK
        varchar status
        int passing_year
    }

    user_preferences {
        uuid user_id PK, FK
        varchar study_time
        varchar preparation_mode
        varchar language_preference
        int target_year
        text_array preferred_learning_formats
    }

    exam_categories {
        uuid id PK
        varchar name UK
        varchar slug UK
        int display_order
    }

    exams {
        uuid id PK
        varchar name
        varchar short_name UK
        varchar slug UK
        varchar organization
        uuid category_id FK
        varchar status
        varchar verification_status
    }

    exam_dates {
        uuid id PK
        uuid exam_id FK, UK
        date notification_release_date
        date application_start_date
        date application_end_date
        date exam_start_date
        uuid source_id FK
        varchar verification_status
    }

    exam_sources {
        uuid id PK
        varchar name
        varchar source_type
        text base_url
        text exam_url
        boolean is_active
    }

    exam_papers {
        uuid id PK
        uuid exam_id FK
        varchar name
        varchar code
    }

    exam_subjects {
        uuid id PK
        uuid paper_id FK
        varchar name
        numeric weightage_percentage
    }

    exam_topics {
        uuid id PK
        uuid subject_id FK
        varchar name
    }

    exam_eligibility_rules {
        uuid id PK
        uuid exam_id FK
        uuid paper_id FK
        varchar rule_type
        varchar condition_key
        text condition_value
    }

    user_bookmarks {
        uuid id PK
        uuid user_id FK
        uuid exam_id FK
    }

    exam_milestones {
        uuid id PK
        uuid exam_id FK
        varchar tier
        int phase_order
        varchar phase_name
        jsonb tasks
    }

    user_study_progress {
        uuid id PK
        uuid user_id FK
        uuid exam_id FK
        uuid syllabus_topic_id FK
        boolean is_completed
    }

    data_verification_queue {
        uuid id PK
        uuid exam_id FK
        uuid source_id FK
        varchar field_name
        text proposed_value
        varchar status
        uuid reviewed_by FK
    }

    user_notifications {
        uuid id PK
        uuid user_id FK
        varchar type
        varchar title
        text body
        boolean read
    }

    ai_interaction_logs {
        uuid id PK
        uuid user_id FK
        varchar feature_used
        text prompt_text
        text response_text
        int tokens_used
    }

    %% Relationships
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
    data_verification_queue }o--|| users : "reviewed_by_admin"
```

---

## 25. Component Diagram
### Purpose
Visualizes the major modular code interfaces and service layers of the platform, including frontend UI components, backend routing middleware, external APIs, and database triggers.

```mermaid
graph TD
  subgraph Frontend_App["Frontend Application (Next.js Node)"]
    UI[Portal Pages & Dynamic Dashboards]
    JS_Clients[Supabase Client Engine]
    EE_FE[Eligibility Engine Client]
  end

  subgraph Backend_App["Backend Integration Gateway (FastAPI Uvicorn)"]
    API[FastAPI Router /api/v1]
    GeminiClient[Gemini Client Wrapper]
    SubClient[Supabase Backend Client Admin]
    Sched[Background Tasks Scheduler]
    Adapters[UPSC/SSC Scraper Adapters]
  end

  subgraph Supabase_Cloud["Supabase Cloud Platform"]
    Auth[Supabase Auth Module]
    DB[(PostgreSQL Database)]
    Storage[(Supabase Storage Buckets)]
  end

  subgraph AI_Platform["Google Cloud Services"]
    GeminiModel[Google Gemini AI Engine]
  end

  subgraph Scrape_Targets["Official Web Portals"]
    Portals[UPSC / SSC Sites]
  end

  %% Links
  UI -->|HTTP requests & Route navigation| API
  JS_Clients -->|Session token validation| Auth
  JS_Clients -->|Read-only tables| DB
  JS_Clients -->|Direct storage upload| Storage

  API -->|Verify token status| Auth
  API -->|Admin upsert/select fallbacks| SubClient
  SubClient -->|Service role key read/write| DB
  SubClient -->|Fetch storage PDF structures| Storage

  API -->|Initialize chat prompts & vectors| GeminiClient
  GeminiClient -->|REST stream calls| GeminiModel

  Sched -->|Execute periodic worker| Adapters
  Adapters -->|Scrape DOM & Parse dates| Portals
  Adapters -->|Upsert changes / Queue review| SubClient
```

---

## 26. Deployment Diagram
### Purpose
Shows the hardware nodes and physical deployment architecture of the UdanPath services.

```mermaid
graph TD
  subgraph Client_Tier["Client Domain"]
    Browser[Web Browser / Chrome, Safari]
  end

  subgraph CDN_Tier["Vercel Cloud Platform"]
    Vercel[Vercel Serverless Edge CDN]
    FE_Server[Next.js SSR Nodes]
  end

  subgraph Server_Tier["Render Cloud Service / Container Engine"]
    FastAPI_Container[FastAPI Router Docker Container]
    Python_Env[Python 3.10 Runtime Uvicorn]
  end

  subgraph Database_Tier["Supabase Managed Cloud (AWS East)"]
    Supabase_Server[PostgreSQL Instance DB / RLS Configured]
    Auth_Node[Go-True Auth Server]
    Storage_Node[S3 Storage Wrapper]
  end

  subgraph External_Cloud["Google AI Platform"]
    Gemini_API[Gemini Pro API endpoint]
  end

  subgraph Govt_Servers["Official Hosting Centers"]
    NIC[NIC Server UPSC / SSC Portals]
  end

  %% Connections
  Browser -->|HTTPS/TLS: Port 443| Vercel
  Vercel -->|Renders SSR Pages| FE_Server
  Browser -->|Direct Web API / API routing| FastAPI_Container
  Browser -->|JWT Session checks| Auth_Node
  Browser -->|Media assets| Storage_Node

  FE_Server -->|Proxy queries| FastAPI_Container

  FastAPI_Container -->|Runs application| Python_Env
  Python_Env -->|Supabase connection pool| Supabase_Server
  Python_Env -->|Internal scheduler crawler| NIC
  Python_Env -->|AI stream RPC calls| Gemini_API
```

---

## 27. Admin Workflow Diagram
### Purpose
Exhibits the functional dashboard workflow of the system administrator, specifically emphasizing the date scrapers verification queue.

```mermaid
graph TD
  Start([Start]) --> Login[Admin Logs into Dashboard]
  Login --> CheckSession{Is Admin Role Valid?}
  
  CheckSession -->|No| AccessDenied[Show Error: Access Denied]
  AccessDenied --> End([End])

  CheckSession -->|Yes| RenderDashboard[Render Admin Workspace]
  RenderDashboard --> SelectOption{Select Action}
  
  SelectOption --> ManageExams[Create/Modify Exam Master Data]
  ManageExams --> SaveDB[Update Exams table in DB]
  
  SelectOption --> ViewQueue[View Live Scraper Verification Queue]
  ViewQueue --> FetchItems[Query PENDING queue list]
  FetchItems --> ShowDiscrepancy[Display Proposed Date vs Current Date]
  
  ShowDiscrepancy --> AdminDecision{Admin Review Decision}
  
  AdminDecision -->|Approve| UpsertDate[Update live exam_dates table]
  UpsertDate --> MarkApproved[Set queue status = APPROVED]
  MarkApproved --> TriggerAlert[Trigger notification alerts to target users]
  
  AdminDecision -->|Reject| MarkRejected[Set queue status = REJECTED]
  
  TriggerAlert & MarkRejected --> CheckQueue{More pending items?}
  CheckQueue -->|Yes| FetchItems
  CheckQueue -->|No| RenderDashboard

  SelectOption --> MonitorLogs[Monitor System & Gemini API Logs]
  MonitorLogs --> RenderDashboard
  
  SaveDB --> RenderDashboard
```

---

## 28. Data Flow for Real Exam Data
### Purpose
Tracks the data transformations of live dates from scraping official websites to updating the student UI, as requested in Section 35.

```mermaid
graph LR
  OfficialSource[Official Exam Portal]
  DataCollection[Data Collector]
  Parser[HTML Parser]
  Normalizer[Data Normalizer]
  Validator[Data Validator]
  ChangeDetection[Change Detection]
  Verification[Verification Queue]
  AdminReview{Admin Review}
  Supabase[(Supabase DB)]
  FastAPI[FastAPI Gateway]
  Frontend[Next.js Client]
  Student[Student User]

  OfficialSource -->|Scraped HTML data| DataCollection
  DataCollection -->|Raw text stream| Parser
  Parser -->|Extracted table rows| Normalizer
  Normalizer -->|Standard ISO dates| Validator
  Validator -->|Validated dates JSON| ChangeDetection
  
  ChangeDetection -->|Dates differ from DB| Verification
  ChangeDetection -->|Dates identical| DBUpdateDirect[Update Scrape Status Success]
  DBUpdateDirect --> Supabase

  Verification -->|Queue Item created| AdminReview
  AdminReview -->|APPROVED| Supabase
  AdminReview -->|REJECTED| RejectArchive[Archive Rejected Change]

  Supabase -->|Select *| FastAPI
  FastAPI -->|JSON Endpoint| Frontend
  Frontend -->|Render UI calendar| Student
```
