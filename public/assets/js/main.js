/* =============================================================
   INSIYT — main.js
   Shared JavaScript utilities loaded on every page.
   Loaded before </body> on every page's index.html.
   ============================================================= */

(function () {
  'use strict';


  /* ─────────────────────────────────────────
     1. SCROLL REVEAL
     Watches all .reveal, .reveal-left,
     .reveal-right, .reveal-scale, .reveal-stagger
     and adds .visible when they enter the viewport.
     Supports data-delay="300" (ms) for custom stagger.
     ───────────────────────────────────────── */
  const revealSelectors = [
    '.reveal',
    '.reveal-left',
    '.reveal-right',
    '.reveal-scale',
    '.reveal-stagger',
  ].join(', ');

  const revealElements = document.querySelectorAll(revealSelectors);

  if (revealElements.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el    = entry.target;
            const delay = parseInt(el.dataset.delay, 10) || 0;

            if (delay) {
              setTimeout(function () { el.classList.add('visible'); }, delay);
            } else {
              el.classList.add('visible');
            }

            revealObserver.unobserve(el);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    /* Fallback — just make everything visible */
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }


  /* ─────────────────────────────────────────
     2. SMOOTH SCROLL
     Intercepts all <a href="#..."> anchor clicks
     and scrolls smoothly, accounting for fixed nav.
     ───────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#' || targetId === '#!') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    /* Offset for fixed nav height */
    const navHeight = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height'),
      10
    ) || 72;

    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

    window.scrollTo({ top, behavior: 'smooth' });

    /* Update URL without triggering scroll */
    history.pushState(null, '', targetId);
  });


  /* ─────────────────────────────────────────
     3. MARQUEE — pause on hover
     Handled via CSS .marquee-track:hover but
     this adds touch support.
     ───────────────────────────────────────── */
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    track.addEventListener('touchstart', function () {
      track.style.animationPlayState = 'paused';
    }, { passive: true });
    track.addEventListener('touchend', function () {
      track.style.animationPlayState = 'running';
    }, { passive: true });
  });


  /* ─────────────────────────────────────────
     4. BODY SCROLL LOCK when mobile nav open
     Prevents background from scrolling behind
     the full-screen mobile menu.
     ───────────────────────────────────────── */
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === 'class') {
        if (document.body.classList.contains('nav-open')) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  });
  observer.observe(document.body, { attributes: true });


  /* ─────────────────────────────────────────
     5. LAZY IMAGES
     Native loading="lazy" is used in HTML,
     but this adds a fade-in once loaded.
     ───────────────────────────────────────── */
  document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.4s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', function () {
        img.style.opacity = '1';
      });
    }
  });


})();