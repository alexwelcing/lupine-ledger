#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { normalizeOntology } from './build-ontology.mjs';
import { validateOntology } from './check-ontology.mjs';

const source = JSON.parse(fs.readFileSync(new URL('../content/ontology/lupine-ontology.json', import.meta.url), 'utf8'));

test('validateOntology accepts the normalized atlas and rejects unresolved foreign keys', () => {
  const ontology = normalizeOntology(source);
  assert.deepEqual(validateOntology(ontology), []);

  ontology.unresolvedForeignKeys.push({ source: 'materialClass:MC1', sourceField: 'chain', value: 'C99' });
  assert.ok(validateOntology(ontology).some((error) => error.message === 'ontology has unresolved foreign keys'));
});
