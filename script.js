/* =============================================================
   Noemia L. Mahmud — Portfolio
   Vanilla JS. No dependencies, no build step.

   Modules, in order:
     1.  utils            7.  timeline progress
     2.  theme            8.  tilt + spotlight
     3.  neural canvas    9.  magnetic buttons
     4.  cursor          10.  text scramble
     5.  nav             11.  project data / filters
     6.  reveal          12.  modal (+ deep links)
                         13.  command palette
                         14.  copy / toast / form
   ============================================================= */

/* ===== 1. UTILS ===== */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

function raf(fn) {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { fn(...args); ticking = false; });
  };
}

/* ===== 2. THEME =====
   The initial theme is applied by an inline script in <head> to avoid a
   flash of the wrong palette; this only handles the toggle afterwards. */
(function theme() {
  const btn = $('#theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    btn.setAttribute('aria-label', `Switch to ${next === 'light' ? 'dark' : 'light'} theme`);
    window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });
})();

/* ===== 3. NEURAL CANVAS =====
   Particle field behind the hero: nodes drift, connect when close, repel
   from the cursor, and periodically fire a "signal" along an edge. */
(function neural() {
  const canvas = $('#neural-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const host = canvas.parentElement;
  let w = 0, h = 0, dpr = 1;
  let nodes = [], signals = [], rafId = null, running = false;
  const mouse = { x: -9999, y: -9999, active: false };
  const LINK = 150;
  const REPEL = 130;

  let hues = { node: '160,170,255', link: '120,130,255' };
  function readTheme() {
    const light = document.documentElement.dataset.theme === 'light';
    hues = light
      ? { node: '90,60,220', link: '110,80,230' }
      : { node: '160,170,255', link: '120,130,255' };
  }

  function resize() {
    const r = host.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    const count = clamp(Math.round((w * h) / 13000), 40, 130);
    nodes = Array.from({ length: count }, () => {
      const z = Math.random() * 0.75 + 0.25;          // depth: 0.25 (far) → 1 (near)
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.26 * z,
        vy: (Math.random() - 0.5) * 0.26 * z,
        z,
        r: (Math.random() * 1.4 + 0.7) * z,
        phase: Math.random() * Math.PI * 2
      };
    });
    signals = [];
  }

  function fire() {
    if (nodes.length < 2 || signals.length > 5) return;
    const a = nodes[(Math.random() * nodes.length) | 0];
    const near = nodes.filter(n => n !== a && Math.hypot(n.x - a.x, n.y - a.y) < LINK);
    if (!near.length) return;
    const b = near[(Math.random() * near.length) | 0];
    signals.push({ a, b, t: 0, speed: 0.014 + Math.random() * 0.016 });
  }

  function frame(time) {
    ctx.clearRect(0, 0, w, h);
    const t = time * 0.001;

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // Cursor repulsion — nearer nodes react more strongly.
      if (mouse.active) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < REPEL && d > 0.01) {
          const f = ((REPEL - d) / REPEL) * 0.9 * n.z;
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }
      }

      // Wrap softly at the edges.
      if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
    }

    // Links
    ctx.lineWidth = 0.7;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK * LINK) continue;
        const d = Math.sqrt(d2);
        let alpha = (1 - d / LINK) * 0.3 * ((a.z + b.z) / 2);
        // Brighten links near the cursor.
        if (mouse.active) {
          const md = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y);
          if (md < 200) alpha += (1 - md / 200) * 0.35;
        }
        ctx.strokeStyle = `rgba(${hues.link},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // Signals travelling along edges
    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i];
      s.t += s.speed;
      if (s.t >= 1) { signals.splice(i, 1); continue; }
      const x = s.a.x + (s.b.x - s.a.x) * s.t;
      const y = s.a.y + (s.b.y - s.a.y) * s.t;
      const fade = Math.sin(s.t * Math.PI);
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,211,238,${fade})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,211,238,${fade * 0.14})`;
      ctx.fill();
    }

    // Nodes
    for (const n of nodes) {
      const pulse = 0.65 + 0.35 * Math.sin(t * 1.4 + n.phase);
      const r = n.r * (0.85 + pulse * 0.3);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + 3 * n.z, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hues.node},${pulse * 0.11 * n.z})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hues.node},${(0.35 + pulse * 0.45) * n.z})`;
      ctx.fill();
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  readTheme();
  resize();
  seed();

  if (reduceMotion) {
    frame(0);            // one static frame
    cancelAnimationFrame(rafId);
    rafId = null;
  } else {
    start();
    setInterval(fire, 900);
  }

  window.addEventListener('themechange', () => { readTheme(); });

  window.addEventListener('mousemove', e => {
    const r = host.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = mouse.y > -100 && mouse.y < h + 100;
  }, { passive: true });
  window.addEventListener('mouseout', () => { mouse.active = false; });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { resize(); seed(); }, 180);
  });

  // Only animate while the hero is on screen and the tab is visible.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 })
      .observe(host);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();

/* ===== 4. CURSOR ===== */
(function cursor() {
  if (isTouch || reduceMotion) return;
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (!dot || !ring) return;

  document.body.classList.add('has-cursor');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  window.addEventListener('mousedown', () => ring.classList.add('is-down'));
  window.addEventListener('mouseup', () => ring.classList.remove('is-down'));
  document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });

  const INTERACTIVE = 'a, button, [role="button"], input, textarea, .card, .filter-btn, .contact-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(INTERACTIVE)) ring.classList.add('is-active');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(INTERACTIVE)) ring.classList.remove('is-active');
  });

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  })();
})();

/* ===== 5. NAV + SCROLL PROGRESS ===== */
(function nav() {
  const bar = $('.navbar');
  const progress = $('.scroll-progress');
  const toggle = $('.nav-toggle');
  const links = $('.nav-links');

  const onScroll = raf(() => {
    const y = window.scrollY;
    if (bar) bar.classList.toggle('scrolled', y > 12);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    }
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const top = $('.to-top');
  if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
})();

/* ===== 6. REVEAL ON SCROLL ===== */
(function reveal() {
  const els = $$('[data-reveal]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || reduceMotion) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(el => {
    // Stagger siblings that share a [data-stagger] parent.
    const parent = el.closest('[data-stagger]');
    if (parent) {
      const i = [...parent.querySelectorAll('[data-reveal]')].indexOf(el);
      el.style.setProperty('--d', `${Math.min(i, 8) * 70}ms`);
    }
    io.observe(el);
  });
})();

/* ===== 8. TIMELINE PROGRESS ===== */
(function timeline() {
  const rail = $('.timeline-rail');
  const items = $$('.tl-item');
  if (!rail || !items.length) return;

  const wrap = rail.parentElement;
  const onScroll = raf(() => {
    const r = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp((vh * 0.65 - r.top) / r.height, 0, 1);
    rail.style.setProperty('--p', p.toFixed(4));
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('is-visible', e.isIntersecting));
    }, { rootMargin: '-30% 0px -30% 0px' });
    items.forEach(i => io.observe(i));
  } else {
    items.forEach(i => i.classList.add('is-visible'));
  }
})();

/* ===== 9. TILT + SPOTLIGHT ===== */
(function tilt() {
  const spot = $$('.card, .skill-card, .tl-card');
  spot.forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  if (isTouch || reduceMotion) return;

  $$('[data-tilt]').forEach(el => {
    const MAX = 5;
    let rafId = null;
    el.addEventListener('pointermove', e => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg) translateY(-4px)`;
        rafId = null;
      });
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();

