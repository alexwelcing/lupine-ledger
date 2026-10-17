import test from 'node:test';
import assert from 'node:assert/strict';
import { readerPassage, scrollReaderPassage, reviewedPassageRoute } from '../src/readerPassage.js';

test('reviewed edge exposes only its own source-scoped passage route', () => {
  const edge = { source: 'article:formal-proof-ledger', passageAnchor: 'verdicts',
    articleRoute: '#/read/formal-proof-ledger?passage=verdicts', provenance: { confidence: 'extracted-reviewed' } };
  assert.equal(reviewedPassageRoute(edge), edge.articleRoute);
  assert.equal(readerPassage(edge.articleRoute), 'verdicts');
  assert.equal(reviewedPassageRoute({ ...edge, articleRoute: '#/read/another?passage=verdicts' }), null);
  assert.equal(reviewedPassageRoute({ ...edge, provenance: { confidence: 'suggested' } }), null);
  assert.equal(readerPassage('#/read/plain'), '');
  assert.equal(readerPassage('#/read/plain?passage=a%20b'), 'a b');
});

test('passage lookup uses only current article even with duplicate corpus IDs', () => {
  let scrolled = 0;
  const target = { id: 'verdicts', scrollIntoView: options => { scrolled++; assert.equal(options.block, 'start'); } };
  const body = { isConnected: true, querySelectorAll: selector => { assert.equal(selector, '[id]'); return [target]; } };
  const previous = globalThis.document;
  globalThis.document = { getElementById() { throw new Error('global corpus lookup forbidden'); } };
  try {
    assert.equal(scrollReaderPassage(body, 'verdicts'), true);
    assert.equal(scrollReaderPassage(body, 'missing'), false);
    assert.equal(scrollReaderPassage({ ...body, isConnected: false }, 'verdicts'), false);
    assert.equal(scrolled, 1);
  } finally { if (previous === undefined) delete globalThis.document; else globalThis.document = previous; }
});
