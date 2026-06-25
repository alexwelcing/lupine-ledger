#!/usr/bin/env node
// Post-build verification test for lupine-ledger static assets.
// Ensures the release-checklist health endpoint and other critical files exist.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const errors = [];

function assertExists(relativePath, description) {
  const absolutePath = path.join(DIST, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`missing ${description}: ${relativePath}`);
    return false;
  }
  return true;
}

function assertContent(relativePath, expected, description) {
  if (!assertExists(relativePath, description)) return;
  const absolutePath = path.join(DIST, relativePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  if (content !== expected) {
    errors.push(`unexpected content in ${description}: ${relativePath}`);
  }
}

// ── Health endpoint (release-checklist requirement) ──
assertContent('health', 'ok\n', 'health endpoint');

// ── Core SPA files ──
assertExists('index.html', 'index.html');
assertExists('app.js', 'app.js');
assertExists('styles.css', 'styles.css');
assertExists('sw.js', 'service worker');

// ── SEO / metadata ──
assertExists('robots.txt', 'robots.txt');
assertExists('sitemap.xml', 'sitemap.xml');
assertExists('llms.txt', 'llms.txt');

// ── Data layer ──
assertExists('data/library.json', 'library manifest');

// ── Branding ──
assertExists('lupine-science-icon.png', 'icon');
assertExists('og-lupine-library.png', 'OG image');

// ── Report results ──
if (errors.length) {
  for (const message of errors) console.error(`[fail] ${message}`);
  process.exit(1);
}

console.log(`[ok] lupine-ledger post-build verification passed (${8} checks).`);
