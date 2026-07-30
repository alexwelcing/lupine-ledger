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

function readJson(relativePath, description) {
  if (!assertExists(relativePath, description)) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(DIST, relativePath), 'utf8'));
  } catch (error) {
    errors.push(`invalid JSON in ${description}: ${relativePath} (${error.message})`);
    return null;
  }
}

// ── Health endpoint (release-checklist requirement) ──
assertContent('health', 'ok\n', 'health endpoint');

// ── Core SPA files ──
assertExists('index.html', 'index.html');
assertExists('app.js', 'app.js');
assertExists('knowledgeGraphView.js', 'knowledge graph view');
assertExists('styles.css', 'styles.css');
assertExists('sw.js', 'service worker');

// ── SEO / metadata ──
assertExists('robots.txt', 'robots.txt');
assertExists('sitemap.xml', 'sitemap.xml');
assertExists('llms.txt', 'llms.txt');
assertExists('llms-full.txt', 'generated full agent guide');

// ── Data layer ──
assertExists('data/library.json', 'library manifest');
assertExists('data/knowledge-graph.json', 'knowledge graph');
const library = readJson('data/library.json', 'library manifest');
const searchIndex = readJson('data/search-index.json', 'generated search index');
if (library && searchIndex) {
  const libraryIds = library.articles.map((article) => article.id);
  const searchIds = searchIndex.articles.map((article) => article.id);
  if (searchIndex.schemaVersion !== 'library-search-index.v1') {
    errors.push('unexpected search index schema version');
  }
  if (JSON.stringify(searchIds) !== JSON.stringify(libraryIds)) {
    errors.push('search index article ids do not match the library manifest');
  }
  if (searchIndex.articles.some((article) => JSON.stringify(article.extracted_knowledge) !== '{}')) {
    errors.push('search index extracted_knowledge stubs must be empty objects');
  }

  const llmsFull = fs.readFileSync(path.join(DIST, 'llms-full.txt'), 'utf8');
  const llmsIds = [...llmsFull.matchAll(/^- ID: `([^`]+)`$/gm)].map((match) => match[1]);
  if (JSON.stringify(llmsIds) !== JSON.stringify(libraryIds)) {
    errors.push('llms-full article ids do not match the library manifest');
  }

  const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  for (const id of libraryIds) {
    const route = `https://library.lupine.science/data/${encodeURIComponent(id)}.json`;
    if (!sitemap.includes(`<loc>${route}</loc>`)) errors.push(`sitemap missing article route: ${id}`);
    if (!fs.existsSync(path.join(DIST, 'data', `${id}.json`))) errors.push(`sitemap route has no built article: ${id}`);
  }
}

const appSource = fs.readFileSync(path.join(DIST, 'app.js'), 'utf8');
if (!appSource.includes("fetch('/data/search-index.json'")) {
  errors.push('search dialog does not consume the generated search index');
}

assertExists('data/ontology.json', 'normalized ontology');

// ── Branding ──
assertExists('lupine-science-icon.png', 'icon');
assertExists('og-lupine-library.png', 'OG image');

// ── Report results ──
if (errors.length) {
  for (const message of errors) console.error(`[fail] ${message}`);
  process.exit(1);
}

console.log('[ok] lupine-ledger post-build verification passed.');
