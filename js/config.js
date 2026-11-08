// Add your Supabase project values here after creating the project.
window.KIRIN_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  // Set this to the exact series title you want displayed in the reader.
  seriesTitle: "KIRIN",
  // Signed image URL lifetime, in seconds.
  signedUrlSeconds: 90
};
window.kirinSupabase = (window.KIRIN_CONFIG.supabaseUrl && window.KIRIN_CONFIG.supabaseAnonKey && window.supabase)
  ? window.supabase.createClient(window.KIRIN_CONFIG.supabaseUrl, window.KIRIN_CONFIG.supabaseAnonKey)
  : null;
