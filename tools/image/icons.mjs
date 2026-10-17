// favicon.svg -> apple-touch-icon.png, og.png -> og.jpg
import sharp from 'sharp';
const [assets, ogPng] = process.argv.slice(2);
await sharp(`${assets}/favicon.svg`, { density: 600 }).resize(180, 180).png().toFile(`${assets}/apple-touch-icon.png`);
await sharp(ogPng).resize(1200, 630, { fit: 'cover', position: 'top' }).jpeg({ quality: 88, mozjpeg: true }).toFile(`${assets}/og.jpg`);
const m = await sharp(`${assets}/og.jpg`).metadata();
console.log('og', m.width, m.height);