/* ===== 10. MAGNETIC BUTTONS ===== */
(function magnetic() {
  if (isTouch || reduceMotion) return;
  $$('[data-magnetic]').forEach(el => {
    const STRENGTH = 0.28;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * STRENGTH;
      const y = (e.clientY - r.top - r.height / 2) * STRENGTH;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();

/* ===== 11. TEXT SCRAMBLE (hero role line) ===== */
(function scramble() {
  const el = $('[data-scramble]');
  if (!el) return;
  const phrases = JSON.parse(el.dataset.scramble);
  const CHARS = '!<>-_\\/[]{}—=+*^?#01';

  if (reduceMotion) { el.textContent = phrases[0]; return; }

  let frame = 0, queue = [], rafId, idx = 0;

  function setText(next) {
    const current = el.textContent;
    const len = Math.max(current.length, next.length);
    queue = [];
    for (let i = 0; i < len; i++) {
      const from = current[i] || '';
      const to = next[i] || '';
      const start = Math.floor(Math.random() * 24);
      const end = start + Math.floor(Math.random() * 24) + 8;
      queue.push({ from, to, start, end, char: '' });
    }
    cancelAnimationFrame(rafId);
    frame = 0;
    return new Promise(resolve => update(resolve));
  }

  function update(resolve) {
    let out = '', done = 0;
    for (const q of queue) {
      if (frame >= q.end) { done++; out += q.to; }
      else if (frame >= q.start) {
        if (!q.char || Math.random() < 0.28) q.char = CHARS[(Math.random() * CHARS.length) | 0];
        out += `<span style="opacity:.55">${q.char}</span>`;
      } else out += q.from;
    }
    el.innerHTML = out;
    if (done === queue.length) resolve();
    else { frame++; rafId = requestAnimationFrame(() => update(resolve)); }
  }

  (async function cycle() {
    // Small delay so the hero entrance animation lands first.
    await new Promise(r => setTimeout(r, 700));
    while (true) {
      await setText(phrases[idx]);
      idx = (idx + 1) % phrases.length;
      await new Promise(r => setTimeout(r, 2600));
    }
  })();
})();

/* ===== 10c. WORK CONSTELLATION =====
   A living synapse map. Force-directed layout (hand-rolled spring/repulsion,
   no dependencies), continuous signal traffic along the axons, per-node cursor
   physics, and staggered spring entrance.

   ---------------------------------------------------------------------------
   EDIT HERE. Nodes carry their own tech list; an edge is created wherever two
   nodes share at least MIN_SHARED technologies. Add pairs to EXTRA_EDGES to
   force a connection the tech lists don't produce.
   --------------------------------------------------------------------------- */
const workGraph = [
  { label: 'Brookhaven',   group: 'role', href: '#experience',
    tech: ['LangGraph', 'MCP', 'LangSmith', 'vLLM', 'Python', 'PyTorch'] },
  { label: 'RAG Health',   group: 'ai', href: 'projects.html#rag-chatbot',
    tech: ['RAG', 'Qdrant', 'Embeddings', 'Python', 'React', 'Flask'] },
  { label: 'Rat Behavior', group: 'ai', href: 'projects.html#deeplabcut',
    tech: ['PyTorch', 'Computer Vision', 'DeepLabCut', 'Python', 'FastAPI'] },
  { label: 'Datathon',     group: 'ai', href: 'projects.html#datathon',
    tech: ['PyTorch', 'Pandas', 'Python', 'SARIMAX', 'Statistics'] },
  { label: 'Web-Cite',     group: 'fullstack', href: 'projects.html#brainstorm',
    tech: ['Node.js', 'MongoDB', 'React', 'D3', 'Embeddings', 'JavaScript'] },
  { label: 'MindLift',     group: 'ai', href: 'projects.html#neurotech-vr',
    tech: ['MediaPipe', 'Computer Vision', 'Unity', 'C#', 'Python'] },
  { label: 'BTHealth',     group: 'fullstack', href: 'projects.html#code-to-cure',
    tech: ['React', 'Flask', 'Python', 'SQLite'] },
  { label: 'Melodify',     group: 'fullstack', href: 'projects.html#melodify',
    tech: ['Python', 'Flask', 'AudioCraft'] },
  { label: 'Club Sites',   group: 'web', href: 'projects.html#neurotech-site',
    tech: ['HTML', 'CSS', 'JavaScript'] }
];

// Explicit extra connections, by label: [['Melodify', 'Club Sites'], ...]
const EXTRA_EDGES = [];
const MIN_SHARED = 2;

(function constellation() {
  const root = $('#workgraph');
  if (!root) return;

  const canvas = $('.wg-canvas', root);
  const ctx = canvas.getContext('2d');
  const hubEl = $('.wg-hub', root);
  const legendDots = $$('.wg-key i[data-group]');

  const COLOR = { role: '#22d3ee', ai: '#7c5cff', fullstack: '#ff77b9', web: '#fbbf24' };
  const rgb = { role: [34, 211, 238], ai: [124, 92, 255], fullstack: [255, 119, 185], web: [251, 191, 36] };

  /* ---------- graph ---------- */
  const byLabel = new Map(workGraph.map((n, i) => [n.label, i]));
  const edges = [];
  const seen = new Set();
  function addEdge(a, b, w, shared) {
    const k = a < b ? a + ':' + b : b + ':' + a;
    if (a === b || seen.has(k)) return;
    seen.add(k);
    edges.push({ a, b, w, shared });
  }
  for (let i = 0; i < workGraph.length; i++) {
    for (let j = i + 1; j < workGraph.length; j++) {
      const shared = workGraph[i].tech.filter(t => workGraph[j].tech.includes(t));
      if (shared.length >= MIN_SHARED) addEdge(i, j, shared.length, shared);
    }
  }
  EXTRA_EDGES.forEach(([x, y]) => {
    if (byLabel.has(x) && byLabel.has(y)) addEdge(byLabel.get(x), byLabel.get(y), 2, []);
  });

  const adj = workGraph.map(() => new Set());
  edges.forEach(e => { adj[e.a].add(e.b); adj[e.b].add(e.a); });

  /* ---------- nodes ---------- */
  const nodes = workGraph.map((n, i) => {
    const a = (i / workGraph.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...n, i,
      x: Math.cos(a) * 120, y: Math.sin(a) * 120,   // seeded, sim settles them
      vx: 0, vy: 0, hw: 46, hh: 13,
      phase: Math.random() * Math.PI * 2,
      bob: 2.4 + Math.random() * 2.2,
      period: 0.5 + Math.random() * 0.5,
      flash: 0, enter: 0, el: null
    };
  });

  const frag = document.createDocumentFragment();
  nodes.forEach((n, i) => {
    const a = document.createElement('a');
    a.className = 'wg-node';
    a.href = n.href;
    a.style.setProperty('--n', COLOR[n.group] || COLOR.ai);
    a.innerHTML = '<i aria-hidden="true"></i>' + n.label;
    a.setAttribute('aria-label', n.label + ' — ' + n.tech.slice(0, 4).join(', '));
    a.addEventListener('pointerenter', () => setHover(i));
    a.addEventListener('pointerleave', () => setHover(-1));
    a.addEventListener('focus', () => setHover(i));
    a.addEventListener('blur', () => setHover(-1));
    // Visual ripple; navigation still happens via the href.
    a.addEventListener('click', () => ripple(n));
    n.el = a;
    frag.appendChild(a);
  });
  root.appendChild(frag);

  function measure() {
    nodes.forEach(n => {
      n.hw = n.el.offsetWidth / 2 || 46;
      n.hh = n.el.offsetHeight / 2 || 13;
    });
  }
  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  /* ---------- state ---------- */
  let W = 0, H = 0, cx = 0, cy = 0, rx = 0, ry = 0, hubR = 76, dpr = 1;
  let hover = -1, raf = null, running = false, started = 0, done = false;
  let maxPulses = 12;
  const neighbours = new Set();
  const pulses = [];
  const ripples = [];
  const catFlash = { role: 0, ai: 0, fullstack: 0, web: 0 };
  const pointer = { x: -9999, y: -9999, on: false };

  function resize() {
    const r = root.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H / 2;
    rx = W * 0.36; ry = H * 0.37;
    hubR = (hubEl.offsetWidth || 152) / 2;
    maxPulses = W < 380 ? 5 : W < 460 ? 8 : 12;
    measure();
  }

  /* ---------- physics ----------
     Positions are stored relative to the centre. Forces: a soft pull toward an
     elliptical ring, box-aware repulsion so labels never overlap, weak springs
     along edges, hub exclusion, and cursor repulsion. */
  const K_RING = 0.16, K_ANG = 0.9, K_EDGE = 0.010, DAMP = 0.82;
  const CURSOR_R = 120, CURSOR_K = 2600;

  // Better-connected work sits nearer the core, which makes the settled layout
  // mean something and gives each node a different preferred radius.
  nodes.forEach(n => {
    const deg = adj[n.i].size;
    n.pref = 1.06 - Math.min(deg, 4) * 0.055;
  });

  function step() {
    const TAU = Math.PI * 2;
    const wantGap = (TAU / nodes.length) * 0.92;

    for (const n of nodes) {
      n.fx = 0; n.fy = 0;
      n.ang = Math.atan2(n.y / ry, n.x / rx);
      n.ud = Math.hypot(n.x / rx, n.y / ry) || 0.0001;
    }

    for (const n of nodes) {
      const ca = Math.cos(n.ang), sa = Math.sin(n.ang);

      // radial: settle onto its preferred ring
      const pull = (n.ud - n.pref) * K_RING * 100;
      n.fx -= ca * pull;
      n.fy -= sa * pull;

      // angular: spread evenly around the core (this is what stops the
      // simulation collapsing into a lopsided clump)
      for (const m of nodes) {
        if (m === n) continue;
        let da = n.ang - m.ang;
        while (da > Math.PI) da -= TAU;
        while (da < -Math.PI) da += TAU;
        const mag = Math.abs(da);
        if (mag < wantGap && mag > 0.0001) {
          const f = (wantGap - mag) / wantGap * K_ANG * (da > 0 ? 1 : -1);
          n.fx += -sa * f * rx * 0.09;
          n.fy += ca * f * ry * 0.09;
        }
      }

      // keep clear of the core
      const d = Math.hypot(n.x, n.y) || 0.0001;
      const minD = hubR + n.hw * 0.55 + 26;
      if (d < minD) {
        const push = (minD - d) * 0.5;
        n.fx += (n.x / d) * push;
        n.fy += (n.y / d) * push;
      }

      // cursor repulsion
      if (pointer.on) {
        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const pd = Math.hypot(dx, dy);
        if (pd < CURSOR_R && pd > 0.01) {
          const f = (1 - pd / CURSOR_R) * (CURSOR_K / (pd + 40));
          n.fx += (dx / pd) * f;
          n.fy += (dy / pd) * f;
        }
      }
    }

    // box-aware separation so labels never overlap
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const needX = a.hw + b.hw + 12;
        const needY = a.hh + b.hh + 14;
        const ox = needX - Math.abs(dx), oy = needY - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          if (ox / needX < oy / needY) {
            const p = ox * 0.11 * ((dx || 0.01) > 0 ? 1 : -1);
            a.fx -= p; b.fx += p;
          } else {
            const p = oy * 0.11 * ((dy || 0.01) > 0 ? 1 : -1);
            a.fy -= p; b.fy += p;
          }
        }
      }
    }

    // weak springs: connected work drifts a little closer together
    for (const e of edges) {
      const a = nodes[e.a], b = nodes[e.b];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const f = (d - Math.min(rx, ry) * 1.1) * K_EDGE;
      a.fx += (dx / d) * f; a.fy += (dy / d) * f;
      b.fx -= (dx / d) * f; b.fy -= (dy / d) * f;
    }

    for (const n of nodes) {
      n.vx = (n.vx + n.fx) * DAMP;
      n.vy = (n.vy + n.fy) * DAMP;
      const sp = Math.hypot(n.vx, n.vy);
      if (sp > 12) { n.vx = n.vx / sp * 12; n.vy = n.vy / sp * 12; }
      n.x += n.vx; n.y += n.vy;

      const limX = W / 2 - n.hw - 4, limY = H / 2 - n.hh - 4;
      if (n.x > limX) { n.x = limX; n.vx *= -0.35; }
      if (n.x < -limX) { n.x = -limX; n.vx *= -0.35; }
      if (n.y > limY) { n.y = limY; n.vy *= -0.35; }
      if (n.y < -limY) { n.y = -limY; n.vy *= -0.35; }
    }
  }

  /* ---------- interaction ---------- */
  function setHover(i) {
    hover = i;
    neighbours.clear();
    if (i >= 0) adj[i].forEach(k => neighbours.add(k));
    nodes.forEach((n, k) => {
      const lit = i < 0 || k === i || neighbours.has(k);
      n.el.classList.toggle('is-dim', !lit);
      n.el.classList.toggle('is-lit', i >= 0 && neighbours.has(k));
    });
    if (!running) render(performance.now());
  }

  function ripple(n) {
    ripples.push({ x: n.x, y: n.y, t: 0, col: rgb[n.group] || rgb.ai });
  }

  /* ---------- signals ---------- */
  function spawn() {
    if (pulses.length >= maxPulses) return;
    // Mostly core -> node, sometimes node -> node along a shared-tech edge.
    if (edges.length && Math.random() < 0.55) {
      const e = edges[(Math.random() * edges.length) | 0];
      const flip = Math.random() < 0.5;
      pulses.push({ a: flip ? e.a : e.b, b: flip ? e.b : e.a, t: 0,
                    sp: 0.008 + Math.random() * 0.01, col: rgb[nodes[flip ? e.b : e.a].group] });
    } else {
      const i = (Math.random() * nodes.length) | 0;
      const out = Math.random() < 0.7;
      pulses.push({ a: out ? -1 : i, b: out ? i : -1, t: 0,
                    sp: 0.007 + Math.random() * 0.009, col: rgb[nodes[i].group] });
    }
  }

  const pos = i => (i < 0 ? { x: 0, y: 0 } : { x: nodes[i].rx, y: nodes[i].ry });

  /* ---------- render ---------- */
  function render(now) {
    // The clock only starts once the section has been seen, so the entrance
    // actually plays instead of snapping to finished while it sat offscreen.
    const t = started ? (now - started) * 0.001 : 0;
    // Insurance: if rAF is throttled hard, never leave it half-drawn.
    if (started && now - started > 4000) done = true;
    if (!reduceMotion) step();

    // entrance + idle bob -> final render positions
    nodes.forEach((n, i) => {
      const e = (reduceMotion || done) ? 1 : clamp((t - i * 0.07) / 0.9, 0, 1);
      n.enter = 1 - Math.pow(1 - e, 3);
      const bx = reduceMotion ? 0 : Math.sin(t * n.period + n.phase) * n.bob;
      const by = reduceMotion ? 0 : Math.cos(t * n.period * 0.8 + n.phase) * n.bob;
      n.rx = (n.x + bx) * n.enter;
      n.ry = (n.y + by) * n.enter;
      n.flash *= 0.93;

      const glow = Math.min(1, n.flash);
      n.el.style.transform =
        'translate3d(' + (cx + n.rx).toFixed(1) + 'px,' + (cy + n.ry).toFixed(1) + 'px,0) ' +
        'translate(-50%,-50%) scale(' + (0.6 + 0.4 * n.enter).toFixed(3) + ')';
      n.el.style.opacity = n.enter.toFixed(3);
      n.el.style.setProperty('--flash', glow.toFixed(3));
    });

    // legend dots follow their category
    for (const k in catFlash) catFlash[k] *= 0.93;
    nodes.forEach(n => { catFlash[n.group] = Math.max(catFlash[n.group], n.flash); });
    legendDots.forEach(d => {
      const v = catFlash[d.dataset.group] || 0;
      d.style.transform = 'scale(' + (1 + v * 0.7).toFixed(3) + ')';
      d.style.opacity = (0.55 + v * 0.45).toFixed(3);
    });

    const hubGlow = Math.min(1, catFlash.role + catFlash.ai * 0.5);
    hubEl.style.setProperty('--flash', hubGlow.toFixed(3));

    /* ---- canvas ---- */
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(cx, cy);

    // core spokes
    nodes.forEach((n, i) => {
      const on = hover < 0 || hover === i || neighbours.has(i);
      ctx.strokeStyle = 'rgba(150,150,205,' + (on ? 0.15 : 0.04) * n.enter + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(n.rx, n.ry);
      ctx.stroke();
    });

    // shared-tech axons
    edges.forEach(e => {
      const a = nodes[e.a], b = nodes[e.b];
      const on = hover === e.a || hover === e.b;
      const base = hover < 0 ? 0.1 + e.w * 0.04 : on ? 0.5 : 0.025;
      const c = on ? rgb[a.group] : [140, 140, 195];
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + base * a.enter * b.enter + ')';
      ctx.lineWidth = on ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(a.rx, a.ry);
      ctx.lineTo(b.rx, b.ry);
      ctx.stroke();
    });

    // travelling signals
    if (!reduceMotion) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.sp;
        const A = pos(p.a), B = pos(p.b);
        if (p.t >= 1) {
          if (p.b >= 0) nodes[p.b].flash = 1;
          else catFlash.role = Math.max(catFlash.role, 0.9);
          pulses.splice(i, 1);
          continue;
        }
        const x = A.x + (B.x - A.x) * p.t;
        const y = A.y + (B.y - A.y) * p.t;
        const fade = Math.sin(p.t * Math.PI);
        const c = p.col;

        // brighten the wire just behind the pulse
        const tb = Math.max(0, p.t - 0.16);
        ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + 0.5 * fade + ')';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(A.x + (B.x - A.x) * tb, A.y + (B.y - A.y) * tb);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + 0.16 * fade + ')';
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + fade + ')';
        ctx.beginPath(); ctx.arc(x, y, 2.3, 0, Math.PI * 2); ctx.fill();
      }

      // click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.t += 0.028;
        if (r.t >= 1) { ripples.splice(i, 1); continue; }
        const c = r.col;
        ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (1 - r.t) * 0.7 + ')';
        ctx.lineWidth = 2 * (1 - r.t);
        ctx.beginPath();
        ctx.arc(r.x, r.y, 10 + r.t * 90, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
    if (running) raf = requestAnimationFrame(render);
  }

  /* ---------- lifecycle ---------- */
  function start() {
    if (running || reduceMotion) return;
    if (!started) {
      started = performance.now();                  // first sight = entrance
      // rAF can be starved (background tab, low-power, headless). This timer
      // guarantees the entrance lands regardless of whether frames arrive.
      setTimeout(() => { if (!done) { done = true; render(performance.now()); } }, 2400);
    }
    running = true;
    raf = requestAnimationFrame(render);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    // If we're pausing part-way through the entrance, land it rather than
    // freezing half-transparent nodes on screen.
    if (started && !done) { done = true; render(performance.now()); }
  }

  resize();
  // Pre-warm so the entrance springs out to a settled layout, not a scramble.
  for (let i = 0; i < 320; i++) step();
  render(performance.now());

  if (!reduceMotion) {
    root.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      pointer.x = e.clientX - r.left - cx;
      pointer.y = e.clientY - r.top - cy;
      pointer.on = true;
    });
    root.addEventListener('pointerleave', () => { pointer.on = false; });
    setInterval(() => { if (running) spawn(); }, 340);
  }

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      resize();
      for (let i = 0; i < 120; i++) step();
      render(performance.now());
    }, 150);
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop(); }, { threshold: 0 })
      .observe(root);
  } else start();
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();

