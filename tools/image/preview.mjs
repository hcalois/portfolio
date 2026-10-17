// Composites the cut-out over solid colours so edges/fringes can be inspected.
import sharp from 'sharp';
const [src, prefix] = process.argv.slice(2);
const meta = await sharp(src).metadata();
const over = (bg) => sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: bg } })
  .composite([{ input: src }]).png().toBuffer();

for (const [name, bg] of [['dark', '#0b0b0c'], ['red', '#c0182a']]) {
  await sharp(await over(bg)).resize(1000).jpeg({ quality: 85 }).toFile(`${prefix}-${name}.jpg`);
}
// zoomed crops: hair top, left ear/hair, jaw streak
const dark = await over('#0b0b0c');
const red = await over('#c0182a');
const crops = { hair: [600, 150, 700, 450], side: [520, 600, 400, 500], jaw: [1050, 1000, 450, 400] };
for (const [name, [left, top, width, height]] of Object.entries(crops)) {
  await sharp(dark).extract({ left, top, width, height }).jpeg({ quality: 90 }).toFile(`${prefix}-zoom-${name}.jpg`);
  await sharp(red).extract({ left, top, width, height }).jpeg({ quality: 90 }).toFile(`${prefix}-zoomred-${name}.jpg`);
}
console.log('ok');
