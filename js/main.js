/* davcandles — интерактив лендинга */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rub = function (n) { return n.toLocaleString('ru-RU') + ' ₽'; };
  var IG = 'https://ig.me/m/davcandles';

  /* ---------- Тост ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(ta);
    ta.select(); ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }

  /* ---------- Хедер и бургер ---------- */
  var header = $('#header'), burger = $('#burger'), nav = $('#nav');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  /* ---------- Торт: возраст из свечей ---------- */
  var COLORS = ['#E58A8E', '#F2762E', '#8FB9E3', '#93A24B', '#F3D15C'];
  var candlesEl = $('#candles'), ageInput = $('#age'), wish = $('#wish');
  function renderAge(v) {
    var digits = String(v || '').replace(/\D/g, '').slice(0, 3) || '1';
    candlesEl.innerHTML = '';
    wish.hidden = true;
    digits.split('').forEach(function (d, i) {
      var el = document.createElement('div');
      el.className = 'candle';
      var rot = digits.length === 1 ? 0 : (i - (digits.length - 1) / 2) * 7;
      el.style.setProperty('--rot', rot + 'deg');
      el.style.setProperty('--d', (i * 0.09) + 's');
      el.style.setProperty('--c', COLORS[(Number(d) + i) % COLORS.length]);
      el.innerHTML = '<button type="button" class="candle__fire" aria-label="Задуть свечу ' + d + '"><span class="flame"></span><span class="smoke"></span></button>' +
        '<span class="candle__digit" aria-hidden="true">' + d + '</span><span class="candle__stick"></span>';
      candlesEl.appendChild(el);
    });
    candlesEl.setAttribute('aria-label', 'Свечи-цифры: ' + digits);
  }
  function checkAllOut() {
    var all = $$('.candle', candlesEl);
    if (all.length && all.every(function (c) { return c.classList.contains('is-out'); })) wish.hidden = false;
  }
  candlesEl.addEventListener('click', function (e) {
    var fire = e.target.closest('.candle__fire');
    if (!fire) return;
    var c = fire.parentNode;
    c.classList.toggle('is-out');
    fire.setAttribute('aria-label', (c.classList.contains('is-out') ? 'Зажечь' : 'Задуть') + ' свечу');
    if (!c.classList.contains('is-out')) wish.hidden = true;
    checkAllOut();
  });
  $('#blow').addEventListener('click', function () {
    var all = $$('.candle', candlesEl);
    var lit = all.some(function (c) { return !c.classList.contains('is-out'); });
    all.forEach(function (c, i) { setTimeout(function () { c.classList.toggle('is-out', lit); if (i === all.length - 1) { if (lit) checkAllOut(); else wish.hidden = true; } }, i * 140); });
    this.textContent = lit ? 'Зажечь' : 'Задуть';
  });
  ageInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
    renderAge(this.value); $('#blow').textContent = 'Задуть';
  });
  $('#ageForm').addEventListener('submit', function (e) { e.preventDefault(); });
  renderAge(ageInput.value);

  /* ---------- Конструктор микса ---------- */
  var CATALOG = [
    { id: 'balls', name: 'Цифры-шарики', items: [
      ['b1', 'Цифры-шарики 5,5 см, белые', '', 230],
      ['b2', 'Цифры-шарики 5,5 см, цветные', 'любой цвет', 250],
      ['b3', 'Цифры-шарики 5,5 см с блёстками', '', 270],
      ['b4', 'Цифры-шарики 5,5 см в два-три цвета', '', 270],
      ['b5', 'Цифры-шарики 5,5 см с блеском', 'перламутр', 270],
      ['b6', 'Цифры-шарики 5,5 см зеркальные', '', 300],
      ['b7', 'Цифры-шарики 7,5 см', '', 290],
      ['b8', 'Цифры-шарики 7,5 см с блеском или блёстками', '', 290],
      ['b9', '3D-шарики', 'объёмные, 3,5 × 2 см', 180]
    ]},
    { id: 'flower', name: 'Цветочные и классические', items: [
      ['f1', 'Цветочные цифры в один цвет', '', 350],
      ['f2', 'Цветочные цифры с градиентом', 'в два цвета', 370],
      ['f3', 'Классические цифры 7 см', '', 350]
    ]},
    { id: 'top', name: 'Топперы', items: [
      ['t1', 'Гусь', 'с окрашиванием', 300],
      ['t2', 'Динозаврик, космонавт, ракета, слоник, единорог, кит', 'с окрашиванием', 200],
      ['t3', 'Сердечки, звёздочки, месяц', 'с окрашиванием', 180],
      ['t4', 'Тюльпан или подсолнух', '', 250],
      ['t5', 'Зеркальный бант', '', 300],
      ['t6', 'Джойстик', '', 250],
      ['t7', 'Губы', '', 150],
      ['t8', 'Сердечки, машинки, цветочки, звёздочки, облачко', 'без окрашивания', 150],
      ['t9', 'Животные, бабочка, собачка', 'без окрашивания', 150],
      ['t10', 'Лошадка', '', 250],
      ['t11', 'Гусь с цветами', '', 200]
    ]},
    { id: 'season', name: 'Коллекции', items: [
      ['s1', 'Серия «Осень»', 'за штуку', 200],
      ['s2', 'Серия «Зима»', 'за штуку', 200],
      ['s3', 'Серия «Морская»', 'за штуку', 200],
      ['s4', 'Тыква маленькая', '', 130],
      ['s5', 'Тыква средняя', '', 160],
      ['s6', 'Тыква большая', '', 200],
      ['s7', 'Петушок маленький', '', 150],
      ['s8', 'Петушок 6 см', '', 300]
    ]},
    { id: 'bento', name: 'Бенто-свечи', items: [
      ['n1', 'Прямые однотонные', '', 50],
      ['n2', 'С сердечками', '', 60],
      ['n3', 'В два цвета', '', 60],
      ['n4', 'Жемчужные бусинки', '', 70],
      ['n5', 'Ромашки, волны, «в виде свечи»', '', 50],
      ['n6', 'Прямые тонкие 0,5 см', '', 80],
      ['n7', 'Тонкие спирали и волны', '', 100]
    ]}
  ];
  var byId = {}, cart = {};
  CATALOG.forEach(function (c) { c.items.forEach(function (it) { byId[it[0]] = it; }); });

  var tabsEl = $('#mixTabs'), listEl = $('#mixList');
  CATALOG.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tab'; b.id = 'tab-' + c.id;
    b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    b.setAttribute('aria-controls', 'mixList'); b.tabIndex = i === 0 ? 0 : -1;
    b.textContent = c.name; b.dataset.cat = c.id;
    tabsEl.appendChild(b);
  });
  function showCat(id) {
    var cat = CATALOG.filter(function (c) { return c.id === id; })[0];
    $$('.tab', tabsEl).forEach(function (t) { var on = t.dataset.cat === id; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    listEl.setAttribute('aria-labelledby', 'tab-' + id);
    listEl.innerHTML = cat.items.map(function (it) {
      var q = cart[it[0]] || 0;
      return '<div class="item' + (q ? ' has' : '') + '" data-id="' + it[0] + '">' +
        '<span class="item__name">' + it[1] + (it[2] ? '<span class="item__note">' + it[2] + '</span>' : '') + '</span>' +
        '<span class="item__price">' + rub(it[3]) + ' <small>/шт</small></span>' +
        '<span class="step"><button type="button" data-a="-" aria-label="Убрать: ' + it[1] + '">−</button><output aria-live="polite">' + q + '</output><button type="button" data-a="+" aria-label="Добавить: ' + it[1] + '">+</button></span>' +
        '</div>';
    }).join('');
  }
  tabsEl.addEventListener('click', function (e) { var t = e.target.closest('.tab'); if (t) showCat(t.dataset.cat); });
  tabsEl.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var tabs = $$('.tab', tabsEl), i = tabs.indexOf(document.activeElement);
    var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    n.focus(); showCat(n.dataset.cat);
  });
  listEl.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-a]'); if (!b) return;
    var row = b.closest('.item'), id = row.dataset.id;
    var q = (cart[id] || 0) + (b.dataset.a === '+' ? 1 : -1);
    if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, 99);
    $('output', row).textContent = cart[id] || 0;
    row.classList.toggle('has', !!cart[id]);
    renderCart();
  });

  var cartItems = $('#cartItems'), cartSum = $('#cartSum'), cartCopy = $('#cartCopy'), bar = $('#mixBar'), barText = $('#barText');
  function plural(n, a, b, c) { var m = n % 100, k = n % 10; if (m > 10 && m < 20) return c; if (k === 1) return a; if (k > 1 && k < 5) return b; return c; }
  function totals() {
    var sum = 0, cnt = 0;
    Object.keys(cart).forEach(function (id) { sum += byId[id][3] * cart[id]; cnt += cart[id]; });
    return { sum: sum, cnt: cnt };
  }
  function renderCart() {
    var ids = Object.keys(cart), t = totals();
    cartItems.innerHTML = ids.length ? ids.map(function (id) {
      return '<li><span>' + byId[id][1] + ' × ' + cart[id] + '</span><b>' + rub(byId[id][3] * cart[id]) + '</b></li>';
    }).join('') : '<li class="cart__empty">Пока пусто. Начните с цифры — например, «Цифры-шарики 5,5 см».</li>';
    cartSum.textContent = rub(t.sum);
    cartCopy.disabled = !ids.length;
    bar.hidden = !ids.length;
    barText.textContent = t.cnt + ' ' + plural(t.cnt, 'свеча', 'свечи', 'свечей') + ', ' + rub(t.sum);
  }
  cartCopy.addEventListener('click', function () {
    var t = totals(), note = $('#cartNote').value.trim();
    var lines = ['Здравствуйте, Дина! Хочу заказать свечи для торта:'];
    Object.keys(cart).forEach(function (id) { lines.push('— ' + byId[id][1] + (byId[id][2] ? ' (' + byId[id][2] + ')' : '') + ' × ' + cart[id] + ' = ' + rub(byId[id][3] * cart[id])); });
    lines.push('Ориентировочно: ' + rub(t.sum));
    if (note) lines.push('Пожелания: ' + note);
    copy(lines.join('\n')).then(function (ok) {
      toast(ok ? 'Заказ скопирован. Вставьте его в сообщение Дине' : 'Не удалось скопировать. Выделите текст вручную');
      if (ok) setTimeout(function () { window.open(IG, '_blank', 'noopener'); }, 900);
    });
  });
  showCat(CATALOG[0].id); renderCart();

  // Плашка «К заказу» прячется, когда корзина видна
  if ('IntersectionObserver' in window) {
    var cartBox = $('.mix__cart'), mixSec = $('#mix');
    var vis = { cart: false, mix: false };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { vis[en.target === cartBox ? 'cart' : 'mix'] = en.isIntersecting; });
      bar.style.visibility = (vis.mix && !vis.cart) ? 'visible' : 'hidden';
    }, { threshold: 0.05 });
    io.observe(cartBox); io.observe(mixSec);
  }

  /* ---------- Галерея ---------- */
  var tiles = $$('.tile');
  $('#filters').addEventListener('click', function (e) {
    var c = e.target.closest('.chip'); if (!c) return;
    $$('.chip', this).forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    var f = c.dataset.f;
    tiles.forEach(function (t) { t.classList.toggle('is-hidden', f !== 'all' && t.dataset.tags.split(' ').indexOf(f) < 0); });
  });
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  function openLb(src, cap, alt) {
    lbImg.src = src; lbImg.alt = alt; lbCap.textContent = cap;
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
  }
  function closeLb() { if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open'); }
  tiles.forEach(function (t) {
    t.setAttribute('aria-label', 'Открыть фото: ' + t.dataset.cap);
    t.addEventListener('click', function () { openLb(t.dataset.full, t.dataset.cap, $('img', t).alt); });
  });
  $('#lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  /* ---------- Видео ---------- */
  var video = $('#storyVideo'), playBtn = $('#playBtn'), phone = $('.phone');
  playBtn.addEventListener('click', function () {
    video.muted = false; video.controls = true;
    var p = video.play(); if (p && p.catch) p.catch(function () { video.muted = true; video.play(); });
    phone.classList.add('is-playing');
  });

  /* ---------- Сертификат ---------- */
  var g = { to: $('#gTo'), from: $('#gFrom'), wish: $('#gWish') };
  var c = { to: $('#cTo'), from: $('#cFrom'), wish: $('#cWish'), sum: $('#cSum'), no: $('#cNo') };
  var cert = $('#cert'), certSum = '1000', certTheme = 'rose';
  var DEF = { to: 'Маши', from: 'Аня', wish: 'Пусть каждый торт будет поводом для праздника' };
  c.no.textContent = 'DC-' + String(Math.floor(1000 + Math.random() * 9000));
  function syncCert() {
    c.to.textContent = g.to.value.trim().replace(/^для\s+/i, '') || DEF.to;
    c.from.textContent = g.from.value.trim() || DEF.from;
    c.wish.textContent = g.wish.value.trim() || DEF.wish;
    c.sum.textContent = certSum === 'course' ? 'Обучение' : Number(certSum).toLocaleString('ru-RU') + ' ₽';
    c.sum.style.fontSize = certSum === 'course' ? '0.62em' : '';
    $('#gCount').textContent = g.wish.value.length + ' / 110';
  }
  ['to', 'from', 'wish'].forEach(function (k) { g[k].addEventListener('input', syncCert); });
  $('#gSum').addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    $$('.chip', this).forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    certSum = b.dataset.v; syncCert();
  });
  $$('#gSum .chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x.classList.contains('is-on'))); });
  $('#gTheme').addEventListener('click', function (e) {
    var b = e.target.closest('.sw'); if (!b) return;
    $$('.sw', this).forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    certTheme = b.dataset.t;
    cert.className = 'cert theme-' + certTheme;
  });
  $$('#gTheme .sw').forEach(function (x) { x.setAttribute('aria-pressed', String(x.classList.contains('is-on'))); });
  syncCert();

  $('#gOrder').addEventListener('click', function () {
    var txt = 'Здравствуйте, Дина! Хочу заказать подарочный сертификат davcandles.\n' +
      'Номинал: ' + (certSum === 'course' ? 'обучение (1500 ₽)' : certSum + ' ₽') + '\n' +
      'Для кого: ' + (g.to.value.trim() || '—') + '\nОт кого: ' + (g.from.value.trim() || '—') + '\n' +
      'Пожелание: ' + (g.wish.value.trim() || '—') + '\nОформление: ' + { rose: 'розовое', wine: 'бордо', party: 'шарики' }[certTheme] + '\nМакет: ' + c.no.textContent;
    copy(txt).then(function (ok) {
      toast(ok ? 'Заявка скопирована. Отправьте её Дине' : 'Не удалось скопировать. Напишите Дине напрямую');
      setTimeout(function () { window.open(IG, '_blank', 'noopener'); }, 900);
    });
  });

  // Скачивание макета сертификата в PNG (рисуем на canvas)
  var THEMES = {
    rose: { outer: '#E58A8E', bg: '#FDF0F0', fg: '#6B1A2A', acc: '#E58A8E', balls: ['#E58A8E', '#8FB9E3', '#F3D15C'] },
    wine: { outer: '#C8424F', bg: '#4E1220', fg: '#FBE3E5', acc: '#C8424F', balls: ['#C8424F', '#F4C9CB', '#9E2A3A'] },
    party: { outer: '#F2762E', bg: '#FFFDF6', fg: '#2E3E66', acc: '#F2762E', balls: ['#93A24B', '#8FB9E3', '#F3D15C'] }
  };
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function wrap(ctx, text, x, y, maxW, lh) {
    var words = text.split(' '), line = '', lines = [];
    words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    lines.slice(0, 3).forEach(function (l, i) { ctx.fillText(l, x, y + i * lh); });
  }
  $('#gDownload').addEventListener('click', function () {
    var T = THEMES[certTheme], W = 1600, H = 1000;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var draw = function () {
      ctx.fillStyle = T.outer; rr(ctx, 0, 0, W, H, 70); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.3)';
      for (var y = 22; y < H; y += 40) for (var x = 22; x < W; x += 40) { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 6.3); ctx.fill(); }
      ctx.fillStyle = T.bg; rr(ctx, 36, 36, W - 72, H - 72, 46); ctx.fill();
      ctx.strokeStyle = T.fg; ctx.globalAlpha = .25; ctx.lineWidth = 3; rr(ctx, 56, 56, W - 112, H - 112, 34); ctx.stroke(); ctx.globalAlpha = 1;
      [[1230, 190, 1.0, -0.14], [1400, 270, 0.9, 0.17], [1150, 370, 0.7, 0.07]].forEach(function (b, i) {
        ctx.save(); ctx.translate(b[0], b[1]); ctx.rotate(b[3]); ctx.scale(b[2], b[2]);
        ctx.strokeStyle = T.fg; ctx.globalAlpha = .35; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 95); ctx.lineTo(0, 300); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.fillStyle = T.balls[i]; ctx.beginPath(); ctx.ellipse(0, 0, 76, 95, 0, 0, 6.3); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-26, -36, 16, 24, -0.5, 0, 6.3); ctx.fill();
        ctx.restore();
      });
      ctx.fillStyle = T.fg; ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = .75; ctx.font = '700 34px Unbounded, sans-serif'; ctx.fillText('davcandles', 130, 210); ctx.globalAlpha = 1;
      ctx.font = '500 38px "Golos Text", sans-serif'; ctx.fillText('Подарочный сертификат', 130, 270);
      ctx.fillStyle = T.acc; ctx.font = (certSum === 'course' ? '110px' : '170px') + ' "Rubik Bubbles", sans-serif'; ctx.fillText(c.sum.textContent, 122, 450);
      ctx.fillStyle = T.fg; ctx.font = '700 60px Unbounded, sans-serif'; ctx.fillText('для ' + c.to.textContent, 130, 560);
      ctx.font = '400 38px "Golos Text", sans-serif'; wrap(ctx, c.wish.textContent, 130, 640, 900, 52);
      ctx.globalAlpha = .8; ctx.font = '400 34px "Golos Text", sans-serif'; ctx.fillText('с любовью, ' + c.from.textContent, 130, 850);
      ctx.globalAlpha = .6; ctx.font = '400 28px "Golos Text", sans-serif'; ctx.textAlign = 'right'; ctx.fillText('№ ' + c.no.textContent, W - 120, H - 110); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      var a = document.createElement('a');
      a.download = 'davcandles-sertifikat.png';
      try { a.href = cv.toDataURL('image/png'); } catch (e) { toast('Не удалось сохранить макет'); return; }
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast('Макет сохранён. Это предпросмотр, сертификат действует после оплаты');
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); else draw();
  });

  /* ---------- Слайдер отзывов ---------- */
  var track = $('#track'), dotsEl = $('#dots'), slides = $$('.review', track);
  function perView() { var w = slides[0].getBoundingClientRect().width || 1; return Math.max(1, Math.round(track.clientWidth / (w + 18))); }
  function pages() { return Math.max(1, slides.length - perView() + 1); }
  function buildDots() {
    dotsEl.innerHTML = '';
    for (var i = 0; i < pages(); i++) {
      var d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', 'Отзыв ' + (i + 1)); d.dataset.i = i; dotsEl.appendChild(d);
    }
    syncDots();
  }
  function current() { var w = slides[0].getBoundingClientRect().width + 18; return Math.round(track.scrollLeft / w); }
  function go(i) { i = Math.max(0, Math.min(pages() - 1, i)); track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft - 2, behavior: 'smooth' }); }
  function syncDots() { var i = current(); $$('button', dotsEl).forEach(function (d, k) { d.setAttribute('aria-current', String(k === i)); }); }
  $('#prev').addEventListener('click', function () { var i = current(); go(i <= 0 ? pages() - 1 : i - 1); });
  $('#next').addEventListener('click', function () { var i = current(); go(i >= pages() - 1 ? 0 : i + 1); });
  dotsEl.addEventListener('click', function (e) { var d = e.target.closest('button'); if (d) go(+d.dataset.i); });
  var st; track.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(syncDots, 60); }, { passive: true });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(buildDots, 150); });
  buildDots();
})();