/* ===== 11b. GITHUB ACTIVITY PANEL =====
   Paints immediately from the snapshot inlined in index.html (works offline and
   over file://), then refreshes the calendar in the background. Only the
   calendar is fetched live — languages and repo counts change slowly and come
   from the snapshot, which keeps this to a single small request. */
(function githubPanel() {
  const panel = $('#gh-panel');
  if (!panel) return;

  const raw = $('#gh-data');
  const grid = $('.gh-grid', panel);
  const months = $('.gh-months', panel);
  const scroll = $('.gh-scroll', panel);
  const tip = $('.gh-tip', panel);
  const user = panel.dataset.user || 'noemiamahmud';

  const CACHE_KEY = 'gh-cal-v1';
  const TTL = 6 * 60 * 60 * 1000;               // 6 hours
  const DAY = 86400000;

  let snap = null;
  try { snap = JSON.parse(raw.textContent); } catch (e) { /* malformed */ }
  if (!snap || !snap.calendar || !Array.isArray(snap.calendar.counts)) {
    panel.hidden = true;                         // never show an empty shell
    return;
  }

  /* --- derive headline numbers from the raw day counts --- */
  function derive(counts) {
    let total = 0, active = 0, best = 0, run = 0;
    for (const c of counts) {
      total += c;
      if (c > 0) { active++; run++; if (run > best) best = run; }
      else run = 0;
    }
    return { total, active, best };
  }

  /* GitHub's own bucketing: quartiles over the days that have activity, so a
     quiet year still shows contrast instead of one flat colour. */
  function levels(counts) {
    const nz = counts.filter(c => c > 0).sort((a, b) => a - b);
    if (!nz.length) return counts.map(() => 0);
    const q = p => nz[Math.min(nz.length - 1, Math.floor(nz.length * p))];
    const t1 = q(0.25), t2 = q(0.5), t3 = q(0.75);
    return counts.map(c => {
      if (c <= 0) return 0;
      if (c <= t1) return 1;
      if (c <= t2) return 2;
      if (c <= t3) return 3;
      return 4;
    });
  }

  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  });
  const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function render(cal) {
    const counts = cal.counts;
    const start = new Date(cal.start + 'T00:00:00Z');
    const lv = levels(counts);
    const stats = derive(counts);

    const set = (k, v) => {
      const el = panel.querySelector(`[data-gh="${k}"]`);
      if (el) el.textContent = v;
    };
    set('total', stats.total.toLocaleString());
    set('active', stats.active);
    set('streak', stats.best);
    set('repos', snap.publicRepos != null ? snap.publicRepos : '—');

    // Pad the first column so each grid row is a fixed weekday.
    const lead = start.getUTCDay();
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let i = 0; i < counts.length; i++) cells.push(i);

    grid.textContent = '';
    months.textContent = '';
    const frag = document.createDocumentFragment();
    const mfrag = document.createDocumentFragment();
    let lastMonth = -1;
    let lastLabelCol = -99;

    for (let i = 0; i < cells.length; i++) {
      const idx = cells[i];
      const col = Math.floor(i / 7);
      const d = document.createElement('div');
      d.className = 'gh-cell';
      d.style.setProperty('--col', col);

      if (idx === null) {
        d.classList.add('pad');
      } else {
        const date = new Date(start.getTime() + idx * DAY);
        const c = counts[idx];
        d.dataset.l = lv[idx];
        d.dataset.c = c;
        d.dataset.d = fmt.format(date);

        // One label per column, at the row-0 cell that opens a new month.
        if (i % 7 === 0) {
          const m = date.getUTCMonth();
          // Only label a month if it has room — otherwise "JulAug" collides.
          if (m !== lastMonth && col - lastLabelCol >= 3) {
            lastMonth = m;
            lastLabelCol = col;
            mfrag.appendChild(monthLabel(MONTH[m]));
          } else {
            if (m !== lastMonth) lastMonth = m;
            mfrag.appendChild(monthLabel(''));
          }
        }
      }
      frag.appendChild(d);
    }
    // Columns that began with a padding cell still need a month slot.
    const cols = Math.ceil(cells.length / 7);
    while (mfrag.childNodes.length < cols) mfrag.appendChild(monthLabel(''));

    grid.appendChild(frag);
    months.appendChild(mfrag);
    grid.setAttribute('aria-label',
      `${stats.total} GitHub contributions in the past year across ${stats.active} active days`);

    if (!reduceMotion) {
      requestAnimationFrame(() => panel.classList.add('is-drawn'));
    }
    // Open on the most recent weeks when the year doesn't fit.
    requestAnimationFrame(() => { scroll.scrollLeft = scroll.scrollWidth; });
  }

  function monthLabel(text) {
    const s = document.createElement('span');
    s.textContent = text;
    return s;
  }

  /* --- language bar --- */
  function renderLangs(langs) {
    if (!Array.isArray(langs) || !langs.length) return;
    const track = $('.gh-bar-track', panel);
    const keys = $('.gh-lang-keys', panel);
    const palette = ['#7c5cff', '#22d3ee', '#ff77b9', '#fbbf24', '#34d399', '#94a3b8'];
    const total = langs.reduce((a, l) => a + l[1], 0);

    track.textContent = '';
    keys.textContent = '';
    langs.slice(0, 6).forEach(([name, n], i) => {
      const pct = Math.round((n / total) * 100);
      const bar = document.createElement('i');
      bar.style.cssText = `flex: ${n} 0 0; background: ${palette[i % palette.length]};`;
      bar.title = `${name} — ${pct}%`;
      track.appendChild(bar);

      const key = document.createElement('span');
      const dot = document.createElement('i');
      dot.style.background = palette[i % palette.length];
      key.appendChild(dot);
      key.appendChild(document.createTextNode(`${name} ${pct}%`));
      keys.appendChild(key);
    });
  }

  /* --- tooltip --- */
  grid.addEventListener('pointerover', e => {
    const cell = e.target.closest('.gh-cell');
    if (!cell || cell.classList.contains('pad')) return;
    const n = +cell.dataset.c;
    tip.textContent = `${n === 0 ? 'No' : n} contribution${n === 1 ? '' : 's'} · ${cell.dataset.d}`;
    const cr = cell.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    tip.style.left = `${cr.left - pr.left + cr.width / 2}px`;
    tip.style.top = `${Math.max(4, cr.top - pr.top - 34)}px`;
    tip.classList.add('show');
  });
  grid.addEventListener('pointerleave', () => tip.classList.remove('show'));

  /* --- cursor spotlight, same as the cards --- */
  panel.addEventListener('pointermove', e => {
    const r = panel.getBoundingClientRect();
    panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
    panel.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  /* --- paint snapshot, then try for something fresher --- */
  render(snap.calendar);
  renderLangs(snap.languages);

  function markLive(when) {
    panel.classList.add('is-live');
    const t = $('.gh-live-text', panel);
    if (!t) return;
    const mins = Math.round((Date.now() - when) / 60000);
    t.textContent = mins < 2 ? 'live' : mins < 60 ? `${mins}m ago` : 'live';
  }

  async function refresh() {
    // Serve a recent cache rather than hitting the network on every page view.
    try {
      const hit = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (hit && Date.now() - hit.at < TTL && hit.cal) {
        render(hit.cal);
        markLive(hit.at);
        return;
      }
    } catch (e) { /* ignore unreadable cache */ }

    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`,
        { signal: ctrl.signal }
      );
      clearTimeout(timeout);
      if (!res.ok) throw new Error(res.status);

      const data = await res.json();
      const days = data.contributions;
      if (!Array.isArray(days) || !days.length) throw new Error('empty');

      const cal = { start: days[0].date, counts: days.map(d => d.count) };
      render(cal);
      markLive(Date.now());
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), cal })); } catch (e) {}
    } catch (e) {
      // Offline, blocked, or the service is down — the snapshot is already on
      // screen and stays there. Nothing to tell the visitor.
    }
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      refresh();
    }, { rootMargin: '200px' });
    io.observe(panel);
  } else {
    refresh();
  }
})();

/* ===== 12. PROJECT DATA =====
   Each project's modal body is produced by content(). Adding a project means
   adding an entry here plus a matching card in projects.html. */

function techList(items) {
  return `<div class="modal-tech-list">${items.map(t => `<span>${t}</span>`).join('')}</div>`;
}
function linksList(items) {
  if (!items.length) return '';
  const icon = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>'
  };
  return `<div class="modal-links">${items.map(l =>
    `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${/github/i.test(l.url) ? icon.github : icon.link}${l.label}</a>`
  ).join('')}</div>`;
}
function img(src, alt = '') {
  return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async" />`;
}

const projectData = {

  'applied-ai': {
    title: 'Applied AI — Course Projects Collection',
    tag: 'Applied AI',
    content: () => `
      <div class="modal-section">
        <p>A collection of AI/ML projects from coursework — spanning neural networks, NLP, computer vision, and reinforcement learning.</p>
      </div>

      <div class="modal-project-list">
        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>RAG Tutor — Study any topic!</h3>
            <a href="https://github.com/noemiamahmud/RAG_Tutor" target="_blank" rel="noopener noreferrer">GitHub →</a>
          </div>
        </div>
        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>LLM DJ Bot</h3>
            <a href="https://github.com/noemiamahmud/LLM_DJ_BOT" target="_blank" rel="noopener noreferrer">GitHub →</a>
          </div>
        </div>
        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>Multi-Agent Debater — Debate on the Ethics of AI Art</h3>
            <a href="https://github.com/noemiamahmud/The_ART_Debate" target="_blank" rel="noopener noreferrer">GitHub →</a>
          </div>
        </div>
        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>Text Operations Toolkit</h3>
            <a href="https://github.com/noemiamahmud/Text_Operations_LLM" target="_blank" rel="noopener noreferrer">GitHub →</a>
          </div>
        </div>
        <div class="modal-project-item">
          <div class="modal-project-info">
            <h3>RecurrentAI — interactive pygame app</h3>
            <a href="https://github.com/noemiamahmud/RecurrentAI/tree/main" target="_blank" rel="noopener noreferrer">GitHub →</a>
          </div>
        </div>
        <p class="modal-note">// more being added from GitHub soon</p>
      </div>
    `
  },

  'rag-chatbot': {
    title: 'AI Healthcare RAG Chatbot',
    tag: 'Machine Learning',
    content: () => `
      <div class="modal-hero-img">${img('img/medassist-1.jpg', 'MedAssist RAG chatbot interface')}</div>

      <div class="modal-section">
        <h3>The Problem</h3>
        <p>Health-related LLM queries are high-stakes — hallucinated medical advice is dangerous. Standard chatbots generate plausible-sounding answers with no way to verify claims or trace them to evidence. We needed a system that grounds every response in retrievable, citable source documents. On the flip side, using the same model, we knew that this could be equally beneficial to the future doctors and nurses of the world, with the aid of agentic patients.</p>
      </div>

      <div class="modal-section">
        <h3>Architecture &amp; Pipeline</h3>
        <p>Designed a Retrieval-Augmented Generation pipeline that ingests curated healthcare documents, medical textbooks, and relevant research, chunks and embeds them into a vector database, retrieves the most relevant passages at query time, and feeds them as context to an LLM for grounded answer synthesis.</p>
        <div class="modal-inline-img">${img('img/medassist-2.jpg', 'RAG pipeline architecture')}</div>
        <ul>
          <li>Document ingestion with chunking, overlap, and metadata tagging</li>
          <li>Embedding generation via sentence-transformers</li>
          <li>Vector search with Qdrant for sub-second retrieval</li>
          <li>LLM synthesis with explicit citation formatting</li>
        </ul>
      </div>

      <div class="modal-section">
        <h3>User Interface</h3>
        <p>I later developed a clean chat interface where each response includes inline citations with expandable source previews, so users can verify claims without leaving the conversation. Users could also upload their own medical documents to have them broken down and explained for clarity, particularly useful for large and complex diagnoses.</p>
        <div class="modal-inline-img">${img('img/medassist-3.jpg', 'Chat interface with inline citations')}</div>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'Qdrant', 'sentence-transformers', 'LangChain', 'RAG', 'Flask', 'React'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/Agentic-AI-UIUC/fall-agentic-ai-healthcare-search' }])}
      </div>
    `
  },

  'deeplabcut': {
    title: 'Rat Behavioral Monitoring System',
    tag: 'Neuroscience Research',
    content: () => `
      <div class="modal-section">
        <video src="annotated.mp4" autoplay loop muted playsinline class="modal-video"></video>
      </div>

      <div class="modal-section">
        <h3>Background</h3>
        <p>At the Gulley Lab for Neuropsychopharmacology, behavioral experiments have generated many hours of rodent video data within T-maze experiments. This became a topic of interest when alarming rates of self-administration nose-pokes became a recurrent issue in a particular study. We needed to know if rats were either displaying this behavior accidentally (eg. with their tail instead of nose), or due to other conditions that the rat may have been experiencing. The lab needed an automated pipeline to validate behavioral logs against video evidence.</p>
      </div>

      <div class="modal-section">
        <h3>Camera System Design</h3>
        <p>Designed an ongoing experimental application that takes the original problem statement and utilizes various neural network modeling approaches to classify behaviors within operant self-administration chambers. This project has since been discontinued by the lab, but would ideally adapt to a 12-camera synchronized recording system.</p>
      </div>

      <div class="modal-section">
        <h3>DeepLabCut Integration</h3>
        <p>Rat Behavior Intelligence is a browser-based neuroscience tool that automates the analysis of rodent behavior from raw video - replacing hours of manual observation with a structured, interpretable pipeline. Users upload a rat video (or record directly from the browser), and the system processes it frame by frame, extracting temporal movement features like confinement, turning patterns, and motion bursts to classify behavioral states including exploration, freezing, grooming, locomotor bursts, stereotypy, and resting. When a local DeepLabCut environment is available, the pipeline upgrades to full pose estimation using a custom-trained ResNet-50 model tracking up to 16 anatomical keypoints - nose, ears, spine segments, paws, and tail - enabling geometry-derived classifications that go far beyond simple motion heuristics.</p>
        <p>The architecture is deliberately staged for interpretability and extensibility. A FastAPI backend handles video ingestion, runs the classification pipeline, and writes annotated outputs; the frontend streams results back as a playable annotated MP4, a <code>timeline.json</code> with frame-level behavior bouts, timestamped event feeds, and a natural-language summary with review-priority flagging. The observer commentary layer is rule-based by default but upgrades transparently to an LLM (OpenAI or a local llama.cpp server) when configured - keeping the core pipeline functional in fully offline or resource-constrained environments.</p>
        <p>What makes this project technically meaningful is its graceful degradation and forward-looking design. When DeepLabCut is unavailable, the system falls back to a motion-based temporal classifier without breaking the user experience. The expanded 16-point skeleton schema and retraining templates are already in place, so improving classification accuracy is a matter of more labeled data rather than architectural rework. The combination of pose estimation, temporal behavior classification, and LLM-augmented summarization positions this as a practical screening tool for neuroscience labs - reducing the manual review burden while keeping a human researcher in the loop on ambiguous or high-priority clips.</p>
      </div>

      <div class="modal-section">
        <h3>Validation Pipeline</h3>
        <p>Developed (and experimentally redeveloping) an end-to-end Python pipeline that cross-references behavioral event logs with synchronized video timestamps. With the use of Claude Code, I am in the process of redeveloping this system to generate visual overlays of tracked poses on raw footage, and flag anomalies where logged events don't match observed behavior.</p>
      </div>

      <div class="modal-img-row">
        <div class="modal-inline-img">${img('img/rat-annotations.jpg', 'Pose annotation overlay')}</div>
        <div class="modal-inline-img">${img('img/rat-code.jpg', 'Pipeline source code')}</div>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'DeepLabCut', 'OpenCV', 'Pandas', 'NumPy', 'Computer Vision', 'Pose Estimation'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/rat-surveillance-app' }])}
      </div>
    `
  },

  'neurotech-vr': {
    title: 'NeuroTech, MindLift & Melodify',
    tag: 'Research',
    content: () => `
      <div class="modal-hero-img">${img('img/mindlift.jpg', 'MindLift hand-tracking prototype')}</div>

      <div class="modal-section">
        <h3>NeuroHacks Project</h3>
        <p>MindLift is a browser-based interaction prototype that uses real-time hand tracking to let players "lift" and navigate objects through increasingly complex mazes using only their hand gestures. Built with MediaPipe, the game tracks hand landmarks at low latency — pinching to grab, opening to release — while a live mirrored camera preview with rendered landmarks stays visible in the corner throughout play. An attention monitoring layer watches for prolonged downward gaze and flashes a visual warning after three seconds, keeping the experience grounded in focus and presence. Levels scale in maze density and introduce hazard zones that reset progress, rewarding sustained coordination over raw speed.</p>
        <p>Beyond the game itself, the project doubles as a modular data pipeline. Interaction metrics stream through a WebSocket-to-OSC relay to TouchDesigner and VCV Rack, enabling live audiovisual responses to player behavior — opening the door for performance art, research instrumentation, or generative sound design tied directly to hand and attention data. The architecture is deliberately layered, separating tracking, gesture logic, rendering, and bridge transport into distinct modules so each layer can be extended or swapped independently. The project sits at the intersection of attention-supportive interaction design, hand-eye coordination gameplay, and neurointeractive experience prototyping.</p>
      </div>

      <hr class="modal-rule" />

      <div class="modal-section">
        <h3>NeuroTech R&amp;D — VR Biofeedback System</h3>
        <p>At NeuroTech @ UIUC, we set out to build VR experiences that respond to your brain and body in real time — not scripted interactions, but adaptive environments driven by live physiological data. The question was: can we make neurofeedback feel like a game instead of a clinical tool?</p>
      </div>

      <div class="modal-section">
        <h3>Signal Acquisition &amp; BCI Approach</h3>
        <p>While my startup's project details are confidential, a related project of mine is based on the same idea — Neurohack Fall 2025 "MindLift." This project demonstrates a non-invasive approach to brain–computer interaction using natural micro-behavioral signals tightly coupled with cognitive intent. Instead of relying on EEG or invasive neural hardware, we use high-resolution eye movements, subtle facial muscle activations, and head gestures as a proxy for the user's internal decision-making.</p>
        <p>By turning gaze and micro-expressions into a telekinetic control system, we illustrate how future BCIs can merge computer vision, human cognition, and natural behavior to create interfaces that feel effortless and intuitive — technology responding to what you intend, not what you physically do.</p>
      </div>

      <div class="modal-section">
        <h3>Cozad New Venture Challenge</h3>
        <p>Pitched our startup's first demos of the project as "Brainstorm" at the Cozad New Venture Challenge (Spring 2025) and reached the finals. Contributed to business strategy, competitive positioning, and delivered investor-facing demo materials.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Unity', 'C#', 'Python', 'MediaPipe', 'EEG', 'Heart Rate Sensors', 'VR', 'Biosignal Processing', 'Game AI'])}
        ${linksList([
          { label: 'NeuroTech Website', url: 'https://neurotechatuiuc.com' },
          { label: 'GitHub', url: 'https://github.com/noemiamahmud/Maze-Game' }
        ])}
      </div>

      <hr class="modal-rule" />

      <div class="modal-section">
        <h3>Melodify — AI Music Generator</h3>
        <p>Melodify was one of my first hackathon projects in college — built at Dev-Ada 2024. The idea: describe a mood or scene in plain language and get original audio back. A user types a prompt like "upbeat jazz for a coffee shop morning" and the app returns a generated music clip, powered by Meta's AudioCraft MusicGen model running locally on the backend.</p>
        <div class="modal-inline-img">${img('img/melodify-1.jpg', 'Melodify interface')}</div>
      </div>

      <div class="modal-section">
        <h3>How It Works</h3>
        <p>The backend is a Flask application structured around the standard app factory pattern. A standalone MusicGen script wraps AudioCraft's generation pipeline, takes a text prompt as input, and writes the output to a generated audio folder that the Flask app then serves back to the user.</p>
        <div class="modal-inline-img">${img('img/melodify-2.jpg', 'Melodify backend structure')}</div>
      </div>

      <div class="modal-section">
        <h3>What I Learned</h3>
        <p>As one of my first end-to-end AI integrations, this project was a hands-on introduction to wiring a generative model into a real web application — handling model loading latency, serving binary audio output through a web server, and shipping something coherent under hackathon time pressure.</p>
      </div>

      <div class="modal-section">
        <h3>Melodify Tech Stack</h3>
        ${techList(['Python', 'Flask', 'Meta AudioCraft', 'MusicGen', 'HTML', 'CSS'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/melodify_noemia' }])}
      </div>
    `
  },

  'brainstorm': {
    title: 'Web-Cite — Assisted Research Tool',
    tag: 'Full Stack',
    content: () => `
      <div class="modal-hero-img">${img('img/webcite-1.jpg', 'Web-Cite citation graph')}</div>

      <div class="modal-section">
        <h3>The Problem</h3>
        <p>Academic research involves juggling dozens of papers, extracting key claims, and keeping track of which source said what. Existing tools are either too manual (spreadsheets, sticky notes) or too opaque (LLMs that hallucinate citations). We wanted something in between — a platform that helps you organize and cite, with full traceability.</p>
      </div>

      <div class="modal-section">
        <h3>How It Works</h3>
        <p>Web-Cite is a full-stack research tool built to solve a real friction point in academic work — the fragmented, time-consuming process of finding and organizing related literature. Rather than requiring users to manually chain together searches across databases, Web-Cite automates the discovery of semantically related papers and renders them as an interactive, editable citation web. A user searches PubMed, selects a root article, and the backend takes over: it fetches the article's metadata, computes a local embedding vector from the title, abstract, keywords, and MeSH terms, then searches PubMed for candidate papers, scores each by cosine similarity, and surfaces the top three to four most relevant results as a structured graph — all without any manual input beyond the initial selection.</p>
        <div class="modal-inline-img">${img('img/webcite-3.jpg', 'Semantic search results')}</div>
      </div>

      <div class="modal-section">
        <h3>Full Stack Architecture</h3>
        <p>The backend is built with a clean separation of concerns that made cross-team collaboration efficient. A Node.js/Express API handles JWT-authenticated user sessions, PubMed querying, embedding computation, and MongoDB persistence, while the frontend is given full autonomy over graph rendering — receiving structured nodes and edges arrays it can pass directly into React Flow, Cytoscape.js, or D3. Node positions default to <code>{0,0}</code> and are patchable, so layout customization is a frontend concern without any backend coupling. Users can save, revisit, edit, and delete their citation webs from a personal dashboard, making the tool useful across an entire research project rather than just a single session.</p>
      </div>

      <div class="modal-section">
        <h3>Key Distinctions</h3>
        <p>What distinguishes Web-Cite from existing tools like PubMed or EBSCO is the combination of automated semantic discovery with user-editable output. Existing citation graph tools either require users to build the web manually or produce static, non-customizable maps. Web-Cite generates the initial graph automatically from embedding similarity, then hands control back to the researcher — letting them reposition nodes, update titles, and build keyword webs that reflect their own mental model of a topic. The result is a tool that reduces the cold-start burden of literature review while preserving the researcher's agency over how their knowledge is organized.</p>
        <div class="modal-inline-img">${img('img/webcite-2.jpg', 'Editable citation web')}</div>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Node.js', 'Express', 'MongoDB', 'React', 'D3', 'Embedding Search', 'PubMed API', 'JWT Auth'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/web-cite' }])}
      </div>
    `
  },

  'melodify': {
    title: 'Melodify — AI Music Generator',
    tag: 'Hackathon',
    content: () => `
      <div class="modal-hero-img">${img('img/melodify-2.jpg', 'Melodify')}</div>

      <div class="modal-section">
        <h3>The Project</h3>
        <p>Melodify was one of my first hackathon projects in college — built at Dev-Ada 2024. The idea: describe a mood or scene in plain language and get original audio back. A user types a prompt like "upbeat jazz for a coffee shop morning" and the app returns a generated music clip, powered by Meta's AudioCraft MusicGen model running locally on the backend.</p>
      </div>

      <div class="modal-section">
        <h3>How It Works</h3>
        <p>The backend is a Flask application structured around the standard app factory pattern — routes, models, and templates organized under an <code>app/</code> directory with a <code>run.py</code> entry point. A standalone <code>MusicGen.py</code> script wraps AudioCraft's generation pipeline, takes a text prompt as input, and writes the output to a <code>generated_audio/</code> folder that the Flask app then serves back to the user.</p>
      </div>

      <div class="modal-section">
        <h3>What I Learned</h3>
        <p>As one of my first end-to-end AI integrations, this project was a hands-on introduction to wiring a generative model into a real web application — handling model loading latency, serving binary audio output through a web server, and shipping something coherent under hackathon time pressure. The AudioCraft library is vendored directly in the repo, which kept the setup self-contained and demo-ready.</p>
        <div class="modal-inline-img">${img('img/melodify-1.jpg', 'Melodify UI')}</div>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'Flask', 'Meta AudioCraft', 'MusicGen', 'HTML', 'CSS'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/melodify_noemia' }])}
      </div>
    `
  },

  'datathon': {
    title: 'Datathon — Workforce Forecasting & Optimization',
    tag: 'Hackathon',
    content: () => `
      <div class="modal-hero-img">${img('img/stats-1.jpg', 'Datathon forecasting results')}</div>

      <div class="modal-section">
        <h3>The Problem</h3>
        <p>Placed <b>3rd out of 214 teams (600+ competitors)</b> in the 2026 Illinois Statistics Datathon. The challenge: forecast inbound call volume, customer care time, and abandon rate for August 2025 across 4 client portfolios — at 30-minute granularity — and optimize staffing decisions under an asymmetric cost function where understaffing is significantly more expensive than overstaffing.</p>
      </div>

      <div class="modal-section">
        <h3>Data &amp; Approach</h3>
        <p>Worked with two years of daily call metrics and three months of high-frequency 30-minute interval data across 4 portfolios, with up to 30 missing days in some clients. Identified strong intraday structure (9–11 AM peak, near-zero overnight), day-of-week effects (Monday highest, Sunday lowest), and longer-term seasonal trends. Built preprocessing pipelines to impute gaps, encode temporal and calendar features, and align daily and interval datasets for a two-stage modeling architecture.</p>
      </div>

      <div class="modal-img-row">
        <div class="modal-inline-img">${img('img/stats-2.jpg', 'Intraday call volume structure')}</div>
        <div class="modal-inline-img">${img('img/stats-3.jpg', 'Day-of-week effects')}</div>
      </div>

      <div class="modal-section">
        <h3>Model Architecture</h3>
        <p><b>Stage 1 — Daily Forecasting (SARIMAX):</b> Trained SARIMAX(1,1,1)(1,1,1,7) models per portfolio per metric — 12 models total — using weekend, US holiday, and near-holiday exogenous regressors to forecast daily totals for call volume (CV), customer care time (CCT), and abandon rate (ABD) across all 31 days of August 2025.</p>
        <p><b>Stage 2 — Intraday Distribution (PyTorch IntradayNet):</b> A lightweight feedforward network (Linear 7→64→48 + Softmax) trained per portfolio on 90 days of interval data, mapping day-of-week one-hot encodings to 48 normalized slot weights. CV intraday forecasts use the learned weights; CCT and ABD use empirical slot-level means for greater stability.</p>
        <p>Final output: SARIMAX daily total × IntradayNet slot weights × 1.07 upward bias = 30-minute interval forecasts.</p>
      </div>

      <div class="modal-inline-img">${img('img/stats-4.jpg', 'Model architecture diagram')}</div>

      <div class="modal-section">
        <h3>Asymmetric Cost Optimization</h3>
        <p>The competition scoring penalized understaffing more heavily than overstaffing. Rather than minimizing raw forecast error, we applied a deliberate +7% upward bias to all CV forecasts post-prediction — shifting the error distribution to favor overstaffing, which carries a lower penalty. CCT and ABD were left unbiased since staffing capacity is driven by call volume alone.</p>
      </div>

      <div class="modal-img-row">
        <div class="modal-inline-img">${img('img/stats-5.jpg', 'Forecast vs actuals')}</div>
        <div class="modal-inline-img">${img('img/stats-6.jpg', 'Staffing capacity overlay')}</div>
      </div>

      <div class="modal-section">
        <h3>Results</h3>
        <p>Delivered 1,488 rows of 30-minute forecasts (31 days × 48 slots × 4 portfolios) covering CV, CCT, and ABD — 5,952 total forecast points. Translated predictions into a staffing capacity overlay flagging high-risk understaffing days as an early-warning system for SLA risk. 16 trained models total (12 SARIMAX + 4 IntradayNet), fully reproducible across a four-notebook pipeline.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['Python', 'PyTorch', 'Statsmodels (SARIMAX)', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib'])}
        ${linksList([{ label: 'View Presentation', url: 'https://mediaspace.illinois.edu/media/t/1_dmkfx20x' }])}
      </div>
    `
  },

  'code-to-cure': {
    title: 'Student Wellness — Patient-Doctor Matching',
    tag: 'Hackathon',
    content: () => `
      <div class="modal-hero-img">${img('img/bthealth-2.jpg', 'BTHealth provider matching')}</div>

      <div class="modal-section">
        <h3>The Idea</h3>
        <p>BTHealth is a full-stack mental health provider matching platform designed specifically for college students — a population that faces disproportionately high rates of mental health challenges while simultaneously navigating one of the most opaque and discouraging healthcare experiences: finding a therapist. The platform distills a typically hours-long search process into a three-step flow. Students create an account, submit a brief intake form specifying their zip code, maximum budget, and symptom selections, and receive a ranked list of providers who are available right now, priced within their means, and specialized in what they actually need. The matching algorithm enforces hard constraints — location, budget ceiling, and open patient panels — before applying a soft relevance score based on symptom overlap, so results are always actionable rather than aspirational.</p>
      </div>

      <div class="modal-section">
        <h3>Backend Architecture</h3>
        <p>The technical architecture reflects a deliberate focus on correctness and maintainability. The backend is built in Flask with SQLAlchemy handling a normalized relational schema where symptoms act as a shared vocabulary between patients and providers — linked through PatientSymptom and ProviderSpecialty junction tables — making it straightforward to extend the symptom taxonomy or add new matching criteria without restructuring the core data model. JWT authentication keeps sessions stateless, and a <code>public_id</code> UUID on the Provider model decouples internal database keys from anything exposed to the client. The React frontend communicates through a centralized fetch wrapper that handles JWT injection uniformly, keeping authentication logic out of individual page components.</p>
        <div class="modal-img-row">
          <div class="modal-inline-img">${img('img/bthealth-1.jpg', 'Intake form')}</div>
          <div class="modal-inline-img">${img('img/bthealth-3.jpg', 'Ranked provider results')}</div>
        </div>
      </div>

      <div class="modal-section">
        <h3>The Motivation</h3>
        <p>What makes BTHealth more than a filtered directory is its commitment to transparency at the point of decision. Each matched result includes a human-readable explanation of why the provider was surfaced and a clear budget label — "within your budget" or "partially within your budget" — so students never invest time in a provider only to discover a cost conflict at intake. Results are capped at ten and sorted by match score, reducing the decision paralysis that causes students to abandon their search entirely. The project is grounded in a straightforward conviction: the barrier to getting mental health care should not be the process of finding it.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['React 19', 'React Router DOM 7', 'Vite', 'Flask', 'Python', 'Flask-SQLAlchemy', 'Flask-Migrate', 'Flask-JWT-Extended', 'SQLite'])}
        ${linksList([{ label: 'GitHub', url: 'https://github.com/noemiamahmud/Code-ADA-2024-For_Portfolio' }])}
      </div>
    `
  },

  'neurotech-site': {
    title: 'NeuroTech @ UIUC Website',
    tag: 'Web Development',
    content: () => `
      <div class="modal-section">
        <h3>My Role</h3>
        <p>As Webmaster for NeuroTech @ UIUC, I designed and built the club's public-facing website from scratch — creating a central hub to connect students with opportunities in neurotechnology, showcase ongoing research projects, and drive membership recruitment.</p>
      </div>

      <div class="modal-section">
        <h3>Live Preview</h3>
        <iframe src="https://neurotechatuiuc.com/" class="modal-iframe" title="NeuroTech @ UIUC live preview" loading="lazy"></iframe>
      </div>

      <div class="modal-section">
        <h3>What I Built</h3>
        <p>The site spans eight pages covering the club's mission, active projects, upcoming events, team roster, a member matching feature, and a join flow. Each page was designed to be immediately legible to someone encountering NeuroTech for the first time — whether a curious freshman or a faculty collaborator — while giving current members a reliable place to stay connected.</p>
      </div>

      <div class="modal-section">
        <h3>Implementation</h3>
        <p>Built entirely with vanilla HTML, CSS, and JavaScript — no frameworks or build tooling — keeping the site lightweight, easy to hand off, and maintainable by future officers. Fully responsive across desktop and mobile with consistent branding throughout.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['HTML', 'CSS', 'JavaScript', 'Responsive Design'])}
        ${linksList([
          { label: 'GitHub', url: 'https://github.com/noemiamahmud/Neurotech' },
          { label: 'Visit Site', url: 'https://neurotechatuiuc.com' }
        ])}
      </div>
    `
  },

  'illini-speed': {
    title: 'IlliniSpeed — Single Page Website',
    tag: 'Web Development',
    content: () => `
      <div class="modal-section">
        <h3>About the Project</h3>
        <p>IlliniSpeed is a fully hand-coded single-page website built for CS 409 (Web Programming) at UIUC. The assignment required implementing a comprehensive set of frontend features from scratch — no libraries, no Bootstrap, no jQuery — using only HTML5, SCSS, and vanilla JavaScript.</p>
      </div>

      <div class="modal-section">
        <h3>Live Preview</h3>
        <iframe src="https://noemiamahmud.github.io/illinispeed/" class="modal-iframe" title="IlliniSpeed live preview" loading="lazy"></iframe>
      </div>

      <div class="modal-section">
        <h3>What I Built</h3>
        <p>The site implements a full suite of interactive UI features: a sticky navbar that resizes on scroll with an active section position indicator, smooth scrolling navigation, a multi-slide carousel with arrow controls, modal windows, an embedded HTML5 video, fixed-position background images, a multi-column layout, and CSS3 animations. All content is fully responsive across four target resolutions from 1024x768 up to 1920x1080.</p>
      </div>

      <div class="modal-section">
        <h3>Implementation</h3>
        <p>Built with SCSS (using variables and mixins as required), ES6 JavaScript, and semantic HTML5. Bundled with Webpack and deployed via GitHub Actions to GitHub Pages. No inline styles, no inline scripts, and no table-based layouts — all layout and interactivity written by hand against the spec.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['HTML5', 'SCSS', 'JavaScript (ES6)', 'Webpack', 'Babel', 'GitHub Actions', 'GitHub Pages'])}
        ${linksList([
          { label: 'GitHub', url: 'https://github.com/noemiamahmud/illinispeed' },
          { label: 'Live Site', url: 'https://noemiamahmud.github.io/illinispeed' }
        ])}
      </div>
    `
  },

  'wece-hacks': {
    title: 'WECE Hacks 2025 Website',
    tag: 'Web Development',
    content: () => `
      <div class="modal-section">
        <h3>The Event</h3>
        <p>WECE Hacks is a three-day hackathon hosted by Women in Electrical and Computer Engineering at UIUC, open to all majors and genders. The 2025 event ran February 21-23 in the ECE Building and featured hardware, software, and cybersecurity (CTF) challenges — with workshops, sponsor networking, and a closing demo day. Sponsors included Union Pacific, Collins Aerospace, Marvell, and National Instruments.</p>
      </div>

      <div class="modal-section">
        <h3>Live Preview</h3>
        <iframe src="https://noemiamahmud.github.io/wecehacks.github.io/" class="modal-iframe" title="WECE Hacks 2025 live preview" loading="lazy"></iframe>
      </div>

      <div class="modal-section">
        <h3>Website</h3>
        <p>I built and maintained the event website as the single source of truth for participants. The site covers registration, a live countdown timer, the full three-day schedule, sponsor recognition, an FAQ, and a curated tools and resources section to help first-time hackers get set up with VS Code, Git, and GitHub before arriving.</p>
      </div>

      <div class="modal-section">
        <h3>Event Operations</h3>
        <p>As Operations Lead, I coordinated the full event experience — from pre-event registration and team formation logistics through day-of check-in, workshop flow, hacking periods, and final presentations. The event ran across three days with structured workshops in hardware and software, an open working period with a sponsor tech table, and a Sunday CTF co-organized with SIGPwny.</p>
      </div>

      <div class="modal-section">
        <h3>Tech Stack</h3>
        ${techList(['HTML', 'CSS', 'JavaScript', 'GitHub Pages'])}
        ${linksList([
          { label: 'GitHub', url: 'https://github.com/noemiamahmud/wecehacks.github.io' },
          { label: 'Visit Site', url: 'https://noemiamahmud.github.io/wecehacks.github.io/' }
        ])}
      </div>
    `
  },

  'misc': {
    title: 'Short Track Speed Skating',
    tag: 'Beyond Code',
    content: () => `
      <div class="modal-hero-img">${img('img/skate-1.jpg', 'Short track speed skating')}</div>

      <div class="modal-section">
        <h3>The Sport</h3>
        <p>Short track speed skating is one of the most explosive and tactical ice sports in the world — races happen on a 111-meter oval, skaters reach speeds over 30 mph, and positioning matters as much as raw speed. I've been competing since childhood, and the sport has shaped how I approach everything — from problem-solving under pressure to leading teams.</p>
      </div>

      <div class="modal-section">
        <h3>Competitive Career</h3>
        <p>Throughout high school, I competed at the national level in short track speed skating, earning a national ranking and setting state records. The training was year-round — on-ice technique sessions, off-ice conditioning, and race strategy review. Competing at that level taught me discipline, how to perform under pressure, and how to recover from setbacks quickly.</p>
        <div class="modal-img-row">
          <div class="modal-inline-img">${img('img/skate-2.jpg', 'Racing')}</div>
          <div class="modal-inline-img">${img('img/skate-3.jpg', 'Competition')}</div>
        </div>
      </div>

      <div class="modal-section">
        <h3>State Records &amp; National Ranking</h3>
        <p>Held state records and achieved a national ranking that placed me among the top competitors in my age group. Every record came from months of incremental improvement — shaving fractions of a second through better crossover technique, sharper cornering, and smarter race tactics.</p>
        <div class="modal-inline-img">${img('img/skate-4.jpg', 'On the podium')}</div>
      </div>

      <div class="modal-section">
        <h3>Transition to College</h3>
        <p>Coming to UIUC, I transitioned from competitor to community builder. I helped found our Illini speed skating student organization and took on leadership and organizing roles — coordinating practice schedules, recruiting new skaters, and running events to grow the sport on campus.</p>
        <div class="modal-img-row">
          <div class="modal-inline-img">${img('img/skate-5.jpg', 'Illini speed skating')}</div>
          <div class="modal-inline-img">${img('img/skate-6.jpg', 'Team')}</div>
        </div>
      </div>

      <div class="modal-section">
        <h3>What Skating Taught Me</h3>
        <p>Speed skating is a sport of margins — the difference between first and fourth is often hundredths of a second. That mentality carries into everything I do: attention to detail, relentless iteration, and the understanding that consistent effort compounds. The resilience and focus I built on the ice directly translate to how I approach engineering problems and team leadership.</p>
      </div>
    `
  }
};

/* ===== 13. FILTERS ===== */
(function filters() {
  const btns = $$('.filter-btn');
  const cards = $$('.card[data-category]');
  if (!btns.length || !cards.length) return;
  const empty = $('.empty-state');

  // Live counts per category, derived from the DOM.
  btns.forEach(btn => {
    const f = btn.dataset.filter;
    const n = f === 'all' ? cards.length : cards.filter(c => c.dataset.category === f).length;
    const small = btn.querySelector('small');
    if (small) small.textContent = String(n);
  });

  function apply(filter, push = true) {
    let shown = 0;
    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        shown++;
        card.classList.remove('is-filtering');
        void card.offsetWidth;          // restart the entry animation
        card.classList.add('is-filtering');
      }
    });
    btns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    if (empty) empty.hidden = shown > 0;

    if (push) {
      const url = new URL(window.location);
      if (filter === 'all') url.searchParams.delete('filter');
      else url.searchParams.set('filter', filter);
      history.replaceState(null, '', url);
    }
  }

  btns.forEach(btn => btn.addEventListener('click', () => apply(btn.dataset.filter)));

  const initial = new URL(window.location).searchParams.get('filter');
  if (initial && btns.some(b => b.dataset.filter === initial)) apply(initial, false);
})();

