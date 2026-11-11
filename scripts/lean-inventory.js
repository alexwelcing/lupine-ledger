// Generated Lean inventory (content/ontology/lean-count.json). Fails closed:
// the count is never hand-typed and an active sorry stops the build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEAN_INVENTORY_PATH = path.join(REPO_ROOT, 'content', 'ontology', 'lean-count.json');
export const LEAN_INVENTORY = JSON.parse(fs.readFileSync(LEAN_INVENTORY_PATH, 'utf8'));
if (!Number.isSafeInteger(LEAN_INVENTORY.count) || LEAN_INVENTORY.count < 1 || LEAN_INVENTORY.zero_sorry !== true) {
  throw new Error(`Invalid fail-closed Lean inventory: ${LEAN_INVENTORY_PATH}`);
}
