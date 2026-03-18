/* =============================================================
   INSIYT — meet-shaindel/script.js
   Page-specific JS:
     1. Timeline items animate in on scroll with dot pulse
     2. Parallax drift on the portrait column
     3. Practice list items stagger in
     4. Stat numbers count up on first view
     5. Floating ambient particles on the philosophy section
   ============================================================= */

(function () {
  'use strict';


  /* ─────────────────────────────────────────
     1. TIMELINE SCROLL ANIMATION
     Each timeline item slides in from the left
     as it enters the viewport. The dot pulses
     once to draw attention.
     ───────────────────────────────────────── */
  const timelineItems = document.querySelectorAll('.ms-timeline-item');

  if (timelineItems.length && 'IntersectionObserver' in window) {
    const tlObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ms-tl--visible');
          tlObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    timelineItems.forEach(function (item, i) {
      item.style.transitionDelay = (i * 0.08) + 's';
      tlObs.observe(item);
    });
  }


  /* ─────────────────────────────────────────
     2. PORTRAIT PARALLAX
     The portrait column drifts upward slowly
     as the user scrolls — creates a sense of
     depth against the static text column.
     ───────────────────────────────────────── */
  const portrait = document.querySelector('.ms-hero-portrait');

  if (portrait) {
    let ticking = false;

    function shiftPortrait() {
      const scrolled = window.scrollY;
      const heroH    = document.querySelector('.ms-hero').offsetHeight;
      if (scrolled < heroH) {
        portrait.style.setProperty('--ms-parallax', (scrolled * 0.18) + 'px');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(shiftPortrait);
        ticking = true;
      }
    }, { passive: true });
  }


  /* ─────────────────────────────────────────
     3. PRACTICE LIST STAGGER
     Each practice row fades in with a
     staggered delay when the list enters view.
     ───────────────────────────────────────── */
  const practiceItems = document.querySelectorAll('.ms-practices-list li');

  if (practiceItems.length && 'IntersectionObserver' in window) {
    const pracObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          practiceItems.forEach(function (item, i) {
            setTimeout(function () {
              item.classList.add('ms-practice--visible');
            }, i * 70);
          });
          pracObs.disconnect();
        }
      });
    }, { threshold: 0.2 });

    if (practiceItems[0]) {
      pracObs.observe(practiceItems[0].closest('.ms-vision-practices') || practiceItems[0]);
    }
  }


  /* ─────────────────────────────────────────
     4. STAT COUNT-UP
     The three stat numbers count up from 0
     the first time the stats strip enters view.
     ───────────────────────────────────────── */
  const statsEl = document.querySelector('.ms-stats');

  if (statsEl && 'IntersectionObserver' in window) {
    const statNums = statsEl.querySelectorAll('.ms-stat-num');

    /* Parse the display value — skip ∞ */
    function parseTarget(el) {
      const raw = el.textContent.trim();
      if (raw === '∞') return null;
      return parseInt(raw.replace(/\D/g, ''), 10);
    }

    function countUp(el, target, suffix, duration) {
      const start = performance.now();
      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        /* Ease out cubic */
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    const statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          statNums.forEach(function (el) {
            const target = parseTarget(el);
            if (target === null) return; /* leave ∞ alone */
            const suffix = el.textContent.includes('+') ? '+' : '';
            el.textContent = '0' + suffix;
            countUp(el, target, suffix, 1200);
          });
          statObs.disconnect();
        }
      });
    }, { threshold: 0.5 });

    statObs.observe(statsEl);
  }


  /* ─────────────────────────────────────────
     5. PHILOSOPHY SECTION — ambient particles
     Tiny warm specks drift upward through the
     dark philosophy quote section.
     ───────────────────────────────────────── */
  const philSection = document.querySelector('.ms-philosophy');

  if (philSection) {
    const COUNT = 7;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('span');
      p.className = 'ms-phil-particle';
      p.setAttribute('aria-hidden', 'true');

      const size     = 3 + Math.random() * 6;
      const left     = 5 + Math.random() * 90;
      const delay    = Math.random() * 12;
      const duration = 16 + Math.random() * 12;
      const opacity  = 0.08 + Math.random() * 0.14;

      p.style.cssText = [
        'width:'              + size     + 'px',
        'height:'             + size     + 'px',
        'left:'               + left     + '%',
        'animation-delay:'    + delay    + 's',
        'animation-duration:' + duration + 's',
        '--mp-opacity:'       + opacity,
      ].join(';');

      philSection.appendChild(p);
    }
  }


  /* ─────────────────────────────────────────
     REDUCED MOTION — disable all the above
     ───────────────────────────────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    timelineItems.forEach(function (el) { el.classList.add('ms-tl--visible'); });
    practiceItems.forEach(function (el) { el.classList.add('ms-practice--visible'); });
  }


})();