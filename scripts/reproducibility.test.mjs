#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { normalizeOntology } from './build-ontology.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

test('canonical npm test builds dist before post-build checks', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.equal(packageJson.scripts.pretest, 'npm run build');
});

test('ontology provenance is portable and its content hashes verify', () => {
  const provenance = read('content/ontology/PROVENANCE.sha256');
  const lines = provenance.trimEnd().split('\n');

  assert.equal(lines.length, 3);
  assert.doesNotMatch(provenance, /(?:^|\s)\/(?:home|Users)\//m);
  assert.match(lines[2], /^# source: Kimi Agent Centennial Ontology Project \(compiled \d{4}-\d{2}-\d{2}\)$/);

  for (const line of lines.slice(0, 2)) {
    const match = line.match(/^([a-f0-9]{64})  (content\/ontology\/.+)$/);
    assert.ok(match, `invalid provenance hash line: ${line}`);
    const [, expectedHash, relativePath] = match;
    const actualHash = createHash('sha256').update(fs.readFileSync(path.join(ROOT, relativePath))).digest('hex');
    assert.equal(actualHash, expectedHash, `${relativePath} hash does not match provenance`);
  }
});

test('ontology formal-proof inventory matches the current Lean evidence plane', () => {
  const ontology = JSON.parse(read('content/ontology/lupine-ontology.json'));
  const generated = JSON.parse(read('content/ontology/lean-count.json'));
  const formalProof = normalizeOntology(ontology).nodes.find((node) => node.id === 'formalProof:FP1');

  assert.equal(ontology.formalProof.inventorySource, 'content/ontology/lean-count.json');
  assert.equal(ontology.formalProof.theorems, undefined);
  assert.equal(formalProof.theorems, generated.count);
  assert.equal(formalProof.inventoryAsOf, generated.counted_at);
  assert.equal(formalProof.sorryCount, 0);
  assert.equal(generated.zero_sorry, true);
});
