import { activityFreshness, createActivityController } from './researchActivity.js';
import { researchActivityEndpoint } from './researchActivityConfig.js';

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content != null) element.textContent = content;
  return element;
}
function when(value) { return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
function time(label, value) {
  const wrap = node('span', '', `${label} `), stamp = node('time', '', when(value));
  stamp.dateTime = new Date(value).toISOString(); wrap.append(stamp); return wrap;
}
function list(title, values, className = '') {
  const section = node('div', className); section.append(node('h4', '', title));
  const ul = node('ul'); values.forEach(value => ul.append(node('li', '', value))); section.append(ul); return section;
}
function renderRecord(record, index) {
  const card = node('article', 'research-activity-card');
  const meta = node('div', 'research-activity-tags');
  meta.append(node('span', `research-state research-state-${record.state}`, record.state));
  meta.append(node('span', '', record.evidenceKind === 'archived_analysis' ? 'Archived-data analysis' : 'Research discussion'));
  meta.append(node('span', '', { pending: 'Verification pending', arithmetic_checked: 'Arithmetic checked', source_checked: 'Sources checked' }[record.verification]));
  card.append(meta, node('h3', '', record.title), node('p', 'research-activity-summary', record.summary));
  const timestamps = node('div', 'research-activity-times');
  timestamps.append(time('Observed', record.observedAt), time('Reviewed', record.reviewedAt)); card.append(timestamps);
  if (record.datasets.length) card.append(node('p', 'research-activity-datasets', record.datasets.map(d =>
    `${d.name}: ${d.configurations.toLocaleString()} configurations${d.groups == null ? '' : ` · ${d.groups} groups`}${d.atoms == null ? '' : ` · ${d.atoms.toLocaleString()} atoms`}`).join(' / ')));
  if (record.findings.length) card.append(list('What we found', record.findings));
  card.append(list('Limits of this evidence', record.limitations, 'research-activity-limits'));
  const next = node('div', 'research-activity-next');
  next.append(node('h4', '', 'Next question or test'), node('p', '', record.nextStep)); card.append(next);
  const details = node('details', 'research-activity-sources');
  details.append(node('summary', '', 'Sources and provenance'));
  const links = [...record.sources, ...record.repositoryLinks, ...record.releaseLinks];
  if (links.length) {
    const ul = node('ul');
    for (const source of links) {
      const li = node('li'), a = node('a', '', source.label);
      a.href = source.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; li.append(a); ul.append(li);
    }
    details.append(ul);
  }
  for (const hash of record.hashes) { const p = node('p', '', `${hash.label}: `); p.append(node('code', '', hash.sha256)); details.append(p); }
  details.append(node('p', 'research-activity-id', `Public record ${record.id}`));
  if (record.supersedes) details.append(node('p', '', `Updates public record ${record.supersedes}.`));
  if (record.correctionReason) details.append(node('p', '', `Correction: ${record.correctionReason}`));
  card.append(details);
  if (index < 2) return card;
  const older = node('details', 'research-activity-older');
  older.append(node('summary', '', `${record.title} · ${record.state}`), card); return older;
}

export function renderResearchActivity(mount) {
  const section = node('section', 'research-activity'); section.setAttribute('aria-labelledby', 'research-activity-title');
  const header = node('div', 'research-activity-heading'), heading = node('div');
  heading.append(node('p', 'research-activity-kicker', 'Inside the research'), node('h2', '', 'Research activity'));
  heading.lastChild.id = 'research-activity-title';
  const refresh = node('button', 'research-activity-refresh', 'Refresh'); refresh.type = 'button';
  header.append(heading, refresh);
  const intro = node('p', 'research-activity-intro', 'Questions, checked findings and next tests from the research team. Only reviewed public summaries appear here.');
  const status = node('div', 'research-activity-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const content = node('div', 'research-activity-records'); section.append(header, intro, status, content); mount.append(section);
  let storage;
  try { storage = localStorage; } catch { /* Storage may be disabled. */ }
  let lastFeed = null;
  const controller = createActivityController({ endpoint: researchActivityEndpoint, storage,
    online: () => navigator.onLine,
    onChange(state) {
      const freshness = activityFreshness(state);
      section.dataset.freshness = freshness.mode;
      refresh.disabled = state.refreshing; refresh.textContent = state.refreshing ? 'Checking…' : 'Refresh';
      const labels = { loading: 'Checking the live feed', live: 'Live feed', stale: 'Live feed · older evidence', snapshot: 'Reviewed snapshot', saved: 'Saved evidence', offline: 'Offline · saved evidence', unavailable: 'Live update unavailable' };
      if (state.source === 'snapshot' && freshness.mode === 'unavailable') labels.unavailable = 'Reviewed snapshot · live update unavailable';
      if (!state.feed) labels.offline = 'Offline · no saved evidence';
      status.replaceChildren(node('strong', '', labels[freshness.mode]));
      if (state.source === 'snapshot') status.append(node('span', '', 'Showing the reviewed snapshot included with this Library release.'));
      else if (state.error && state.feed) status.append(node('span', '', 'Showing the last valid saved evidence. Refresh to check again.'));
      if (state.checkedAt) status.append(time('Last successful live check', state.checkedAt));
      if (freshness.newest) status.append(time('Latest observation', freshness.newest));
      if (freshness.stale) status.append(node('span', '', 'No reviewed observation in the past 6 hours. A successful feed check does not make the evidence newer.'));
      if (lastFeed !== state.feed || !state.feed || !content.childNodes.length) {
        lastFeed = state.feed; content.replaceChildren();
        if (!state.feed) content.append(node('p', 'research-activity-empty', state.refreshing ? 'Loading reviewed research activity…' : 'The activity feed is unavailable. The research Library remains available below.'));
        else if (!state.feed.items.length) content.append(node('p', 'research-activity-empty', 'No reviewed public activity has been published yet.'));
        else {
          [...state.feed.items].sort((a, b) => b.observedAt.localeCompare(a.observedAt) || b.id.localeCompare(a.id)).forEach((record, index) => content.append(renderRecord(record, index)));
          if (state.feed.truncated) content.append(node('p', 'research-activity-empty', 'Showing the latest reviewed activities. Earlier records remain in the research ledger.'));
        }
      }
    },
  });
  const check = () => controller.refresh();
  const visible = () => { if (!document.hidden) check(); };
  refresh.addEventListener('click', check);
  document.addEventListener('visibilitychange', visible);
  window.addEventListener('online', visible);
  const interval = setInterval(visible, 60_000);
  check();
  return () => {
    controller.dispose(); clearInterval(interval);
    refresh.removeEventListener('click', check); document.removeEventListener('visibilitychange', visible); window.removeEventListener('online', visible);
  };
}
