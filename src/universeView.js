import { renderUniverse as renderWorkspace } from './researchWorkspace.js';

/** Keep the live research journey visible alongside the movable article workspace. */
export async function renderUniverse(root, options) {
  const cleanup = await renderWorkspace(root, options);
  const feature = document.createElement('section');
  feature.className = 'connections-home-feature';
  feature.setAttribute('aria-labelledby', 'connections-home-title');
  feature.innerHTML = `
    <div class="connections-feature-copy">
      <p class="connections-kicker">FOLLOW THE RESEARCH</p>
      <h2 id="connections-home-title">One question opens another.</h2>
      <p>Trace a question through evidence, methods and review. See which open questions led to a new investigation, and where research shares a source.</p>
      <div class="connections-feature-actions">
        <a href="#/connections" class="connections-primary-link">Explore research connections <span aria-hidden="true">↗</span></a>
        <a href="#/graph">Explore the article map</a>
      </div>
    </div>
    <ol class="connections-feature-trail" aria-label="How to explore the research">
      <li><span class="connections-trail-number">01</span><strong>Question</strong><span>What are we trying to learn?</span></li>
      <li><span class="connections-trail-number">02</span><strong>Evidence &amp; review</strong><span>What supports it, and what is missing?</span></li>
      <li><span class="connections-trail-number">03</span><strong>Follow-up</strong><span>Where does the question lead?</span></li>
    </ol>`;
  root.prepend(feature);
  return () => { feature.remove(); cleanup?.(); };
}

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
