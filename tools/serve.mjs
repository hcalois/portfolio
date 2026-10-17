// Minimal static server for local preview; applies the same headers as vercel.json.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const [root, port = '5173'] = process.argv.slice(2);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

let headers = [];
try {
  const cfg = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
  headers = (cfg.headers || []).map((h) => ({ re: new RegExp(`^${h.source.replace(/\(\.\*\)/g, '(.*)')}$`), list: h.headers }));
} catch { /* no config */ }

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  for (const h of headers) if (h.re.test(path)) for (const { key, value } of h.list) {
    if (key === 'Strict-Transport-Security' || (key === 'Content-Security-Policy')) res.setHeader(key, value.replace('; upgrade-insecure-requests', ''));
    else res.setHeader(key, value);
  }
  let file = normalize(join(root, path));
  if (!file.startsWith(normalize(root))) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    try { await stat(`${file}.html`); file = `${file}.html`; } catch { /* 404 below */ }
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404');
  }
}).listen(Number(port), () => console.log(`serving ${root} on http://localhost:${port}`));
