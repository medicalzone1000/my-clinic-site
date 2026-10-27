# موقع الطبيب + لوحة التحكم

ملفات ثابتة (HTML/CSS/JS) تعمل على GitHub Pages بدون سيرفر.

## الملفات
- `index.html` `style.css` `script.js` `render.js` — الموقع
- `data.js` — كل محتوى الموقع (هذا الملف الذي تحدّثه لوحة التحكم)
- `admin.html` `admin.css` `admin.js` — لوحة التحكم

## الرفع على GitHub Pages
1. أنشئ مستودعاً جديداً وارفع كل محتويات هذا المجلد في الجذر.
2. Settings ← Pages ← Source: Deploy from a branch ← main / (root).
3. الموقع: `https://USERNAME.github.io/REPO/` ولوحة التحكم: `.../admin.html`

## النشر من لوحة التحكم
1. أنشئ Fine-grained token: Settings ← Developer settings ← Personal access tokens.
   - Repository access: هذا المستودع فقط.
   - Permissions ← Contents: Read and write.
2. افتح `admin.html` ← الأدوات والنسخ الاحتياطي ← النشر على GitHub، واكتب بياناتك والتوكن.
3. عدّل المحتوى ثم اضغط "نشر التعديلات الآن".

التوكن لا يُكتب في أي ملف، ويُحفظ فقط في متصفحك (sessionStorage أو localStorage إن اخترت تذكره).

## ملاحظات
- `admin.html` سيكون عاماً على الإنترنت، لكنه لا يستطيع التعديل بدون التوكن. ويحتوي على `noindex`.
- رسائل نموذج الحجز تُحفظ في متصفح الزائر فقط. اربط النموذج بخدمة نماذج (مثل Formspree) من `script.js` لاستلامها فعلياً.
- لا تستخدم صور أو نصوص لا تملك حقوقها.
