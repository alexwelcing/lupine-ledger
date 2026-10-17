// Reader passage navigation must stay inside the rendered article, not the preloaded corpus.
export function readerPassage(hash) {
  const query = String(hash || '').split('?')[1] || '';
  return new URLSearchParams(query).get('passage') || '';
}

export function scrollReaderPassage(body, passage) {
  if (!passage || !body.isConnected) return false;
  const target = Array.from(body.querySelectorAll('[id]')).find(node => node.id === passage);
  if (!target) return false;
  target.scrollIntoView({ block: 'start', behavior: 'instant' });
  return true;
}

export function reviewedPassageRoute(link) {
  if (link?.provenance?.confidence !== 'extracted-reviewed' || !link.source?.startsWith('article:') || !link.passageAnchor) return null;
  const expected = `#/read/${encodeURIComponent(link.source.slice(8))}?passage=${encodeURIComponent(link.passageAnchor)}`;
  return link.articleRoute === expected ? expected : null;
}
