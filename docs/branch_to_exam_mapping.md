# Branch to Exam Recommendations Mapping

This document outlines how specific educational branches and streams map to recommended exams in UDANPATH. 

The recommendation engine uses the student's `highest_qualification` and `stream` to match against the `exam_eligibility` table's `min_education` and `eligible_streams`.

## 1. Engineering / B.Tech (Degree)
**Streams / Branches:** Computer Science (CS), Information Technology (IT), Electronics (ECE), Mechanical (ME), Civil (CE), Electrical (EE)

### Recommended Exams:
*   **GATE (Graduate Aptitude Test in Engineering):** For Master's (M.Tech) and PSU (Public Sector Undertaking) jobs. (Branch specific: GATE CS, GATE ME, etc.)
*   **SSC JE (Junior Engineer):** For CE, ME, EE branches.
*   **RRB JE (Railway Recruitment Board):** For CE, ME, EE, Electronics branches.
*   **UPSC ESE (Engineering Services Examination):** For CE, ME, EE, Electronics & Telecommunication.
*   **ISRO / DRDO Scientist Exams:** Branch specific (CS, EC, ME).
*   **CAT / XAT / MAT (Management):** Open to all engineering branches for MBA.
*   **UPSC CSE (Civil Services - IAS/IPS):** Open to all engineering graduates.

---

## 2. Science / B.Sc (Degree)
**Streams / Branches:** Physics, Chemistry, Mathematics, Biology, Zoology, Botany

### Recommended Exams:
*   **IIT JAM (Joint Admission test for Masters):** For M.Sc in IITs/NITs. (Subject specific)
*   **SSC CGL (Combined Graduate Level):** Open to all graduates. Specific posts like Statistical Investigator for Statistics/Maths students.
*   **IBPS PO / SBI PO (Banking):** Open to all science graduates.
*   **UPSC CSE / State PSC:** Open to all science graduates.
*   **RRB NTPC (Non-Technical Popular Categories):** Open to all graduates.
*   **AFCAT (Air Force Common Admission Test):** Open to B.Sc (Physics/Maths) for Flying Branch.

---

## 3. Commerce / B.Com / BBA (Degree)
**Streams / Branches:** Accounting, Finance, Taxation, Business Administration

### Recommended Exams:
*   **CA / CS / CMA (Chartered Accountancy, etc.):** Highly recommended professional courses.
*   **IBPS PO / SBI PO / RBI Grade B (Banking & Finance):** Excellent fit for commerce students.
*   **SSC CGL (Combined Graduate Level):** Posts like Assistant Audit Officer (AAO) highly prefer Commerce graduates.
*   **CAT / XAT / MAT (Management):** For MBA.
*   **UPSC CSE / State PSC:** Open to all commerce graduates.
*   **LIC AAO (Life Insurance Corporation):** Open to all, good fit for commerce.

---

## 4. Arts / Humanities / B.A (Degree)
**Streams / Branches:** History, Geography, Political Science, Economics, English, Sociology

### Recommended Exams:
*   **UPSC CSE (Civil Services Examination):** Arts subjects are heavily featured in the syllabus (History, Polity, Geography).
*   **State PSC (Public Service Commission):** Similar syllabus advantage as UPSC.
*   **SSC CGL / CHSL:** Open to Arts graduates.
*   **IBPS PO / SBI PO:** Open to Arts graduates.
*   **TET / CTET (Teaching):** Combined with B.Ed for teaching jobs.
*   **UGC NET:** For Lectureship/PhD after Master's in the subject.

---

## 5. Medical / Healthcare (MBBS / BDS / B.Sc Nursing)
**Streams / Branches:** Medicine, Dental, Nursing, Pharmacy

### Recommended Exams:
*   **NEET PG (Post Graduate):** For MD/MS after MBBS.
*   **UPSC CMS (Combined Medical Services):** For medical officers in government organizations.
*   **State Medical Council Exams:** For state government doctor posts.
*   **AIIMS Nursing / Military Nursing Service:** For B.Sc Nursing graduates.

---

## 6. Class 12th (Intermediate)
**Streams:** PCM (Physics, Chem, Math), PCB (Physics, Chem, Bio), Commerce, Arts

### Recommended Exams:
*   **PCM:** JEE Main, JEE Advanced, NDA (Naval/Airforce), BITSAT, State CETs.
*   **PCB:** NEET UG, ICAR AIEEA, AIIMS Nursing.
*   **Commerce / Arts:** CLAT (Law), CUET (Central Universities), CA Foundation, SSC CHSL, NDA (Army wing only).

---

## How this works in the Schema:
To implement this logic, when you add an Exam to the database, you set the eligibility rules.
For example, for **SSC JE (Junior Engineer)**:
*   `min_education` = 'Diploma' or 'B.Tech'
*   `eligible_streams` = `['Civil', 'Mechanical', 'Electrical']`

When a student registers with `stream` = 'Civil', the database query easily matches them to SSC JE!
