import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { normalizeOntology, loadNormalizedOntology } from './build-ontology.mjs';
import { buildKnowledgeGraph } from './build-knowledge-graph.mjs';
import { renderScopeReviews } from '../src/knowledgeGraphView.js';
import { t } from '../src/i18n.js';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const sourceText = read('../content/ontology/lupine-ontology.json');
const source = JSON.parse(sourceText);
const scopeReviews = JSON.parse(read('../content/ontology/climate-scope-reviews.json'));
const review = scopeReviews.reviews[0];
const qualified = () => normalizeOntology(source, { sourceText, scopeReviews });
const target = data => data.nodes.find(node => node.id === review.ontologyId);

test('actual atlas scope review preserves source, identities, clocks and unrelated graph data', () => {
  const beforeSource = structuredClone(source);
  const before = normalizeOntology(source);
  const after = qualified();
  assert.equal(target(before).blocker, review.original);
  assert.equal(target(after).blocker, review.statement);
  assert.deepEqual(target(after).scopeReviews, [review]);
  assert.deepEqual(after.rawAtlas, before.rawAtlas);
  assert.deepEqual(source, beforeSource);
  assert.deepEqual(after.links, before.links);
  assert.deepEqual(after.stats, before.stats);
  assert.deepEqual(after.nodes.filter(node => node.id !== review.ontologyId),
    before.nodes.filter(node => node.id !== review.ontologyId));
  for (const field of ['id', 'sourceId', 'marker', 'markerAssignment', 'readiness', 'confidence', 'asOf'])
    assert.deepEqual(target(after)[field], target(before)[field]);
  assert.notEqual(review.reviewedOn, target(after).asOf);
});

test('review fails closed on byte drift, changed values and mismatched parsed source', () => {
  assert.throws(() => normalizeOntology(source, { sourceText: sourceText + ' ', scopeReviews }), /scope review/);
  const changed = structuredClone(source);
  changed.climateTargets[1].blocker = 'changed source';
  assert.throws(() => normalizeOntology(changed, { sourceText, scopeReviews }), /scope review source/);
  assert.throws(() => normalizeOntology(changed, { sourceText: JSON.stringify(changed), scopeReviews }), /scope review/);
});

test('review rejects wrong targets, duplicate applications and unsafe provenance', () => {
  const mutations = [
    r => { r.sourcePointer = '/climateTargets/0/blocker'; },
    r => { r.ontologyId = 'climateTarget:CT1'; },
    r => { r.original = 'not the reviewed text'; },
    r => { r.sourceSha256 = '0'.repeat(64); },
    r => { r.evidence[0].url = 'javascript:alert(1)'; },
    r => { r.missingPremises = []; },
    r => { r.reviewedOn = '2026-02-30'; },
  ];
  for (const mutate of mutations) {
    const candidate = structuredClone(scopeReviews); mutate(candidate.reviews[0]);
    assert.throws(() => normalizeOntology(source, { sourceText, scopeReviews: candidate }), /scope review/);
  }
  const duplicate = structuredClone(scopeReviews); duplicate.reviews.push(structuredClone(review));
  assert.throws(() => normalizeOntology(source, { sourceText, scopeReviews: duplicate }), /scope review/);
  duplicate.reviews[1].id += '-other';
  assert.throws(() => normalizeOntology(source, { sourceText, scopeReviews: duplicate }), /scope review/);
});

test('production loader and graph projection carry the same reviewed scope', () => {
  const normalized = loadNormalizedOntology();
  assert.deepEqual(normalized, qualified());
  const graph = buildKnowledgeGraph({ categories: [], entries: [] }, { ontology: normalized });
  const node = graph.nodes.find(item => item.id === 'ontology:' + review.ontologyId);
  assert.equal(node.blocker, review.statement);
  assert.deepEqual(node.scopeReviews, [review]);
});

test('built ontology and knowledge graph cannot silently omit the reviewed qualification', () => {
  for (const [file, prefix] of [['ontology.json', ''], ['knowledge-graph.json', 'ontology:']]) {
    const data = JSON.parse(read('../dist/data/' + file));
    const node = data.nodes.find(item => item.id === prefix + review.ontologyId);
    assert.equal(node.blocker, review.statement);
    assert.deepEqual(node.scopeReviews, [review]);
  }
});

test('actual scope renderer shows limits and history as text with a separate review clock', () => {
  class Element {
    constructor(tag = '#text', value = '') { this.tag = tag; this.value = value; this.children = []; this.attributes = {}; }
    append(...children) { this.children.push(...children); }
    setAttribute(key, value) { this.attributes[key] = value; }
    get textContent() { return this.value + this.children.map(child => child.textContent).join(' '); }
    set textContent(value) { this.value = String(value); this.children = []; }
  }
  const previousNode = globalThis.Node, previousDocument = globalThis.document;
  globalThis.Node = Element;
  globalThis.document = { createElement: tag => new Element(tag), createTextNode: text => new Element('#text', text) };
  try {
    const render = renderScopeReviews(target(qualified()), 'en');
    assert.ok(render.textContent.includes(review.statement));
    assert.ok(render.textContent.includes(review.reason));
    assert.ok(render.textContent.includes(review.reviewedOn));
    assert.ok(render.textContent.includes('Needed for a transport conclusion'));
    const history = render.children.find(child => child.tag === 'details');
    assert.ok(history.textContent.includes(review.original));
    assert.equal(renderScopeReviews({}), null);
    const hostile = structuredClone(target(qualified()));
    hostile.scopeReviews[0].reason = '<img src=x onerror=alert(1)>';
    const safe = renderScopeReviews(hostile, 'en');
    const walk = node => [node, ...node.children.flatMap(walk)];
    assert.equal(walk(safe).some(node => node.tag === 'img'), false);
    assert.ok(safe.textContent.includes(hostile.scopeReviews[0].reason));
    for (const lang of ['en', 'zh']) for (const suffix of ['title', 'reviewed', 'premises', 'original']) {
      const key = 'graph.scopeReview.' + suffix;
      assert.notEqual(t(key, lang), key);
    }
  } finally { globalThis.Node = previousNode; globalThis.document = previousDocument; }
});
