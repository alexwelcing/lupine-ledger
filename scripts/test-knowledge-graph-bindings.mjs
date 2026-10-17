import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildKnowledgeGraph, writeKnowledgeGraph } from './build-knowledge-graph.mjs';
import { normalizeOntology } from './build-ontology.mjs';
import { validateKnowledgeGraph } from './check-graph.js';
import { initialRelationsFor } from '../src/knowledgeGraphView.js';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('content/latest/manifest.json', root), 'utf8'));
const ontologyText = fs.readFileSync(new URL('content/ontology/lupine-ontology.json', root), 'utf8');
const ontology = normalizeOntology(JSON.parse(ontologyText));
const bindings = JSON.parse(fs.readFileSync(new URL('content/ontology/reviewed-article-bindings.json', root), 'utf8')).bindings;
const articles = Object.fromEntries(bindings.map(b => {
  const entry = manifest.catalog.entries.find(e => e.id === b.articleId);
  return [b.articleId, fs.readFileSync(new URL(`content/latest/${entry.source}`, root), 'utf8')];
}));
function graph(records = bindings, docs = articles, atlasText = ontologyText) {
  return buildKnowledgeGraph(manifest.catalog, { ontology, reviewedBindings: records,
    bindingDocuments: { articles: docs, ontology: atlasText } });
}

test('two reviewed source-pinned passages become real graph edges, without validity promotion', () => {
  const data = graph();
  assert.deepEqual(data.reviewedBindings, { accepted: 2, rejected: [] });
  const edges = data.links.filter(l => l.id.startsWith('reviewed-binding:'));
  assert.equal(edges.length, 2);
  assert.ok(edges.some(l => l.target === 'ontology:formalProof:FP1'));
  assert.ok(edges.some(l => l.target === 'ontology:materialClass:MC6'));
  assert.ok(edges.every(l => l.provenance.confidence === 'extracted-reviewed' && l.articleRoute.includes('?passage=')));
  assert.deepEqual(validateKnowledgeGraph(data, manifest.catalog), []);
  for (const edge of edges) {
    assert.ok(data.ontology.relationTypes[edge.relation]);
    assert.ok(initialRelationsFor('ontology').has(edge.relation));
    assert.ok(initialRelationsFor('local').has(edge.relation));
  }
});

test('changed article or ontology hash excludes affected bindings with explicit reason', () => {
  const stale = graph(bindings, { ...articles, [bindings[0].articleId]: articles[bindings[0].articleId] + '\nchanged' });
  assert.equal(stale.reviewedBindings.accepted, 1);
  assert.equal(stale.reviewedBindings.rejected[0].reason, 'stale source hash');
  assert.equal(stale.links.some(l => l.id === `reviewed-binding:${bindings[0].id}`), false);
  assert.equal(graph(bindings, articles, ontologyText + '\n').reviewedBindings.accepted, 0);
});

test('missing passage fails closed even when byte hashes match; no literal-ID inference', () => {
  const records = structuredClone(bindings);
  records[0].heading = 'Not present'; records[0].passageAnchor = 'not-present';
  const data = graph(records);
  assert.equal(data.reviewedBindings.accepted, 1);
  assert.equal(data.reviewedBindings.rejected[0].reason, 'missing or mismatched passage anchor');
  assert.equal(data.links.some(l => l.id.startsWith('reviewed-binding:') && l.target === 'ontology:errorType:T1'), false);
  assert.equal(buildKnowledgeGraph(manifest.catalog, { ontology }).reviewedBindings.accepted, 0);
});

test('write pipeline consumes reviewed bindings, with temporary output only', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-binding-test-'));
  try {
    const outputPath = path.join(temp, 'graph.json');
    const built = writeKnowledgeGraph({ outputPath });
    assert.equal(built.reviewedBindings.accepted, 2);
    assert.equal(JSON.parse(fs.readFileSync(outputPath, 'utf8')).reviewedBindings.accepted, 2);
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
