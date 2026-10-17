// Removes the baked-in checkerboard from the portrait and builds a soft alpha matte.
// 1) flood-fills the neutral/bright checker from the borders (+ enclosed pockets in the hair)
// 2) estimates per-pixel alpha in a thin boundary band from local bg/fg colour means
// 3) un-mixes the background colour out of the edge pixels (no white fringe on dark bg)
import sharp from 'sharp';

const [src, out] = process.argv.slice(2);
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;

const lum = new Float32Array(N), sat = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
  lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  sat[i] = Math.max(r, g, b) - Math.min(r, g, b);
}
const isCore = (i) => sat[i] <= 14 && lum[i] >= 208;

// --- 1. flood fill from borders ---------------------------------------------
const B = new Uint8Array(N);
const q = new Int32Array(N);
let qh = 0, qt = 0;
const seed = (i) => { if (!B[i] && isCore(i)) { B[i] = 1; q[qt++] = i; } };
for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
const nb8 = [-1, 1, -W, W, -W - 1, -W + 1, W - 1, W + 1];
while (qh < qt) {
  const i = q[qh++];
  const x = i % W;
  for (const d of nb8) {
    const j = i + d;
    if (j < 0 || j >= N) continue;
    const xj = j % W;
    if (Math.abs(xj - x) > 1) continue;
    if (!B[j] && isCore(j)) { B[j] = 1; q[qt++] = j; }
  }
}

// --- enclosed checker pockets between curls (hair region only) ---------------
const seen = new Uint8Array(N);
let pockets = 0;
for (let s = 0; s < N; s++) {
  if (B[s] || seen[s] || !isCore(s)) continue;
  qh = 0; qt = 0; q[qt++] = s; seen[s] = 1;
  let sy = 0, bright = 0;
  while (qh < qt) {
    const i = q[qh++];
    const x = i % W;
    sy += (i / W) | 0;
    if (lum[i] > 228) bright++;
    for (const d of nb8) {
      const j = i + d;
      if (j < 0 || j >= N || Math.abs((j % W) - x) > 1) continue;
      if (!seen[j] && !B[j] && isCore(j)) { seen[j] = 1; q[qt++] = j; }
    }
  }
  const cy = sy / qt;
  if (cy < 930 && qt >= 10 && bright / qt > 0.5) {
    for (let k = 0; k < qt; k++) B[q[k]] = 1;
    pockets++;
  }
}
console.log('pockets removed', pockets);

// --- grow B over the grey halo left by the original cut-out -------------------
// hair is near-black and skin is saturated, so a neutral mid/light grey touching B is residue
const isHalo = (i) => sat[i] <= 22 && lum[i] >= 92;
let grown = 0;
for (let pass = 0; pass < 10; pass++) {
  const add = [];
  for (let i = W; i < N - W; i++) {
    if (B[i] || !isHalo(i)) continue;
    if (B[i - 1] || B[i + 1] || B[i - W] || B[i + W]) add.push(i);
  }
  if (!add.length) break;
  for (const i of add) B[i] = 1;
  grown += add.length;
}
console.log('halo pixels grown', grown);

// bright specks of old cut-out residue sitting on top of the hair (face starts lower)
{
  let specks = 0;
  for (let y = 0; y < 560; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (!B[i] && lum[i] > 135 && sat[i] < 40) { B[i] = 1; specks++; }
  }
  console.log('hair specks removed', specks);
}

// --- repaint the bright streak along the jawline with surrounding skin ---------
{
  const X0 = 1120, X1 = 1345, Y0 = 1080, Y1 = 1320;
  const wmap = new Float32Array(N);
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
    const i = y * W + x;
    if (B[i]) continue;
    // skin keeps sat/lum around .45-.65; the streak is a desaturated grey
    const w = clamp01((0.4 - sat[i] / Math.max(1, lum[i])) / 0.2) * clamp01((lum[i] - 62) / 40);
    wmap[i] = w;
  }
  // dilate so the soft edges of the streak are covered as well
  const wd = Float32Array.from(wmap);
  for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
    const i = y * W + x;
    if (B[i]) continue;
    let m = wmap[i];
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) m = Math.max(m, wmap[i + dy * W + dx] * 0.9);
    wd[i] = m;
  }
  wmap.set(wd);
  const R = 22;
  const tmp = Buffer.from(data);
  let fixed = 0;
  for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
    const i = y * W + x;
    const w = wmap[i];
    if (w < 0.08) continue;
    let r = 0, g = 0, b = 0, n = 0;
    for (let yy = y - R; yy <= y + R; yy += 2) for (let xx = x - R; xx <= x + R; xx += 2) {
      const j = yy * W + xx;
      if (B[j] || wmap[j] > 0.04 || lum[j] < 45) continue;
      r += data[j * 3]; g += data[j * 3 + 1]; b += data[j * 3 + 2]; n++;
    }
    if (!n) continue;
    const t = Math.min(1, w * 2);
    tmp[i * 3] = data[i * 3] + (r / n - data[i * 3]) * t;
    tmp[i * 3 + 1] = data[i * 3 + 1] + (g / n - data[i * 3 + 1]) * t;
    tmp[i * 3 + 2] = data[i * 3 + 2] + (b / n - data[i * 3 + 2]) * t;
    fixed++;
  }
  tmp.copy(data);
  for (let i = 0; i < N; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    sat[i] = Math.max(r, g, b) - Math.min(r, g, b);
  }
  console.log('jaw pixels repainted', fixed);
}

