// Consumer of Rhizo's reviewed public activity contracts. Never sanitize private
// packets into public evidence: reject unknown fields and malformed records.
export const FEED_SCHEMA = 'lupine.public_research_activity_feed.v1';
export const RECORD_SCHEMA = 'lupine.public_research_activity.v1';
export const MAX_FEED_BYTES = 850_000;
export const STALE_AFTER_MS = 6 * 60 * 60 * 1000;
const encoder = new TextEncoder();
const PRIVATE_TEXT = /(?:[\x00-\x1f\x7f<>]|[A-Za-z][A-Za-z0-9+.-]*:\/\/|(?:^|\s|["'(])(?:\/(?:Users|home|private|tmp|var|mnt|workspace)\/|~\/|[A-Za-z]:[\\/]|\\\\)|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\b(?:awphone|aledev|hermitage)\b)/i;
const CREDENTIAL = /(?:\bBearer\s+\S+|\b(?:sk-(?:proj-)?|ghp_|gho_|github_pat_|AIza)[A-Za-z0-9_-]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})/i;
const SENSITIVE_QUERY = /(?:token|key|secret|signature|credential|authorization|password|session|email|auth|jwt)/i;
const RECORD_KEYS = 'schema id activityId evidenceKind state verification title summary observedAt reviewedAt datasets findings limitations nextStep sources hashes repositoryLinks releaseLinks supersedes correctionReason'.split(' ');
const fail = () => { throw new Error('Research activity failed its public evidence contract.'); };
function object(value, required, optional = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || required.some(k => !Object.hasOwn(value, k)) ||
      Object.keys(value).some(k => !required.includes(k) && !optional.includes(k))) fail();
}
function text(value, max) {
  if (typeof value !== 'string' || !value.length || value.length > max || value !== value.trim() || PRIVATE_TEXT.test(value) || CREDENTIAL.test(value)) fail();
}
function id(value) { text(value, 96); if (!/^[a-z0-9][a-z0-9._-]{0,95}$/.test(value)) fail(); }
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ||
      !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) fail();
}
function array(value, min, max, check) {
  if (!Array.isArray(value) || value.length < min || value.length > max) fail();
  value.forEach(check);
}
function choice(value, choices) { if (!choices.includes(value)) fail(); }
function count(value) { if (!Number.isInteger(value) || value < 0 || value > 1_000_000_000) fail(); }
export function isPublicSourceUrl(value) {
  try {
    if (typeof value !== 'string' || value.length > 1024 || value !== value.trim() || /[\s\\\x00-\x1f\x7f]/.test(value) || CREDENTIAL.test(value)) return false;
    const url = new URL(value), host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !host.includes('.') ||
        /[\[\]:]/.test(host) || /^\d+(?:\.\d+)*$/.test(host) ||
        /(?:^|\.)(?:localhost|local|internal|test|invalid|example|onion)$/.test(host) ||
        host.endsWith('.ts.net') || host.endsWith('.localdomain') || host.endsWith('.home.arpa') || host.endsWith('.')) return false;
    let decoded = value;
    for (let i = 0; i < 2; i++) decoded = decodeURIComponent(decoded);
    if (CREDENTIAL.test(decoded) || /(?:\/(?:Users|home|private|tmp|var|mnt|workspace)\/|(?:^|[\s/"'(])[A-Za-z]:[\\/]|\b(?:awphone|aledev|hermitage)\b)/i.test(decoded)) return false;
    for (const [key, content] of url.searchParams) {
      if (SENSITIVE_QUERY.test(key) || CREDENTIAL.test(content) || /(?:[a-z][a-z0-9+.-]*:\/\/|@)/i.test(content)) return false;
    }
    return !SENSITIVE_QUERY.test(url.hash) && !/@/.test(decoded);
  } catch { return false; }
}
function link(value, kind = 'source') {
  object(value, ['label', 'url']); text(value.label, 100);
  if (!isPublicSourceUrl(value.url)) fail();
  if (kind !== 'source') {
    const url = new URL(value.url), parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname !== 'github.com' || parts[0] !== 'alexwelcing' ||
        !['lupine', 'lupine-rhizo', 'lupine-ledger'].includes(parts[1]) || url.search ||
        (kind === 'release' && parts[2] !== 'releases')) fail();
  }
}
export function validateActivity(value, now = Date.now()) {
  object(value, RECORD_KEYS);
  if (value.schema !== RECORD_SCHEMA) fail();
  id(value.id); id(value.activityId);
  choice(value.evidenceKind, ['archived_analysis', 'research_cycle']);
  choice(value.state, ['planned', 'running', 'completed', 'failed', 'blocked']);
  choice(value.verification, ['pending', 'arithmetic_checked', 'source_checked']);
  text(value.title, 160); text(value.summary, 1200); text(value.nextStep, 600);
  timestamp(value.observedAt); timestamp(value.reviewedAt);
  if (value.reviewedAt < value.observedAt || Date.parse(value.reviewedAt) > now + 60_000) fail();
  array(value.datasets, 0, 8, d => {
    object(d, ['name', 'configurations'], ['groups', 'atoms']); text(d.name, 120); count(d.configurations);
    if (Object.hasOwn(d, 'groups')) count(d.groups);
    if (Object.hasOwn(d, 'atoms')) count(d.atoms);
  });
  array(value.findings, 0, 8, v => text(v, 600));
  array(value.limitations, 1, 8, v => text(v, 600));
  array(value.sources, 0, 12, v => link(v));
  array(value.repositoryLinks, 0, 3, v => link(v, 'repository'));
  array(value.releaseLinks, 0, 6, v => link(v, 'release'));
  array(value.hashes, 0, 12, v => {
    object(v, ['label', 'sha256']); text(v.label, 100);
    if (typeof v.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(v.sha256)) fail();
  });
  if (value.supersedes !== null) id(value.supersedes);
  if (value.correctionReason !== null) text(value.correctionReason, 600);
  if (value.supersedes === value.id || (!value.supersedes && value.correctionReason !== null) ||
      (value.verification !== 'pending' && !value.hashes.length && !value.sources.length) ||
      encoder.encode(JSON.stringify(value)).length > 16_384) fail();
  return value;
}
export function validateFeed(value, now = Date.now()) {
  object(value, ['schema', 'items', 'truncated']);
  if (value.schema !== FEED_SCHEMA || typeof value.truncated !== 'boolean' || encoder.encode(JSON.stringify(value)).length > MAX_FEED_BYTES) fail();
  const ids = new Set(), activities = new Set();
  array(value.items, 0, 50, item => {
    validateActivity(item, now);
    if (ids.has(item.id) || activities.has(item.activityId)) fail();
    ids.add(item.id); activities.add(item.activityId);
  });
  return value;
}
export function activityFreshness(state, now = Date.now()) {
  const newest = state.feed?.items.reduce((latest, item) => item.observedAt > latest ? item.observedAt : latest, '') || null;
  const stale = !!newest && now - Date.parse(newest) > STALE_AFTER_MS;
  let mode = state.source === 'live' ? (stale ? 'stale' : 'live') : state.source === 'snapshot' ? 'snapshot' : 'saved';
  if (state.error) mode = state.online === false ? 'offline' : 'unavailable';
  else if (!state.feed) mode = 'loading';
  return { mode, stale, newest };
}
async function readFeed(response, now) {
  if (!response.ok || Number(response.headers?.get('content-length')) > MAX_FEED_BYTES) fail();
  let raw = '';
  if (response.body?.getReader) {
    const reader = response.body.getReader(), decoder = new TextDecoder();
    let bytes = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_FEED_BYTES) { await reader.cancel(); fail(); }
        raw += decoder.decode(value, { stream: true });
      }
      raw += decoder.decode();
    } finally { reader.releaseLock(); }
  } else { raw = await response.text(); }
  if (encoder.encode(raw).length > MAX_FEED_BYTES) fail();
  return validateFeed(JSON.parse(raw), now);
}

