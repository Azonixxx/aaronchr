(() => {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.getElementById('themeColorMeta');
  const themeRipple = document.getElementById('themeRipple');
  const THEME_KEY = 'malubay-portfolio-theme';

  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function storeTheme(value) {
    try { localStorage.setItem(THEME_KEY, value); } catch (e) { /* ignore */ }
  }

  function themeBgColor(theme) {
    return theme === 'light' ? '#F5FAFD' : '#05080D';
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    const isLight = theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    if (themeColorMeta) themeColorMeta.setAttribute('content', themeBgColor(theme));
    refreshTechBgPalette();
  }

  const stored = getStoredTheme();
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(stored || (prefersLight ? 'light' : 'dark'));

  function toggleThemeWithReveal() {
    const next = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';

    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    if (reduceMotion) {
      applyTheme(next);
      storeTheme(next);
      return;
    }


    if (typeof document.startViewTransition === 'function') {
      htmlEl.style.setProperty('--theme-x', `${x}px`);
      htmlEl.style.setProperty('--theme-y', `${y}px`);
      htmlEl.style.setProperty('--theme-r', `${endRadius}px`);

      document.startViewTransition(() => {
        applyTheme(next);
        storeTheme(next);
      });
      return;
    }

    if (themeRipple) {
      themeRipple.style.transition = 'none';
      themeRipple.style.background = themeBgColor(htmlEl.getAttribute('data-theme'));
      themeRipple.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
      themeRipple.classList.add('is-active');

      applyTheme(next);
      storeTheme(next);


      void themeRipple.offsetHeight;
      themeRipple.style.transition = '';
      requestAnimationFrame(() => {
        themeRipple.style.clipPath = `circle(0px at ${x}px ${y}px)`;
      });

      themeRipple.addEventListener('transitionend', function handler() {
        themeRipple.classList.remove('is-active');
        themeRipple.style.clipPath = 'circle(0px at 50% 50%)';
        themeRipple.removeEventListener('transitionend', handler);
      }, { once: true });
    } else {
      applyTheme(next);
      storeTheme(next);
    }
  }

  themeToggle.addEventListener('click', toggleThemeWithReveal);


  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });


  const revealTargets = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => revealObserver.observe(el));


  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), 120 * i);
  });


  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = (data.get('name') || '').toString();
    const email = (data.get('email') || '').toString();
    const message = (data.get('message') || '').toString();

    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:aaron.malubay@example.com?subject=${subject}&body=${body}`;

    contactStatus.textContent = 'Opening your email app…';
    setTimeout(() => { contactStatus.textContent = ''; }, 4000);
  });


  document.getElementById('year').textContent = new Date().getFullYear();


  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(imgEl) {
    // Skip broken images (e.g. placeholder not yet filled in)
    if (!imgEl || imgEl.style.display === 'none' || !imgEl.naturalWidth) return;
    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.hero__avatar-img, .cert-card__frame img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });


  const scrollProgress = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }


  const backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    if (window.scrollY > 480) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  }
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  const navAnchors = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
  const spySections = navAnchors
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      navAnchors.forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  spySections.forEach(section => spyObserver.observe(section));


  let scrollTicking = false;
  function onScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        updateScrollProgress();
        updateBackToTop();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollProgress();
  updateBackToTop();


  const techCanvas = document.getElementById('techBg');
  if (techCanvas && techCanvas.getContext) {
    const ctx = techCanvas.getContext('2d');
    let particles = [];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animId = null;
    let lineColor = '#22D3EE';
    let dotColor = '#38BDF8';
    let pulseColor = '#B32C42';
    let pulses = [];


    const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    let targetMouseX = null, targetMouseY = null;
    let mouseX = null, mouseY = null;
    let mouseInfluence = 0; 
    const interactionRadius = 150;

    function readCssVar(name, fallback) {
      const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return val || fallback;
    }

    function refreshPalette() {
      lineColor = readCssVar('--cyan', '#22D3EE');
      dotColor = readCssVar('--skyblue', '#38BDF8');
      pulseColor = readCssVar('--maroon', '#B32C42');
    }

    window.__refreshTechBgPalette = refreshPalette;

    function hexToRgba(hex, alpha) {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
      const r = parseInt(c.substring(0, 2), 16) || 0;
      const g = parseInt(c.substring(2, 4), 16) || 0;
      const b = parseInt(c.substring(4, 6), 16) || 0;
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function initParticles() {
      const area = window.innerWidth * window.innerHeight;
      const count = Math.max(18, Math.min(60, Math.round(area / 27000)));
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: Math.random() * 1.5 + 0.8
      }));
      pulses = [];
    }

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      techCanvas.width = window.innerWidth * dpr;
      techCanvas.height = window.innerHeight * dpr;
      techCanvas.style.width = window.innerWidth + 'px';
      techCanvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function maybeSpawnPulse(linkDist) {

      if (reduceMotion) return;
      if (pulses.length > 3) return;
      if (Math.random() > 0.012) return;
      const a = particles[Math.floor(Math.random() * particles.length)];
      let best = null;
      let bestDist = linkDist;
      for (const b of particles) {
        if (b === a) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < bestDist) { best = b; bestDist = d; }
      }
      if (best) pulses.push({ from: a, to: best, t: 0 });
    }

    function draw() {
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const linkDist = 130;


      if (targetMouseX !== null) {
        mouseX = mouseX === null ? targetMouseX : mouseX + (targetMouseX - mouseX) * 0.18;
        mouseY = mouseY === null ? targetMouseY : mouseY + (targetMouseY - mouseY) * 0.18;
        mouseInfluence += (1 - mouseInfluence) * 0.08;
      } else if (mouseInfluence > 0.001) {
        mouseInfluence += (0 - mouseInfluence) * 0.08;
      } else {
        mouseInfluence = 0;
        mouseX = mouseY = null;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!reduceMotion) {
          p.x += p.vx; p.y += p.vy;


          if (mouseX !== null && mouseInfluence > 0.01) {
            const dxm = p.x - mouseX, dym = p.y - mouseY;
            const dm = Math.sqrt(dxm * dxm + dym * dym);
            if (dm < interactionRadius && dm > 0.001) {
              const push = (1 - dm / interactionRadius) * 1.6 * mouseInfluence;
              p.x += (dxm / dm) * push;
              p.y += (dym / dm) * push;
            }
          }

          if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
        }
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.22;
            ctx.strokeStyle = hexToRgba(lineColor, alpha);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = hexToRgba(dotColor, 0.62);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }


      if (mouseX !== null && mouseInfluence > 0.01) {
        for (const p of particles) {
          const dx = p.x - mouseX, dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < interactionRadius) {
            const alpha = (1 - dist / interactionRadius) * 0.32 * mouseInfluence;
            ctx.strokeStyle = hexToRgba(lineColor, alpha);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }
        ctx.fillStyle = hexToRgba(dotColor, 0.85 * mouseInfluence);
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      maybeSpawnPulse(linkDist);
      pulses = pulses.filter(pulse => {
        pulse.t += 0.012;
        if (pulse.t >= 1) return false;
        const x = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.t;
        const y = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.t;
        ctx.fillStyle = hexToRgba(pulseColor, 0.8);
        ctx.beginPath();
        ctx.arc(x, y, 1.9, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      animId = requestAnimationFrame(draw);
    }

    function debounce(fn, wait) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    }

    refreshPalette();
    resizeCanvas();
    draw();


    if (!isCoarsePointer) {
      window.addEventListener('pointermove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        targetMouseX = targetMouseY = null;
      }, { passive: true });

      window.addEventListener('blur', () => {
        targetMouseX = targetMouseY = null;
      });

      document.addEventListener('mouseleave', () => {
        targetMouseX = targetMouseY = null;
      });
    }

    window.addEventListener('resize', debounce(resizeCanvas, 200));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
        animId = null;
      } else if (!animId) {
        draw();
      }
    });
  }

  function refreshTechBgPalette() {
    if (typeof window.__refreshTechBgPalette === 'function') {
      window.__refreshTechBgPalette();
    }
  }
})();