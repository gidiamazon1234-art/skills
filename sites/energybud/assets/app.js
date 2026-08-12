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

  /* ---------- Outbound Amazon tracking ----------
     Every buy link keeps working with JS off; this only decorates it on click.
     Fill in the two values below once and every CTA on the site is tracked:
       tag         your Associates / Brand Referral tag  e.g. 'energybud-20'
       attribution your Amazon Attribution id from the Advertising console
     Leaving them empty changes nothing. `ascsubtag` always records which button
     was used (hero, nav, pdp-buy, ...) so you can see what actually converts. */
  var AMAZON = { tag: '', attribution: '' };

  function decorate(url, place) {
    try {
      var u = new URL(url, location.href);
      if (!/(^|\.)amazon\./.test(u.hostname)) return url;
      if (AMAZON.tag) u.searchParams.set('tag', AMAZON.tag);
      if (AMAZON.attribution) { u.searchParams.set('maas', AMAZON.attribution); u.searchParams.set('ref_', 'aa_maas'); }
      if (place) u.searchParams.set('ascsubtag', place);
      return u.toString();
    } catch (e) { return url; }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="amazon."]');
    if (!a) return;
    var place = a.dataset.track || 'other';
    // Fire into whichever analytics tool is present; no-op when none is loaded.
    if (window.gtag) window.gtag('event', 'select_promotion', { promotion_name: 'buy_on_amazon', location_id: place });
    if (window.plausible) window.plausible('Buy on Amazon', { props: { location: place } });
    if (window.dataLayer) window.dataLayer.push({ event: 'amazon_click', location: place });
    a.href = decorate(a.getAttribute('href'), place);
  });

  /* ---------- Size toggle (product page) ----------
     Both sizes are variations of one Amazon listing, so the buy link is unchanged;
     the toggle swaps the gallery and the stated capacity, and tags the outbound
     click so Amazon reports which size the visitor was looking at. */
  var sizeOpts = document.querySelectorAll('.size-opt');
  if (sizeOpts.length) {
    var capEl = document.getElementById('sizeCap');
    sizeOpts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        sizeOpts.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        opt.setAttribute('aria-pressed', 'true');
        if (capEl) capEl.textContent = opt.dataset.cap;

        // Point the thumbnails at this size, keeping the current shot if the
        // photo for it hasn't been added yet.
        var thumbs = document.querySelectorAll('.thumb');
        [opt.dataset.img, opt.dataset.alt].forEach(function (src, i) {
          var th = thumbs[i]; if (!th || !src) return;
          var probe = new Image();
          probe.onload = function () {
            th.dataset.img = src;
            var thumbImg = th.querySelector('img'); if (thumbImg) thumbImg.src = src;
            if (th.getAttribute('aria-pressed') === 'true') {
              var main = document.querySelector('.gallery-main .shot-img');
              if (main) main.src = src;
            }
          };
          probe.src = src;
        });

        // Record the size on every Amazon link on this page.
        document.querySelectorAll('a[href*="amazon."]').forEach(function (a) {
          a.dataset.track = (a.dataset.track || 'pdp').replace(/-(128|74)$/, '') + '-' + opt.dataset.trackSize;
        });
      });
    });
  }

})();
