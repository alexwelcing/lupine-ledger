import { researchPresentation, sourcePresentation } from './researchPresentation.js';
import { canonicalEvidence, evidenceHash, researchEvidenceGraph, validatePublicEvidence } from './publicResearchEvidence.js';

export const RESEARCH_ROLES = Object.freeze(['evidence', 'methods', 'reviewer', 'principal']);
export const MAX_CONNECTION_REPORTS = 40;
const route = id => `#/activity/${encodeURIComponent(id)}`;
const byNewest = (a, b) => b.observedAt.localeCompare(a.observedAt) || a.id.localeCompare(b.id);
const sourceIdentity = source => canonicalEvidence(source);

/**
 * A presentation model of the verified reports already in the public store.
 * No fetching, scheduling, inference, or invented semantic relations. Hash verification
 * belongs to fetchPublicEvidence; the current pin is checked again here to prevent a
 * replaced public record from borrowing an old verified sidecar.
 */
export function buildResearchConnections(state = {}, { limit = 24, focusReportId = null, focusTopicId = null } = {}) {
  const successors = new Map();
  for (const record of Array.isArray(state.records) ? state.records : []) if (record.supersedes) {
    const ids = successors.get(record.supersedes) || new Set(); ids.add(record.id); successors.set(record.supersedes, ids);
  }
  const boundedLimit = Number.isSafeInteger(limit) ? Math.max(1, Math.min(MAX_CONNECTION_REPORTS, limit)) : 24;
  const candidates = (Array.isArray(state.records) ? state.records : []).filter(record => {
    try { return !!evidenceHash(record); } catch { return false; }
  }).sort(byNewest);
  const candidatesById = new Map(candidates.map(record => [record.id, record]));
  const selected = [], picked = new Set();
  const verifiedEntry = record => {
    const entry = state.evidence?.[record.id];
    try {
      if (entry?.status !== 'verified' || entry.sha256 !== evidenceHash(record)) return null;
      validatePublicEvidence(entry.evidence, record); return entry;
    } catch { return null; }
  };
  const include = record => {
    if (!record || picked.has(record.id) || selected.length >= boundedLimit) return;
    picked.add(record.id); selected.push(record);
    const entry = verifiedEntry(record);
    if (!entry) return;
    const parent = entry.evidence.topic.parentPublicationId;
    for (const id of [...entry.evidence.priorReports.map(prior => prior.publicationId), ...(parent ? [parent] : [])]) include(candidatesById.get(id));
  };
  // A deep-linked investigation remains visible even when it is older than the
  // newest page. Include its exact already-loaded ancestry before unrelated rows.
  if (focusReportId) include(candidatesById.get(focusReportId));
  if (focusTopicId) for (const record of candidates) if (verifiedEntry(record)?.evidence.topic.id === focusTopicId) include(record);
  for (const record of candidates) include(record);
  const known = new Map(), rejected = new Set();
  const statuses = { loading: 0, unavailable: 0, unloaded: 0 };
  const topicShapes = new Map();
  for (const record of selected) {
    const entry = state.evidence?.[record.id];
    if (entry?.status !== 'verified') {
      statuses[entry?.status === 'loading' ? 'loading' : entry?.status === 'unavailable' ? 'unavailable' : 'unloaded']++;
      continue;
    }
    try {
      if (entry.sha256 !== evidenceHash(record) || known.has(record.id)) throw Error('Publication pin changed or duplicated');
      validatePublicEvidence(entry.evidence, record);
      const topic = entry.evidence.topic, shapes = topicShapes.get(topic.id) || new Set();
      shapes.add(canonicalEvidence(topic)); topicShapes.set(topic.id, shapes);
      known.set(record.id, { record, evidence: entry.evidence });
    } catch { rejected.add(record.id); }
  }
  for (const [id, item] of known) if (rejected.has(id) || topicShapes.get(item.evidence.topic.id)?.size > 1) rejected.add(id);
  for (const id of rejected) known.delete(id);
  // Validate against the whole selected set first. Removing an inconsistent report
  // must not convert a contradictory known prefix into an apparently valid link.
  for (const [id, item] of known) {
    try { researchEvidenceGraph(item.record, item.evidence, known); } catch { rejected.add(id); }
  }
  for (const id of rejected) known.delete(id);

  const topics = new Map(), reports = [], sourceGroups = new Map(), followUpGroups = new Map();
  for (const { record, evidence } of known.values()) {
    const graph = researchEvidenceGraph(record, evidence, known);
    const prefixComplete = evidence.priorReports.every(prior => known.has(prior.publicationId));
    const report = {
      id: record.id, title: record.title, route: route(record.id), role: evidence.report.role,
      presentation: researchPresentation(record, evidence),
      summary: evidence.report.summary, disposition: evidence.report.disposition,
      model: evidence.provenance.model, provider: evidence.provenance.provider,
      modelIdentity: evidence.provenance.modelIdentity, completedAt: evidence.provenance.completedAt,
      topicId: evidence.topic.id, claimCount: evidence.report.claims.length,
      assessmentCount: evidence.report.assessments.length, prefixComplete,
      priorIds: evidence.priorReports.map(prior => prior.publicationId),
      linkedPriorIds: prefixComplete ? evidence.priorReports.map(prior => prior.publicationId) : [],
      unresolvedCount: graph.unresolved.length,
      superseded: successors.has(record.id), correctionIds: [...(successors.get(record.id) || [])].sort(),
      correctionRoutes: [...(successors.get(record.id) || [])].sort().map(route),
      supersedes: record.supersedes, correctionReason: record.correctionReason,
    };
    reports.push(report);
    let topic = topics.get(evidence.topic.id);
    if (!topic) {
      topic = { id: evidence.topic.id, question: evidence.topic.question, reports: [], sources: [], questions: [],
        latestAt: evidence.provenance.completedAt, parent: null, children: [],
        declaredParent: evidence.topic.parentTopicId ? { topicId: evidence.topic.parentTopicId,
          publicationId: evidence.topic.parentPublicationId, questionIndex: evidence.topic.parentQuestionIndex } : null };
      topics.set(topic.id, topic);
    }
    topic.reports.push(report);
    if (report.completedAt > topic.latestAt) topic.latestAt = report.completedAt;
    for (const source of evidence.sources) {
      let group = sourceGroups.get(source.reference);
      if (!group) {
        group = { ...source, topicIds: new Set(), reportIds: new Set(), identity: sourceIdentity(source), consistent: true };
        sourceGroups.set(source.reference, group);
      }
      if (group.identity !== sourceIdentity(source)) group.consistent = false;
      group.topicIds.add(topic.id); group.reportIds.add(record.id);
      if (!topic.sources.some(s => s.reference === source.reference)) topic.sources.push({ ...source, presentation: sourcePresentation(source) });
    }
    evidence.report.questions.forEach((text, index) => {
      let question = topic.questions.find(question => question.text === text);
      if (!question) {
        question = { id: `${record.id}:question:${index}`, text, origins: [], followUps: [], status: 'proposed' };
        topic.questions.push(question);
      }
      question.origins.push({ publicationId: record.id, role: report.role, index, followUpPublished: false, route: `${route(record.id)}?question=${index}` });
    });
    const followUp = graph.edges.find(edge => edge.relation === 'follows-question');
    if (followUp) {
      const parentId = evidence.topic.parentPublicationId, index = evidence.topic.parentQuestionIndex;
      const key = `${topic.id}:${parentId}:${index}`;
      if (!followUpGroups.has(key)) followUpGroups.set(key, {
        id: key, parentTopicId: evidence.topic.parentTopicId, childTopicId: topic.id,
        parentPublicationId: parentId, parentQuestionIndex: index, question: topic.question,
        parentRoute: `${route(parentId)}?question=${index}`, childReportIds: [],
        meaning: 'A published investigation follows this exact proposed question; it does not establish an answer.',
      });
      followUpGroups.get(key).childReportIds.push(record.id);
    }
  }
  const followUps = [...followUpGroups.values()];
  for (const link of followUps) {
    const child = topics.get(link.childTopicId), parent = topics.get(link.parentTopicId);
    child.parent = link; parent?.children.push(link);
    for (const question of parent?.questions || []) if (question.origins.some(origin =>
      origin.publicationId === link.parentPublicationId && origin.index === link.parentQuestionIndex)) {
      question.followUps.push(link); question.status = 'follow-up-published';
      for (const origin of question.origins) if (origin.publicationId === link.parentPublicationId && origin.index === link.parentQuestionIndex) origin.followUpPublished = true;
    }
  }
  const topicList = [...topics.values()].sort((a, b) => b.latestAt.localeCompare(a.latestAt) || a.id.localeCompare(b.id));
  for (const topic of topicList) {
    topic.reports.sort((a, b) => RESEARCH_ROLES.indexOf(a.role) - RESEARCH_ROLES.indexOf(b.role) || a.completedAt.localeCompare(b.completedAt) || a.id.localeCompare(b.id));
    topic.stages = RESEARCH_ROLES.map(role => ({ role, reportIds: topic.reports.filter(report => report.role === role).map(report => report.id) }));
    topic.sources.sort((a, b) => a.reference.localeCompare(b.reference));
    topic.questions.sort((a, b) => a.text.localeCompare(b.text));
    for (const question of topic.questions) {
      question.origins.sort((a, b) => RESEARCH_ROLES.indexOf(b.role) - RESEARCH_ROLES.indexOf(a.role) || a.publicationId.localeCompare(b.publicationId) || a.index - b.index);
      question.route = question.origins[0].route;
    }
    topic.openQuestions = topic.questions.filter(question => question.status === 'proposed');
    topic.currentReports = topic.reports.filter(report => !report.superseded);
    topic.superseded = topic.currentReports.length === 0;
    const current = topic.currentReports.at(-1) || topic.reports.at(-1);
    topic.route = current.route;
    // Editorial navigation is separate from the exact recorded question used by lineage.
    topic.presentation = { ...current.presentation, subjects: [...current.presentation.subjects] };
    // Occupied role cells alone are not proof of a single ordered four-role branch.
    topic.completeChains = topic.reports.filter(report => report.role === 'principal' && report.prefixComplete)
      .map(report => ({ principalId: report.id, reportIds: [...report.linkedPriorIds, report.id],
        historical: [...report.linkedPriorIds, report.id].some(id => successors.has(id)) }));
  }
  const sharedSources = [...sourceGroups.values()].filter(source => source.consistent && source.topicIds.size > 1)
    .map(({ identity, consistent, topicIds, reportIds, ...source }) => ({ ...source,
      topicIds: [...topicIds].sort(), reportIds: [...reportIds].sort(),
      meaning: 'These investigations cite the same source snapshot; this is provenance, not mutual support.' }))
    .sort((a, b) => b.topicIds.length - a.topicIds.length || a.reference.localeCompare(b.reference));
  const questions = topicList.flatMap(topic => topic.questions.map(question => ({ ...question, topicId: topic.id })));
  return {
    selectionIds: selected.map(record => record.id),
    topics: topicList, reports, followUps, sharedSources, questions,
    totals: { topics: topicList.length, reports: reports.length, followUps: followUps.length,
      sharedSources: sharedSources.length, sources: sourceGroups.size, questions: questions.length,
      openQuestions: questions.filter(question => question.status === 'proposed').length,
      claims: reports.reduce((sum, report) => sum + report.claimCount, 0) },
    coverage: { limit: boundedLimit, candidates: candidates.length, selected: selected.length,
      verified: reports.length, ...statuses, rejected: rejected.size, hidden: Math.max(0, candidates.length - selected.length),
      archiveComplete: state.archiveComplete === true, archiveError: state.archiveError === true,
      allSelectedVerified: selected.length > 0 && reports.length === selected.length,
      source: state.source || null },
    empiricalValidation: false, externalPeerReviewed: false,
  };
}
