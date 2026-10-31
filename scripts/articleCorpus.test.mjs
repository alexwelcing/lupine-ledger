import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCorpusLoader } from '../src/articleCorpus.js';

const article = (id, lang = 'en', html = `<h2 id="${id}">${id}</h2>`) => ({ id, lang, html });
const corpus = (version = 'v1', articles = [article('alpha'), article('beta')]) => ({ version, articles });
const response = (value, { status = 200, type = 'application/json; charset=utf-8' } = {}) =>
  new Response(JSON.stringify(value), { status, headers: { 'content-type': type } });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('concurrent readers and search share one corpus request and subsequent reads stay in memory', async () => {
  const pending = deferred(), requests = [];
  const load = createCorpusLoader((...args) => { requests.push(args); return pending.promise; });
  const one = load({ version: 'v1', expectedIds: ['alpha'] });
  const two = load({ version: 'v1', expectedIds: ['alpha', 'beta'] });
  const three = load({ version: 'v1' });
  pending.resolve(response(corpus()));
  const [a, b, c] = await Promise.all([one, two, three]);
  assert.equal(requests.length, 1);
  assert.equal(a, b); assert.equal(b, c);
  assert.equal(await load({ version: 'v1', expectedIds: ['beta'] }), a);
  assert.equal(requests.length, 1);
  assert.equal(new URL(requests[0][0], 'https://library.lupine.science').pathname, '/data/corpus.json');
});

test('a failed shared request can be retried explicitly without replaying it for each waiting reader', async () => {
  const pending = deferred(); let calls = 0;
  const load = createCorpusLoader(() => ++calls === 1 ? pending.promise : Promise.resolve(response(corpus())));
  const waiting = Promise.allSettled([load({ version: 'v1' }), load({ version: 'v1' })]);
  pending.reject(new Error('temporarily unavailable'));
  assert((await waiting).every(result => result.status === 'rejected'));
  assert.equal(calls, 1);
  assert.equal((await load({ version: 'v1' })).articles.length, 2);
  assert.equal(calls, 2);
});

test('synchronous fetch errors do not poison later attempts', async () => {
  let calls = 0;
  const load = createCorpusLoader(() => {
    if (++calls === 1) throw new Error('fetch unavailable');
    return Promise.resolve(response(corpus()));
  });
  await assert.rejects(async () => load({ version: 'v1' }));
  assert.equal((await load({ version: 'v1' })).version, 'v1');
  assert.equal(calls, 2);
});

test('different manifest versions have independent requests and cannot overwrite each other out of order', async () => {
  const oldRequest = deferred(), newRequest = deferred(); let calls = 0;
  const load = createCorpusLoader(() => ++calls === 1 ? oldRequest.promise : newRequest.promise);
  const oldVersion = load({ version: 'v1' }), newVersion = load({ version: 'v2' });
  newRequest.resolve(response(corpus('v2')));
  assert.equal((await newVersion).version, 'v2');
  oldRequest.resolve(response(corpus('v1')));
  assert.equal((await oldVersion).version, 'v1');
  assert.equal((await load({ version: 'v2' })).version, 'v2');
  assert.equal((await load({ version: 'v1' })).version, 'v1');
  assert.equal(calls, 2);
});

test('HTTP failures, HTML fallbacks and invalid JSON are rejected and never accepted as an empty collection', async () => {
  for (const makeResponse of [
    () => response(corpus(), { status: 503 }),
    () => response(corpus(), { type: 'text/html' }),
    () => new Response('<!doctype html><title>Offline</title>', { headers: { 'content-type': 'application/json' } }),
  ]) {
    let calls = 0;
    const load = createCorpusLoader(async () => ++calls === 1 ? makeResponse() : response(corpus()));
    await assert.rejects(load({ version: 'v1' }));
    assert.equal((await load({ version: 'v1' })).articles.length, 2);
    assert.equal(calls, 2);
  }
});

