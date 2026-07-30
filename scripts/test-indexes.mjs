#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateLlmsFull,
  generateSearchIndex,
  generateSitemap,
} from './generate-indexes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/latest/manifest.json'), 'utf8'));
const ontology = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/ontology/lupine-ontology.json'), 'utf8'));
const catalog = manifest.catalog;
const articleIds = catalog.entries.map((entry) => entry.id);

const llmsFull = generateLlmsFull(catalog, ontology);
assert.equal(llmsFull, generateLlmsFull(catalog, ontology), 'llms-full generation must be deterministic');
assert.deepEqual(
  [...llmsFull.matchAll(/^- ID: `([^`]+)`$/gm)].map((match) => match[1]),
  articleIds,
  'llms-full must list every manifest article exactly once and in manifest order',
);
assert.match(llmsFull, /Atlas date: 2026-07-30/);
assert.match(llmsFull, /Next scheduled reverification: 2026-11-10/);
assert.match(llmsFull, /Climate Partnerships Proof Pack: Draft, dated 2026-07-09/);
assert.match(llmsFull, /37 concept classes/);
assert.match(llmsFull, /figure caption says 33/);

const searchIndex = generateSearchIndex(catalog);
assert.deepEqual(searchIndex, generateSearchIndex(catalog), 'search-index generation must be deterministic');
assert.equal(searchIndex.schemaVersion, 'library-search-index.v1');
assert.equal(searchIndex.articles.length, 94);
assert.deepEqual(searchIndex.articles.map((article) => article.id), articleIds);
for (const [index, article] of searchIndex.articles.entries()) {
  const source = catalog.entries[index];
  assert.equal(article.title, source.title);
  assert.equal(article.category, source.category);
  assert.equal(article.status, source.status || null);
  assert.deepEqual(article.tags, source.tags);
  assert.deepEqual(article.extracted_knowledge, {});
}

const sitemap = generateSitemap(catalog);
assert.equal(sitemap, generateSitemap(catalog), 'sitemap generation must be deterministic');
const sitemapArticleIds = [...sitemap.matchAll(/<loc>https:\/\/library\.lupine\.science\/data\/([^<]+)\.json<\/loc>/g)]
  .map((match) => decodeURIComponent(match[1]))
  .filter((id) => articleIds.includes(id));
assert.deepEqual(sitemapArticleIds, articleIds, 'sitemap must contain one valid data route per manifest article');

console.log('[ok] deterministic machine indexes cover all 94 manifest articles.');
