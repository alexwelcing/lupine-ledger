export const VIEW_KEY = 'lupine.reader-workspace.v1';
export const blankView = () => ({ pieces: {}, readers: [], mode: 'grid' });
export function sanitizeView(value, articleIds = []) {
  const next = blankView(), allowed = new Set(articleIds);
  if (!value || typeof value !== 'object') return next;
  if (value.mode === 'connections') next.mode = value.mode;
  for (const [id, item] of Object.entries(value.pieces || {}).slice(0, 400)) {
    if (!/^(title|field|legend|journal|footer|media|reader:.+|card:.+)$/.test(id) || !item || typeof item !== 'object') continue;
    if ((id.startsWith('reader:') || id.startsWith('card:')) && !allowed.has(id.slice(id.indexOf(':')+1))) continue;
    next.pieces[id] = { hidden: item.hidden === true, x: Math.max(-2000, Math.min(2000, Number.isFinite(item.x) ? item.x : 0)), y: Math.max(-2000, Math.min(2000, Number.isFinite(item.y) ? item.y : 0)) };
  }
  next.readers = [...new Set(Array.isArray(value.readers) ? value.readers.filter(id => allowed.has(id)) : [])].slice(-12);
  return next;
}
export function readView(storage, articleIds) {
  try { return sanitizeView(JSON.parse(storage.getItem(VIEW_KEY)), articleIds); } catch { return blankView(); }
}
