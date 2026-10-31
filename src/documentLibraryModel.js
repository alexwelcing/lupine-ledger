import { articleDate } from './knowledgeHomeModel.js';

export const DOCUMENT_TITLE_FONT = '500 17px Newsreader';
export const DOCUMENT_SUMMARY_FONT = '400 13px Newsreader';
export const DOCUMENT_TITLE_LINE_HEIGHT = 22;
export const DOCUMENT_SUMMARY_LINE_HEIGHT = 18;

const localized = (value, language) => typeof value === 'string' ? value : value?.[language] || value?.en || Object.values(value || {})[0] || '';
export const normalizeDocumentQuery = value => String(value || '').normalize('NFKC').toLocaleLowerCase('en').trim();
const entity = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export function documentSearchText(html) {
  return String(html || '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (original, key) => {
      if (key[0] !== '#') return entity[key.toLowerCase()] ?? original;
      const code = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1));
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
    }).replace(/\s+/g, ' ').trim();
}

/** Metadata and complete HTML stay in memory; only the selected body is mounted. */
export function createDocumentIndex(manifest = {}, corpus = {}, language = 'en') {
  const records = Array.isArray(corpus) ? corpus : corpus.articles || [];
  const variants = new Map();
  for (const record of records) {
    if (!record || typeof record.id !== 'string') continue;
    const langs = variants.get(record.id) || new Map();
    if (!langs.has(record.lang || 'en')) langs.set(record.lang || 'en', record);
    variants.set(record.id, langs);
  }
  const metadata = new Map((manifest.articles || []).map(article => [article.id, article]));
  const ids = [...metadata.keys(), ...[...variants.keys()].filter(id => !metadata.has(id))];
  const first = ids.indexOf('research-index');
  if (first > 0) ids.unshift(...ids.splice(first, 1));
  const categories = (manifest.categories || []).map(category => ({
    id: category.id, label: localized(category.label, language), count: 0,
  }));
  const categoryMap = new Map(categories.map(category => [category.id, category]));
  const documents = ids.map(id => {
    const meta = metadata.get(id) || {};
    const langs = variants.get(id) || new Map();
    const record = langs.get(language) || langs.get('en') || langs.values().next().value || {};
    const title = localized(record.title || meta.title, language) || id;
    const subtitle = localized(record.subtitle || meta.subtitle, language);
    const category = meta.category || record.category || 'uncategorized';
    if (!categoryMap.has(category)) {
      const additional = { id: category, label: 'Other documents', count: 0 };
      categories.push(additional); categoryMap.set(category, additional);
    }
    categoryMap.get(category).count++;
    const status = manifest.statuses?.[meta.status];
    const document = { ...meta, ...record, id, title, subtitle, category,
      categoryLabel: categoryMap.get(category).label,
      status: meta.status || null,
      statusLabel: localized(status?.label, language), statusGloss: localized(status?.gloss, language),
      html: typeof record.html === 'string' ? record.html : '',
      available: typeof record.html === 'string', lang: record.lang || 'en', requestedLanguage: language,
      date: articleDate({ ...meta, ...record }),
      variants: langs,
    };
    document.searchText = normalizeDocumentQuery([title, subtitle, document.categoryLabel,
      ...(meta.tags || record.tags || []), ...(record.searchAliases || []), document.originalTitle || '',
      documentSearchText(document.html)].join(' '));
    document.searchTitle = normalizeDocumentQuery(title);
    document.searchSubtitle = normalizeDocumentQuery(subtitle);
    document.searchKeywords = normalizeDocumentQuery([document.categoryLabel, ...(meta.tags || record.tags || []),
      ...(record.searchAliases || []), document.originalTitle || ''].join(' '));
    return document;
  });
  return { documents, byId: new Map(documents.map(document => [document.id, document])), categories };
}

export function filterDocuments(index, query = '', category = '') {
  const normalized = normalizeDocumentQuery(query);
  const terms = normalized.split(/\s+/).filter(Boolean);
  const matches = index.documents.filter(document => (!category || document.category === category)
    && terms.every(term => document.searchText.includes(term)));
  if (!terms.length) return matches;
  const relevance = document => (document.searchTitle.includes(normalized) ? 1000 : 0)
    + terms.reduce((score, term) => score + (document.searchTitle.includes(term) ? 100
      : document.searchSubtitle.includes(term) || document.searchKeywords.includes(term) ? 20 : 1), 0);
  // Stable sorting preserves the collection's order when match strengths tie.
  return matches.sort((a, b) => relevance(b) - relevance(a));
}

export function documentRoute(id, passage = '') {
  return `#/read/${encodeURIComponent(id)}${passage ? `?passage=${encodeURIComponent(passage)}` : ''}`;
}

/** A repeat router notification is a no-op, not a request to reset the reader. */
export function createDocumentSession(index) {
  let currentId = null, currentPassage = '', currentLanguage = null;
  const scrollPositions = new Map();
  return {
    get currentId() { return currentId; },
    get currentPassage() { return currentPassage; },
    rememberScroll(top) { if (currentId && Number.isFinite(top)) scrollPositions.set(`${currentId}:${currentLanguage}`, Math.max(0, top)); },
    open(id, passage = '') {
      const preferred = index.byId.get(id);
      if (!preferred) return null;
      // Reviewed passage IDs are extracted from the English source, even when a
      // translated whole-article view is selected in the user's settings.
      const english = passage ? preferred.variants.get('en') : null;
      const document = english && preferred.lang !== 'en' ? { ...preferred, ...english,
        title: localized(english.title, 'en') || preferred.title,
        subtitle: localized(english.subtitle, 'en'), lang: 'en', date: articleDate(english),
        status: preferred.status, statusLabel: preferred.statusLabel, statusGloss: preferred.statusGloss,
      } : preferred;
      const sameDocument = currentId === id && currentLanguage === document.lang;
      const unchanged = sameDocument && currentPassage === passage;
      currentId = id; currentPassage = passage; currentLanguage = document.lang;
      return { document, unchanged, sameDocument, scrollTop: scrollPositions.get(`${id}:${document.lang}`) || 0, passage };
    },
  };
}

/** Preparation is once per string/font, while widths can change freely. */
export function createDocumentMeasurements(documents, { prepareWithSegments, layoutWithLines }) {
  const prepared = documents.map(document => ({ id: document.id,
    title: prepareWithSegments(document.title, DOCUMENT_TITLE_FONT),
    summary: document.subtitle ? prepareWithSegments(document.subtitle, DOCUMENT_SUMMARY_FONT) : null,
  }));
  return {
    layout(width) {
      const availableWidth = Math.max(1, Number(width) || 1);
      return new Map(prepared.map(document => {
        const title = layoutWithLines(document.title, availableWidth, DOCUMENT_TITLE_LINE_HEIGHT);
        const summary = document.summary ? layoutWithLines(document.summary, availableWidth, DOCUMENT_SUMMARY_LINE_HEIGHT) : null;
        return [document.id, { titleLines: title.lines.map(line => line.text), titleHeight: title.height,
          summaryLines: summary?.lines.slice(0, 2).map(line => line.text) || [],
          summaryTruncated: (summary?.lineCount || 0) > 2 }];
      }));
    },
  };
}
