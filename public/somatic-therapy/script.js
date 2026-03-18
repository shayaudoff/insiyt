/* =============================================================
   INSIYT — somatic-therapy/script.js
   1. Jump pill active-section tracking
   2. Floating sage particles in the hero (kept — user likes them)
   3. Gentle hero glow parallax (glow only, not content)
   4. Movement cards stagger in on scroll
   5. Drum cards stagger in on scroll
   6. Progress bar
   ============================================================= */

(function () {
  'use strict';


  /* ─────────────────────────────────────────
     1. JUMP PILL ACTIVE SECTION TRACKING
     ───────────────────────────────────────── */
  const sections  = document.querySelectorAll('main section[id]');
  const jumpLinks = document.querySelectorAll('.st-jump');

  if (sections.length && jumpLinks.length && 'IntersectionObserver' in window) {
    const secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          jumpLinks.forEach(function (link) {
            link.classList.toggle('st-jump--active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.25, rootMargin: '-72px 0px -35% 0px' });

    sections.forEach(function (s) { secObs.observe(s); });
  }


  /* ─────────────────────────────────────────
     2. FLOATING PARTICLES
     Sage green dots drift upward through the
     hero and dissolve. JS injects inline styles
     so each has its own random size/speed/delay.
     ───────────────────────────────────────── */
  const hero = document.querySelector('.st-hero');

  if (hero) {
    for (var i = 0; i < 11; i++) {
      var p = document.createElement('span');
      p.setAttribute('aria-hidden', 'true');

      var size     = (4 + Math.random() * 8).toFixed(1);
      var left     = (4 + Math.random() * 92).toFixed(1);
      var delay    = (Math.random() * 16).toFixed(2);
      var duration = (16 + Math.random() * 16).toFixed(2);
      var opacity  = (0.1 + Math.random() * 0.15).toFixed(3);

      p.style.cssText = [
        'position:absolute',
        'bottom:-16px',
        'border-radius:50%',
        'pointer-events:none',
        'z-index:0',
        'will-change:transform,opacity',
        'animation:st-float linear infinite',
        'width:'              + size     + 'px',
        'height:'             + size     + 'px',
        'left:'               + left     + '%',
        'animation-delay:'    + delay    + 's',
        'animation-duration:' + duration + 's',
        'background:rgba(122,140,114,' + opacity + ')',
      ].join(';');

      hero.appendChild(p);
    }
  }


  /* ─────────────────────────────────────────
     3. GLOW PARALLAX
     Only the background glow moves on scroll —
     not the content — so nothing jumps or clips.
     ───────────────────────────────────────── */
  var glow = document.querySelector('.st-hero-glow');

  if (glow && hero) {
    var ticking = false;

    function shiftGlow() {
      var scrollY = window.scrollY;
      var heroH   = hero.offsetHeight;
      if (scrollY < heroH) {
        glow.style.marginTop = (scrollY * 0.25) + 'px';
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(shiftGlow);
        ticking = true;
      }
    }, { passive: true });
  }


  /* ─────────────────────────────────────────
     4. MOVEMENT CARDS STAGGER
     ───────────────────────────────────────── */
  var movementCards = document.querySelectorAll('.st-movement-card');

  if (movementCards.length && 'IntersectionObserver' in window) {
    var movGrid = document.querySelector('.st-movement-grid');

    if (movGrid) {
      var movObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          movementCards.forEach(function (card, i) {
            setTimeout(function () {
              card.classList.add('st-card--visible');
            }, i * 100);
          });
          movObs.disconnect();
        }
      }, { threshold: 0.1 });

      movObs.observe(movGrid);
    }
  }


  /* ─────────────────────────────────────────
     5. DRUM CARDS STAGGER
     ───────────────────────────────────────── */
  var drumCards = document.querySelectorAll('.st-drum-card');

  if (drumCards.length && 'IntersectionObserver' in window) {
    var drumGrid = document.querySelector('.st-drum-grid');

    if (drumGrid) {
      var drumObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          drumCards.forEach(function (card, i) {
            setTimeout(function () {
              card.classList.add('st-card--visible');
            }, i * 85);
          });
          drumObs.disconnect();
        }
      }, { threshold: 0.08 });

      drumObs.observe(drumGrid);
    }
  }


  /* ─────────────────────────────────────────
     6. PROGRESS BAR
     ───────────────────────────────────────── */
  var bar = document.createElement('div');
  bar.className = 'st-progress-bar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  window.addEventListener('scroll', function () {
    var scrolled = window.scrollY;
    var total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, { passive: true });


  /* ─────────────────────────────────────────
     REDUCED MOTION — skip all animations
     ───────────────────────────────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    movementCards.forEach(function (c) { c.classList.add('st-card--visible'); });
    drumCards.forEach(function (c)     { c.classList.add('st-card--visible'); });
  }


})();