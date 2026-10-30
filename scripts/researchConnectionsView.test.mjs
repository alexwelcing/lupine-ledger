import test from 'node:test';
import assert from 'node:assert/strict';
import { renderResearchConnections } from '../src/researchConnectionsView.js';
import { canonicalEvidence } from '../src/publicResearchEvidence.js';
import { fixture, digest, endpoint, sha } from './public-research-fixture.mjs';

// A deliberately small DOM: model text must use safe DOM text rather than HTML.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.className = ''; this.attributes = {}; this._text = ''; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set innerHTML(_) { throw Error('Connections must not execute authored HTML'); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this._text = ''; this.children = children; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  get classList() { return { remove: name => { this.className = this.className.split(' ').filter(c => c !== name).join(' '); } }; }
}
const nodes = root => [root, ...root.children.flatMap(nodes)];
const byClass = (root, name) => nodes(root).find(node => node.className.split(' ').includes(name));
const button = (root, label) => nodes(root).find(node => node.tag === 'button' && node.textContent === label);
const tick = () => new Promise(resolve => setImmediate(resolve));
async function settle(count = 20) { for (let i = 0; i < count; i++) await tick(); }
function dom() {
  const saved = { document: globalThis.document, history: globalThis.history };
  const routes = [];
  globalThis.document = { createElement: tag => new Element(tag), createTextNode: text => { const n = new Element('#text'); n.textContent = text; return n; } };
  globalThis.history = { replaceState: (_, __, route) => routes.push(route) };
  return { mount: new Element('main'), routes, restore() { for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } } };
}
async function prepare(items, { verified = true, ...extra } = {}) {
  for (const item of items) item.record.hashes[0].sha256 = await digest(canonicalEvidence(item.evidence));
  const state = { records: items.map(item => item.record).sort((a, b) => b.observedAt.localeCompare(a.observedAt) || b.id.localeCompare(a.id)), evidence: {}, source: 'live', archiveComplete: true, archiveLoading: false, ...extra };
  if (verified) for (const item of items) state.evidence[item.record.id] = { status: 'verified', evidence: item.evidence, sha256: item.record.hashes[0].sha256 };
  return state;
}
function storeFor(state, items, overrides = {}) {
  const known = new Map(items.map(item => [item.record.id, item])), subscribers = new Set();
  const calls = { records: [], evidence: [], refresh: 0, archive: 0, unsubscribed: 0 };
  const emit = () => { for (const listener of subscribers) listener(state); };
  const store = { endpoint, state, calls, emit,
    subscribe(fn) { subscribers.add(fn); fn(state); return () => { subscribers.delete(fn); calls.unsubscribed++; }; },
    refresh() { calls.refresh++; }, loadMore() { calls.archive++; },
    async loadRecord(id) { calls.records.push(id); const item = known.get(id); if (item && !state.records.some(record => record.id === id)) { state.records.push(item.record); emit(); } },
    async loadEvidence(id) { calls.evidence.push(id); const item = known.get(id); if (item && !state.evidence[id]) { state.evidence[id] = { status: 'verified', evidence: item.evidence, sha256: item.record.hashes[0].sha256 }; emit(); } },
    ...overrides,
  }; return store;
}
async function chain() { return Promise.all(['evidence', 'methods', 'reviewer', 'principal'].map((role, i) => fixture(role, String.fromCharCode(97 + i)))); }
async function independent(number) {
  const item = await fixture(), key = number.toString(16).padStart(64, '0');
  item.record.id = item.record.activityId = 'discovery-' + key;
  item.evidence.provenance.archiveSha256 = key;
  item.evidence.topic.id = 'topic-' + key;
  item.evidence.topic.question = `Independent software test question ${number}`;
  item.evidence.provenance.completedAt = item.record.observedAt = item.record.reviewedAt = '2026-10-30T14:00:00.000Z';
  return item;
}

