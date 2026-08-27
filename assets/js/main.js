/* ══════════════════════════════════════════════════════════
   Suresh Surkheti — Portfolio interactions
   ══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ─────────── THEME ─────────── */
  const root = document.documentElement;
  /* The inline bootstrap in <head> has already applied the right theme —
     saved choice first, OS preference otherwise. Don't clobber it here.
     Only follow later OS changes while the visitor has made no explicit choice. */
  const savedTheme = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  if (!savedTheme) {
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    dark.addEventListener?.('change', e => {
      try { if (localStorage.getItem('theme')) return; } catch { /* private mode */ }
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
  }

  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* private mode */ }
  });

  /* ─────────── PRELOADER ─────────── */
  const preloader = $('#preloader');

  /* The fourteen letters finish landing at 13 × 35ms + 500ms ≈ 0.96s, so hold
     the loader past that and let the finished name sit for a beat. Without a
     floor, a warm cache dismisses it in ~200ms and the name never lands. */
  const MIN_VISIBLE = 1100;
  const shownAt = performance.now();

  const finishLoad = () => {
    // Never hold someone who asked for reduced motion.
    const wait = reduced ? 0 : Math.max(380, MIN_VISIBLE - (performance.now() - shownAt));
    setTimeout(() => {
      preloader?.classList.add('done');
      document.body.classList.add('loaded');
      startTyped();
    }, wait);
  };

  window.addEventListener('load', finishLoad);
  // Safety net: never trap the visitor behind the loader.
  setTimeout(() => { if (!preloader?.classList.contains('done')) finishLoad(); }, 3500);

  /* ─────────── ROLE TYPEWRITER ─────────── */
  /* Hand-rolled: a whole CDN library for one line of text is not worth the request. */
  let typedStarted = false;
  function startTyped() {
    if (typedStarted) return;
    typedStarted = true;
    const el = $('#typed');
    if (!el) return;

    /* Four, not five, and each one says something. A rotation of bare technology
       names ("TypeScript Developer") reads as a keyword list; pairing them tells
       a visitor which half of the stack the line is describing. */
    const roles = ['Software Engineer', 'Full Stack Developer', 'Vue & TypeScript Developer', 'Python & FastAPI Developer'];
    if (reduced) { el.textContent = roles[0]; return; }

    const TYPE = 70, ERASE = 34, HOLD = 1700, GAP = 420;
    let r = 0, i = 0, erasing = false;

    (function tick() {
      const word = roles[r];
      el.textContent = word.slice(0, i);

      let delay;
      if (!erasing) {
        if (i < word.length) { i++; delay = TYPE; }
        else { erasing = true; delay = HOLD; }
      } else {
        if (i > 0) { i--; delay = ERASE; }
        else { erasing = false; r = (r + 1) % roles.length; delay = GAP; }
      }
      setTimeout(tick, delay);
    })();
  }

  /* ─────────── HEADER / SCROLL PROGRESS / ACTIVE NAV ─────────── */
  const header = $('#header');
  const scrollBar = $('#scrollBar');
  const toTop = $('#toTop');
  const navLinks = $$('.navbar a');
  const sections = $$('main section[id]').filter(
    sec => document.querySelector(`.navbar a[href="#${sec.id}"]`)
  );

  let rafPending = false;
  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      header?.classList.toggle('scrolled', y > 24);
      toTop?.classList.toggle('show', y > 520);
      if (scrollBar) scrollBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

      // active nav link — the section covering the viewport's upper third
      const probe = y + window.innerHeight * 0.32;
      let current = sections[0]?.id ?? '';
      for (const sec of sections) {
        if (sec.offsetTop <= probe) current = sec.id;
      }
      if (y + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1]?.id ?? current;
      }
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));

      rafPending = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* The button is fixed bottom-right, which is exactly where the footer's right
     column sits. Fade it out while the footer is on screen rather than padding
     the footer to make room for it. */
  const footerEl = $('.footer');
  if (footerEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => toTop?.classList.toggle('at-footer', entry.isIntersecting),
      { rootMargin: '0px 0px -8px 0px' }
    ).observe(footerEl);
  }
  window.addEventListener('resize', onScroll);
  onScroll();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ─────────── MOBILE MENU ─────────── */
  const menuToggle = $('#menuToggle');
  const navbar = $('#navbar');

  function closeMenu() {
    navbar?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
  }

  menuToggle?.addEventListener('click', () => {
    const open = navbar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  });

  navLinks.forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });

  /* ─────────── SCROLL REVEAL ─────────── */
  const revealables = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('in'));
  }

  /* helper: run a callback once an element scrolls into view */
  function onceInView(el, cb, threshold = 0.35) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { cb(); obs.disconnect(); }
    }, { threshold });
    io.observe(el);
  }

  /* ─────────── COUNTERS ─────────── */
  $$('.counter').forEach(el => {
    onceInView(el.closest('.stats') || el, () => {
      const target = Number(el.dataset.target || 0);
      if (reduced) { el.textContent = String(target); return; }
      const dur = 1600;
      const t0 = performance.now();
      const step = now => {
        // clamp: a rAF timestamp can precede t0, which would render a negative count
        const p = Math.min(Math.max((now - t0) / dur, 0), 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 0.3);
  });

  /* ─────────── PROJECT FILTER + MOBILE CAP ─────────── */
  const grid = $('#workGrid');
  const moreWrap = $('.work__more');
  const showAllBtn = $('#showAllProjects');
  const narrow = window.matchMedia('(max-width: 560px)');
  /* One screenful before the ask: two rows of three on desktop, three stacked
     cards on a phone where each one is full width. */
  const CAP_WIDE = 6, CAP_NARROW = 3;
  /* Only cap where there is a way through to the rest. projects.html reuses this
     grid to show everything, and has no such control — it must not hide cards. */
  const capEnabled = !!showAllBtn;

  /* Recomputed after every filter so the cap always counts what is actually
     visible, not the original order. */
  function applyCap() {
    if (!grid) return;
    const cap = narrow.matches ? CAP_NARROW : CAP_WIDE;
    const visible = $$('.project', grid).filter(c => !c.classList.contains('hide'));
    const capping = capEnabled;
    visible.forEach((card, i) => card.classList.toggle('capped', capping && i >= cap));
    if (moreWrap) moreWrap.hidden = !(capping && visible.length > cap);
    if (showAllBtn) {
      // the destination lists every project, so the count is the total — not the
      // filtered subset, which would promise fewer than the page delivers
      const total = $$('.project', grid).length;
      $('span', showAllBtn).textContent = `See all ${total} projects`;
    }
  }

  $$('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const want = btn.dataset.filter;

      $$('.project', grid).forEach(card => {
        const cats = (card.dataset.cat || '').split(/\s+/);
        const show = want === 'all' || cats.includes(want);
        card.classList.add('filtering');
        setTimeout(() => {
          card.classList.toggle('hide', !show);
          requestAnimationFrame(() => card.classList.remove('filtering'));
          applyCap();
        }, reduced ? 0 : 220);
      });
    });
  });

  narrow.addEventListener('change', applyCap);
  applyCap();

  /* ─────────── SPOTLIGHT CARDS ─────────── */
  if (finePointer) {
    $$('.spotlight').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ─────────── 3D TILT ─────────── */
  if (finePointer && !reduced) {
    $$('.tilt').forEach(el => {
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 600);
      });
    });

    // Hero avatar reacts to cursor position across the whole hero
    const hero = $('#home');
    const avatar = $('#avatar');
    if (hero && avatar) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        avatar.style.transform = `perspective(1000px) rotateY(${x * 14}deg) rotateX(${y * -12}deg) translateZ(0)`;
      });
      hero.addEventListener('pointerleave', () => { avatar.style.transform = ''; });
    }
  }

  /* ─────────── MAGNETIC BUTTONS ─────────── */
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ─────────── CUSTOM CURSOR ─────────── */
  if (finePointer && !reduced) {
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    let rx = window.innerWidth / 2, ry = window.innerHeight / 2;
    let tx = rx, ty = ry;

    window.addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('cursor-on');
      if (dot) dot.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
    }, { passive: true });

    (function loop() {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      if (ring) ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
      requestAnimationFrame(loop);
    })();

    $$('a, button, .project, .card').forEach(el => {
      el.addEventListener('pointerenter', () => ring?.classList.add('grow'));
      el.addEventListener('pointerleave', () => ring?.classList.remove('grow'));
    });

    document.addEventListener('pointerleave', () => document.body.classList.remove('cursor-on'));
  }

  /* ─────────── HERO PARTICLE CONSTELLATION ─────────── */
  const canvas = $('#particles');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, dots = [], raf = null, visible = true;
    const pointer = { x: -9999, y: -9999 };

    const accent = () => (root.getAttribute('data-theme') === 'light' ? '8, 145, 178' : '34, 211, 238');

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(Math.round((w * h) / 18000), 90);
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        r: Math.random() * 1.7 + 0.7
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      const rgb = accent();

      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, .55)`;
        ctx.fill();
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(${rgb}, ${0.16 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        const pdx = dots[i].x - pointer.x, pdy = dots[i].y - pointer.y;
        const pd = Math.hypot(pdx, pdy);
        if (pd < 170) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.strokeStyle = `rgba(232, 121, 249, ${0.3 * (1 - pd / 170)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf && visible) frame(); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    size();
    start();

    window.addEventListener('resize', () => { size(); });
    canvas.parentElement.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    }, { passive: true });
    canvas.parentElement.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });

    // pause when the hero is off-screen or the tab is hidden
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });
  }

  /* ─────────── CONTACT FORM ───────────
     Vercel has no built-in form handling, so delivery goes through Formspree.
     Paste your endpoint over YOUR_FORM_ID in index.html and messages start
     arriving; until then the Send button falls back to opening the visitor's
     own mail app, so nothing is ever silently dropped. */
  const MAIL_TO = 'surkhetisuresh123@gmail.com';
  const form = $('#contactForm');
  const status = $('#formStatus');
  const submitBtn = $('#submitBtn');

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!status || !submitBtn) return;

    // lightweight client-side validation
    let valid = true;
    $$('.field', form).forEach(field => {
      const input = $('input, textarea', field);
      if (!input) return;
      const bad = input.required && (!input.value.trim() || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value)));
      field.classList.toggle('invalid', bad);
      if (bad) valid = false;
    });

    if (!valid) {
      status.className = 'form__status err';
      status.textContent = 'Please fill in your name, a valid email and a message.';
      return;
    }

    submitBtn.classList.add('loading');
    const icon = $('i', submitBtn);
    const originalIcon = icon?.className;
    if (icon) icon.className = 'bx bx-loader-alt';
    status.className = 'form__status';
    status.textContent = 'Sending…';

    try {
      const fd = new FormData(form);

      /* Nothing configured: hand the message to the visitor's own mail client
         rather than POSTing it somewhere it would be silently lost. */
      // if (form.action.includes('xwvnkykd')) {
      //   const subject = (fd.get('subject') || '').toString().trim() || 'Message from your portfolio';
      //   const body = `Name: ${fd.get('name')}\nEmail: ${fd.get('email')}\n\n${fd.get('message')}`;
      //   window.location.href = `mailto:${MAIL_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      //   status.className = 'form__status ok';
      //   status.textContent = 'Thanks for reaching out — I\'ll reply within 24 hours.';
      //   submitBtn.classList.remove('loading');
      //   if (icon && originalIcon) icon.className = originalIcon;
      //   return;
      // }

      const res = await fetch(form.action, {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        status.className = 'form__status ok';
        status.textContent = 'Thank you! Your message is on its way — I\'ll reply soon.';
        form.reset();
        setTimeout(() => { status.textContent = ''; status.className = 'form__status'; }, 7000);
      } else {
        throw new Error('Bad response');
      }
    } catch {
      status.className = 'form__status err';
      status.textContent = `Something went wrong. Please email ${MAIL_TO} instead.`;
    } finally {
      submitBtn.classList.remove('loading');
      if (icon && originalIcon) icon.className = originalIcon;
    }
  });

  $$('.field input, .field textarea').forEach(input => {
    input.addEventListener('input', () => input.closest('.field')?.classList.remove('invalid'));
  });

  /* ─────────── COPY EMAIL ─────────── */
  const copyBtn = $('#copyEmail');
  copyBtn?.addEventListener('click', async () => {
    const text = copyBtn.dataset.copy || '';
    const icon = $('i', copyBtn);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard API needs a secure context — fall back to a throwaway textarea
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* nothing more to try */ }
      ta.remove();
    }
    copyBtn.classList.add('copied');
    if (icon) icon.className = 'bx bx-check';
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      if (icon) icon.className = 'bx bx-copy';
    }, 1800);
  });

  /* ─────────── RESUME BUTTON ─────────── */
  /* Shown only once resume.pdf actually exists, so it can never be a dead link.
     Drop your PDF next to index.html and it appears on its own. */
  (async () => {
    const btn = $('#resumeBtn');
    if (!btn) return;
    if (location.protocol === 'file:') { btn.hidden = false; return; }  // can't probe over file://
    try {
      const res = await fetch('resume.pdf', { method: 'HEAD' });
      if (res.ok) btn.hidden = false;
    } catch { /* leave it hidden */ }
  })();

})();
