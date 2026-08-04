#!/usr/bin/env node
// Generates content/ontology/lean-count.json from the active lupine-rhizo Lean tree.
// The ontology references this file; do not hand-type theorem totals into FP1.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEAN_SPEC = path.resolve(process.argv[2] ?? path.join(ROOT, '..', 'lupine-rhizo', 'lean-spec'));
const TARGET = path.join(LEAN_SPEC, 'OpenDistillationFactory');
const OUT = path.join(ROOT, 'content', 'ontology', 'lean-count.json');
const DECL_RE = /^(theorem|lemma)\s/;
const SORRY_RE = /:=\s*sorry\b|\bby\s+sorry\b|^\s*sorry\s*$/;
const COMMENT_RE = /^\s*(--|\/-|\*)/;

function leanFiles(root) {
  const files = [];
  const rootFile = `${root}.lean`;
  if (fs.existsSync(rootFile)) files.push(rootFile);
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const entryPath = path.join(dir, entry.name);
      if (entryPath.includes(`${path.sep}packages${path.sep}`) || entryPath.includes(`${path.sep}.lake${path.sep}`)) continue;
      if (entry.isDirectory()) walk(entryPath);
      else if (entry.isFile() && entryPath.endsWith('.lean')) files.push(entryPath);
    }
  };
  if (fs.existsSync(root)) walk(root);
  return files.sort();
}

const files = leanFiles(TARGET);
if (!files.length) throw new Error(`no .lean files found under ${TARGET}; pass the active lean-spec path as argv[2]`);
let count = 0;
let sorryCount = 0;
for (const file of files) {
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (DECL_RE.test(line)) count += 1;
    if (SORRY_RE.test(line) && !COMMENT_RE.test(line)) sorryCount += 1;
  }
}

const inventory = {
  count,
  zero_sorry: sorryCount === 0,
  counted_at: new Date().toISOString().slice(0, 10),
  source: 'lupine-rhizo/lean-spec/OpenDistillationFactory{,.lean} (vendored packages excluded)',
  source_commit: execSync('git rev-parse --short HEAD', { cwd: LEAN_SPEC, encoding: 'utf8' }).trim(),
  rule: 'top-level declarations: lines matching /^(theorem|lemma)\\s/ in *.lean under OpenDistillationFactory{,.lean}, excluding /packages/ and /.lake/; regenerate with scripts/generate-lean-count.mjs — never hand-edit',
};
fs.writeFileSync(OUT, `${JSON.stringify(inventory, null, 2)}\n`);
console.log(`generate-lean-count: ${count} declarations (sorry hits in proof code: ${sorryCount}) → ${path.relative(ROOT, OUT)}`);
if (sorryCount > 0) process.exit(2);