test('connection filters and search expose exact branches and shared sources with limitations', async () => {
  const all = await chain(), child = await fixture('evidence', 'e'), unrelated = await independent(30);
  child.evidence.topic = { id: 'topic-' + sha('9'), question: all[3].evidence.report.questions[0], parentTopicId: all[3].evidence.topic.id, parentPublicationId: all[3].record.id, parentQuestionIndex: 0 };
  const ref = 'src-' + sha('8'); unrelated.evidence.sources[0].reference = ref; unrelated.evidence.sources[0].semanticSha256 = sha('8');
  unrelated.evidence.report.claims[0].sourceReferences = [ref]; unrelated.evidence.report.concepts[0].sourceReferences = [ref];
  const items = [...all, child, unrelated], store = storeFor(await prepare(items), items), d = dom(); let dispose;
  try {
    dispose = renderResearchConnections(d.mount, store, '#/connections');
    assert.equal(byClass(d.mount, 'connections-list-heading').textContent, '3 research questions');
    button(d.mount, 'Follow-ups').onclick();
    assert.equal(byClass(d.mount, 'connections-list-heading').textContent, '2 research questions');
    assert.ok(byClass(d.mount, 'connections-branches').textContent.includes('does not mark the question as answered'));
    assert.ok(nodes(d.mount).some(n => n.href === `#/activity/${all[3].record.id}?question=0`));
    button(d.mount, 'Shared sources').onclick();
    assert.equal(byClass(d.mount, 'connections-list-heading').textContent, '2 research questions');
    assert.ok(d.mount.textContent.includes('not agreement between findings'));
    const search = nodes(d.mount).find(n => n.tag === 'input'); search.value = 'Independent software test question 30'; search.oninput();
    assert.ok(d.mount.textContent.includes('No matching connections'));
    button(d.mount, 'All questions').onclick(); assert.equal(byClass(d.mount, 'connections-list-heading').textContent, '1 research question');
    assert.ok(d.mount.textContent.includes('Not published in this view'));
    assert.ok(d.mount.textContent.includes('controller-reported'));
  } finally { dispose?.(); await settle(); d.restore(); }
});

test('request queue has at most three outstanding reads and disposing cancels queued work', async () => {
  const items = await Promise.all(Array.from({ length: 18 }, (_, i) => independent(i + 10))), state = await prepare(items, { verified: false });
  const releases = [], reads = [], evidenceReads = [];
  const store = storeFor(state, items, { loadRecord(id) { reads.push(id); return new Promise(resolve => releases.push(resolve)); }, async loadEvidence(id) { evidenceReads.push(id); } });
  const d = dom(); let dispose;
  try {
    dispose = renderResearchConnections(d.mount, store, '#/connections'); await tick();
    assert.equal(reads.length, 3); assert.equal(evidenceReads.length, 0);
    dispose(); dispose = null; releases.forEach(resolve => resolve()); await settle();
    assert.equal(reads.length, 3); assert.equal(evidenceReads.length, 0); assert.equal(store.calls.unsubscribed, 1);
  } finally { dispose?.(); releases.forEach(resolve => resolve()); await settle(); d.restore(); }
});

test('finite request budget never fetches more than forty report identities or polls the feed', async () => {
  const items = await Promise.all(Array.from({ length: 55 }, (_, i) => independent(i + 10))), store = storeFor(await prepare(items), items), d = dom(); let dispose;
  try {
    dispose = renderResearchConnections(d.mount, store, '#/connections'); await settle();
    assert.equal(new Set(store.calls.records).size, 12);
    for (let i = 0; i < 3; i++) { button(d.mount, 'Load more research').onclick(); await settle(); }
    assert.equal(new Set(store.calls.records).size, 40); assert.equal(store.calls.records.length, 40);
    assert.equal(store.calls.refresh, 1); assert.equal(store.calls.archive, 0);
    assert.ok(d.mount.textContent.includes('View limit 40/40'));
  } finally { dispose?.(); await settle(); d.restore(); }
});

test('deep-linked old report loads its exact predecessors before exhausting the newest-page budget', async () => {
  const old = await chain(), newer = await Promise.all(Array.from({ length: 45 }, (_, i) => independent(i + 10))), all = [...old, ...newer];
  const state = await prepare(all); for (const item of old.slice(0, 3)) delete state.evidence[item.record.id];
  const store = storeFor(state, all), d = dom(); let dispose;
  try {
    dispose = renderResearchConnections(d.mount, store, `#/connections?report=${old[3].record.id}`); await settle();
    for (const item of old) assert.ok(store.calls.records.includes(item.record.id), `missing focused ancestry ${item.evidence.report.role}`);
    assert.equal(byClass(d.mount, 'connections-question-head').children.find(n => n.tag === 'h2').textContent, old[3].evidence.topic.question);
    assert.ok(byClass(d.mount, 'connections-report-trail').textContent.includes('Builds on:'));
    assert.ok(new Set(store.calls.records).size <= 12);
  } finally { dispose?.(); await settle(); d.restore(); }
});

