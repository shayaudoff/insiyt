/* =============================================================
   INSIYT — nav.js
   Handles all navigation behaviour on every page.
   Loaded before </body> on every page's index.html.
   ============================================================= */

(function () {
  'use strict';

  /* ── Element refs ── */
  const siteNav    = document.querySelector('.site-nav');
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks   = document.querySelectorAll('.nav-links > li');

  if (!siteNav) return; // safety guard


  /* ─────────────────────────────────────────
     1. SCROLL — add .scrolled to nav
     ───────────────────────────────────────── */
  function onScroll() {
    siteNav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load in case page starts scrolled


  /* ─────────────────────────────────────────
     2. HAMBURGER — toggle mobile menu
     ───────────────────────────────────────── */
  if (hamburger) {
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      document.body.classList.toggle('nav-open');
      const isOpen = document.body.classList.contains('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }

  /* Close mobile menu when clicking outside */
  document.addEventListener('click', function (e) {
    if (
      document.body.classList.contains('nav-open') &&
      !e.target.closest('.mobile-menu') &&
      !e.target.closest('.nav-hamburger')
    ) {
      document.body.classList.remove('nav-open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* Close mobile menu on ESC key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    }
  });


  /* ─────────────────────────────────────────
     3. MOBILE ACCORDION sub-menus
     ───────────────────────────────────────── */
  const mobileToggles = document.querySelectorAll('.mobile-toggle');

  mobileToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      const parentItem = toggle.closest('.mobile-menu-item');
      const sub        = parentItem.querySelector('.mobile-sub');
      const icon       = parentItem.querySelector('.mobile-toggle-icon');
      const isOpen     = parentItem.classList.contains('open');

      /* Close all others */
      document.querySelectorAll('.mobile-menu-item.open').forEach(function (item) {
        item.classList.remove('open');
        const s = item.querySelector('.mobile-sub');
        const i = item.querySelector('.mobile-toggle-icon');
        if (s) s.classList.remove('open');
        if (i) i.textContent = '+';
      });

      /* Toggle clicked item */
      if (!isOpen) {
        parentItem.classList.add('open');
        if (sub)  sub.classList.add('open');
        if (icon) icon.textContent = '−';
      }
    });
  });


  /* ─────────────────────────────────────────
     4. DESKTOP DROPDOWNS — keyboard support
     (hover is handled by CSS; this adds focus)
     ───────────────────────────────────────── */
  navLinks.forEach(function (li) {
    const dropdown = li.querySelector('.nav-dropdown');
    if (!dropdown) return;

    /* Open on focus-within so keyboard users can tab into dropdown */
    li.addEventListener('focusin', function () {
      li.classList.add('open');
    });
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) {
        li.classList.remove('open');
      }
    });
  });


  /* ─────────────────────────────────────────
     5. ACTIVE LINK — highlight current page
     ───────────────────────────────────────── */
  function normalizePath(path) {
    return path
      .toLowerCase()
      .replace(/index\.html$/, '')
      .replace(/\/$/, '');
  }

  const currentPath = normalizePath(window.location.pathname);

  /* Desktop nav */
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPath = normalizePath(new URL(href, window.location.href).pathname);

    if (linkPath && (currentPath === linkPath || currentPath.endsWith(linkPath))) {
      link.classList.add('active');
      /* Also mark parent <li> so chevron etc can style */
      const parentLi = link.closest('.nav-links > li');
      if (parentLi) parentLi.classList.add('active');
    }
  });

  /* Mobile nav */
  document.querySelectorAll('.mobile-menu a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPath = normalizePath(new URL(href, window.location.href).pathname);

    if (linkPath && (currentPath === linkPath || currentPath.endsWith(linkPath))) {
      link.classList.add('active');
    }
  });

})();
