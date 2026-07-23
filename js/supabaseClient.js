/**
 * UDANPATH Reusable Frontend Supabase Client
 * Uses NEXT_PUBLIC_SUPABASE_ANON_KEY and NEXT_PUBLIC_SUPABASE_URL only.
 * Configured to work in browser environments with automatic fallback and backend sync.
 */

let supabaseInstance = null;

// Default environment values (Injected safely at runtime)
const DEFAULT_SUPABASE_URL = "https://hrvaxxyvwwpnoajiixey.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmF4eHl2d3dwbm9hamlpeGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NjQ4MjYsImV4cCI6MjEwMDM0MDgyNn0.dVCy66ZQkHs_vUfcOmFzXKAYmuR-8UFtsHhaa_iAKeQ";

/**
 * Initializes and returns the singleton Supabase client.
 */
async function initSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  let url = DEFAULT_SUPABASE_URL;
  let anonKey = DEFAULT_SUPABASE_ANON_KEY;

  // Try fetching public config from FastAPI backend endpoint
  try {
    const res = await fetch("http://localhost:8000/api/v1/config/public");
    if (res.ok) {
      const data = await res.json();
      if (data.supabase_url) url = data.supabase_url;
      if (data.supabase_anon_key) anonKey = data.supabase_anon_key;
    }
  } catch (err) {
    console.log("[Supabase Frontend] Using fallback client environment config.");
  }

  if (window.supabase && window.supabase.createClient) {
    try {
      supabaseInstance = window.supabase.createClient(url, anonKey);
      console.log("✅ [Supabase Client] Initialized successfully with Anon Key.");
    } catch (e) {
      console.error("[Supabase Client] Failed to create client:", e);
    }
  } else {
    console.warn("[Supabase Client] Supabase SDK script not loaded yet.");
  }

  return supabaseInstance;
}

/**
 * Database Helper: Fetch exams from Supabase table
 */
async function fetchExamsFromSupabase() {
  const client = await initSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('exams').select('*');
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase DB] Error querying exams table:', err.message);
    return null;
  }
}

/**
 * Auth Helper: Sign up user
 */
async function signUpUser(email, password, fullName = '') {
  const client = await initSupabaseClient();
  if (!client) return { error: { message: 'Supabase client not initialized' } };

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    return { data, error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Auth Helper: Sign in user
 */
async function signInUser(email, password) {
  const client = await initSupabaseClient();
  if (!client) return { error: { message: 'Supabase client not initialized' } };

  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Auth Helper: Get active session
 */
async function getUserSession() {
  const client = await initSupabaseClient();
  if (!client) return null;

  try {
    const { data } = await client.auth.getSession();
    return data?.session || null;
  } catch (err) {
    return null;
  }
}

/**
 * Storage Helper: Upload file to storage bucket
 */
async function uploadStorageFile(bucketName, filePath, file) {
  const client = await initSupabaseClient();
  if (!client) return { error: { message: 'Supabase client not initialized' } };

  try {
    const { data, error } = await client.storage.from(bucketName).upload(filePath, file, { upsert: true });
    return { data, error };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Service Diagnostics: Check status of all backend connections
 */
async function verifyAllBackendServices() {
  try {
    const res = await fetch("http://localhost:8000/api/v1/health");
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend health check offline:", err);
  }
  return null;
}

// Export functions to global scope
window.UdanPathSupabase = {
  init: initSupabaseClient,
  fetchExams: fetchExamsFromSupabase,
  signUp: signUpUser,
  signIn: signInUser,
  getSession: getUserSession,
  uploadFile: uploadStorageFile,
  verifyBackendServices: verifyAllBackendServices
};
