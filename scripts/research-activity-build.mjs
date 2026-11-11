import fs from 'node:fs';
import path from 'node:path';
import { isPublicSourceUrl, MAX_FEED_BYTES, validateFeed } from '../src/researchActivity.js';

export function loadResearchActivity(root, env = process.env) {
  const origin = env.LIBRARY_RESEARCH_ACTIVITY_ORIGIN || 'https://glim-think-v1.aw-ab5.workers.dev';
  if (!isPublicSourceUrl(origin)) throw new Error('Research activity origin must be a public HTTPS origin.');
  const url = new URL(origin);
  if (url.pathname !== '/' || url.search || url.hash) throw new Error('Research activity origin cannot contain a path, query or fragment.');
  const file = env.LIBRARY_RESEARCH_ACTIVITY_SNAPSHOT
    ? path.resolve(env.LIBRARY_RESEARCH_ACTIVITY_SNAPSHOT)
    : path.join(root, 'content', 'research-activity.json');
  if (fs.statSync(file).size > MAX_FEED_BYTES) throw new Error('Reviewed research activity snapshot is too large.');
  const raw = fs.readFileSync(file, 'utf8');
  // Optional deploy-time denylist (for example private host or device names),
  // supplied by the environment so the names themselves are never published.
  const privateTerms = String(env.LIBRARY_PRIVATE_TERMS || '').split(',').map((term) => term.trim().toLowerCase()).filter(Boolean);
  if (privateTerms.some((term) => raw.toLowerCase().includes(term))) {
    throw new Error('Reviewed research activity snapshot contains a configured private term.');
  }
  const feed = validateFeed(JSON.parse(raw));
  return { feed, endpoint: `${url.origin}/research/activity?limit=20` };
}
