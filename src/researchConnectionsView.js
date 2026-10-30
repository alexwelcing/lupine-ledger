import { buildResearchConnections, MAX_CONNECTION_REPORTS, RESEARCH_ROLES } from './researchConnections.js';
import { publicActivityStore } from './publicActivityStore.js';

const el = (tag, text, className) => {
  const n = document.createElement(tag);
  if (text != null) n.textContent = text;
  if (className) n.className = className;
  return n;
};
const link = (text, href, className) => {
  const n = el('a', text, className); n.href = href;
  if (href.startsWith('https:')) { n.target = '_blank'; n.rel = 'noopener noreferrer'; }
  return n;
};
const labels = { evidence: 'Evidence', methods: 'Methods', reviewer: 'Review', principal: 'Direction' };
const date = value => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const topicRoute = (id, reportId) => `#/connections?topic=${encodeURIComponent(id)}${reportId ? `&report=${encodeURIComponent(reportId)}` : ''}`;
function action(text, fn, className = 'connections-button') {
  const n = el('button', text, className); n.type = 'button'; n.onclick = fn; return n;
}

/** A bounded, read-only exploration of public, hash-verified research reports. */
export function renderResearchConnections(mount, store = publicActivityStore(), hash = location.hash) {
  const params = new URLSearchParams(hash.split('?')[1] || '');
  let focusTopicId = /^topic-[a-f0-9]{64}$/.test(params.get('topic') || '') ? params.get('topic') : null;
  let focusReportId = /^discovery-[a-f0-9]{64}$/.test(params.get('report') || '') ? params.get('report') : null;
  let limit = 12, mode = 'all', query = '', disposed = false, model, selectedId = focusTopicId;
  const requested = new Set(), queue = []; let running = 0;
  mount.classList.remove('public-research-view');
  const root = el('div', null, 'research-connections');
  const head = el('header', null, 'connections-head');
  head.append(el('p', 'THE LIVING LIBRARY / RESEARCH CONNECTIONS', 'connections-eyebrow'),
    el('h1', 'One question opens another.'),
    el('p', 'Follow the path from a source to a finding, through review, and into the next investigation.', 'connections-deck'));
  const nav = el('nav', null, 'connections-navigation'); nav.setAttribute('aria-label', 'Explore the Library');
  nav.append(link('Research connections', '#/connections', 'is-current'), link('Article knowledge map ↗', '#/graph'), link('Chronological archive ↗', '#/research'));
  head.append(nav);
  const stats = el('div', null, 'connections-stats');
  const toolbar = el('div', null, 'connections-toolbar');
  const searchLabel = el('label', 'Find a question or source', 'connections-search');
  const search = el('input'); search.type = 'search'; search.placeholder = 'Try LAMMPS, graphene, validation…'; searchLabel.append(search);
  const filters = el('div', null, 'connections-filters'); filters.setAttribute('aria-label', 'Filter research connections');
  const filterButtons = new Map();
  for (const [key, label] of [['all', 'All questions'], ['followups', 'Follow-ups'], ['sources', 'Shared sources']]) {
    const b = action(label, () => { mode = key; draw(); }); b.setAttribute('aria-pressed', String(key === mode)); filterButtons.set(key, b); filters.append(b);
  }
  toolbar.append(searchLabel, filters);
  const grid = el('div', null, 'connections-grid'), sidebar = el('aside', null, 'connections-topic-list'), detail = el('section', null, 'connections-detail');
  sidebar.setAttribute('aria-label', 'Research questions'); detail.setAttribute('aria-label', 'Selected research question');
  grid.append(sidebar, detail);
  const status = el('p', '', 'connections-coverage'); status.setAttribute('role', 'status');
  const more = action('Load more research', async () => {
    limit = Math.min(MAX_CONNECTION_REPORTS, limit + 12);
    paint(store.state);
    if (!store.state.archiveComplete) await store.loadMore();
  });
  const refresh = action('Refresh publications', () => {
    for (const id of requested) if (store.state.evidence?.[id]?.status === 'unavailable') store.loadEvidence(id, { retry: true });
    store.refresh(); if (!store.state.archiveLoading) store.loadMore({ refresh: store.state.archiveComplete === true });
  });
  const footer = el('footer', null, 'connections-footer');
  const buttons = el('div', null, 'connections-actions'); buttons.append(more, refresh);
  footer.append(status, buttons, el('p', 'Connections describe published research lineage and citations. A follow-up is an investigation, not an answer; automated review is not empirical validation.', 'connections-note'));
  root.append(head, stats, toolbar, grid, footer); mount.replaceChildren(root);

  function request(id) {
    if (disposed || !/^discovery-[a-f0-9]{64}$/.test(id || '') || requested.has(id) || requested.size >= MAX_CONNECTION_REPORTS) return;
    requested.add(id); queue.push(id); pump();
  }
  function pump() {
    while (!disposed && running < 3 && queue.length) {
      const id = queue.shift(); running++;
      Promise.resolve().then(async () => {
        if (disposed) return;
        await store.loadRecord(id);
        if (!disposed) await store.loadEvidence(id);
      }).catch(() => {}).finally(() => { running--; pump(); });
    }
  }
  function select(id) {
    selectedId = focusTopicId = id;
    focusReportId = model.topics.find(t => t.id === id)?.reports.at(-1)?.id || null;
    history.replaceState(null, '', topicRoute(id, focusReportId)); draw();
    detail.scrollIntoView?.({ block: 'start', behavior: 'instant' });
    detail.focus?.({ preventScroll: true });
  }
  function topicButton(topic, small = false) {
    const b = action('', () => select(topic.id), small ? 'connections-topic-inline' : 'connections-topic');
    b.dataset.topicId = topic.id; b.setAttribute('aria-pressed', String(topic.id === selectedId));
    if (!small) b.append(el('span', topic.parent ? 'FOLLOW-UP INVESTIGATION' : topic.declaredParent ? 'PARENT NOT YET VERIFIED' : 'RESEARCH QUESTION', 'connections-eyebrow'));
    b.append(el('span', topic.question, 'connections-topic-title'));
    if (!small) {
      const progress = el('span', null, 'connections-mini-stages');
      for (const stage of topic.stages) { const s = el('span', labels[stage.role]); s.dataset.present = String(stage.reportIds.length > 0); progress.append(s); }
      b.append(progress, el('span', `${topic.reports.length} reports · ${topic.sources.length} sources · ${date(topic.latestAt)}`, 'connections-meta'));
    }
    return b;
  }
  function draw() {
    if (!model || disposed) return;
    for (const [key, b] of filterButtons) b.setAttribute('aria-pressed', String(key === mode));
    const sharedTopics = new Set(model.sharedSources.flatMap(s => s.topicIds));
    const needle = query.trim().toLowerCase();
    const visible = model.topics.filter(t => (!needle || [t.question, ...t.sources.map(s => s.title), ...t.reports.map(r => r.summary), ...t.questions.map(q => q.text)].join(' ').toLowerCase().includes(needle)) &&
      (mode === 'all' || mode === 'followups' && (t.parent || t.children.length) || mode === 'sources' && sharedTopics.has(t.id)));
    const exactFocusMissing = focusTopicId && !model.topics.some(t => t.id === focusTopicId) && !needle && mode === 'all';
    if (!focusTopicId && !needle && mode === 'all') selectedId = visible.find(t => t.children.length)?.id || visible[0]?.id || null;
    else if (!exactFocusMissing && !visible.some(t => t.id === selectedId)) selectedId = visible[0]?.id || null;
    sidebar.replaceChildren(el('h2', `${visible.length} research ${visible.length === 1 ? 'question' : 'questions'}`, 'connections-list-heading'), ...visible.map(t => topicButton(t)));
    detail.replaceChildren();
    const topic = visible.find(t => t.id === selectedId);
    if (!topic) {
      detail.append(el('h2', exactFocusMissing ? 'This question is not yet in the loaded evidence.' : needle || mode !== 'all' ? 'No matching connections in this view.' : 'Opening the research trail…'),
        el('p', model.coverage.loading || model.coverage.unloaded ? 'Loading and verifying published reports. Connections appear when their evidence is available.' : 'Try another filter or load more publications. Unavailable reports remain in the chronological archive.', 'connections-note'));
      if (!needle && mode === 'all' && focusReportId && !model.reports.some(r => r.id === focusReportId)) detail.append(link('Read the requested public record', `#/activity/${focusReportId}`));
      if (exactFocusMissing) detail.append(action('Show available questions', () => { focusTopicId = focusReportId = selectedId = null; history.replaceState(null, '', '#/connections'); draw(); }));
      return;
    }
    const title = el('header', null, 'connections-question-head');
    title.append(el('p', 'FOLLOW THE QUESTION', 'connections-eyebrow'), el('h2', topic.question), link('Permalink to this question ↗', topicRoute(topic.id, topic.reports.at(-1)?.id), 'connections-permalink'));
    detail.append(title);
    if (topic.parent) {
      const parent = model.topics.find(t => t.id === topic.parent.parentTopicId), branch = el('div', null, 'connections-parent');
      branch.append(el('span', 'BRANCHES FROM', 'connections-eyebrow'), link(`Question ${topic.parent.parentQuestionIndex + 1} in the earlier direction report`, topic.parent.parentRoute));
      if (parent) branch.append(topicButton(parent, true));
      detail.append(branch);
    } else if (topic.declaredParent) detail.append(el('p', 'A parent is declared, but its exact question and report sequence are not verified in this view.', 'connections-note'));
    const flow = el('ol', null, 'connections-stage-flow'); flow.setAttribute('aria-label', 'Published report stages');
    for (const stage of topic.stages) {
      const cell = el('li'); cell.dataset.present = String(stage.reportIds.length > 0);
      cell.append(el('span', String(RESEARCH_ROLES.indexOf(stage.role) + 1).padStart(2, '0'), 'connections-stage-number'), el('strong', labels[stage.role]));
      const reports = topic.reports.filter(r => r.role === stage.role);
      for (const report of reports) {
        cell.append(link(report.superseded ? 'Historical report ↗' : reports.length > 1 ? `Read report · ${date(report.completedAt)}` : 'Read report ↗', report.route));
        for (const route of report.correctionRoutes) cell.append(link('Read correction ↗', route));
      }
      if (!reports.length) cell.append(el('span', 'Not published in this view', 'connections-stage-gap'));
      flow.append(cell);
    }
    detail.append(flow, el('p', 'Stages group reports by role. Each report below identifies its own verified predecessors.', 'connections-note'));
    const latest = topic.currentReports.at(-1) || topic.reports.at(-1), summary = el('div', null, 'connections-latest');
    summary.append(el('p', `${labels[latest.role].toUpperCase()} / ${latest.superseded ? 'HISTORICAL REPORT' : 'PUBLISHED POSITION'}`, 'connections-eyebrow'), el('p', latest.summary), link('Read the complete report →', latest.route));
    for (const route of latest.correctionRoutes) summary.append(link('Read the correction →', route));
    detail.append(summary);
    if (topic.children.length) {
      const branches = el('section', null, 'connections-branches'); branches.append(el('h3', 'Where this led'));
      for (const branch of topic.children) {
        const child = model.topics.find(t => t.id === branch.childTopicId); if (!child) continue;
        const b = el('div', null, 'connections-branch'); b.append(el('span', '↳', 'connections-branch-arrow'), topicButton(child, true), link('See the question that started it ↗', branch.parentRoute)); branches.append(b);
      }
      branches.append(el('p', 'A published follow-up continues this question. It does not mark the question as answered.', 'connections-note')); detail.append(branches);
    }
    const lower = el('div', null, 'connections-evidence-grid'), sources = el('section'), questions = el('section');
    sources.append(el('h3', 'Sources connecting the work'));
    for (const s of topic.sources) {
      const row = el('div', null, 'connections-source'); row.append(link(s.title, s.url));
      const shared = model.sharedSources.find(x => x.reference === s.reference);
      if (shared) {
        row.append(el('span', `Shared source snapshot · ${shared.topicIds.length} questions`, 'connections-meta'));
        for (const id of shared.topicIds.filter(id => id !== topic.id)) { const other = model.topics.find(t => t.id === id); if (other) row.append(topicButton(other, true)); }
      }
      sources.append(row);
    }
    sources.append(el('p', 'Shared citations show common provenance, not agreement between findings.', 'connections-note'));
    questions.append(el('h3', 'Questions still opening'));
    for (const q of topic.questions) {
      const row = el('div', null, 'connections-open-question'); row.append(link(q.text, q.route), el('span', q.followUps.length ? 'Follow-up published · answer not established' : 'Proposed in a report', 'connections-meta')); questions.append(row);
    }
    if (!topic.questions.length) questions.append(el('p', 'No next questions were proposed in these reports.', 'connections-note'));
    lower.append(sources, questions); detail.append(lower);
    const trail = el('details', null, 'connections-report-trail'); trail.append(el('summary', 'Report lineage & model attribution'));
    for (const r of topic.reports) {
      const row = el('div'); row.append(link(r.title, r.route), el('p', `${r.model} · ${r.provider} · controller-reported`, 'connections-meta'));
      if (r.superseded) { row.append(el('p', 'Historical report — a correction is published.', 'connections-note')); for (const route of r.correctionRoutes) row.append(link('Read correction →', route)); }
      if (r.linkedPriorIds.length) { const p = el('p', 'Builds on: '); for (const id of r.linkedPriorIds) { const prior = model.reports.find(p => p.id === id); if (prior) p.append(link(labels[prior.role], prior.route), document.createTextNode(' · ')); } row.append(p); }
      else row.append(el('p', r.priorIds.length ? 'Earlier report sequence is not fully verified in this view.' : 'First report in this investigation.', 'connections-note'));
      trail.append(row);
    }
    detail.append(trail);
  }
  function paint(state) {
    if (disposed) return;
    model = buildResearchConnections(state, { limit, focusReportId, focusTopicId });
    if (focusReportId && !focusTopicId) { const found = model.reports.find(r => r.id === focusReportId); if (found) selectedId = focusTopicId = found.topicId; }
    stats.replaceChildren(...[[model.totals.topics, 'research questions'], [model.totals.reports, 'verified reports'], [model.totals.followUps, 'follow-up branches'], [model.totals.sources, 'source snapshots']].map(([n, label]) => { const d = el('div'); d.append(el('strong', String(n)), el('span', label)); return d; }));
    const c = model.coverage;
    status.textContent = `${c.verified} of ${c.selected} selected reports verified · ${state.records.length} public records loaded · ${c.archiveComplete ? 'archive snapshot fully loaded' : 'partial archive'}. ${c.unavailable + c.rejected} unavailable or rejected. View limit ${limit}/${MAX_CONNECTION_REPORTS}.`;
    if (c.source !== 'live') status.textContent += ' Showing saved or unavailable feed data.';
    if (c.archiveError) status.textContent += ' An archive request failed; loaded evidence is retained.';
    more.disabled = state.archiveLoading || (limit >= MAX_CONNECTION_REPORTS && c.archiveComplete);
    more.textContent = state.archiveLoading ? 'Loading publications…' : limit >= MAX_CONNECTION_REPORTS ? 'Load older archive records' : 'Load more research';
    refresh.disabled = state.archiveLoading || state.refreshing;
    draw();
    if (focusReportId) request(focusReportId);
    // Model selection includes known ancestors. Request exact dependencies; never poll.
    for (const id of model.selectionIds) request(id);
    for (const r of model.reports) {
      const e = state.evidence[r.id].evidence;
      for (const prior of e.priorReports) request(prior.publicationId);
      if (e.topic.parentPublicationId) request(e.topic.parentPublicationId);
    }
  }
  search.oninput = () => { query = search.value; draw(); };
  const unsubscribe = store.subscribe(paint);
  detail.setAttribute('tabindex', '-1');
  store.refresh(); if (!store.state.archiveComplete) store.loadMore();
  return () => { disposed = true; queue.length = 0; unsubscribe(); };
}
