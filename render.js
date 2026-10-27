/* يعرض بيانات الموقع: من localStorage (لوحة التحكم) أو من data.js */
(function () {
  var data;
  try { data = JSON.parse(localStorage.getItem('siteData')); } catch (e) {}
  if (!data) data = window.DEFAULT_SITE_DATA;

  function get(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, data);
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function fill(id, items, build) {
    var box = document.getElementById(id);
    if (!box) return;
    box.innerHTML = '';
    (items || []).forEach(function (it) { box.appendChild(build(it)); });
  }
  function digits(s) { return String(s || '').replace(/[^\d+]/g, ''); }

  var s = data.settings || {};
  document.title = s.siteTitle || document.title;
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', s.metaDescription || '');

  var root = document.documentElement.style;
  root.setProperty('--plum', s.primaryColor || '#3E1E3A');
  root.setProperty('--plum-2', s.secondaryColor || '#5A2D54');
  root.setProperty('--sage', s.accentColor || '#A8BCAE');
  root.setProperty('--blush', s.softColor || '#F6E3E6');

  document.querySelectorAll('[data-bind]').forEach(function (n) {
    var v = get(n.getAttribute('data-bind'));
    if (v != null) n.textContent = v;
  });
  document.querySelectorAll('[data-href]').forEach(function (n) {
    var v = get(n.getAttribute('data-href'));
    if (v) n.setAttribute('href', v);
  });

  var phone = document.getElementById('top-phone');
  phone.textContent = s.phone || ''; phone.href = 'tel:' + digits(s.phone);
  var mail = document.getElementById('top-email');
  mail.textContent = s.email || ''; mail.href = 'mailto:' + (s.email || '');
  document.getElementById('wa').href = 'https://wa.me/' + digits(s.whatsapp).replace('+', '');

  // Nav
  var nav = document.getElementById('nav');
  nav.innerHTML = '';
  (data.nav || []).forEach(function (i) { nav.appendChild(el('a', { href: i.href || '#', text: i.label })); });
  if (s.ctaText) nav.appendChild(el('a', { href: s.ctaLink || '#contact', 'class': 'btn btn-small', text: s.ctaText }));

  // Hero image
  if (data.hero && data.hero.image) {
    var hv = document.getElementById('hero-visual');
    hv.innerHTML = '';
    hv.appendChild(el('img', { src: data.hero.image, alt: '' }));
  }

  // Lists
  fill('facts', data.about && data.about.facts, function (f) {
    return el('li', {}, [el('strong', { text: f.num }), el('span', { text: f.label })]);
  });
  fill('services-list', data.services && data.services.items, function (i) {
    return el('a', { href: i.link || '#', 'class': 'service' }, [el('h3', { text: i.title }), el('p', { text: i.desc })]);
  });
  fill('points', data.hospital && data.hospital.points, function (i) {
    return el('li', {}, [el('h3', { text: i.title }), el('p', { text: i.text })]);
  });
  fill('why-list', data.why && data.why.items, function (i) {
    return el('div', {}, [el('h3', { text: i.title }), el('p', { text: i.text })]);
  });
  fill('articles-list', data.articles && data.articles.items, function (i) {
    return el('a', { href: i.link || '#', 'class': 'article' }, [el('h3', { text: i.title }), el('p', { text: i.desc })]);
  });
  fill('branches', data.contact && data.contact.branches, function (i) {
    return el('li', {}, [el('a', { href: i.link || '#', text: i.name })]);
  });

  // Section visibility
  var vis = data.visibility || {};
  document.querySelectorAll('[data-section]').forEach(function (n) {
    if (vis[n.getAttribute('data-section')] === false) n.hidden = true;
  });
})();
