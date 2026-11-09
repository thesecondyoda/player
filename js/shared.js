/**
 * الدوال المشتركة والآمنة للتعامل مع الـ DOM
 */

/**
 * تحديث محتوى الـ HTML بشكل آمن تماماً
 * @param {string} selector - محدد العنصر (ID أو Class)
 * @param {string} content - المحتوى المراد وضعـه
 * @param {boolean} [isAll=false] - لتحديث جميع العناصر المطابقة
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
        }
    }
}

/**
 * إضافة مستمع أحداث بشكل آمن
 */
function safeOn(selector, eventType, callback) {
    const element = document.querySelector(selector);
    if (element) {
        element.addEventListener(eventType, callback);
    }
}
