#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEFAULT_BUNDLE = path.join(ROOT, 'content', 'latest');
const bundleRoot = process.env.LIBRARY_CONTENT_BUNDLE
  ? path.resolve(process.env.LIBRARY_CONTENT_BUNDLE)
  : DEFAULT_BUNDLE;
const manifestPath = path.join(bundleRoot, 'manifest.json');

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isSafeRelativePath(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !value.includes('\\') &&
    !value.split('/').includes('..')
  );
}

function hasLocalPathShape(value) {
  if (typeof value !== 'string') return false;
  return (
    /^[A-Za-z]:[\\/]/.test(value) ||
    /[\\/]Users[\\/]/.test(value) ||
    /[\\/]home[\\/]/.test(value) ||
    /[\\/]tmp[\\/]/.test(value) ||
    /[\\.]codex[\\/]/.test(value)
  );
}

function scanForLocalPaths(value, trail = 'manifest') {
  if (typeof value === 'string') {
    if (hasLocalPathShape(value)) fail(`${trail} contains a local filesystem path`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForLocalPaths(item, `${trail}[${index}]`));
    return;
  }
  if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (/absolute|root|workspace/i.test(key) && typeof item === 'string') {
        fail(`${trail}.${key} looks like local build metadata; keep manifests portable`);
      }
      scanForLocalPaths(item, `${trail}.${key}`);
    }
  }
}

function readManifest() {
  if (!fs.existsSync(manifestPath)) {
    fail(`content manifest not found: ${manifestPath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`manifest is not valid JSON: ${error.message}`);
    return null;
  }
}

function sha256(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

const manifest = readManifest();
if (manifest) {
  if (manifest.schemaVersion !== 'library-content.v1') {
    fail(`unsupported schemaVersion: ${manifest.schemaVersion}`);
  }
  if (!manifest.generatedAt || Number.isNaN(Date.parse(manifest.generatedAt))) {
    fail('generatedAt must be an ISO timestamp');
  }
  if (!isPlainObject(manifest.source)) {
    fail('source metadata is required');
  } else {
    if (manifest.source.repo !== 'lupine-rhizo') {
      warn(`unexpected source repo: ${manifest.source.repo}`);
    }
    if (!/^[0-9a-f]{40}$/i.test(manifest.source.commit || '')) {
      fail('source.commit must be a 40-character git SHA');
    }
    if (!manifest.source.generator) {
      fail('source.generator is required');
    }
  }

  scanForLocalPaths(manifest);

  const catalog = manifest.catalog;
  if (!isPlainObject(catalog)) {
    fail('catalog object is required');
  }

  const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];
  const entries = Array.isArray(catalog?.entries) ? catalog.entries : [];
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  if (!categories.length) fail('catalog.categories must not be empty');
  if (!entries.length) fail('catalog.entries must not be empty');
  if (!files.length) fail('files must not be empty');

  const categoryIds = new Set();
  for (const category of categories) {
    if (!category?.id) fail('category is missing id');
    if (categoryIds.has(category.id)) fail(`duplicate category id: ${category.id}`);
    categoryIds.add(category.id);
  }

  const statuses = new Set(Object.keys(catalog?.statuses || {}));
  const bundleSources = new Set();
  let checkedFiles = 0;

  for (const file of files) {
    if (!isSafeRelativePath(file.bundleSource)) {
      fail(`unsafe file.bundleSource: ${file.bundleSource}`);
      continue;
    }
    if (bundleSources.has(file.bundleSource)) {
      fail(`duplicate bundleSource: ${file.bundleSource}`);
    }
    bundleSources.add(file.bundleSource);

    if (!/^[0-9a-f]{64}$/i.test(file.sha256 || '')) {
      fail(`invalid sha256 for ${file.bundleSource}`);
      continue;
    }

    const abs = path.join(bundleRoot, file.bundleSource);
    if (!fs.existsSync(abs)) {
      fail(`missing bundled file: ${file.bundleSource}`);
      continue;
    }
    const stat = fs.statSync(abs);
    if (stat.size !== file.bytes) {
      fail(`byte mismatch for ${file.bundleSource}: manifest=${file.bytes} actual=${stat.size}`);
    }
    const actualHash = sha256(abs);
    if (actualHash !== file.sha256) {
      fail(`hash mismatch for ${file.bundleSource}`);
    }
    checkedFiles += 1;
  }

  const entryIds = new Set();
  for (const entry of entries) {
    if (!entry?.id) fail('catalog entry is missing id');
    if (entryIds.has(entry.id)) fail(`duplicate entry id: ${entry.id}`);
    entryIds.add(entry.id);
    if (!isSafeRelativePath(entry.source)) fail(`unsafe entry.source for ${entry.id}`);
    if (!bundleSources.has(entry.source)) fail(`entry source missing from files list: ${entry.id} -> ${entry.source}`);
    if (!categoryIds.has(entry.category)) fail(`unknown category for ${entry.id}: ${entry.category}`);
    if (entry.status && !statuses.has(entry.status)) {
      warn(`entry uses status not defined in catalog.statuses: ${entry.id} -> ${entry.status}`);
    }
  }

  if (entries.length !== files.length) {
    warn(`entry count (${entries.length}) differs from file count (${files.length}); this is okay only for shared assets or variants`);
  }

  console.log(`Library content bundle: ${bundleRoot}`);
  console.log(`Manifest schema: ${manifest.schemaVersion}`);
  console.log(`Source commit: ${manifest.source?.commit}${manifest.source?.dirty ? ' (dirty export)' : ''}`);
  console.log(`Catalog entries: ${entries.length}`);
  console.log(`Files checked: ${checkedFiles}`);
}

for (const message of warnings) console.warn(`[warn] ${message}`);

if (errors.length) {
  for (const message of errors) console.error(`[error] ${message}`);
  process.exit(1);
}

console.log('Library content verification passed.');
