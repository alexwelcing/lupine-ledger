#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildKnowledgeGraph } from './build-knowledge-graph.mjs';

const catalog = {
  categories: [
    { id: 'methods', label: { en: 'Methods' }, blurb: { en: 'How we work.' } },
  ],
  statuses: {
    supported: { label: { en: 'Supported' }, gloss: { en: 'Evidence backed.' }, color: '#22c55e' },
  },
  entries: [
    {
      id: 'alpha',
      source: 'articles/alpha.md',
      title: 'Alpha',
      subtitle: 'First article',
      category: 'methods',
      tags: ['geometry', 'mlip', 'shared'],
      status: 'supported',
      group: 'flywheel',
      featured: true,
    },
    {
      id: 'beta',
      source: 'articles/beta.md',
      title: 'Beta',
      subtitle: 'Second article',
      category: 'methods',
      tags: ['geometry', 'mlip', 'shared'],
      status: 'supported',
      group: 'flywheel',
    },
  ],
};

test('buildKnowledgeGraph creates a deterministic, provenance-bearing library ontology', () => {
  const options = {
    source: { repo: 'fixture', commit: 'abc123' },
    generatedAt: '2026-07-30T00:00:00.000Z',
  };
  const first = buildKnowledgeGraph(catalog, options);
  const second = buildKnowledgeGraph(catalog, options);

  assert.deepEqual(second, first);
  assert.equal(first.schema, 'lupine-library-knowledge-graph-v1');
  assert.equal(first.scope, 'library-only');
  assert.deepEqual(first.stats, {
    nodes: first.nodes.length,
    links: first.links.length,
    articleCount: 2,
    categoryCount: 1,
    statusCount: 1,
    groupCount: 1,
    tagCount: 3,
    relationCounts: {
      program: 1,
      contains: 2,
      tagged: 6,
      lifecycle: 2,
      grouped: 2,
      related: 1,
      'co-topic': 3,
    },
  });

  assert.deepEqual(
    new Set(first.nodes.map((node) => node.type)),
    new Set(['corpus', 'category', 'status', 'group', 'tag', 'article']),
  );
  assert.deepEqual(
    new Set(first.links.map((link) => link.relation)),
    new Set(['program', 'contains', 'tagged', 'lifecycle', 'grouped', 'related', 'co-topic']),
  );
  assert.ok(first.nodes.every((node) => Number.isFinite(node.position?.x) && Number.isFinite(node.position?.y)));
  assert.ok(first.links.every((link) => link.provenance?.source && link.provenance?.method && link.provenance?.confidence));
  assert.deepEqual(first.ontology.confidenceValues, ['declared', 'derived', 'extracted-reviewed', 'suggested']);
});
