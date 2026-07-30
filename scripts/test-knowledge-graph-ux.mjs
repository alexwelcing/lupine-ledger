#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { t } from '../src/i18n.js';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('discrete graph transitions push navigable history while live search replaces it', () => {
  const view = read('../src/knowledgeGraphView.js');

  assert.match(view, /history\.pushState\(null, '', next\)/);
  assert.match(view, /search\.addEventListener\('input',[\s\S]*syncUrl\(\{ replace: true \}\)/);
  assert.match(view, /syncUrl\(\{ replace: true \}\);\s*update\(\);\s*return/);
});

test('English and Chinese graph chrome translations are complete', () => {
  const expected = {
    'graph.title': ['Knowledge Graph', '知识图谱'],
    'graph.mode.ontology': ['Ontology', '本体'],
    'graph.search.placeholder': ['Focus MLIP, Lean, funding, topology...', '聚焦 MLIP、Lean、资助、拓扑…'],
    'graph.freshness.next': ['Next re-verification {date}', '下次复核 {date}'],
    'graph.relations': ['Relations', '关系'],
    'graph.stats.nodes': ['nodes', '节点'],
    'graph.inspector.selected': ['Selected', '已选择'],
    'graph.epistemic.readiness': ['Readiness', '就绪度'],
  };

  for (const [key, [en, zh]] of Object.entries(expected)) {
    assert.equal(t(key, 'en', { date: '2030-01-01' }), en.replace('{date}', '2030-01-01'), `${key} English`);
    assert.equal(t(key, 'zh', { date: '2030-01-01' }), zh.replace('{date}', '2030-01-01'), `${key} Chinese`);
  }

  const app = read('../src/app.js');
  const view = read('../src/knowledgeGraphView.js');
  assert.match(app, /lang: STATE\.settings\.lang/);
  assert.match(view, /t\('graph\.title', lang\)/);
});

test('mobile graph controls and SVG nodes expose 44px touch targets without overflow', () => {
  const view = read('../src/knowledgeGraphView.js');
  const styles = read('../src/styles.css');

  assert.match(view, /class: 'kg-node-hit'/);
  assert.match(view, /vector-effect': 'non-scaling-stroke'/);
  assert.match(styles, /\.kg-node-hit\s*\{[\s\S]*stroke-width:\s*44px/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*\.kg-mode,[\s\S]*\.kg-relation-chip[\s\S]*min-height:\s*44px/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*\.kg-toolbar[\s\S]*min-width:\s*0/);
});
