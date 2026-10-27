(function () {
  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  // Contact form: validates, then stores the message so it appears in the admin panel.
  // To send to a real server instead, replace the localStorage block with a fetch() call.
  var form = document.getElementById('contact-form');
  var status = form.querySelector('.form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    [form.name, form.phone].forEach(function (f) { f.classList.remove('invalid'); });
    if (form.name.value.trim().length < 2) { form.name.classList.add('invalid'); ok = false; }
    if (!/^[+\d\s-]{8,16}$/.test(form.phone.value.trim())) { form.phone.classList.add('invalid'); ok = false; }

    status.className = 'form-status';
    if (!ok) {
      status.classList.add('err');
      status.textContent = 'من فضلك اكتب الاسم ورقم هاتف صحيح.';
      return;
    }

    var msg = Object.fromEntries(new FormData(form).entries());
    msg.date = new Date().toISOString();
    try {
      var list = JSON.parse(localStorage.getItem('siteMessages') || '[]');
      list.unshift(msg);
      localStorage.setItem('siteMessages', JSON.stringify(list));
    } catch (err) {}
    status.classList.add('ok');
    status.textContent = 'تم استلام طلبك، سنتصل بك قريباً.';
    form.reset();
  });
})();
