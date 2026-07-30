export function buildTagIndex(articles) {
  const counts = new Map();
  for (const article of articles) {
    for (const tag of article.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

const SORTS = new Set(['title', 'words', 'readMinutes']);

export function parseLibraryHash(hash) {
  const query = String(hash || '').split('?')[1] || '';
  const params = new URLSearchParams(query);
  const sort = params.get('sort') || 'title';
  return {
    status: params.get('status') || '',
    category: params.get('category') || '',
    group: params.get('group') || '',
    tag: params.get('tag') || '',
    sort: SORTS.has(sort) ? sort : 'title',
  };
}

export function serializeLibraryHash(state) {
  const params = new URLSearchParams();
  for (const key of ['status', 'category', 'group', 'tag']) {
    if (state[key]) params.set(key, state[key]);
  }
  if (state.sort && state.sort !== 'title' && SORTS.has(state.sort)) {
    params.set('sort', state.sort);
  }
  const query = params.toString();
  return `#/tags${query ? `?${query}` : ''}`;
}

function articleTitle(article, lang) {
  if (typeof article.title === 'string') return article.title;
  return article.title?.[lang] || article.title?.en || '';
}

export function filterAndSortArticles(articles, state = {}, lang = 'en') {
  const filtered = articles.filter((article) =>
    (!state.status || article.status === state.status)
    && (!state.category || article.category === state.category)
    && (!state.group || article.group === state.group)
    && (!state.tag || article.tags?.includes(state.tag))
  );
  const sort = SORTS.has(state.sort) ? state.sort : 'title';
  return filtered.sort((a, b) => {
    if (sort === 'words' || sort === 'readMinutes') {
      const difference = (b[sort] || 0) - (a[sort] || 0);
      if (difference) return difference;
    }
    return articleTitle(a, lang).localeCompare(articleTitle(b, lang), lang);
  });
}
