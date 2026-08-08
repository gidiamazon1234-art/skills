/* EnergyBud — shared site behavior */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js'); // enable reveal animations only when JS runs

  /* ---------- Theme toggle ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('#themeToggle');
    if (!t) return;
    var explicit = root.getAttribute('data-theme');
    var dark = explicit ? explicit === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el, i) { el.style.transitionDelay = (Math.min(i % 3, 2) * 70) + 'ms'; io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Product gallery ---------- */
  document.querySelectorAll('.thumb').forEach(function (th) {
    th.addEventListener('click', function () {
      document.querySelectorAll('.thumb').forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
      th.setAttribute('aria-pressed', 'true');
      var mainImg = document.querySelector('.gallery-main .shot-img');
      if (mainImg && th.dataset.img) mainImg.src = th.dataset.img;
    });
  });

  /* ---------- Photo slots ----------
     Photos are plain <img> so the browser fetches them without waiting on JS, with
     width/height set to reserve space (no layout shift). If one ever fails to load we
     drop it and the inline SVG illustration underneath takes over. */
  document.querySelectorAll('.shot-img').forEach(function (img) {
    var slot = img.parentElement;
    function drop() { img.remove(); slot.classList.remove('has-photo'); }
    function keep() { slot.classList.add('has-photo'); }
    img.addEventListener('error', drop);
    img.addEventListener('load', keep);
    if (img.complete) { img.naturalWidth === 0 ? drop() : keep(); }
  });

})();
