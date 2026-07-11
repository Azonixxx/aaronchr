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
     1. LOADER — IT BOOT SEQUENCE
     ═══════════════════════════════════════════════════════ */
  const bootLines = [
    { tag: 'BOOT', text: 'Initializing system kernel...', delay: 400 },
    { tag: 'LOAD', text: 'Loading hardware drivers...', delay: 650 },
    { tag: 'SCAN', text: 'Detecting peripherals...', delay: 900 },
    { tag: 'INIT', text: 'Starting network services...', delay: 1150 },
    { tag: 'LOAD', text: 'Loading portfolio modules...', delay: 1400 },
    { tag: 'BUILD', text: 'Compiling assets...', delay: 1700 },
    { tag: 'READY', text: 'All systems operational.', delay: 2000 },
  ];

  function runLoader() {
    const loader = $('#loader');
    const loaderBody = $('#loaderBody');
    const progressFill = $('#loaderProgress');
    const percentEl = $('#loaderPercent');
    const welcomeEl = $('#loaderWelcome');

    if (!loader || prefersReducedMotion()) {
      // Skip loader entirely
      if (loader) loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      initSite();
      return;
    }

    const totalLines = bootLines.length;

    // Add cursor to body
    const cursor = document.createElement('span');
    cursor.className = 'loader__cursor';
    loaderBody.appendChild(cursor);

    bootLines.forEach((line, i) => {
      setTimeout(() => {
        // Create the line element
        const el = document.createElement('p');
        el.className = 'loader__line';
        el.innerHTML = `
          <span>
            <span class="loader__line-tag">[${line.tag}]</span>
            <span class="loader__line-text">${line.text}</span>
          </span>
          <span class="loader__line-status">✓</span>
        `;

        // Insert before cursor
        loaderBody.insertBefore(el, cursor);

        // Status check appears 200ms later
        const status = el.querySelector('.loader__line-status');
        setTimeout(() => {
          status.style.animationDelay = '0ms';
          status.style.animationPlayState = 'running';
        }, 180);

        // Update progress
        const progress = Math.round(((i + 1) / totalLines) * 100);
        progressFill.style.width = progress + '%';
        percentEl.textContent = progress + '%';

        // Scroll terminal body down
        loaderBody.scrollTop = loaderBody.scrollHeight;
      }, line.delay);
    });

    // Show welcome message
    setTimeout(() => {
      cursor.remove();
      welcomeEl.classList.add('is-visible');
    }, 2400);

    // Fade out loader & unlock page
    setTimeout(() => {
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      initSite();
    }, 3200);

    // Fallback: force-remove loader after 5s
    setTimeout(() => {
      if (!loader.classList.contains('is-done')) {
        loader.classList.add('is-done');
        document.body.classList.remove('is-loading');
        initSite();
      }
    }, 5000);
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
     12. HORIZONTAL SCROLL — SKILLS SECTION
     ═══════════════════════════════════════════════════════ */
  function initHorizontalScroll() {
    const section = $('.hscroll-section:not(.hscroll-section--certs)');
    const track = $('#skillsTrack');
    const fill = $('#hscrollFill');
    const hint = $('.hscroll-hint');

    if (!section || !track) return;

    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches) return;

    function update() {
      if (mq.matches) {
        track.style.transform = '';
        if (fill) fill.style.width = '0%';
        return;
      }

      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const scrollable = sectionHeight - vh;

      if (scrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));

      const trackWidth = track.scrollWidth;
      const containerWidth = track.parentElement.offsetWidth;
      const maxScroll = Math.max(0, trackWidth - containerWidth);

      const easedProgress = easeInOutCubic(progress);
      track.style.transform = `translateX(${-easedProgress * maxScroll}px)`;

      if (fill) fill.style.width = (progress * 100) + '%';

      if (hint) {
        hint.style.opacity = progress > 0.05 ? '0' : '';
      }
    }

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    mq.addEventListener('change', () => {
      if (mq.matches) {
        track.style.transform = '';
        if (fill) fill.style.width = '0%';
      } else {
        update();
      }
    });

    requestAnimationFrame(update);
  }


  /* ═══════════════════════════════════════════════════════
     13. PARALLAX — HERO ELEMENTS
     ═══════════════════════════════════════════════════════ */
  function initParallax() {
    if (prefersReducedMotion()) return;
    if (window.innerWidth <= 768) return; // Disable parallax on mobile

    const els = $$('.parallax-el');
    if (!els.length) return;

    function update() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      if (scrollY > vh * 1.2) return;

      els.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.2;
        const offset = scrollY * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    }

    window.addEventListener('scroll', update, { passive: true });
  }


  /* ═══════════════════════════════════════════════════════
     14. CERTIFICATES — SCROLLYTELLING TRACK (desktop)
          + swipeable row / drag-to-scroll fallback (mobile)
     ═══════════════════════════════════════════════════════ */
  function initCertScrollytelling() {
    const section = $('.hscroll-section--certs');
    const viewport = $('#certViewport');
    const track = $('#certTrack');
    const fill = $('#certHscrollFill');
    const prevBtn = $('#certPrev');
    const nextBtn = $('#certNext');
    const dotsContainer = $('#certDots');

    if (!section || !viewport || !track) return;

    const cards = $$('.cert-card', track);
    const mq = window.matchMedia('(max-width: 768px)');

    // Build dots (used in both modes)
    function buildDots(count) {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = 'cert-carousel__dot';
        dot.setAttribute('aria-label', `Go to certificate ${i + 1}`);
        if (i === 0) dot.classList.add('is-active');
        dotsContainer.appendChild(dot);
      }
    }

    /* ---------- DESKTOP: pinned scroll-driven horizontal track ---------- */
    function updateDesktop() {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const scrollable = sectionHeight - vh;
      if (scrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const trackWidth = track.scrollWidth;
      const containerWidth = track.parentElement.offsetWidth;
      const maxScroll = Math.max(0, trackWidth - containerWidth);

      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      track.style.transform = `translateX(${-eased * maxScroll}px)`;

      if (fill) fill.style.width = (progress * 100) + '%';

      if (dotsContainer) {
        const dots = $$('.cert-carousel__dot', dotsContainer);
        const activeIdx = Math.min(dots.length - 1, Math.round(progress * (dots.length - 1)));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
      }
    }

    function scrollSectionToProgress(p) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const vh = window.innerHeight;
      const scrollable = sectionHeight - vh;
      window.scrollTo({ top: sectionTop + p * scrollable, behavior: 'smooth' });
    }

    /* ---------- MOBILE: native swipeable row + drag ---------- */
    let isDragging = false, startX = 0, scrollStart = 0;

    function enableMobileMode() {
      track.style.transform = '';
      buildDots(cards.length);

      function updateMobileDots() {
        if (!dotsContainer) return;
        const maxScroll = viewport.scrollWidth - viewport.offsetWidth;
        const progress = maxScroll > 0 ? viewport.scrollLeft / maxScroll : 0;
        const dots = $$('.cert-carousel__dot', dotsContainer);
        const activeIdx = Math.round(progress * (dots.length - 1));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
      }
      viewport.addEventListener('scroll', updateMobileDots, { passive: true });
      updateMobileDots();

      if (dotsContainer) {
        $$('.cert-carousel__dot', dotsContainer).forEach((dot, i) => {
          dot.addEventListener('click', () => {
            const card = cards[i];
            if (card) viewport.scrollTo({ left: card.offsetLeft - 12, behavior: 'smooth' });
          });
        });
      }
    }

    function bindArrowsAndDrag() {
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (mq.matches) {
            viewport.scrollBy({ left: -240, behavior: 'smooth' });
          } else {
            const dots = dotsContainer ? $$('.cert-carousel__dot', dotsContainer) : [];
            const activeIdx = dots.findIndex((d) => d.classList.contains('is-active'));
            const target = Math.max(0, (activeIdx - 1)) / Math.max(1, dots.length - 1);
            scrollSectionToProgress(target);
          }
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (mq.matches) {
            viewport.scrollBy({ left: 240, behavior: 'smooth' });
          } else {
            const dots = dotsContainer ? $$('.cert-carousel__dot', dotsContainer) : [];
            const activeIdx = dots.findIndex((d) => d.classList.contains('is-active'));
            const target = Math.min(1, (activeIdx + 1) / Math.max(1, dots.length - 1));
            scrollSectionToProgress(target);
          }
        });
      }

      // Drag to scroll (desktop track, when not on touch)
      viewport.addEventListener('mousedown', (e) => {
        if (!mq.matches) return; // desktop uses pinned scroll, not drag
      });
    }

    function setup() {
      buildDots(mq.matches ? cards.length : Math.min(cards.length, 8));
      if (mq.matches) {
        enableMobileMode();
      } else {
        requestAnimationFrame(updateDesktop);
      }
    }

    window.addEventListener('scroll', () => {
      if (!mq.matches) updateDesktop();
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (!mq.matches) updateDesktop();
    }, { passive: true });

    mq.addEventListener('change', setup);
    bindArrowsAndDrag();
    setup();
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
     INIT — Called after loader completes
     ═══════════════════════════════════════════════════════ */
  let siteInitialized = false;

  function initSite() {
    if (siteInitialized) return;
    siteInitialized = true;

    initCanvas();
    initThemeToggle();
    initScrollProgress();
    initReveals();
    initNavActive();
    initMobileNav();
    initLightbox();
    initBackToTop();
    initContactForm();
    initYear();
    initHorizontalScroll();
    initParallax();
    initCertScrollytelling();
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