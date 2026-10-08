export { renderUniverse } from './researchWorkspace.js';

let corpusPromise;
export function preloadCorpus(onArticle = () => {}) {
  if (!corpusPromise) corpusPromise = fetch('/data/corpus.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error('The text collection could not be loaded.'); return r.json(); })
    .then(data => {
      const vault = document.createElement('section');
      vault.id = 'corpus-vault'; vault.hidden = true;
      vault.setAttribute('aria-label', 'Complete research text collection');
      const fragment = document.createDocumentFragment();
      for (const a of data.articles) {
        const article = document.createElement('article');
        article.dataset.articleId = a.id; article.lang = a.lang;
        article.innerHTML = a.html;
        // Avoid duplicate reader anchors while keeping the complete text in the DOM.
        for (const e of article.querySelectorAll('[id]')) e.removeAttribute('id');
        fragment.append(article); onArticle(a);
      }
      vault.append(fragment); document.body.append(vault);
      return data;
    }).catch(error => { corpusPromise = null; throw error; });
  return corpusPromise;
}