test('a stale deployment corpus is rejected against the current manifest version and a later fresh response works', async () => {
  let calls = 0;
  const load = createCorpusLoader(async () => response(corpus(++calls === 1 ? 'v0' : 'v1')));
  await assert.rejects(load({ version: 'v1' }));
  assert.equal((await load({ version: 'v1' })).version, 'v1');
  assert.equal(calls, 2);
});

test('invalid corpus shapes and duplicate article-language identities fail before any caller receives data', async () => {
  for (const invalid of [
    null,
    [],
    {},
    { version: 1, articles: [] },
    { version: 'v1', articles: {} },
    corpus('v1', [null]),
    corpus('v1', [{ lang: 'en', html: '' }]),
    corpus('v1', [{ id: '', lang: 'en', html: '' }]),
    corpus('v1', [{ id: 'alpha', lang: 'en', html: 42 }]),
    corpus('v1', [article('alpha'), article('alpha')]),
  ]) {
    const load = createCorpusLoader(async () => response(invalid));
    await assert.rejects(load({ version: 'v1' }), `should reject ${JSON.stringify(invalid)}`);
  }
});

test('a translation cannot stand in for a missing English article required by the manifest', async () => {
  const load = createCorpusLoader(async () => response(corpus('v1', [article('alpha'), article('beta', 'fr')])));
  await assert.rejects(load({ version: 'v1', expectedIds: ['alpha', 'beta'] }));
});

test('completeness is checked for each caller even when a prior caller already cached this version', async () => {
  const load = createCorpusLoader(async () => response(corpus('v1', [article('alpha')])));
  assert.equal((await load({ version: 'v1', expectedIds: ['alpha'] })).articles.length, 1);
  await assert.rejects(load({ version: 'v1', expectedIds: ['alpha', 'beta'] }));
});

test('a partial collection does not poison the explicit retry after the server has recovered', async () => {
  let calls = 0;
  const load = createCorpusLoader(async () => response(++calls === 1
    ? corpus('v1', [article('alpha')]) : corpus('v1')));
  await assert.rejects(load({ version: 'v1', expectedIds: ['alpha', 'beta'] }));
  assert.equal((await load({ version: 'v1', expectedIds: ['alpha', 'beta'] })).articles.length, 2);
  assert.equal(calls, 2);
});

test('one article can retain distinct language variants without changing source HTML or anchor identifiers', async () => {
  const richHtml = '<h2 id="derivation">A &amp; B</h2><math><mi>x</mi></math><table><tr><td>42</td></tr></table><a href="#derivation">Derivation</a>';
  const value = corpus('v1', [article('alpha', 'en', richHtml), article('alpha', 'fr', '<p>Une traduction.</p>')]);
  const load = createCorpusLoader(async () => response(value));
  const loaded = await load({ version: 'v1', expectedIds: ['alpha'] });
  assert.equal(loaded.articles.length, 2);
  assert.equal(loaded.articles[0].html, richHtml);
  assert.deepEqual(loaded, value);
});

test('the built corpus satisfies the real manifest and preserves every complete article in memory without a DOM', async () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../dist/data/library.json', import.meta.url), 'utf8'));
  const data = JSON.parse(fs.readFileSync(new URL('../dist/data/corpus.json', import.meta.url), 'utf8'));
  const load = createCorpusLoader(async () => response(data));
  const loaded = await load({ version: manifest.version, expectedIds: manifest.articles.map(a => a.id) });
  assert.equal(loaded.version, manifest.version);
  assert.equal(loaded.articles.filter(a => a.lang === 'en').length, manifest.articles.length);
  for (const entry of manifest.articles) {
    const stored = JSON.parse(fs.readFileSync(new URL(`../dist/data/${entry.id}.json`, import.meta.url), 'utf8'));
    assert.equal(loaded.articles.find(a => a.id === entry.id && a.lang === 'en').html, stored.html);
  }
});