// --- 2. distance to the B / non-B boundary (both sides), capped --------------
const CAP = 8;
const dist = new Uint8Array(N).fill(255);
qh = 0; qt = 0;
for (let i = 0; i < N; i++) {
  const x = i % W;
  for (const d of [-1, 1, -W, W]) {
    const j = i + d;
    if (j < 0 || j >= N || Math.abs((j % W) - x) > 1) continue;
    if (B[j] !== B[i]) { dist[i] = 0; q[qt++] = i; break; }
  }
}
while (qh < qt) {
  const i = q[qh++];
  if (dist[i] >= CAP) continue;
  const x = i % W;
  for (const d of [-1, 1, -W, W]) {
    const j = i + d;
    if (j < 0 || j >= N || Math.abs((j % W) - x) > 1) continue;
    if (dist[j] === 255 && B[j] === B[i]) { dist[j] = dist[i] + 1; q[qt++] = j; }
  }
}

// --- 3. alpha + colour un-mixing in the band ----------------------------------
const outBuf = Buffer.alloc(N * 4);
const alpha = new Float32Array(N);
for (let i = 0; i < N; i++) alpha[i] = B[i] ? 0 : 1;

const BAND_IN = 4, BAND_OUT = 2;
const mean = (cx, cy, rad, pred) => {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = Math.max(0, cy - rad); y <= Math.min(H - 1, cy + rad); y++) {
    for (let x = Math.max(0, cx - rad); x <= Math.min(W - 1, cx + rad); x++) {
      const j = y * W + x;
      if (pred(j)) { r += data[j * 3]; g += data[j * 3 + 1]; b += data[j * 3 + 2]; n++; }
    }
  }
  return n ? [r / n, g / n, b / n] : null;
};

const colour = new Float32Array(N * 3);
for (let i = 0; i < N; i++) { colour[i * 3] = data[i * 3]; colour[i * 3 + 1] = data[i * 3 + 1]; colour[i * 3 + 2] = data[i * 3 + 2]; }

for (let i = 0; i < N; i++) {
  const inBand = B[i] ? dist[i] < BAND_OUT : dist[i] < BAND_IN;
  if (!inBand) continue;
  const x = i % W, y = (i / W) | 0;
  const Bc = mean(x, y, 5, (j) => B[j] && dist[j] >= 1) || [245, 245, 245];
  const Fc = mean(x, y, 8, (j) => !B[j] && dist[j] >= BAND_IN + 1) || mean(x, y, 3, (j) => !B[j]) || [20, 16, 20];
  const P = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const fb = [Fc[0] - Bc[0], Fc[1] - Bc[1], Fc[2] - Bc[2]];
  const len2 = fb[0] ** 2 + fb[1] ** 2 + fb[2] ** 2;
  let a;
  if (len2 < 900) a = B[i] ? 0 : 1;
  else a = ((P[0] - Bc[0]) * fb[0] + (P[1] - Bc[1]) * fb[1] + (P[2] - Bc[2]) * fb[2]) / len2;
  a = Math.min(1, Math.max(0, a));
  // gentle curve: kill faint haze, keep strands
  a = a < 0.06 ? 0 : a > 0.94 ? 1 : a;
  alpha[i] = a;
  if (a > 0) {
    for (let c = 0; c < 3; c++) {
      const un = (P[c] - (1 - a) * Bc[c]) / a;
      const v = a < 0.5 ? Fc[c] + (un - Fc[c]) * (a * 2) : un;
      colour[i * 3 + c] = Math.min(255, Math.max(0, v));
    }
  }
}

// light 3x3 smoothing of alpha along the band only
const sm = Float32Array.from(alpha);
for (let i = 0; i < N; i++) {
  if (dist[i] > 2) continue;
  const x = i % W, y = (i / W) | 0;
  if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
  let s = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += alpha[i + dy * W + dx] * (dx === 0 && dy === 0 ? 4 : 1);
  sm[i] = s / 12;
}

for (let i = 0; i < N; i++) {
  outBuf[i * 4] = colour[i * 3];
  outBuf[i * 4 + 1] = colour[i * 3 + 1];
  outBuf[i * 4 + 2] = colour[i * 3 + 2];
  outBuf[i * 4 + 3] = Math.round(sm[i] * 255);
}

await sharp(outBuf, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
console.log('wrote', out);
