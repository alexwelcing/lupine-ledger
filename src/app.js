// Lupine Library — mobile-first research reader.
// Single-page app with hash routing. No framework — dependencies are in the DOM.

import { t, detectLang, saveLang, DEFAULT_LANG, SUPPORTED_LANGS } from './i18n.js';
import { renderMlipFlywheelView } from './mlipFlywheelView.js';
import { parseHashRoute, parseKnowledgeGraphHash, renderKnowledgeGraphView } from './knowledgeGraphView.js';
import {
  buildTagIndex,
  filterAndSortArticles,
  parseLibraryHash,
  serializeLibraryHash,
} from './libraryFilters.js';

const BANNERS = [
  {
    role: 'preprint',
    className: 'callout-preprint',
    badge: 'Preprint',
    title: 'IMMI: Interatomic Machine Learning Interface',
    subtitle: 'A unified, open interface for machine learning interatomic potentials.',
    href: '/immi_paper.pdf',
    external: true,
  },
  {
    role: 'report',
    className: 'callout-featured',
    badge: 'Interactive theorem demo + live GPU showcase',
    title: 'Growing the Hyper-Ribbon',
    subtitle: 'Start with the projected-ribbon theorem gate, then continue to framework, validation, compute log, and observatory.',
    href: '#/reports',
  },
  {
    role: 'live-lab',
    className: 'callout-featured callout-live-lab',
    badge: 'Library Live Lab',
    title: 'MLIP Flywheel Visual Review',
    subtitle: 'Stage map, 5x5 baseline surface, Distill triplets, evaluator rubric, and physical relaxation imagery.',
    href: '#/system/mlip-flywheel',
  },
];

const STATE = {
  manifest: null,          // { categories, articles, version }
  articleCache: new Map(), // id -> article (with html)
  view: 'home',
  currentId: null,
  settings: loadSettings(),
  progress: loadProgress(), // { [id]: { pct, scrollTop, ts } }
  statusFilter: null,       // null = all; else a status id from manifest.statuses
};

const VIEW = document.getElementById('view');
const TOPBAR = document.getElementById('topbar');
const BACK_BTN = document.getElementById('back-btn');
const PROGRESS_FILL = document.getElementById('progress-fill');
let activeViewCleanup = null;

function clearActiveView() {
  if (typeof activeViewCleanup === 'function') activeViewCleanup();
  activeViewCleanup = null;
}

// ───────────────────────────────────────────────────────────────
// Persistence
// ───────────────────────────────────────────────────────────────
function loadSettings() {
  try {
    return Object.assign(
      { size: 'md', theme: 'dark', width: 'narrow', lang: detectLang() },
      JSON.parse(localStorage.getItem('ll.settings') || '{}')
    );
  } catch { return { size: 'md', theme: 'dark', width: 'narrow', lang: detectLang() }; }
}
function saveSettings() {
  localStorage.setItem('ll.settings', JSON.stringify(STATE.settings));
  applySettings();
}
function applySettings() {
  const html = document.documentElement;
  html.dataset.theme = STATE.settings.theme;
  html.dataset.readerSize = STATE.settings.size;
  html.dataset.readerWidth = STATE.settings.width;
  html.lang = STATE.settings.lang || DEFAULT_LANG;
  // Sync theme-color meta for PWA chrome
  const map = { dark: '#06070d', sepia: '#1f1a12', light: '#f6f5f0' };
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = map[STATE.settings.theme] || '#06070d';
  // Sync page title
  const brandTitle = document.querySelector('.brand-title');
  if (brandTitle) brandTitle.textContent = t('brand.title', STATE.settings.lang);
}

function translateStaticDOM() {
  const lang = STATE.settings.lang;
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key, lang);
  }
  for (const el of document.querySelectorAll('[data-i18n-aria]')) {
    const key = el.dataset.i18nAria;
    if (key) el.setAttribute('aria-label', t(key, lang));
  }
  for (const el of document.querySelectorAll('[data-i18n-placeholder]')) {
    const key = el.dataset.i18nPlaceholder;
    if (key) el.setAttribute('placeholder', t(key, lang));
  }
  const titleEl = document.querySelector('title.i18n-title');
  if (titleEl) titleEl.textContent = t('meta.title', lang);
  const descEl = document.querySelector('meta.i18n-desc');
  if (descEl) descEl.setAttribute('content', t('meta.description', lang));
}

function loadProgress() {
  try { return JSON.parse(localStorage.getItem('ll.progress') || '{}'); }
  catch { return {}; }
}
function saveProgress() {
  localStorage.setItem('ll.progress', JSON.stringify(STATE.progress));
}

