#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('knowledge graph explorer exposes ontology mode, freshness, and epistemic chrome', () => {
  const view = read('../src/knowledgeGraphView.js');
  const styles = read('../src/styles.css');

  assert.match(view, /id: 'ontology'/);
  assert.match(view, /graph\.mode\.\$\{mode\.id\}/);
  assert.match(view, /atlasDate/);
  assert.doesNotMatch(view, /nextReverification/, 'no scheduled re-verification date in the reader');
  assert.doesNotMatch(view, /proofPack/, 'the retired proof pack is not advertised');
  assert.match(view, /graph\.freshness\.direction/);
  assert.match(view, /kg-freshness/);
  assert.match(view, /kg-epistemic/);
  assert.match(view, /selected\.marker/);
  assert.match(view, /selected\.readiness/);
  assert.match(view, /selected\.confidence/);
  assert.match(view, /selected\.asOf/);

  for (const selector of ['.kg-freshness', '.kg-epistemic', '.kg-marker', '.kg-readiness', '.kg-confidence']) {
    assert.match(styles, new RegExp(`\\${selector}\\b`), `missing ${selector} style`);
  }
});
