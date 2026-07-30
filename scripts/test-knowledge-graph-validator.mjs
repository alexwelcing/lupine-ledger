#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildKnowledgeGraph } from './build-knowledge-graph.mjs';
import { validateKnowledgeGraph } from './check-graph.js';

const catalog = {
  categories: [{ id: 'one', label: { en: 'One' } }],
  statuses: { open: { label: { en: 'Open' } } },
  entries: [
    { id: 'a', title: 'A', source: 'a.md', category: 'one', tags: ['x'], status: 'open', group: 'g' },
  ],
};

test('validateKnowledgeGraph reconciles graph statistics to its source catalog', () => {
  const graph = buildKnowledgeGraph(catalog);
  assert.deepEqual(validateKnowledgeGraph(graph, catalog), []);

  graph.stats.tagCount += 1;
  assert.ok(validateKnowledgeGraph(graph, catalog).some((error) => error.message === 'graph stats do not reconcile to source manifest'));
});
