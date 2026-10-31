import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateEditorialTitles, resolveEditorialMetadata, projectEditorialGraph } from './build.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const overlay = read('content/editorial-titles.json');
const catalog = read('content/latest/manifest.json').catalog;
const sha = value => createHash('sha256').update(value).digest('hex');
const candidates = validateEditorialTitles(overlay);
function original(candidate) {
  const entry = catalog.entries.find(item => item.id === candidate.id);
  const bytes = fs.readFileSync(path.join(root, 'content/latest', entry.source));
  return { id: entry.id, source: entry.source, lang: 'en', sourceSha256: sha(bytes), title: entry.title,
    subtitle: entry.subtitle, sourceTitle: bytes.toString('utf8').match(/^#\s+(.+?)\s*$/m)?.[1] || entry.title };
}

test('all ten editorial changes bind to the reviewed raw source bytes', () => {
  assert.equal(candidates.length, 10);
  for (const candidate of candidates) {
    const article = original(candidate);
    const retained = structuredClone(article);
    const result = resolveEditorialMetadata(article, candidates);
    assert.equal(result.editorial.applied, true, candidate.id);
    assert.equal(result.title, candidate.title);
    assert.equal(result.originalTitle, article.title);
    assert.equal(result.originalSubtitle, article.subtitle);
    assert.equal(result.sourceTitle, article.sourceTitle);
    assert.ok(result.searchAliases.includes(article.title));
    assert.ok(result.searchAliases.includes(article.sourceTitle));
    assert.deepEqual(article, retained, 'source presentation input stays immutable');
  }
});

test('changed bytes, moved sources and unreviewed languages retain original presentation', () => {
  const article = original(candidates[0]);
  for (const change of [{ sourceSha256: '0'.repeat(64) }, { source: 'articles/elsewhere.md' }, { lang: 'zh' }, { id: 'future-article' }]) {
    const result = resolveEditorialMetadata({ ...article, ...change }, candidates);
    assert.equal(result.editorial.applied, false);
    assert.equal(result.title, article.title);
    assert.equal(result.subtitle, article.subtitle);
    assert.equal(result.originalTitle, article.title);
  }
  assert.equal(resolveEditorialMetadata({ ...article, sourceSha256: '0'.repeat(64) }, candidates).editorial.status, 'source-changed');
});

test('malformed and ambiguous overlay entries are rejected', () => {
  assert.throws(() => validateEditorialTitles({ ...overlay, schemaVersion: 'unreviewed' }));
  for (const patch of [{ sourceSha256: 'unknown' }, { title: '' }, { language: 'unreviewed' }]) {
    assert.throws(() => validateEditorialTitles({ ...overlay, entries: [{ ...candidates[0], ...patch }] }));
  }
  assert.throws(() => validateEditorialTitles({ ...overlay, entries: [candidates[0], candidates[0]] }));
});

test('graph presentation changes do not alter topology or scientific node fields', () => {
  const article = { id: candidates[0].id, ...resolveEditorialMetadata(original(candidates[0]), candidates) };
  const graph = {
    schema: 'retained', stats: { nodes: 2, links: 1 },
    nodes: [{ id: `article:${article.id}`, articleId: article.id, type: 'article', label: article.originalTitle,
      title: article.originalTitle, subtitle: article.originalSubtitle, tags: ['lean'], status: 'proposed',
      source: candidates[0].source, position: { x: 1, y: 2 } },
    { id: 'concept:proof', type: 'concept', label: 'Proof' }],
    links: [{ source: `article:${article.id}`, target: 'concept:proof', provenance: { confidence: 'declared' } }],
  };
  const before = structuredClone(graph);
  const result = projectEditorialGraph(graph, [article]);
  assert.deepEqual(graph, before);
  assert.strictEqual(result.links, graph.links);
  assert.strictEqual(result.stats, graph.stats);
  assert.strictEqual(result.nodes[1], graph.nodes[1]);
  for (const key of ['id', 'articleId', 'type', 'tags', 'status', 'source', 'position']) {
    assert.deepEqual(result.nodes[0][key], graph.nodes[0][key]);
  }
  assert.equal(result.nodes[0].label, article.title);
});

test('built reader, archive, search, corpus and graph share display labels and original aliases', () => {
  const library = read('dist/data/library.json');
  const corpus = read('dist/data/corpus.json');
  const search = read('dist/data/search-index.json');
  const graph = read('dist/data/knowledge-graph.json');
  assert.equal(library.articles.length, catalog.entries.length);
  assert.equal(library.articles.filter(article => article.editorial.applied).length, 10);
  for (const candidate of candidates) {
    const canonical = read(`dist/data/${candidate.id}.json`);
    const meta = library.articles.find(article => article.id === candidate.id);
    const indexed = search.articles.find(article => article.id === candidate.id);
    const node = graph.nodes.find(item => item.articleId === candidate.id);
    assert.equal(canonical.title, candidate.title);
    assert.equal(meta.title.en, candidate.title);
    assert.equal(indexed.title, candidate.title);
    assert.equal(node.label, candidate.title);
    assert.equal(meta.originalTitle.en, canonical.originalTitle);
    assert.equal(indexed.originalTitle, canonical.originalTitle);
    assert.equal(node.originalTitle, canonical.originalTitle);
    assert.deepEqual(indexed.searchAliases, canonical.searchAliases);
    assert.deepEqual(corpus.articles.find(article => article.id === candidate.id && article.lang === 'en'), canonical);
    assert.match(canonical.html, /<h1 /, 'original source heading remains in article body');
  }
});
