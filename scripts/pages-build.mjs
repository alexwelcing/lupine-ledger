#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const scienceRepo = process.env.SCIENCE_REPO
  ? path.resolve(process.env.SCIENCE_REPO)
  : path.resolve(ROOT, '..', 'lupine-rhizo');
const sourceBundle = process.env.LIBRARY_CONTENT_EXPORT
  ? path.resolve(process.env.LIBRARY_CONTENT_EXPORT)
  : path.join(scienceRepo, 'exports', 'library-content', 'latest');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (fs.existsSync(path.join(sourceBundle, 'manifest.json'))) {
  console.log(`Pages build: syncing science export from ${sourceBundle}`);
  run('npm', ['run', 'content:sync']);
} else if (process.env.REQUIRE_LIBRARY_CONTENT_EXPORT === '1') {
  console.error(`Pages build: required science export not found at ${sourceBundle}`);
  process.exit(1);
} else {
  console.log(`Pages build: science export not found at ${sourceBundle}; using committed content/latest bundle.`);
}

run('npm', ['run', 'content:verify']);
run('npm', ['run', 'build']);