// ───────────────────────────────────────────────────────────────
// Manifest + article loading (cache-aware)
// ───────────────────────────────────────────────────────────────
async function fetchManifest() {
  if (STATE.manifest) return STATE.manifest;
  const res = await fetch('/data/library.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('manifest fetch failed');
  STATE.manifest = await res.json();
  STATE.sourceToId = buildSourceToIdMap(STATE.manifest);
  return STATE.manifest;
}

async function fetchKnowledgeGraph() {
  const res = await fetch('/data/knowledge-graph.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('knowledge graph fetch failed');
  return res.json();
}

function buildSourceToIdMap(manifest) {
  const map = new Map();
  for (const a of manifest.articles || []) {
    if (a.source) map.set(a.source.replace(/^\/+/, ''), a.id);
  }
  return map;
}

function articleVersionQuery() {
  return STATE.manifest?.version ? `?v=${encodeURIComponent(STATE.manifest.version)}` : '';
}

async function fetchArticle(id, preferredLang) {
  const cacheKey = `${id}:${preferredLang || STATE.settings.lang}`;
  if (STATE.articleCache.has(cacheKey)) return STATE.articleCache.get(cacheKey);

  const lang = preferredLang || STATE.settings.lang;
  const q = articleVersionQuery();
  let res = null;
  let triedLang = null;

  // Try preferred language variant first
  if (lang !== DEFAULT_LANG) {
    res = await fetch(`/data/${encodeURIComponent(id)}.${lang}.json${q}`);
    if (res.ok) triedLang = lang;
  }

  // Fall back to default
  if (!res || !res.ok) {
    res = await fetch(`/data/${encodeURIComponent(id)}.json${q}`);
    triedLang = DEFAULT_LANG;
  }

  if (!res.ok) throw new Error(`article ${id} fetch failed`);
  const article = await res.json();
  article._displayLang = triedLang;
  article._requestedLang = lang;
  STATE.articleCache.set(cacheKey, article);
  return article;
}

function handleArticleLinkClick(e, article) {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (!href || href.startsWith('#') || /^[a-z][a-z0-9+.-]:/i.test(href)) return;

  const mdMatch = href.match(/^([^?#]*\.md)(\?[^#]*)?(#.*)?$/i);
  if (!mdMatch) return;

  e.preventDefault();
  const [, mdPath, , fragment] = mdMatch;
  const source = article.source;
  const base = source ? `https://x/${source}` : 'https://x/';
  const resolved = new URL(mdPath, base).pathname.replace(/^\/+/, '');
  const targetId = STATE.sourceToId?.get(resolved);
  if (targetId) {
    location.hash = `#/read/${encodeURIComponent(targetId)}${fragment || ''}`;
  } else {
    window.open(a.href, '_blank', 'noopener');
  }
}

// ───────────────────────────────────────────────────────────────
// Home / shelves
// ───────────────────────────────────────────────────────────────
function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (v != null) n.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return n;
}

function cardFor(article, opts = {}) {
  const p = STATE.progress[article.id];
  const card = el('a', { href: `#/read/${article.id}`, class: 'card' });
  if (opts.showCategory) {
    const catLabel = (STATE.manifest.categories.find(c => c.id === article.category) || {}).label;
    if (catLabel) card.append(el('span', { class: 'card-pill-cat' }, t(catLabel, STATE.settings.lang)));
  }
  if (article.status) {
    const st = (STATE.manifest.statuses || {})[article.status] || { label: { en: article.status }, color: '#888' };
    card.append(el('span', {
      class: 'card-status',
      style: `display:inline-block;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;padding:2px 8px;border-radius:999px;color:${st.color};border:1px solid ${st.color};background:color-mix(in srgb, ${st.color} 12%, transparent);`,
    }, t(st.label, STATE.settings.lang)));
  }
  card.append(el('div', { class: 'card-title' }, t(article.title, STATE.settings.lang)));
  if (article.subtitle) card.append(el('div', { class: 'card-sub' }, t(article.subtitle, STATE.settings.lang)));

  const meta = el('div', { class: 'card-meta' });
  meta.append(el('span', {}, `${article.readMinutes} min`));
  meta.append(el('span', {}, `${article.words.toLocaleString()} words`));
  for (const t of (article.tags || []).slice(0, 3)) {
    meta.append(el('span', { class: 'tag' }, t));
  }
  card.append(meta);

  if (p && p.pct > 0.02) {
    const bar = el('div', { class: 'card-progress' });
    bar.append(el('span', { style: `width:${Math.min(100, Math.round(p.pct * 100))}%` }));
    card.append(bar);
  }
  return card;
}

async function renderHome() {
  clearActiveView();
  STATE.view = 'home';
  document.documentElement.dataset.view = 'home';
  BACK_BTN.hidden = true;
  setProgress(0);
  VIEW.innerHTML = `<div class="loading">${t('home.loading', STATE.settings.lang)}</div>`;
  try {
    const m = await fetchManifest();
    VIEW.innerHTML = '';

    // Hero
    const hero = el('section', { class: 'hero' });
    hero.append(el('h1', { html: t('home.hero', STATE.settings.lang) }));
    hero.append(el('p', {}, t('home.hero.sub', STATE.settings.lang)));
    const totalWords = m.articles.reduce((a, b) => a + (b.words || 0), 0);
    const totalMin = m.articles.reduce((a, b) => a + (b.readMinutes || 0), 0);
    const stats = el('div', { class: 'hero-stats' });
    stats.append(el('span', { html: `<strong>${m.articles.length}</strong> ${t('home.stats.reports', STATE.settings.lang)}` }));
    stats.append(el('span', { html: `<strong>${totalWords.toLocaleString()}</strong> ${t('home.stats.words', STATE.settings.lang)}` }));
    stats.append(el('span', { html: `≈<strong>${totalMin}</strong> ${t('home.stats.minutes', STATE.settings.lang)}` }));
    hero.append(stats);
    hero.append(el('a', { class: 'tags-browse-link', href: '#/tags' }, t('tags.index', STATE.settings.lang), ' →'));
    VIEW.append(hero);

    // Start Here — guided journeys for four personas
    if (m.journeys && m.journeys.length) {
      const journeysSec = el('section', { class: 'journeys' });
      journeysSec.append(el('h2', {}, t('home.journeys.title', STATE.settings.lang)));
      const journeysGrid = el('div', { class: 'journeys-grid' });
      for (const j of m.journeys) {
        const card = el('a', { class: 'journey-card', href: `#/read/${j.path[0]}` });
        card.append(el('div', { class: 'journey-label' }, t(j.label, STATE.settings.lang)));
        card.append(el('div', { class: 'journey-desc' }, t(j.description, STATE.settings.lang)));
        const meta = el('div', { class: 'journey-meta' });
        meta.append(el('span', {}, `${j.path.length} articles →`));
        card.append(meta);
        journeysGrid.append(card);
      }
      journeysSec.append(journeysGrid);
      VIEW.append(journeysSec);
    }

    // Featured — max 4 curated callouts with defined roles
    const featured = (m.articles || []).filter(a => a.featured && a.featuredRole).slice(0, 4);
    if (featured.length) {
      const featuredSec = el('section', { class: 'featured-section' });
      featuredSec.append(el('h2', {}, t('home.featured.title', STATE.settings.lang)));
      const featuredGrid = el('div', { class: 'featured-grid' });
      for (const fa of featured) {
        const roleLabel = fa.featuredRole
          ? t(`home.featured.role.${fa.featuredRole}`, STATE.settings.lang)
          : t('home.featured.role.default', STATE.settings.lang);
        const card = el('a', { class: 'featured-card', href: `#/read/${fa.id}` });
        card.append(el('span', { class: 'featured-role' }, roleLabel));
        card.append(el('strong', { class: 'featured-title' }, t(fa.title, STATE.settings.lang)));
        if (fa.subtitle) card.append(el('span', { class: 'featured-sub' }, t(fa.subtitle, STATE.settings.lang)));
        featuredGrid.append(card);
      }
      featuredSec.append(featuredGrid);
      VIEW.append(featuredSec);
    }

    // Continue reading
    const inProgress = Object.entries(STATE.progress)
      .map(([id, v]) => ({ id, ...v }))
      .filter(p => p.pct > 0.02 && p.pct < 0.98)
      .sort((a, b) => (b.ts || 0) - (a.ts || 0))
      .slice(0, 3)
      .map(p => m.articles.find(a => a.id === p.id))
      .filter(Boolean);
    if (inProgress.length) {
      const sec = el('section', { class: 'continue' });
      sec.append(el('h2', {}, t('home.continue', STATE.settings.lang)));
      const cards = el('div', { class: 'cards' });
      for (const a of inProgress) cards.append(cardFor(a, { showCategory: true }));
      sec.append(cards);
      VIEW.append(sec);
    }

    // Status filter — browse the corpus by lifecycle stage. Only statuses
    // actually present in the corpus get a chip, each with a live count.
    const statuses = m.statuses || {};
    const presentCounts = {};
    for (const a of m.articles) if (a.status) presentCounts[a.status] = (presentCounts[a.status] || 0) + 1;
    const presentStatuses = Object.keys(statuses).filter(s => presentCounts[s]);
    if (presentStatuses.length) {
      const bar = el('div', { class: 'status-filter' });
      const chip = (label, color, active, on) => {
        const c = el('button', {
          class: 'status-chip' + (active ? ' active' : ''),
          style: `font-size:0.75rem;font-weight:700;padding:5px 12px;border-radius:999px;cursor:pointer;border:1px solid ${color};color:${active ? '#fff' : color};background:${active ? color : `color-mix(in srgb, ${color} 10%, transparent)`};`,
        }, label);
        c.addEventListener('click', on);
        return c;
      };
      bar.append(chip(`All · ${m.articles.length}`, '#9ca3af', !STATE.statusFilter, () => { STATE.statusFilter = null; renderHome(); }));
      for (const s of presentStatuses) {
        const st = statuses[s];
        bar.append(chip(`${t(st.label, STATE.settings.lang)} · ${presentCounts[s]}`, st.color, STATE.statusFilter === s, () => { STATE.statusFilter = s; renderHome(); }));
      }
      VIEW.append(bar);
      // Gloss line: one-line explanation of each present status
      const glossParts = presentStatuses
        .map(s => {
          const st = statuses[s];
          if (!st || !st.gloss) return null;
          const g = t(st.gloss, STATE.settings.lang);
          if (!g) return null;
          return `${t(st.label, STATE.settings.lang)} = ${g}`;
        })
        .filter(Boolean);
      if (glossParts.length) {
        VIEW.append(el('p', { class: 'status-gloss' }, glossParts.join('. ') + '.'));
      }
    }

    // Shelves
    for (const cat of m.categories) {
      let arts = m.articles.filter(a => a.category === cat.id);
      if (STATE.statusFilter) arts = arts.filter(a => a.status === STATE.statusFilter);
      if (!arts.length) continue;
      const shelf = el('section', { class: 'shelf' });
      shelf.append(el('h2', {}, t(cat.label, STATE.settings.lang)));
      if (cat.blurb && !STATE.statusFilter) shelf.append(el('p', { class: 'blurb' }, t(cat.blurb, STATE.settings.lang)));

      // Group ribbons: if articles share a group, render a connector above them
      const groups = {};
      for (const a of arts) {
        if (a.group) {
          if (!groups[a.group]) groups[a.group] = [];
          groups[a.group].push(a);
        }
      }
      const cards = el('div', { class: 'cards' });
      let lastGroup = null;
      for (const a of arts) {
        if (a.group && a.group !== lastGroup && groups[a.group]) {
          const ribbon = el('div', { class: 'group-ribbon' });
          ribbon.append(el('span', { class: 'group-ribbon-label' }, t(`group.${a.group}`, STATE.settings.lang) || a.group));
          ribbon.append(el('span', { class: 'group-ribbon-arrow' }, '→'));
          cards.append(ribbon);
          lastGroup = a.group;
        }
        if (!a.group) lastGroup = null;
        cards.append(cardFor(a));
      }
      shelf.append(cards);
      VIEW.append(shelf);
    }
    if (STATE.statusFilter && !m.articles.some(a => a.status === STATE.statusFilter)) {
      VIEW.append(el('div', { class: 'empty', style: 'margin:24px 16px;' }, 'No entries with this status.'));
    }
  } catch (e) {
    console.error(e);
    VIEW.innerHTML = `<div class="empty">${t('home.error', STATE.settings.lang)}</div>`;
  }
}

// ───────────────────────────────────────────────────────────────
// Tags / faceted library browser
// ───────────────────────────────────────────────────────────────
async function renderTags() {
  clearActiveView();
  STATE.view = 'tags';
  document.documentElement.dataset.view = 'tags';
  STATE.currentId = null;
  BACK_BTN.hidden = false;
  setProgress(0);
  window.scrollTo({ top: 0, behavior: 'instant' });
  VIEW.innerHTML = `<div class="loading">${t('home.loading', STATE.settings.lang)}</div>`;

  try {
    const m = await fetchManifest();
    const state = parseLibraryHash(location.hash);
    const tagIndex = buildTagIndex(m.articles);
    const results = filterAndSortArticles(m.articles, state, STATE.settings.lang);
    VIEW.innerHTML = '';

    const root = el('div', { class: 'tag-browser' });
    const heading = el('header', { class: 'tag-browser-head' });
    heading.append(el('h1', {}, t('tags.title', STATE.settings.lang)));
    heading.append(el('p', {}, t('tags.subtitle', STATE.settings.lang)));
    root.append(heading);

    const setState = (key, value) => {
      location.hash = serializeLibraryHash({ ...state, [key]: value });
    };
    const countsFor = (key) => {
      const counts = new Map();
      for (const article of m.articles) {
        const value = article[key];
        if (value) counts.set(value, (counts.get(value) || 0) + 1);
      }
      return counts;
    };
    const selectControl = (name, label, options) => {
      const wrapper = el('label', { class: 'facet-control' });
      wrapper.append(el('span', {}, label));
      const select = el('select', { name, 'aria-label': label });
      select.append(el('option', { value: '' }, t('tags.all', STATE.settings.lang)));
      for (const option of options) {
        select.append(el('option', { value: option.value }, `${option.label} · ${option.count}`));
      }
      select.value = state[name] || '';
      select.addEventListener('change', () => setState(name, select.value));
      wrapper.append(select);
      return wrapper;
    };

    const statusCounts = countsFor('status');
    const categoryCounts = countsFor('category');
    const groupCounts = countsFor('group');
    const controls = el('form', { class: 'facet-controls', 'aria-label': t('tags.title', STATE.settings.lang) });
    controls.addEventListener('submit', (event) => event.preventDefault());
    controls.append(selectControl('status', t('tags.facet.status', STATE.settings.lang),
      [...statusCounts].map(([value, count]) => ({
        value,
        count,
        label: t(m.statuses?.[value]?.label || value, STATE.settings.lang),
      }))));
    controls.append(selectControl('category', t('tags.facet.category', STATE.settings.lang),
      m.categories.filter((category) => categoryCounts.has(category.id)).map((category) => ({
        value: category.id,
        count: categoryCounts.get(category.id),
        label: t(category.label, STATE.settings.lang),
      }))));
    controls.append(selectControl('group', t('tags.facet.group', STATE.settings.lang),
      [...groupCounts].map(([value, count]) => ({
        value,
        count,
        label: t(`group.${value}`, STATE.settings.lang),
      }))));
    controls.append(selectControl('tag', t('tags.facet.tag', STATE.settings.lang),
      tagIndex.map(({ tag, count }) => ({ value: tag, count, label: tag }))));
    controls.append(selectControl('sort', t('tags.sort.label', STATE.settings.lang), [
      { value: 'title', label: t('tags.sort.title', STATE.settings.lang), count: m.articles.length },
      { value: 'words', label: t('tags.sort.words', STATE.settings.lang), count: m.articles.length },
      { value: 'readMinutes', label: t('tags.sort.readMinutes', STATE.settings.lang), count: m.articles.length },
    ]));
    const clear = el('a', { class: 'facet-clear', href: '#/tags' }, t('tags.clear', STATE.settings.lang));
    controls.append(clear);
    root.append(controls);

    const indexSection = el('section', { class: 'tag-index-section' });
    indexSection.append(el('h2', {}, `${t('tags.index', STATE.settings.lang)} · ${tagIndex.length}`));
    const index = el('div', { class: 'tag-index' });
    for (const item of tagIndex) {
      const href = serializeLibraryHash({ ...state, tag: item.tag });
      index.append(el('a', {
        class: 'tag-index-link' + (state.tag === item.tag ? ' active' : ''),
        href,
        'aria-current': state.tag === item.tag ? 'true' : null,
      }, item.tag, el('span', {}, String(item.count))));
    }
    indexSection.append(index);
    root.append(indexSection);

    const resultSection = el('section', { class: 'tag-results' });
    const resultLabel = results.length === 1
      ? t('tags.results.one', STATE.settings.lang)
      : t('tags.results', STATE.settings.lang, { count: results.length });
    resultSection.append(el('h2', {}, resultLabel));
    if (!results.length) {
      resultSection.append(el('div', { class: 'empty' }, t('tags.empty', STATE.settings.lang)));
    } else {
      const cards = el('div', { class: 'cards' });
      for (const article of results) cards.append(cardFor(article, { showCategory: true }));
      resultSection.append(cards);
    }
    root.append(resultSection);
    VIEW.append(root);
  } catch (error) {
    console.error(error);
    VIEW.innerHTML = `<div class="empty">${t('home.error', STATE.settings.lang)}</div>`;
  }
}

// ───────────────────────────────────────────────────────────────
// Reader
// ───────────────────────────────────────────────────────────────
async function renderReader(id) {
  clearActiveView();
  STATE.view = 'reader';
  document.documentElement.dataset.view = 'reader';
  STATE.currentId = id;
  BACK_BTN.hidden = false;
  setProgress(0);
  VIEW.innerHTML = `<div class="loading">${t('reader.loading', STATE.settings.lang)}</div>`;
  window.scrollTo({ top: 0, behavior: 'instant' });
  try {
    const m = await fetchManifest();
    const article = await fetchArticle(id);
    const cat = m.categories.find(c => c.id === article.category);

    VIEW.innerHTML = '';
    const root = el('article', { class: 'reader' });

    const head = el('header', { class: 'reader-head' });
    if (cat) head.append(el('div', { class: 'reader-cat' }, t(cat.label, STATE.settings.lang)));

    // Fallback notice when article not available in requested language
    if (article._displayLang && article._requestedLang && article._displayLang !== article._requestedLang) {
      const langName = (m.languages && m.languages[article._requestedLang]?.native) || article._requestedLang;
      const notice = el('div', { class: 'lang-fallback', style: 'margin-bottom: 12px; padding: 10px 14px; border-radius: 6px; background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.25); color: #fbbf24; font-size: 0.85rem;' });
      notice.textContent = t('home.fallbackNotice', STATE.settings.lang, { lang: langName });
      head.append(notice);
    }

    head.append(el('h1', { class: 'reader-title' }, t(article.title, STATE.settings.lang)));
    if (article.subtitle) head.append(el('p', { class: 'reader-sub' }, t(article.subtitle, STATE.settings.lang)));
    const meta = el('div', { class: 'reader-meta' });
    meta.append(el('span', {}, `${article.readMinutes} ${t('reader.meta.read', STATE.settings.lang)}`));
    meta.append(el('span', {}, `${article.words.toLocaleString()} ${t('home.stats.words', STATE.settings.lang)}`));
    if (article.source) meta.append(el('span', { class: 'tag' }, article.source));
    head.append(meta);
    root.append(head);

    // Extracted Knowledge Panel
    if (article.extracted_knowledge && Object.keys(article.extracted_knowledge).length > 0) {
      const panel = el('div', { class: 'knowledge-panel' });
      panel.append(el('h3', { class: 'kp-title' }, 'Extracted Knowledge'));
      const grid = el('div', { class: 'knowledge-grid' });
      for (const [key, val] of Object.entries(article.extracted_knowledge)) {
        const item = el('div', { class: 'knowledge-item' });
        item.append(el('span', { class: 'k-key' }, key));
        let displayVal = val;
        if (Array.isArray(val)) displayVal = val.join(', ');
        else if (typeof val === 'object') displayVal = JSON.stringify(val);
        item.append(el('span', { class: 'k-val' }, String(displayVal)));
        grid.append(item);
      }
      panel.append(grid);
      root.append(panel);
    }

    const body = el('div', { class: 'content' });
    body.innerHTML = article.html;
    root.append(body);

    // Defense-in-depth: even if a cached article JSON still contains raw .md
    // links, rewrite clicks to intra-library targets so they don't fall back
    // to the home view. Unknown .md files open as raw sources.
    body.addEventListener('click', (e) => handleArticleLinkClick(e, article));

    VIEW.append(root);

    // Prev / next by manifest order, stable across categories
    const idx = m.articles.findIndex(a => a.id === id);
    const prev = idx > 0 ? m.articles[idx - 1] : null;
    const next = idx < m.articles.length - 1 ? m.articles[idx + 1] : null;
    const nav = el('nav', { class: 'reader-nav' });
    nav.append(linkBlock(prev, t('reader.nav.prev', STATE.settings.lang), 'prev'));
    nav.append(linkBlock(next, t('reader.nav.next', STATE.settings.lang), 'next'));
    VIEW.append(nav);

    // Restore scroll position if partially read
    const p = STATE.progress[id];
    if (p && p.scrollTop) {
      // Wait for layout
      requestAnimationFrame(() => window.scrollTo({ top: p.scrollTop, behavior: 'instant' }));
    }
  } catch (e) {
    console.error(e);
    VIEW.innerHTML = `<div class="empty">${t('reader.error.offline', STATE.settings.lang)}</div>`;
  }
}
function linkBlock(article, label, cls) {
  if (!article) {
    return el('a', { class: `${cls} disabled`, 'aria-disabled': 'true' },
      el('span', { class: 'lbl' }, label),
      el('span', {}, cls === 'prev' ? t('reader.nav.start', STATE.settings.lang) : t('reader.nav.end', STATE.settings.lang)));
  }
  return el('a', { class: cls, href: `#/read/${article.id}` },
    el('span', { class: 'lbl' }, label),
    el('span', {}, t(article.title, STATE.settings.lang)));
}

async function renderMlipFlywheel() {
  clearActiveView();
  STATE.view = 'flywheel';
  document.documentElement.dataset.view = 'flywheel';
  STATE.currentId = null;
  BACK_BTN.hidden = false;
  setProgress(0);
  window.scrollTo({ top: 0, behavior: 'instant' });
  activeViewCleanup = renderMlipFlywheelView(VIEW);
}

async function renderKnowledgeGraph() {
  clearActiveView();
  STATE.view = 'graph';
  document.documentElement.dataset.view = 'graph';
  STATE.currentId = null;
  BACK_BTN.hidden = false;
  setProgress(0);
  window.scrollTo({ top: 0, behavior: 'instant' });
  const { initialFocus, initialState } = parseKnowledgeGraphHash(location.hash);
  activeViewCleanup = await renderKnowledgeGraphView(VIEW, {
    fetchKnowledgeGraph,
    initialFocus,
    initialState,
  });
}

// Scroll-tracked progress
function onScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pct = Math.min(1, Math.max(0, window.scrollY / max));
  setProgress(pct);
  if (STATE.view === 'reader' && STATE.currentId) {
    STATE.progress[STATE.currentId] = { pct, scrollTop: window.scrollY, ts: Date.now() };
    // Throttle writes
    clearTimeout(onScroll._t);
    onScroll._t = setTimeout(saveProgress, 400);
  }
}
function setProgress(pct) {
  PROGRESS_FILL.style.width = `${Math.round(pct * 100)}%`;
}

// ───────────────────────────────────────────────────────────────
// Router
// ───────────────────────────────────────────────────────────────
function route() {
  const hash = location.hash || '#/';
  const { path, arg } = parseHashRoute(hash);
  if (path === 'read' && arg) {
    renderReader(decodeURIComponent(arg));
  } else if (path === 'graph') {
    renderKnowledgeGraph();
  } else if (path === 'tags') {
    renderTags();
  } else if (path === 'system' && arg === 'mlip-flywheel') {
    renderMlipFlywheel();
  } else if (path === 'reports') {
    renderReports();
  } else {
    renderHome();
  }
}

// ───────────────────────────────────────────────────────────────
// Reports index page
// ───────────────────────────────────────────────────────────────
async function renderReports() {
  clearActiveView();
  STATE.view = 'reports';
  document.documentElement.dataset.view = 'reports';
  BACK_BTN.hidden = false;
  setProgress(0);
  window.scrollTo({ top: 0, behavior: 'instant' });
  VIEW.innerHTML = '';

  const heading = el('section', { class: 'hero' });
  heading.append(el('h1', {}, 'Interactive Demos'));
  heading.append(el('p', {}, 'Theorem demos, compute logs, and live GPU showcases.'));
  VIEW.append(heading);

  const grid = el('div', { class: 'cards' });
  const reports = [
    { href: '/reports/hyper-ribbon-theorem.html', title: 'Theorem Demo', subtitle: 'Projected-ribbon theorem gate' },
    { href: '/reports/growing-hyper-ribbon.html', title: 'Part 1', subtitle: 'Growing the Hyper-Ribbon framework' },
    { href: '/reports/growing-hyper-ribbon-part-2.html', title: 'Part 2', subtitle: 'Validation and extensions' },
    { href: '/reports/growing-hyper-ribbon-experiments.html', title: 'Compute Log', subtitle: 'Raw experiment logs and timings' },
    { href: '/reports/growing-hyper-ribbon-observatory.html', title: 'Observatory', subtitle: 'Live observatory dashboard' },
    { href: '#/read/mlip-cloud-baseline-distill', title: 'MLIP Cloud Run', subtitle: 'Cloud-run baseline distill' },
  ];
  for (const r of reports) {
    const card = el('a', { href: r.href, class: 'card' });
    card.append(el('div', { class: 'card-title' }, r.title));
    card.append(el('div', { class: 'card-sub' }, r.subtitle));
    grid.append(card);
  }
  VIEW.append(grid);
}

// ───────────────────────────────────────────────────────────────
// Search dialog
// ───────────────────────────────────────────────────────────────
const searchDialog = document.getElementById('search-dialog');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchHint = document.getElementById('search-hint');

document.getElementById('search-btn').addEventListener('click', () => openSearch());
document.getElementById('search-close').addEventListener('click', () => searchDialog.close());
searchDialog.addEventListener('click', (e) => { if (e.target === searchDialog) searchDialog.close(); });

async function openSearch() {
  await fetchManifest();
  searchInput.value = '';
  renderSearchResults('');
  if (typeof searchDialog.showModal === 'function') searchDialog.showModal();
  else searchDialog.setAttribute('open', '');
  setTimeout(() => searchInput.focus(), 50);
}
searchInput?.addEventListener('input', () => renderSearchResults(searchInput.value.trim()));
function renderSearchResults(q) {
  const m = STATE.manifest;
  if (!m) return;
  const ql = q.toLowerCase();
  const list = q
    ? m.articles
        .map(a => ({ a, score: scoreMatch(a, ql) }))
        .filter(x => x.score > 0)
        .sort((x, y) => y.score - x.score)
        .map(x => x.a)
    : m.articles;
  searchResults.innerHTML = '';
  if (!list.length) {
    searchHint.textContent = `No results for “${q}”.`;
    searchHint.classList.add('err');
    return;
  }
  searchHint.classList.remove('err');
  searchHint.textContent = q
    ? (list.length === 1 ? t('search.results.one', STATE.settings.lang) : t('search.results.many', STATE.settings.lang, { count: list.length }))
    : t('search.all', STATE.settings.lang);
  for (const a of list.slice(0, 30)) {
    const li = el('li');
    const link = el('a', { href: `#/read/${a.id}`,
      onclick: () => searchDialog.close() });
    link.append(el('div', { class: 'r-title' }, t(a.title, STATE.settings.lang)));
    if (a.subtitle) link.append(el('div', { class: 'r-sub' }, t(a.subtitle, STATE.settings.lang)));
    li.append(link);
    searchResults.append(li);
  }
}
function scoreMatch(a, q) {
  if (!q) return 1;
  const title = (typeof a.title === 'string' ? a.title : Object.values(a.title || {}).join(' ')).toLowerCase();
  const sub   = (typeof a.subtitle === 'string' ? a.subtitle : Object.values(a.subtitle || {}).join(' ')).toLowerCase();
  const tags  = (a.tags || []).join(' ').toLowerCase();
  
  let extractedTokens = '';
  if (a.extracted_knowledge) {
     extractedTokens = Object.values(a.extracted_knowledge)
        .map(v => typeof v === 'object' ? JSON.stringify(v) : String(v))
        .join(' ')
        .toLowerCase();
  }

  let s = 0;
  if (title.includes(q)) s += 10;
  if (title.startsWith(q)) s += 5;
  if (sub.includes(q)) s += 4;
  if (tags.includes(q)) s += 3;
  if (extractedTokens.includes(q)) s += 5;

  // Token overlap
  for (const token of q.split(/\s+/).filter(Boolean)) {
    if (title.includes(token)) s += 1;
    if (sub.includes(token))   s += 0.5;
    if (extractedTokens.includes(token)) s += 0.8;
  }
  return s;
}

// ───────────────────────────────────────────────────────────────
// Settings dialog
// ───────────────────────────────────────────────────────────────
const settingsDialog = document.getElementById('settings-dialog');
document.getElementById('settings-btn').addEventListener('click', () => {
  syncSettingsUI();
  if (typeof settingsDialog.showModal === 'function') settingsDialog.showModal();
  else settingsDialog.setAttribute('open', '');
});
document.getElementById('settings-close').addEventListener('click', () => settingsDialog.close());
settingsDialog.addEventListener('click', (e) => { if (e.target === settingsDialog) settingsDialog.close(); });

function syncSettingsUI() {
  for (const btn of settingsDialog.querySelectorAll('[data-lang]')) {
    btn.classList.toggle('active', btn.dataset.lang === STATE.settings.lang);
  }
  for (const btn of settingsDialog.querySelectorAll('[data-size]')) {
    btn.classList.toggle('active', btn.dataset.size === STATE.settings.size);
  }
  for (const btn of settingsDialog.querySelectorAll('[data-theme]')) {
    btn.classList.toggle('active', btn.dataset.theme === STATE.settings.theme);
  }
  for (const btn of settingsDialog.querySelectorAll('[data-width]')) {
    btn.classList.toggle('active', btn.dataset.width === STATE.settings.width);
  }
}
settingsDialog.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.lang)  { STATE.settings.lang = t.dataset.lang;   saveLang(t.dataset.lang); saveSettings(); syncSettingsUI(); applySettings(); translateStaticDOM(); if (STATE.view === 'home') renderHome(); else if (STATE.view === 'tags') renderTags(); else if (STATE.view === 'reader' && STATE.currentId) renderReader(STATE.currentId); }
  if (t.dataset.size)  { STATE.settings.size = t.dataset.size;   saveSettings(); syncSettingsUI(); }
  if (t.dataset.theme) { STATE.settings.theme = t.dataset.theme; saveSettings(); syncSettingsUI(); }
  if (t.dataset.width) { STATE.settings.width = t.dataset.width; saveSettings(); syncSettingsUI(); }
});

