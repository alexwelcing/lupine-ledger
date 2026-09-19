import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createClient, warmConnection } from './client.mjs';
import { search } from './search.mjs';
import { startDemo } from './server.mjs';

const here = name => fileURLToPath(new URL(name, import.meta.url));
let articles;
try { ({ articles } = JSON.parse(await readFile(here('../../dist/data/search-index.json'), 'utf8'))); }
catch { throw new Error('Build the current catalog first: npm run build'); }
const evaluate = createClient({ apiKey: process.env.TYPESAFE_API_KEY });
if (process.env.TYPESAFE_API_KEY) {
  console.log('Preparing the TypeSafe connection (up to 10 seconds)…');
  if (!await warmConnection(process.env.TYPESAFE_API_KEY)) console.log('Connection unavailable; keyword search remains available.');
}
export const server = startDemo({ port: 4319, assets: {
  '/': [here('index.html'), 'text/html; charset=utf-8'],
  '/app.js': [here('app.js'), 'text/javascript; charset=utf-8'],
  '/baseline.mjs': [here('baseline.mjs'), 'text/javascript; charset=utf-8'],
}, evaluate: text => search(text, articles, evaluate),
  data: () => ({ articles, configured: Boolean(process.env.TYPESAFE_API_KEY) }) });
