import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResearchConnections, MAX_CONNECTION_REPORTS, RESEARCH_ROLES } from '../src/researchConnections.js';
import { canonicalEvidence } from '../src/publicResearchEvidence.js';
import { fixture, digest, id, sha } from './public-research-fixture.mjs';

async function stateFor(fixtures, options = {}) {
  const state = { records: [], evidence: {}, archiveComplete: true, source: 'live', ...options };
  for (const item of fixtures) {
    item.record.hashes[0].sha256 = await digest(canonicalEvidence(item.evidence));
    state.records.push(item.record);
    state.evidence[item.record.id] = { status: 'verified', evidence: item.evidence, sha256: item.record.hashes[0].sha256 };
  }
  return state;
}
async function chain() { return Promise.all(RESEARCH_ROLES.map((role, i) => fixture(role, String.fromCharCode(97 + i)))); }
async function childOf(parent, key = 'e', role = 'evidence') {
  const child = await fixture(role, key);
  child.evidence.topic = { id: 'topic-' + sha('9'), question: parent.evidence.report.questions[0], parentTopicId: parent.evidence.topic.id, parentPublicationId: parent.record.id, parentQuestionIndex: 0 };
  return child;
}

test('question threads retain attributed reports, exact role progression, and distinct authored questions', async () => {
  const all = await chain(), model = buildResearchConnections(await stateFor(all));
  assert.equal(model.topics.length, 1); assert.equal(model.reports.length, 4);
  assert.deepEqual(model.topics[0].reports.map(report => report.role), RESEARCH_ROLES);
  assert.deepEqual(model.topics[0].stages.map(stage => stage.reportIds.length), [1, 1, 1, 1]);
  assert.equal(model.topics[0].questions.length, 1);
  assert.equal(model.topics[0].questions[0].origins.length, 4);
  assert.equal(model.topics[0].questions[0].status, 'proposed');
  assert.equal(model.topics[0].questions[0].route, `#/activity/${id('d')}?question=0`);
  assert.equal(model.topics[0].reports[3].model, 'test-model');
  assert.equal(model.topics[0].reports[3].modelIdentity, 'controller-reported');
  assert.deepEqual(model.topics[0].reports[3].linkedPriorIds, [id('a'), id('b'), id('c')]);
  assert.equal(model.empiricalValidation, false); assert.equal(model.externalPeerReviewed, false);
});

test('one exact principal question opens one follow-up topic, regardless of its report count', async () => {
  const all = await chain(), child = await childOf(all[3]), methods = await childOf(all[3], 'f', 'methods');
  methods.evidence.priorReports[0].publicationId = child.record.id;
  const model = buildResearchConnections(await stateFor([...all, child, methods]));
  assert.equal(model.followUps.length, 1); assert.equal(model.followUps[0].childReportIds.length, 2);
  assert.equal(model.followUps[0].parentPublicationId, id('d')); assert.equal(model.followUps[0].parentQuestionIndex, 0);
  const parent = model.topics.find(topic => topic.id === all[3].evidence.topic.id);
  assert.equal(parent.children.length, 1); assert.equal(parent.questions[0].status, 'follow-up-published');
  assert.equal(parent.questions[0].origins.filter(origin => origin.followUpPublished).length, 1);
  assert.equal(parent.questions[0].origins.find(origin => origin.followUpPublished).role, 'principal');
  assert.ok(model.followUps[0].meaning.includes('does not establish an answer'));
});

test('missing prior evidence withholds verified progression and parent-question connections', async () => {
  const all = await chain(), child = await childOf(all[3]);
  const model = buildResearchConnections(await stateFor([all[3], child]));
  assert.equal(model.followUps.length, 0);
  assert.equal(model.reports.find(report => report.role === 'principal').prefixComplete, false);
  assert.deepEqual(model.reports.find(report => report.role === 'principal').linkedPriorIds, []);
  assert.ok(model.reports.some(report => report.unresolvedCount > 0));
  assert.equal(model.topics.find(topic => topic.id === child.evidence.topic.id).parent, null);
  assert.equal(model.topics.find(topic => topic.id === child.evidence.topic.id).declaredParent.publicationId, id('d'));
});

test('crossed role branches and changed same-topic question are never joined', async () => {
  const all = await chain(); all[1].evidence.priorReports[0].publicationId = id('f');
  let model = buildResearchConnections(await stateFor(all));
  assert.equal(model.reports.some(report => report.role === 'reviewer'), false);
  assert.equal(model.reports.some(report => report.role === 'principal'), false);
  assert.equal(model.coverage.rejected, 2);
  const changed = await chain(); changed[1].evidence.topic.question = 'Another question under the same identity';
  model = buildResearchConnections(await stateFor(changed));
  assert.equal(model.topics.length, 0); assert.equal(model.coverage.rejected, 4);
});

test('wrong parent question text is rejected and thematic resemblance does not create ancestry', async () => {
  const all = await chain(), child = await childOf(all[3]);
  child.evidence.topic.question = 'A thematically similar but different question';
  let model = buildResearchConnections(await stateFor([...all, child]));
  assert.equal(model.followUps.length, 0); assert.equal(model.coverage.rejected, 1);
  child.evidence.topic.parentTopicId = null; child.evidence.topic.parentPublicationId = null; child.evidence.topic.parentQuestionIndex = null;
  model = buildResearchConnections(await stateFor([...all, child]));
  assert.equal(model.topics.length, 2); assert.equal(model.followUps.length, 0);
});

