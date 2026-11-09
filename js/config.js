/* =========================================================
   KIRIN MANGA — Supabase Configuration
   File: js/config.js
   ========================================================= */

(function (window) {
  "use strict";

  const CONFIG = Object.freeze({

    // Supabase Project URL
    SUPABASE_URL: "https://YOUR_PROJECT_ID.supabase.co",

    // Supabase Publishable Key أو anon public key
    // لا تستخدم service_role هنا مطلقاً.
    SUPABASE_ANON_KEY: "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY",

    // يُشتق تلقائياً من رابط Supabase إذا تُرك فارغاً.
    FUNCTIONS_BASE_URL: "",

    // اسم حاوية صور أغلفة الأعمال
    COVERS_BUCKET: "covers",

    // اسم حاوية صفحات الفصول
    PAGES_BUCKET: "chapter-pages",

    // إعدادات التطبيق
    APP_NAME: "KIRIN MANGA",
    APP_VERSION: "1.0.0",
    DEBUG: false

  });

  // إتاحة الإعدادات لبقية ملفات المشروع
  window.CONFIG = CONFIG;
  window.KIRIN_CONFIG = CONFIG;

  // التحقق من إعدادات الاتصال
  function validateConfig() {
    const errors = [];

    const url = CONFIG.SUPABASE_URL.trim();
    const key = CONFIG.SUPABASE_ANON_KEY.trim();

    if (
      !url ||
      url.includes("YOUR_PROJECT_ID") ||
      !/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\/?$/.test(url)
    ) {
      errors.push("رابط مشروع Supabase غير صالح أو لم يتم إدخاله.");
    }

    if (
      !key ||
      key.includes("YOUR_SUPABASE") ||
      key.includes("YOUR_SUPABASE_PUBLISHABLE")
    ) {
      errors.push("مفتاح Supabase العام غير موجود.");
    }

    if (errors.length) {
      console.error(
        "[KIRIN CONFIG] Configuration Error:",
        errors
      );

      window.KIRIN_CONFIG_READY = false;
      window.KIRIN_CONFIG_ERRORS = errors;

      return false;
    }

    window.KIRIN_CONFIG_READY = true;
    window.KIRIN_CONFIG_ERRORS = [];

    return true;
  }

  // إنشاء رابط Edge Functions تلقائياً
  function getFunctionsBaseUrl() {
    if (CONFIG.FUNCTIONS_BASE_URL.trim()) {
      return CONFIG.FUNCTIONS_BASE_URL.replace(/\/+$/, "");
    }

    return (
      CONFIG.SUPABASE_URL.replace(/\/+$/, "") +
      "/functions/v1"
    );
  }

  // إتاحة رابط الوظائف
  window.KIRIN_FUNCTIONS_URL = getFunctionsBaseUrl();

  // التحقق عند تحميل الملف
  const isValid = validateConfig();

  if (isValid) {
    console.info("[KIRIN CONFIG] Configuration loaded successfully.");
  }

})(window);
