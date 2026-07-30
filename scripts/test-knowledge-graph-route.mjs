#!/usr/bin/env node
import assert from 'node:assert/strict';
import test from 'node:test';

import { parseHashRoute, parseKnowledgeGraphHash } from '../src/knowledgeGraphView.js';

test('parseHashRoute keeps graph query parameters out of the route name', () => {
  assert.deepEqual(parseHashRoute('#/graph?focus=tag%3Amlip'), { path: 'graph', arg: '' });
  assert.deepEqual(parseHashRoute('#/graph/article-one?mode=local'), { path: 'graph', arg: 'article-one' });
});

test('parseKnowledgeGraphHash restores graph focus and filter state', () => {
  assert.deepEqual(parseKnowledgeGraphHash('#/graph'), {
    initialFocus: '',
    initialState: {},
  });
  assert.deepEqual(
    parseKnowledgeGraphHash('#/graph/article%20one?mode=topics&q=lean+proof&rels=tagged%2Cco-topic'),
    {
      initialFocus: 'article one',
      initialState: {
        mode: 'topics',
        query: 'lean proof',
        relations: 'tagged,co-topic',
      },
    },
  );
  assert.deepEqual(parseKnowledgeGraphHash('#/graph?focus=tag%3Amlip'), {
    initialFocus: '',
    initialState: { focusNodeId: 'tag:mlip' },
  });
});