/* ===== 14. MODAL ===== */
const Modal = (function () {
  const overlay = $('#project-modal');
  if (!overlay) return { open() {}, close() {} };

  const scroll = $('.modal-scroll', overlay);
  const body = $('#modal-body', overlay);
  const crumb = $('.modal-crumb', overlay);
  const closeBtn = $('.modal-close', overlay);
  const prevBtn = $('.modal-prev', overlay);
  const nextBtn = $('.modal-next', overlay);

  // Order follows the cards as they appear on the page.
  const order = $$('.card[data-project]').map(c => c.dataset.project).filter(k => projectData[k]);
  let current = null;
  let lastFocus = null;

  function render(key) {
    const data = projectData[key];
    if (!data) return;
    current = key;
    body.innerHTML = `
      <h2 class="modal-title">${data.title}</h2>
      <span class="modal-tag">${data.tag}</span>
      ${data.content()}
    `;
    if (crumb) crumb.textContent = `~/projects/${key}`;
    scroll.scrollTop = 0;
    const i = order.indexOf(key);
    if (prevBtn) prevBtn.disabled = i <= 0;
    if (nextBtn) nextBtn.disabled = i === -1 || i >= order.length - 1;
  }

  function open(key, pushHash = true) {
    if (!projectData[key]) return;
    lastFocus = document.activeElement;
    render(key);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (pushHash) history.replaceState(null, '', `#${key}`);
    setTimeout(() => closeBtn && closeBtn.focus(), 60);
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    current = null;
    // Stop any playing media inside the modal.
    $$('video', body).forEach(v => v.pause());
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus) lastFocus.focus();
  }

  function step(dir) {
    const i = order.indexOf(current);
    const next = order[i + dir];
    if (next) { render(next); history.replaceState(null, '', `#${next}`); }
  }

  $$('.card[data-project]').forEach(card => {
    card.addEventListener('click', () => open(card.dataset.project));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card.dataset.project); }
    });
  });

  closeBtn && closeBtn.addEventListener('click', close);
  prevBtn && prevBtn.addEventListener('click', () => step(-1));
  nextBtn && nextBtn.addEventListener('click', () => step(1));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
    // Keep focus inside the dialog.
    if (e.key === 'Tab') {
      const f = $$('a[href], button:not([disabled]), iframe, video, [tabindex]:not([tabindex="-1"])', overlay)
        .filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Deep link: projects.html#datathon opens that modal.
  const hash = location.hash.slice(1);
  if (hash && projectData[hash]) setTimeout(() => open(hash, false), 260);

  return { open, close };
})();

