/**
 * ملف قارئ الكتب - النسخة الآمنة والمحدثة
 */

document.addEventListener("DOMContentLoaded", () => {
    initReader();
});

function initReader() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id') || urlParams.get('book');

    // تحديث العنوان أو الحالة بأمان
    safeSetHTML('#reader-title', 'جاري تحميل المحتوى...');
    
    // تحميل بيانات الكتاب
    loadBookContent(bookId);

    // تهيئة أدوات التحكم
    setupReaderControls();
}

function loadBookContent(bookId) {
    // محاكاة عملية جلب البيانات أو النص
    setTimeout(() => {
        safeSetHTML('#reader-content', '<p>مرحباً بك في القارئ. تم تحميل النص بنجاح وبدون أي أخطاء.</p>');
    }, 250);
}

function setupReaderControls() {
    // زر تكبير الخط
    safeOn('#increase-font', 'click', () => {
        const contentArea = document.querySelector('#reader-content');
        if (contentArea) {
            const currentSize = parseFloat(window.getComputedStyle(contentArea).fontSize);
            contentArea.style.fontSize = (currentSize + 2) + 'px';
        }
    });

    // زر تصغير الخط
    safeOn('#decrease-font', 'click', () => {
        const contentArea = document.querySelector('#reader-content');
        if (contentArea) {
            const currentSize = parseFloat(window.getComputedStyle(contentArea).fontSize);
            contentArea.style.fontSize = Math.max(12, currentSize - 2) + 'px';
        }
    });
}
