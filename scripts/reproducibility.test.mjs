#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

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

  assert.deepEqual(ontology.formalProof, {
    system: 'Lean 4 + Mathlib',
    inventoryAsOf: '2026-08-01',
    modules: 79,
    theorems: 271,
    declarations: 499,
    sorryCount: 0,
    families: [
      'ordering claims (kernel-checked inequalities)',
      'isotonic correction bounds',
      'impossibility proofs with counterexample witnesses',
    ],
    kernelRejectedClaim: '27/36 → 26/36 at 10⁻⁴ J/m² integer precision (one cell margin exactly zero)',
    barrierTheorems: 'Conditional: under ErrorField decomposition + coordination-ordering hypotheses, softened models provably under-read barriers; corrected barriers provably equal reference',
    repository: 'github.com/alexwelcing/lupine-rhizo (AGPL-3.0)',
  });
});
