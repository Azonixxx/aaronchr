(() => {
  'use strict';

  /* ═══════════════════════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════════════════════ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = () =>
    window.matchMedia('(pointer:fine)').matches && window.matchMedia('(min-width:900px)').matches;

  /* ═══════════════════════════════════════════════════════
     1. LOADER — AARON CHR GLOW
     ═══════════════════════════════════════════════════════ */
  const QUIRKY_MESSAGES = [
    "Untangling the cables…",
    "Microwaving cold coffee…",
    "Finding the TV remote…",
    "Spinning the hamster wheel…",
    "Watering the virtual plants…",
    "Looking for my keys…",
    "Trying to remember my password…",
    "Convincing the computer to work…",
    "Brewing a fresh pot…",
    "Downloading more RAM…",
    "Reticulating splines…",
    "Feeding the server hamsters…",
    "Searching for motivation…",
    "Generating witty loading messages…",
    "Aligning the pixels…",
    "Dusting off the mainframe…",
    "Polishing the screen…",
    "Warming up the engines…",
    "Recalibrating the flux capacitor…"
  ];
  
  // Pick 4 random quirky messages
  const STATUS_MESSAGES = [...QUIRKY_MESSAGES].sort(() => 0.5 - Math.random()).slice(0, 4);
  // Always end with a reassuring final message
  STATUS_MESSAGES.push("Almost ready…");

  function runLoader() {
    const loader       = $('#loader');
    const loaderBrand  = $('#loaderBrand');
    const progressFill = $('#loaderProgress');
    const statusEl     = $('#loaderStatus');
    const indicator    = $('#loaderIndicator');

    if (!loader || prefersReducedMotion()) {
      if (loader) loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      initSite();
      return;
    }

    // Phase 1: After brand fade-in CSS animation completes (~2s), add glow
    setTimeout(() => {
      loaderBrand.classList.add('is-glowing');
    }, 2000);

    // Phase 2: Cycle through status messages with progress bar
    let msgIndex = 0;
    const totalMessages = STATUS_MESSAGES.length;

    function advanceStatus() {
      if (msgIndex >= totalMessages) {
        // All messages done — begin exit
        beginExit();
        return;
      }

      statusEl.textContent = STATUS_MESSAGES[msgIndex];
      const pct = Math.round(((msgIndex + 1) / totalMessages) * 100);
      progressFill.style.width = pct + '%';
      msgIndex++;

      const delay = 450 + Math.random() * 350;
      setTimeout(advanceStatus, delay);
    }

    // Start status messages after indicator fades in (0.9s CSS delay + 0.6s animation)
    setTimeout(advanceStatus, 1600);

    function beginExit() {
      // Brief pause at 100% before flying
      setTimeout(() => {
        // Measure target: the nav brand element
        const navBrand = $('.nav__brand');
        if (!navBrand) {
          // Fallback: just fade out
          loader.classList.add('is-done');
          document.body.classList.remove('is-loading');
          initSite();
          return;
        }

        // Temporarily make site content visible so we can measure nav position
        document.body.classList.remove('is-loading');

        // Force reflow to get accurate measurements
        void navBrand.offsetHeight;

        const navRect   = navBrand.getBoundingClientRect();
        const brandRect = loaderBrand.getBoundingClientRect();

        // Calculate how far to move and how much to scale
        const scaleRatio = navRect.height / brandRect.height;
        const dx = (navRect.left + navRect.width / 2) - (brandRect.left + brandRect.width / 2);
        const dy = (navRect.top + navRect.height / 2) - (brandRect.top + brandRect.height / 2);

        // Set CSS custom properties for the fly animation
        loaderBrand.style.setProperty('--fly-x', dx + 'px');
        loaderBrand.style.setProperty('--fly-y', dy + 'px');
        loaderBrand.style.setProperty('--fly-scale', scaleRatio);

        // Trigger exit
        loader.classList.add('is-exiting');

        // After fly animation completes, clean up
        setTimeout(() => {
          loader.classList.add('is-hidden');
          loader.remove();
          initSite();
        }, 950);

      }, 500);
    }

    // Fallback: force-remove loader after 8s
    setTimeout(() => {
      if (!loader.classList.contains('is-exiting') && !loader.classList.contains('is-done')) {
        loader.classList.add('is-done');
        document.body.classList.remove('is-loading');
        initSite();
      }
    }, 8000);
  }


  /* ═══════════════════════════════════════════════════════
     2. TECH BACKGROUND CANVAS
     ═══════════════════════════════════════════════════════ */
  function initCanvas() {
    const canvas = $('#techBg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, nodes = [], animId;
    let mouseX = -1000, mouseY = -1000;
    const NODE_COUNT = 60;
    const CONNECT_DIST = 140;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function createNodes() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.8 + 0.6,
        });
      }
    }

    function getColor() {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      return isDark
        ? { node: 'rgba(34,211,238,0.4)', line: 'rgba(34,211,238,0.1)' }
        : { node: 'rgba(11,127,196,0.3)', line: 'rgba(11,127,196,0.08)' };
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const colors = getColor();

      // Update positions
      for (const n of nodes) {
        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          n.x -= (dx / dist) * 1.5;
          n.y -= (dy / dist) * 1.5;
        }

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // Draw connections
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            ctx.globalAlpha = 1 - dist / CONNECT_DIST;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Draw nodes
      ctx.fillStyle = colors.node;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    createNodes();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createNodes();
    });
  }


  /* ═══════════════════════════════════════════════════════
     3. THEME TOGGLE
     ═══════════════════════════════════════════════════════ */
  function initThemeToggle() {
    const toggle = $('#themeToggle');
    const html = document.documentElement;
    const metaColor = $('#themeColorMeta');

    // Restore saved theme
    const saved = localStorage.getItem('theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
      updateMeta(saved);
    }

    if (!toggle) return;

    toggle.addEventListener('click', (e) => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';

      // View Transition API support
      if (document.startViewTransition && !prefersReducedMotion()) {
        const rect = toggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const r = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        html.style.setProperty('--theme-x', x + 'px');
        html.style.setProperty('--theme-y', y + 'px');
        html.style.setProperty('--theme-r', r + 'px');

        document.startViewTransition(() => {
          html.setAttribute('data-theme', next);
        });
      } else {
        html.setAttribute('data-theme', next);
      }

      localStorage.setItem('theme', next);
      updateMeta(next);
      toggle.setAttribute('aria-pressed', next === 'light');
      toggle.setAttribute('aria-label', `Switch to ${next === 'dark' ? 'light' : 'dark'} mode`);
    });

    function updateMeta(theme) {
      if (metaColor) {
        metaColor.setAttribute('content', theme === 'dark' ? '#05080D' : '#F5FAFD');
      }
    }
  }


  /* ═══════════════════════════════════════════════════════
     4. SCROLL PROGRESS BAR
     ═══════════════════════════════════════════════════════ */
  function initScrollProgress() {
    const bar = $('#scrollProgress');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }


  /* ═══════════════════════════════════════════════════════
     5. REVEAL ON SCROLL (Intersection Observer)
     ═══════════════════════════════════════════════════════ */
  function initReveals() {
    const els = $$('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => observer.observe(el));
  }


  /* ═══════════════════════════════════════════════════════
     6. NAV ACTIVE STATE (top nav + chapter rail)
     ═══════════════════════════════════════════════════════ */
  function initNavActive() {
    const links = $$('.nav__links a');
    const railLinks = $$('.chapter-rail__list a');
    const allSectionIds = ['top', 'about', 'experience', 'skills', 'education', 'honors', 'certificates', 'contact'];
    const sections = allSectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    function update() {
      const scrollY = window.scrollY + 120;
      let activeIdx = -1;

      sections.forEach((sec, i) => {
        if (scrollY >= sec.offsetTop) {
          activeIdx = i;
        }
      });

      const activeId = activeIdx >= 0 ? sections[activeIdx].id : 'top';

      links.forEach((a) => {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + activeId);
      });
      railLinks.forEach((a) => {
        a.classList.toggle('is-active', a.dataset.target === activeId);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }


  /* ═══════════════════════════════════════════════════════
     7. MOBILE NAV TOGGLE
     ═══════════════════════════════════════════════════════ */
  function initMobileNav() {
    const toggle = $('#navToggle');
    const links = $('#navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });

    // Close on link click
    $$('a', links).forEach((a) => {
      a.addEventListener('click', () => {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ═══════════════════════════════════════════════════════
     8. LIGHTBOX
     ═══════════════════════════════════════════════════════ */
  function initLightbox() {
    const lightbox = $('#lightbox');
    const lbImg = $('#lightboxImg');
    const lbClose = $('#lightboxClose');
    if (!lightbox || !lbImg) return;

    // Clickable images
    const zoomables = $$('.hero__avatar-img, .cert-card__frame img');
    zoomables.forEach((img) => {
      img.addEventListener('click', () => {
        if (!img.src || img.style.display === 'none') return;
        lbImg.src = img.src;
        lbImg.alt = img.alt || '';
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLB() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (lbClose) lbClose.addEventListener('click', closeLB);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLB();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLB();
    });
  }


  /* ═══════════════════════════════════════════════════════
     9. BACK TO TOP
     ═══════════════════════════════════════════════════════ */
  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;

    function update() {
      btn.classList.toggle('is-visible', window.scrollY > 500);
    }

    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
  }


  /* ═══════════════════════════════════════════════════════
     10. CONTACT FORM
     ═══════════════════════════════════════════════════════ */
  function initContactForm() {
    const form = $('#contactForm');
    const statusText = $('#contactStatusText');
    const check = $('#contactCheck');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (statusText) {
        statusText.textContent = "Thanks for your message! I'll get back to you soon.";
      }
      if (check) {
        // restart animation
        check.classList.remove('is-visible');
        void check.offsetWidth;
        check.classList.add('is-visible');
      }
      form.reset();
      setTimeout(() => {
        if (statusText) statusText.textContent = '';
        if (check) check.classList.remove('is-visible');
      }, 5000);
    });
  }


  /* ═══════════════════════════════════════════════════════
     11. FOOTER YEAR
     ═══════════════════════════════════════════════════════ */
  function initYear() {
    const el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
  }



  /* ═══════════════════════════════════════════════════════
     15. TIMELINE — DRAW-IN LINE & ACTIVE ICON GLOW
     ═══════════════════════════════════════════════════════ */
  function initTimelineDrawIn() {
    const timeline = $('#timeline');
    const fill = $('#timelineFill');
    const cards = $$('.timeline__card', timeline || document);
    if (!timeline || !fill || !cards.length) return;

    function update() {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const total = rect.height + vh * 0.3;
      const progressPx = start - rect.top;
      const progress = Math.max(0, Math.min(1, progressPx / total));
      fill.style.height = (progress * 100) + '%';

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const isActive = cardRect.top < vh * 0.7 && cardRect.bottom > vh * 0.2;
        card.classList.toggle('is-active', isActive);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }


  /* ═══════════════════════════════════════════════════════
     16. CURSOR-REACTIVE GLOW (desktop only)
     ═══════════════════════════════════════════════════════ */
  function initCursorGlow() {
    const glow = $('#cursorGlow');
    if (!glow || prefersReducedMotion() || !isFinePointer()) return;

    let rafId = null;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.classList.add('is-active');
      if (!rafId) {
        rafId = requestAnimationFrame(apply);
      }
    }, { passive: true });

    function apply() {
      glow.style.setProperty('--gx', targetX + 'px');
      glow.style.setProperty('--gy', targetY + 'px');
      rafId = null;
    }
  }


  /* ═══════════════════════════════════════════════════════
     17. MAGNETIC BUTTONS (desktop only)
     ═══════════════════════════════════════════════════════ */
  function initMagneticButtons() {
    if (prefersReducedMotion() || !isFinePointer()) return;

    const els = $$('.magnetic');
    els.forEach((el) => {
      let rafId = null;
      let tx = 0, ty = 0;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        tx = relX * 0.28;
        ty = relY * 0.35;
        if (!rafId) rafId = requestAnimationFrame(apply);
      });

      el.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        if (!rafId) rafId = requestAnimationFrame(apply);
      });

      function apply() {
        el.style.transform = `translate(${tx}px, ${ty}px)`;
        rafId = null;
      }
    });
  }


  /* ═══════════════════════════════════════════════════════
     18. TILT CARDS (desktop only)
     ═══════════════════════════════════════════════════════ */
  function initTiltCards() {
    if (prefersReducedMotion() || !isFinePointer()) return;

    const els = $$('.tilt-el');
    els.forEach((el) => {
      let rafId = null;
      let rx = 0, ry = 0;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        ry = (px - 0.5) * 8;
        rx = (0.5 - py) * 8;
        if (!rafId) rafId = requestAnimationFrame(apply);
      });

      el.addEventListener('mouseleave', () => {
        rx = 0; ry = 0;
        if (!rafId) rafId = requestAnimationFrame(apply);
      });

      function apply() {
        el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${rx !== 0 || ry !== 0 ? -3 : 0}px)`;
        rafId = null;
      }
    });
  }




  /* ═══════════════════════════════════════════════════════
     19. ABOUT CARD MOUSE GLOW
     ═══════════════════════════════════════════════════════ */
  function initAboutGlow() {
    if (!isFinePointer()) return;
    const cards = $$('.about__card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }


  /* ═══════════════════════════════════════════════════════
     INIT — Called after loader completes
     ═══════════════════════════════════════════════════════ */
  let siteInitialized = false;

  function initSite() {
    if (siteInitialized) return;
    siteInitialized = true;

    initCanvas();
    initAboutGlow();
    initThemeToggle();
    initScrollProgress();
    initReveals();
    initNavActive();
    initMobileNav();
    initLightbox();
    initBackToTop();
    initContactForm();
    initYear();
    initParallax();
    initTimelineDrawIn();
    initCursorGlow();
    initMagneticButtons();
    initTiltCards();
  }


  /* ═══════════════════════════════════════════════════════
     BOOT
     ═══════════════════════════════════════════════════════ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLoader);
  } else {
    runLoader();
  }

})();