test('superseded reports remain marked historical and cannot supply the current summary', async () => {
  const all = await chain(), correction = await fixture('principal', 'f');
  all[3].evidence.report.summary = 'Earlier summary retained solely for correction history.';
  correction.evidence.report.summary = 'Corrected summary used for the current report.';
  correction.record.supersedes = all[3].record.id; correction.record.correctionReason = 'Synthetic correction regression.';
  correction.evidence.provenance.completedAt = correction.record.observedAt = correction.record.reviewedAt = '2026-10-30T13:00:00.000Z';
  const items = [...all, correction], store = storeFor(await prepare(items), items), d = dom(); let dispose;
  try {
    dispose = renderResearchConnections(d.mount, store, '#/connections');
    const summary = byClass(d.mount, 'connections-latest');
    assert.ok(summary.textContent.includes(correction.evidence.report.summary));
    assert.ok(!summary.textContent.includes(all[3].evidence.report.summary));
    assert.match(d.mount.textContent, /supersed|historical/i);
    assert.ok(nodes(d.mount).some(n => n.href === `#/activity/${correction.record.id}` && /correction/i.test(n.textContent)));
  } finally { dispose?.(); await settle(); d.restore(); }
});

test('missing ancestry and saved partial coverage remain explicit without fabricated follow-ups', async () => {
  const all = await chain(), child = await fixture('evidence', 'e');
  child.evidence.topic = { id: 'topic-' + sha('9'), question: all[3].evidence.report.questions[0], parentTopicId: all[3].evidence.topic.id, parentPublicationId: all[3].record.id, parentQuestionIndex: 0 };
  const items = [child], store = storeFor(await prepare(items, { source: 'saved', archiveComplete: false }), items), d = dom(); let dispose;
  try {
    dispose = renderResearchConnections(d.mount, store, '#/connections');
    assert.ok(d.mount.textContent.includes('exact question and report sequence are not verified'));
    assert.ok(!byClass(d.mount, 'connections-parent'));
    assert.ok(byClass(d.mount, 'connections-coverage').textContent.includes('partial archive'));
    assert.ok(byClass(d.mount, 'connections-coverage').textContent.includes('saved or unavailable'));
    assert.equal(store.calls.archive, 1);
    assert.ok(!nodes(d.mount).some(n => n.href === `#/activity/${all[3].record.id}?question=0`));
  } finally { dispose?.(); await settle(); d.restore(); }
});

test('question permalinks carry a report identity and reopen a cold investigation', async () => {
  const all = await chain(); await prepare(all);
  const state = await prepare([]), store = storeFor(state, all), d = dom(); let dispose;
  try {
    const topicId = all[3].evidence.topic.id;
    dispose = renderResearchConnections(d.mount, store, `#/connections?topic=${topicId}&report=${all[3].record.id}`);
    assert.ok(d.mount.textContent.includes('This question is not yet in the loaded evidence'));
    await settle();
    assert.equal(byClass(d.mount, 'connections-question-head').children.find(n => n.tag === 'h2').textContent, all[3].evidence.topic.question);
    const permalink = byClass(d.mount, 'connections-permalink');
    const params = new URLSearchParams(permalink.href.split('?')[1]);
    assert.equal(params.get('topic'), topicId); assert.equal(params.get('report'), all[3].record.id);
    for (const item of all) assert.ok(store.calls.evidence.includes(item.record.id));
    assert.ok(byClass(d.mount, 'connections-report-trail').textContent.includes('Builds on:'));
  } finally { dispose?.(); await settle(); d.restore(); }
});

test('an absent topic bookmark does not silently show an unrelated investigation', async () => {
  const item = await fixture(), store = storeFor(await prepare([item]), [item]), d = dom(); let dispose;
  try {
    dispose = renderResearchConnections(d.mount, store, '#/connections?topic=topic-' + sha('9'));
    assert.ok(d.mount.textContent.includes('This question is not yet in the loaded evidence'));
    assert.equal(byClass(d.mount, 'connections-question-head'), undefined);
    button(d.mount, 'Show available questions').onclick();
    assert.equal(byClass(d.mount, 'connections-question-head').children.find(n => n.tag === 'h2').textContent, item.evidence.topic.question);
    assert.equal(d.routes.at(-1), '#/connections');
  } finally { dispose?.(); await settle(); d.restore(); }
});
