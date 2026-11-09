/* =========================================================
   KIRIN MANGA — Supabase Configuration
   ========================================================= */

(function (window) {
  "use strict";

  const CONFIG = Object.freeze({

    // Supabase Project
    SUPABASE_URL:
      "https://awdtcfbkqpwfjialilzo.supabase.co",

    // Public Publishable Key
    SUPABASE_ANON_KEY:
      "sb_publishable_hIdo6-IVFiGEFsubLUQOxw_tIFL1pJy",

    // Edge Functions
    FUNCTIONS_BASE_URL:
      "https://awdtcfbkqpwfjialilzo.supabase.co/functions/v1",

    // Storage
    COVERS_BUCKET: "covers",
    PAGES_BUCKET: "chapter-pages",

    // Application
    APP_NAME: "KIRIN MANGA",
    APP_VERSION: "1.0.0",
    DEBUG: false

  });

  // Global configuration
  window.CONFIG = CONFIG;
  window.KIRIN_CONFIG = CONFIG;

  // Validate configuration
  const errors = [];

  if (!CONFIG.SUPABASE_URL.startsWith("https://")) {
    errors.push("Invalid Supabase URL");
  }

  if (
    !CONFIG.SUPABASE_ANON_KEY ||
    !CONFIG.SUPABASE_ANON_KEY.startsWith("sb_publishable_")
  ) {
    errors.push("Invalid Supabase Publishable Key");
  }

  if (errors.length > 0) {
    window.KIRIN_CONFIG_READY = false;
    window.KIRIN_CONFIG_ERRORS = errors;

    console.error("[KIRIN] Configuration errors:", errors);
  } else {
    window.KIRIN_CONFIG_READY = true;
    window.KIRIN_CONFIG_ERRORS = [];

    console.info("[KIRIN] Supabase configuration loaded.");
  }

})(window);
