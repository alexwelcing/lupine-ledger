import test from 'node:test';
import assert from 'node:assert/strict';
import { RESEARCH_ROLE_LABELS, researchPresentation, sourcePresentation } from '../src/researchPresentation.js';
import { RESEARCH_EDITORIAL, SOURCE_EDITORIAL } from '../src/researchEditorial.js';
import { createPublicSearch } from '../src/publicSearch.js';
import { fixture, sha } from './public-research-fixture.mjs';

const releaseUrl = 'https://github.com/lammps/lammps/releases/tag/patch_4July2026';
// These minimal records exercise the presentation contract only. They do not
// stand in for verified evidence bytes or a scientific acceptance test.
function pinnedRecord(id, annotation) {
  return { id, title: `${annotation.role}: patch_4July2026`, sources: [],
    hashes: [{ label: 'Public evidence', sha256: annotation.evidenceSha256 }] };
}
function freezeDeep(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value); for (const child of Object.values(value)) freezeDeep(child);
  }
  return value;
}

test('reviewed report labels require the exact publication identity and evidence pin', () => {
  for (const [id, annotation] of Object.entries(RESEARCH_EDITORIAL)) {
    const record = pinnedRecord(id, annotation), named = researchPresentation(record);
    assert.equal(named.status, 'editorial');
    assert.equal(named.title, annotation.title); assert.equal(named.topicTitle, annotation.topicTitle);
    assert.equal(named.area, annotation.area); assert.deepEqual(named.subjects, annotation.subjects);
    assert.equal(named.evidenceBasis, annotation.evidenceBasis);
    assert.equal(named.roleLabel, RESEARCH_ROLE_LABELS[annotation.role]);
    assert.equal(named.originalTitle, record.title); assert.ok(named.aliases.includes(record.title));
    for (const changed of [
      { ...record, id: `other-${id}` },
      { ...record, hashes: [{ label: 'Public evidence', sha256: sha('0') }] },
      { ...record, hashes: [{ label: 'Other receipt', sha256: annotation.evidenceSha256 }] },
      { ...record, hashes: [] },
    ]) {
      const fallback = researchPresentation(changed);
      assert.notEqual(fallback.status, 'editorial'); assert.notEqual(fallback.title, annotation.title);
      assert.equal(fallback.area, 'Unclassified'); assert.deepEqual(fallback.subjects, []);
      assert.equal(fallback.evidenceBasis, 'Evidence scope not yet classified');
    }
  }
});

test('source annotations require both the exact semantic snapshot and exact URL', () => {
  for (const [semanticSha256, annotation] of Object.entries(SOURCE_EDITORIAL)) {
    const source = { title: 'Original source wording', semanticSha256, url: annotation.url };
    assert.deepEqual(sourcePresentation(source), { title: annotation.title, originalTitle: source.title, status: 'editorial' });
    for (const changed of [
      { ...source, semanticSha256: sha('0') },
      { ...source, semanticSha256: undefined },
      { ...source, url: `${annotation.url}?different-snapshot=1` },
      { ...source, url: 'https://example.org/source' },
    ]) {
      assert.deepEqual(sourcePresentation(changed), { title: source.title, originalTitle: source.title, status: 'original' });
    }
  }
});

test('an unknown release tag gains software context without a content or taxonomy claim', async () => {
  const { record, evidence } = await fixture();
  record.title = 'evidence: patch_4July2026';
  evidence.sources[0].title = 'patch_4July2026'; evidence.sources[0].url = releaseUrl;
  evidence.topic.question = 'What supported, useful next research questions follow from “patch_4July2026”?';
  const named = researchPresentation(record, evidence);
  assert.equal(named.status, 'source-context');
  assert.equal(named.title, 'Evidence review: LAMMPS software release · patch_4July2026');
  assert.equal(named.topicTitle, 'Research questions about LAMMPS software release · patch_4July2026');
  assert.equal(named.area, 'Unclassified'); assert.deepEqual(named.subjects, []);
  assert.equal(named.evidenceBasis, 'Evidence scope not yet classified');
  assert.equal(named.originalQuestion, evidence.topic.question);
  for (const original of [record.title, evidence.topic.question, evidence.sources[0].title]) assert.ok(named.aliases.includes(original));
});

test('humanized date-only patch labels receive the same conservative source context', async () => {
  const { record, evidence } = await fixture();
  for (const title of ['Patch 4 July 2026', 'Evidence: Patch 4 July 2026']) {
    record.title = title; evidence.sources[0].title = 'Patch 4 July 2026'; evidence.sources[0].url = releaseUrl;
    const named = researchPresentation(record, evidence);
    assert.equal(named.status, 'source-context'); assert.ok(named.title.includes('LAMMPS software release'));
    assert.equal(named.originalTitle, title); assert.equal(named.area, 'Unclassified');
  }
});

test('descriptive report and source titles remain intact outside reviewed annotations', async () => {
  const { record, evidence } = await fixture();
  evidence.topic.question = 'How does patch placement affect the strain field?';
  evidence.sources[0].url = releaseUrl;
  for (const title of ['Patch placement changes the strain field around a defect',
    'Release comparison reveals incorrect pressures', 'Release changes improve GPU scaling']) {
    record.title = title; evidence.sources[0].title = title;
    const named = researchPresentation(record, evidence);
    assert.equal(named.title, record.title); assert.equal(named.status, 'original');
    assert.equal(named.topicTitle, evidence.topic.question);
    assert.equal(sourcePresentation(evidence.sources[0]).title, evidence.sources[0].title);
  }
});

