import {
  profile, email, whatsappUrl, stack, acts, stepStatus, journey, stages, projects, ui, en,
} from './content.js';

document.documentElement.classList.add('js');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pick = (v, l = lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[l] ?? v.pt : v);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 1025px)');
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const store = {
  get: (k, s = localStorage) => { try { return s.getItem(k); } catch { return null; } },
  set: (k, v, s = localStorage) => { try { s.setItem(k, v); } catch { /* storage blocked */ } },
};

let lang = 'pt';

/* ------------------------------------------------------------------ i18n */

const ptHTML = new Map();
const ptAttr = new Map();

function captureDefaults() {
  $$('[data-i18n]').forEach((el) => ptHTML.set(el, el.innerHTML));
  $$('[data-i18n-attr]').forEach((el) => {
    const saved = {};
    el.dataset.i18nAttr.split(';').forEach((pair) => { const [a] = pair.split(':'); saved[a] = el.getAttribute(a); });
    ptAttr.set(el, saved);
  });
  $$('[data-i18n-content]').forEach((el) => ptAttr.set(el, { content: el.getAttribute('content') }));
}

function initialLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'pt' || q === 'en') return q;
  const saved = store.get('lang');
  if (saved === 'pt' || saved === 'en') return saved;
  return (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

function applyLang(next, { initial = false } = {}) {
  lang = next;
  const isEn = lang === 'en';
  document.documentElement.lang = isEn ? 'en' : 'pt-BR';

  $$('[data-i18n]').forEach((el) => {
    const k = el.dataset.i18n;
    el.innerHTML = isEn && en[k] != null ? en[k] : ptHTML.get(el);
  });
  $$('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [a, k] = pair.split(':');
      el.setAttribute(a, isEn && en[k] != null ? en[k] : ptAttr.get(el)[a]);
    });
  });
  $$('[data-i18n-content]').forEach((el) => {
    const k = el.dataset.i18nContent;
    el.setAttribute('content', isEn && en[k] != null ? en[k] : ptAttr.get(el).content);
  });
  $$('[data-lang-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.langBtn === lang)));

  applyLinks();
  renderArsenal();
  renderJourney();
  renderOpus();
  renderChannels();
  splitStatement();
  observeReveals(document, initial);
  trackJourney();
  if (!initial) { store.set('lang', lang); requestUpdate(); }
}

/* ----------------------------------------------------------------- links */

function applyLinks() {
  const cv = profile.cv[lang];
  $$('[data-cv-link]').forEach((a) => { a.href = cv; a.setAttribute('download', cv.split('/').pop()); });
  $$('[data-wa-link]').forEach((a) => { a.href = whatsappUrl(lang); });
  $$('[data-gh-link]').forEach((a) => { a.href = `https://github.com/${profile.github}`; });
  $$('[data-li-link]').forEach((a) => { a.href = profile.linkedin; });
  $$('[data-email-link]').forEach((a) => { a.href = `mailto:${email()}`; a.textContent = email(); });
  $$('[data-copy-email]').forEach((b) => { b.textContent = ui[lang].copy; });
  $$('[data-mod]').forEach((k) => { k.textContent = isMac ? '⌘' : 'Ctrl'; });
}

/* ------------------------------------------------------------- renderers */

function renderArsenal() {
  const root = $('[data-arsenal]');
  if (!root) return;
  let n = 0;
  root.innerHTML = stack.map((g) => `
    <article class="element" data-reveal>
      <header class="element__head">
        <svg class="element__glyph" aria-hidden="true"><use href="#el-${g.el}"/></svg>
        <h3 class="element__name">${esc(pick(g.name))}</h3>
        <p class="element__domain mono">${esc(pick(g.domain))}</p>
        <p class="element__note">${esc(pick(g.note))}</p>
      </header>
      <ul class="tiles">
        ${g.items.map((it) => {
          n += 1;
          return `<li class="tile">
            <span class="tile__n" aria-hidden="true">${String(n).padStart(2, '0')}</span>
            <svg class="tile__el" aria-hidden="true"><use href="#el-${g.el}"/></svg>
            <span class="tile__sym" aria-hidden="true">${esc(it.sym)}</span>
            <span class="tile__name">${esc(pick(it.name))}</span>
            <span class="tile__detail">${esc(pick(it.detail))}</span>
          </li>`;
        }).join('')}
      </ul>
    </article>`).join('');
}

