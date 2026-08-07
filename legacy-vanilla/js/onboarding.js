/**
 * UDANPATH - AI Personalized Student Onboarding Controller
 * Manages 8-step onboarding wizard, conditional education branching, multi-select chips,
 * and saves user profile for smart exam ranking.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  let currentStep = 1;
  const totalSteps = 8;

  // DOM Elements
  const stepProgressBarFill = document.getElementById('stepProgressBarFill');
  const stepBadgeText = document.getElementById('stepBadgeText');
  const stepCategoryLabel = document.getElementById('stepCategoryLabel');
  const stepPercentageText = document.getElementById('stepPercentageText');
  const wizardPrevBtn = document.getElementById('wizardPrevBtn');
  const wizardNextBtn = document.getElementById('wizardNextBtn');
  const obEducation = document.getElementById('obEducation');
  const branchContainer = document.getElementById('branchContainer');
  const obBranch = document.getElementById('obBranch');

  // Step Category Names
  const stepCategoryNames = [
    "Welcome & AI Intro",
    "Personal Details",
    "Educational Qualification",
    "Academic Performance",
    "Career Interests",
    "Dream Career Destination",
    "Skills & Strengths",
    "Study Preferences"
  ];

  // Conditional Branching for Education Selection
  obEducation?.addEventListener('change', () => {
    const val = obEducation.value;
    if (val === 'B.Tech' || val === 'Diploma' || val === 'ITI' || val === 'M.Tech') {
      branchContainer.style.display = 'flex';
      if (val === 'ITI') {
        obBranch.innerHTML = `
          <option value="Electrician">Electrician</option>
          <option value="Fitter">Fitter</option>
          <option value="Machinest">Machinest</option>
          <option value="COPA (Computer Operator)">COPA (Computer Operator)</option>
          <option value="Welder">Welder</option>
        `;
      } else {
        obBranch.innerHTML = `
          <option value="Computer Engineering">Computer Engineering / CS</option>
          <option value="Information Technology">Information Technology (IT)</option>
          <option value="AI & ML">AI & Machine Learning</option>
          <option value="Data Science">Data Science</option>
          <option value="Cyber Security">Cyber Security</option>
          <option value="Mechanical">Mechanical Engineering</option>
          <option value="Civil">Civil Engineering</option>
          <option value="Electrical">Electrical Engineering</option>
          <option value="Electronics & Comm">Electronics & Communication (EC)</option>
        `;
      }
    } else {
      branchContainer.style.display = 'none';
    }
  });

  // Toggle Chip Selections
  document.querySelectorAll('.chip-item').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });

  // Navigation Button Handlers
  wizardPrevBtn?.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateStepUI();
    }
  });

  wizardNextBtn?.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        currentStep++;
        updateStepUI();
      } else {
        completeOnboarding();
      }
    }
  });

  function validateStep(step) {
    if (step === 2) {
      const name = document.getElementById('obFullName').value.trim();
      const dob = document.getElementById('obDob').value;
      const state = document.getElementById('obState').value.trim();
      const city = document.getElementById('obCity').value.trim();
      if (!name || !dob || !state || !city) {
        showToast('Please complete all required personal details', 'error');
        return false;
      }
    }
    return true;
  }

  function updateStepUI() {
    // Hide all steps, show current
    for (let i = 1; i <= totalSteps; i++) {
      const el = document.getElementById(`step${i}`);
      if (el) {
        if (i === currentStep) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    }

    // Update Progress Bar & Badges
    const pct = (currentStep / totalSteps) * 100;
    if (stepProgressBarFill) stepProgressBarFill.style.width = `${pct}%`;
    if (stepBadgeText) stepBadgeText.textContent = `Step ${currentStep} of ${totalSteps}`;
    if (stepCategoryLabel) stepCategoryLabel.textContent = stepCategoryNames[currentStep - 1];
    if (stepPercentageText) stepPercentageText.textContent = `${Math.round(pct)}% Complete`;

    // Button States
    if (wizardPrevBtn) {
      wizardPrevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    if (wizardNextBtn) {
      if (currentStep === totalSteps) {
        wizardNextBtn.innerHTML = `<span>Generate AI Dashboard</span> <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>`;
      } else {
        wizardNextBtn.innerHTML = `<span>Next Step</span> <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>`;
      }
      if (window.lucide) lucide.createIcons();
    }
  }

  // Complete Onboarding & Generate Profile
  async function completeOnboarding() {
    const selectedInterests = Array.from(document.querySelectorAll('#careerInterestsContainer .chip-item.active'))
      .map(el => el.getAttribute('data-val'));
    const selectedSkills = Array.from(document.querySelectorAll('#skillsContainer .chip-item.active'))
      .map(el => el.getAttribute('data-val'));

    const profileData = {
      fullName: document.getElementById('obFullName').value.trim() || 'Aspirant',
      dob: document.getElementById('obDob').value || '2003-01-01',
      category: document.getElementById('obCategory').value || 'GENERAL',
      gender: document.getElementById('obGender').value || 'Male',
      state: document.getElementById('obState').value.trim() || 'India',
      city: document.getElementById('obCity').value.trim() || 'City',
      education: document.getElementById('obEducation').value || 'B.Tech',
      branch: obBranch?.style.display !== 'none' ? (document.getElementById('obBranch').value || 'Computer Engineering') : 'N/A',
      semester: document.getElementById('obSemester').value || 'Semester 7',
      gradYear: document.getElementById('obGradYear').value || '2026',
      cgpa: document.getElementById('obCgpa').value.trim() || '8.0 CGPA',
      backlogs: document.getElementById('obBacklogs').value || '0',
      careerInterests: selectedInterests.length ? selectedInterests : ['Government Jobs', 'Software Engineering'],
      dreamRole: document.getElementById('obDreamRole').value || 'ISRO Scientist',
      skills: selectedSkills.length ? selectedSkills : ['Programming', 'Aptitude', 'Reasoning'],
      studyHours: document.getElementById('obStudyHours').value || '6-8 Hours',
      timeSlot: document.getElementById('obTimeSlot').value || 'Morning',
      learningMode: document.getElementById('obMode').value || 'Online',
      preferredLanguage: document.getElementById('obLanguage').value || 'English',
      onboardingCompleted: true,
      completedAt: new Date().toISOString()
    };

    // Save to LocalStorage
    localStorage.setItem('udanpath_onboarding_profile', JSON.stringify(profileData));

    showToast('✨ AI Career Counselor: Generating your personalized dashboard...', 'success');

    setTimeout(() => {
      window.location.href = 'index.html#dashboard';
    }, 1200);
  }

  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${icon}" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
