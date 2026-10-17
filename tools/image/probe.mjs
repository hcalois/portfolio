import sharp from 'sharp';

const src = process.argv[2];
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
console.log('size', W, H);

const px = (x, y) => { const i = (y * W + x) * 3; return [data[i], data[i + 1], data[i + 2]]; };

// histogram of neutral-bright tones along the borders
const hist = new Map();
const add = (x, y) => {
  const [r, g, b] = px(x, y);
  const k = `${r >> 2 << 2},${g >> 2 << 2},${b >> 2 << 2}`;
  hist.set(k, (hist.get(k) || 0) + 1);
};
for (let x = 0; x < W; x += 2) { for (let y = 0; y < 60; y += 2) { add(x, y); add(x, H - 1 - y); } }
for (let y = 0; y < H; y += 2) { for (let x = 0; x < 60; x += 2) { add(x, y); add(W - 1 - x, y); } }
console.log([...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15));

for (const [x, y] of [[100, 100], [140, 100], [1900, 1500], [1880, 1450], [1250, 1220], [1220, 1180], [800, 190], [1000, 1980]]) console.log(x, y, px(x, y));
