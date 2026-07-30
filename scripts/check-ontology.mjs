#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ONTOLOGY_PATH = path.join(ROOT, 'dist', 'data', 'ontology.json');
const REQUIRED_TYPES = ['errorType', 'materialClass', 'discoveryChain', 'acceptanceTest', 'emblem', 'scoreboardRow', 'timeGate', 'falsifier'];
const MARKERS = new Set(['OBS', 'INF', 'TRN', 'PRP', 'FRC']);

function issue(message, details = null) {
  return { message, details };
}

export function validateOntology(ontology) {
  const errors = [];
  const nodes = ontology.nodes || [];
  const links = ontology.links || [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const relationLabels = new Set(ontology.edgeLabels || []);
  const duplicates = nodes.filter((node, index) => nodes.findIndex((other) => other.id === node.id) !== index).map((node) => node.id);
  const badLinks = links.filter((link) => !nodeIds.has(link.source) || !nodeIds.has(link.target) || !relationLabels.has(link.relation));
  const missingChrome = nodes.filter((node) =>
    !MARKERS.has(node.marker) || !node.readiness?.grade || !node.readiness?.annotation ||
    !node.confidence?.grade || !node.confidence?.annotation || !node.asOf
  );

  if (ontology.schema !== 'lupine-ontology-v1') errors.push(issue('unexpected ontology schema', ontology.schema));
  if (ontology.sourceTopLevelKeys?.length !== 27) errors.push(issue('ontology source section count is not 27', ontology.sourceTopLevelKeys?.length));
  if (ontology.relations?.length !== 32) errors.push(issue('ontology relation definition count is not 32', ontology.relations?.length));
  if (ontology.stats?.superClassCount !== 37) errors.push(issue('ontology superclass count is not 37', ontology.stats?.superClassCount));
  if (duplicates.length) errors.push(issue('ontology has duplicate node ids', duplicates));
  if (badLinks.length) errors.push(issue('ontology has invalid links', badLinks.slice(0, 10)));
  if (missingChrome.length) errors.push(issue('ontology nodes are missing epistemic chrome', missingChrome.slice(0, 10).map((node) => node.id)));
  if (ontology.unresolvedForeignKeys?.length) errors.push(issue('ontology has unresolved foreign keys', ontology.unresolvedForeignKeys));
  if (nodes.length !== ontology.stats?.nodes || links.length !== ontology.stats?.links) {
    errors.push(issue('ontology stats do not reconcile', { nodes: nodes.length, links: links.length, stats: ontology.stats }));
  }
  for (const type of REQUIRED_TYPES) {
    if (!nodes.some((node) => node.type === type)) errors.push(issue(`ontology is missing required node type ${type}`));
  }
  const timeGates = nodes.filter((node) => node.type === 'timeGate');
  if (timeGates.length !== 12 || !timeGates.some((node) => node.family === 'calendar') || !timeGates.some((node) => node.family === 'weather')) {
    errors.push(issue('ontology time gates do not reconcile', timeGates.map((node) => ({ id: node.id, family: node.family }))));
  }
  return errors;
}

function run() {
  if (!fs.existsSync(ONTOLOGY_PATH)) {
    console.error('[ontology-check] ontology.json is missing. Run npm run build first.');
    process.exitCode = 1;
    return;
  }
  const ontology = JSON.parse(fs.readFileSync(ONTOLOGY_PATH, 'utf8'));
  const errors = validateOntology(ontology);
  for (const error of errors) {
    console.error(`[ontology-check] ${error.message}`);
    if (error.details) console.error(JSON.stringify(error.details, null, 2));
  }
  if (errors.length) {
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify({
    ok: true,
    nodes: ontology.stats.nodes,
    links: ontology.stats.links,
    relations: ontology.stats.relationDefinitions,
    superClasses: ontology.stats.superClassCount,
    unresolvedForeignKeys: ontology.unresolvedForeignKeys.length,
    exceptions: ontology.exceptions.map((item) => item.code),
  }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
