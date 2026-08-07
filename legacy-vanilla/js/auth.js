/**
 * UDANPATH - Authentication Page Logic
 * Connects Sign In, Create Account, and Google OAuth with Supabase Auth
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Initialize Supabase Client
  if (window.UdanPathSupabase) {
    await window.UdanPathSupabase.init();
  }

  // DOM Elements
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const authHeaderTitle = document.getElementById('authHeaderTitle');
  const authHeaderSubtitle = document.getElementById('authHeaderSubtitle');
  const toastContainer = document.getElementById('toastContainer');

  // Check URL Hash for tab selection (#signup or #signin)
  if (window.location.hash === '#signup') {
    switchToSignUp();
  }

  tabSignIn?.addEventListener('click', switchToSignIn);
  tabSignUp?.addEventListener('click', switchToSignUp);

  function switchToSignIn() {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    signInForm.classList.add('active');
    signUpForm.classList.remove('active');
    authHeaderTitle.textContent = 'Welcome Back';
    authHeaderSubtitle.textContent = 'Enter your credentials to access your exam dashboard';
  }

  function switchToSignUp() {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    signUpForm.classList.add('active');
    signInForm.classList.remove('active');
    authHeaderTitle.textContent = 'Create Aspirant Account';
    authHeaderSubtitle.textContent = 'Join 100,000+ Indian aspirants preparing with AI precision';
  }

  // Password Visibility Toggle
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword 
          ? '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>' 
          : '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
        if (window.lucide) lucide.createIcons();
      }
    });
  });

  // Handle Sign In Submission
  signInForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;
    const submitBtn = document.getElementById('signInSubmitBtn');

    if (!email || !password) {
      showToast('Please fill in both email and password', 'error');
      return;
    }

    setButtonLoading(submitBtn, true, 'Signing In...');

    const { data, error } = await window.UdanPathSupabase.signIn(email, password);

    setButtonLoading(submitBtn, false, 'Sign In to Account', 'arrow-right');

    if (error) {
      showToast(`Sign In Failed: ${error.message || 'Invalid credentials'}`, 'error');
    } else {
      showToast('🎉 Welcome back! Redirecting to dashboard...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    }
  });

  // Handle Create Account Submission
  signUpForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signUpName').value.trim();
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    const targetExam = document.getElementById('signUpTargetExam').value;
    const submitBtn = document.getElementById('signUpSubmitBtn');

    if (!name || !email || !password) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    setButtonLoading(submitBtn, true, 'Creating Account...');

    const { data, error } = await window.UdanPathSupabase.signUp(email, password, name);

    setButtonLoading(submitBtn, false, 'Create Free Aspirant Account', 'sparkles');

    if (error) {
      showToast(`Account Creation Error: ${error.message}`, 'error');
    } else {
      // Store local target exam preference
      localStorage.setItem('udanpath_target_exam', targetExam);
      showToast('✨ Account created successfully! Check your email or proceed to login.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }
  });

  // Handle Google OAuth Login Buttons
  document.querySelectorAll('.googleAuthBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      showToast('Connecting to Google OAuth...', 'info');
      const { error } = await window.UdanPathSupabase.signInWithGoogle();
      if (error) {
        showToast(`Google OAuth Error: ${error.message}`, 'error');
      }
    });
  });

  // Helper: Button Loading State
  function setButtonLoading(btn, isLoading, text, iconName = 'arrow-right') {
    if (!btn) return;
    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-ring"></span> <span>${text}</span>`;
    } else {
      btn.disabled = false;
      btn.innerHTML = `<span>${text}</span> <i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>`;
      if (window.lucide) lucide.createIcons();
    }
  }

  // Toast Notification System
  function showToast(message, type = 'info') {
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
