#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LIBRARY_ORIGIN = 'https://library.lupine.science';

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value;
}

function validateCatalog(catalog) {
  const entries = requireArray(catalog?.entries, 'catalog.entries');
  const ids = new Set();
  for (const entry of entries) {
    if (!entry.id || !entry.title || !entry.category || !Array.isArray(entry.tags)) {
      throw new Error(`Incomplete catalog metadata for article: ${entry.id || '<missing id>'}`);
    }
    if (ids.has(entry.id)) throw new Error(`Duplicate catalog article id: ${entry.id}`);
    ids.add(entry.id);
  }
  return entries;
}

function ontologySummary(ontology) {
  const groups = Object.entries(ontology?.superClasses || {});
  const classCount = groups.reduce((total, [, classes]) => total + requireArray(classes, 'superClasses group').length, 0);
  const atlasDate = ontology?.freshnessLayer?.atlasDate || ontology?.metadata?.compiled;
  const reverification = String(ontology?.freshnessLayer?.nextScheduledReverification || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const proofPack = ontology?.metadata?.corpus?.['doc:PP'];

  if (!atlasDate || !reverification || !proofPack?.date || !proofPack?.status) {
    throw new Error('Ontology is missing normative atlas, reverification, or proof-pack metadata');
  }
  if (classCount !== 37) {
    throw new Error(`Expected 37 ontology concept classes, found ${classCount}`);
  }

  return [
    '## Ontology Summary',
    '',
    `- Atlas date: ${atlasDate}`,
    `- Next scheduled reverification: ${reverification}`,
    `- Climate Partnerships Proof Pack: ${proofPack.status}, dated ${proofPack.date}`,
    `- Structure: ${groups.length} super-class groups containing ${classCount} concept classes`,
    '- Count ruling: the machine-readable JSON list is normative at 37 concept classes; the atlas figure caption says 33 and is an acknowledged discrepancy.',
    `- Super-class groups: ${groups.map(([name, classes]) => `${name} (${classes.length})`).join('; ')}`,
  ].join('\n');
}

export function generateLlmsFull(catalog, ontology) {
  const entries = validateCatalog(catalog);
  const lines = [
    '# Lupine Science Agent Guide and Complete Library Index',
    '',
    '> Deterministically generated from content/latest/manifest.json and content/ontology/lupine-ontology.json. Do not edit by hand.',
    '',
    'Lupine Science is a public research program for the error geometry of interatomic potentials. LUPI is the browser-native viewer for inspectable evidence, and Lupine Library is the public research corpus.',
    '',
    'Preserve each article’s epistemic status. Refutations and self-corrections are part of the method, not publication failures.',
    '',
    ontologySummary(ontology),
    '',
    `## Complete Article Index (${entries.length})`,
    '',
  ];

  for (const entry of entries) {
    lines.push(
      `### ${entry.title}`,
      '',
      `- ID: \`${entry.id}\``,
      `- Category: \`${entry.category}\``,
      `- Status: \`${entry.status || 'unspecified'}\``,
      `- Tags: ${entry.tags.length ? entry.tags.map((tag) => `\`${tag}\``).join(', ') : '(none)'}`,
      `- Library route: ${LIBRARY_ORIGIN}/#/read/${encodeURIComponent(entry.id)}`,
      `- Machine-readable article: ${LIBRARY_ORIGIN}/data/${encodeURIComponent(entry.id)}.json`,
      '',
    );
  }

  lines.push(
    '## Structured Files',
    '',
    '- Short guide: /llms.txt',
    '- Full guide and complete index: /llms-full.txt',
    '- Search index: /data/search-index.json',
    '- Library manifest: /data/library.json',
    '- Sitemap: /sitemap.xml',
    '- Structured brand metadata: /brand.json',
    '',
  );
  return `${lines.join('\n')}\n`;
}

export function generateSearchIndex(catalog) {
  const entries = validateCatalog(catalog);
  return {
    schemaVersion: 'library-search-index.v1',
    articleCount: entries.length,
    categories: catalog.categories || [],
    statuses: catalog.statuses || {},
    articles: entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      subtitle: entry.subtitle || '',
      category: entry.category,
      status: entry.status || null,
      tags: entry.tags,
      source: entry.source || null,
      featured: Boolean(entry.featured),
      featuredRole: entry.featuredRole || null,
      group: entry.group || null,
      route: `#/read/${encodeURIComponent(entry.id)}`,
      extracted_knowledge: {},
    })),
  };
}

export function generateSitemap(catalog) {
  const entries = validateCatalog(catalog);
  const staticRoutes = ['/', '/llms.txt', '/llms-full.txt', '/brand.json', '/data/library.json', '/data/search-index.json'];
  const locations = [
    ...staticRoutes.map((route) => `${LIBRARY_ORIGIN}${route}`),
    ...entries.map((entry) => `${LIBRARY_ORIGIN}/data/${encodeURIComponent(entry.id)}.json`),
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...locations.map((location) => `  <url><loc>${location}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
}

export function writeMachineIndexes({ catalog, ontology, outputRoot }) {
  const dataDir = path.join(outputRoot, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(outputRoot, 'llms-full.txt'), generateLlmsFull(catalog, ontology));
  fs.writeFileSync(path.join(outputRoot, 'sitemap.xml'), generateSitemap(catalog));
  fs.writeFileSync(
    path.join(dataDir, 'search-index.json'),
    `${JSON.stringify(generateSearchIndex(catalog), null, 2)}\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/latest/manifest.json'), 'utf8'));
  const ontology = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/ontology/lupine-ontology.json'), 'utf8'));
  const outputRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'dist');
  writeMachineIndexes({ catalog: manifest.catalog, ontology, outputRoot });
  console.log(`Generated machine indexes for ${manifest.catalog.entries.length} articles in ${outputRoot}`);
}
