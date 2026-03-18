/* =============================================================
   INSIYT — brain-based-therapy/script.js
   Page-specific JS:
     1. Neural network canvas animation in the hero
     2. Sidebar / pill active-section tracking
     3. Gentle parallax on the hero
     4. Section progress indicator (thin line at top)
     5. Step cards — staggered count-up on the step numbers
   ============================================================= */

(function () {
  'use strict';


  /* ─────────────────────────────────────────
     1. NEURAL CANVAS ANIMATION
     Draws softly pulsing nodes connected by
     faint lines — evokes a brain network.
     Uses canvas for performance.
     ───────────────────────────────────────── */
  const canvasEl = document.getElementById('neuralCanvas');

  if (canvasEl) {
    const canvas = canvasEl;
    const ctx    = canvas.getContext('2d');
    let W, H, nodes, animFrame;

    function resize() {
      W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
      H = canvas.height = canvas.offsetHeight || window.innerHeight;
      initNodes();
    }

    function initNodes() {
      const COUNT = Math.min(40, Math.floor((W * H) / 28000));
      nodes = [];
      for (let i = 0; i < COUNT; i++) {
        nodes.push({
          x:   Math.random() * W,
          y:   Math.random() * H,
          vx:  (Math.random() - 0.5) * 0.28,
          vy:  (Math.random() - 0.5) * 0.28,
          r:   2 + Math.random() * 3,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw(ts) {
      ctx.clearRect(0, 0, W, H);

      const t = ts * 0.001;
      const CONNECT_DIST = Math.min(W, H) * 0.22;

      /* Draw edges */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[j].x - nodes[i].x;
          const dy   = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(168,184,160,${alpha})`;
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
      }

      /* Draw nodes */
      nodes.forEach(function (n) {
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.9 + n.phase);
        const alpha = 0.25 + 0.35 * pulse;
        const radius = n.r * (0.85 + 0.25 * pulse);

        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,184,160,${alpha})`;
        ctx.fill();

        /* Tiny glow ring on some nodes */
        if (n.r > 3.5) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius * 2.2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(201,169,110,${alpha * 0.3})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        /* Move */
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;
      });

      animFrame = requestAnimationFrame(draw);
    }

    /* Pause when hero is scrolled out of view for performance */
    const heroEl = document.querySelector('.bb-hero');
    if (heroEl && 'IntersectionObserver' in window) {
      const heroObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            if (!animFrame) animFrame = requestAnimationFrame(draw);
          } else {
            cancelAnimationFrame(animFrame);
            animFrame = null;
          }
        });
      }, { threshold: 0 });
      heroObs.observe(heroEl);
    } else {
      animFrame = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', function () {
      cancelAnimationFrame(animFrame);
      animFrame = null;
      resize();
      animFrame = requestAnimationFrame(draw);
    });
  }


  /* ─────────────────────────────────────────
     2. PILL / ACTIVE SECTION TRACKING
     Highlights the matching hero pill as the
     user scrolls through each modality section.
     ───────────────────────────────────────── */
  const sections  = document.querySelectorAll('main section[id]');
  const pills     = document.querySelectorAll('.bb-pill');

  if (sections.length && pills.length && 'IntersectionObserver' in window) {
    const secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          pills.forEach(function (pill) {
            const href = pill.getAttribute('href');
            pill.classList.toggle('bb-pill--active', href === '#' + id);
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-72px 0px -35% 0px',
    });
    sections.forEach(function (s) { secObs.observe(s); });
  }


  /* ─────────────────────────────────────────
     3. HERO PARALLAX
     ───────────────────────────────────────── */
  const hero = document.querySelector('.bb-hero');

  if (hero) {
    let ticking = false;

    function applyParallax() {
      if (window.scrollY < hero.offsetHeight) {
        hero.style.setProperty('--bb-parallax', (window.scrollY * 0.22) + 'px');
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
     4. PAGE PROGRESS BAR
     A 2px sage line at the top of the viewport
     that fills as the user scrolls down.
     ───────────────────────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.className = 'bb-progress-bar';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', function () {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });


  /* ─────────────────────────────────────────
     5. BENEFIT CARD STAGGER ON SCROLL
     Re-runs the stagger animation each time
     the benefits grid enters the viewport
     (already covered by main.js reveal, but
     this adds a card-by-card border pulse).
     ───────────────────────────────────────── */
  const benefitCards = document.querySelectorAll('.bb-benefit-card');

  if (benefitCards.length && 'IntersectionObserver' in window) {
    const cardObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          benefitCards.forEach(function (card, i) {
            setTimeout(function () {
              card.classList.add('bb-card--appeared');
            }, i * 80);
          });
          cardObs.disconnect();
        }
      });
    }, { threshold: 0.15 });

    if (benefitCards[0]) cardObs.observe(benefitCards[0].closest('.bb-benefits') || benefitCards[0]);
  }


  /* ─────────────────────────────────────────
     REDUCED MOTION — kill canvas animation
     ───────────────────────────────────────── */
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches && canvasEl) {
    canvasEl.style.display = 'none';
  }


})();