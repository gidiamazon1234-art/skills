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

  /* ---------- Colour picker ----------
     Which colours we have photos for is declared in assets/img/colors/available.txt
     (one slug per line, # for comments) — one small request, instead of probing
     every colour and littering the log with 404s. A swatch is only shown if its
     slug is listed, and the photo is still verified on click before it is swapped
     in, so a typo in the list can never blank the gallery. With no list, an empty
     list, or JS off, the block stays hidden and the page reads as it did before. */
  var pick = document.getElementById('colorPick');
  if (pick && window.fetch) {
    var swatches = Array.prototype.slice.call(pick.querySelectorAll('.cp'));
    var nameEl = document.getElementById('cpName');
    var mainImg = document.querySelector('.gallery-main .shot-img');

    function select(sw) {
      swatches.forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
      sw.setAttribute('aria-pressed', 'true');
      if (nameEl) nameEl.textContent = sw.dataset.name;
      if (mainImg) {
        mainImg.src = sw.dataset.photo;
        mainImg.alt = 'EnergyBud bottle in ' + sw.dataset.name;
      }
      // A colour is showing, so no thumbnail is the current view any more.
      document.querySelectorAll('.thumb').forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
    }

    fetch('assets/img/colors/available.txt', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .catch(function () { return ''; })
      .then(function (txt) {
        var listed = txt.split(/\r?\n/)
          .map(function (l) { return l.replace(/#.*/, '').trim().toLowerCase(); })
          .filter(Boolean);
        if (!listed.length) return;

        var live = swatches.filter(function (sw) { return listed.indexOf(sw.dataset.slug) > -1; });
        if (!live.length) return;

        swatches.forEach(function (sw) { if (live.indexOf(sw) < 0) sw.remove(); });
        live.forEach(function (sw) {
          sw.addEventListener('click', function () {
            // Verify before swapping: a listed-but-missing file drops its swatch
            // rather than leaving an empty gallery behind.
            var probe = new Image();
            probe.onload = function () { select(sw); };
            probe.onerror = function () { sw.remove(); };
            probe.src = sw.dataset.photo;
          });
        });
        pick.hidden = false;
        var fb = document.getElementById('colorFallback');
        if (fb) fb.hidden = true;
      });
  }

})();
