// Gera as imagens do README de perfil do GitHub (hcalois/hcalois) no estilo do portfólio.
// Fontes e retrato vão embutidos em base64: o GitHub exibe SVG como <img>, que não carrega nada externo.
//
// Uso: node tools/github-profile/build.mjs <pasta-das-fontes-woff2> <pasta-de-saída>
// As fontes vêm de @fontsource/cormorant-garamond e @fontsource/jetbrains-mono (subconjunto latin).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [fontsDir, outDir] = process.argv.slice(2);
if (!fontsDir || !outDir) {
  console.error('uso: node build.mjs <fontes> <saída>');
  process.exit(1);
}
const here = dirname(fileURLToPath(import.meta.url));
const b64 = (p) => readFileSync(p).toString('base64');
const font = (name) => b64(join(fontsDir, name));

const C = {
  bg: '#080808', fg: '#ece8de', fg2: '#b4b0a6', fg3: '#87847c',
  line: 'rgba(236,232,222,0.08)', line2: 'rgba(236,232,222,0.16)', acid: '#d6f23a',
};

const fontFace = (family, weight, style, data) =>
  `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};src:url(data:font/woff2;base64,${data}) format('woff2');}`;

const GLYPH = {
  fire: 'M12 3.5 21 19.5H3Z',
  water: 'M3 4.5h18L12 20.5Z',
  air: 'M12 3.5 21 19.5H3Z M4.5 13.2h15',
  earth: 'M3 4.5h18L12 20.5Z M4.5 10.8h15',
};
const glyph = (el, x, y, size, stroke, width = 1.4) =>
  `<path d="${GLYPH[el]}" transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${stroke}" stroke-width="${(width * 24) / size}" stroke-linejoin="round"/>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ------------------------------------------------------------------ header */

function header() {
  const W = 1000, H = 340;
  const portrait = b64(join(here, '..', '..', 'assets', 'img', 'henrique-mono-900.webp'));
  const P = { x: 660, y: 48, w: 261, h: 300 };
  const cx = Math.round(P.x + P.w * 0.582);
  const cy = Math.round(P.y + P.h * 0.237);

  // the ouroboros: an arc that fades towards its tail, with the head chasing it
  const pt = (r, deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  };
  const arc = (r, a0, a1) => {
    const [x0, y0] = pt(r, a0);
    const [x1, y1] = pt(r, a1);
    return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };
  const R = 86;
  const tail = [[0, 40, 0.06], [40, 80, 0.15], [80, 125, 0.3], [125, 175, 0.5], [175, 235, 0.75], [235, 330, 1]]
    .map(([a, b, o]) => `<path d="${arc(R, a, b)}" stroke="${C.acid}" stroke-opacity="${o}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`)
    .join('');
  const [hx, hy] = pt(R, 330);

  const ringText = 'QVOD EST SVPERIVS EST SICVT QVOD INFERIVS · SOLVE ET COAGVLA · ';
  const rt = 102;
  const markers = [['fire', 0], ['air', 90], ['water', 180], ['earth', 270]]
    .map(([el, deg]) => {
      const [x, y] = pt(110, deg);
      return `<circle cx="${x}" cy="${y}" r="8" fill="${C.bg}"/>${glyph(el, x - 6, y - 6, 12, C.fg2, 1.2)}`;
    }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Henrique Valois — Engenheiro de Software Jr.</title>
<desc id="d">Back-end Java: orientação a objetos, SQL, APIs REST e AWS. Disponível para oportunidades.</desc>
<style>
${fontFace('CG', 300, 'normal', font('cormorant-garamond-latin-300-normal.woff2'))}
${fontFace('CG', 300, 'italic', font('cormorant-garamond-latin-300-italic.woff2'))}
${fontFace('JBM', 400, 'normal', font('jetbrains-mono-latin-400-normal.woff2'))}
${fontFace('JBM', 500, 'normal', font('jetbrains-mono-latin-500-normal.woff2'))}
.serif{font-family:'CG',Georgia,serif;font-weight:300}
.mono{font-family:'JBM',ui-monospace,monospace}
.spin{transform-box:view-box;transform-origin:${cx}px ${cy}px;animation:spin 26s linear infinite}
.drift{transform-box:view-box;transform-origin:${cx}px ${cy}px;animation:spin 160s linear infinite reverse}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.4s cubic-bezier(.65,0,.35,1) infinite}
.rise{animation:rise 1.4s cubic-bezier(.19,1,.22,1) both}
.d1{animation-delay:.15s}.d2{animation-delay:.3s}.d3{animation-delay:.45s}.d4{animation-delay:.6s}.d5{animation-delay:.75s}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%{transform:scale(.5);opacity:1}100%{transform:scale(2.4);opacity:0}}
@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
  <clipPath id="card"><rect width="${W}" height="${H}" rx="16"/></clipPath>
  <radialGradient id="glow" cx="${cx}" cy="${cy + 30}" r="230" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="${C.fg}" stop-opacity=".09"/><stop offset="1" stop-color="${C.fg}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="fadeG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff"/><stop offset=".58" stop-color="#fff"/>
    <stop offset=".8" stop-color="#fff" stop-opacity=".45"/><stop offset=".97" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <mask id="fade" maskUnits="userSpaceOnUse" x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}">
    <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" fill="url(#fadeG)"/>
  </mask>
  <path id="ring" d="M${cx - rt} ${cy}a${rt} ${rt} 0 1 1 ${rt * 2} 0a${rt} ${rt} 0 1 1 -${rt * 2} 0"/>
</defs>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <g stroke="${C.line}" stroke-width="1">
    <line x1="250" y1="0" x2="250" y2="${H}"/><line x1="500" y1="0" x2="500" y2="${H}"/><line x1="750" y1="0" x2="750" y2="${H}"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <g fill="none" stroke="${C.fg}">
    <circle cx="${cx}" cy="${cy}" r="110" stroke-opacity=".3" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="94" stroke-opacity=".3" stroke-width="6" stroke-dasharray="0.9 7.3"/>
    <circle cx="${cx}" cy="${cy}" r="94" stroke-opacity=".55" stroke-width="12" stroke-dasharray="1.6 47.6"/>
  </g>
  <g class="drift"><text class="serif" font-size="8.6" fill="${C.fg}" fill-opacity=".5" letter-spacing="1.2"><textPath href="#ring" textLength="636" lengthAdjust="spacing">${ringText}</textPath></text></g>
  <g class="spin">${tail}<circle cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}" r="3.6" fill="${C.acid}"/><circle cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}" r="8" fill="${C.acid}" fill-opacity=".14"/></g>
  ${markers}

  <image href="data:image/webp;base64,${portrait}" x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" mask="url(#fade)" preserveAspectRatio="xMidYMid meet"/>

  <text class="mono rise" x="48" y="58" font-size="11" letter-spacing="2.2" fill="${C.fg3}">PORTFÓLIO — MMXXVI</text>
  <text class="serif rise d1" x="44" y="142" font-size="80" letter-spacing="-1" fill="${C.fg}">Henrique</text>
  <text class="serif rise d2" x="44" y="214" font-size="80" letter-spacing="-1" fill="${C.fg2}" font-style="italic">Valois</text>
  <text class="serif rise d3" x="48" y="258" font-size="27" fill="${C.fg}">Engenheiro de Software <tspan font-style="italic" fill="${C.fg2}">Jr.</tspan></text>
  <text class="mono rise d4" x="48" y="287" font-size="11" letter-spacing="2" fill="${C.acid}" font-weight="500">JAVA · POO · SQL · APIS REST · AWS</text>
  <g class="rise d5">
    <circle cx="53" cy="314" r="3.6" fill="${C.acid}"/>
    <circle class="pulse" cx="53" cy="314" r="6" fill="none" stroke="${C.acid}"/>
    <text class="mono" x="67" y="318" font-size="10.5" letter-spacing="2" fill="${C.fg}">DISPONÍVEL PARA OPORTUNIDADES</text>
    <text class="mono" x="338" y="318" font-size="10.5" letter-spacing="1.4" fill="${C.fg3}">henrique-valois.vercel.app</text>
  </g>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" fill="none" stroke="${C.line}"/>
</svg>
`;
}

/* ------------------------------------------------------------- stack table */

const STACK = [
  { el: 'fire', name: 'Fogo', domain: 'Java & fundamentos', items: [['Jv', 'Java'], ['Oo', 'POO'], ['Ed', 'Est. de dados'], ['Al', 'Algoritmos']] },
  { el: 'water', name: 'Água', domain: 'Dados & APIs', items: [['Sq', 'SQL'], ['Pg', 'PostgreSQL'], ['Ap', 'APIs REST'], ['Ms', 'Microsserviços']] },
  { el: 'air', name: 'Ar', domain: 'Automação & IA', items: [['N8', 'n8n'], ['Wh', 'Webhooks'], ['In', 'Integrações'], ['Ai', 'IA aplicada']] },
  { el: 'earth', name: 'Terra', domain: 'Fundação', items: [['Sc', 'Segurança'], ['Aw', 'AWS'], ['Gt', 'Git'], ['Ag', 'Ágil']] },
];

function stack() {
  const W = 1000, pad = 28, gap = 20;
  const gw = (W - pad * 2 - gap * 3) / 4;
  const ts = (gw - 1) / 2;
  const top = 96;
  const H = Math.round(top + ts * 2 + 1 + pad);
  const step = 0.35;
  const cycle = (16 * step).toFixed(2);
  let n = 0;

  const groups = STACK.map((g, gi) => {
    const x0 = pad + gi * (gw + gap);
    const tiles = g.items.map(([sym, name], ii) => {
      const i = n++;
      const x = x0 + (ii % 2) * (ts + 1);
      const y = top + Math.floor(ii / 2) * (ts + 1);
      const delay = `style="animation-delay:${(i * step).toFixed(2)}s"`;
      return `<g>
    <rect x="${x}" y="${y}" width="${ts}" height="${ts}" fill="${C.bg}"/>
    <text class="mono" x="${x + 10}" y="${y + 18}" font-size="9" letter-spacing="1" fill="${C.fg3}">${String(i + 1).padStart(2, '0')}</text>
    ${glyph(g.el, x + ts - 19, y + 9, 10, C.fg3, 1.3)}
    <text class="serif sym" ${delay} x="${x + 9}" y="${y + 76}" font-size="48" fill="${C.fg}">${sym}</text>
    <text class="mono" x="${x + 10}" y="${y + ts - 14}" font-size="10.5" fill="${C.fg}">${esc(name)}</text>
    <rect class="scan" ${delay} x="${x + 0.5}" y="${y + 0.5}" width="${ts - 1}" height="${ts - 1}" fill="none" stroke="${C.acid}"/>
  </g>`;
    }).join('\n  ');
    return `<g>
  <line x1="${x0}" y1="${pad}" x2="${x0 + gw}" y2="${pad}" stroke="${C.line2}"/>
  ${glyph(g.el, x0, pad + 16, 20, C.fg, 1.2)}
  <text class="serif" x="${x0 + 30}" y="${pad + 34}" font-size="30" fill="${C.fg}">${esc(g.name)}</text>
  <text class="mono" x="${x0}" y="${pad + 58}" font-size="9.5" letter-spacing="1.6" fill="${C.fg3}">${esc(g.domain.toUpperCase())}</text>
  <rect x="${x0}" y="${top - 1}" width="${gw}" height="${ts * 2 + 3}" fill="${C.line2}"/>
  ${tiles}
</g>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Arsenal — tabela periódica</title>
<desc id="d">Fogo: Java, POO, estruturas de dados, algoritmos. Água: SQL, PostgreSQL, APIs REST, microsserviços. Ar: n8n, Webhooks, integrações, IA aplicada. Terra: segurança, AWS, Git, ágil.</desc>
<style>
${fontFace('CG', 300, 'normal', font('cormorant-garamond-latin-300-normal.woff2'))}
${fontFace('JBM', 400, 'normal', font('jetbrains-mono-latin-400-normal.woff2'))}
.serif{font-family:'CG',Georgia,serif;font-weight:300}
.mono{font-family:'JBM',ui-monospace,monospace}
.scan{opacity:0;animation:scan ${cycle}s linear infinite}
.sym{animation:sym ${cycle}s linear infinite}
@keyframes scan{0%,14%,100%{opacity:0}3%,8%{opacity:1}}
@keyframes sym{0%,14%,100%{fill:${C.fg}}3%,8%{fill:${C.acid}}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<rect width="${W}" height="${H}" rx="16" fill="${C.bg}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" fill="none" stroke="${C.line}"/>
${groups}
</svg>
`;
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'header.svg'), header());
writeFileSync(join(outDir, 'stack.svg'), stack());
console.log('header.svg e stack.svg gerados em', outDir);
