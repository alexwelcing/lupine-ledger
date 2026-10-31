import test from 'node:test';
import assert from 'node:assert/strict';
import { extractDocumentDate } from './document-date.mjs';
test('extracts only explicit document header dates with their location', () => {
  assert.deepEqual(extractDocumentDate('# Study\n\n**Date:** 2026-06-16  '), {value:'2026-06-16',label:'Document date',basis:'document-header',sourceLine:3});
  assert.equal(extractDocumentDate('**Lupine Science · 26 October 2026 · Retrospective technical article**').value,'2026-10-26');
});
test('does not promote experiment, file, section or invalid dates to document recency', () => {
  for (const md of ['# Study 2026-06-16','File: study-2026-06-16.md','Updated export: 2026-06-16','Experiment date: 2026-06-16',
    '## Results\nDate: 2026-06-16','```\nDate: 2026-06-16\n```','**Date:** 2026-02-30', '\n'.repeat(12)+'Date: 2026-06-16']) assert.equal(extractDocumentDate(md),null,md);
});
