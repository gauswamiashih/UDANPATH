/**
 * UDANPATH - Global Command Palette & Navigation Engine
 * Activated by Ctrl+K or Cmd+K. Self-inserts HTML structure and handles keyboard listeners.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inject Command Palette HTML into body
  const paletteHTML = `
    <div id="commandPaletteOverlay" class="command-palette-overlay">
      <div class="command-palette">
        <div class="command-palette-header">
          <i data-lucide="search" style="color: var(--text-muted); width: 20px; height: 20px;"></i>
          <input type="text" id="commandPaletteInput" class="command-palette-input" placeholder="Type a command or page to navigate..." autocomplete="off">
          <span class="command-palette-shortcut">ESC</span>
        </div>
        <div id="commandPaletteResults" class="command-palette-results">
          <!-- Command Items -->
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', paletteHTML);

  const overlay = document.getElementById('commandPaletteOverlay');
  const input = document.getElementById('commandPaletteInput');
  const resultsContainer = document.getElementById('commandPaletteResults');

  // Master command registry
  const commands = [
    { title: "Go to Home / Welcome Portal", path: "index.html", keywords: "home main index", shortcut: "H" },
    { title: "Explore All Exams & Criteria", path: "explore-exams.html", keywords: "explore exam vacancy details finder", shortcut: "E" },
    { title: "Exam Categories & Boards", path: "exam-categories.html", keywords: "categories upsc gate ssc bank gpsc mpsc bpsc", shortcut: "C" },
    { title: "Career AI, RAG & Resume Guidance", path: "career-ai.html", keywords: "career ai chatbot rag pdf resume ats scanner", shortcut: "A" },
    { title: "AI Study Planner & Timetable", path: "study-planner.html", keywords: "planner schedule study daily weekly calendar", shortcut: "P" },
    { title: "Verified Coaching & Reference Books", path: "resources.html", keywords: "resources books coaching online youtube", shortcut: "R" },
    { title: "Mock Tests & CBT Practice Quiz", path: "mock-tests.html", keywords: "mock tests cbt quiz practice exam question paper", shortcut: "M" },
    { title: "Government & Corporate Scholarships", path: "scholarships.html", keywords: "scholarships fellowships funding grant pmrf", shortcut: "S" },
    { title: "Technical & Research Internships", path: "internships.html", keywords: "internships jobs training isro drdo barc placement", shortcut: "I" },
    { title: "Aspirant Blogs & Preparation Advice", path: "blogs.html", keywords: "blogs articles news advice notes toppers", shortcut: "B" },
    { title: "My Personalized Dashboard", path: "dashboard.html", keywords: "dashboard student progress target metrics", shortcut: "D" },
    { title: "My Profile & Qualification Data", path: "profile.html", keywords: "profile details cgpa reservation category state", shortcut: "U" },
    { title: "Settings & System Preferences", path: "settings.html", keywords: "settings theme dark mode notifications password", shortcut: "G" },
    { title: "Admin Portal & CMS Gateway", path: "admin.html", keywords: "admin panel cms crud exams backend management", shortcut: "X" },
    { title: "Toggle System Dark / Light Mode", action: "toggleTheme", keywords: "theme toggle dark light look", shortcut: "T" },
    { title: "Sign Out & Clear Active Session", action: "signOut", keywords: "logout signout exit clear session", shortcut: "Q" }
  ];

  let selectedIndex = 0;
  let activeFilteredCommands = [...commands];

  // Global Key Listener for activation (Ctrl+K or Cmd+K)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openPalette();
    }
    if (e.key === 'Escape') {
      closePalette();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePalette();
  });

  input.addEventListener('input', () => {
    filterCommands(input.value.trim());
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % activeFilteredCommands.length;
      renderResults();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + activeFilteredCommands.length) % activeFilteredCommands.length;
      renderResults();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeFilteredCommands[selectedIndex]) {
        executeCommand(activeFilteredCommands[selectedIndex]);
      }
    }
  });

  function openPalette() {
    overlay.classList.add('active');
    input.value = "";
    selectedIndex = 0;
    filterCommands("");
    setTimeout(() => input.focus(), 50);
  }

  function closePalette() {
    overlay.classList.remove('active');
  }

  function filterCommands(query) {
    if (!query) {
      activeFilteredCommands = [...commands];
    } else {
      const q = query.toLowerCase();
      activeFilteredCommands = commands.filter(cmd => 
        cmd.title.toLowerCase().includes(q) || cmd.keywords.toLowerCase().includes(q)
      );
    }
    selectedIndex = 0;
    renderResults();
  }

  function renderResults() {
    resultsContainer.innerHTML = activeFilteredCommands.map((cmd, idx) => `
      <div class="command-palette-item ${idx === selectedIndex ? 'selected' : ''}" data-index="${idx}">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <i data-lucide="${getIconForCommand(cmd)}" style="width: 16px; height: 16px; opacity: 0.85;"></i>
          <span>${cmd.title}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          ${cmd.path ? `<span class="command-palette-item-meta">Page</span>` : `<span class="command-palette-item-meta" style="background: rgba(37,99,235,0.15); color: var(--primary);">System</span>`}
          <span class="command-palette-shortcut">⌥${cmd.shortcut}</span>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();

    // Click events
    document.querySelectorAll('.command-palette-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'));
        executeCommand(activeFilteredCommands[idx]);
      });
    });
  }

  function executeCommand(cmd) {
    closePalette();
    if (cmd.path) {
      if (typeof window.switchView === 'function') {
        const viewMapping = {
          "index.html": "landing",
          "explore-exams.html": "explore",
          "exam-categories.html": "explore",
          "career-ai.html": "career-ai",
          "study-planner.html": "planner",
          "resources.html": "resources",
          "mock-tests.html": "planner",
          "dashboard.html": "landing",
          "profile.html": "profile",
          "admin.html": "admin"
        };
        const targetView = viewMapping[cmd.path];
        if (targetView) {
          window.switchView(targetView);
          return;
        }
      }
      window.location.href = cmd.path;
    } else if (cmd.action === 'toggleTheme') {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('udanpath_theme', nextTheme);
    } else if (cmd.action === 'signOut') {
      if (window.UdanPathSupabase) window.UdanPathSupabase.signOut();
      localStorage.removeItem('udanpath_onboarding_profile');
      window.location.href = 'index.html';
    }
  }

  function getIconForCommand(cmd) {
    if (cmd.path === "index.html") return "home";
    if (cmd.path === "explore-exams.html") return "compass";
    if (cmd.path === "exam-categories.html") return "layers";
    if (cmd.path === "career-ai.html") return "bot";
    if (cmd.path === "study-planner.html") return "calendar";
    if (cmd.path === "resources.html") return "book-open";
    if (cmd.path === "mock-tests.html") return "check-square";
    if (cmd.path === "scholarships.html") return "award";
    if (cmd.path === "internships.html") return "briefcase";
    if (cmd.path === "blogs.html") return "newspaper";
    if (cmd.path === "dashboard.html") return "layout";
    if (cmd.path === "profile.html") return "user";
    if (cmd.path === "settings.html") return "settings";
    if (cmd.path === "admin.html") return "lock";
    if (cmd.action === "toggleTheme") return "sun";
    return "log-out";
  }
});
