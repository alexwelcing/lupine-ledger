import { lexicalSearch } from './baseline.mjs';
const form = document.querySelector('#search'), input = document.querySelector('#query');
const status = document.querySelector('#status'), receipt = document.querySelector('#receipt');
const semantic = document.querySelector('#semantic'), baseline = document.querySelector('#baseline');
const run = document.querySelector('#run');
let articles = [], generation = 0;
run.disabled = true;
try {
  const response = await fetch('/api/data'), data = await response.json();
  articles = data.articles;
  status.textContent = `${articles.length} articles · ${data.configured ? 'live model configured' : 'no key: keyword results still work'}`;
  run.disabled = false;
} catch { status.textContent = 'Catalog unavailable. Build it, then restart the demo.'; }

function card(article, note) {
  const element = document.createElement('article'); element.className = 'card';
  const link = document.createElement('a');
  link.href = `https://library.lupine.science/#/read/${encodeURIComponent(article.id)}`;
  link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.textContent = typeof article.title === 'string' ? article.title : article.title.en;
  const description = document.createElement('p'); description.textContent = typeof article.subtitle === 'string' ? article.subtitle : article.subtitle?.en || '';
  const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `${article.status || 'status unspecified'} · ${note}`;
  element.append(link, description, meta); return element;
}
document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.query; input.dispatchEvent(new Event('input')); input.focus(); }));
// Editing the input invalidates an outstanding semantic result.
input.addEventListener('input', () => { generation++; run.disabled = false; });
form.addEventListener('submit', async event => {
  event.preventDefault(); const current = ++generation, query = input.value.trim();
  if (!query) return;
  const started = performance.now(), local = lexicalSearch(articles, query).slice(0,5);
  baseline.replaceChildren(...local.map(row => card(row.article, `keyword score ${row.score.toFixed(1)}`)));
  if (!local.length) baseline.textContent = 'No keyword matches.';
  document.querySelector('#local-time').textContent = `${(performance.now() - started).toFixed(1)} ms · local`;
  semantic.textContent = 'Checking meaning… Keyword results are ready.';
  status.textContent = 'Finding the closest article…'; run.disabled = true;
  try {
    const response = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: query }) });
    const result = await response.json();
    if (current !== generation) return;
    if (!response.ok) throw new Error(result.error || 'Request failed');
    const elapsed = Math.round(performance.now() - started);
    receipt.textContent = JSON.stringify({ source: result.source, elapsedMs: elapsed, serverMs: result.elapsedMs, accepted: result.accepted, reason: result.reason, confidence: result.confidence, resultIds: result.results?.map(row => row.article.id) }, null, 2);
    document.querySelector('#model-time').textContent = `${elapsed} ms end to end · ${result.source}`;
    if (result.accepted) {
      semantic.replaceChildren(...result.results.map(row => card(row.article, `best-match probability ${(row.probability * 100).toFixed(0)}%`)));
      status.textContent = `Suggested ${result.results.length} article${result.results.length === 1 ? '' : 's'} from ${articles.length}.`;
    } else {
      semantic.textContent = result.reason === 'no-match' ? 'No suitable article in this catalog.' : `No confident suggestion (${result.reason}). Keyword results remain available.`;
      status.textContent = 'Search complete. Source statuses are unchanged.';
    }
  } catch (error) { if (current === generation) { semantic.textContent = 'Semantic search unavailable. Keyword results remain available.'; status.textContent = error.message; } }
  finally { if (current === generation) run.disabled = false; }
});
