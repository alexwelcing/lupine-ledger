import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { activityFreshness, createActivityController, isPublicSourceUrl, validateActivity, validateFeed, FEED_SCHEMA, RECORD_SCHEMA, STALE_AFTER_MS } from '../src/researchActivity.js';
import { loadResearchActivity } from './research-activity-build.mjs';

const NOW = Date.parse('2026-10-06T16:00:00.000Z');
// Explicitly fictional protocol fixture; never copied into the public bundle.
const record = () => ({ schema: RECORD_SCHEMA, id: 'fictional-review-1', activityId: 'fictional-analysis', evidenceKind: 'archived_analysis',
  state: 'completed', verification: 'arithmetic_checked', title: 'Fictional protocol fixture', summary: 'Synthetic record for software tests only.',
  observedAt: '2026-10-06T14:00:00.000Z', reviewedAt: '2026-10-06T15:00:00.000Z', datasets: [{ name: 'Fictional panel', configurations: 2 }],
  findings: ['Synthetic fixture result.'], limitations: ['Not a scientific observation.'], nextStep: 'Exercise the reader contract.',
  sources: [{ label: 'Public repository', url: 'https://github.com/alexwelcing/lupine-rhizo' }], hashes: [], repositoryLinks: [], releaseLinks: [], supersedes: null, correctionReason: null });
const feed = () => ({ schema: FEED_SCHEMA, items: [record()], truncated: false });
const response = value => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
const storage = () => { const values = new Map(); return { getItem: k => values.get(k), setItem: (k, v) => values.set(k, v) }; };
const endpoint = 'https://glim-think-v1.aw-ab5.workers.dev/research/activity?limit=20';

