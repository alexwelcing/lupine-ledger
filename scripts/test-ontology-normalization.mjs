#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { normalizeOntology } from './build-ontology.mjs';

const source = JSON.parse(fs.readFileSync(new URL('../content/ontology/lupine-ontology.json', import.meta.url), 'utf8'));

function node(dataset, id) {
  return dataset.nodes.find((item) => item.id === id);
}

test('normalizeOntology preserves all source sections and resolves documented import hazards', () => {
  const dataset = normalizeOntology(source);

  assert.equal(dataset.schema, 'lupine-ontology-v1');
  assert.deepEqual(dataset.sourceTopLevelKeys, Object.keys(source));
  assert.equal(dataset.sourceTopLevelKeys.length, 27);
  assert.equal(dataset.stats.superClassCount, 37);
  assert.match(dataset.exceptions.find((item) => item.code === 'superclass-figure-count')?.detail || '', /33/);

  assert.deepEqual(node(dataset, 'materialClass:MC9').chain, ['C6', 'C11']);
  assert.deepEqual(node(dataset, 'discoveryChain:C4').readiness, {
    grade: 'M',
    annotation: 'M (L→M boundary)',
  });
  assert.deepEqual(node(dataset, 'discoveryChain:C11').readiness, {
    grade: 'M',
    annotation: 'M (upgraded from draft L)',
  });

  for (const [type, ids] of Object.entries({
    excludedClass: ['X1', 'X2', 'X3'],
    falsifier: ['F1', 'F2', 'F3'],
    risk: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'],
    skepticEpisode: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'],
    climateTarget: ['CT1', 'CT2', 'CT3', 'CT4', 'CT5'],
  })) {
    assert.deepEqual(dataset.nodes.filter((item) => item.type === type).map((item) => item.sourceId), ids);
  }

  assert.ok(dataset.nodes.every((item) => ['OBS', 'INF', 'TRN', 'PRP', 'FRC', 'unspecified'].includes(item.marker)));
  assert.ok(dataset.nodes.every((item) => item.readiness?.grade && item.readiness?.annotation));
  assert.ok(dataset.nodes.every((item) => item.confidence?.grade && item.confidence?.annotation));
  assert.ok(dataset.nodes.every((item) => item.asOf === '2026-07-30'));
});

test('normalizeOntology emits explicit, resolved FK links and the collision-safe versioned relation vocabulary', () => {
  const dataset = normalizeOntology(source);
  const relations = new Set(dataset.edgeLabels);
  const nodeIds = new Set(dataset.nodes.map((item) => item.id));

  assert.equal(dataset.relations.length, 34);
  for (const name of ['claim.correctedBy', 'lever.correctedBy', 'chain.gatedBy', 'program.gatedBy']) {
    assert.ok(relations.has(name), `missing ${name}`);
  }
  assert.ok(dataset.links.length > 0);
  assert.ok(dataset.links.every((item) => nodeIds.has(item.source) && nodeIds.has(item.target)));
  assert.ok(dataset.links.every((item) => relations.has(item.relation)));
  assert.deepEqual(dataset.unresolvedForeignKeys, []);

  const mc9Chains = dataset.links
    .filter((item) => item.source === 'materialClass:MC9' && item.sourceField === 'chain')
    .map((item) => item.target)
    .sort();
  assert.deepEqual(mc9Chains, ['discoveryChain:C11', 'discoveryChain:C6']);

  for (let index = 1; index <= 11; index += 1) {
    assert.ok(dataset.links.some((item) =>
      item.source === `discoveryChain:C${index}` &&
      item.target === `acceptanceTest:Z${index}` &&
      item.relation === 'chain.gatedBy'
    ));
  }
  assert.equal(dataset.links.some((item) => item.source === 'materialClass:C10'), false);
  assert.ok(dataset.exceptions.some((item) => item.code === 'meta-chain-no-material-class' && item.subject === 'discoveryChain:C10'));
});

test('normalizeOntology preserves all fuzzy time gates and freshness dates', () => {
  const dataset = normalizeOntology(source);
  const gates = dataset.nodes.filter((item) => item.type === 'timeGate');

  assert.equal(gates.length, 12);
  assert.deepEqual([...new Set(gates.map((item) => item.family))].sort(), ['calendar', 'weather']);
  assert.ok(gates.some((item) => item.date === '~2026-11'));
  assert.ok(gates.some((item) => item.date === 'end-2027'));
  assert.deepEqual(dataset.freshness, {
    atlasDate: '2026-07-30',
    nextReverification: '2026-11-10',
    nextReverificationAnnotation: '2026-11-10 (rare-earth suspension)',
    proofPackDate: '2026-07-09',
    proofPackStatus: 'Draft',
    verified: source.freshnessLayer.verified,
  });
});


test('v2 normalization preserves raw source and IDs without inventing observations', () => {
  const before = structuredClone(source);
  const changed = structuredClone(source);
  changed.discoveryChains[0].testAnnotation = '[OBS] explicit observation';
  const plain = normalizeOntology(source);
  const annotated = normalizeOntology(changed);
  assert.equal(plain.normalizationVersion, 2);
  assert.deepEqual(source, before);
  assert.deepEqual(plain.rawAtlas, before);
  assert.deepEqual(plain.nodes.map(n => n.id), annotated.nodes.map(n => n.id));
  assert.equal(plain.nodes.find(n => n.id === 'discoveryChain:C4').marker, 'unspecified');
  const explicit = annotated.nodes.find(n => n.id === `discoveryChain:${changed.discoveryChains[0].id}`);
  assert.equal(explicit.marker, 'OBS');
  assert.equal(explicit.markerAssignment, 'explicit');
  assert.ok(plain.nodes.some(n => n.markerAssignment === 'heuristic'));
  assert.ok(plain.nodes.every(n => n.marker !== 'OBS' || n.markerAssignment === 'explicit'));
  assert.ok(plain.links.filter(l => l.relation === 'markedAs').every(l =>
    ['explicit', 'heuristic'].includes(l.provenance.assignment)));
});

test('classification edges are not causal inheritance and retain legacy IDs', () => {
  const data = normalizeOntology(source);
  for (const [field, relation] of [['materialClasses.dominantErrorTypes', 'hasDominantErrorType'],
                                 ['scoreboard.types', 'hasErrorType']]) {
    const links = data.links.filter(l => l.sourceField === field);
    assert.ok(links.length);
    assert.ok(links.every(l => l.relation === relation && l.legacyRelation === 'inheritsErrorFrom'));
    assert.ok(links.every(l => l.id.startsWith('inheritsErrorFrom:')));
  }
  assert.deepEqual(data.relationAliases.inheritsErrorFrom, ['hasDominantErrorType', 'hasErrorType']);
});