function renderJourney() {
  const list = $('[data-journey]');
  if (!list) return;
  let html = '';
  let last = null;
  journey.forEach((s, i) => {
    if (s.act !== last) {
      const inAct = journey.filter((x) => x.act === s.act);
      html += `<li class="act mono" data-reveal><span>${esc(pick(acts[s.act]))}</span><span class="dim">${inAct[0].n} — ${inAct[inAct.length - 1].n}</span></li>`;
      last = s.act;
    }
    html += `<li class="step" data-step="${i}" data-reveal>
      <span class="step__n">${s.n}</span>
      <div>
        <div class="step__head">
          <div>
            <h3 class="step__title">${esc(pick(s.title))}</h3>
            <p class="step__meta mono">${esc(pick(s.meta))}</p>
          </div>
          <span class="chip chip--${s.status}">${esc(pick(stepStatus[s.status]))}</span>
        </div>
        <p class="step__text">${esc(pick(s.text))}</p>
      </div>
    </li>`;
  });
  list.innerHTML = html;
}

function starPath(cx, cy, R, r, points = 4) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = (Math.PI / points) * i - Math.PI / 2;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
}

function buildCircles() {
  const svg = $('[data-circles]');
  if (!svg) return;
  let out = '<line class="ring-axis" x1="450" y1="10" x2="450" y2="890"/>';
  journey.forEach((s, i) => { out += `<circle class="ring ring--${s.status}" data-ring="${i}" cx="450" cy="450" r="${420 - i * 45}"/>`; });
  journey.forEach((s, i) => {
    const y = 450 - (420 - i * 45);
    const w = 16 + s.n.length * 11;
    out += `<rect class="ring-num-bg" x="${450 - w / 2}" y="${y - 14}" width="${w}" height="28"/>`;
    out += `<text class="ring-num" data-ring-num="${i}" x="450" y="${y + 7}" text-anchor="middle">${s.n}</text>`;
  });
  out += `<path class="ring-star" data-ring-star d="${starPath(450, 450, 16, 3.5)}"/>`;
  svg.innerHTML = out;
}

function renderOpus() {
  const legend = $('[data-stages]');
  const list = $('[data-opus]');
  if (!list) return;
  legend.innerHTML = Object.entries(stages).map(([k, s]) => `<li><span class="swatch swatch--${k}"></span>${s.name}<span class="dim">— ${esc(pick(s.meaning))}</span></li>`).join('');
  list.innerHTML = projects.map((p, i) => `
    <li class="work" data-reveal>
      <span class="work__n">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <h3 class="work__title">${esc(pick(p.title))}</h3>
        <p class="work__org mono">${esc(pick(p.org))} · ${p.year}</p>
      </div>
      <p class="work__desc">${esc(pick(p.desc))}</p>
      <div class="work__side">
        <span class="stage-badge mono"><span class="swatch swatch--${p.stage}"></span>${stages[p.stage].name} <span class="dim">· ${esc(pick(stages[p.stage].meaning))}</span></span>
        <ul class="tags">${p.tags.map((t) => `<li>${esc(pick(t))}</li>`).join('')}</ul>
        ${p.note ? `<p class="work__note mono">${esc(pick(p.note))}</p>` : ''}
      </div>
    </li>`).join('');
}

function renderChannels() {
  const root = $('[data-channels]');
  if (!root) return;
  const cv = profile.cv[lang];
  const rows = [
    { k: 'WhatsApp', v: profile.phoneDisplay, href: whatsappUrl(lang), ext: true },
    { k: 'LinkedIn', v: profile.linkedinHandle, href: profile.linkedin, ext: true },
    { k: 'GitHub', v: `@${profile.github}`, href: `https://github.com/${profile.github}`, ext: true },
    profile.instagram && { k: 'Instagram', v: `@${profile.instagram}`, href: `https://www.instagram.com/${profile.instagram}/`, ext: true },
    { k: lang === 'en' ? 'Résumé' : 'Currículo', v: lang === 'en' ? 'PDF · English' : 'PDF · Português', href: cv, download: cv.split('/').pop() },
  ].filter(Boolean);
  root.innerHTML = rows.map((r) => `
    <li data-reveal>
      <a class="channel" href="${esc(r.href)}"${r.ext ? ' target="_blank" rel="noopener"' : ''}${r.download ? ` download="${esc(r.download)}"` : ''}>
        <span class="channel__k">${esc(r.k)}</span>
        <span class="channel__v">${esc(r.v)}</span>
        <span class="channel__a" aria-hidden="true">${r.download ? '↓' : '↗'}</span>
      </a>
    </li>`).join('');
}

/* -------------------------------------------------------------- reveals */

