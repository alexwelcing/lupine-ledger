#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('knowledge graph build, validation, CI, route assets, and styles stay wired together', () => {
  const packageJson = JSON.parse(read('../package.json'));
  const build = read('./build.js');
  const buildTest = read('./test-build.mjs');
  const workflow = read('../.github/workflows/deploy.yml');
  const app = read('../src/app.js');
  const styles = read('../src/styles.css');

  assert.match(packageJson.scripts['graph:build'], /build-knowledge-graph\.mjs/);
  assert.match(packageJson.scripts['ontology:build'], /build-ontology\.mjs/);
  assert.match(packageJson.scripts.test, /test-knowledge-graph/);
  assert.match(packageJson.scripts.test, /test-ontology/);
  assert.match(packageJson.scripts.test, /check-graph\.js/);
  assert.match(packageJson.scripts.test, /check-ontology\.mjs/);
  assert.match(build, /writeKnowledgeGraph/);
  assert.match(build, /writeOntology/);
  assert.match(buildTest, /knowledge-graph\.json/);
  assert.match(buildTest, /knowledgeGraphView\.js/);
  assert.match(workflow, /run: npm (?:run )?test/);
  assert.match(app, /renderKnowledgeGraphView/);
  assert.match(app, /path === 'graph'/);

  for (const selector of [
    '.kg',
    '.kg-head',
    '.kg-toolbar',
    '.kg-mode',
    '.kg-relation-chip',
    '.kg-body',
    '.kg-canvas',
    '.kg-svg',
    '.kg-link',
    '.kg-node',
    '.kg-node-label',
    '.kg-legend',
    '.kg-inspector',
    '.kg-relation-item',
    '.kg-match-item',
  ]) {
    assert.match(styles, new RegExp(`\\${selector}\\b`), `missing ${selector} style`);
  }
});
