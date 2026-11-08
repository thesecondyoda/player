# KIRIN MANGA — النسخة المطوّرة

موقع مكتبة وقراءة مانغا بواجهة عربية RTL، مبني على HTML وCSS وJavaScript وSupabase، ومهيأ للنشر على Cloudflare Pages.

## محتويات المشروع
- `index.html`: مكتبة الأعمال والبحث والتصنيفات والترتيب.
- `work.html`: تفاصيل العمل وقائمة الفصول المنشورة.
- `reader.html`: قارئ التمرير العمودي والصفحة الواحدة، مع التنقل وحفظ موضع القراءة محلياً.
- `admin.html`: لوحة إدارة محمية عبر Supabase Auth وقائمة `kirin_admins`.
- `js/`: إعداد الاتصال والمنطق العام والمكتبة والقارئ والإدارة.
- `supabase/functions/chapter-pages/index.ts`: وظيفة تصدر روابط موقعة قصيرة الصلاحية لصفحات الفصول المنشورة فقط.
- `css/styles.css`: الهوية البصرية والتصميم المتجاوب.

## قبل التشغيل
1. أنشئ نسخة احتياطية من مشروع Supabase الحالي.
2. راجع مخطط قاعدة البيانات الحالي. إذا كانت لديك جداول قديمة بأعمدة مختلفة، لا تشغّل SQL قبل مواءمته معها.
3. نفّذ كود SQL الذي أُرسل منفصلاً في المحادثة داخل SQL Editor في Supabase.
4. أنشئ مستخدم المسؤول من Authentication، ثم أضف UUID الخاص به إلى `public.kirin_admins`.
5. ضع رابط مشروع Supabase ومفتاح `anon` في `js/config.js`. لا تضع مفتاح `service_role` في أي ملف داخل مجلد الموقع.
6. أنشئ/تحقق من bucket باسم `covers` عام، وbucket باسم `chapter-pages` خاص. سياسات التخزين موجودة في SQL.
7. اضبط أسرار Edge Function: `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY`، ثم انشر الوظيفة `chapter-pages`.
8. ارفع محتويات هذا المجلد إلى Cloudflare Pages مع الحفاظ على بنية المجلدات.

## إعداد Supabase

### ملف الواجهة
في `js/config.js` عدّل القيم التالية فقط:
- `SUPABASE_URL`: رابط مشروعك.
- `SUPABASE_ANON_KEY`: مفتاح anon/public.
- `FUNCTIONS_BASE_URL`: `https://PROJECT_REF.supabase.co/functions/v1`.

### إعداد المسؤول
أنشئ حساباً في Supabase Auth، ثم نفّذ (استبدل القيمة بالـ UUID الحقيقي):

```sql
insert into public.kirin_admins (user_id)
values ('YOUR-AUTH-USER-UUID')
on conflict (user_id) do nothing;
```

### نشر الوظيفة الخادمية
```bash
supabase secrets set SUPABASE_URL=https://PROJECT_REF.supabase.co SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase functions deploy chapter-pages
```

## ملاحظات تشغيل وأمان
- لا يُستخدم مفتاح الخدمة إلا داخل Edge Function.
- صفحات الفصول محفوظة في bucket خاص وتُعرض بروابط موقعة مدتها 15 دقيقة.
- لا توجد حماية مطلقة من لقطات الشاشة أو تسجيل الشاشة؛ المتصفح يستقبل الصور كي يعرضها.
- التحقق من أنواع الصور وأحجامها يجري في الواجهة، ويجب الإبقاء على سياسات Storage وتدابير الخادم كطبقة الحماية الفعلية.
- رفع صفحات جديدة عند تعديل فصل يستبدل الصفحات السابقة بعد نجاح رفع/إدخال الصفحات الجديدة.
- حذف العمل يعتمد على `ON DELETE CASCADE` في قاعدة البيانات؛ يجب التأكد من تطبيق مخطط SQL المتوافق.

## التحقق المحلي
افتح الموقع عبر خادم static محلي أو انشره على Cloudflare Pages. لا تفتح الصفحات مباشرة عبر `file://` لأن Supabase Auth والطلبات الخادمية تحتاج origin صالحاً.

## حالة التحقق
تم إجراء فحص بناء أولي لملفات JavaScript وفحص بنية ملفات المشروع. لم يتم اختبار اتصال Supabase الفعلي أو تسجيل الدخول أو رفع الصور أو Edge Function لأن بيانات مشروع Supabase وأسراره غير متاحة ضمن الملف المرفق. لذلك لا تُعد هذه الحزمة مُثبتة التشغيل على قاعدة بياناتك قبل تنفيذ إعداداتك واختبارها.
