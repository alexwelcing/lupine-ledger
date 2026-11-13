import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createHash } from 'node:crypto';
import {
  projectArticleScopes, loadArticleCatalog, renderArticleScopeReview,
} from './article-scope-reviews.mjs';
import { buildKnowledgeGraph } from './build-knowledge-graph.mjs';
import { contentSourceSnapshot } from './content-provenance.mjs';

const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const manifest = JSON.parse(read('content/latest/manifest.json'));
const reviews = JSON.parse(read('content/reviews/article-scopes.json'));
const review = reviews.reviews[0];
const source = read('content/latest/' + review.source);
const getSource = name => { assert.equal(name, review.source); return source; };
const project = (catalog = manifest.catalog, records = reviews, readSource = getSource) =>
  projectArticleScopes(catalog, records, readSource);
const find = catalog => catalog.entries.find(entry => entry.id === review.articleId);

test('article review preserves exact historical bytes, source clocks and unrelated catalog/graph data', () => {
  const before = structuredClone(manifest);
  const projected = project();
  assert.equal(createHash('sha256').update(source).digest('hex'), review.sourceSha256);
  assert.equal(find(manifest.catalog).subtitle, review.originalSubtitle);
  assert.equal(find(projected).subtitle, review.subtitle);
  assert.deepEqual(find(projected).scopeReview, review);
  assert.deepEqual(manifest, before);
  assert.deepEqual(projected.entries.filter(e => e.id !== review.articleId),
    manifest.catalog.entries.filter(e => e.id !== review.articleId));
  const { subtitle, scopeReview, ...rest } = find(projected);
  const { subtitle: oldSubtitle, ...originalRest } = find(manifest.catalog);
  assert.deepEqual(rest, originalRest);
  const rawGraph = buildKnowledgeGraph(manifest.catalog), qualifiedGraph = buildKnowledgeGraph(projected);
  assert.deepEqual(qualifiedGraph.links, rawGraph.links);
  assert.deepEqual(qualifiedGraph.stats, rawGraph.stats);
  assert.deepEqual(qualifiedGraph.nodes.filter(n => n.id !== 'article:' + review.articleId),
    rawGraph.nodes.filter(n => n.id !== 'article:' + review.articleId));
});

test('source, catalog, identity and review drift stop qualification rather than silently dropping it', () => {
  assert.throws(() => project(manifest.catalog, reviews, () => source + '\n'), /Article scope review/);
  for (const mutate of [
    e => { e.subtitle += ' changed'; },
    e => { e.source = 'different.md'; },
    e => { e.id = 'different-article'; },
    e => { e.i18n = { zh: 'unreviewed.md' }; },
  ]) {
    const catalog = structuredClone(manifest.catalog); mutate(find(catalog));
    assert.throws(() => project(catalog), /Article scope review/);
  }
  for (const mutate of [
    r => { r.sourceSha256 = '0'.repeat(64); },
    r => { r.reviewedOn = '2026-02-30'; },
    r => { r.missingPremises = []; },
    r => { r.evidence[0].url = 'javascript:alert(1)'; },
  ]) {
    const records = structuredClone(reviews); mutate(records.reviews[0]);
    assert.throws(() => project(manifest.catalog, records), /Article scope review/);
  }
  const duplicate = structuredClone(reviews); duplicate.reviews.push(structuredClone(review));
  assert.throws(() => project(manifest.catalog, duplicate), /Article scope review/);
  duplicate.reviews[1].id += '-other';
  assert.throws(() => project(manifest.catalog, duplicate), /Article scope review/);
  assert.throws(() => project({ ...manifest.catalog, entries: [] }), /Article scope review/);
});

test('review markup escapes text, keeps the original wording, and labels the separate review date', () => {
  const html = renderArticleScopeReview(review);
  assert.ok(html.includes(review.reviewedOn));
  assert.ok(html.includes('Premises needed for reuse'));
  assert.ok(html.includes('Original catalog description'));
  assert.ok(html.includes('historical article follows unchanged'));
  assert.equal(renderArticleScopeReview(null), '');
  const hostile = { ...review, statement: '<img src=x onerror=alert(1)>', evidence: [
    { label: '<script>bad()</script>', url: 'https://example.org/?q="&x=1' },
  ] };
  const safe = renderArticleScopeReview(hostile);
  assert.doesNotMatch(safe, /<img|<script|href="https:\/\/example.org\/\?q="/);
  assert.match(safe, /&lt;img/);
  assert.match(safe, /&quot;&amp;x=1/);
});

test('production reader, catalog, corpus, search and graph agree on the qualified claim', () => {
  const catalog = loadArticleCatalog(manifest, new URL('../content/latest/', import.meta.url).pathname);
  assert.deepEqual(catalog, project());
  const built = name => JSON.parse(read('dist/data/' + name + '.json'));
  const library = built('library'), article = built(review.articleId), corpus = built('corpus');
  const search = built('search-index'), graph = built('knowledge-graph');
  assert.equal(library.articles.find(e => e.id === review.articleId).subtitle.en, review.subtitle);
  assert.equal(search.articles.find(e => e.id === review.articleId).subtitle, review.subtitle);
  assert.equal(graph.nodes.find(e => e.id === 'article:' + review.articleId).subtitle, review.subtitle);
  assert.equal(article.subtitle, review.subtitle);
  assert.deepEqual(article.scopeReview, review);
  assert.deepEqual(corpus.articles.find(e => e.id === review.articleId && e.lang === 'en'), article);
  assert.ok(article.html.startsWith(renderArticleScopeReview(review)));
  const historicalBody = article.html.slice(renderArticleScopeReview(review).length);
  assert.ok(historicalBody.startsWith('<h1'));
  assert.ok(historicalBody.includes('The Convention-Wander Gate'));
  assert.ok(!historicalBody.includes('editorial-scope-review'));
  assert.ok(article.html.includes('Recorded:</strong> 2026-07-21'));
  assert.ok(article.html.includes('Future work'));
  assert.ok(article.html.includes('40 meV'));
  for (const link of review.evidence) assert.ok(article.html.includes(link.url));
  assert.deepEqual(library.sourceSnapshot, contentSourceSnapshot(manifest));
  assert.equal(library.sourceSnapshot.exportedAt, manifest.generatedAt);
  assert.ok(read('dist/llms-full.txt').includes('- Scope reviewed ' + review.reviewedOn + ': ' + review.subtitle));
});
