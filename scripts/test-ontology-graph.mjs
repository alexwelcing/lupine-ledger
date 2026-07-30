#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { buildKnowledgeGraph } from './build-knowledge-graph.mjs';
import { normalizeOntology } from './build-ontology.mjs';

const manifest = JSON.parse(fs.readFileSync(new URL('../content/latest/manifest.json', import.meta.url), 'utf8'));
const source = JSON.parse(fs.readFileSync(new URL('../content/ontology/lupine-ontology.json', import.meta.url), 'utf8'));

test('buildKnowledgeGraph merges normalized ontology nodes and explicit links', () => {
  const ontology = normalizeOntology(source);
  const graph = buildKnowledgeGraph(manifest.catalog, { ontology, generatedAt: manifest.generatedAt });

  assert.equal(graph.scope, 'library+ontology');
  assert.equal(graph.stats.ontologyNodeCount, ontology.nodes.length);
  assert.equal(graph.stats.ontologyLinkCount, ontology.links.length);
  assert.equal(graph.stats.nodes, graph.nodes.length);
  assert.equal(graph.stats.links, graph.links.length);

  for (const type of ['errorType', 'materialClass', 'discoveryChain', 'acceptanceTest', 'emblem', 'scoreboardRow', 'timeGate', 'falsifier']) {
    assert.ok(graph.nodes.some((node) => node.type === type), `missing ${type}`);
  }
  const c4 = graph.nodes.find((node) => node.id === 'ontology:discoveryChain:C4');
  assert.deepEqual(c4.readiness, { grade: 'M', annotation: 'M (L→M boundary)' });
  assert.equal(c4.marker, 'OBS');
  assert.equal(c4.asOf, '2026-07-30');
  assert.ok(c4.confidence.grade);

  assert.ok(graph.links.some((link) =>
    link.source === 'ontology:discoveryChain:C1' &&
    link.target === 'ontology:acceptanceTest:Z1' &&
    link.relation === 'chain.gatedBy'
  ));
  assert.equal(graph.ontology.atlasRelationDefinitions.length, 32);
  assert.ok(graph.ontology.relationTypes['claim.correctedBy']);
  assert.ok(graph.ontology.relationTypes['lever.correctedBy']);
  assert.ok(graph.ontology.relationTypes['chain.gatedBy']);
  assert.ok(graph.ontology.relationTypes['program.gatedBy']);
});