/* ===== 15. COMMAND PALETTE ===== */
(function palette() {
  const root = $('#cmdk');
  if (!root) return;

  const input = $('.cmdk-input input', root);
  const list = $('.cmdk-list', root);
  const onProjects = /projects\.html$/.test(location.pathname) || $('#project-modal');

  const ico = {
    page:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    project: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>',
    action:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m13 2-3 8h6l-3 12"/></svg>'
  };

  const items = [
    { group: 'Navigate', label: 'Home',     icon: ico.page, run: () => (location.href = 'index.html') },
    { group: 'Navigate', label: 'Projects', icon: ico.page, run: () => (location.href = 'projects.html') },
    { group: 'Navigate', label: 'Contact',  icon: ico.page, run: () => (location.href = 'contact.html') },
    ...Object.entries(projectData).map(([key, p]) => ({
      group: 'Projects',
      label: p.title,
      hint: p.tag,
      icon: ico.project,
      run: () => {
        if (onProjects) Modal.open(key);
        else location.href = `projects.html#${key}`;
      }
    })),
    {
      group: 'Actions', label: 'Copy email address', hint: 'noemiamahmud@gmail.com', icon: ico.action,
      run: () => copyText('noemiamahmud@gmail.com', 'Email copied to clipboard')
    },
    {
      group: 'Actions', label: 'Open résumé', icon: ico.action,
      run: () => window.open('https://drive.google.com/file/d/1A1NljpuVGNJXSzq9t0e5LR1JS9-0WDPu/view?usp=sharing', '_blank', 'noopener')
    },
    { group: 'Actions', label: 'GitHub profile',   icon: ico.action, run: () => window.open('https://github.com/noemiamahmud', '_blank', 'noopener') },
    { group: 'Actions', label: 'LinkedIn profile', icon: ico.action, run: () => window.open('https://www.linkedin.com/in/noemia-mahmud-71b5b82b6/', '_blank', 'noopener') },
    { group: 'Actions', label: 'Toggle theme', hint: 'light / dark', icon: ico.action, run: () => $('#theme-toggle').click() }
  ];

  let results = items;
  let active = 0;

  function draw() {
    if (!results.length) {
      list.innerHTML = '<div class="cmdk-empty">No results</div>';
      return;
    }
    let html = '', group = '';
    results.forEach((item, i) => {
      if (item.group !== group) {
        group = item.group;
        html += `<div class="cmdk-group">${group}</div>`;
      }
      html += `<button class="cmdk-item" role="option" data-i="${i}" aria-selected="${i === active}">
        <span class="ci-ico">${item.icon}</span>
        <span>${item.label}</span>
        ${item.hint ? `<span class="hint">${item.hint}</span>` : ''}
      </button>`;
    });
    list.innerHTML = html;
    const sel = list.querySelector('[aria-selected="true"]');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function search(q) {
    const s = q.trim().toLowerCase();
    results = s
      ? items.filter(i => (i.label + ' ' + (i.hint || '') + ' ' + i.group).toLowerCase().includes(s))
      : items;
    active = 0;
    draw();
  }

  function open() {
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
    input.value = '';
    search('');
    setTimeout(() => input.focus(), 40);
  }
  function close() {
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      root.classList.contains('open') ? close() : open();
      return;
    }
    if (!root.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % results.length; draw(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + results.length) % results.length; draw(); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[active];
      if (item) { close(); item.run(); }
    }
  });

  input.addEventListener('input', () => search(input.value));
  list.addEventListener('click', e => {
    const btn = e.target.closest('.cmdk-item');
    if (!btn) return;
    const item = results[+btn.dataset.i];
    close();
    item.run();
  });
  list.addEventListener('mousemove', e => {
    const btn = e.target.closest('.cmdk-item');
    if (btn && +btn.dataset.i !== active) { active = +btn.dataset.i; draw(); }
  });
  root.addEventListener('click', e => { if (e.target === root) close(); });
  $$('[data-open-cmdk]').forEach(b => b.addEventListener('click', open));
})();

/* ===== 16. COPY / TOAST ===== */
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2200);
}

async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(msg || 'Copied');
    return true;
  } catch (e) {
    // Fallback for non-secure contexts (e.g. file://).
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast(msg || 'Copied'); } catch (_) { toast('Copy failed'); }
    ta.remove();
    return false;
  }
}

$$('[data-copy]').forEach(btn => {
  btn.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();
    await copyText(btn.dataset.copy, 'Copied to clipboard');
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1600);
  });
});

/* ===== 17. CONTACT FORM ===== */
(function contactForm() {
  const form = $('#contact-form');
  if (!form) return;
  const status = $('#form-status');
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.textContent;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        status.className = 'form-status ok';
        status.textContent = '✓ Message sent — I\'ll get back to you soon.';
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.errors ? data.errors.map(x => x.message).join(', ') : 'Send failed');
      }
    } catch (err) {
      status.className = 'form-status err';
      status.textContent = '✕ ' + err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();

/* ===== 18. HERO ENTRANCE ===== */
window.addEventListener('DOMContentLoaded', () => {
  const hero = $('.hero');
  if (hero) requestAnimationFrame(() => hero.classList.add('ready'));
});
