/**
 * السكربتات العامة للتفاعلات والمؤثرات البصرية
 */

document.addEventListener("DOMContentLoaded", () => {
    // أي تفاعلات إضافية عامة يمكن وضعها هنا بأمان
    setupGlobalNavigation();
});

function setupGlobalNavigation() {
    safeOn('.nav-toggle', 'click', () => {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
    });
}