let revealIO;
function observeReveals(scope = document, immediate = false) {
  const els = $$('[data-reveal]:not(.is-in)', scope);
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  if (!revealIO) {
    revealIO = new IntersectionObserver((entries) => {
      const shown = entries.filter((e) => e.isIntersecting);
      shown.forEach((e, i) => {
        e.target.style.setProperty('--d', `${Math.min(i, 5) * 0.08}s`);
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }
  els.forEach((el) => {
    // after a language switch, whatever is already on screen shows at once
    if (!immediate) {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) { el.classList.add('is-in'); return; }
    }
    revealIO.observe(el);
  });
}

/* ------------------------------------------------------- hero: name fit */

function splitName() {
  const el = $('[data-fit]');
  if (!el || el.dataset.split) return;
  const text = el.textContent.trim();
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const outer = document.createElement('span');
    outer.className = 'ch';
    outer.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.textContent = ch;
    inner.style.setProperty('--i', i);
    outer.appendChild(inner);
    el.appendChild(outer);
  });
  el.dataset.split = '1';
}

// same breakpoint as the stacked hero in style.css
const stackedHero = matchMedia('(max-width: 899px), (orientation: portrait) and (max-width: 1180px), (max-height: 599px)');
const CHIN = 0.54; // chin height in the portrait crop, from the top

function fitName() {
  const el = $('[data-fit]');
  if (!el) return;
  const wrap = el.parentElement;
  const cs = getComputedStyle(wrap);
  const avail = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  el.style.fontSize = '100px';
  el.style.display = 'inline-block';
  const box = el.getBoundingClientRect();
  el.style.display = '';
  let size = (100 * avail) / box.width;

  // Poster layout: the portrait stands on the hero floor and the name sits just above the bar,
  // so on short screens the width-fitted name would climb over the face. Cap it below the chin.
  if (!stackedHero.matches) {
    const portrait = $('.hero__portrait').getBoundingClientRect().height;
    const bar = $('.hero__bar');
    const barH = bar.offsetHeight + parseFloat(getComputedStyle(bar).marginTop);
    const perPx = box.height / 100; // name block height per px of font size
    const room = portrait * (1 - CHIN) - barH;
    size = Math.min(size, room / Math.max(0.4, perPx - 0.1));
  }
  el.style.fontSize = `${Math.max(40, size)}px`;
}

/* --------------------------------------------------------- intro loader */

function intro() {
  const count = $('[data-count]');
  const seen = store.get('intro', sessionStorage);
  const minDur = reduced ? 0 : seen ? 350 : 1300;
  const t0 = performance.now();
  const img = $('.hero__img--mono');
  const imgReady = new Promise((res) => {
    if (img.complete) res();
    else { img.addEventListener('load', res, { once: true }); img.addEventListener('error', res, { once: true }); }
  });
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  if (minDur && count) {
    const tick = (now) => {
      const p = clamp((now - t0) / minDur, 0, 1);
      count.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    fitName();
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    store.set('intro', '1', sessionStorage);
    setTimeout(() => $('.loader')?.remove(), 1200);
  };
  Promise.all([Promise.race([Promise.all([fonts, imgReady]), wait(3500)]), wait(minDur)]).then(finish);
}

/* ------------------------------------------------------ scroll-driven bits */

const S = { A: [40, 362], B: [600, 70], r: 31 };
S.len = Math.hypot(S.B[0] - S.A[0], S.B[1] - S.A[1]);
S.u = [(S.B[0] - S.A[0]) / S.len, (S.B[1] - S.A[1]) / S.len];
S.n = [S.u[1], -S.u[0]]; // normal pointing up the hill
S.angle = (Math.atan2(S.u[1], S.u[0]) * 180) / Math.PI;
const slopeMarks = [['commit', 0.18], ['review', 0.4], ['build', 0.62], ['deploy', 0.84]];

function buildSlope() {
  const g = $('[data-slope-marks]');
  if (!g) return;
  g.innerHTML = slopeMarks.map(([label, f]) => {
    const s = f * S.len;
    const x = S.A[0] + S.u[0] * s;
    const y = S.A[1] + S.u[1] * s;
    const tx = x - S.n[0] * 10;
    const ty = y - S.n[1] * 10;
    const lx = x - S.n[0] * 26;
    const ly = y - S.n[1] * 26;
    return `<line class="slope-tick" x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}"/>
      <text class="label slope-label" data-at="${f}" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" transform="rotate(${S.angle.toFixed(2)} ${lx.toFixed(1)} ${ly.toFixed(1)})">${label}</text>`;
  }).join('');
}

let words = [];
let lastLit = -1;
function splitStatement() {
  const el = $('[data-statement]');
  if (!el) return;
  const walk = (node) => {
    [...node.childNodes].forEach((ch) => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.textContent = part;
          frag.appendChild(w);
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1) walk(ch);
    });
  };
  walk(el);
  words = $$('.w', el);
  lastLit = -1;
}

const nav = $('[data-nav]');
let lastY = scrollY;
let idle;
let ticking = false;
function requestUpdate() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

