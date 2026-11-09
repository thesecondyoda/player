/**
 * نظام القارئ الآمن - تم إصلاح جميع أخطاء DOM و InnerHTML
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("تم تحميل صفحة القارئ بنجاح، جاري تهيئة العناصر...");
    
    // تهيئة القارئ بأمان
    initReader();
});

/**
 * دالة مساعدة لتحديث محتوى الـ HTML بشكل آمن تماماً
 * @param {string} selector - محدد العنصر (مثل #id أو .class)
 * @param {string} content - المحتوى المراد وضعه
 * @param {boolean} [isAll=false] - هل يتم التحديث لكل العناصر المطابقة؟
 */
function safeSetHTML(selector, content, isAll = false) {
    if (isAll) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach(el => {
                if (el) el.innerHTML = content;
            });
        }
    } else {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = content;
        } else {
            console.debug(`العنصر "${selector}" غير موجود في هذه الصفحة، تم تخطي التحديث.`);
        }
    }
}

/**
 * دالة مساعدة لإضافة مستمع الأحداث بشكل آمن
 */
function safeOn(selector, eventType, callback) {
    const element = document.querySelector(selector);
    if (element) {
        element.addEventListener(eventType, callback);
    }
}

/**
 * دالة تهيئة القارئ الأساسية
 */
function initReader() {
    // 1. استرجاع معرف الكتاب أو البيانات من الرابط (URL)
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id') || urlParams.get('book');

    // 2. تحديث عنوان القارئ أو محتواه بشكل آمن
    safeSetHTML('#reader-title', 'جاري تحميل المحتوى...');
    
    // 3. تحميل محتوى الكتاب
    loadBookContent(bookId);

    // 4. ربط أزرار التحكم في القارئ
    setupReaderControls();
}

/**
 * دالة تحميل محتوى الكتاب
 */
function loadBookContent(bookId) {
    // يمكنك وضع منطق جلب البيانات الفعلي هنا (Fetch / LocalStorage)
    setTimeout(() => {
        safeSetHTML('#reader-content', '<p>مرحباً بك في القارئ. تم تحميل المحتوى بنجاح.</p>');
    }, 300);
}

/**
 * إعداد أزرار وأدوات التحكم في القارئ (تكبير/تصغير الخط، التنقل)
 */
function setupReaderControls() {
    // زر تكبير الخط
    safeOn('#increase-font', 'click', () => {
        const contentArea = document.querySelector('#reader-content');
        if (contentArea) {
            const currentSize = window.getComputedStyle(contentArea).fontSize;
            contentArea.style.fontSize = (parseFloat(currentSize) + 2) + 'px';
        }
    });

    // زر تصغير الخط
    safeOn('#decrease-font', 'click', () => {
        const contentArea = document.querySelector('#reader-content');
        if (contentArea) {
            const currentSize = window.getComputedStyle(contentArea).fontSize;
            contentArea.style.fontSize = Math.max(12, parseFloat(currentSize) - 2) + 'px';
        }
    });

    // زر العودة أو الإغلاق
    safeOn('#back-btn', 'click', () => {
        window.location.href = 'index.html';
    });
}
