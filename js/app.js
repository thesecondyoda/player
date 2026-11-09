/**
 * ملف إدارة التطبيق العام - app.js
 */

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

function initializeApp() {
    console.log("Kirin App initialized successfully.");
    safeSetHTML('.app-version', CONFIG.version);
}
