(function () {
  var KEY = 'siteData', MKEY = 'siteMessages';
  var data = load();
  var current = 'general';

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s) return s; } catch (e) {}
    return clone(window.DEFAULT_SITE_DATA);
  }
  var saveTimer, toastTimer;
  function save(silent) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {
      toast('تعذر الحفظ: المساحة ممتلئة (جرّب صورة أصغر)'); return;
    }
    markDirty(true);
    if (!silent) toast('تم الحفظ');
  }
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 350); }
  function toast(t, ms) {
    var n = document.getElementById('toast');
    n.textContent = t; n.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { n.classList.remove('show'); }, ms || 1800);
  }
  function getPath(path) { return path.split('.').reduce(function (o, k) { return o[k]; }, data); }

  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    [].concat(kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* ---------- Schema ---------- */
  var T = 'text', A = 'textarea', U = 'url';
  var SCHEMA = [
    { id: 'general', label: 'الإعدادات العامة', type: 'object', path: 'settings', fields: [
      ['siteTitle', 'عنوان الموقع (يظهر في المتصفح)', T], ['metaDescription', 'وصف الموقع لمحركات البحث', A],
      ['logoPrefix', 'اللقب في الشعار', T], ['doctorName', 'اسم الطبيب في الشعار', T],
      ['phone', 'رقم الهاتف', T], ['email', 'البريد الإلكتروني', T], ['whatsapp', 'رقم واتساب (بالصيغة الدولية بدون +)', T],
      ['ctaText', 'نص زر الحجز في القائمة (اتركه فارغاً لإخفائه)', T], ['ctaLink', 'رابط زر الحجز', T],
      ['footerText', 'نص الحقوق في الفوتر', T], ['disclaimer', 'تنبيه الفوتر', A],
      ['primaryColor', 'اللون الأساسي', 'color'], ['secondaryColor', 'اللون الثانوي', 'color'],
      ['accentColor', 'لون التمييز', 'color'], ['softColor', 'لون الخلفيات الفاتحة', 'color']
    ] },
    { id: 'visibility', label: 'إظهار / إخفاء الأقسام', type: 'object', path: 'visibility', fields: [
      ['about', 'قسم عن الطبيب', 'check'], ['services', 'قسم الخدمات', 'check'], ['hospital', 'قسم المستشفى', 'check'],
      ['why', 'قسم لماذا تختارنا', 'check'], ['articles', 'قسم المقالات', 'check'], ['contact', 'قسم الحجز والفروع', 'check']
    ] },
    { id: 'nav', label: 'قائمة التنقل', type: 'list', path: 'nav', titleKey: 'label', blank: { label: 'رابط جديد', href: '#' },
      fields: [['label', 'النص', T], ['href', 'الرابط', T]] },
    { id: 'hero', label: 'الواجهة الرئيسية', type: 'object', path: 'hero', fields: [
      ['role', 'المسمى', T], ['title', 'العنوان (سطر جديد = سطر جديد في الموقع)', A], ['lead', 'النص التعريفي', A],
      ['btn1', 'نص الزر الأول', T], ['btn1Link', 'رابط الزر الأول', T],
      ['btn2', 'نص الزر الثاني', T], ['btn2Link', 'رابط الزر الثاني', T],
      ['image', 'صورة الطبيب', 'image']
    ] },
    { id: 'about', label: 'عن الطبيب', type: 'object', path: 'about', fields: [
      ['title', 'العنوان', T], ['p1', 'الفقرة الأولى', A], ['p2', 'الفقرة الثانية', A]
    ] },
    { id: 'facts', label: 'أرقام عن الطبيب', type: 'list', path: 'about.facts', titleKey: 'label', blank: { num: '0', label: 'عنوان' },
      fields: [['num', 'الرقم', T], ['label', 'الوصف', T]] },
    { id: 'services', label: 'عنوان الخدمات', type: 'object', path: 'services', fields: [['title', 'العنوان', T], ['subtitle', 'العنوان الفرعي', T]] },
    { id: 'services-items', label: 'الخدمات', type: 'list', path: 'services.items', titleKey: 'title', blank: { title: 'خدمة جديدة', desc: '', link: '#' },
      fields: [['title', 'اسم الخدمة', T], ['desc', 'وصف قصير', A], ['link', 'الرابط', T]] },
    { id: 'hospital', label: 'عنوان المستشفى', type: 'object', path: 'hospital', fields: [['title', 'العنوان', T], ['text', 'النص', A]] },
    { id: 'points', label: 'نقاط المستشفى', type: 'list', path: 'hospital.points', titleKey: 'title', blank: { title: 'نقطة جديدة', text: '' },
      fields: [['title', 'العنوان', T], ['text', 'النص', A]] },
    { id: 'why', label: 'عنوان لماذا تختارنا', type: 'object', path: 'why', fields: [['title', 'العنوان', T]] },
    { id: 'why-items', label: 'مميزاتنا', type: 'list', path: 'why.items', titleKey: 'title', blank: { title: 'ميزة جديدة', text: '' },
      fields: [['title', 'العنوان', T], ['text', 'النص', A]] },
    { id: 'articles', label: 'عنوان المقالات', type: 'object', path: 'articles', fields: [['title', 'العنوان', T]] },
    { id: 'articles-items', label: 'المقالات', type: 'list', path: 'articles.items', titleKey: 'title', blank: { title: 'مقال جديد', desc: '', link: '#' },
      fields: [['title', 'عنوان المقال', T], ['desc', 'ملخص', A], ['link', 'الرابط', T]] },
    { id: 'contact', label: 'قسم الحجز', type: 'object', path: 'contact', fields: [
      ['title', 'العنوان', T], ['text', 'النص', A], ['branchesTitle', 'عنوان الفروع', T]
    ] },
    { id: 'branches', label: 'الفروع', type: 'list', path: 'contact.branches', titleKey: 'name', blank: { name: 'فرع جديد', link: '#' },
      fields: [['name', 'اسم الفرع', T], ['link', 'رابط الخريطة', T]] },
    { id: 'messages', label: 'رسائل الحجز', type: 'messages' },
    { id: 'tools', label: 'الأدوات والنسخ الاحتياطي', type: 'tools' }
  ];

  /* ---------- Field inputs ---------- */
  function resizeImage(file, cb) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 900, s = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }

  function fieldEl(def, obj, onTitle) {
    var k = def[0], label = def[1], type = def[2];
    if (type === 'check') {
      var cb = h('input', { type: 'checkbox' });
      cb.checked = obj[k] !== false;
      cb.addEventListener('change', function () { obj[k] = cb.checked; save(); });
      return h('label', { 'class': 'check' }, [cb, h('span', { text: label })]);
    }
    if (type === 'image') {
      var wrap = h('div', { 'class': 'field' }, [h('span', { text: label })]);
      var prev = h('img', { 'class': 'img-prev', alt: '' });
      function show() { prev.style.display = obj[k] ? 'block' : 'none'; if (obj[k]) prev.src = obj[k]; }
      var file = h('input', { type: 'file', accept: 'image/*' });
      file.addEventListener('change', function () {
        if (!file.files[0]) return;
        resizeImage(file.files[0], function (d) { obj[k] = d; save(); show(); });
      });
      var rm = h('button', { 'class': 'mini danger', type: 'button', text: 'إزالة الصورة', onclick: function () { obj[k] = ''; save(); show(); } });
      wrap.appendChild(prev); wrap.appendChild(file); wrap.appendChild(rm); show();
      return wrap;
    }
    var input = type === 'textarea' ? h('textarea', {}) : h('input', { type: type === 'color' ? 'color' : 'text' });
    input.value = obj[k] == null ? '' : obj[k];
    if (type === 'color' && !/^#[0-9a-f]{6}$/i.test(input.value)) input.value = '#000000';
    input.addEventListener('input', function () {
      obj[k] = input.value; saveSoon(); if (onTitle) onTitle(k, input.value);
    });
    return h('label', { 'class': 'field' }, [h('span', { text: label }), input]);
  }

  /* ---------- Views ---------- */
  var content = document.getElementById('content');

  function viewObject(sec) {
    var obj = getPath(sec.path);
    var card = h('div', { 'class': 'card' });
    sec.fields.forEach(function (f) { card.appendChild(fieldEl(f, obj)); });
    content.appendChild(card);
  }

  function viewList(sec) {
    var arr = getPath(sec.path);
    var toolbar = h('div', { 'class': 'toolbar' }, [
      h('button', { 'class': 'btn', text: '+ إضافة عنصر', onclick: function () { arr.push(clone(sec.blank)); save(); render(); } })
    ]);
    content.appendChild(toolbar);
    if (!arr.length) content.appendChild(h('p', { 'class': 'empty', text: 'لا توجد عناصر. اضغط "إضافة عنصر".' }));
    arr.forEach(function (item, i) {
      var title = h('strong', { text: item[sec.titleKey] || '(بدون عنوان)' });
      var up = h('button', { 'class': 'mini', title: 'أعلى', text: '↑', onclick: function () { move(arr, i, -1); } });
      var down = h('button', { 'class': 'mini', title: 'أسفل', text: '↓', onclick: function () { move(arr, i, 1); } });
      if (i === 0) up.disabled = true;
      if (i === arr.length - 1) down.disabled = true;
      var del = h('button', { 'class': 'mini danger', text: 'حذف', onclick: function () {
        if (confirm('حذف هذا العنصر؟')) { arr.splice(i, 1); save(); render(); }
      } });
      var card = h('div', { 'class': 'card' }, [h('div', { 'class': 'card-head' }, [title, up, down, del])]);
      sec.fields.forEach(function (f) {
        card.appendChild(fieldEl(f, item, function (k, v) { if (k === sec.titleKey) title.textContent = v || '(بدون عنوان)'; }));
      });
      content.appendChild(card);
    });
  }
  function move(arr, i, d) {
    var j = i + d; if (j < 0 || j >= arr.length) return;
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t; save(); render();
  }

  function messages() { try { return JSON.parse(localStorage.getItem(MKEY) || '[]'); } catch (e) { return []; } }

  function viewMessages() {
    var list = messages();
    content.appendChild(h('p', { 'class': 'hint', text: 'الرسائل المرسلة من نموذج الحجز في هذا المتصفح. لاستلامها من جميع الزوار اربط النموذج بخدمة أو سيرفر (راجع الملاحظات في script.js).' }));
    if (list.length) {
      content.appendChild(h('div', { 'class': 'toolbar' }, [
        h('button', { 'class': 'btn danger', text: 'حذف الكل', onclick: function () {
          if (confirm('حذف كل الرسائل؟')) { localStorage.setItem(MKEY, '[]'); render(); }
        } })
      ]));
    } else content.appendChild(h('p', { 'class': 'empty', text: 'لا توجد رسائل بعد.' }));
    list.forEach(function (m, i) {
      var dl = h('dl', {}, [
        h('dt', { text: 'الاسم' }), h('dd', { text: m.name || '' }),
        h('dt', { text: 'الهاتف' }), h('dd', { text: m.phone || '' }),
        h('dt', { text: 'البريد' }), h('dd', { text: m.email || '-' }),
        h('dt', { text: 'الرسالة' }), h('dd', { text: m.message || '-' })
      ]);
      var d = m.date ? new Date(m.date).toLocaleString('ar-EG') : '';
      content.appendChild(h('div', { 'class': 'card msg' }, [
        h('div', { 'class': 'card-head' }, [h('strong', { text: d }),
          h('button', { 'class': 'mini danger', text: 'حذف', onclick: function () {
            var l = messages(); l.splice(i, 1); localStorage.setItem(MKEY, JSON.stringify(l)); render();
          } })]),
        dl
      ]));
    });
  }

  function download(name, text, mime) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- Publish to GitHub (token stays in this browser only, never in site files) ---------- */
  function viewPublish() {
    var cfg = {};
    try { cfg = JSON.parse(localStorage.getItem('ghCfg') || '{}'); } catch (e) {}
    var tok = sessionStorage.getItem('ghToken') || localStorage.getItem('ghToken') || '';
    function inp(label, val, type, ph) {
      var i = h('input', { type: type || 'text', placeholder: ph || '' }); i.value = val || '';
      return { i: i, row: h('label', { 'class': 'field' }, [h('span', { text: label }), i]) };
    }
    var owner = inp('اسم المستخدم أو المنظمة (Owner)', cfg.owner, 'text', 'username');
    var repo = inp('اسم المستودع (Repository)', cfg.repo, 'text', 'my-clinic-site');
    var branch = inp('الفرع (Branch)', cfg.branch || 'main');
    var path = inp('مسار ملف البيانات', cfg.path || 'data.js');
    var token = inp('GitHub Token (Contents: Read and write)', tok, 'password', 'github_pat_...');
    var remember = h('input', { type: 'checkbox' });
    remember.checked = !!localStorage.getItem('ghToken');
    var status = h('p', { 'class': 'hint', role: 'status' });

    function b64(t) { return btoa(unescape(encodeURIComponent(t))); }
    function api(url, opt) {
      opt = opt || {}; opt.headers = {
        'Authorization': 'Bearer ' + token.i.value.trim(),
        'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'
      };
      return fetch(url, opt);
    }
    function publish() {
      var o = owner.i.value.trim(), r = repo.i.value.trim(), b = branch.i.value.trim() || 'main', f = path.i.value.trim() || 'data.js';
      if (!o || !r || !token.i.value.trim()) { status.textContent = 'أكمل اسم المستخدم والمستودع والتوكن.'; return; }
      localStorage.setItem('ghCfg', JSON.stringify({ owner: o, repo: r, branch: b, path: f }));
      sessionStorage.setItem('ghToken', token.i.value.trim());
      if (remember.checked) localStorage.setItem('ghToken', token.i.value.trim()); else localStorage.removeItem('ghToken');
      var url = 'https://api.github.com/repos/' + encodeURIComponent(o) + '/' + encodeURIComponent(r) + '/contents/' + f.split('/').map(encodeURIComponent).join('/');
      status.textContent = 'جاري النشر...';
      api(url + '?ref=' + encodeURIComponent(b)).then(function (res) {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('تعذر قراءة الملف (' + res.status + '). تأكد من التوكن وصلاحياته.');
        return res.json();
      }).then(function (cur) {
        var body = {
          message: 'تحديث محتوى الموقع من لوحة التحكم',
          content: b64('window.DEFAULT_SITE_DATA = ' + JSON.stringify(data, null, 2) + ';\n'),
          branch: b
        };
        if (cur && cur.sha) body.sha = cur.sha;
        return api(url, { method: 'PUT', body: JSON.stringify(body) });
      }).then(function (res) {
        if (!res.ok) return res.json().then(function (j) { throw new Error((j && j.message) || ('خطأ ' + res.status)); });
        markDirty(false);
        status.textContent = 'تم النشر. قد يستغرق ظهور التعديلات في الموقع دقيقة أو أكثر.';
      }).catch(function (e) { status.textContent = 'فشل النشر: ' + e.message; });
    }

    content.appendChild(h('div', { 'class': 'card' }, [
      h('h2', { 'class': 'sub', text: 'النشر على GitHub' }),
      h('p', { 'class': 'hint', text: 'يحدّث ملف data.js في المستودع مباشرة. التوكن يُحفظ في متصفحك فقط ولا يُكتب في أي ملف من ملفات الموقع.' }),
      owner.row, repo.row, branch.row, path.row, token.row,
      h('label', { 'class': 'check' }, [remember, h('span', { text: 'تذكر التوكن على هذا الجهاز (وإلا يُمسح عند إغلاق التبويب)' })]),
      h('div', { 'class': 'toolbar' }, [h('button', { 'class': 'btn', text: 'نشر التعديلات الآن', onclick: publish })]),
      status
    ]));
  }

  function viewTools() {
    viewPublish();
    var imp = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
    imp.addEventListener('change', function () {
      var f = imp.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try { var d = JSON.parse(r.result); if (!d.settings) throw 0; data = d; save(); render(); toast('تم الاستيراد'); }
        catch (e) { alert('ملف غير صالح'); }
      };
      r.readAsText(f);
    });
    content.appendChild(h('p', { 'class': 'hint', text: 'التعديلات تُحفظ تلقائياً في هذا المتصفح وتظهر في الموقع عند فتحه على نفس الجهاز. لنشر التعديلات للزوار نزّل data.js واستبدل به الملف الموجود مع ملفات الموقع على الاستضافة.' }));
    content.appendChild(h('div', { 'class': 'card' }, [
      h('div', { 'class': 'toolbar' }, [
        h('button', { 'class': 'btn', text: 'تنزيل data.js للنشر', onclick: function () {
          download('data.js', 'window.DEFAULT_SITE_DATA = ' + JSON.stringify(data, null, 2) + ';\n', 'text/javascript');
        } }),
        h('button', { 'class': 'btn ghost', text: 'تصدير نسخة احتياطية (JSON)', onclick: function () {
          download('site-backup.json', JSON.stringify(data, null, 2), 'application/json');
        } }),
        h('button', { 'class': 'btn ghost', text: 'استيراد نسخة احتياطية', onclick: function () { imp.click(); } }),
        imp
      ]),
      h('div', { 'class': 'toolbar' }, [
        h('button', { 'class': 'btn danger', text: 'استعادة المحتوى الافتراضي', onclick: function () {
          if (confirm('سيتم فقدان كل تعديلاتك. متأكد؟')) {
            data = clone(window.DEFAULT_SITE_DATA); localStorage.removeItem(KEY); save(); render();
          }
        } })
      ])
    ]));
  }


  /* ---------- Unpublished-changes indicator + top-bar publish ---------- */
  function markDirty(v) {
    if (v) localStorage.setItem('ghDirty', '1'); else localStorage.removeItem('ghDirty');
    var d = document.getElementById('dirty');
    if (d) d.hidden = !localStorage.getItem('ghDirty');
  }
  function publishNow() {
    var cfg = {}; try { cfg = JSON.parse(localStorage.getItem('ghCfg') || '{}'); } catch (e) {}
    var t = sessionStorage.getItem('ghToken') || localStorage.getItem('ghToken');
    if (!cfg.owner || !cfg.repo || !t) { toast('سجّل الدخول من جديد ثم أعد المحاولة.', 6000); return; }
    var b = cfg.branch || 'main', f = cfg.path || 'data.js';
    var url = 'https://api.github.com/repos/' + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo) +
      '/contents/' + f.split('/').map(encodeURIComponent).join('/');
    var H = { 'Authorization': 'Bearer ' + t, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    var btn = document.getElementById('publish');
    btn.disabled = true; toast('جاري النشر...', 60000);
    fetch(url + '?ref=' + encodeURIComponent(b), { headers: H }).then(function (res) {
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('تعذر قراءة الملف (' + res.status + ')، راجع صلاحيات التوكن.');
      return res.json();
    }).then(function (cur) {
      var body = {
        message: 'تحديث محتوى الموقع من لوحة التحكم',
        content: btoa(unescape(encodeURIComponent('window.DEFAULT_SITE_DATA = ' + JSON.stringify(data, null, 2) + ';\n'))),
        branch: b
      };
      if (cur && cur.sha) body.sha = cur.sha;
      return fetch(url, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, H), body: JSON.stringify(body) });
    }).then(function (res) {
      if (!res.ok) return res.json().then(function (j) { throw new Error((j && j.message) || ('خطأ ' + res.status)); });
      markDirty(false);
      toast('تم النشر على GitHub. انتظر دقيقة أو اثنتين ليظهر في الموقع.', 9000);
    }).catch(function (e) { toast('فشل النشر: ' + e.message, 12000); })
      .then(function () { btn.disabled = false; });
  }

  /* ---------- Shell ---------- */
  var menu = document.getElementById('menu');
  var side = document.querySelector('.side');
  function buildMenu() {
    menu.innerHTML = '';
    SCHEMA.forEach(function (s) {
      var b = h('button', { 'class': s.id === current ? 'active' : '', text: s.label });
      if (s.id === 'messages') {
        var n = messages().length;
        if (n) { b.textContent = ''; b.appendChild(h('span', { text: s.label })); b.appendChild(h('span', { 'class': 'badge', text: String(n) })); }
      }
      b.addEventListener('click', function () { current = s.id; side.classList.remove('open'); render(); });
      menu.appendChild(b);
    });
  }
  function render() {
    var sec = SCHEMA.filter(function (s) { return s.id === current; })[0];
    document.getElementById('title').textContent = sec.label;
    content.innerHTML = '';
    if (sec.type === 'object') viewObject(sec);
    else if (sec.type === 'list') viewList(sec);
    else if (sec.type === 'messages') viewMessages();
    else viewTools();
    buildMenu();
    window.scrollTo(0, 0);
  }
  document.getElementById('toggle').addEventListener('click', function () { side.classList.toggle('open'); });

  document.getElementById('publish').addEventListener('click', publishNow);
  markDirty(!!localStorage.getItem('ghDirty'));

  /* ---------- Login gate: the GitHub token must have write access to the repo ---------- */
  var app = document.querySelector('.app');
  var gate = document.getElementById('gate');
  var gStatus = document.getElementById('g-status');

  function verify(o, r, t) {
    return fetch('https://api.github.com/repos/' + encodeURIComponent(o) + '/' + encodeURIComponent(r), {
      headers: { 'Authorization': 'Bearer ' + t, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
    }).then(function (res) {
      if (res.status === 401) throw new Error('التوكن غير صحيح أو منتهي.');
      if (!res.ok) throw new Error('تعذر الوصول إلى المستودع. راجع الاسم وصلاحيات التوكن.');
      return res.json();
    }).then(function (j) {
      if (!j.permissions || !j.permissions.push) throw new Error('هذا التوكن لا يملك صلاحية الكتابة على المستودع.');
    });
  }
  function unlock() { gate.hidden = true; app.hidden = false; render(); }
  function showGate(msg) {
    app.hidden = true; gate.hidden = false; gStatus.textContent = msg || '';
    try {
      var c = JSON.parse(localStorage.getItem('ghCfg') || '{}');
      document.getElementById('g-owner').value = c.owner || '';
      document.getElementById('g-repo').value = c.repo || '';
    } catch (e) {}
  }

  document.getElementById('gate-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var o = document.getElementById('g-owner').value.trim();
    var r = document.getElementById('g-repo').value.trim();
    var t = document.getElementById('g-token').value.trim();
    gStatus.textContent = 'جاري التحقق...';
    verify(o, r, t).then(function () {
      var cfg = {}; try { cfg = JSON.parse(localStorage.getItem('ghCfg') || '{}'); } catch (x) {}
      cfg.owner = o; cfg.repo = r; cfg.branch = cfg.branch || 'main'; cfg.path = cfg.path || 'data.js';
      localStorage.setItem('ghCfg', JSON.stringify(cfg));
      sessionStorage.setItem('ghToken', t);
      if (document.getElementById('g-remember').checked) localStorage.setItem('ghToken', t);
      else localStorage.removeItem('ghToken');
      document.getElementById('g-token').value = '';
      unlock();
    }).catch(function (err) { gStatus.textContent = err.message; });
  });

  // Auto-login if a token was saved earlier and is still valid
  (function init() {
    var t = sessionStorage.getItem('ghToken') || localStorage.getItem('ghToken');
    var c = {}; try { c = JSON.parse(localStorage.getItem('ghCfg') || '{}'); } catch (e) {}
    if (t && c.owner && c.repo) {
      verify(c.owner, c.repo, t).then(unlock).catch(function () { showGate('انتهت الجلسة، سجّل الدخول من جديد.'); });
    } else showGate();
  })();
})();
