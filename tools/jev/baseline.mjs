// Kept equivalent to src/app.js scoreMatch; parity is checked against that source.
export function lexicalScore(a, q) {
  if (!q) return 1;
  const title = (typeof a.title === 'string' ? a.title : Object.values(a.title || {}).join(' ')).toLowerCase();
  const sub = (typeof a.subtitle === 'string' ? a.subtitle : Object.values(a.subtitle || {}).join(' ')).toLowerCase();
  const tags = (a.tags || []).join(' ').toLowerCase();
  let extractedTokens = '';
  if (a.extracted_knowledge) {
    extractedTokens = Object.values(a.extracted_knowledge)
      .map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(' ').toLowerCase();
  }
  let s = 0;
  if (title.includes(q)) s += 10;
  if (title.startsWith(q)) s += 5;
  if (sub.includes(q)) s += 4;
  if (tags.includes(q)) s += 3;
  if (extractedTokens.includes(q)) s += 5;
  for (const token of q.split(/\s+/).filter(Boolean)) {
    if (title.includes(token)) s += 1;
    if (sub.includes(token)) s += 0.5;
    if (extractedTokens.includes(token)) s += 0.8;
  }
  return s;
}

export function lexicalSearch(articles, query) {
  const q = query.trim().toLowerCase();
  return articles.map(article => ({ article, score: lexicalScore(article, q) }))
    .filter(row => row.score > 0).sort((a, b) => b.score - a.score);
}