test('accepts the producer contract and actual reviewed bundle', () => {
  assert.equal(validateFeed(feed(), NOW).items.length, 1);
  const published = JSON.parse(fs.readFileSync(new URL('../content/research-activity.json', import.meta.url)));
  assert.ok(validateFeed(published).items.length > 0);
});
test('workflow repairs retain their explicit kind without scientific receipts', () => {
  const repair = { ...record(), evidenceKind: 'workflow_repair', verification: 'source_checked', datasets: [] };
  assert.equal(validateActivity(repair, NOW).evidenceKind, 'workflow_repair');
  assert.throws(() => validateActivity({ ...repair, evidenceKind: 'unknown_kind' }, NOW));
  assert.throws(() => validateActivity({ ...repair, receipt: 'fabricated' }, NOW));
});
test('rejects private fields, paths, identifiers, tokens and malformed shapes', () => {
  const mutations = [
    r => { r.stdout = 'private model log'; }, r => { r.summary = '/Users/person/private/result.json'; },
    r => { r.summary = 'Contact name@domain.com'; }, r => { r.summary = 'Produced on aledev'; },
    r => { r.title = '<script>alert(1)</script>'; }, r => { r.summary = 'Bearer private-value'; },
    r => { r.datasets[0].configurations = true; }, r => { r.reviewedAt = '2026-10-06T17:00:00.000Z'; },
    r => { r.observedAt = '2026-10-06T15:30:00.000Z'; }, r => { r.sources[0].url = 'https://localhost/private'; },
    r => { r.sources[0].url = 'https://paper.org/?token=hidden'; }, r => { r.sources = []; },
    r => { r.repositoryLinks = [{ label: 'Other', url: 'https://github.com/other/private' }]; },
    r => { r.supersedes = r.id; }, r => { r.correctionReason = 'No predecessor'; },
  ];
  for (const mutate of mutations) { const candidate = record(); mutate(candidate); assert.throws(() => validateActivity(candidate, NOW)); }
  const duplicate = feed(); duplicate.items.push(record()); assert.throws(() => validateFeed(duplicate, NOW));
  assert.throws(() => validateFeed({ ...feed(), rawPackets: [] }, NOW));
});
test('rejects non-public or credential-bearing source links', () => {
  for (const url of ['http://nature.com/paper', 'https://127.0.0.1/x', 'https://100.99.0.1/x', 'https://host.ts.net/x',
    'https://user:pass@nature.com', 'https://nature.com/%2555sers/secret', 'https://nature.com/?auth=secret', 'https://nature.com/#token=secret']) {
    assert.equal(isPublicSourceUrl(url), false, url);
  }
  assert.equal(isPublicSourceUrl('https://www.nature.com/articles/s41524-025-01758-4'), true);
});
test('new fetch time cannot make old evidence fresh; fallback never becomes live', () => {
  const state = { feed: feed(), source: 'live', checkedAt: NOW + STALE_AFTER_MS };
  assert.equal(activityFreshness(state, NOW + STALE_AFTER_MS).mode, 'stale');
  assert.equal(activityFreshness({ ...state, source: 'snapshot' }, NOW).mode, 'snapshot');
  assert.equal(activityFreshness({ ...state, source: 'saved' }, NOW).mode, 'saved');
  assert.equal(activityFreshness({ ...state, error: true, online: false }, NOW).mode, 'offline');
});
test('uncached live success is saved; failure preserves it without changing evidence or check time', async () => {
  const cache = storage(); let failing = false, latest;
  const c = createActivityController({ endpoint, storage: cache, now: () => NOW, onChange: s => { latest = s; }, fetcher: async (url, options) => {
    assert.equal(options.cache, 'no-store'); assert.equal(options.credentials, 'omit'); assert.equal(options.redirect, 'error');
    if (failing) throw new Error('network down'); return response(feed());
  } });
  await c.refresh(); assert.equal(latest.source, 'live'); assert.equal(latest.checkedAt, NOW);
  failing = true; await c.refresh(); assert.equal(latest.error, true); assert.equal(latest.checkedAt, NOW); assert.deepEqual(latest.feed, feed());
  c.dispose();
  const reopened = createActivityController({ endpoint, storage: cache, now: () => NOW, onChange: s => { latest = s; } });
  assert.equal(latest.source, 'saved'); reopened.dispose();
});
test('timeout is bounded, falls back to snapshot, and never counts as a live check', async () => {
  let latest;
  const c = createActivityController({ endpoint, now: () => NOW, timeoutMs: 10, onChange: s => { latest = s; }, fetcher: async (url, options) => {
    if (url.startsWith('/data/')) return response(feed());
    return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true }));
  } });
  await c.refresh(); assert.equal(latest.source, 'snapshot'); assert.equal(latest.error, true); assert.equal(latest.checkedAt, null); c.dispose();
});
test('invalid live input is rejected and does not replace valid cache', async () => {
  let latest, invalid = false;
  const c = createActivityController({ endpoint, now: () => NOW, onChange: s => { latest = s; }, fetcher: async () => {
    const value = feed(); if (invalid) value.items[0].stdout = 'private'; return response(value);
  } });
  await c.refresh(); invalid = true; await c.refresh();
  assert.equal(latest.error, true); assert.deepEqual(latest.feed, feed()); c.dispose();
});
test('navigation disposal aborts fetch and suppresses late updates; concurrent refresh is deduplicated', async () => {
  let calls = 0, renders = 0, signal;
  const c = createActivityController({ endpoint, onChange: () => { renders++; }, fetcher: async (url, options) => {
    calls++; signal = options.signal;
    return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  } });
  const pending = c.refresh(); await c.refresh(); assert.equal(calls, 1);
  c.dispose(); const before = renders; await pending; assert.equal(signal.aborted, true); assert.equal(renders, before);
});
test('build configuration requires a public origin and validated reviewed file', () => {
  const root = new URL('..', import.meta.url).pathname;
  assert.equal(loadResearchActivity(root, {}).endpoint, endpoint);
  for (const origin of ['http://localhost:8000', 'https://name.ts.net', 'https://safe.org/private', 'https://safe.org/?token=x']) {
    assert.throws(() => loadResearchActivity(root, { LIBRARY_RESEARCH_ACTIVITY_ORIGIN: origin }));
  }
});
