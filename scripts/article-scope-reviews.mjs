import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ARTICLE_SCOPE_REVIEWS_PATH = fileURLToPath(new URL('../content/reviews/article-scopes.json', import.meta.url));
const fail = message => { throw new Error('Article scope review: ' + message); };
const text = (value, max = 4000) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;

// A reviewed projection, never a rewrite of the source manifest or article bytes.
export function projectArticleScopes(catalog, scopeReviews, readSource) {
  if (scopeReviews?.schema !== 'lupine.article_scope_reviews.v1' ||
      !Array.isArray(scopeReviews.reviews) || scopeReviews.reviews.length > 16 ||
      !Array.isArray(catalog?.entries)) fail('invalid review collection');
  const result = structuredClone(catalog);
  const ids = new Set(), targets = new Set();
  for (const review of scopeReviews.reviews) {
    if (!review || !text(review.id, 120) || !text(review.articleId, 120) ||
        ids.has(review.id) || targets.has(review.articleId)) fail('invalid or duplicate target');
    ids.add(review.id); targets.add(review.articleId);
    if (!/^[a-f0-9]{64}$/.test(review.sourceSha256 || '') ||
        !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedOn || '') ||
        !Number.isFinite(Date.parse(review.reviewedOn)) ||
        new Date(review.reviewedOn).toISOString().slice(0, 10) !== review.reviewedOn)
      fail('invalid source hash or review date');
    for (const key of ['source', 'originalSubtitle', 'subtitle', 'statement', 'reason', 'bound'])
      if (!text(review[key])) fail('missing or oversized ' + key);
    if (!Array.isArray(review.missingPremises) || !review.missingPremises.length ||
        review.missingPremises.length > 12 || review.missingPremises.some(p => !text(p)))
      fail('invalid premises');
    if (!Array.isArray(review.evidence) || !review.evidence.length || review.evidence.length > 8)
      fail('invalid evidence');
    for (const link of review.evidence) {
      if (!link || !text(link.url, 2000)) fail('invalid evidence URL');
      let url;
      try { url = new URL(link.url); } catch { fail('invalid evidence URL'); }
      if (!text(link.label, 240) || url.protocol !== 'https:' || url.username || url.password)
        fail('invalid evidence URL or label');
    }
    const matches = result.entries.filter(entry => entry.id === review.articleId);
    if (matches.length !== 1) fail('missing or ambiguous article');
    const entry = matches[0];
    if (entry.source !== review.source || entry.subtitle !== review.originalSubtitle || entry.scopeReview)
      fail('source or original catalog text changed');
    if (Object.keys(entry.i18n || {}).length) fail('translated sources require their own review');
    const bytes = readSource(review.source);
    if (createHash('sha256').update(bytes).digest('hex') !== review.sourceSha256)
      fail('article bytes changed');
    entry.subtitle = review.subtitle;
    entry.scopeReview = structuredClone(review);
  }
  return result;
}

export function loadArticleCatalog(manifest, bundleRoot, reviewsPath = ARTICLE_SCOPE_REVIEWS_PATH) {
  const reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
  return projectArticleScopes(manifest.catalog, reviews, source => {
    const file = path.resolve(bundleRoot, source);
    const relative = path.relative(path.resolve(bundleRoot), file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) fail('source escapes bundle');
    return fs.readFileSync(file);
  });
}

const escape = value => String(value).replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// Rendered before the historical body by the existing article build/reader path.
export function renderArticleScopeReview(review) {
  if (!review) return '';
  return '<section aria-label="Editorial scope review">' +
    '<h2 id="editorial-scope-review">Scope review — ' + escape(review.reviewedOn) + '</h2>' +
    '<p><strong>' + escape(review.statement) + '</strong></p>' +
    '<p>' + escape(review.reason) + '</p>' +
    '<h3>Premises needed for reuse</h3><ul>' +
    review.missingPremises.map(p => '<li>' + escape(p) + '</li>').join('') + '</ul>' +
    '<p>' + escape(review.bound) + '</p>' +
    '<p>Review basis: ' + review.evidence.map(link => '<a href="' + escape(link.url) +
      '" target="_blank" rel="noopener noreferrer">' + escape(link.label) + '</a>').join(' · ') + '</p>' +
    '<details><summary>Original catalog description</summary><p>' + escape(review.originalSubtitle) +
    '</p></details><p>The historical article follows unchanged. Its recording and export dates are separate from this review.</p></section>\n';
}
