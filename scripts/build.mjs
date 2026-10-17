// Build da Vercel: copia o site para dist/ e carimba um hash de conteúdo nas URLs de CSS, JS e imagens
// (style.css?v=3f9a1c…). Arquivo alterado = URL nova, então um F5 comum já traz a versão publicada;
// arquivo igual = mesma URL, que continua no cache do navegador sem gastar banda.
//
// Uso: node scripts/build.mjs   (a Vercel roda sozinha em todo deploy, ver vercel.json)

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
const SITE = ['index.html', 'robots.txt', 'sitemap.xml', 'css', 'js', 'assets'];

rmSync(out, { recursive: true, force: true });
for (const p of SITE) cpSync(join(root, p), join(out, p), { recursive: true });

const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10);
const stamp = (url) => {
  const file = join(out, url);
  return existsSync(file) ? `${url}?v=${hash(file)}` : url;
};

// main.js imports content.js: stamp it first, so main.js's own hash covers the change
const mainPath = join(out, 'js', 'main.js');
const main = readFileSync(mainPath, 'utf8');
if (!main.includes("from './content.js'")) throw new Error('import de content.js não encontrado em main.js');
const stampedMain = main.replace("from './content.js'", `from './content.js?v=${hash(join(out, 'js', 'content.js'))}'`);
// guard: a broken specifier would take the whole page down, so fail the deploy instead
if (!/from '\.\/content\.js\?v=[0-9a-f]{10}';/.test(stampedMain)) throw new Error('carimbo do import de content.js saiu malformado');
writeFileSync(mainPath, stampedMain);

// index.html: every local CSS, JS and image reference
const htmlPath = join(out, 'index.html');
let html = readFileSync(htmlPath, 'utf8');
let count = 0;
html = html.replace(/\b(href|src|srcset|data-src)="(\/(?:css|js|assets\/img)\/[^"?#]+|\/assets\/(?:favicon\.svg|apple-touch-icon\.png))"/g, (_, attr, url) => {
  count += 1;
  return `${attr}="${stamp(url)}"`;
});
writeFileSync(htmlPath, html);

// guard: a syntax error anywhere in the JS would leave the page stuck on the loader,
// so a broken file fails the deploy and the previous version stays online
for (const name of readdirSync(join(out, 'js')).filter((f) => f.endsWith('.js'))) {
  const res = spawnSync(process.execPath, ['--check', join(out, 'js', name)], { encoding: 'utf8' });
  if (res.status !== 0) throw new Error(`erro de sintaxe em js/${name}:\n${res.stderr}`);
}

console.log(`dist/ pronto — ${count} referências versionadas, JS verificado`);