function update() {
  ticking = false;
  const vh = innerHeight;
  const y = scrollY;

  // nav: hide while scrolling down, come back on the way up or when idle
  nav.classList.toggle('is-scrolled', y > 24);
  if (y > lastY + 4 && y > 240 && !document.body.classList.contains('menu-open')) nav.classList.add('is-hidden');
  else if (y < lastY - 4) nav.classList.remove('is-hidden');
  lastY = y;
  clearTimeout(idle);
  idle = setTimeout(() => nav.classList.remove('is-hidden'), 900);

  // hero parallax
  if (!reduced && y < vh * 1.3) {
    const pic = $$('.hero__portrait picture');
    pic.forEach((p) => { p.style.translate = `0 ${(y * 0.1).toFixed(1)}px`; });
    const halo = $('.halo');
    if (halo) halo.style.rotate = `${(y * 0.04).toFixed(2)}deg`;
  }

  // statement lights up word by word
  const st = $('[data-statement]');
  if (st && words.length) {
    const r = st.getBoundingClientRect();
    const p = reduced ? 1 : clamp((vh * 0.86 - r.top) / (r.height + vh * 0.32), 0, 1);
    const lit = Math.round(p * words.length);
    if (lit !== lastLit) {
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
      lastLit = lit;
    }
  }

  // Sisyphus pushes the boulder as you read
  const grid = $('.manifesto__grid');
  const boulder = $('[data-boulder]');
  if (grid && boulder) {
    const r = grid.getBoundingClientRect();
    const p = clamp((vh * 0.82 - r.top) / Math.max(1, r.height - vh * 0.25), 0, 1);
    const s = 28 + p * (S.len - 70);
    const x = S.A[0] + S.u[0] * s + S.n[0] * S.r;
    const yy = S.A[1] + S.u[1] * s + S.n[1] * S.r;
    boulder.setAttribute('transform', `translate(${x.toFixed(1)} ${yy.toFixed(1)}) rotate(${((s / S.r) * 57.2958).toFixed(1)})`);
    $$('.slope-label').forEach((t) => t.classList.toggle('is-passed', p >= Number(t.dataset.at)));
  }
}

/* ----------------------------------------------------- journey tracking */

let stepIO;
let activeStep = 0;
function setActiveStep(i) {
  activeStep = i;
  $$('.step').forEach((el) => el.classList.toggle('is-active', Number(el.dataset.step) === i));
  $$('[data-ring]').forEach((c) => {
    const k = Number(c.dataset.ring);
    c.classList.toggle('is-active', k === i);
    c.classList.toggle('is-past', k < i);
  });
  $$('[data-ring-num]').forEach((t) => t.classList.toggle('is-active', Number(t.dataset.ringNum) === i));
  $('[data-ring-star]')?.classList.toggle('is-active', i === journey.length - 1);
}
function trackJourney() {
  const section = $('.journey');
  if (!section) return;
  section.classList.toggle('is-tracking', desktop.matches && !reduced);
  stepIO?.disconnect();
  stepIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActiveStep(Number(e.target.dataset.step)); });
  }, { rootMargin: '-46% 0px -46% 0px' });
  $$('.step').forEach((el) => stepIO.observe(el));
  setActiveStep(activeStep);
}

/* ------------------------------------------------------------- sections */

function sectionSpy() {
  const links = $$('[data-section-link]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a.dataset.sectionLink === e.target.id));
    });
  }, { rootMargin: '-42% 0px -56% 0px' });
  $$('[data-section]').forEach((s) => io.observe(s));
  new IntersectionObserver(([e]) => { if (e.isIntersecting) links.forEach((a) => a.classList.remove('is-active')); }, { rootMargin: '-42% 0px -56% 0px' }).observe($('#top'));
}

/* ------------------------------------------------------------------ menu */

function menu() {
  const m = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  const open = () => {
    m.hidden = false;
    requestAnimationFrame(() => m.classList.add('is-open'));
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus({ preventScroll: true });
  };
  const close = () => {
    m.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    document.body.style.overflow = '';
    setTimeout(() => { if (!m.classList.contains('is-open')) m.hidden = true; }, 500);
  };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  $$('[data-menu-link]', m).forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !m.hidden) close(); });
}

/* ------------------------------------------------------------ utilities */

let toastT;
function toast(msg) {
  const t = $('[data-toast]');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('is-on'), 2400);
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email());
    toast(`${ui[lang].copied} — ${email()}`);
  } catch {
    location.href = `mailto:${email()}`;
  }
}

