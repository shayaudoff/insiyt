/* =============================================================
   INSIYT — somatic-therapy/script.js
   Page-specific JS:
   1. Nav — scroll state, hamburger, mobile accordion
   2. Smooth scroll with nav offset
   3. Progress bar
   4. Scroll reveal (.reveal / .reveal-l / .reveal-r)
   5. Movement cards stagger in
   6. Drum cards stagger in
   7. Pill active-section tracking
   8. Floating particles in hero (blush + faint sage)
   ============================================================= */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. NAV
     ───────────────────────────────────────── */
  var nav = document.getElementById('sitenav');
  var ham = document.getElementById('ham');

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 55);
  }, { passive: true });

  ham.addEventListener('click', function (e) {
    e.stopPropagation();
    document.body.classList.toggle('nav-open');
  });

  document.addEventListener('click', function (e) {
    if (
      document.body.classList.contains('nav-open') &&
      !e.target.closest('#mobmenu') &&
      !e.target.closest('#ham')
    ) {
      document.body.classList.remove('nav-open');
    }
  });

  document.querySelectorAll('.mob-tog').forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      var item = t.closest('.mob-item');
      var sub  = item.querySelector('.mob-sub');
      var open = item.classList.contains('open');

      /* close all */
      document.querySelectorAll('.mob-item.open').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.mob-sub').classList.remove('open');
        i.querySelector('.mob-tog-icon').textContent = '+';
      });

      if (!open) {
        item.classList.add('open');
        sub.classList.add('open');
        t.querySelector('.mob-tog-icon').textContent = '−';
      }
    });
  });


  /* ─────────────────────────────────────────
     2. SMOOTH SCROLL — offset for fixed nav
     ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#') return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 72;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navH - 10,
        behavior: 'smooth',
      });
      history.pushState(null, '', id);
      document.body.classList.remove('nav-open');
    });
  });


  /* ─────────────────────────────────────────
     3. PROGRESS BAR
     ───────────────────────────────────────── */
  var pgbar = document.getElementById('pgbar');
  window.addEventListener('scroll', function () {
    var s = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    pgbar.style.width = (h > 0 ? (s / h) * 100 : 0) + '%';
  }, { passive: true });


  /* ─────────────────────────────────────────
     4. SCROLL REVEAL
     ───────────────────────────────────────── */
  var revEls = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');

  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var d = parseInt(e.target.dataset.delay) || 0;
          setTimeout(function () { e.target.classList.add('in'); }, d);
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revEls.forEach(function (el) { ro.observe(el); });
  } else {
    revEls.forEach(function (el) { el.classList.add('in'); });
  }


  /* ─────────────────────────────────────────
     5. MOVEMENT CARDS STAGGER
     ───────────────────────────────────────── */
  var movGrid  = document.querySelector('.mov-grid');
  var movCards = document.querySelectorAll('.mov-card');

  if (movGrid && movCards.length) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          movCards.forEach(function (c, i) {
            setTimeout(function () { c.classList.add('in'); }, i * 110);
          });
        }
      }, { threshold: 0.08 }).observe(movGrid);
    } else {
      movCards.forEach(function (c) { c.classList.add('in'); });
    }
  }


  /* ─────────────────────────────────────────
     6. DRUM CARDS STAGGER
     ───────────────────────────────────────── */
  var drumGrid  = document.querySelector('.drum-grid');
  var drumCards = document.querySelectorAll('.drum-card');

  if (drumGrid && drumCards.length) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          drumCards.forEach(function (c, i) {
            setTimeout(function () { c.classList.add('in'); }, i * 90);
          });
        }
      }, { threshold: 0.08 }).observe(drumGrid);
    } else {
      drumCards.forEach(function (c) { c.classList.add('in'); });
    }
  }


  /* ─────────────────────────────────────────
     7. PILL ACTIVE-SECTION TRACKING
     Highlights the matching jump pill as the
     user scrolls into each section.
     ───────────────────────────────────────── */
  var pills = document.querySelectorAll('.pill');

  document.querySelectorAll('section[id]').forEach(function (sec) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          pills.forEach(function (p) {
            p.classList.toggle('active', p.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { threshold: 0.25, rootMargin: '-64px 0px -35% 0px' }).observe(sec);
  });


  /* ─────────────────────────────────────────
     8. FLOATING PARTICLES
     Pale blush and very faint sage dots drift
     upward through the hero and dissolve —
     soft, unhurried, calming.
     ───────────────────────────────────────── */
  var particleEl = document.getElementById('particles');

  if (particleEl) {
    for (var i = 0; i < 14; i++) {
      var p       = document.createElement('span');
      var useSage = Math.random() > 0.65;
      var col     = useSage
        ? 'rgba(107,128,96,' + (0.07 + Math.random() * 0.1).toFixed(3) + ')'
        : 'rgba(212,169,154,' + (0.1  + Math.random() * 0.13).toFixed(3) + ')';
      var size    = (4  + Math.random() * 9).toFixed(1);
      var left    = (2  + Math.random() * 96).toFixed(1);
      var delay   = (Math.random() * 18).toFixed(2);
      var dur     = (18 + Math.random() * 16).toFixed(2);

      p.setAttribute('aria-hidden', 'true');
      p.style.cssText = [
        'position:absolute',
        'bottom:-16px',
        'border-radius:50%',
        'pointer-events:none',
        'will-change:transform,opacity',
        'animation:float-up linear infinite',
        'width:'             + size  + 'px',
        'height:'            + size  + 'px',
        'left:'              + left  + '%',
        'animation-delay:'   + delay + 's',
        'animation-duration:'+ dur   + 's',
        'background:'        + col,
      ].join(';');

      particleEl.appendChild(p);
    }
  }

})();