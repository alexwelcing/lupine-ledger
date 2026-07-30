#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEFAULT_MANIFEST_PATH = path.join(ROOT, 'content', 'latest', 'manifest.json');
const DEFAULT_OUTPUT_PATH = path.join(ROOT, 'dist', 'data', 'knowledge-graph.json');
const SCHEMA = 'lupine-library-knowledge-graph-v1';
const RELATIONS = ['program', 'contains', 'tagged', 'lifecycle', 'grouped', 'related', 'co-topic'];
const CONFIDENCE_VALUES = ['declared', 'derived', 'extracted-reviewed', 'suggested'];

function text(value, fallback = '') {
  if (typeof value === 'string') return value;
  return value?.en || Object.values(value || {}).find((item) => typeof item === 'string') || fallback;
}

function compareId(a, b) {
  return a.id.localeCompare(b.id);
}

function hash32(value) {
  let hash = 2166136261;
  for (const char of `${SCHEMA}:${value}`) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed) {
  let value = seed >>> 0;
  value += 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function positionFor(id, type) {
  const anchors = {
    corpus: [500, 340, 0, 0],
    category: [500, 340, 360, 250],
    status: [155, 340, 90, 250],
    group: [845, 340, 90, 250],
    tag: [500, 340, 300, 275],
    article: [500, 340, 410, 290],
  };
  const [cx, cy, rx, ry] = anchors[type] || anchors.article;
  if (!rx || !ry) return { x: cx, y: cy };
  const seed = hash32(id);
  const angle = seededUnit(seed) * Math.PI * 2;
  const radius = 0.28 + seededUnit(seed ^ 0x9e3779b9) * 0.72;
  return {
    x: Number((cx + Math.cos(angle) * rx * radius).toFixed(2)),
    y: Number((cy + Math.sin(angle) * ry * radius).toFixed(2)),
  };
}

function provenance(source, method, confidence) {
  return { source, method, confidence };
}

function link(relation, source, target, details = {}) {
  return {
    id: `${relation}:${source}->${target}`,
    source,
    target,
    relation,
    ...details,
  };
}

export function buildKnowledgeGraph(catalog, { source = {}, generatedAt = null } = {}) {
  const categories = [...(catalog.categories || [])].sort((a, b) => a.id.localeCompare(b.id));
  const entries = [...(catalog.entries || [])].sort((a, b) => a.id.localeCompare(b.id));
  const usedStatusIds = [...new Set(entries.map((entry) => entry.status).filter(Boolean))].sort();
  const usedGroupIds = [...new Set(entries.map((entry) => entry.group).filter(Boolean))].sort();
  const tagCounts = new Map();
  for (const entry of entries) {
    for (const tag of new Set(entry.tags || [])) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  }
  const tagIds = [...tagCounts.keys()].sort();

  const nodes = [
    {
      id: 'library:root',
      type: 'corpus',
      label: 'Lupine Library',
      count: entries.length,
      position: positionFor('library:root', 'corpus'),
    },
    ...categories.map((category) => ({
      id: `category:${category.id}`,
      type: 'category',
      categoryId: category.id,
      label: text(category.label, category.id),
      blurb: text(category.blurb),
      count: entries.filter((entry) => entry.category === category.id).length,
      position: positionFor(`category:${category.id}`, 'category'),
    })),
    ...usedStatusIds.map((statusId) => {
      const status = catalog.statuses?.[statusId] || {};
      return {
        id: `status:${statusId}`,
        type: 'status',
        statusId,
        label: text(status.label, statusId),
        blurb: text(status.gloss),
        color: status.color || null,
        count: entries.filter((entry) => entry.status === statusId).length,
        position: positionFor(`status:${statusId}`, 'status'),
      };
    }),
    ...usedGroupIds.map((groupId) => ({
      id: `group:${groupId}`,
      type: 'group',
      groupId,
      label: groupId.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      count: entries.filter((entry) => entry.group === groupId).length,
      position: positionFor(`group:${groupId}`, 'group'),
    })),
    ...tagIds.map((tag) => ({
      id: `tag:${tag}`,
      type: 'tag',
      tag,
      label: tag,
      count: tagCounts.get(tag),
      position: positionFor(`tag:${tag}`, 'tag'),
    })),
    ...entries.map((entry) => ({
      id: `article:${entry.id}`,
      type: 'article',
      articleId: entry.id,
      label: text(entry.title, entry.id),
      title: text(entry.title, entry.id),
      subtitle: text(entry.subtitle),
      category: entry.category,
      status: entry.status || null,
      group: entry.group || null,
      tags: [...new Set(entry.tags || [])].sort(),
      source: entry.source,
      featured: Boolean(entry.featured),
      position: positionFor(`article:${entry.id}`, 'article'),
    })),
  ].sort(compareId);

  const links = [];
  for (const category of categories) {
    links.push(link('program', 'library:root', `category:${category.id}`, {
      label: 'program area',
      provenance: provenance('catalog.categories', 'declared category membership', 'declared'),
    }));
  }
  for (const entry of entries) {
    const articleId = `article:${entry.id}`;
    links.push(link('contains', `category:${entry.category}`, articleId, {
      label: 'contains article',
      provenance: provenance(`catalog.entries.${entry.id}.category`, 'declared catalog field', 'declared'),
    }));
    for (const tag of [...new Set(entry.tags || [])].sort()) {
      links.push(link('tagged', articleId, `tag:${tag}`, {
        label: 'tagged',
        provenance: provenance(`catalog.entries.${entry.id}.tags`, 'declared catalog field', 'declared'),
      }));
    }
    if (entry.status) {
      links.push(link('lifecycle', articleId, `status:${entry.status}`, {
        label: 'lifecycle status',
        provenance: provenance(`catalog.entries.${entry.id}.status`, 'declared catalog field', 'declared'),
      }));
    }
    if (entry.group) {
      links.push(link('grouped', articleId, `group:${entry.group}`, {
        label: 'catalog group',
        provenance: provenance(`catalog.entries.${entry.id}.group`, 'declared catalog field', 'declared'),
      }));
    }
  }

  const coTopics = new Map();
  for (const entry of entries) {
    const tags = [...new Set(entry.tags || [])].sort();
    for (let left = 0; left < tags.length; left += 1) {
      for (let right = left + 1; right < tags.length; right += 1) {
        const key = `${tags[left]}\u0000${tags[right]}`;
        const current = coTopics.get(key) || { left: tags[left], right: tags[right], articles: [] };
        current.articles.push(entry.id);
        coTopics.set(key, current);
      }
    }
  }
  for (const item of [...coTopics.values()].filter((item) => item.articles.length >= 2).sort((a, b) => `${a.left}\u0000${a.right}`.localeCompare(`${b.left}\u0000${b.right}`))) {
    links.push(link('co-topic', `tag:${item.left}`, `tag:${item.right}`, {
      label: 'co-occurs in articles',
      weight: item.articles.length,
      evidence: `${item.articles.length} shared articles`,
      provenance: provenance(item.articles.map((id) => `catalog.entries.${id}.tags`).join(','), 'derived tag co-occurrence (minimum two articles)', 'derived'),
    }));
  }

  for (let left = 0; left < entries.length; left += 1) {
    const leftTags = new Set(entries[left].tags || []);
    for (let right = left + 1; right < entries.length; right += 1) {
      const shared = [...new Set(entries[right].tags || [])].filter((tag) => leftTags.has(tag)).sort();
      if (shared.length < 2) continue;
      links.push(link('related', `article:${entries[left].id}`, `article:${entries[right].id}`, {
        label: 'shared topics',
        weight: shared.length,
        evidence: shared.join(', '),
        provenance: provenance(
          `catalog.entries.${entries[left].id}.tags,catalog.entries.${entries[right].id}.tags`,
          'suggested from at least two shared declared tags',
          'suggested',
        ),
      }));
    }
  }

  links.sort(compareId);
  const relationCounts = Object.fromEntries(RELATIONS.map((relation) => [
    relation,
    links.filter((item) => item.relation === relation).length,
  ]));

  return {
    schema: SCHEMA,
    scope: 'library-only',
    generatedAt,
    source: {
      repo: source.repo || 'lupine-rhizo',
      commit: source.commit || null,
      manifest: 'content/latest/manifest.json',
    },
    ontology: {
      nodeTypes: {
        corpus: 'Library corpus root',
        category: 'Declared program area',
        status: 'Declared lifecycle state used by an article',
        group: 'Declared article sequence or collection',
        tag: 'Declared catalog topic tag',
        article: 'Library article',
      },
      relationTypes: Object.fromEntries(RELATIONS.map((relation) => [relation, RELATION_DESCRIPTIONS[relation]])),
      confidenceValues: CONFIDENCE_VALUES,
    },
    perspectives: [
      { id: 'overview', label: 'Overview', relations: ['program', 'contains', 'tagged'] },
      { id: 'topics', label: 'Topics', relations: ['tagged', 'co-topic'] },
      { id: 'lifecycle', label: 'Lifecycle', relations: ['program', 'contains', 'lifecycle', 'grouped'] },
      { id: 'local', label: 'Local', relations: RELATIONS },
    ],
    stats: {
      nodes: nodes.length,
      links: links.length,
      articleCount: entries.length,
      categoryCount: categories.length,
      statusCount: usedStatusIds.length,
      groupCount: usedGroupIds.length,
      tagCount: tagIds.length,
      relationCounts,
    },
    nodes,
    links,
  };
}

const RELATION_DESCRIPTIONS = {
  program: 'Corpus has a declared program area',
  contains: 'Category contains an article',
  tagged: 'Article has a declared topic tag',
  lifecycle: 'Article has a declared lifecycle status',
  grouped: 'Article belongs to a declared group',
  related: 'Articles are suggested as related by at least two shared tags',
  'co-topic': 'Tags co-occur in at least two articles',
};

export function writeKnowledgeGraph({ manifestPath = DEFAULT_MANIFEST_PATH, outputPath = DEFAULT_OUTPUT_PATH } = {}) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 'library-content.v1') {
    throw new Error(`Unsupported Library content schema: ${manifest.schemaVersion}`);
  }
  const graph = buildKnowledgeGraph(manifest.catalog, {
    source: manifest.source,
    generatedAt: manifest.generatedAt,
  });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(graph, null, 2)}\n`);
  return graph;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const graph = writeKnowledgeGraph();
  console.log(`[knowledge-graph] wrote ${path.relative(process.cwd(), DEFAULT_OUTPUT_PATH)} (${graph.stats.nodes} nodes, ${graph.stats.links} links)`);
}