function downloadCV() {
  const a = document.createElement('a');
  a.href = profile.cv[lang];
  a.download = profile.cv[lang].split('/').pop();
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const openExt = (url) => window.open(url, '_blank', 'noopener');
const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

function clock() {
  const el = $('[data-clock]');
  if (!el) return;
  const f = new Intl.DateTimeFormat('pt-BR', { timeZone: profile.timezone, hour: '2-digit', minute: '2-digit' });
  const tick = () => { el.textContent = f.format(new Date()); };
  tick();
  setInterval(tick, 15000);
}

function spinHalo() {
  const h = $('.halo');
  h?.classList.add('is-fast');
  setTimeout(() => h?.classList.remove('is-fast'), 3000);
}

/* -------------------------------------------------------------- terminal */

const quotes = {
  pt: [
    '“É preciso imaginar Sísifo feliz.” — Albert Camus',
    '“O que está em cima é como o que está embaixo.” — Hermes Trismegisto',
    '“Conhece-te a ti mesmo.” — Oráculo de Delfos, sobre code review',
    '“O fim é o começo.” — o ouroboros, sobre refatoração',
    '“Solve et coagula.” — dissolver o problema, recompor a solução',
  ],
  en: [
    '“One must imagine Sisyphus happy.” — Albert Camus',
    '“As above, so below.” — Hermes Trismegistus',
    '“Know thyself.” — the Oracle of Delphi, on code review',
    '“The end is the beginning.” — the ouroboros, on refactoring',
    '“Solve et coagula.” — dissolve the problem, recombine the solution',
  ],
};

const termText = {
  pt: {
    help: [
      'comandos disponíveis:',
      '  whoami       quem sou eu',
      '  sobre        resumo profissional',
      '  stack        tecnologias e níveis',
      '  exp          experiência',
      '  projetos     obras em andamento',
      '  git log      a jornada em commits',
      '  contato      canais diretos',
      '  cv           baixar currículo (pdf)',
      '  filosofia    uma citação ao acaso',
      '  lang         trocar idioma',
      '  clear        limpar a tela',
      '  sudo contratar',
    ],
    whoami: ['henrique valois — engenheiro de software jr.', 'full-stack · automação · ia — capim grosso, ba'],
    sobre: [
      'dev full-stack: sistemas web de ponta a ponta, segurança em múltiplas camadas (rls no',
      'postgresql), integrações via api e automações em n8n. back-end com java e aws.',
      'ads na ages, conclusão em 2028. objetivo: engenharia de software em escala.',
    ],
    exp: [
      '06/2026 — hoje   desenvolvedor júnior @ grupo sing',
      '                 erp modular · rls · rd station · meta ads',
      '2025             analista, setor técnico @ capim solar',
      '                 documentação de projetos de microgeração',
    ],
    log: [
      '* a7f3c21 (HEAD -> main) feat: dev jr. @ grupo sing — erp, rls, integrações',
      '* 5d1e9b0 feat: java & aws — back-end e nuvem',
      '* 3c2b8f4 chore: ads @ ages — 2º semestre',
      '* 9e40a17 feat: automações n8n — leads em tempo real',
      '* 61f0c3d docs: setor técnico @ capim solar',
      '* 0000001 init: hello, world — capim grosso, ba',
    ],
    ls: 'manifesto.txt  arsenal/  jornada/  opus/  contato.txt  curriculo.pdf',
    cv: 'baixando currículo…',
    hire: ['[sudo] senha para recrutador: ********', '✓ permissão concedida. abrindo o whatsapp…'],
    sudo: 'permissão negada. tente: sudo contratar',
    rm: 'rm: operação não permitida — este portfólio está em produção.',
    exit: 'não há saída. só o próximo commit.',
    vim: 'para sair do vim: esc, depois :q! — de nada.',
    ouro: '↺ o fim é o começo.',
    notFound: 'comando não encontrado',
    tryHelp: 'digite help.',
    lang: 'idioma: english',
  },
  en: {
    help: [
      'available commands:',
      '  whoami       who am i',
      '  about        professional summary',
      '  stack        technologies and levels',
      '  exp          experience',
      '  projects     works in progress',
      '  git log      the journey in commits',
      '  contact      direct channels',
      '  cv           download résumé (pdf)',
      '  philosophy   a random quote',
      '  lang         switch language',
      '  clear        clear the screen',
      '  sudo hire',
    ],
    whoami: ['henrique valois — junior software engineer', 'full-stack · automation · ai — capim grosso, brazil'],
    sobre: [
      'full-stack dev: end-to-end web systems, multi-layer security (rls on postgresql),',
      'api integrations and n8n automations. back-end with java and aws.',
      'systems analysis & development at ages, class of 2028. goal: engineering at scale.',
    ],
    exp: [
      'jun 2026 — now   junior developer @ grupo sing',
      '                 modular erp · rls · rd station · meta ads',
      '2025             analyst, technical team @ capim solar',
      '                 micro-generation project documentation',
    ],
    log: [
      '* a7f3c21 (HEAD -> main) feat: junior dev @ grupo sing — erp, rls, integrations',
      '* 5d1e9b0 feat: java & aws — back-end and cloud',
      '* 3c2b8f4 chore: systems dev @ ages — 2nd semester',
      '* 9e40a17 feat: n8n automations — real-time leads',
      '* 61f0c3d docs: technical team @ capim solar',
      '* 0000001 init: hello, world — capim grosso, ba',
    ],
    ls: 'manifesto.txt  arsenal/  journey/  opus/  contact.txt  resume.pdf',
    cv: 'downloading résumé…',
    hire: ['[sudo] password for recruiter: ********', '✓ permission granted. opening whatsapp…'],
    sudo: 'permission denied. try: sudo hire',
    rm: 'rm: operation not permitted — this portfolio is in production.',
    exit: 'there is no exit. only the next commit.',
    vim: 'to quit vim: esc, then :q! — you’re welcome.',
    ouro: '↺ the end is the beginning.',
    notFound: 'command not found',
    tryHelp: 'type help.',
    lang: 'language: português',
  },
};

function terminal() {
  const root = $('[data-terminal]');
  if (!root) return;
  const out = $('[data-term-out]');
  const body = $('[data-term-body]');
  const form = $('[data-term-form]');
  const input = $('[data-term-input]');
  const hist = [];
  let hIdx = 0;

  const print = (text, cls = '') => {
    const d = document.createElement('div');
    d.className = `ln${cls ? ` ln--${cls}` : ''}`;
    d.textContent = text;
    out.appendChild(d);
    body.scrollTop = body.scrollHeight;
  };
  const printAll = (lines, cls) => lines.forEach((l) => print(l, cls));
  const T = () => termText[lang];

  const cmds = {
    help: () => printAll(T().help),
    whoami: () => printAll(T().whoami, 'acc'),
    sobre: () => printAll(T().sobre),
    stack: () => stack.forEach((g) => print(`${pick(g.name).toLowerCase().padEnd(7)}${g.items.map((it) => pick(it.name).toLowerCase()).join(' · ')}`)),
    exp: () => printAll(T().exp),
    projetos: () => projects.forEach((p) => print(`[${stages[p.stage].name.toLowerCase()}] ${pick(p.title).toLowerCase()} — ${p.tags.map((t) => pick(t)).join(', ')}`)),
    log: () => printAll(T().log),
    contato: () => {
      print(`email     ${email()}`);
      print(`whatsapp  ${profile.phoneDisplay}`);
      print(`linkedin  ${profile.linkedin.replace('https://www.', '')}`);
      print(`github    github.com/${profile.github}`);
      if (profile.instagram) print(`instagram @${profile.instagram}`);
    },
    cv: () => { print(T().cv, 'dim'); downloadCV(); },
    filosofia: () => { const q = quotes[lang]; print(q[Math.floor(Math.random() * q.length)], 'acc'); },
    lang: () => { applyLang(lang === 'pt' ? 'en' : 'pt'); print(T().lang, 'dim'); },
    clear: () => { out.innerHTML = ''; },
    ls: () => print(T().ls),
    pwd: () => print('/home/henrique/portfolio'),
    date: () => print(new Date().toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', { timeZone: profile.timezone })),
    echo: (args) => print(args.join(' ')),
    exit: () => print(T().exit, 'dim'),
    vim: () => print(T().vim, 'dim'),
    ouroboros: () => { print(T().ouro, 'acc'); spinHalo(); },
    cat: (args) => {
      if (/manifesto/.test(args[0] || '')) print($('[data-statement]').textContent.trim());
      else print(`cat: ${args[0] || ''}: ${lang === 'en' ? 'no such file' : 'arquivo não encontrado'}`, 'dim');
    },
  };
  const aliases = {
    about: 'sobre', projects: 'projetos', contact: 'contato', philosophy: 'filosofia', resume: 'cv', curriculo: 'cv',
    'currículo': 'cv', experience: 'exp', experiencia: 'exp', 'experiência': 'exp', cls: 'clear', quit: 'exit', nvim: 'vim',
  };

  const run = (raw) => {
    const line = raw.trim();
    print(line, 'cmd');
    if (!line) return;
    hist.push(line);
    hIdx = hist.length;
    const low = line.toLowerCase();
    if (/^sudo\s+(contratar|hire|hire-me|contrate)$/.test(low)) {
      printAll(T().hire, 'acc');
      setTimeout(() => openExt(whatsappUrl(lang)), 900);
      return;
    }
    if (low.startsWith('sudo')) { print(T().sudo, 'dim'); return; }
    if (low.startsWith('rm ')) { print(T().rm, 'dim'); return; }
    if (low === 'git log' || low === 'git log --oneline') { cmds.log(); return; }
    const [c, ...args] = line.split(/\s+/);
    const key = aliases[c.toLowerCase()] || c.toLowerCase();
    const fn = key !== 'log' && cmds[key];
    if (fn) fn(args);
    else print(`${T().notFound}: ${c}. ${T().tryHelp}`, 'dim');
  };

  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = hist[hIdx]; }
    else if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hIdx = Math.min(hist.length, hIdx + 1); input.value = hist[hIdx] || ''; }
    else if (e.key === 'Tab' && input.value) {
      const names = [...Object.keys(cmds), ...Object.keys(aliases), 'git log'].filter((n) => n !== 'log');
      const hit = names.find((n) => n.startsWith(input.value.toLowerCase()));
      if (hit) { e.preventDefault(); input.value = hit; }
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  body.addEventListener('click', () => { if (!getSelection().toString()) input.focus({ preventScroll: true }); });

  // types `whoami` by itself the first time it comes into view
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    if (hist.length || document.activeElement === input) return; // visitor got there first
    if (reduced) { run('whoami'); print(lang === 'en' ? 'type help for more.' : 'digite help para mais.', 'dim'); return; }
    const word = 'whoami';
    let i = 0;
    const type = () => {
      if (hist.length || document.activeElement === input) { input.value = ''; return; }
      input.value = word.slice(0, ++i);
      if (i < word.length) setTimeout(type, 90 + Math.random() * 70);
      else setTimeout(() => { run(word); input.value = ''; print(lang === 'en' ? 'type help for more.' : 'digite help para mais.', 'dim'); }, 380);
    };
    setTimeout(type, 500);
  }, { threshold: 0.5 });
  io.observe(root);

  return {
    focus: () => {
      root.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
    },
  };
}

