<div align="center">

# 🚀 UDANPATH (उड़ान पथ)
### Personalized AI Career Counselor & Exam Navigator for Indian Aspirants

[![Live Website](https://img.shields.io/badge/Live%20Demo-udanpath.vercel.app-blue?style=for-the-badge&logo=vercel)](https://udanpath.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.3%20(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

<p align="center">
  <b>Bridging the ambition gap for millions of Indian students navigating higher education, engineering, medical, civil services, banking, and government career pathways.</b>
</p>

[Explore Live Demo](https://udanpath.vercel.app) • [Quick Start](#-quick-start-for-new-users) • [Features](#-core-features) • [Local Setup](#-local-development-setup) • [Architecture](#-system-architecture)

</div>

---

## 🌟 Quick Start for New Users

You can access and test the entire platform in seconds without creating an account:

### 1. Instant 1-Click Guest Demo (Recommended)
1. Open **[udanpath.vercel.app](https://udanpath.vercel.app)**.
2. Click **"Explore Demo (Guest Mode)"** on the sign-in page.
3. You immediately enter the full **Student Portal** preloaded with:
   - Complete academic profile (B.Tech Computer Engineering, 8.75 CGPA, PCM).
   - Real-time matched competitive exams (GATE CS, UPSC CSE, SSC CGL).
   - Active bookmarked examinations and deadlines.
   - Interactive Resume ATS scanner and Student DNA metrics.

### 2. Available Test Accounts
If you want to test specific role-based permissions:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Guest Demo** | *Click "Explore Demo"* | *None (1-click)* | Full student view, bookmarks, notifications, simulator |
| **Student** | `student@udanpath.in` | `Student@123` | Complete student portal, personal onboarding & profile |
| **Coordinator** | `coordinator@udanpath.in` | `Coord@123` | Exam Catalog management, deadline editor, requirements |
| **Administrator** | `admin@udanpath.in` | `Admin@123` | Master database, user roles, system metrics |

---

## 🎯 Core Features

### 1. 🧠 Intelligent Exam Matching & Eligibility Engine
- Multi-dimensional eligibility calculations:
  - **Academic Qualifications**: 10th/12th percentages, specific subject combinations (PCM, PCB, PCMB).
  - **Higher Education**: Degree (B.Tech, B.Sc, B.Com, BA, MBBS, etc.), Branch, and CGPA thresholds.
  - **Reservation & Quotas**: Reservation relaxations for GENERAL, OBC, SC, ST, and EWS.
  - **Domicile & Age**: State-level quota calculations and category age relaxations.
- Calculates an exact **Match Percentage Score (0–100%)** and provides transparent human-readable explanations of why an aspirant is or is not eligible.

### 2. 📊 Student Dashboard & Live Intelligence
- **Overview**: Setup checklist, recommended entrance exams sorted by eligibility score.
- **Exam Catalog & Discover**: Search, filter, and compare 50+ national/state level examinations by domain, eligibility, application fee, and deadlines.
- **Bookmarks & Notifications**: Save target exams and receive real-time deadline/admit card alerts.

### 3. 👤 Next-Gen Student Profile & AI DNA
- **Interactive Completeness Ring**: Visual score tracker guiding profile optimization.
- **Competency Matrix**: Tagged strengths and weaknesses in key subjects with targeted preparation recommendations.
- **Academic Journey Roadmap**: Vertical milestone roadmap tracking education from Secondary School to target competitive examinations.
- **Resume / Bio ATS Scanner**: Plain-text competitive exam bio scanner analyzing keyword alignment and structure.
- **Export / Print**: Instant clean PDF generation via `window.print()`.

### 4. 🗺️ Multi-Stage Career Roadmaps & AI Guide
- Phase-by-phase visual preparation roadmaps with recommended milestones, books, practice exams, and coaching guides.
- Integrated AI Career Chatbot powered by Google Gemini for 24/7 academic guidance.

### 5. 🛡️ Role-Based Portals (RBAC)
- **Student Portal** (`/student`): Daily workspace for Indian aspirants.
- **Exam Coordinator Dashboard** (`/exam-coordinator`): Interface for educational coordinators to curate exam syllabi, dates, and eligibility rules.
- **Admin Dashboard** (`/admin`): System observability and platform settings.

---

## 💻 Local Development Setup

Follow these instructions to run UdanPath locally on your machine:

### Prerequisites
- [Node.js](https://nodejs.org/) (version `18.18+` or `20+` recommended)
- `npm` (bundled with Node.js) or `pnpm` / `yarn`
- [Git](https://git-scm.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/gauswamiashih/UDANPATH.git
cd UDANPATH
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
```
*(Note: If no remote database is configured, UdanPath automatically activates its built-in offline master dataset fallback so all education levels, branches, and exams work out of the box).*

### Step 4: Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!TIP]
> **Mobile / Hotspot Testing**: Next.js 16 is pre-configured with `allowedDevOrigins` in `next.config.ts`, so you can test on mobile devices connected to your Wi-Fi or hotspot (e.g. `http://192.168.x.x:3000`) without cross-origin blocking!

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Framework** | **Next.js 16 (App Router + Turbopack)** |
| **UI Library** | **React 19**, **Tailwind CSS v4**, **Framer Motion** |
| **Icons & Typography** | **Lucide React**, **Plus Jakarta Sans**, **Inter** |
| **Backend & Database** | **Supabase (PostgreSQL, Row-Level Security, Auth)** |
| **AI Integration** | **Google Gemini API** (`@google/generative-ai`) |
| **Caching & CDN** | **Vercel Global Edge Network (RFC 9213 `CDN-Cache-Control`)** |
| **PWA & Mobile** | **Apple Touch Icons, Web App Manifest (`site.webmanifest`)** |

---

## 📂 Project Directory Structure

```plaintext
UDANPATH/
├── app/                          # Next.js 16 App Router
│   ├── (portal)/                 # Protected portal layouts & views
│   │   ├── student/              # Student Dashboard, Profile, Roadmaps, Exams
│   │   │   ├── profile/          # Profile page (Tabs, ATS Scanner, DNA)
│   │   │   └── exams/            # Catalog discovery & detail pages
│   │   ├── exam-coordinator/     # Coordinator catalog manager
│   │   └── admin/                # Administrator dashboard
│   ├── auth/                     # Authentication (Sign in, Sign up, Guest Mode)
│   ├── onboarding/               # Multi-step student profile onboarding
│   ├── layout.tsx                # Root layout (Metadata, Fonts, Icons)
│   ├── page.tsx                  # Public landing page
│   └── globals.css               # Global styles & design tokens
├── lib/                          # Core engines & utilities
│   ├── eligibilityEngine.ts      # Multi-criteria exam scoring engine
│   ├── masterDataFallback.ts     # Offline fallback datasets for degrees/branches
│   ├── dbService.ts              # Database queries & bookmark helpers
│   ├── supabaseClient.ts         # Supabase client initialization
│   └── notificationService.ts    # Notification management
├── public/                       # Static assets, touch icons & PWA manifest
│   ├── apple-touch-icon.png      # 180x180 iOS touch icon
│   ├── site.webmanifest          # PWA manifest
│   └── icon-192.png / 512.png    # Android / Web homescreen icons
├── docs/                         # Technical documentation & architecture schemas
├── next.config.ts                # Next.js config (CDN headers, allowedDevOrigins)
└── package.json                  # Dependencies & scripts
```

---

## 📜 Available NPM Scripts

- `npm run dev` — Starts the Turbopack development server on `localhost:3000`.
- `npm run build` — Compiles and creates an optimized production build.
- `npm run start` — Starts the production server.
- `npm run lint` — Runs ESLint across all codebase files with zero errors.

---

## 📄 License & Attribution

This project was built for Indian Aspirants navigating competitive careers.  
Distributed under the **MIT License**. See `LICENSE` for more information.
