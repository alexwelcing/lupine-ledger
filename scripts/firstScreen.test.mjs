import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { t } from '../src/i18n.js';

// The Library's first screen: the canonical one-liner, three ways in, and search.
// Longer explanations live in the Research Index and on the Research activity page.
const read = file => fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
const brand = JSON.parse(read('brand.json'));
const workspace = read('researchWorkspace.js');
const html = read('index.html');
const ENTRIES = [
  ['#/read/research-index', 'Results & papers'],
  ['#/read/conjecture-ledger', 'Hypothesis ledger'],
  ['#/research', 'Research activity'],
];

test('the first screen states the canonical one-liner from brand.json', () => {
  const oneLiner = workspace.match(/export const ONE_LINER = '([^']+)';/)?.[1];
  assert.equal(oneLiner, brand.organization.oneLine);
  assert.match(workspace, /<p class="workspace-intro-sub">\$\{ONE_LINER\}<\/p>/);
});

test('the first screen offers exactly three entry points, in order', () => {
  const block = workspace.match(/export const ENTRY_POINTS = \[([\s\S]*?)\];/)?.[1] || '';
  const entries = [...block.matchAll(/\['([^']+)', '([^']+)'\]/g)].map(m => [m[1], m[2]]);
  assert.deepEqual(entries, ENTRIES);
  assert.match(workspace, /<nav class="workspace-entry"[^>]*>\$\{ENTRY_POINTS\.map/);
});

test('top-bar navigation is the same three entry points plus search', () => {
  const nav = html.match(/<nav class="site-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
  const links = [...nav.matchAll(/<a href="([^"]+)" data-i18n="([^"]+)">([^<]+)<\/a>/g)];
  assert.deepEqual(links.map(m => [m[1], m[3].replace('&amp;', '&')]), ENTRIES);
  for (const [, , key, text] of links) assert.equal(t(key, 'en'), text.replace('&amp;', '&'));
  assert.match(html, /<button class="icon-btn" id="search-btn"/);
});

test('status labels, the full catalogue, corrections and licence stay reachable', () => {
  assert.match(workspace, /<div class="tile-bottom"><span>\$\{esc\(statusLabel\(a\.status\)\)\}<\/span>/);
  assert.match(workspace, /<a href="#\/tags">Browse all<\/a>/);
  assert.match(workspace, /<a href="https:\/\/lupine\.science\/corrections\/">Corrections log ↗<\/a>/);
  assert.match(workspace, /<p class="workspace-licence">Code MIT · our text and data CC BY 4\.0 unless noted/);
});

test('the journal explanation lives on the Research activity page, not the first screen', () => {
  const activity = read('researchActivityView.js');
  const page = read('publicResearchView.js');
  const panel = activity.slice(activity.indexOf('export function renderResearchActivity'));
  assert.doesNotMatch(panel, /founder reviews|“A6”|activityExplanation/);
  assert.match(activity, /export function activityExplanation\(\)[\s\S]*founder reviews each one[\s\S]*“A6”/);
  assert.match(page, /mount\.replaceChildren\(heading,\.\.\.activityExplanation\(\)/);
});