/* --------------------------------------------------------------- palette */

function palette(term) {
  const dlg = $('[data-palette]');
  const input = $('[data-palette-input]');
  const list = $('[data-palette-list]');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  let items = [];
  let shown = [];
  let sel = 0;
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const build = () => {
    const P = ui[lang].pal;
    const g = lang === 'en' ? { nav: 'Navigate', act: 'Actions', links: 'Links' } : { nav: 'Navegar', act: 'Ações', links: 'Links' };
    const secs = [['manifesto', 'I', 'nav.manifesto', 'Manifesto'], ['arsenal', 'II', 'nav.arsenal', 'Arsenal'], ['jornada', 'III', 'nav.journey', 'Jornada'], ['opus', 'IV', 'nav.opus', 'Opus'], ['contato', 'V', 'nav.contact', 'Contato']];
    items = [
      ...secs.map(([id, n, k, pt]) => ({ group: g.nav, label: `${P.goto} ${lang === 'en' ? en[k] : pt}`, hint: n, run: () => goTo(id) })),
      { group: g.act, label: P.cv, hint: 'PDF', run: downloadCV },
      { group: g.act, label: P.copyEmail, hint: email(), run: copyEmail },
      { group: g.act, label: P.terminal, hint: '>_', run: () => term?.focus() },
      { group: g.act, label: P.lang, hint: lang === 'en' ? 'PT' : 'EN', run: () => applyLang(lang === 'en' ? 'pt' : 'en') },
      { group: g.act, label: P.top, hint: '↑', run: () => goTo('top') },
      { group: g.links, label: P.whatsapp, hint: profile.phoneDisplay, run: () => openExt(whatsappUrl(lang)) },
      { group: g.links, label: P.linkedin, hint: profile.linkedinHandle, run: () => openExt(profile.linkedin) },
      { group: g.links, label: P.github, hint: `@${profile.github}`, run: () => openExt(`https://github.com/${profile.github}`) },
      ...(profile.instagram ? [{ group: g.links, label: P.instagram, hint: `@${profile.instagram}`, run: () => openExt(`https://www.instagram.com/${profile.instagram}/`) }] : []),
    ];
  };

  const render = () => {
    const q = norm(input.value.trim());
    shown = items.filter((it) => !q || norm(`${it.label} ${it.hint} ${it.group}`).includes(q));
    sel = clamp(sel, 0, Math.max(0, shown.length - 1));
    if (!shown.length) { list.innerHTML = `<li class="pal-empty">${esc(ui[lang].paletteEmpty)}</li>`; return; }
    let html = '';
    let group = null;
    shown.forEach((it, i) => {
      if (it.group !== group) { html += `<li class="pal-group" role="presentation">${esc(it.group)}</li>`; group = it.group; }
      html += `<li class="pal-item" id="pal-${i}" role="option" data-i="${i}" aria-selected="${i === sel}"><span>${esc(it.label)}</span><span class="mono">${esc(it.hint)}</span></li>`;
    });
    list.innerHTML = html;
    input.setAttribute('aria-activedescendant', `pal-${sel}`);
    $(`#pal-${sel}`, list)?.scrollIntoView({ block: 'nearest' });
  };

  const exec = (i) => {
    const it = shown[i];
    if (!it) return;
    dlg.close();
    setTimeout(it.run, 60);
  };

  const open = () => {
    if (dlg.open) { dlg.close(); return; }
    build();
    input.value = '';
    sel = 0;
    render();
    dlg.showModal();
    input.focus();
  };

  input.addEventListener('input', () => { sel = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); exec(sel); }
  });
  list.addEventListener('click', (e) => { const li = e.target.closest('.pal-item'); if (li) exec(Number(li.dataset.i)); });
  list.addEventListener('mousemove', (e) => {
    const li = e.target.closest('.pal-item');
    if (li && Number(li.dataset.i) !== sel) { sel = Number(li.dataset.i); $$('.pal-item', list).forEach((x) => x.setAttribute('aria-selected', String(Number(x.dataset.i) === sel))); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $$('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName) && document.activeElement !== input;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    else if (e.key === '/' && !typing && !dlg.open) { e.preventDefault(); open(); }
  });
}

/* ------------------------------------------------------------- starfield */

function starfield() {
  const cv = $('[data-stars]');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let w = 0;
  let h = 0;
  let pts = [];
  let running = false;
  let mx = 0;
  let my = 0;
  let shoot = null;
  let nextShoot = 4000;

  const resize = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    w = cv.clientWidth;
    h = cv.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((w * h) / 4200);
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() ** 3 * 1.3 + 0.3,
      a: Math.random() * 0.6 + 0.12,
      s: Math.random() * 1.8 + 0.3,
      p: Math.random() * Math.PI * 2,
      z: Math.random(),
    }));
    draw(performance.now());
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ece8de';
    for (const s of pts) {
      const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.s + s.p);
      ctx.globalAlpha = s.a * tw;
      ctx.beginPath();
      ctx.arc(s.x + mx * s.z * 16, s.y + my * s.z * 10, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (shoot) {
      const k = (t - shoot.t0) / 900;
      if (k >= 1) shoot = null;
      else {
        const x = shoot.x + shoot.dx * k;
        const y = shoot.y + shoot.dy * k;
        const g = ctx.createLinearGradient(x, y, x - shoot.dx * 0.18, y - shoot.dy * 0.18);
        g.addColorStop(0, 'rgba(236,232,222,0.9)');
        g.addColorStop(1, 'rgba(236,232,222,0)');
        ctx.globalAlpha = Math.sin(k * Math.PI);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - shoot.dx * 0.18, y - shoot.dy * 0.18);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  };

  let last = 0;
  const loop = (t) => {
    if (!running) return;
    if (!shoot && t - last > nextShoot) {
      last = t;
      nextShoot = 5000 + Math.random() * 7000;
      shoot = { t0: t, x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.4, dx: -(220 + Math.random() * 200), dy: 120 + Math.random() * 80 };
    }
    draw(t);
    requestAnimationFrame(loop);
  };

  new ResizeObserver(resize).observe(cv);
  if (reduced) return;
  new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) requestAnimationFrame(loop);
  }).observe(cv);
  cv.parentElement.addEventListener('pointermove', (e) => {
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });
}