test('repository fallbacks recognize only exact secure GitHub release paths', () => {
  for (const url of [
    'http://github.com/lammps/lammps/releases/tag/patch_4July2026',
    'https://github.com.example.org/lammps/lammps/releases/tag/patch_4July2026',
    'https://github.com@evil.example/lammps/lammps/releases/tag/patch_4July2026',
    'https://user@github.com/lammps/lammps/releases/tag/patch_4July2026',
    'https://github.com:8443/lammps/lammps/releases/tag/patch_4July2026',
    'https://github.com/lammps/lammps/issues/42',
    'https://github.com/lammps/lammps/releases/tag/patch_4July2026/extra',
    'https://github.com/lammps/lammps/releases/tag/%E0%A4%A',
    'not a URL',
  ]) assert.deepEqual(sourcePresentation({ title: 'patch_4July2026', url }),
    { title: 'patch_4July2026', originalTitle: 'patch_4July2026', status: 'original' });
  assert.equal(sourcePresentation({ title: 'v1.2.3', url: 'https://github.com/example/project/releases/tag/v1.2.3' }).title,
    'example/project software release · v1.2.3');
});

test('missing source context does not turn an opaque title into an invented subject', async () => {
  const { record, evidence } = await fixture('methods');
  record.title = 'methods: patch_4July2026'; record.sources = []; evidence.sources = [];
  const named = researchPresentation(record, evidence);
  assert.equal(named.title, 'Methods proposal: source details awaiting description');
  assert.equal(named.area, 'Unclassified'); assert.deepEqual(named.subjects, []);
  assert.equal(named.originalTitle, record.title); assert.ok(named.aliases.includes(record.title));
});

test('role labels describe contribution types without changing scientific acceptance flags', async () => {
  assert.deepEqual(RESEARCH_ROLE_LABELS, {
    evidence: 'Evidence review', methods: 'Methods proposal',
    reviewer: 'Critical review', principal: 'Research priorities',
  });
  for (const role of Object.keys(RESEARCH_ROLE_LABELS)) {
    const { record, evidence } = await fixture(role), named = researchPresentation(record, evidence);
    assert.equal(named.roleLabel, RESEARCH_ROLE_LABELS[role]);
    assert.equal(evidence.empiricalValidation, false); assert.equal(evidence.externalPeerReviewed, false);
    assert.equal(evidence.reviewBasis, 'automated-contract-validation');
  }
});

test('presentation leaves immutable records, source identities and exact questions untouched', async () => {
  const { record, evidence } = await fixture('principal');
  record.title = 'principal: patch_4July2026'; evidence.sources[0].title = 'patch_4July2026'; evidence.sources[0].url = releaseUrl;
  const before = JSON.stringify({ record, evidence }); freezeDeep(record); freezeDeep(evidence);
  researchPresentation(record, evidence); sourcePresentation(evidence.sources[0]);
  assert.equal(JSON.stringify({ record, evidence }), before);
  const [id, annotation] = Object.entries(RESEARCH_EDITORIAL)[0];
  const result = researchPresentation(pinnedRecord(id, annotation)); result.subjects.push('Caller-only term');
  assert.equal(annotation.subjects.includes('Caller-only term'), false);
});

test('unknown original labels remain readable without an evidence sidecar', async () => {
  const { record } = await fixture();
  const named = researchPresentation(record);
  assert.equal(named.title, record.title); assert.equal(named.originalQuestion, null);
  assert.equal(named.roleLabel, 'Research report'); assert.equal(named.status, 'original');
  assert.equal(sourcePresentation({ label: 'Named source', url: 'https://example.org' }).title, 'Named source');
});

test('search finds both conservative display names and the exact original release wording', async () => {
  const { record, evidence } = await fixture();
  record.title = 'evidence: patch_4July2026'; record.sources = [{ label: 'patch_4July2026', url: releaseUrl }];
  evidence.sources[0].title = 'patch_4July2026'; evidence.sources[0].url = releaseUrl;
  const search = createPublicSearch(); search.activity(record); search.evidence(record, evidence);
  for (const query of ['LAMMPS', 'patch_4July2026', 'Evidence review', evidence.topic.question]) {
    const matches = search.search(query);
    assert.equal(matches.length, 1); assert.equal(matches[0].id, record.id);
    assert.equal(matches[0].route, `#/activity/${record.id}`);
    assert.equal(matches[0].title, 'Evidence review: LAMMPS software release · patch_4July2026');
  }
});

test('article search retains original catalog names beside edited display titles', () => {
  const search = createPublicSearch();
  search.article({ id: 'synthetic-article', title: 'A descriptive research title',
    subtitle: 'A bounded scientific question', originalTitle: { en: 'Earlier internal label' },
    originalSubtitle: { en: 'Historical wording' }, searchAliases: ['Retained source heading'] });
  for (const query of ['descriptive research', 'Earlier internal label', 'Historical wording', 'Retained source heading']) {
    assert.equal(search.search(query)[0]?.title, 'A descriptive research title');
    assert.equal(search.search(query)[0]?.route, '#/read/synthetic-article');
  }
});
