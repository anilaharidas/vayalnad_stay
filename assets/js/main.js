/* =========================================================
   Vayal Nad Stay — main.js
   ---------------------------------------------------------
   >>> REPLACE THESE PLACEHOLDER VALUES BEFORE GOING LIVE <<<
   ========================================================= */
window.VNS = {
  // WhatsApp number in full international format, digits only (no +, spaces or dashes)
  whatsapp: '919567394350',        // TODO: real number
  phoneDisplay: '+91 9567394350', // TODO
  email: 'vayalnadstay@gmail.com',
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
    var msg = el.getAttribute('data-wa') || 'Hello Vayal Nad Stay, I would like to enquire about a stay.';
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

  /* ---------- Hero photo slideshow ---------- */
  var heroMedia = document.querySelector('.hero__media');
  var heroSlides = document.querySelectorAll('.hero__slide');
  if (heroMedia && heroSlides.length > 1) {
    var heroIdx = 0;
    var heroTimer = null;
    var heroStopped = false;
    var heroAdvance = function () {
      heroSlides[heroIdx].classList.remove('is-active');
      heroIdx = (heroIdx + 1) % heroSlides.length;
      heroSlides[heroIdx].classList.add('is-active');
    };
    var heroStart = function () {
      if (heroTimer || heroStopped) return;
      heroTimer = setInterval(heroAdvance, 5000);
    };
    var heroPause = function () {
      clearInterval(heroTimer);
      heroTimer = null;
    };
    // Crop each photo to fill the hero. The crop window is placed so the whole
    // watermark stays visible and sits as close to the main subject as it can.
    // Only if the watermark cannot fit at all is the whole photo shown instead.
    var MIN_VISIBLE = 0.3;
    var place = function (lo, hi, want) { return Math.min(hi, Math.max(lo, want)); };
    var layoutHero = function () {
      var box = heroMedia.getBoundingClientRect();
      if (!box.width || !box.height) return;
      heroSlides.forEach(function (slide) {
        var img = slide.querySelector('img');
        var iw = parseFloat(img.getAttribute('width'));
        var ih = parseFloat(img.getAttribute('height'));
        var subj = (slide.getAttribute('data-subject') || '0.5,0.5').split(',').map(parseFloat);
        var wm = (slide.getAttribute('data-wm') || '').split(',').filter(Boolean).map(parseFloat);
        var scale = Math.max(box.width / iw, box.height / ih);
        var fx = Math.min(1, box.width / (iw * scale));
        var fy = Math.min(1, box.height / (ih * scale));
        var loX = 0, hiX = 1 - fx, loY = 0, hiY = 1 - fy;
        if (wm.length) {
          loX = Math.max(loX, wm[2] - fx); hiX = Math.min(hiX, wm[0]);
          loY = Math.max(loY, wm[3] - fy); hiY = Math.min(hiY, wm[1]);
        }
        var ok = Math.min(fx, fy) >= MIN_VISIBLE && loX <= hiX + 0.0005 && loY <= hiY + 0.0005;
        slide.classList.toggle('is-cover', ok);
        if (ok) {
          var left = place(loX, Math.max(loX, hiX), subj[0] - fx / 2);
          var top = place(loY, Math.max(loY, hiY), subj[1] - fy / 2);
          var px = (1 - fx) > 0.0005 ? left / (1 - fx) * 100 : 50;
          var py = (1 - fy) > 0.0005 ? top / (1 - fy) * 100 : 50;
          img.style.objectPosition = px.toFixed(2) + '% ' + py.toFixed(2) + '%';
        } else {
          img.style.objectPosition = '';
        }
      });
    };
    layoutHero();
    var heroResizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(heroResizeTimer);
      heroResizeTimer = setTimeout(layoutHero, 120);
    });
    window.addEventListener('load', layoutHero);

    heroStart();
    heroMedia.addEventListener('mouseenter', heroPause);
    heroMedia.addEventListener('mouseleave', heroStart);
    heroMedia.addEventListener('click', function () {
      heroStopped = true;
      heroPause();
    });
  }

  /* ---------- Video frame ---------- */
  document.querySelectorAll('.video-frame').forEach(function (frame) {
    var btn = frame.querySelector('.video-frame__play');
    var video = frame.querySelector('video');
    if (!btn || !video) return;
    btn.addEventListener('click', function () {
      frame.classList.add('is-playing');
      video.play();
    });
    video.addEventListener('play', function () { frame.classList.add('is-playing'); });
  });

  /* ---------- Photo sliders ---------- */
  document.querySelectorAll('.slider').forEach(function (slider) {
    var track = slider.querySelector('.slider__track');
    var slides = slider.querySelectorAll('.slider__slide');
    var count = slider.querySelector('.slider__count');
    var idx = 0;
    var total = slides.length;
    if (!track || total < 2) return;

    function show(i) {
      idx = (i + total) % total;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      if (count) count.textContent = (idx + 1) + ' / ' + total;
      var img = slides[idx].querySelector('img');
      if (img) img.loading = 'eager';
      var next = slides[(idx + 1) % total].querySelector('img');
      if (next) next.loading = 'eager';
    }

    slider.querySelector('.slider__btn--prev').addEventListener('click', function () { show(idx - 1); });
    slider.querySelector('.slider__btn--next').addEventListener('click', function () { show(idx + 1); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    });

    var startX = null;
    slider.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    slider.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) show(dx < 0 ? idx + 1 : idx - 1);
    });
    slider.addEventListener('pointercancel', function () { startX = null; });

    show(0);
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

    // ?ladies=1 pre-ticks the ladies-only option
    if (new URLSearchParams(window.location.search).get('ladies')) {
      var ladiesEl = form.querySelector('[name="ladies"]');
      if (ladiesEl) ladiesEl.checked = true;
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
        'Hello Vayal Nad Stay, I would like to request a booking.',
        '',
        'Name: ' + (data.get('name') || '—'),
        'Room: ' + (data.get('room') || '—'),
        'Check-in: ' + (fmtDate(ci) || '—'),
        'Check-out: ' + (fmtDate(co) || '—'),
        (n ? 'Nights: ' + n : ''),
        'Guests: ' + (data.get('adults') || '0') + ' adult(s), ' + (data.get('children') || '0') + ' child(ren)',
        (data.get('taxi') ? 'Local taxi needed: Yes' : ''),
        (data.get('ladies') ? 'Ladies-only stay: Yes (only women guests)' : ''),
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

  /* ---------- Guest reviews + feedback form ---------- */
  var STAR_PATH = 'm12 2 3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z';
  var starSvg = function () {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', STAR_PATH);
    svg.appendChild(path);
    return svg;
  };
  var el = function (tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  };

  var reviewsList = document.getElementById('reviews-list');
  if (reviewsList) {
    var summary = document.getElementById('reviews-summary');
    var empty = document.getElementById('reviews-empty');
    var moreBtn = document.getElementById('reviews-more');
    var phoneQuery = window.matchMedia('(max-width: 640px)');
    var cards = [];
    var expanded = false;

    var initialCount = function () { return phoneQuery.matches ? 3 : 6; };

    // Show "Read more" only on comments that are actually cut off.
    var updateClamps = function () {
      cards.forEach(function (card) {
        if (card.hidden) return;
        var quote = card.querySelector('blockquote');
        var toggle = card.querySelector('.quote__more');
        if (!toggle) return;
        if (quote.classList.contains('is-open')) { toggle.hidden = false; return; }
        toggle.hidden = !(quote.scrollHeight > quote.clientHeight + 1);
      });
    };

    var applyLimit = function () {
      var limit = expanded ? cards.length : initialCount();
      cards.forEach(function (card, i) { card.hidden = i >= limit; });
      if (moreBtn) {
        var hasExtra = cards.length > initialCount();
        moreBtn.hidden = !hasExtra;
        moreBtn.textContent = expanded ? 'Show fewer reviews' : 'Show more reviews';
        moreBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      }
      updateClamps();
    };

    fetch('/api/reviews')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        if (!data.reviews || !data.reviews.length) { if (empty) empty.hidden = false; return; }
        data.reviews.forEach(function (rv) {
          var fig = el('figure', 'quote');
          var stars = el('div', 'quote__stars');
          stars.setAttribute('aria-label', rv.rating + ' out of 5');
          for (var i = 0; i < rv.rating; i++) stars.appendChild(starSvg());
          fig.appendChild(stars);
          fig.appendChild(el('blockquote', '', '\u201C' + rv.comment + '\u201D'));
          var more = el('button', 'quote__more', 'Read more');
          more.type = 'button';
          more.hidden = true;
          more.addEventListener('click', function () {
            var quote = fig.querySelector('blockquote');
            var open = quote.classList.toggle('is-open');
            more.textContent = open ? 'Show less' : 'Read more';
          });
          fig.appendChild(more);
          var by = el('figcaption', 'quote__by');
          by.appendChild(el('strong', '', rv.name));
          fig.appendChild(by);
          reviewsList.appendChild(fig);
          cards.push(fig);
        });
        if (summary && data.average) {
          summary.innerHTML = '';
          summary.appendChild(el('strong', '', String(data.average)));
          summary.appendChild(document.createTextNode('/ 5 from ' + data.count + (data.count === 1 ? ' review' : ' reviews')));
          summary.hidden = false;
        }
        applyLimit();
        if (moreBtn) moreBtn.addEventListener('click', function () { expanded = !expanded; applyLimit(); });
        var resizeTimer;
        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(applyLimit, 150);
        });
      })
      .catch(function () { if (empty) empty.hidden = false; });
  }

  var fbForm = document.getElementById('feedback-form');
  if (fbForm) {
    var fbStatus = document.getElementById('feedback-status');
    var fbBtn = fbForm.querySelector('button[type="submit"]');
    var showStatus = function (msg, ok) {
      fbStatus.textContent = msg;
      fbStatus.className = 'form-status ' + (ok ? 'is-ok' : 'is-error');
    };
    fbForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(fbForm);
      if (!data.get('rating')) { showStatus('Please choose a star rating.', false); return; }
      fbBtn.disabled = true;
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          rating: data.get('rating'),
          comment: data.get('comment'),
          website: data.get('website')
        })
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok) {
            fbForm.reset();
            showStatus('Thank you! Your feedback has been received and will appear on the site once we have reviewed it.', true);
          } else {
            showStatus(res.body.error || 'Something went wrong. Please try again.', false);
          }
        })
        .catch(function () { showStatus('Could not send your feedback. Please check your connection and try again.', false); })
        .then(function () { fbBtn.disabled = false; });
    });
  }

})();
