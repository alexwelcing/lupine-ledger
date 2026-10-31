import { createDocumentIndex, createDocumentSession, createDocumentMeasurements, filterDocuments,
  documentRoute, DOCUMENT_TITLE_FONT, DOCUMENT_SUMMARY_FONT } from './documentLibraryModel.js';

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const plainClick = event => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
const prettyDate = value => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
const decode = value => { try { return decodeURIComponent(value); } catch { return value; } };

export function renderDocumentLibrary(mount, { manifest, corpus, initialId = 'research-index', passage = '',
  language = 'en', onNavigate = () => {}, onArticleLink = () => {} } = {}) {
  const index = createDocumentIndex(manifest, corpus, language);
  const session = createDocumentSession(index);
  let destroyed = false, query = '', category = '', results = index.documents;
  let measurements = null, measuredRows = new Map(), lastWidth = 0, currentDocument = null;
  let passageFrame = 0, layoutFrame = 0;
  const listeners = [];
  const listen = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    listeners.push(() => target.removeEventListener(event, handler, options));
  };
  mount.innerHTML = `<section class="document-library" aria-label="Lupine document library" data-mobile-pane="reader">
    <aside class="document-collection" aria-labelledby="document-collection-title">
      <div class="document-collection-head"><div class="document-eyebrow">Lupine Library</div>
        <div class="document-collection-heading"><h1 id="document-collection-title">Documents</h1><span class="document-total">${index.documents.length}</span></div>
        <p>Materials science, methods &amp; the work behind them.</p>
        <label class="document-search"><span class="document-sr-only">Search all articles</span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input type="search" placeholder="Search all articles" autocomplete="off" spellcheck="false"></label>
        <label class="document-category"><span>Research area</span><select aria-label="Research area"><option value="">All areas · ${index.documents.length}</option>${index.categories.map(item => `<option value="${escapeHTML(item.id)}">${escapeHTML(item.label)} · ${item.count}</option>`).join('')}</select></label>
      </div>
      <div class="document-results-meta"><span aria-live="polite" data-document-count></span><button type="button" data-clear-filters hidden>Clear filters</button></div>
      <nav class="document-list" aria-label="Articles"></nav>
      <div class="document-collection-foot"><span>${index.documents.filter(item => item.available).length} articles ready to read</span><button type="button" class="document-return" data-return-reader>Return to article →</button></div>
    </aside>
    <section class="document-reading-pane" aria-label="Article reader">
      <div class="document-reader-toolbar"><button type="button" data-show-collection aria-controls="document-collection-title"><span aria-hidden="true">←</span> Documents</button><span class="document-current-area"></span><a class="document-canonical" href="#" target="_blank" rel="noopener">Article permalink <span aria-hidden="true">↗</span></a></div>
      <div class="document-reading-progress" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
      <div class="document-reader-scroll" tabindex="-1"><article class="reader document-reader"><div class="document-reader-inner"></div></article></div>
    </section>
    <span class="document-sr-only" role="status" data-reader-announcement></span>
  </section>`;
  const root = mount.querySelector('.document-library');
  const list = root.querySelector('.document-list');
  const search = root.querySelector('input[type="search"]');
  const select = root.querySelector('select');
  const scroller = root.querySelector('.document-reader-scroll');
  const reader = root.querySelector('.document-reader-inner');
  const progress = root.querySelector('.document-reading-progress');
  const progressFill = progress.querySelector('span');
  const announce = root.querySelector('[data-reader-announcement]');
  const media = window.matchMedia('(max-width: 760px)');

  function updateProgress() {
    if (destroyed || scroller.clientHeight === 0) return;
    session.rememberScroll(scroller.scrollTop);
    const remaining = scroller.scrollHeight - scroller.clientHeight;
    const percent = remaining > 0 ? Math.min(100, Math.round(scroller.scrollTop / remaining * 100)) : 100;
    progress.setAttribute('aria-valuenow', String(percent));
    progressFill.style.width = `${percent}%`;
  }

  function lineMarkup(lines, truncated = false) {
    return lines.map((line, position) => `<span class="document-measured-line">${escapeHTML(line)}${truncated && position === lines.length - 1 ? '<span aria-hidden="true">…</span>' : ''}</span>`).join(' ');
  }

  function rowMarkup(document) {
    const measured = measuredRows.get(document.id);
    const summary = measured ? lineMarkup(measured.summaryLines, measured.summaryTruncated) : escapeHTML(document.subtitle);
    return `<a class="document-list-item${document.id === session.currentId ? ' is-current' : ''}" href="${documentRoute(document.id)}" data-document-id="${escapeHTML(document.id)}"${document.id === session.currentId ? ' aria-current="page"' : ''}>
      <span class="document-list-category">${escapeHTML(document.categoryLabel)}</span>
      <span class="document-list-title">${measured ? lineMarkup(measured.titleLines) : escapeHTML(document.title)}</span>
      ${document.subtitle ? `<span class="document-list-summary${measured ? ' is-measured' : ''}">${summary}</span>` : ''}
      <span class="document-list-meta">${document.available ? `${Number(document.readMinutes) || 1} min read` : 'Text unavailable'}${document.date ? ` <span aria-hidden="true">·</span> ${escapeHTML(prettyDate(document.date.value))}` : ''}</span></a>`;
  }

  function renderList() {
    const scrollTop = list.scrollTop;
    const focusedId = document.activeElement?.closest?.('[data-document-id]')?.dataset.documentId;
    results = filterDocuments(index, query, category);
    root.querySelector('[data-document-count]').textContent = `${results.length} ${results.length === 1 ? 'document' : 'documents'}${query || category ? ` of ${index.documents.length}` : ''}`;
    root.querySelector('[data-clear-filters]').hidden = !query && !category;
    list.innerHTML = results.length ? results.map(rowMarkup).join('') : '<div class="document-empty"><h2>No matching documents</h2><p>Try another term or research area. Search includes the complete article text.</p></div>';
    list.scrollTop = scrollTop;
    if (focusedId) Array.from(list.querySelectorAll('[data-document-id]')).find(node => node.dataset.documentId === focusedId)?.focus({ preventScroll: true });
    updateNeighbors();
  }

  function updateNeighbors() {
    const navigation = reader.querySelector('.document-neighbors');
    if (!navigation || !currentDocument) return;
    const sequence = results.some(item => item.id === currentDocument.id) ? results : index.documents;
    const at = sequence.findIndex(item => item.id === currentDocument.id);
    const previous = sequence[at - 1], next = sequence[at + 1];
    navigation.innerHTML = [previous ? `<a href="${documentRoute(previous.id)}" data-document-id="${escapeHTML(previous.id)}"><span>← Previous document</span><strong>${escapeHTML(previous.title)}</strong></a>` : '<span></span>',
      next ? `<a href="${documentRoute(next.id)}" data-document-id="${escapeHTML(next.id)}"><span>Next document →</span><strong>${escapeHTML(next.title)}</strong></a>` : '<span></span>'].join('');
  }

  function focusCollection() {
    if (scroller.clientHeight > 0) session.rememberScroll(scroller.scrollTop);
    root.dataset.mobilePane = 'collection';
    search.focus({ preventScroll: true });
  }

  function showReader() {
    root.dataset.mobilePane = 'reader';
  }

  function scrollPassage(anchor) {
    const target = Array.from(reader.querySelectorAll('.document-reader-body [id]')).find(node => node.id === anchor);
    if (!target) return false;
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
    return true;
  }

  function openArticle(id, nextPassage = '') {
    if (destroyed) return false;
    // Save the old position before changing the identity in the session.
    if (scroller.clientHeight > 0) session.rememberScroll(scroller.scrollTop);
    const selected = session.open(id, nextPassage);
    if (!selected) return false;
    if (selected.unchanged) return true;
    cancelAnimationFrame(passageFrame);
    showReader();
    if (!selected.sameDocument) {
      currentDocument = selected.document;
      const doc = currentDocument;
      const date = doc.date ? `<span>${escapeHTML(doc.date.kind)} <time datetime="${escapeHTML(doc.date.value)}">${escapeHTML(prettyDate(doc.date.value))}</time></span>` : '';
      const toc = (doc.toc || []).filter(item => item.id && item.depth <= 3);
      const exported = manifest?.sourceSnapshot?.exportedAt;
      const archiveDate = exported && Number.isFinite(Date.parse(exported)) ? prettyDate(exported) : null;
      reader.innerHTML = `<header class="document-article-head"><div class="document-eyebrow">${escapeHTML(doc.categoryLabel)}</div><h1 tabindex="-1">${escapeHTML(doc.title)}</h1>${doc.subtitle ? `<p class="document-deck">${escapeHTML(doc.subtitle)}</p>` : ''}
        <div class="document-article-meta"><span>${Number(doc.readMinutes) || 1} min read</span>${doc.words ? `<span>${Number(doc.words).toLocaleString('en')} words</span>` : ''}${date}${doc.statusLabel ? `<span class="document-status" title="${escapeHTML(doc.statusGloss)}">${escapeHTML(doc.statusLabel)}</span>` : ''}</div>
        ${doc.lang !== language ? `<p class="document-language-note">${nextPassage && doc.variants.has(language) ? 'Passage links open the English source so their section references stay exact.' : `Shown in ${doc.lang === 'en' ? 'English' : escapeHTML(doc.lang)}; this document has no ${escapeHTML(language)} translation.`}</p>` : ''}
        ${doc.editorial?.applied && doc.originalTitle && doc.originalTitle !== doc.title ? `<details class="document-source-title"><summary>Original source title</summary><p>${escapeHTML(doc.originalTitle)}</p></details>` : ''}
      </header>
      ${toc.length ? `<details class="document-toc"><summary>In this document <span>${toc.length} sections</span></summary><nav aria-label="Article sections">${toc.map(item => `<a class="document-toc-depth-${item.depth}" href="${documentRoute(doc.id, item.id)}" data-passage="${escapeHTML(item.id)}">${escapeHTML(item.text)}</a>`).join('')}</nav></details>` : ''}
      <div class="content document-reader-body" lang="${escapeHTML(doc.lang)}">${doc.available ? doc.html : '<p>The article text is not included in this edition of the Library. Its catalog record has been retained.</p>'}</div>
      <footer class="document-article-foot">${archiveDate ? `<p>Source archive: ${escapeHTML(archiveDate)}. This is the archive date, not the publication date.</p>` : ''}${doc.source ? `<details><summary>Source record</summary><code>${escapeHTML(doc.source)}</code></details>` : ''}<nav class="document-neighbors" aria-label="Read another document"></nav></footer>`;
      // Retain the actual heading and its anchor, but avoid a second identical title.
      const firstHeading = reader.querySelector('.document-reader-body > h1');
      if (firstHeading && firstHeading.textContent.trim() === doc.title.trim()) firstHeading.classList.add('document-source-heading');
      root.querySelector('.document-current-area').textContent = doc.categoryLabel;
      root.querySelector('.document-canonical').href = `/articles/${encodeURIComponent(doc.id)}/`;
      root.querySelector('.document-canonical').hidden = false;
      announce.textContent = doc.title;
      for (const row of list.querySelectorAll('[data-document-id]')) {
        const current = row.dataset.documentId === doc.id;
        row.classList.toggle('is-current', current);
        if (current) row.setAttribute('aria-current', 'page'); else row.removeAttribute('aria-current');
      }
      updateNeighbors();
      scroller.scrollTop = selected.scrollTop;
    }
    if (nextPassage) {
      // Content is already present; the next frame only waits for its geometry.
      scrollPassage(nextPassage);
      passageFrame = requestAnimationFrame(() => { if (!destroyed && session.currentId === id && session.currentPassage === nextPassage) { scrollPassage(nextPassage); updateProgress(); } });
    } else if (selected.sameDocument) scroller.scrollTop = selected.scrollTop;
    updateProgress();
    return true;
  }

  function selectArticle(id, nextPassage = '', focus = false) {
    if (!openArticle(id, nextPassage)) return;
    showReader();
    // A deliberate second click on a section is a jump; a router echo is not.
    if (nextPassage) { scrollPassage(nextPassage); updateProgress(); }
    onNavigate(id, nextPassage);
    if (focus) reader.querySelector('.document-article-head h1')?.focus({ preventScroll: true });
  }

  listen(root, 'click', event => {
    const collectionButton = event.target.closest('[data-show-collection]');
    if (collectionButton) { focusCollection(); return; }
    if (event.target.closest('[data-return-reader]')) { showReader(); scroller.focus({ preventScroll: true }); return; }
    if (event.target.closest('[data-clear-filters]')) { search.value = ''; select.value = ''; query = ''; category = ''; renderList(); search.focus(); return; }
    const anchor = event.target.closest('a');
    if (!anchor || !root.contains(anchor) || !plainClick(event) || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const href = anchor.getAttribute('href') || '';
    const intercept = (id, target = '') => {
      if (!index.byId.has(id)) return false;
      event.preventDefault(); event.stopPropagation();
      selectArticle(id, target, anchor.closest('.document-list') !== null);
      return true;
    };
    if (anchor.dataset.passage && currentDocument) { intercept(currentDocument.id, anchor.dataset.passage); return; }
    if (anchor.dataset.documentId) { intercept(anchor.dataset.documentId); return; }
    if (href.startsWith('#/read/')) {
      const route = href.slice('#/read/'.length).split('?');
      intercept(decode(route[0]), new URLSearchParams(route[1] || '').get('passage') || ''); return;
    }
    if (href.startsWith('#') && !href.startsWith('#/') && currentDocument) { intercept(currentDocument.id, decode(href.slice(1))); return; }
    let url;
    try { url = new URL(href, location.href); } catch { return; }
    if (url.origin === location.origin && /^\/articles\/[^/]+\/?$/.test(url.pathname)) {
      if (intercept(decode(url.pathname.split('/')[2]), decode(url.hash.slice(1)))) return;
    }
    if (anchor.closest('.document-reader-body') && currentDocument) onArticleLink(event, currentDocument);
  });
  listen(search, 'input', () => { query = search.value; renderList(); list.scrollTop = 0; });
  listen(select, 'change', () => { category = select.value; renderList(); list.scrollTop = 0; });
  listen(scroller, 'scroll', updateProgress, { passive: true });
  listen(root, 'keydown', event => {
    if (event.key === 'Escape' && media.matches && root.dataset.mobilePane === 'collection') { showReader(); root.querySelector('[data-show-collection]').focus(); }
  });
  listen(scroller, 'load', () => updateProgress(), true);

  function relayout(width) {
    const available = Math.floor(width - 40); // exact horizontal padding of a list item
    if (!measurements || available < 80 || available === lastWidth) return;
    lastWidth = available;
    measuredRows = measurements.layout(available);
    renderList();
  }
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => {
    for (const entry of entries) {
      if (entry.target === list) relayout(entry.contentRect.width);
      if (entry.target === scroller) updateProgress();
    }
  }) : null;
  resizeObserver?.observe(list); resizeObserver?.observe(scroller);
  listen(window, 'resize', () => {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => { relayout(list.clientWidth); updateProgress(); });
  });

  renderList();
  if (index.byId.has(initialId)) openArticle(initialId, passage);
  else {
    reader.innerHTML = '<div class="document-empty"><h1>Document not found</h1><p>This address does not match a document in this Library edition. Choose a document from the collection.</p><button type="button" data-show-collection>Browse documents</button></div>';
    root.querySelector('.document-canonical').hidden = true;
  }
  // Native text is visible immediately. Pretext refines all previews after the exact fonts load.
  Promise.all([
    import('./vendor/pretext/layout.js'),
    document.fonts ? Promise.all([document.fonts.load(DOCUMENT_TITLE_FONT), document.fonts.load(DOCUMENT_SUMMARY_FONT), document.fonts.ready]) : Promise.resolve(),
  ]).then(([pretext]) => {
    if (destroyed) return;
    measurements = createDocumentMeasurements(index.documents, pretext);
    root.dataset.textLayout = 'pretext';
    relayout(list.clientWidth);
  }).catch(() => { if (!destroyed) root.dataset.textLayout = 'native'; });

  return {
    openArticle, focusCollection,
    get currentId() { return session.currentId; },
    destroy() {
      if (destroyed) return;
      destroyed = true; cancelAnimationFrame(passageFrame); cancelAnimationFrame(layoutFrame);
      resizeObserver?.disconnect(); listeners.forEach(remove => remove());
      root.remove();
    },
  };
}