// Offline cache action
const cacheBtn = document.getElementById('cache-btn');
cacheBtn.addEventListener('click', async () => {
  cacheBtn.disabled = true;
  cacheBtn.textContent = t('settings.saving', STATE.settings.lang);
  try {
    const m = await fetchManifest();
    // Prefetch every article JSON so the SW picks them up
    const fetches = [];
    for (const a of m.articles) {
      fetches.push(fetch(`/data/${a.id}.json`, { cache: 'reload' }));
      for (const lng of (a.languages || []).slice(1)) {
        fetches.push(fetch(`/data/${a.id}.${lng}.json`, { cache: 'reload' }));
      }
    }
    await Promise.all(fetches);
    cacheBtn.textContent = t('settings.saved', STATE.settings.lang);
    cacheBtn.classList.add('done');
  } catch (e) {
    cacheBtn.textContent = t('settings.saveFailed', STATE.settings.lang);
  } finally {
    cacheBtn.disabled = false;
  }
});

// ───────────────────────────────────────────────────────────────
// Wiring
// ───────────────────────────────────────────────────────────────
BACK_BTN.addEventListener('click', () => {
  if (history.length > 1) history.back();
  else location.hash = '#/';
});
window.addEventListener('hashchange', route);
window.addEventListener('scroll', onScroll, { passive: true });

// Keyboard: / opens search
window.addEventListener('keydown', (e) => {
  if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    e.preventDefault();
    openSearch();
  }
});

applySettings();
translateStaticDOM();
route();

// Register service worker (offline + fast repeat loads). When a new version
// installs, ask it to take over and reload exactly once so users immediately
// pick up code/asset changes (otherwise stale caches can hide deploys).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(`/sw.js?v=__VERSION__`);
      const promote = (sw) => {
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            sw.postMessage('skipWaiting');
          }
        });
      };
      promote(reg.installing);
      reg.addEventListener('updatefound', () => promote(reg.installing));
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        location.reload();
      });
    } catch {}
  });
}
