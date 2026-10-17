// Crops the cut-out, bakes a soft rim light and writes mono + colour WebP sizes.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const [src, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;

// bbox
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (data[(y * W + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
}
const pad = 8;
x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);
const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
console.log('bbox', { x0, y0, cw, ch });
// head centre in the original was ~ (1035, 600) with hair spanning ~940px
console.log('head centre in crop %', ((1035 - x0) / cw * 100).toFixed(1), ((600 - y0) / ch * 100).toFixed(1), 'head width %', (940 / cw * 100).toFixed(1));

// separable box blur of alpha for the rim light
const A = new Float32Array(N);
for (let i = 0; i < N; i++) A[i] = data[i * 4 + 3] / 255;
const blur = (src, r) => {
  const tmp = new Float32Array(N), out = new Float32Array(N);
  for (let y = 0; y < H; y++) {
    let s = 0;
    for (let x = -r; x <= r; x++) s += src[y * W + Math.min(W - 1, Math.max(0, x))];
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] = s / (2 * r + 1);
      s += src[y * W + Math.min(W - 1, x + r + 1)] - src[y * W + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < W; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
    for (let y = 0; y < H; y++) {
      out[y * W + x] = s / (2 * r + 1);
      s += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x];
    }
  }
  return out;
};
const Ab = blur(blur(A, 6), 6);

const bone = [236, 232, 222];
const rimCut = y0 + ch * 0.64; // no rim on the circular crop at the bottom
const mono = Buffer.alloc(N * 4), colour = Buffer.alloc(N * 4);
const curve = (x) => { const s = x < 0.5 ? 2 * x * x : 1 - 2 * (1 - x) * (1 - x); return 0.45 * x + 0.55 * s; };

for (let i = 0; i < N; i++) {
  const y = (i / W) | 0;
  const a = A[i];
  let r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
  let rim = Math.max(0, a - Ab[i]) * 2.4;
  if (y > rimCut) rim *= Math.max(0, 1 - (y - rimCut) / 60);
  rim = Math.min(1, rim) * 0.5;

  // colour: a touch desaturated + rim
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  const cr = l + (r - l) * 0.86, cg = l + (g - l) * 0.86, cb = l + (b - l) * 0.86;
  colour[i * 4] = cr + (bone[0] - cr) * rim;
  colour[i * 4 + 1] = cg + (bone[1] - cg) * rim;
  colour[i * 4 + 2] = cb + (bone[2] - cb) * rim;
  colour[i * 4 + 3] = data[i * 4 + 3];

  // mono: S-curve luminance tinted towards bone
  let m = curve(Math.min(1, Math.max(0, l / 255)) ** 0.95);
  m = m + (1 - m) * rim * 0.9;
  mono[i * 4] = m * bone[0];
  mono[i * 4 + 1] = m * bone[1];
  mono[i * 4 + 2] = m * bone[2];
  mono[i * 4 + 3] = data[i * 4 + 3];
}

for (const [name, buf] of [['mono', mono], ['color', colour]]) {
  const base = sharp(buf, { raw: { width: W, height: H, channels: 4 } }).extract({ left: x0, top: y0, width: cw, height: ch });
  const png = await base.png().toBuffer();
  for (const h of [1600, 900]) {
    await sharp(png).resize({ height: Math.min(h, ch) }).webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(`${outDir}/henrique-${name}-${h}.webp`);
  }
  if (name === 'color') await sharp(png).resize({ height: 1200 }).png({ compressionLevel: 9 }).toFile(`${outDir}/henrique-color-1200.png`);
}
console.log('done');
