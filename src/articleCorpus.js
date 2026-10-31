// The reading desk and search share one complete, versioned text collection.
// Keep source HTML in memory; only the selected article becomes a DOM tree.
export function createCorpusLoader(fetcher = (...args) => fetch(...args)) {
  const requests = new Map();
  return async function load({ version = '', expectedIds = [] } = {}) {
    if (!requests.has(version)) {
      const request = Promise.resolve().then(async () => {
        const suffix = version ? `?v=${encodeURIComponent(version)}` : '';
        const response = await fetcher(`/data/corpus.json${suffix}`, { cache: 'no-cache' });
        if (!response.ok || !/\bapplication\/(?:[\w.+-]+\+)?json\b/i.test(response.headers.get('content-type') || '')) {
          throw new Error('The complete text collection could not be loaded.');
        }
        const data = await response.json();
        if (!data || typeof data.version !== 'string' || !Array.isArray(data.articles) || (version && data.version !== version)) {
          throw new Error('The text collection does not match this Library edition.');
        }
        const identities = new Set();
        for (const article of data.articles) {
          if (!article || typeof article.id !== 'string' || !article.id || typeof article.lang !== 'string' || !article.lang || typeof article.html !== 'string') {
            throw new Error('The text collection contains an incomplete document.');
          }
          const key = `${article.id}:${article.lang}`;
          if (identities.has(key)) throw new Error('The text collection contains duplicate documents.');
          identities.add(key);
        }
        return data;
      }).catch(error => { requests.delete(version); throw error; });
      requests.set(version, request);
    }
    const request = requests.get(version);
    const data = await request;
    const english = new Set(data.articles.filter(article => article.lang === 'en').map(article => article.id));
    if (expectedIds.some(id => !english.has(id))) {
      if (requests.get(version) === request) requests.delete(version);
      throw new Error('The text collection is missing a required article.');
    }
    return data;
  };
}

export const preloadCorpus = createCorpusLoader();
