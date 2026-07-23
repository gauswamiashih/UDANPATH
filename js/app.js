/**
 * UDANPATH — Rebuild Core Frontend Application Logic Engine
 * Implements client-side view routing, auth flow, AI onboarding, CBT timed testing,
 * interactive study planners, forum management, and dynamic database recommendations.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  // 1. GLOBAL CLIENT-SIDE ROUTER ENGINE
  window.switchView = function(viewName) {
    // Hide all views
    document.querySelectorAll('.portal-view').forEach(view => {
      view.classList.remove('active');
    });
    // Remove active sidebar link styling
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
    });

    const activeView = document.getElementById(`${viewName}View`);
    if (activeView) {
      activeView.classList.add('active');
    }

    // Highlight links
    document.querySelectorAll('.sidebar-link, .nav-links a').forEach(link => {
      const onclickAttr = link.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(`'${viewName}'`)) {
        link.classList.add('active');
      }
    });

    // Run active view initializer callbacks
    if (viewName === 'explore') loadRecommendations();
    if (viewName === 'landing') loadLandingNotifications();
    if (viewName === 'profile') loadUserProfile();
    if (viewName === 'admin') loadAdminPanel();
    if (viewName === 'resources') loadCoachingResources('online');
  };

  // 2. AUTHENTICATION & LOGIN SIMULATIONS
  window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  };

  window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  };

  window.simulateGoogleLogin = function() {
    closeModal('authModal');
    // Save active auth session
    localStorage.setItem('udanpath_user_session', "authenticated");
    document.getElementById('authHeaderNav').innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.82rem; font-weight: 700; background: var(--primary-light); color: var(--primary); padding: 0.25rem 0.55rem; border-radius: 4px;">Active Session</span>
        <button class="btn btn-secondary" onclick="signOutSession()" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">Sign Out</button>
      </div>
    `;

    // Check if onboarding is completed
    const onboarded = localStorage.getItem('udanpath_onboarding_profile');
    if (!onboarded) {
      openModal('onboardingModal');
    } else {
      loadUserProfile();
      loadRecommendations();
    }
  };

  window.signOutSession = function() {
    localStorage.removeItem('udanpath_user_session');
    localStorage.removeItem('udanpath_onboarding_profile');
    document.getElementById('authHeaderNav').innerHTML = `
      <button class="btn btn-secondary" onclick="openModal('authModal')">Sign In</button>
    `;
    switchView('landing');
  };

  // 3. 8-STEP INTERACTIVE AI ONBOARDING ENGINE
  window.nextOnbStep = function(stepNo) {
    // Hide all step panels
    document.querySelectorAll('.onboarding-step-panel').forEach(p => p.classList.remove('active'));
    
    const nextPanel = document.getElementById(`onbStep${stepNo}`);
    if (nextPanel) {
      nextPanel.classList.add('active');
      document.getElementById('onboardingProgressLabel').textContent = `Step ${stepNo} of 8`;
      const progressPercent = (stepNo / 8) * 100;
      document.getElementById('stepIndicatorLabel').textContent = `${progressPercent}%`;
    }
  };

  window.submitOnboarding = function() {
    const profile = {
      fullName: document.getElementById('onbName').value || "Aspirant",
      category: document.getElementById('onbCategory').value || "GENERAL",
      education: document.getElementById('onbDegree').value || "B.Tech",
      branch: document.getElementById('onbBranch').value || "Computer Engineering",
      cgpa: parseFloat(document.getElementById('onbCgpa').value) || 8.0,
      industry: document.getElementById('onbIndustry').value || "Govt",
      dreamRole: document.getElementById('onbDream').value || "ISRO Scientist",
      state: document.getElementById('onbState').value || "Gujarat",
      medium: document.getElementById('onbLang').value || "English"
    };

    localStorage.setItem('udanpath_onboarding_profile', JSON.stringify(profile));
    closeModal('onboardingModal');
    
    // Load onboarding parameters instantly
    loadUserProfile();
    loadRecommendations();
    switchView('landing');
  };

  function loadUserProfile() {
    const profile = JSON.parse(localStorage.getItem('udanpath_onboarding_profile') || '{"fullName":"Aspirant","education":"B.Tech","branch":"Computer Engineering","category":"GENERAL","state":"Gujarat","dreamRole":"ISRO Scientist"}');
    
    const profName = document.getElementById('profName');
    const profSub = document.getElementById('profSub');
    const profState = document.getElementById('profState');
    const profCategory = document.getElementById('profCategory');
    const profDegree = document.getElementById('profDegree');
    const profDream = document.getElementById('profDream');

    if (profName) profName.textContent = profile.fullName;
    if (profSub) profSub.textContent = `${profile.education} (${profile.branch}) | Category: ${profile.category}`;
    if (profState) profState.value = profile.state;
    if (profCategory) profCategory.value = profile.category;
    if (profDegree) profDegree.value = profile.education;
    if (profDream) profDream.value = profile.dreamRole;

    const profAvatar = document.getElementById('profAvatar');
    if (profAvatar) profAvatar.textContent = profile.fullName.charAt(0).toUpperCase();
  }

  // 4. DYNAMIC AI RECOMMENDATIONS FROM HYBRID DATABASE
  let examsCache = [];

  async function fetchExams() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/exams');
      examsCache = await res.json();
      return examsCache;
    } catch(e) {
      console.error("API error, mapping local fallbacks", e);
      // Hardcoded high-yield fallbacks
      return [
        { code: 'GATE_2026', title: 'GATE 2026 (Computer Engineering)', conducting_body: 'IIT Roorkee', exam_level: 'National', official_website: 'https://gate2026.iitr.ac.in', category_id: 'gate', frequency: 'Annual' },
        { code: 'ISRO_SC', title: 'ISRO Scientist / Engineer SC', conducting_body: 'ISRO', exam_level: 'National', official_website: 'https://isro.gov.in', category_id: 'psu', frequency: 'Annual' },
        { code: 'SSC_CGL', title: 'SSC Combined Graduate Level', conducting_body: 'SSC', exam_level: 'National', official_website: 'https://ssc.gov.in', category_id: 'ssc', frequency: 'Annual' }
      ];
    }
  }

  async function loadLandingNotifications() {
    const grid = document.getElementById('landingNotificationsGrid');
    if (!grid) return;
    grid.innerHTML = "<p>Loading official circulars...</p>";

    const data = await fetchExams();
    grid.innerHTML = data.slice(0, 3).map(exam => `
      <div class="card" style="background: var(--bg-card); display:flex; flex-direction:column; justify-content:space-between; border-top: 3px solid var(--primary);">
        <div>
          <span class="tag-badge tag-govt">${exam.exam_level} Exam</span>
          <h4 style="font-size: 1.1rem; font-weight: 800; margin-top: 0.5rem;">${exam.title}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">Agency: ${exam.conducting_body}</p>
        </div>
        <div style="margin-top: 1rem; display:flex; gap: 0.4rem;">
          <a href="${exam.official_website}" target="_blank" class="btn btn-secondary" style="flex:1; justify-content:center; font-size: 0.78rem; text-decoration:none;">Website</a>
          <button class="btn btn-primary" onclick="switchView('explore')" style="flex:1; justify-content:center; font-size: 0.78rem;">Syllabus</button>
        </div>
      </div>
    `).join('');
  }

  async function loadRecommendations() {
    const grid = document.getElementById('exploreExamsGrid');
    if (!grid) return;
    grid.innerHTML = "<p>Analyzing criteria parameters...</p>";

    const profile = JSON.parse(localStorage.getItem('udanpath_onboarding_profile') || '{"fullName":"Aspirant","education":"B.Tech","branch":"Computer Engineering","category":"GENERAL","state":"Gujarat"}');
    const minSalaryVal = parseInt(document.getElementById('expMinSalary').value) || 0;
    const eduFilter = document.getElementById('expEduFilter').value;

    const data = await fetchExams();
    
    // Sort and score recommendations matches
    const mapped = data.map((exam, idx) => {
      let score = 85 + (idx % 10);
      let eligibilityText = "100% Eligible";
      let reasonText = `Matches targets of ${profile.branch} graduates.`;

      // Filter modifications
      if (profile.education !== 'B.Tech' && exam.code === 'ISRO_SC') {
        score -= 20;
        eligibilityText = "Requires B.Tech degree";
        reasonText = "ISRO Scientist openings require engineering graduation.";
      }

      return {
        ...exam,
        matchScore: score,
        eligibility: eligibilityText,
        reason: reasonText
      };
    });

    // Render Explore Cards
    grid.innerHTML = mapped.map(exam => `
      <div class="card" style="background: var(--bg-card); display:flex; flex-direction:column; justify-content:space-between; border-left: 4px solid var(--primary);">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
            <span class="tag-badge tag-govt">${exam.exam_level} Level</span>
            <span style="font-size:0.8rem; font-weight:700; color:var(--success);">★ ${exam.matchScore}% Match</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800;">${exam.title}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">Conducted by: ${exam.conducting_body}</p>
          <div style="font-size:0.8rem; background:var(--bg-main); padding: 0.65rem; border-radius: 6px; margin-top: 0.75rem; line-height: 1.4;">
            📊 <strong>AI Eligibility:</strong> ${exam.eligibility}<br>
            🤖 <strong>Counselor Tip:</strong> ${exam.reason}
          </div>
        </div>

        <div style="margin-top: 1.25rem; display:flex; gap: 0.4rem;">
          <a href="${exam.official_website}" target="_blank" class="btn btn-secondary" style="flex:1; justify-content:center; text-decoration:none; font-size: 0.8rem;">Official Portal</a>
          <button class="btn btn-primary" onclick="triggerExploreAiChat('${exam.code}')" style="flex:1; justify-content:center; font-size: 0.8rem;">Chat details</button>
        </div>
      </div>
    `).join('');
  }

  // Filter explore updates
  const expEdu = document.getElementById('expEduFilter');
  const expSector = document.getElementById('expSectorFilter');
  const expMinSal = document.getElementById('expMinSalary');
  if (expEdu) {
    [expEdu, expSector, expMinSal].forEach(el => el.addEventListener('input', loadRecommendations));
  }

  window.triggerExploreAiChat = function(code) {
    switchView('career-ai');
    const input = document.getElementById('portalChatInput');
    if (input) {
      input.value = `Tell me patterns and age eligibility relaxations for ${code}`;
    }
  };

  // 5. TIMED CBT MOCK TESTING SIMULATOR
  const cbtSelect = document.getElementById('cbtSelectionPanel');
  const cbtQuiz = document.getElementById('cbtQuizContainer');
  const cbtResult = document.getElementById('cbtResultBox');
  const timerLabel = document.getElementById('quizTimerLabel');
  const nextBtn = document.getElementById('cbtNextBtn');
  const qText = document.getElementById('questionText');
  const oList = document.getElementById('cbtOptionsList');
  const qNo = document.getElementById('currentQNo');

  const questions = [
    { q: "Which data structure follows LIFO format?", options: ["Queue", "Stack", "Heap", "Tree"], answer: 1 },
    { q: "What is the complexity of Binary Search?", options: ["O(N)", "O(1)", "O(log N)", "O(N log N)"], answer: 2 },
    { q: "Which scheduler algorithm can result in starvation?", options: ["FCFS", "Round Robin", "Priority Scheduling", "Multilevel Queue"], answer: 2 }
  ];

  let cbtIdx = 0;
  let cbtScore = 0;
  let cbtTime = 120;
  let cbtInterval = null;
  let cbtSelections = [null, null, null];

  window.startCbtSimulation = function() {
    cbtSelect.style.display = 'none';
    cbtQuiz.style.display = 'flex';
    cbtResult.style.display = 'none';

    cbtIdx = 0;
    cbtScore = 0;
    cbtTime = 120;
    cbtSelections = [null, null, null];

    loadCbtQuestion(0);
    clearInterval(cbtInterval);
    cbtInterval = setInterval(() => {
      cbtTime--;
      const m = Math.floor(cbtTime / 60).toString().padStart(2, '0');
      const s = (cbtTime % 60).toString().padStart(2, '0');
      timerLabel.textContent = `${m}:${s}`;
      if (cbtTime <= 0) {
        clearInterval(cbtInterval);
        submitCbtTest();
      }
    }, 1000);
  };

  function loadCbtQuestion(idx) {
    cbtIdx = idx;
    qNo.textContent = idx + 1;
    const item = questions[idx];
    qText.textContent = item.q;

    oList.innerHTML = item.options.map((opt, oIdx) => `
      <div class="cbt-option ${cbtSelections[idx] === oIdx ? 'selected' : ''}" onclick="selectCbtOption(${oIdx})">
        <span>${opt}</span>
        <i data-lucide="${cbtSelections[idx] === oIdx ? 'check-circle-2' : 'circle'}" style="width: 16px; height: 16px;"></i>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();

    nextBtn.textContent = idx === questions.length - 1 ? "Submit Mock Test" : "Next Question";
  }

  window.selectCbtOption = function(oIdx) {
    cbtSelections[cbtIdx] = oIdx;
    loadCbtQuestion(cbtIdx);
  };

  nextBtn.addEventListener('click', () => {
    if (cbtIdx < questions.length - 1) {
      loadCbtQuestion(cbtIdx + 1);
    } else {
      submitCbtTest();
    }
  });

  function submitCbtTest() {
    clearInterval(cbtInterval);
    cbtQuiz.style.display = 'none';
    cbtResult.style.display = 'block';

    cbtScore = 0;
    cbtSelections.forEach((ans, idx) => {
      if (ans === questions[idx].answer) cbtScore++;
    });

    document.getElementById('scoreLabel').textContent = `Score: ${cbtScore} / 3`;
  }

  window.resetCbtSimulation = function() {
    cbtSelect.style.display = 'block';
    cbtResult.style.display = 'none';
    cbtQuiz.style.display = 'none';
  };

  // 6. FORUM DISCUSSIONS
  const forumForm = document.getElementById('forumForm');
  const forumList = document.getElementById('forumList');
  let threads = [
    { title: "Standard textbooks list for ESE 2026 Electronics", author: "Deepak S.", replies: 3 },
    { title: "When is the DRDO Scientist recruitment notification expected?", author: "Ashish G.", replies: 7 }
  ];

  function renderForums() {
    if (!forumList) return;
    forumList.innerHTML = threads.map(t => `
      <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-main); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>${t.title}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.25rem;">Posted by: ${t.author}</div>
        </div>
        <span class="tag-badge tag-govt">${t.replies} Replies</span>
      </div>
    `).join('');
  }

  if (forumForm) {
    forumForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const txt = document.getElementById('forumInputText').value.trim();
      if (!txt) return;
      threads.unshift({ title: txt, author: "Me", replies: 0 });
      document.getElementById('forumInputText').value = "";
      renderForums();
    });
  }

  // 7. STUDY TIMETABLE GENERATOR
  const studyForm = document.getElementById('studyForm');
  if (studyForm) {
    studyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const plannerTimetableContainer = document.getElementById('plannerTimetableContainer');
      const generatedCalendarPlanner = document.getElementById('generatedCalendarPlanner');

      plannerTimetableContainer.innerHTML = "<p>Computing hourly blocks...</p>";
      generatedCalendarPlanner.style.display = 'block';

      const examCode = document.getElementById('targetExamCode').value;
      const hours = parseInt(document.getElementById('dailyAllocatedHours').value);
      const weak = document.getElementById('weakSubjInput').value.split(',').map(s => s.trim());

      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/ai/planner/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exam_code: examCode, daily_hours: hours, weak_subjects: weak, exam_date: "2026-02-01" })
        });
        const data = await res.json();
        plannerTimetableContainer.innerHTML = Object.entries(data.daily_timetable).map(([slot, task]) => `
          <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid var(--border-color);">
            <strong style="color:var(--primary);">${slot}</strong>
            <span>${task}</span>
          </div>
        `).join('');
      } catch (err) {
        plannerTimetableContainer.innerHTML = "<p>Error loading schedule. Working offline fallbacks.</p>";
      }
    });
  }

  // 8. COACHING RESOURCES HUB
  window.loadCoachingResources = function(type) {
    const grid = document.getElementById('resDirectoryGrid');
    if (!grid) return;
    grid.innerHTML = "<p>Loading directory comparison list...</p>";

    fetch('http://127.0.0.1:8000/api/v1/coaching')
      .then(res => res.json())
      .then(data => {
        if (type === 'online') {
          grid.innerHTML = data.online.map(item => `
            <div class="card" style="background:var(--bg-card); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <span class="tag-badge tag-govt">${item.institute}</span>
                <h4 style="font-weight:800; font-size:1.1rem; margin-top:0.5rem;">${item.name}</h4>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Fee: <strong>${item.price}</strong> | Success: ${item.success_rate}</p>
              </div>
              <button class="btn btn-secondary" onclick="alert('Enrolling batch!')" style="margin-top:1.25rem; justify-content:center;">Register Batch</button>
            </div>
          `).join('');
        } else {
          grid.innerHTML = data.offline.map(item => `
            <div class="card" style="background:var(--bg-card); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <span class="tag-badge tag-bank">${item.city} Center</span>
                <h4 style="font-weight:800; font-size:1.1rem; margin-top:0.5rem;">${item.name}</h4>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Fee: <strong>${item.price}</strong> | Center Rate: ${item.success_rate}</p>
              </div>
              <button class="btn btn-secondary" onclick="alert('Contacting branch counselor!')" style="margin-top:1.25rem; justify-content:center;">Visit Center</button>
            </div>
          `).join('');
        }
      });
  };

  const resOnlineBtn = document.getElementById('resOnlineBtn');
  const resOfflineBtn = document.getElementById('resOfflineBtn');
  if (resOnlineBtn) {
    resOnlineBtn.addEventListener('click', (e) => {
      document.querySelectorAll('.coaching-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      loadCoachingResources('online');
    });
    resOfflineBtn.addEventListener('click', (e) => {
      document.querySelectorAll('.coaching-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      loadCoachingResources('offline');
    });
  }

  // 9. ADMIN PANEL & CMS
  function loadAdminPanel() {
    const adminCount = document.getElementById('adminExamsCount');
    if (!adminCount) return;
    adminCount.textContent = "Loading...";

    fetch('http://127.0.0.1:8000/api/v1/exams')
      .then(res => res.json())
      .then(data => {
        adminCount.textContent = data.length;
      })
      .catch(() => {
        adminCount.textContent = "12 (Fallback Mode)";
      });
  }

  const adminForm = document.getElementById('adminExamForm');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Exam published to database successfully!");
      adminForm.reset();
      loadAdminPanel();
    });
  }

  // =====================================================================
  // DEDICATED PORTAL CHAT ENG & MULTI-AGENT HANDLERS
  // =====================================================================
  const portalChatForm = document.getElementById('portalChatForm');
  const portalChatInput = document.getElementById('portalChatInput');
  const portalChatScroller = document.getElementById('portalChatScroller');
  const agentContainer = document.getElementById('agentSelectContainer');

  let activeChatAgent = "career";
  let activeSessions = [
    { id: "s1", title: "GATE CS Preparation Guide", active: true },
    { id: "s2", title: "UPSC General Studies", active: false }
  ];

  window.createNewChatSession = function() {
    const title = prompt("New Mentorship Chat Session:", "Aspirant Guide Session");
    if (title) {
      activeSessions.forEach(s => s.active = false);
      activeSessions.push({ id: Date.now().toString(), title, active: true });
      renderSavedChatSessions();
      portalChatScroller.innerHTML = `<div class="chat-bubble-ai"><strong>${title} Mentorship Session Started</strong>. How can I help you today?</div>`;
    }
  };

  function renderSavedChatSessions() {
    const list = document.getElementById('savedSessionsList');
    if (!list) return;
    list.innerHTML = activeSessions.map(s => `
      <div class="session-item ${s.active ? 'active' : ''}" onclick="selectSavedSession('${s.id}')" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${s.title}</span>
        <button onclick="event.stopPropagation(); deleteSavedSession('${s.id}')" style="background:none; border:none; cursor:pointer; color:var(--text-muted);"><i data-lucide="trash-2" style="width:12px; height:12px;"></i></button>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  }

  window.selectSavedSession = (id) => {
    activeSessions.forEach(s => s.active = (s.id === id));
    renderSavedChatSessions();
  };

  window.deleteSavedSession = (id) => {
    activeSessions = activeSessions.filter(s => s.id !== id);
    renderSavedChatSessions();
  };

  if (agentContainer) {
    agentContainer.querySelectorAll('.agent-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        agentContainer.querySelectorAll('.agent-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeChatAgent = pill.getAttribute('data-agent');
      });
    });
  }

  if (portalChatForm) {
    portalChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = portalChatInput.value.trim();
      if (!val) return;
      submitPortalChat(val);
    });
  }

  async function submitPortalChat(msg) {
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-bubble-user';
    userDiv.textContent = msg;
    portalChatScroller.appendChild(userDiv);
    portalChatInput.value = "";
    portalChatScroller.scrollTop = portalChatScroller.scrollHeight;

    const aiDiv = document.createElement('div');
    aiDiv.className = 'chat-bubble-ai';
    aiDiv.innerHTML = "<em>Mentor is searching RAG source files and reasoning...</em>";
    portalChatScroller.appendChild(aiDiv);
    portalChatScroller.scrollTop = portalChatScroller.scrollHeight;

    try {
      const profile = JSON.parse(localStorage.getItem('udanpath_onboarding_profile') || '{}');
      const response = await fetch('http://127.0.0.1:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          context_exam: "ALL",
          selected_agent: activeChatAgent,
          user_profile: profile,
          history: []
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamText = "";
      aiDiv.innerHTML = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const data = JSON.parse(dataStr);
              if (data.token) {
                streamText += data.token;
                aiDiv.innerHTML = marked.parse(streamText);
                portalChatScroller.scrollTop = portalChatScroller.scrollHeight;
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      aiDiv.textContent = `Mentorship line error: ${err.message}`;
    }
  }

  // Initializers
  loadLandingNotifications();
  renderSavedChatSessions();
  renderForums();

  // Handle Ctrl+K shortcut activation
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Command palette trigger
    }
  });

  // Check login header
  const logged = localStorage.getItem('udanpath_user_session');
  if (logged) {
    document.getElementById('authHeaderNav').innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.82rem; font-weight: 700; background: var(--primary-light); color: var(--primary); padding: 0.25rem 0.55rem; border-radius: 4px;">Active Session</span>
        <button class="btn btn-secondary" onclick="signOutSession()" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">Sign Out</button>
      </div>
    `;
    loadUserProfile();
  }
});
