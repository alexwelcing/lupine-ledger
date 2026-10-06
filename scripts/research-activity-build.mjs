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
  const feed = validateFeed(JSON.parse(fs.readFileSync(file, 'utf8')));
  return { feed, endpoint: `${url.origin}/research/activity?limit=20` };
}