test('shared source snapshots connect distinct topics as provenance, never support', async () => {
  const all = await chain(), second = await fixture('evidence', 'e'); second.evidence.topic.id = 'topic-' + sha('9');
  const model = buildResearchConnections(await stateFor([...all, second]));
  assert.equal(model.sharedSources.length, 1); assert.equal(model.sharedSources[0].topicIds.length, 2);
  assert.equal(model.sharedSources[0].reportIds.length, 5);
  assert.ok(model.sharedSources[0].meaning.includes('not mutual support'));
  const sameTopic = buildResearchConnections(await stateFor(all)); assert.equal(sameTopic.sharedSources.length, 0);
});

test('same URL with different snapshots or conflicting source metadata creates no shared source assertion', async () => {
  const first = await fixture(), second = await fixture('evidence', 'e'); second.evidence.topic.id = 'topic-' + sha('9');
  second.evidence.sources[0].title = 'A conflicting title under the same semantic digest';
  let model = buildResearchConnections(await stateFor([first, second])); assert.equal(model.sharedSources.length, 0);
  const newReference = 'src-' + sha('8'); second.evidence.sources[0].reference = newReference; second.evidence.sources[0].semanticSha256 = sha('8');
  second.evidence.report.claims[0].sourceReferences = [newReference]; second.evidence.report.concepts[0].sourceReferences = [newReference];
  model = buildResearchConnections(await stateFor([first, second])); assert.equal(model.sharedSources.length, 0);
});

test('only current verified sidecars enter connections; saved feed never means new evidence', async () => {
  const all = await chain(), state = await stateFor(all, { source: 'saved', archiveComplete: false });
  state.evidence[id('a')].sha256 = sha('f'); state.evidence[id('b')].status = 'loading';
  state.evidence[id('c')].status = 'unavailable'; delete state.evidence[id('d')];
  const model = buildResearchConnections(state);
  assert.equal(model.reports.length, 0); assert.equal(model.coverage.rejected, 1);
  assert.equal(model.coverage.loading, 1); assert.equal(model.coverage.unavailable, 1); assert.equal(model.coverage.unloaded, 1);
  assert.equal(model.coverage.archiveComplete, false); assert.equal(model.coverage.source, 'saved');
  assert.equal(model.coverage.allSelectedVerified, false);
});

test('selection prioritizes an older focused report and its exact loaded ancestry inside the cap', async () => {
  const all = await chain(), newer = await fixture('evidence', 'e');
  newer.evidence.topic.id = 'topic-' + sha('8'); newer.evidence.provenance.completedAt = '2026-10-31T12:00:00.000Z'; newer.record.observedAt = newer.evidence.provenance.completedAt;
  const state = await stateFor([...all, newer]);
  const model = buildResearchConnections(state, { limit: 4, focusReportId: id('d') });
  assert.equal(model.reports.length, 4); assert.equal(model.reports.find(report => report.role === 'principal').prefixComplete, true);
  assert.equal(model.reports.some(report => report.id === id('e')), false); assert.equal(model.coverage.hidden, 1);
  const byTopic = buildResearchConnections(state, { limit: 4, focusTopicId: all[0].evidence.topic.id });
  assert.equal(byTopic.topics.length, 1); assert.equal(byTopic.topics[0].reports.length, 4);
  const short = buildResearchConnections(state, { limit: 2, focusReportId: id('d') });
  assert.equal(short.reports.find(report => report.role === 'principal').prefixComplete, false);
});

test('bounded inputs are deterministic and the model does not modify stored evidence', async () => {
  const all = await chain(), state = await stateFor(all), before = JSON.stringify(state);
  const first = buildResearchConnections(state, { limit: Number.MAX_SAFE_INTEGER });
  assert.equal(first.coverage.limit, MAX_CONNECTION_REPORTS);
  assert.deepEqual(first, buildResearchConnections(state, { limit: MAX_CONNECTION_REPORTS }));
  assert.equal(JSON.stringify(state), before);
  assert.equal(buildResearchConnections({}, { limit: 0 }).coverage.limit, 1);
  assert.equal(buildResearchConnections().coverage.allSelectedVerified, false);
});

test('corrections preserve historical ancestry while removing superseded reports from the preferred route', async () => {
  const all = await chain(), correction = await fixture('evidence', 'e');
  correction.record.supersedes = id('d'); correction.record.correctionReason = 'Synthetic correction for the connection model.';
  correction.evidence.topic.id = 'topic-' + sha('9');
  const model = buildResearchConnections(await stateFor([...all, correction]));
  const parent = model.topics.find(topic => topic.id === all[0].evidence.topic.id);
  const historical = parent.reports.find(report => report.id === id('d'));
  assert.equal(historical.superseded, true); assert.deepEqual(historical.correctionIds, [id('e')]);
  assert.deepEqual(historical.correctionRoutes, [`#/activity/${id('e')}`]);
  assert.equal(parent.route, `#/activity/${id('c')}`);
  assert.equal(parent.completeChains.length, 1); assert.equal(parent.completeChains[0].historical, true);
  assert.equal(model.reports.find(report => report.id === id('e')).supersedes, id('d'));
});

test('all four occupied role cells do not imply a completed ordered role chain', async () => {
  const all = await chain(); all[3].evidence.priorReports[2].publicationId = id('f');
  const model = buildResearchConnections(await stateFor(all));
  assert.deepEqual(model.topics[0].stages.map(stage => stage.reportIds.length), [1, 1, 1, 1]);
  assert.equal(model.topics[0].completeChains.length, 0);
});
