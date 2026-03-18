/* =============================================================
   INSIYT — womens-wellness/script.js
   Page-specific JS:
     1. Jump link active-section highlighting
     2. Pillar cards — stagger on scroll entry
     3. Hero orbs — mouse-tracking parallax (subtle)
     4. Wave sections — slow vertical parallax
     5. Perinatal cards — count-up decorative numbers
   ============================================================= */

(function () {
  'use strict';


  /* ─────────────────────────────────────────
     1. JUMP LINK ACTIVE SECTION
     Highlights the matching hero jump link
     as the user scrolls through each section.
     ───────────────────────────────────────── */
  const sections   = document.querySelectorAll('main section[id]');
  const jumpLinks  = document.querySelectorAll('.ww-jump-link');

  if (sections.length && jumpLinks.length && 'IntersectionObserver' in window) {
    const secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          jumpLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            link.classList.toggle('ww-jump--active', href === '#' + id);
          });
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '-72px 0px -35% 0px',
    });
    sections.forEach(function (s) { secObs.observe(s); });
  }


  /* ─────────────────────────────────────────
     2. PILLAR CARDS STAGGER
     Each pillar card fades up with a small
     stagger as the grid enters the viewport.
     ───────────────────────────────────────── */
  const pillars = document.querySelectorAll('.ww-pillar');

  if (pillars.length && 'IntersectionObserver' in window) {
    const pillarObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          pillars.forEach(function (card, i) {
            setTimeout(function () {
              card.classList.add('ww-pillar--visible');
            }, i * 90);
          });
          pillarObs.disconnect();
        }
      });
    }, { threshold: 0.15 });

    const grid = document.querySelector('.ww-pillars');
    if (grid) pillarObs.observe(grid);
  }


  /* ─────────────────────────────────────────
     3. HERO ORB MOUSE PARALLAX
     The ambient orbs drift very slightly
     towards the cursor — organic, alive feel.
     Extremely subtle so it never distracts.
     ───────────────────────────────────────── */
  const orbContainer = document.querySelector('.ww-hero-orbs');
  const orbs         = orbContainer ? orbContainer.querySelectorAll('.ww-orb') : [];

  if (orbs.length) {
    let mouseX = 0, mouseY = 0;
    let curX   = 0, curY   = 0;
    let rafId;

    document.addEventListener('mousemove', function (e) {
      /* Normalise to -1 → +1 */
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const STRENGTHS = [18, 12, 8]; /* px each orb moves */

    function animateOrbs() {
      /* Smooth lerp */
      curX += (mouseX - curX) * 0.04;
      curY += (mouseY - curY) * 0.04;

      orbs.forEach(function (orb, i) {
        const s = STRENGTHS[i] || 10;
        orb.style.transform = 'translate(' +
          (curX * s) + 'px,' +
          (curY * s) + 'px)';
      });

      rafId = requestAnimationFrame(animateOrbs);
    }

    /* Only run while hero is visible */
    const heroEl = document.querySelector('.ww-hero');
    if (heroEl && 'IntersectionObserver' in window) {
      const heroObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            if (!rafId) rafId = requestAnimationFrame(animateOrbs);
          } else {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      }, { threshold: 0 });
      heroObs.observe(heroEl);
    }
  }


  /* ─────────────────────────────────────────
     4. PERINATAL CARDS STAGGER
     Same pattern as pillars — staggered
     visibility on scroll entry.
     ───────────────────────────────────────── */
  const periCards = document.querySelectorAll('.ww-peri-card');

  if (periCards.length && 'IntersectionObserver' in window) {
    const periObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          periCards.forEach(function (card, i) {
            setTimeout(function () {
              card.classList.add('ww-peri--visible');
            }, i * 100);
          });
          periObs.disconnect();
        }
      });
    }, { threshold: 0.1 });

    const periGrid = document.querySelector('.ww-perinatal-grid');
    if (periGrid) periObs.observe(periGrid);
  }


  /* ─────────────────────────────────────────
     5. GENTLE HERO SCROLL PARALLAX
     Hero content drifts slightly as user
     begins to scroll — reinforces depth.
     ───────────────────────────────────────── */
  const heroInner = document.querySelector('.ww-hero-inner');
  const hero      = document.querySelector('.ww-hero');

  if (heroInner && hero) {
    let ticking = false;

    function applyParallax() {
      if (window.scrollY < hero.offsetHeight) {
        heroInner.style.transform = 'translateY(' + (window.scrollY * 0.15) + 'px)';
        heroInner.style.opacity   = 1 - (window.scrollY / hero.offsetHeight) * 0.4;
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
  }


  /* ─────────────────────────────────────────
     REDUCED MOTION
     ───────────────────────────────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pillars.forEach(function (c) { c.classList.add('ww-pillar--visible'); });
    periCards.forEach(function (c) { c.classList.add('ww-peri--visible'); });
    if (heroInner) {
      heroInner.style.transform = 'none';
      heroInner.style.opacity   = '1';
    }
  }


})();