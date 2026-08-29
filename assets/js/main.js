/* =========================================================
   Vayalnad Stay — main.js
   ---------------------------------------------------------
   >>> REPLACE THESE PLACEHOLDER VALUES BEFORE GOING LIVE <<<
   ========================================================= */
window.VNS = {
  // WhatsApp number in full international format, digits only (no +, spaces or dashes)
  whatsapp: '919567394350',        // TODO: real number
  phoneDisplay: '+91 9567394350', // TODO
  email: 'stay@vayalnadstay.com',  // TODO
};

(function () {
  'use strict';

  /* ---------- Mobile nav ---------- */
  var nav = document.getElementById('primary-nav');
  var toggle = document.querySelector('.nav-toggle');
  var closeBtn = document.querySelector('.nav__close');

  function openNav() {
    if (!nav) return;
    nav.classList.add('is-open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = nav.querySelector('a, button');
    first && first.focus();
  }
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggle && toggle.focus();
  }
  toggle && toggle.addEventListener('click', openNav);
  closeBtn && closeBtn.addEventListener('click', closeNav);
  nav && nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeNav();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) closeNav();
  });

  /* ---------- Fill WhatsApp / contact links ---------- */
  var waBase = 'https://wa.me/' + window.VNS.whatsapp;
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    var msg = el.getAttribute('data-wa') || 'Hello Vayalnad Stay, I would like to enquire about a stay.';
    el.setAttribute('href', waBase + '?text=' + encodeURIComponent(msg));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
  document.querySelectorAll('[data-tel]').forEach(function (el) {
    el.setAttribute('href', 'tel:' + window.VNS.whatsapp);
    if (el.hasAttribute('data-tel-text')) el.textContent = window.VNS.phoneDisplay;
  });
  document.querySelectorAll('[data-email]').forEach(function (el) {
    el.setAttribute('href', 'mailto:' + window.VNS.email);
    if (el.hasAttribute('data-email-text')) el.textContent = window.VNS.email;
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Video frame ---------- */
  document.querySelectorAll('.video-frame').forEach(function (frame) {
    var btn = frame.querySelector('.video-frame__play');
    var video = frame.querySelector('video');
    if (!btn || !video) return;
    btn.addEventListener('click', function () {
      frame.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      video.play();
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    var idx = 0;
    var lastFocus = null;

    function show(i) {
      idx = (i + items.length) % items.length;
      var src = items[idx].getAttribute('data-full') || items[idx].querySelector('img').src;
      var alt = items[idx].querySelector('img').alt || '';
      lbImg.src = src;
      lbImg.alt = alt;
    }
    function openLb(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    }
    function closeLb() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
      lbImg.src = '';
      lastFocus && lastFocus.focus();
    }
    items.forEach(function (item, i) {
      item.addEventListener('click', function (e) { e.preventDefault(); openLb(i); });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', closeLb);
    lb.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- Booking form -> WhatsApp ---------- */
  var form = document.getElementById('booking-form');
  if (form) {
    var summaryEl = document.getElementById('booking-summary');

    // pre-select room from ?room= query param
    var roomParam = new URLSearchParams(window.location.search).get('room');
    if (roomParam) {
      var roomSel = form.querySelector('[name="room"]');
      if (roomSel) {
        Array.prototype.forEach.call(roomSel.options, function (o) {
          if (o.value.toLowerCase() === roomParam.toLowerCase()) o.selected = true;
        });
      }
    }

    var fmtDate = function (v) {
      if (!v) return '';
      var d = new Date(v + 'T00:00:00');
      if (isNaN(d)) return v;
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };
    var nights = function (a, b) {
      var d1 = new Date(a), d2 = new Date(b);
      var n = Math.round((d2 - d1) / 86400000);
      return n > 0 ? n : 0;
    };

    var build = function () {
      var data = new FormData(form);
      var ci = data.get('checkin'), co = data.get('checkout');
      var n = (ci && co) ? nights(ci, co) : 0;
      var lines = [
        'Hello Vayalnad Stay, I would like to request a booking.',
        '',
        'Name: ' + (data.get('name') || '—'),
        'Room: ' + (data.get('room') || '—'),
        'Check-in: ' + (fmtDate(ci) || '—'),
        'Check-out: ' + (fmtDate(co) || '—'),
        (n ? 'Nights: ' + n : ''),
        'Guests: ' + (data.get('adults') || '0') + ' adult(s), ' + (data.get('children') || '0') + ' child(ren)',
        (data.get('phone') ? 'My phone: ' + data.get('phone') : ''),
        (data.get('message') ? '' : null),
        (data.get('message') ? 'Notes: ' + data.get('message') : '')
      ].filter(function (l) { return l !== '' && l !== null; });
      return lines.join('\n');
    };

    var refresh = function () {
      if (summaryEl) summaryEl.textContent = build();
    };
    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    refresh();

    // basic date guards
    var ciEl = form.querySelector('[name="checkin"]');
    var coEl = form.querySelector('[name="checkout"]');
    var today = new Date().toISOString().split('T')[0];
    if (ciEl) ciEl.min = today;
    ciEl && ciEl.addEventListener('change', function () {
      if (coEl) { coEl.min = ciEl.value || today; if (coEl.value && coEl.value <= ciEl.value) coEl.value = ''; }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var field = f.closest('.field');
        if (!f.value) { field && field.classList.add('has-error'); ok = false; }
        else { field && field.classList.remove('has-error'); }
      });
      if (ciEl && coEl && ciEl.value && coEl.value && coEl.value <= ciEl.value) {
        coEl.closest('.field').classList.add('has-error');
        ok = false;
      }
      if (!ok) {
        var firstErr = form.querySelector('.has-error input, .has-error select');
        firstErr && firstErr.focus();
        return;
      }
      var url = 'https://wa.me/' + window.VNS.whatsapp + '?text=' + encodeURIComponent(build());
      window.open(url, '_blank', 'noopener');
    });
  }
})();
