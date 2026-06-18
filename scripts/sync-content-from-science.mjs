#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const scienceRepo = process.env.SCIENCE_REPO
  ? path.resolve(process.env.SCIENCE_REPO)
  : path.resolve(ROOT, '..', 'lupine-rhizo');
const sourceBundle = process.env.LIBRARY_CONTENT_EXPORT
  ? path.resolve(process.env.LIBRARY_CONTENT_EXPORT)
  : path.join(scienceRepo, 'exports', 'library-content', 'latest');
const targetBundle = process.env.LIBRARY_CONTENT_BUNDLE
  ? path.resolve(process.env.LIBRARY_CONTENT_BUNDLE)
  : path.join(ROOT, 'content', 'latest');

function ensureInsideRoot(target) {
  const resolved = path.resolve(target);
  const contentRoot = path.join(ROOT, 'content');
  if (!resolved.startsWith(contentRoot + path.sep) && resolved !== contentRoot) {
    throw new Error(`Refusing to write outside ${contentRoot}: ${resolved}`);
  }
  return resolved;
}

const target = ensureInsideRoot(targetBundle);
const manifestPath = path.join(sourceBundle, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  throw new Error(`Library content manifest not found: ${manifestPath}`);
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.cpSync(sourceBundle, target, { recursive: true });
console.log(`Synced Library content bundle: ${sourceBundle}`);
console.log(`Target: ${target}`);
