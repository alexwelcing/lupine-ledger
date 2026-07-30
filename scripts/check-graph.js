#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GRAPH_PATH = path.join(ROOT, 'dist', 'data', 'knowledge-graph.json');
const MANIFEST_PATH = path.join(ROOT, 'content', 'latest', 'manifest.json');
const CONFIDENCE_VALUES = new Set(['declared', 'derived', 'extracted-reviewed', 'suggested']);

function issue(message, details = null) {
  return { message, details };
}

function expectedStats(catalog) {
  const entries = catalog.entries || [];
  return {
    articleCount: entries.length,
    categoryCount: (catalog.categories || []).length,
    statusCount: new Set(entries.map((entry) => entry.status).filter(Boolean)).size,
    groupCount: new Set(entries.map((entry) => entry.group).filter(Boolean)).size,
    tagCount: new Set(entries.flatMap((entry) => entry.tags || [])).size,
  };
}

export function validateKnowledgeGraph(graph, catalog) {
  const errors = [];
  const nodes = graph.nodes || [];
  const links = graph.links || [];
  const nodeIds = new Set();
  const duplicateNodes = [];
  for (const node of nodes) {
    if (nodeIds.has(node.id)) duplicateNodes.push(node.id);
    nodeIds.add(node.id);
  }

  const badLinks = [];
  const missingProvenance = [];
  for (const link of links) {
    if (!nodeIds.has(link.source) || !nodeIds.has(link.target)) badLinks.push(link);
    if (!link.provenance?.source || !link.provenance?.method || !link.provenance?.confidence) {
      missingProvenance.push(link.id || `${link.source}->${link.target}:${link.relation}`);
    }
  }

  const missingPositions = nodes.filter((node) =>
    !node.position ||
    !Number.isFinite(node.position.x) ||
    !Number.isFinite(node.position.y)
  );
  const relationTypes = new Set(Object.keys(graph.ontology?.relationTypes || {}));
  const unknownRelations = links.filter((link) => !relationTypes.has(link.relation));
  const unknownConfidence = links.filter((link) => !CONFIDENCE_VALUES.has(link.provenance?.confidence));

  if (graph.schema !== 'lupine-library-knowledge-graph-v1') errors.push(issue('unexpected graph schema', { schema: graph.schema }));
  if (!['library-only', 'library+ontology'].includes(graph.scope)) errors.push(issue('unexpected graph scope', { scope: graph.scope }));
  if (duplicateNodes.length) errors.push(issue('duplicate node ids', duplicateNodes));
  if (badLinks.length) errors.push(issue('links reference missing nodes', badLinks.slice(0, 10)));
  if (missingPositions.length) errors.push(issue('nodes missing deterministic positions', missingPositions.slice(0, 10).map((node) => node.id)));
  if (missingProvenance.length) errors.push(issue('links missing provenance', missingProvenance.slice(0, 10)));
  if (unknownRelations.length) errors.push(issue('links use relations absent from ontology', unknownRelations.slice(0, 10)));
  if (unknownConfidence.length) errors.push(issue('links use unknown confidence values', unknownConfidence.slice(0, 10)));

  const articleNodes = nodes.filter((node) => node.type === 'article').length;
  if (articleNodes !== graph.stats?.articleCount) {
    errors.push(issue('article node count does not match graph stats', { articleNodes, stats: graph.stats?.articleCount }));
  }
  if (nodes.length !== graph.stats?.nodes || links.length !== graph.stats?.links) {
    errors.push(issue('node or link totals do not match graph stats', {
      actual: { nodes: nodes.length, links: links.length },
      stats: { nodes: graph.stats?.nodes, links: graph.stats?.links },
    }));
  }

  const actualRelationCounts = Object.fromEntries([...relationTypes].map((relation) => [
    relation,
    links.filter((link) => link.relation === relation).length,
  ]));
  if (JSON.stringify(actualRelationCounts) !== JSON.stringify(graph.stats?.relationCounts || {})) {
    errors.push(issue('relation counts do not match graph stats', {
      actual: actualRelationCounts,
      stats: graph.stats?.relationCounts,
    }));
  }

  if (catalog) {
    const expected = expectedStats(catalog);
    const actual = Object.fromEntries(Object.keys(expected).map((key) => [key, graph.stats?.[key]]));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      errors.push(issue('graph stats do not reconcile to source manifest', { expected, actual }));
    }
  }

  return errors;
}

function run() {
  if (!fs.existsSync(GRAPH_PATH)) {
    console.error('[graph-check] knowledge-graph.json is missing. Run npm run build first.');
    process.exitCode = 1;
    return;
  }
  const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const errors = validateKnowledgeGraph(graph, manifest.catalog);
  for (const error of errors) {
    console.error(`[graph-check] ${error.message}`);
    if (error.details) console.error(JSON.stringify(error.details, null, 2));
  }
  if (errors.length) {
    process.exitCode = 1;
    return;
  }

  const confidenceCounts = graph.links.reduce((counts, link) => {
    const key = link.provenance.confidence;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  console.log(JSON.stringify({
    ok: true,
    nodes: graph.nodes.length,
    links: graph.links.length,
    articleNodes: graph.stats.articleCount,
    confidenceCounts,
    perspectives: (graph.perspectives || []).map((perspective) => perspective.id),
    sourceStatsReconciled: true,
  }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();