import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hrvaxxyvwwpnoajiixey.supabase.co";
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmF4eHl2d3dwbm9hamlpeGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NjQ4MjYsImV4cCI6MjEwMDM0MDgyNn0.dVCy66ZQkHs_vUfcOmFzXKAYmuR-8UFtsHhaa_iAKeQ";

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