// Network data stays separate from the static fallback. A saved successful read
// is never called live until a new, uncached request succeeds in this session.
export function createActivityController({ endpoint, snapshotUrl = '/data/research-activity.json', fetcher = fetch,
  storage, onChange, now = Date.now, online = () => true, timeoutMs = 8000 }) {
  const storageKey = `ll.research-activity.v1:${endpoint}`;
  let disposed = false, active = null;
  const state = { feed: null, source: null, checkedAt: null, refreshing: false, error: false, online: online() };
  try {
    const saved = JSON.parse(storage?.getItem(storageKey) || 'null');
    if (saved && Number.isFinite(saved.checkedAt) && saved.checkedAt <= now()) {
      state.feed = validateFeed(saved.feed, now()); state.source = 'saved'; state.checkedAt = saved.checkedAt;
    }
  } catch { /* Corrupt or obsolete cache is never rendered. */ }
  function emit() { if (!disposed) onChange({ ...state }); }
  async function request(url, signal) {
    return readFeed(await fetcher(url, { cache: 'no-store', credentials: 'omit', redirect: 'error', signal }), now());
  }
  async function refresh() {
    if (disposed || active) return;
    const controller = new AbortController(); active = controller;
    state.refreshing = true; state.online = online(); emit();
    let timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const feed = await request(endpoint, controller.signal);
      if (disposed) return;
      state.feed = feed; state.source = 'live'; state.checkedAt = now(); state.error = false;
      try { storage?.setItem(storageKey, JSON.stringify({ feed, checkedAt: state.checkedAt })); } catch { /* Optional cache. */ }
    } catch {
      if (disposed) return;
      state.error = true; state.online = online();
      if (!state.feed) {
        clearTimeout(timer);
        const fallback = new AbortController(); active = fallback;
        timer = setTimeout(() => fallback.abort(), timeoutMs);
        try {
          state.feed = await request(snapshotUrl, fallback.signal); state.source = 'snapshot';
        } catch { /* Keep the unavailable state; do not invent empty success. */ }
      }
    } finally {
      clearTimeout(timer); active = null; state.refreshing = false; emit();
    }
  }
  emit();
  return { refresh, dispose() { disposed = true; active?.abort(); }, state };
}
