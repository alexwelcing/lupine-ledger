import { createActivityController, validateActivity, validateFeed, readPublicJSON } from './researchActivity.js';
import { researchActivityEndpoint } from './researchActivityConfig.js';
export const ARCHIVE_SCHEMA = 'lupine.public_research_activity.archive.v1';
export function validateArchive(value, after, snapshot) {
  if (!value || value.schema !== ARCHIVE_SCHEMA || !Array.isArray(value.records) || value.records.length > 50 ||
      !value.cursor || !value.coverage || !Array.isArray(value.hashes)) throw Error('Invalid public archive');
  if (Object.keys(value).some(k=>!['schema','records','cursor','coverage','hashes'].includes(k)) ||
      Object.keys(value.cursor).some(k=>!['after','snapshot','nextAfter'].includes(k)) ||
      Object.keys(value.coverage).some(k=>!['complete','returned'].includes(k))) throw Error('Unknown archive fields');
  const c = value.cursor;
  if (c.after !== after || !Number.isSafeInteger(c.snapshot) || c.snapshot < after ||
      (snapshot != null && snapshot !== c.snapshot) ||
      !(c.nextAfter === null || Number.isSafeInteger(c.nextAfter) && c.nextAfter > after && c.nextAfter <= c.snapshot) ||
      typeof value.coverage.complete !== 'boolean' || value.coverage.returned !== value.records.length ||
      value.coverage.complete !== (c.nextAfter === null) || (!value.records.length && c.nextAfter !== null)) throw Error('Invalid public archive cursor');
  const ids = new Set();
  for (const r of value.records) { validateActivity(r); if (ids.has(r.id)) throw Error('Duplicate public record'); ids.add(r.id); }
  if (value.hashes.length !== ids.size || new Set(value.hashes.map(h=>h.id)).size !== ids.size ||
      value.hashes.some(h=>Object.keys(h).some(k=>!['id','sha256'].includes(k)) || !ids.has(h.id) || !/^[a-f0-9]{64}$/.test(h.sha256))) throw Error('Invalid archive hashes');
  return value;
}
export function createPublicActivityStore({ endpoint, fetcher = fetch, storage } = {}) {
  const listeners = new Set(), records = new Map();
  let state = { feed: null, source: null, error: false, records: [], archiveComplete: false, archiveLoading: false, archiveError: false };
  let cursor = null, completedSnapshot = 0, busy = false;
  const emit = () => { state = { ...state, records: [...records.values()].sort((a,b)=>b.observedAt.localeCompare(a.observedAt)||b.id.localeCompare(a.id)) }; listeners.forEach(fn=>fn(state)); };
  const controller = createActivityController({ endpoint, fetcher, storage, onChange(next) {
    for (const r of next.feed?.items || []) records.set(r.id,r);
    state = { ...state, ...next }; emit();
  }});
  async function loadMore({ refresh = false } = {}) {
    if (busy || state.archiveComplete && !refresh) return;
    busy = true; state.archiveLoading = true; state.archiveError = false; emit();
    const after = refresh ? completedSnapshot : cursor?.nextAfter || 0;
    const snapshot = refresh ? null : cursor?.snapshot ?? null;
    try {
      const url = new URL('/research/activity/archive', endpoint);
      url.searchParams.set('after',after); url.searchParams.set('limit','50');
      if (snapshot != null) url.searchParams.set('snapshot',snapshot);
      const response = await fetcher(url.href,{ cache:'no-store', credentials:'omit', redirect:'error', signal:AbortSignal.timeout(8000) });
      if (!response.ok) throw Error('Archive unavailable');
      const page = validateArchive(await readPublicJSON(response),after,snapshot);
      for (const r of page.records) {
        const bytes = new TextEncoder().encode(JSON.stringify(r));
        const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
        if (page.hashes.find(h=>h.id===r.id)?.sha256 !== digest) throw Error('Public archive hash mismatch');
      }
      for (const r of page.records) records.set(r.id,r);
      cursor = page.cursor; state.archiveComplete = page.coverage.complete;
      if (state.archiveComplete) completedSnapshot = cursor.snapshot;
    } catch { state.archiveError = true; }
    finally { busy=false; state.archiveLoading=false; emit(); }
  }
  async function loadRecord(id) {
    if (!/^[a-z0-9][a-z0-9._-]{0,95}$/.test(id) || records.has(id)) return;
    try {
      const url = new URL(`/research/activity/${encodeURIComponent(id)}`,endpoint);
      const response = await fetcher(url.href,{cache:'no-store',credentials:'omit',redirect:'error',signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw Error('Record unavailable');
      const feed = validateFeed(await readPublicJSON(response));
      if(feed.items.length !== 1 || feed.items[0].id !== id) throw Error('Record identity mismatch');
      records.set(id,feed.items[0]); emit();
    } catch { state.archiveError=true; emit(); }
  }
  return { loadRecord, subscribe(fn) { listeners.add(fn); fn(state); return ()=>listeners.delete(fn); },
    refresh:()=>controller.refresh(), loadMore, get state(){return state;} };
}
let shared;
export function publicActivityStore() {
  if (!shared) { let storage; try { storage=localStorage; } catch {} shared=createPublicActivityStore({ endpoint:researchActivityEndpoint,storage }); }
  return shared;
}
