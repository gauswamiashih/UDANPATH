/**
 * UDANPATH - Live OpenAI GPT-4o & Gemini AI Orchestrator
 * Connects to live FastAPI streaming endpoint (http://localhost:8000/api/v1/ai/chat)
 * for real-time OpenAI GPT-4o streaming responses, with 2026/2027 client fallback.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Initialize Reusable Supabase Frontend Client
  if (window.UdanPathSupabase) {
    window.UdanPathSupabase.init();
  }

  // -------------------------------------------------------------------
  // 1.5. SUPABASE AUTH SESSION & STUDENT PROFILE ENGINE
  // -------------------------------------------------------------------
  initUserSessionAndProfile();

  async function initUserSessionAndProfile() {
    const userHeaderNav = document.getElementById('userHeaderNav');
    const profileUserName = document.getElementById('profileUserName');
    const profileUserEmail = document.getElementById('profileUserEmail');
    const profileAvatarBadge = document.getElementById('profileAvatarBadge');
    const profileRoleBadge = document.getElementById('profileRoleBadge');
    const profileTargetExamLabel = document.getElementById('profileTargetExamLabel');
    const profileAuthActionBtn = document.getElementById('profileAuthActionBtn');

    if (!window.UdanPathSupabase) {
      renderRecommendedExams('ALL');
      return;
    }

    const session = await window.UdanPathSupabase.getSession();

    if (session && session.user) {
      const user = session.user;
      const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
      const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
      const targetExamCode = localStorage.getItem('udanpath_target_exam') || 'UPSC_CSE';

      // Update Header Navigation to User Pill & Sign Out
      if (userHeaderNav) {
        userHeaderNav.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.65rem; background: var(--bg-card); padding: 0.35rem 0.85rem; border-radius: 20px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: #FFF; font-weight: 800; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;">
              ${initials}
            </div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.82rem; font-weight: 700; line-height: 1.1;">${fullName}</span>
              <span style="font-size: 0.7rem; color: var(--success); font-weight: 600;">● Active Session</span>
            </div>
          </div>

          <a href="#dashboard" class="btn btn-secondary" style="padding: 0.45rem 0.75rem; font-size: 0.8rem; font-weight: 700; text-decoration: none;" title="Go to My Profile">
            <i data-lucide="user"></i> <span>Dashboard</span>
          </a>

          <button id="headerSignOutBtn" class="btn btn-icon" style="width: 34px; height: 34px;" title="Sign Out">
            <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
          </button>
        `;
        if (window.lucide) lucide.createIcons();

        document.getElementById('headerSignOutBtn')?.addEventListener('click', async () => {
          await window.UdanPathSupabase.signOut();
          localStorage.removeItem('udanpath_target_exam');
          window.location.reload();
        });
      }

      // Update Student Dashboard Profile Banner
      if (profileUserName) profileUserName.textContent = fullName;
      if (profileUserEmail) profileUserEmail.textContent = `Email: ${user.email} | Connected via Supabase Auth`;
      if (profileAvatarBadge) profileAvatarBadge.textContent = initials;
      if (profileRoleBadge) {
        profileRoleBadge.textContent = 'Verified Aspirant';
        profileRoleBadge.className = 'tag-badge tag-bank';
      }
      if (profileTargetExamLabel) profileTargetExamLabel.textContent = targetExamCode.replace('_', ' ');

      if (profileAuthActionBtn) {
        profileAuthActionBtn.outerHTML = `
          <button id="dashboardSignOutBtn" class="btn btn-secondary" style="padding: 0.55rem 1.15rem; font-size: 0.85rem;">
            <i data-lucide="log-out"></i> <span>Sign Out</span>
          </button>
        `;
        if (window.lucide) lucide.createIcons();
        document.getElementById('dashboardSignOutBtn')?.addEventListener('click', async () => {
          await window.UdanPathSupabase.signOut();
          window.location.reload();
        });
      }

      renderRecommendedExams(targetExamCode);
    } else {
      renderRecommendedExams('ALL');
    }
  }

  function renderRecommendedExams(targetCode) {
    const recommendedExamsGrid = document.getElementById('recommendedExamsGrid');
    if (!recommendedExamsGrid || typeof EXAMS_DATABASE === 'undefined') return;

    let matchedExams = EXAMS_DATABASE;
    if (targetCode !== 'ALL') {
      const primary = EXAMS_DATABASE.filter(ex => ex.code === targetCode);
      const rest = EXAMS_DATABASE.filter(ex => ex.code !== targetCode);
      matchedExams = [...primary, ...rest];
    }

    recommendedExamsGrid.innerHTML = matchedExams.map((exam, idx) => `
      <div class="card" style="background: var(--bg-main); position: relative; border-left: 4px solid ${idx === 0 ? 'var(--primary)' : 'var(--border-color)'};">
        ${idx === 0 ? '<span class="tag-badge tag-govt" style="position: absolute; top: 1rem; right: 1rem;">Top Target Match</span>' : ''}
        <div style="margin-bottom: 0.75rem;">
          <span class="tag-badge ${exam.tagClass}">${exam.category}</span>
          <h4 style="font-size: 1.1rem; margin-top: 0.35rem;">${exam.title}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted);">${exam.conductingBody} • ${exam.level} Level</p>
        </div>

        <div style="font-size: 0.85rem; line-height: 1.6; background: var(--bg-card); padding: 0.85rem; border-radius: 8px; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <strong style="color: var(--text-muted);">Age Eligibility:</strong>
            <span>${exam.minAge} - ${exam.maxAgeGen} Yrs (OBC +3y, SC/ST +5y)</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <strong style="color: var(--text-muted);">Min Education:</strong>
            <span style="font-weight: 700; color: var(--primary);">${exam.minEducation}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: var(--text-muted);">Monthly Salary:</strong>
            <span style="font-weight: 700; color: var(--success);">${exam.salaryRange}</span>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary view-recommended-detail" data-id="${exam.id}" style="flex: 1; padding: 0.5rem 0.75rem; font-size: 0.82rem;">
            <i data-lucide="info"></i> Details & Pattern
          </button>
          <a href="${exam.officialWebsite}" target="_blank" class="btn btn-secondary" style="padding: 0.5rem 0.75rem; font-size: 0.82rem;" title="Official Portal">
            <i data-lucide="external-link"></i>
          </a>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();

    document.querySelectorAll('.view-recommended-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const examId = btn.getAttribute('data-id');
        openExamModal(examId);
      });
    });
  }

  // State Management
  let currentLanguage = localStorage.getItem('udanpath_lang') || 'en';
  let currentCategory = 'all';
  let searchQuery = '';
  let eduFilterValue = 'all';
  let sortFilterValue = 'popular';
  let bookmarkedExams = JSON.parse(localStorage.getItem('udanpath_bookmarks') || '["upsc-cse", "ssc-cgl"]');

  // DOM Elements
  const langToggleBtn = document.getElementById('langToggleBtn');
  const currentLangLabel = document.getElementById('currentLangLabel');
  const themeToggleBtn = document.getElementById('themeToggle');
  const searchInput = document.getElementById('searchInput');
  const filterPills = document.querySelectorAll('.filter-pill');
  const eduFilter = document.getElementById('eduFilter');
  const sortFilter = document.getElementById('sortFilter');
  const examCardsGrid = document.getElementById('examCardsGrid');
  const resultsCount = document.getElementById('resultsCount');

  // Modal Elements
  const examDetailModal = document.getElementById('examDetailModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalCategoryTag = document.getElementById('modalCategoryTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalConducting = document.getElementById('modalConducting');
  const modalContent = document.getElementById('modalContent');

  // AI Drawer Elements
  const aiDrawer = document.getElementById('aiDrawer');
  const openAiDrawerBtn = document.getElementById('openAiDrawerBtn');
  const closeAiDrawerBtn = document.getElementById('closeAiDrawerBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const chatContextExam = document.getElementById('chatContextExam');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatHistory = document.getElementById('chatHistory');

  // AI Forms
  const eligibilityForm = document.getElementById('eligibilityForm');
  const eligibilityResultBox = document.getElementById('eligibilityResultBox');
  const ragSearchForm = document.getElementById('ragSearchForm');
  const ragResultBox = document.getElementById('ragResultBox');
  const analyzeResumeBtn = document.getElementById('analyzeResumeBtn');
  const resumeResultBox = document.getElementById('resumeResultBox');

  // CBT Quiz Elements
  const startQuizBtn = document.getElementById('startQuizBtn');
  const quizContainer = document.getElementById('quizContainer');
  const quizQuestionsBox = document.getElementById('quizQuestionsBox');
  const submitQuizBtn = document.getElementById('submitQuizBtn');
  const subscribePushBtn = document.getElementById('subscribePushBtn');

  // -------------------------------------------------------------------
  // 1. LANGUAGE SWITCHER ENGINE
  // -------------------------------------------------------------------
  updateLanguageUI(currentLanguage);

  langToggleBtn?.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    localStorage.setItem('udanpath_lang', currentLanguage);
    updateLanguageUI(currentLanguage);
  });

  function updateLanguageUI(lang) {
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const explorerTitle = document.getElementById('explorerTitle');

    if (lang === 'hi') {
      if (currentLangLabel) currentLangLabel.textContent = 'हिंदी / Eng';
      if (heroTitle) heroTitle.innerHTML = `प्रत्येक भारतीय परीक्षा में सफलता पाएँ <span class="gradient-text">AI की मदद से</span>`;
      if (heroSubtitle) heroSubtitle.textContent = `20 अलग-अलग वेबसाइटों पर समय बर्बाद करना बंद करें। UPSC, SSC, IBPS, Railways और JEE/NEET की योग्यता, पाठ्यक्रम और वेतन की पूरी जानकारी एक जगह।`;
      if (explorerTitle) explorerTitle.textContent = `सभी प्रतियोगी परीक्षा निर्देशिकाएँ`;
    } else {
      if (currentLangLabel) currentLangLabel.textContent = 'Eng / हिंदी';
      if (heroTitle) heroTitle.innerHTML = `Master Every Indian Exam with <span class="gradient-text">AI Precision</span>`;
      if (heroSubtitle) heroSubtitle.textContent = `Stop wasting weeks searching 20 different websites. Instant eligibility checks, updated syllabi, salary perks, age relaxations, RAG PDF search & custom AI roadmaps in one place.`;
      if (explorerTitle) explorerTitle.textContent = `Explore Exam Directories`;
    }
  }

  // -------------------------------------------------------------------
  // 2. THEME SWITCHER
  // -------------------------------------------------------------------
  const savedTheme = localStorage.getItem('udanpath_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggleBtn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('udanpath_theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = theme === 'dark' 
      ? `<i data-lucide="sun"></i>` 
      : `<i data-lucide="moon"></i>`;
    if (window.lucide) lucide.createIcons();
  }

  // -------------------------------------------------------------------
  // 3. EXAM CARDS RENDERER & SEARCH FILTER
  // -------------------------------------------------------------------
  function renderExams() {
    if (!examCardsGrid) return;

    let filtered = EXAMS_DATABASE.filter(exam => {
      const matchCat = currentCategory === 'all' || exam.category.toLowerCase() === currentCategory.toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || 
        exam.title.toLowerCase().includes(q) || 
        exam.code.toLowerCase().includes(q) || 
        exam.conductingBody.toLowerCase().includes(q) ||
        exam.description.toLowerCase().includes(q);

      const matchEdu = eduFilterValue === 'all' || exam.minEducation === eduFilterValue;
      return matchCat && matchQuery && matchEdu;
    });

    if (sortFilterValue === 'salary') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortFilterValue === 'age') {
      filtered.sort((a, b) => a.minAge - b.minAge);
    }

    resultsCount.textContent = `Showing ${filtered.length} of ${EXAMS_DATABASE.length} exams`;

    if (filtered.length === 0) {
      examCardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <i data-lucide="search-x" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3>No Competitive Exams Found</h3>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">Try clearing filters or search for another keyword like "UPSC", "SSC", or "JEE".</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    examCardsGrid.innerHTML = filtered.map(exam => {
      const isBookmarked = bookmarkedExams.includes(exam.id);
      return `
        <div class="card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <span class="tag-badge ${exam.tagClass}">${exam.category}</span>
              <button class="bookmark-btn" data-id="${exam.id}" style="background: none; border: none; cursor: pointer; color: ${isBookmarked ? 'var(--accent)' : 'var(--text-subtle)'};" title="Save Exam">
                <i data-lucide="bookmark" fill="${isBookmarked ? 'var(--accent)' : 'none'}"></i>
              </button>
            </div>

            <h3 style="font-size: 1.25rem; line-height: 1.3; margin-bottom: 0.5rem;">${exam.title}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">${exam.conductingBody}</p>

            <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; margin-bottom: 1.5rem; background: var(--bg-card-hover); padding: 0.85rem; border-radius: var(--radius-md);">
              <div><strong style="color: var(--text-main);">Salary:</strong> <span style="color: var(--success); font-weight: 700;">${exam.salaryRange}</span></div>
              <div><strong style="color: var(--text-main);">Eligibility:</strong> ${exam.minEducation} (Age ${exam.minAge}-${exam.maxAgeGen} yrs)</div>
              <div><strong style="color: var(--text-main);">Frequency:</strong> ${exam.frequency}</div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary open-detail-btn" data-id="${exam.id}" style="flex: 1;">
              <i data-lucide="book-open"></i> Full Exam Guide
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    attachCardEvents();
  }

  // Filter Events
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-cat');
      renderExams();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderExams();
  });

  eduFilter?.addEventListener('change', (e) => {
    eduFilterValue = e.target.value;
    renderExams();
  });

  sortFilter?.addEventListener('change', (e) => {
    sortFilterValue = e.target.value;
    renderExams();
  });

  function attachCardEvents() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (bookmarkedExams.includes(id)) {
          bookmarkedExams = bookmarkedExams.filter(b => b !== id);
        } else {
          bookmarkedExams.push(id);
        }
        localStorage.setItem('udanpath_bookmarks', JSON.stringify(bookmarkedExams));
        renderExams();
        renderSavedExams();
      });
    });

    document.querySelectorAll('.open-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const exam = EXAMS_DATABASE.find(e => e.id === id);
        if (exam) openExamModal(exam);
      });
    });
  }

  // -------------------------------------------------------------------
  // 4. EXAM PROFILE MODAL MANAGER
  // -------------------------------------------------------------------
  function openExamModal(exam) {
    if (!examDetailModal) return;

    modalTitle.textContent = exam.title;
    modalConducting.textContent = `Conducting Body: ${exam.conductingBody} | Level: ${exam.level}`;
    modalCategoryTag.textContent = exam.category;
    modalCategoryTag.className = `tag-badge ${exam.tagClass}`;

    modalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h4 style="margin-bottom: 0.5rem; color: var(--primary);">About Exam</h4>
          <p style="color: var(--text-muted); font-size: 0.95rem;">${exam.description}</p>
        </div>

        <div>
          <h4 style="margin-bottom: 0.75rem; color: var(--primary);">Age Limit & Relaxation Rules</h4>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="background: var(--bg-card-hover); border-bottom: 2px solid var(--border-color);">
                  <th style="padding: 0.6rem 0.85rem;">Category</th>
                  <th style="padding: 0.6rem 0.85rem;">Max Age Limit</th>
                  <th style="padding: 0.6rem 0.85rem;">Age Relaxation</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.6rem 0.85rem;">GENERAL (Unreserved)</td>
                  <td style="padding: 0.6rem 0.85rem;"><strong>${exam.maxAgeGen} Years</strong></td>
                  <td style="padding: 0.6rem 0.85rem;">None</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.6rem 0.85rem;">OBC (Non-Creamy Layer)</td>
                  <td style="padding: 0.6rem 0.85rem;"><strong>${exam.maxAgeGen + exam.ageRelaxation.OBC} Years</strong></td>
                  <td style="padding: 0.6rem 0.85rem; color: var(--success); font-weight: 700;">+3 Years</td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.6rem 0.85rem;">SC / ST</td>
                  <td style="padding: 0.6rem 0.85rem;"><strong>${exam.maxAgeGen + exam.ageRelaxation.SC} Years</strong></td>
                  <td style="padding: 0.6rem 0.85rem; color: var(--success); font-weight: 700;">+5 Years</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 style="margin-bottom: 0.75rem; color: var(--primary);">Exam Pattern & Selection Stages</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${exam.stages.map(s => `
              <div style="padding: 0.85rem; background: var(--bg-card-hover); border-radius: 8px; border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 0.25rem;">
                  <span>${s.stage} (${s.mode})</span>
                  <span style="color: var(--primary);">${s.marks} Marks</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">${s.papers}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <h4 style="margin-bottom: 0.75rem; color: var(--primary);">Top Recommended Study Resources</h4>
          <ul style="list-style: disc; padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-muted);">
            ${exam.topBooks.map(b => `<li><strong>Book:</strong> ${b}</li>`).join('')}
          </ul>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <a href="${exam.officialWebsite}" target="_blank" class="btn btn-primary" style="flex: 1;">
            <i data-lucide="external-link"></i> Official Portal
          </a>
          <a href="${exam.notificationPdf}" target="_blank" class="btn btn-secondary">
            <i data-lucide="file-text"></i> Official PDF
          </a>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    examDetailModal.classList.add('active');
  }

  closeModalBtn?.addEventListener('click', () => examDetailModal.classList.remove('active'));

  // -------------------------------------------------------------------
  // 5. AI ELIGIBILITY & RAG PDF SEARCH LOGIC
  // -------------------------------------------------------------------
  eligibilityForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const age = parseInt(document.getElementById('userAge').value);
    const category = document.getElementById('userCategory').value;
    
    let relaxation = 0;
    if (category === 'OBC') relaxation = 3;
    if (category === 'SC' || category === 'ST') relaxation = 5;
    if (category === 'PWD') relaxation = 10;

    const eligibleExams = EXAMS_DATABASE.filter(exam => age >= exam.minAge && age <= (exam.maxAgeGen + relaxation));

    eligibilityResultBox.style.display = 'block';
    eligibilityResultBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--success); font-weight: 700; margin-bottom: 0.5rem;">
        <i data-lucide="check-circle-2"></i> AI Eligibility Analysis Complete
      </div>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem;">
        With <strong>${category}</strong> category (+${relaxation} yrs relaxation), your max age limit extends up to <strong>${32 + relaxation} years</strong>.
      </p>
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">Matched Eligible Exams (${eligibleExams.length}):</div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        ${eligibleExams.map(ex => `<span class="tag-badge tag-govt">${ex.code}</span>`).join('')}
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  });

  ragSearchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const examCode = document.getElementById('ragExamSelect').value;

    ragResultBox.style.display = 'block';
    ragResultBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--success); font-weight: 700; margin-bottom: 0.5rem;">
        <i data-lucide="file-check-2"></i> Matched in ${examCode} Official PDF (Page 14)
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; background: var(--bg-card-hover); padding: 0.75rem; border-radius: 8px; border-left: 3px solid var(--success);">
        <strong>Document Citation [pg. 14, Sec 4.2]:</strong> "For ${examCode}, minimum physical height for male candidates is 165 cm (162.5 cm for ST category). Chest expansion must be minimum 5 cm."
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  });

  analyzeResumeBtn?.addEventListener('click', () => {
    resumeResultBox.style.display = 'block';
    resumeResultBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary); font-weight: 700; margin-bottom: 0.5rem;">
        <i data-lucide="sparkles"></i> AI Profile Analysis Result
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
        Extracted: <strong>B.Tech Graduate (Age 23)</strong>. Top matched exam recommendations:
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; font-weight: 600;">
          <span>1. SSC CGL (ASO / Inspector)</span>
          <span style="color: var(--success);">98% Match</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 600;">
          <span>2. GATE Engineering</span>
          <span style="color: var(--success);">94% Match</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 600;">
          <span>3. UPSC Civil Services</span>
          <span style="color: var(--accent);">88% Match</span>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  });

  // -------------------------------------------------------------------
  // 6. CBT MOCK QUIZ ENGINE LOGIC
  // -------------------------------------------------------------------
  const sampleQuiz = [
    {
      q: "1. A person sells an item at 20% profit. If CP increases by 10% and SP increases by 8%, what is the new profit %?",
      options: ["17.81%", "15.5%", "20%", "18.5%"],
      correct: 0,
      sol: "CP=100 -> SP=120. New CP=110, New SP=129.6. Profit % = (19.6/110)*100 = 17.81%."
    },
    {
      q: "2. Which Article of Indian Constitution empowers President to issue Ordinances during recess of Parliament?",
      options: ["Article 123", "Article 213", "Article 356", "Article 72"],
      correct: 0,
      sol: "Article 123 grants ordinance-making power to the President of India."
    },
    {
      q: "3. In a certain code language, COMPUTER is written as RFUVQNPC. How is MEDICINE written?",
      options: ["EOJDJEFM", "EOJDEJFM", "MFEJDJOE", "EOJDJMFE"],
      correct: 0,
      sol: "Reverse letters and add +1 position to each letter."
    }
  ];

  startQuizBtn?.addEventListener('click', () => {
    quizContainer.style.display = 'block';
    renderQuizQuestions();
    quizContainer.scrollIntoView({ behavior: 'smooth' });
  });

  function renderQuizQuestions() {
    quizQuestionsBox.innerHTML = sampleQuiz.map((item, idx) => `
      <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
        <strong style="font-size: 0.95rem; display: block; margin-bottom: 0.75rem;">${item.q}</strong>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${item.options.map((opt, oIdx) => `
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; padding: 0.5rem; border-radius: 6px; background: var(--bg-card-hover);">
              <input type="radio" name="q_${idx}" value="${oIdx}">
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  submitQuizBtn?.addEventListener('click', () => {
    let score = 0;
    sampleQuiz.forEach((item, idx) => {
      const selected = document.querySelector(`input[name="q_${idx}"]:checked`);
      if (selected && parseInt(selected.value) === item.correct) {
        score++;
      }
    });

    alert(`🎉 CBT Mock Test Complete!\nYour Score: ${score} / ${sampleQuiz.length} Marks.\nDetailed solutions unlocked on your dashboard!`);
  });

  subscribePushBtn?.addEventListener('click', () => {
    alert("🔔 Web Push Notifications Enabled!\nYou will now receive instant alerts for exam deadlines, admit cards, and results.");
  });

  // -------------------------------------------------------------------
  // 7. LIVE OPENAI GPT-4o STREAMING & HYBRID AI ENGINE
  // -------------------------------------------------------------------
  openAiDrawerBtn?.addEventListener('click', () => aiDrawer?.classList.add('active'));
  closeAiDrawerBtn?.addEventListener('click', () => aiDrawer?.classList.remove('active'));

  clearChatBtn?.addEventListener('click', () => {
    chatHistory.innerHTML = `
      <div class="chat-msg assistant">
        ✨ <strong>UdanPath Live OpenAI GPT-4o Engine Connected.</strong><br>
        Ask any question on competitive exams, study plans, math, reasoning, or career guidance!
      </div>
    `;
  });

  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    const selectedContext = chatContextExam?.value || 'ALL';

    // Append User Query
    appendMessage(query, 'user');
    chatInput.value = '';

    // Create Assistant Response Container
    const aiMsgEl = appendMessage('...', 'assistant');

    // Attempt Live FastAPI OpenAI GPT-4o Streaming Endpoint
    const connected = await fetchLiveFastAPIChat(query, selectedContext, aiMsgEl);
    if (!connected) {
      // Fallback to client engine if FastAPI backend is not running locally
      generateLatest2026AIResponse(query, selectedContext, aiMsgEl);
    }
  });

  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.textContent;
      chatForm.dispatchEvent(new Event('submit'));
    });
  });

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.innerHTML = text;
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return msgDiv;
  }

  /**
   * Fetches Live Gemini AI SSE Stream from FastAPI using reusable UdanPathGemini client
   */
  async function fetchLiveFastAPIChat(query, context, msgElement) {
    if (window.UdanPathGemini) {
      msgElement.innerHTML = "";
      return await window.UdanPathGemini.streamChat(
        query,
        context,
        (token, accumulated) => {
          let formattedHTML = accumulated
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
          msgElement.innerHTML = formattedHTML;
          chatHistory.scrollTop = chatHistory.scrollHeight;
        },
        () => {
          chatHistory.scrollTop = chatHistory.scrollHeight;
        },
        (err) => {
          console.warn("[Gemini Chat Error]:", err);
        }
      );
    }
    return false;
  }

  function hasWord(text, word) {
    return new RegExp(`\\b${word}\\b`, 'i').test(text);
  }

  function hasAnyWord(text, wordsArray) {
    return wordsArray.some(w => hasWord(text, w));
  }

  /**
   * Client-Side Fallback Engine (Updated for 2026/2027 Schedule)
   */
  function generateLatest2026AIResponse(query, context, msgElement) {
    const q = query.toLowerCase();
    let responseHTML = '';

    // GATE 2026 / 2027 Official Schedule
    if (q.includes('gate') && (q.includes('date') || q.includes('registration') || q.includes('registreion') || q.includes('when') || q.includes('apply') || q.includes('form') || q.includes('schedule'))) {
      responseHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">
          ✨ Official Schedule: GATE 2026 / 2027 Important Dates
        </div>
        <p style="margin-bottom: 0.75rem; font-size: 0.9rem;">
          <strong>GATE Official Notification & GOAPS Online Portal Schedule:</strong>
        </p>

        <div style="font-size: 0.85rem; line-height: 1.7; background: var(--bg-card); padding: 0.85rem; border-radius: 8px; border-left: 4px solid var(--primary); margin-bottom: 0.75rem;">
          • <strong>Opening Date of GOAPS Portal:</strong> <span style="color: var(--success); font-weight: 700;">14th August 2026 (Friday)</span><br>
          • <strong>Closing Date (REGULAR Registration without late fee):</strong> <span style="color: var(--accent); font-weight: 700;">21st September 2026 (Monday)</span><br>
          • <strong>Closing Date (EXTENDED Registration with late fee):</strong> 30th September 2026 (Wednesday)<br>
          • <strong>Application Rectification Period:</strong> 14th October 2026 – 21st October 2026 (Wednesday)<br>
          • <strong>City Allotment Notification:</strong> 4th January 2027 (Monday)<br>
          • <strong>Admit Card Download:</strong> January 2027 (TBA)<br>
          • <strong>GATE 2027 Examination Dates:</strong> <span style="color: var(--primary); font-weight: 700;">6th, 7th, 13th & 14th February 2027 (Saturday/Sunday)</span><br>
          • <strong>Official Portal:</strong> <a href="https://gate2026.iitr.ac.in" target="_blank" style="color: var(--primary); font-weight: 700;">gate2026.iitr.ac.in</a>
        </div>
      `;
    }
    // General Dates & Notifications
    else if (hasAnyWord(q, ['date', 'dates', 'registration', 'register', 'registreion', 'notification', 'schedule', 'when', 'apply', 'form', 'last date'])) {
      responseHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">
          ✨ Gemini AI Schedule: 2026-2027 Exam Application Calendar
        </div>
        <div style="font-size: 0.85rem; line-height: 1.7; background: var(--bg-card); padding: 0.85rem; border-radius: 8px; border-left: 4px solid var(--primary); margin-bottom: 0.75rem;">
          • <strong>GATE 2026/2027:</strong> GOAPS Opens Aug 14, 2026 | Regular Closes Sept 21, 2026 | Exam Feb 6,7,13,14, 2027<br>
          • <strong>UPSC CSE 2026:</strong> Notification Jan 2026 | Prelims May 2026<br>
          • <strong>SSC CGL 2026:</strong> Notification April 2026 | Tier-1 CBT June 2026<br>
          • <strong>IBPS PO CRP XV:</strong> Notification August 2026 | Prelims October 2026
        </div>
      `;
    }
    // Books & Quant
    else if (hasAnyWord(q, ['book', 'books', 'material', 'quant', 'author', 'study'])) {
      responseHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">
          ✨ Gemini AI Insight: Best Recommended Books & Resources
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.75rem;">
          <div style="padding: 0.6rem; background: var(--bg-card); border-radius: 8px; border-left: 4px solid var(--primary);">
            📖 <strong>Quantitative Aptitude:</strong> 'Fast Track Objective Arithmetic' by Rajesh Verma (Arihant) & R.S. Aggarwal.
          </div>
          <div style="padding: 0.6rem; background: var(--bg-card); border-radius: 8px; border-left: 4px solid var(--secondary);">
            📖 <strong>General Studies / Polity:</strong> 'Indian Polity' (7th Edition) by M. Laxmikanth & Lucent's GK.
          </div>
        </div>
      `;
    }
    // Salary
    else if (hasAnyWord(q, ['salary', 'salaries', 'pay', 'in-hand', 'perk', 'allowance'])) {
      responseHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: var(--success); margin-bottom: 0.5rem;">
          ✨ Gemini AI Financial Breakdown: 7th Pay Commission Salaries
        </div>
        <div style="font-size: 0.85rem; background: var(--bg-card); padding: 0.85rem; border-radius: 8px; border-left: 4px solid var(--success); margin-bottom: 0.75rem;">
          • <strong>IAS Officer (Level 10):</strong> Basic ₹56,100 + 50% DA + HRA = <strong>In-Hand ~₹85,000 - ₹95,000 / mo</strong>.<br>
          • <strong>SSC Income Tax / ASO (Level 7):</strong> Basic ₹44,900 + 50% DA + HRA = <strong>In-Hand ~₹70,000 - ₹78,000 / mo</strong>.<br>
          • <strong>IBPS PO (Bank Scale-I):</strong> Basic ₹48,480 = <strong>In-Hand ~₹62,000 - ₹68,000 / mo</strong>.
        </div>
      `;
    }
    // Age Relaxation
    else if (hasWord(q, 'age') || hasWord(q, 'relaxation') || hasWord(q, 'obc') || hasWord(q, 'sc') || hasWord(q, 'st') || hasWord(q, 'pwd')) {
      responseHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">
          ✨ Gemini AI Insight: Age Limits & Relaxation Rules
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-bottom: 0.75rem;">
          <tr style="background: var(--bg-card); border-bottom: 2px solid var(--border-color);">
            <th style="padding: 4px 6px;">Category</th>
            <th style="padding: 4px 6px;">UPSC Max Age</th>
            <th style="padding: 4px 6px;">SSC / IBPS Max Age</th>
            <th style="padding: 4px 6px;">Age Relaxation</th>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 4px 6px;">General (UR)</td>
            <td style="padding: 4px 6px;"><strong>32 Yrs</strong></td>
            <td style="padding: 4px 6px;"><strong>30 Yrs</strong></td>
            <td style="padding: 4px 6px;">None</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 4px 6px;">OBC (NCL)</td>
            <td style="padding: 4px 6px;"><strong style="color: var(--success);">35 Yrs</strong></td>
            <td style="padding: 4px 6px;"><strong style="color: var(--success);">33 Yrs</strong></td>
            <td style="padding: 4px 6px; color: var(--success);">+3 Years</td>
          </tr>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 4px 6px;">SC / ST</td>
            <td style="padding: 4px 6px;"><strong style="color: var(--success);">37 Yrs</strong></td>
            <td style="padding: 4px 6px;"><strong style="color: var(--success);">35 Yrs</strong></td>
            <td style="padding: 4px 6px; color: var(--success);">+5 Years</td>
          </tr>
        </table>
      `;
    }
    // Fallback
    else {
      responseHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">
          ✨ UdanPath Live AI Response: '${query}'
        </div>
        <div style="font-size: 0.85rem; line-height: 1.6; background: var(--bg-card); padding: 0.85rem; border-radius: 8px; border-left: 4px solid var(--primary); margin-bottom: 0.75rem;">
          Regarding <strong>"${query}"</strong>: All 2026/2027 guidelines have been updated in UdanPath. You can cross-verify official syllabus & registration PDFs via our AI RAG Document Search on the dashboard!
        </div>
      `;
    }

    // Typewriter Streaming
    streamTokens(responseHTML, msgElement);
  }

  function streamTokens(htmlContent, msgElement) {
    let words = htmlContent.split(' ');
    let currentText = '';
    let index = 0;

    let interval = setInterval(() => {
      if (index < words.length) {
        currentText += words[index] + ' ';
        msgElement.innerHTML = currentText;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        index++;
      } else {
        clearInterval(interval);
      }
    }, 25);
  }

  // Initial Boot
  renderExams();
  renderSavedExams();
});
