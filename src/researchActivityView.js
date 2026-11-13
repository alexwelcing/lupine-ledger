import { activityFreshness } from './researchActivity.js';
import { publicActivityStore } from './publicActivityStore.js';

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content != null) element.textContent = content;
  return element;
}
// Dates, not minute stamps, on cards; the exact UTC times stay in the record detail.
function day(value) { return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium', timeZone: 'UTC' }); }
function exact(value) { return `${new Date(value).toISOString().slice(0, 16).replace('T', ' ')} UTC`; }
function time(label, value, format = day) {
  const wrap = node('span', '', `${label} `), stamp = node('time', '', format(value));
  stamp.dateTime = new Date(value).toISOString(); wrap.append(stamp); return wrap;
}
// Hash labels arrive from the reviewed feed; explain the unpublished ones once
// and keep retired workflow names out of the reader.
function hashLabel(label) { return label.replace(/\bPI adjudication\b/g, 'review decision'); }
const UNPUBLISHED_HASHES = 'Fingerprints marked “Private” identify unpublished files, so a later release can be matched to them. They are not public reproduction inputs.';
function list(title, values, className = '') {
  const section = node('div', className); section.append(node('h4', '', title));
  const ul = node('ul'); values.forEach(value => ul.append(node('li', '', value))); section.append(ul); return section;
}
// The longer explanation lives on the Research activity page (#/research), not on the first screen.
export function activityExplanation() {
  const review = node('p', 'research-activity-intro', 'Dated questions, checked findings and next tests from the Lupine research program. Only reviewed public summaries appear here: the founder reviews each one before it is imported, and failed or stopped work cannot be relabelled completed.');
  const glossary = node('p', 'research-activity-intro research-activity-glossary', '“A6” in these entries is the keystone paper’s assumption of common-spatial-mode separability; its historical test remains inconclusive. Background: ');
  const changelogLink = node('a', '', 'Changelog, 2 June 2026'); changelogLink.href = '#/read/changelog'; glossary.append(changelogLink, node('span', '', '.'));
  return [review, glossary];
}
export function renderRecord(record, index = 0) {
  const card = node('article', 'research-activity-card');
  const meta = node('div', 'research-activity-tags');
  meta.append(node('span', `research-state research-state-${record.state}`, record.state));
  meta.append(node('span', '', { archived_analysis: 'Archived-data analysis', research_cycle: 'Research discussion', workflow_repair: 'Workflow repair' }[record.evidenceKind]));
  meta.append(node('span', '', { pending: 'Verification pending', arithmetic_checked: 'Arithmetic checked', source_checked: 'Sources checked' }[record.verification]));
  const title = node('h3'); const permalink = node('a', '', record.title);
  permalink.href = `#/activity/${encodeURIComponent(record.id)}`; title.append(permalink);
  card.append(meta, title, node('p', 'research-activity-summary', record.summary));
  const timestamps = node('div', 'research-activity-times');
  timestamps.append(time('Observed', record.observedAt), time('Reviewed', record.reviewedAt)); card.append(timestamps);
  const evidence = node('details', 'research-activity-detail');
  evidence.append(node('summary', '', 'Findings, limits & next test'));
  if (record.datasets.length) evidence.append(node('p', 'research-activity-datasets', record.datasets.map(d =>
    `${d.name}: ${d.configurations.toLocaleString()} configurations${d.groups == null ? '' : ` · ${d.groups} groups`}${d.atoms == null ? '' : ` · ${d.atoms.toLocaleString()} atoms`}`).join(' / ')));
  if (record.findings.length) evidence.append(list('What we found', record.findings));
  evidence.append(list('Limits of this evidence', record.limitations, 'research-activity-limits'));
  const next = node('div', 'research-activity-next');
  next.append(node('h4', '', 'Next question or test'), node('p', '', record.nextStep)); evidence.append(next);
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
  if (record.hashes.some(hash => /^Private\b/.test(hash.label))) details.append(node('p', 'research-activity-hash-note', UNPUBLISHED_HASHES));
  for (const hash of record.hashes) { const p = node('p', '', `${hashLabel(hash.label)}: `); p.append(node('code', '', hash.sha256)); details.append(p); }
  const exactTimes = node('p', 'research-activity-exact-times');
  exactTimes.append(time('Observed', record.observedAt, exact), node('span', '', ' · '), time('Reviewed', record.reviewedAt, exact));
  details.append(exactTimes);
  details.append(node('p', 'research-activity-id', `Public record ${record.id}`));
  if (record.supersedes) details.append(node('p', '', `Updates public record ${record.supersedes}.`));
  if (record.correctionReason) details.append(node('p', '', `Correction: ${record.correctionReason}`));
  evidence.append(details);
  card.append(evidence);
  if (index < 2) return card;
  const older = node('details', 'research-activity-older');
  older.append(node('summary', '', `${record.title} · ${record.state}`), card); return older;
}

export function renderResearchActivity(mount) {
  const section = node('section', 'research-activity'); section.id = 'research-journal'; section.setAttribute('aria-labelledby', 'research-activity-title');
  const header = node('div', 'research-activity-heading'), heading = node('div');
  heading.append(node('p', 'research-activity-kicker', 'REVIEWED SUMMARIES'), node('h2', '', 'Research activity'));
  heading.lastChild.id = 'research-activity-title';
  const refresh = node('button', 'research-activity-refresh', 'Refresh'); refresh.type = 'button';
  header.append(heading, refresh);
  const intro = node('p', 'research-activity-intro', 'Dated summaries of recent work, each reviewed before it appears.');
  const status = node('div', 'research-activity-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const content = node('div', 'research-activity-records'); section.append(header, intro, status, content); mount.append(section);
  let lastFeed = null;
  const controller = publicActivityStore();
  const unsubscribe = controller.subscribe(state => {
      const freshness = activityFreshness(state);
      section.dataset.freshness = freshness.mode;
      refresh.disabled = state.refreshing; refresh.textContent = state.refreshing ? 'Checking…' : 'Refresh';
      const labels = { loading: 'Checking for new entries', live: 'Published journal', snapshot: 'Reviewed snapshot', saved: 'Saved copy', offline: 'Offline · saved copy', unavailable: 'Could not check for new entries' };
      if (state.source === 'snapshot' && freshness.mode === 'unavailable') labels.unavailable = 'Reviewed snapshot · could not check for new entries';
      if (!state.feed) labels.offline = 'Offline · no saved copy';
      status.replaceChildren(node('strong', '', labels[freshness.mode]));
      if (freshness.newest) status.append(time('Latest entry:', freshness.newest));
      if (state.source === 'snapshot') status.append(node('span', '', 'Showing the reviewed snapshot included with this Library release.'));
      else if (state.error && state.feed) status.append(node('span', '', 'Showing the last valid saved copy. Refresh to check again.'));
      if (state.checkedAt) status.append(time('Last checked', state.checkedAt));
      if (lastFeed !== state.feed || !state.feed || !content.childNodes.length) {
        lastFeed = state.feed; content.replaceChildren();
        if (!state.feed) content.append(node('p', 'research-activity-empty', state.refreshing ? 'Loading reviewed research activity…' : 'The activity feed is unavailable. The research Library remains available below.'));
        else if (!state.feed.items.length) content.append(node('p', 'research-activity-empty', 'No reviewed public activity has been published yet.'));
        else {
          const records = [...state.feed.items].sort((a, b) => b.observedAt.localeCompare(a.observedAt) || b.id.localeCompare(a.id));
          records.slice(0, 2).forEach((record, index) => content.append(renderRecord(record, index)));
          // Group the remaining entries by observation day, newest day first.
          const byDay = new Map();
          records.slice(2).forEach(record => { const key = record.observedAt.slice(0, 10); if (!byDay.has(key)) byDay.set(key, []); byDay.get(key).push(record); });
          let index = 2;
          for (const [key, group] of byDay) {
            const archive = node('details', 'research-activity-archive');
            archive.append(node('summary', '', `Earlier entries · ${day(`${key}T00:00:00.000Z`)} (${group.length})`));
            group.forEach(record => archive.append(renderRecord(record, index++)));
            content.append(archive);
          }
          if (state.feed.truncated) content.append(node('p', 'research-activity-empty', 'Showing the latest reviewed activities. Earlier records remain in the research ledger.'));
        }
      }
  });
  const check = () => controller.refresh();
  const visible = () => { if (!document.hidden) check(); };
  refresh.addEventListener('click', check);
  document.addEventListener('visibilitychange', visible);
  window.addEventListener('online', visible);
  const archiveLink = node('a', '', 'All research activity →'); archiveLink.href = '#/research'; section.append(archiveLink);
  check();
  return () => {
    unsubscribe();
    refresh.removeEventListener('click', check); document.removeEventListener('visibilitychange', visible); window.removeEventListener('online', visible);
  };
}
