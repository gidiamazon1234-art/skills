/* EnergyBud — shared site behavior */
(function () {
  'use strict';
  var PRICE = 39.95, SHIP = 0, TAX_RATE = 0.0;
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

  /* ---------- Cart (localStorage) ---------- */
  var KEY = 'energybud_cart';
  function getCart() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function setCart(c) { localStorage.setItem(KEY, JSON.stringify(c)); updateCount(); }
  function count() { return getCart().reduce(function (n, i) { return n + i.qty; }, 0); }
  function updateCount() {
    var n = count();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n; el.hidden = n === 0;
    });
  }
  function addToCart(item) {
    var c = getCart();
    var found = c.find(function (i) { return i.color === item.color; });
    if (found) found.qty += item.qty; else c.push(item);
    setCart(c);
  }
  window.EnergyBud = { addToCart: addToCart, getCart: getCart, setCart: setCart, PRICE: PRICE };

  /* ---------- Home: variant swatches ---------- */
  var vs1 = document.getElementById('vs1'), vs2 = document.getElementById('vs2'), vn = document.getElementById('variantName');
  document.querySelectorAll('.swatch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.swatch').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      if (vs1) vs1.setAttribute('stop-color', btn.dataset.c1);
      if (vs2) vs2.setAttribute('stop-color', btn.dataset.c2);
      if (vn) vn.textContent = btn.dataset.name;
    });
  });

  /* ---------- Product page ---------- */
  var pdp = document.getElementById('pdp');
  if (pdp) {
    var qtyInput = document.getElementById('qty');
    var g1 = document.getElementById('pg1'), g2 = document.getElementById('pg2');
    var colorName = document.getElementById('pColorName');
    var currentColor = { name: 'Glacier Blue', c1: '#38BDF8', c2: '#0369A1' };

    document.querySelectorAll('.qty button').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = parseInt(qtyInput.value, 10) || 1;
        v += (b.dataset.step === '+' ? 1 : -1);
        qtyInput.value = Math.max(1, Math.min(10, v));
      });
    });

    document.querySelectorAll('.thumb').forEach(function (th) {
      th.addEventListener('click', function () {
        document.querySelectorAll('.thumb').forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
        th.setAttribute('aria-pressed', 'true');
        currentColor = { name: th.dataset.name, c1: th.dataset.c1, c2: th.dataset.c2 };
        if (g1) g1.setAttribute('stop-color', th.dataset.c1);
        if (g2) g2.setAttribute('stop-color', th.dataset.c2);
        if (colorName) colorName.textContent = th.dataset.name;
        // Swap the main photo when one exists for this colourway
        var slot = document.querySelector('.gallery-main .shot');
        if (slot && th.dataset.img) {
          slot.dataset.photo = th.dataset.img;
          var cur = slot.querySelector('.shot-img');
          if (cur) cur.remove();
          slot.classList.remove('has-photo');
          mountPhoto(slot);
        }
      });
    });

    var addBtn = document.getElementById('addBtn');
    addBtn && addBtn.addEventListener('click', function () {
      addToCart({ color: currentColor.name, qty: parseInt(qtyInput.value, 10) || 1, price: PRICE });
      var orig = addBtn.textContent;
      addBtn.textContent = 'Added to cart ✓';
      addBtn.classList.add('added');
      setTimeout(function () { addBtn.textContent = orig; addBtn.classList.remove('added'); }, 1800);
    });
  }

  /* ---------- Cart page ---------- */
  var cartRoot = document.getElementById('cartItems');
  if (cartRoot) {
    function money(n) { return '$' + n.toFixed(2); }
    function bottleSVG(c1, c2) {
      return '<svg viewBox="0 0 120 150" aria-hidden="true"><defs><linearGradient id="cg' + c1.replace('#', '') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><rect x="48" y="8" width="24" height="14" rx="4" fill="#7893A6"/><path d="M34 30 h52 a14 14 0 0 1 14 14 v82 a14 14 0 0 1 -14 14 h-52 a14 14 0 0 1 -14 -14 v-82 a14 14 0 0 1 14 -14 z" fill="url(#cg' + c1.replace('#', '') + ')"/></svg>';
    }
    var colorMap = { 'Glacier Blue': ['#38BDF8', '#0369A1'], 'Midnight Black': ['#475569', '#0A0F1A'] };

    function render() {
      var cart = getCart();
      var subtotalEl = document.getElementById('subtotal'),
          totalEl = document.getElementById('total'),
          checkoutBtn = document.getElementById('checkoutBtn');
      if (!cart.length) {
        cartRoot.innerHTML = '<div class="empty-cart"><p style="font-size:1.2rem">Your cart is empty.</p><a class="btn btn-primary" href="product.html" style="margin-top:1rem">Shop the gallon</a></div>';
        document.getElementById('summaryCard').style.display = 'none';
        return;
      }
      cartRoot.innerHTML = cart.map(function (i, idx) {
        var cm = colorMap[i.color] || ['#38BDF8', '#0369A1'];
        return '<div class="cart-item"><div class="cart-thumb">' + bottleSVG(cm[0], cm[1]) + '</div>' +
          '<div><h3>EnergyBud 1 Gallon Bottle</h3><div class="meta">' + i.color + ' · 128 oz</div>' +
          '<div class="qty" style="margin-top:.6rem"><button data-idx="' + idx + '" data-step="-" aria-label="Decrease">–</button>' +
          '<input value="' + i.qty + '" readonly aria-label="Quantity"><button data-idx="' + idx + '" data-step="+" aria-label="Increase">+</button></div></div>' +
          '<div><div class="line-price tnum">' + money(i.price * i.qty) + '</div><button class="remove" data-remove="' + idx + '">Remove</button></div></div>';
      }).join('');

      var subtotal = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
      subtotalEl.textContent = money(subtotal);
      totalEl.textContent = money(subtotal + SHIP);
      document.getElementById('summaryCard').style.display = '';

      cartRoot.querySelectorAll('.qty button').forEach(function (b) {
        b.addEventListener('click', function () {
          var c = getCart(), idx = +b.dataset.idx;
          c[idx].qty = Math.max(1, c[idx].qty + (b.dataset.step === '+' ? 1 : -1));
          setCart(c); render();
        });
      });
      cartRoot.querySelectorAll('[data-remove]').forEach(function (b) {
        b.addEventListener('click', function () {
          var c = getCart(); c.splice(+b.dataset.remove, 1); setCart(c); render();
        });
      });
    }
    var checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn && checkoutBtn.addEventListener('click', function () {
      checkoutBtn.textContent = 'Order placed ✓ — hydrate on!';
      setCart([]); setTimeout(render, 1400);
    });
    var promoBtn = document.getElementById('promoBtn');
    promoBtn && promoBtn.addEventListener('click', function () {
      var msg = document.getElementById('promoMsg');
      msg.textContent = 'Demo store — promo codes are illustrative.';
    });
    render();
  }

  /* ---------- Photo slots ----------
     Each .shot[data-photo] ships an SVG illustration as its default. We HEAD-probe the
     photo first: a 404 resolves normally (no console error, no broken-image icon), so the
     page stays clean until the real photography is uploaded — then it appears by itself. */
  function mountPhoto(slot) {
    var url = slot.dataset.photo;
    if (!url || location.protocol === 'file:') return;
    fetch(url, { method: 'HEAD' }).then(function (res) {
      if (!res.ok) return;
      var img = document.createElement('img');
      img.className = 'shot-img';
      img.alt = slot.dataset.photoAlt || '';
      img.src = url;
      img.addEventListener('error', function () { img.remove(); });
      slot.appendChild(img);
      slot.classList.add('has-photo');
    }).catch(function () { /* offline or blocked: keep the SVG */ });
  }
  document.querySelectorAll('.shot[data-photo]').forEach(mountPhoto);

  updateCount();
})();
