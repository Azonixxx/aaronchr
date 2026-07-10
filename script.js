(() => {
  'use strict';

  /* ═══════════════════════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════════════════════ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    const totalDuration = 2600; // ms from first line to 100%

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
    const NODE_COUNT = 50;
    const CONNECT_DIST = 140;

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
        ? { node: 'rgba(34,211,238,0.35)', line: 'rgba(34,211,238,0.08)' }
        : { node: 'rgba(11,127,196,0.25)', line: 'rgba(11,127,196,0.06)' };
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const colors = getColor();

      // Update positions
      for (const n of nodes) {
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

        const transition = document.startViewTransition(() => {
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
     6. NAV ACTIVE STATE
     ═══════════════════════════════════════════════════════ */
  function initNavActive() {
    const links = $$('.nav__links a');
    const sections = links
      .map((a) => {
        const id = a.getAttribute('href').replace('#', '');
        return document.getElementById(id);
      })
      .filter(Boolean);

    function update() {
      const scrollY = window.scrollY + 120;
      let activeIdx = -1;

      sections.forEach((sec, i) => {
        if (scrollY >= sec.offsetTop) {
          activeIdx = i;
        }
      });

      links.forEach((a, i) => {
        a.classList.toggle('is-active', i === activeIdx);
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
    const status = $('#contactStatus');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (status) {
        status.textContent = '✅ Thanks for your message! I\'ll get back to you soon.';
        status.style.color = 'var(--cyan)';
      }
      form.reset();
      setTimeout(() => {
        if (status) status.textContent = '';
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
    const section = $('.hscroll-section');
    const track = $('#skillsTrack');
    const fill = $('#hscrollFill');
    const hint = $('.hscroll-hint');

    if (!section || !track) return;

    // Don't activate on mobile
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

      // Progress: 0 (top of section at viewport top) → 1 (bottom of section at viewport bottom)
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));

      // Horizontal translation
      const trackWidth = track.scrollWidth;
      const containerWidth = track.parentElement.offsetWidth;
      const maxScroll = Math.max(0, trackWidth - containerWidth);

      // Apply eased progress for smoother feel
      const easedProgress = easeInOutCubic(progress);
      track.style.transform = `translateX(${-easedProgress * maxScroll}px)`;

      // Update progress bar
      if (fill) fill.style.width = (progress * 100) + '%';

      // Hide hint after initial scroll
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

    // Re-check on orientation change
    mq.addEventListener('change', () => {
      if (mq.matches) {
        track.style.transform = '';
        if (fill) fill.style.width = '0%';
      } else {
        update();
      }
    });

    // Initial call
    requestAnimationFrame(update);
  }


  /* ═══════════════════════════════════════════════════════
     13. PARALLAX — HERO ELEMENTS
     ═══════════════════════════════════════════════════════ */
  function initParallax() {
    if (prefersReducedMotion()) return;

    const els = $$('.parallax-el');
    if (!els.length) return;

    function update() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Only apply parallax in the hero area
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
     14. CERTIFICATES CAROUSEL
     ═══════════════════════════════════════════════════════ */
  function initCertCarousel() {
    const viewport = $('#certViewport');
    const track = $('#certTrack');
    const prevBtn = $('#certPrev');
    const nextBtn = $('#certNext');
    const dotsContainer = $('#certDots');

    if (!viewport || !track) return;

    const cards = $$('.cert-card', track);
    const cardWidth = 240 + 18; // flex-basis + gap
    const visibleCards = Math.max(1, Math.floor(viewport.offsetWidth / cardWidth));
    const totalGroups = Math.max(1, cards.length - visibleCards + 1);

    // Create dots
    if (dotsContainer) {
      for (let i = 0; i < Math.min(totalGroups, 8); i++) {
        const dot = document.createElement('button');
        dot.className = 'cert-carousel__dot';
        dot.setAttribute('aria-label', `Go to certificate group ${i + 1}`);
        if (i === 0) dot.classList.add('is-active');
        dot.addEventListener('click', () => scrollToGroup(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      const scrollLeft = viewport.scrollLeft;
      const maxScroll = viewport.scrollWidth - viewport.offsetWidth;
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      const dots = $$('.cert-carousel__dot', dotsContainer);
      const activeIdx = Math.round(progress * (dots.length - 1));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
    }

    function scrollToGroup(idx) {
      const maxScroll = viewport.scrollWidth - viewport.offsetWidth;
      const dots = $$('.cert-carousel__dot', dotsContainer);
      const targetScroll = dots.length > 1
        ? (idx / (dots.length - 1)) * maxScroll
        : 0;
      viewport.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }

    // Arrow buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        viewport.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        viewport.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });
      });
    }

    // Update dots on scroll
    viewport.addEventListener('scroll', updateDots, { passive: true });

    // Drag to scroll
    let isDragging = false;
    let startX = 0;
    let scrollStart = 0;

    viewport.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX;
      scrollStart = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.pageX - startX;
      viewport.scrollLeft = scrollStart - dx;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        viewport.classList.remove('is-dragging');
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
    initCertCarousel();
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