/* ------------------------------------------------------------------ boot */

function boot() {
  // a reload should replay the poster from the top, not reopen half-scrolled under the nav
  if ('scrollRestoration' in history && !location.hash) {
    history.scrollRestoration = 'manual';
    scrollTo(0, 0);
  }
  captureDefaults();
  splitName();
  buildSlope();
  buildCircles();
  applyLang(initialLang(), { initial: true });
  intro();
  clock();
  menu();
  sectionSpy();
  const term = terminal();
  palette(term);
  starfield();

  $$('[data-lang-btn]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.langBtn !== lang) applyLang(b.dataset.langBtn); }));
  $$('[data-copy-email]').forEach((b) => b.addEventListener('click', copyEmail));

  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', () => { fitName(); requestUpdate(); });
  desktop.addEventListener('change', trackJourney);
  stackedHero.addEventListener('change', fitName);
  document.fonts?.ready.then(fitName);
  update();

  console.log('%cHenrique Valois', 'font: 300 26px "Cormorant Garamond", Georgia, serif; color:#ece8de; background:#080808; padding:10px 14px;');
  console.log(
    `%c${lang === 'en' ? 'You opened DevTools. I like that. Let’s talk' : 'Você abriu o DevTools. Gostei. Vamos conversar'} → ${email()}`,
    'font: 12px ui-monospace, monospace; color:#d6f23a;',
  );
}

boot();
