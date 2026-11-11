(function () {
  var d = document, b = d.body, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };

  /* --- то, что работает без анимации --- */
  var top = d.getElementById('top'), menu = d.getElementById('menu'), bur = d.getElementById('burger');
  var scrolled = false;
  function setTop() { top.classList.toggle('on', scrolled || !menu.hidden); }
  function setMenu(open) {
    bur.setAttribute('aria-expanded', open);
    bur.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open; setTop();
    b.style.overflow = open ? 'hidden' : '';
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  }
  bur.addEventListener('click', function () { setMenu(bur.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  d.querySelectorAll('[data-want]').forEach(function (a) {
    var t = 'Здравствуйте! Хочу заказать: ' + a.getAttribute('data-want') + ' (увидел(а) на сайте).';
    a.href = 'https://wa.me/79930335343?text=' + encodeURIComponent(t);
    a.target = '_blank'; a.rel = 'noopener';
  });

  // четыре бюджета: выбор размера кнопками
  var bBtns = d.querySelectorAll('#bSel button'), bFigs = d.querySelectorAll('#bStage .bs'), bWant = d.getElementById('bWant');
  var hoverable = window.matchMedia('(hover: hover)').matches;
  function pick(i) {
    bBtns.forEach(function (bt, k) { bt.setAttribute('aria-selected', k === i); bt.tabIndex = k === i ? 0 : -1; });
    bFigs.forEach(function (f, k) { f.classList.toggle('is-on', k === i); });
    var name = bBtns[i].querySelector('.bn').textContent, price = bBtns[i].querySelector('b').textContent.replace(/\u00a0/g, ' ');
    var t = 'Здравствуйте! Хочу заказать: розы в размере «' + name + '», ' + price + ' (увидел(а) на сайте).';
    bWant.href = 'https://wa.me/79930335343?text=' + encodeURIComponent(t);
  }
  bBtns.forEach(function (bt, i) {
    bt.addEventListener('click', function () { pick(i); });
    if (hoverable) bt.addEventListener('mouseenter', function () { pick(i); });
    bt.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (n) { e.preventDefault(); var j = (i + n + bBtns.length) % bBtns.length; pick(j); bBtns[j].focus(); }
    });
  });
  // заранее подгружаем все четыре кадра, чтобы смена была мгновенной
  bFigs.forEach(function (f) { var im = f.querySelector('img'); if (im) im.loading = 'eager'; });
  if (bBtns.length) pick(0);

  // бегущая строка отзывов: дублируем для бесшовного круга
  var mq = d.querySelector('.mq-track');
  if (mq && !reduce) {
    Array.prototype.slice.call(mq.children).forEach(function (n) {
      var c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); mq.appendChild(c);
    });
    mq.classList.add('run');
  }

  var sentinel = d.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none';
  b.prepend(sentinel);
  new IntersectionObserver(function (es) { scrolled = !es[0].isIntersecting; setTop(); }).observe(sentinel);

  var loader = d.getElementById('loader');
  if (!hasG || reduce) {
    if (loader) loader.remove();
    root.classList.remove('js');
    return;
  }

  /* --- движение --- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  gsap.registerPlugin(ScrollTrigger);
  var ease = 'expo.out';

  // плавная прокрутка
  if (typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    d.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var el = d.querySelector(id); if (!el) return;
        e.preventDefault(); lenis.scrollTo(el, { offset: id === '#top' ? 0 : -70, duration: 1.6 });
      });
    });
  }

  // заставка → первый экран
  var heroImg = d.querySelector('.hero-img');
  gsap.set(heroImg, { scale: 1.14 });
  var intro = gsap.timeline({ defaults: { ease: ease } });
  intro
    .to('.ld', { strokeDashoffset: 0, duration: 1.1, stagger: 0.12, ease: 'power2.inOut' })
    .to('.ldot', { opacity: 1, duration: 0.4, stagger: 0.08 }, '-=0.35')
    .to('.loader-word', { opacity: 1, duration: 0.6 }, '-=0.4')
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '+=0.15')
    .to(heroImg, { scale: 1, duration: 2.4, ease: 'expo.out' }, '-=0.8')
    .to('.hero-title .ln>span', { y: 0, duration: 1.4, stagger: 0.11 }, '-=2.2')
    .to('.h-fade', { opacity: 1, duration: 1.2, stagger: 0.12 }, '-=1.1')
    .to('.season', { opacity: 1, duration: 1 }, '-=0.9')
    .add(function () { loader.remove(); });

  // первый экран уходит с параллаксом
  gsap.to(heroImg, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-in', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // манифест: слова проявляются при прокрутке
  var mt = d.getElementById('manifestText');
  if (mt) {
    var html = mt.innerHTML.split(' ').map(function (w) { return '<span class="mw">' + w + '</span>'; }).join(' ');
    mt.innerHTML = html;
    gsap.fromTo(mt.querySelectorAll('.mw'), { opacity: 0.16 }, { opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: mt, start: 'top 78%', end: 'bottom 45%', scrub: true } });
  }
  gsap.fromTo('.manifest-pic img', { scale: 1.18, yPercent: -6 }, { scale: 1, yPercent: 6, ease: 'none',
    scrollTrigger: { trigger: '.manifest-pic', start: 'top bottom', end: 'bottom top', scrub: true } });

  // заголовки и блоки: мягкое появление
  gsap.utils.toArray('.vit-head, .wed-t, .oc, .rev-head, .visit-l, .visit-r, .steps').forEach(function (el) {
    gsap.from(el, { y: 48, opacity: 0, duration: 1.3, ease: ease, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
  });

  // свадьба: параллакс внутри рамки
  gsap.fromTo('.wed-img', { scale: 1.16, yPercent: -7 }, { yPercent: 7, ease: 'none',
    scrollTrigger: { trigger: '.wed-img-w', start: 'top bottom', end: 'bottom top', scrub: true } });

  // шапка темнеет над вечерними разделами
  ScrollTrigger.create({ trigger: '.visit', start: 'top ' + 60, endTrigger: '.foot', end: 'bottom top',
    onToggle: function (st) { top.classList.toggle('dark', st.isActive); } });

  // подвал: слово собирается
  gsap.from('.foot-word', { yPercent: 40, opacity: 0, duration: 1.6, ease: ease, scrollTrigger: { trigger: '.foot', start: 'top 92%', once: true } });

  // закреплённые сцены — только на широком горизонтальном экране
  var mm = gsap.matchMedia();
  mm.add('(min-width: 1000px) and (min-height: 600px) and (min-aspect-ratio: 1/1)', function () {
    // витрина — горизонтальная лента
    var vit = d.querySelector('.vitrina'); vit.classList.add('is-pin');
    var track = d.getElementById('vitTrack');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '.vitrina', start: 'top top', end: function () { return '+=' + dist(); }, pin: '.vit-pin', scrub: 0.8, invalidateOnRefresh: true } });

    return function () { vit.classList.remove('is-pin'); gsap.set(track, { clearProps: 'all' }); };
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
