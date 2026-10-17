import { validateActivity } from './researchActivity.js';
const words = value => String(value || '').normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
const text = value => typeof value === 'string' ? value : Object.values(value || {}).join(' ');
export function createPublicSearch() {
  const records = new Map();
  function put(record) { records.set(record.key, { ...record, tokens: new Set(words(record.body)) }); }
  return {
    article(article, body = '') {
      put({ key: `article:${article.id}`, id: article.id, kind: 'article', title: article.title,
        subtitle: article.subtitle, route: `#/read/${encodeURIComponent(article.id)}`,
        body: [text(article.title), text(article.subtitle), ...(article.tags || []), body].join(' ') });
    },
    activity(record) {
      validateActivity(record);
      put({ key: `activity:${record.id}`, id: record.id, kind: 'activity', title: record.title,
        supersedes: record.supersedes, correctionReason: record.correctionReason,
        subtitle: record.summary, observedAt: record.observedAt, route: `#/activity/${encodeURIComponent(record.id)}`,
        body: [record.title, record.summary, record.correctionReason || '', ...record.findings, ...record.limitations, record.nextStep].join(' ') });
    },
    remove(key) { records.delete(key); },
    search(query) {
      const terms = words(query);
      const successors = new Map([...records.values()].filter(r => r.kind === 'activity' && r.supersedes)
        .map(r => [r.supersedes, r.id]));
      return [...records.values()].map(r => ({ ...r, supersededBy: r.kind === 'activity' ? successors.get(r.id) || null : null })).filter(r => terms.every(t => r.tokens.has(t)))
        .sort((a,b) => (b.observedAt || '').localeCompare(a.observedAt || '') || text(a.title).localeCompare(text(b.title)));
    },
  };
}
