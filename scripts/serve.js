#!/usr/bin/env node
// Tiny static server for local dev of library.lupine.science dist output.
// Serves the built SPA on http://localhost:5173 with SPA-style fallback to /index.html.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT || 5173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent((req.url || '/').split('?')[0]); }
  catch { res.writeHead(400); return res.end('invalid path'); }
  let file = path.resolve(DIST, `.${urlPath === '/' ? '/index.html' : urlPath}`);
  if (file !== DIST && !file.startsWith(DIST + path.sep)) { res.writeHead(403); return res.end('forbidden'); }

  fs.stat(file, (err, stat) => {
    if (!err && stat.isDirectory()) {
      if (!urlPath.endsWith('/')) { res.writeHead(308, { Location: `${urlPath}/` }); return res.end(); }
      file = path.join(file, 'index.html');
    } else if (err || !stat.isFile()) {
      // Missing canonical documents must not masquerade as a successful homepage.
      if (/^\/(?:articles|topics|categories|guides)(?:\/|$)/.test(urlPath)) { res.writeHead(404); return res.end('Document not found'); }
      file = path.join(DIST, 'index.html');
    }
    const ext = path.extname(file).toLowerCase();
    fs.readFile(file, (e2, data) => {
      if (e2) { res.writeHead(500); return res.end('error'); }
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Library dev server → http://localhost:${PORT}`);
});
