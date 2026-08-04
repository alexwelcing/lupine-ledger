#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_SOURCE = path.join(ROOT, 'content', 'ontology', 'lupine-ontology.json');
const DEFAULT_OUTPUT = path.join(ROOT, 'dist', 'data', 'ontology.json');
const MARKERS = ['OBS', 'INF', 'TRN', 'PRP', 'FRC'];

const COLLECTIONS = {
  errorTypes: ['errorType', (item) => item.id],
  emblems: ['emblem', (item) => item.id],
  materialClasses: ['materialClass', (item) => item.id],
  excludedClasses: ['excludedClass', (_item, index) => `X${index + 1}`],
  scoreboard: ['scoreboardRow', (item) => `SB${item.row}`],
  dataLevers: ['correctionLever', (item) => item.id],
  acceptanceTests: ['acceptanceTest', (item) => item.id],
  discoveryChains: ['discoveryChain', (item) => item.id],
  stageGates: ['stageGate', (_item, index) => `SG${index + 1}`],
  killCriteria: ['killCriterion', (item) => item.id],
  roadmapPhases: ['roadmapPhase', (item) => `P${item.phase}`],
  epistemicMarkers: ['epistemicMarker', (item) => item.id],
  readinessGrades: ['readinessGrade', (item) => item.id],
  confidenceGrades: ['confidenceGrade', (item) => item.id],
  falsifiers: ['falsifier', (_item, index) => `F${index + 1}`],
  timeGates: ['timeGate', (_item, index) => `TG${index + 1}`],
  risks: ['risk', (_item, index) => `R${index + 1}`],
  skepticEpisodes: ['skepticEpisode', (_item, index) => `S${index + 1}`],
  conflictRulings: ['conflictRuling', (item) => item.id],
  climateTargets: ['climateTarget', (_item, index) => `CT${index + 1}`],
};

const SINGLETONS = {
  metadata: ['ontologyMetadata', 'atlas'],
  lupineMethod: ['lupineMethod', 'LM1'],
  formalProof: ['formalProof', 'FP1'],
  climateAggregate: ['climateAggregate', 'CA1'],
};

const SUPER_CLASS_BY_TYPE = {
  errorType: 'ErrorType', emblem: 'ErrorEmblem', materialClass: 'MaterialClass', excludedClass: 'ExcludedClass',
  scoreboardRow: 'MeasuredError', correctionLever: 'CorrectionLever', acceptanceTest: 'AcceptanceTest',
  discoveryChain: 'DiscoveryChain', stageGate: 'StageGate', killCriterion: 'KillCriterion', roadmapPhase: 'RoadmapPhase',
  epistemicMarker: 'EpistemicMarker', readinessGrade: 'ReadinessGrade', confidenceGrade: 'ConfidenceGrade',
  falsifier: 'Claim', timeGate: 'TimeGate', risk: 'Risk', skepticEpisode: 'SkepticEpisode',
  conflictRuling: 'ConflictRuling', climateTarget: 'ClimateTarget', lupineMethod: 'LupineMethod', formalProof: 'FormalProof',
};

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function hydrateFormalProofInventory(source) {
  const hydrated = clone(source);
  const inventorySource = hydrated.formalProof?.inventorySource;
  if (!inventorySource) return hydrated;

  const inventoryPath = path.resolve(ROOT, inventorySource);
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  if (!Number.isSafeInteger(inventory.count) || inventory.count < 1 || inventory.zero_sorry !== true) {
    throw new Error(`invalid generated Lean inventory: ${inventoryPath}`);
  }
  hydrated.formalProof = {
    ...hydrated.formalProof,
    inventoryAsOf: inventory.counted_at,
    theorems: inventory.count,
    sorryCount: 0,
    inventoryRule: inventory.rule,
    inventoryCommit: inventory.source_commit,
  };
  return hydrated;
}

function labelFor(value, id) {
  if (typeof value === 'string') return value;
  return value.name || value.title || value.failureMode || value.test || value.capability || value.event ||
    value.claim || value.case || value.zone || value.spec || value.meaning || value.phase || id;
}

function markerFor(type, value) {
  const serialized = JSON.stringify(value);
  const explicit = MARKERS.find((marker) => serialized.includes(`[${marker}]`));
  if (explicit) return explicit;
  if (type === 'timeGate' || type === 'roadmapPhase' || type === 'climateTarget') return 'FRC';
  if (type === 'acceptanceTest' || type === 'killCriterion' || type === 'falsifier' || /author-proposed/i.test(serialized)) return 'PRP';
  return 'OBS';
}

function readinessFor(value) {
  const annotation = typeof value?.readiness === 'string' ? value.readiness : 'N/A (not readiness-assessed in source ontology)';
  const match = annotation.match(/^([HML])\b/);
  return { grade: match?.[1] || 'N/A', annotation };
}

function confidenceFor(value) {
  const annotation = typeof value?.confidence === 'string'
    ? value.confidence
    : 'N/A (no per-instance confidence grade in source ontology)';
  const match = annotation.match(/^(High|Medium)\b/i);
  const grade = match ? `${match[1][0].toUpperCase()}${match[1].slice(1).toLowerCase()}` : 'N/A';
  return { grade, annotation };
}

function normalizeRelation(row) {
  const relation = clone(row);
  if (relation.name === 'correctedBy') relation.name = 'claim.correctedBy';
  if (relation.name === 'gatedBy') relation.name = 'chain.gatedBy';
  if (row.name === 'corrects' && relation.inverse === 'correctedBy') relation.inverse = 'lever.correctedBy';
  if (row.name === 'gatesOn' && relation.inverse === 'gatedBy') relation.inverse = 'program.gatedBy';
  return relation;
}

export function normalizeOntology(source) {
  source = hydrateFormalProofInventory(source);
  const asOf = source.freshnessLayer.atlasDate;
  const nodes = [];
  const addNode = (section, type, sourceId, value) => {
    const payload = typeof value === 'string' ? { value } : clone(value);
    const readiness = readinessFor(payload);
    const node = {
      ...payload,
      id: `${type}:${sourceId}`,
      sourceId,
      sourceSection: section,
      type,
      label: labelFor(payload, sourceId),
      marker: markerFor(type, payload),
      readiness,
      confidence: confidenceFor(payload),
      asOf,
    };
    nodes.push(node);
    return node;
  };

  for (const [section, [type, idFor]] of Object.entries(COLLECTIONS)) {
    (source[section] || []).forEach((item, index) => addNode(section, type, idFor(item, index), item));
  }
  for (const [section, [type, id]] of Object.entries(SINGLETONS)) addNode(section, type, id, source[section]);
  for (const [group, classNames] of Object.entries(source.superClasses || {})) {
    for (const className of classNames) addNode('superClasses', 'superClass', className, { name: className, group });
  }

  nodes.sort((left, right) => left.id.localeCompare(right.id));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const links = [];
  const unresolvedForeignKeys = [];
  const addLink = (relation, sourceId, targetId, sourceField, sourceValue = null) => {
    if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) {
      unresolvedForeignKeys.push({ source: sourceId, sourceField, value: sourceValue, expectedTarget: targetId });
      return;
    }
    links.push({
      id: `${relation}:${sourceId}->${targetId}:${sourceField}`,
      source: sourceId,
      target: targetId,
      relation,
      sourceField,
      sourceValue,
      provenance: { source: `content/ontology/lupine-ontology.json#${sourceField}`, method: 'declared foreign key', confidence: 'declared' },
    });
  };

  for (const emblem of source.emblems) {
    for (const type of emblem.types) addLink('partOf', `emblem:${emblem.id}`, `errorType:${type}`, 'emblems.types', type);
  }
  for (const material of source.materialClasses) {
    for (const type of material.dominantErrorTypes) addLink('inheritsErrorFrom', `materialClass:${material.id}`, `errorType:${type}`, 'materialClasses.dominantErrorTypes', type);
    for (const chain of Array.isArray(material.chain) ? material.chain : [material.chain]) {
      addLink('partOf', `materialClass:${material.id}`, `discoveryChain:${chain}`, 'chain', chain);
    }
  }
  for (const row of source.scoreboard) {
    for (const type of row.types) addLink('inheritsErrorFrom', `scoreboardRow:SB${row.row}`, `errorType:${type}`, 'scoreboard.types', type);
    addLink('readinessJudgedBy', `scoreboardRow:SB${row.row}`, `readinessGrade:${readinessFor(row).grade}`, 'scoreboard.readiness', row.readiness);
  }
  for (const chain of source.discoveryChains) {
    addLink('readinessJudgedBy', `discoveryChain:${chain.id}`, `readinessGrade:${readinessFor(chain).grade}`, 'discoveryChains.readiness', chain.readiness);
  }
  for (const acceptance of source.acceptanceTests) {
    addLink('chain.gatedBy', `discoveryChain:${acceptance.chain}`, `acceptanceTest:${acceptance.id}`, 'acceptanceTests.chain', acceptance.chain);
  }
  for (const node of nodes) {
    const superClass = SUPER_CLASS_BY_TYPE[node.type];
    if (superClass && nodeIds.has(`superClass:${superClass}`)) addLink('isA', node.id, `superClass:${superClass}`, `${node.sourceSection}.type`, superClass);
    if (node.type !== 'epistemicMarker' && nodeIds.has(`epistemicMarker:${node.marker}`)) {
      addLink('markedAs', node.id, `epistemicMarker:${node.marker}`, `${node.sourceSection}.marker`, node.marker);
    }
  }

  links.sort((left, right) => left.id.localeCompare(right.id));
  unresolvedForeignKeys.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  const relations = source.relations.map(normalizeRelation);
  const edgeLabels = [...new Set(relations.flatMap((relation) => [relation.name, relation.inverse]).filter(Boolean))].sort();
  const typeCounts = Object.fromEntries([...new Set(nodes.map((node) => node.type))].sort().map((type) => [
    type, nodes.filter((node) => node.type === type).length,
  ]));
  const nextAnnotation = source.freshnessLayer.nextScheduledReverification;

  return {
    schema: 'lupine-ontology-v1',
    source: 'content/ontology/lupine-ontology.json',
    sourceTopLevelKeys: Object.keys(source),
    metadata: clone(source.metadata),
    freshness: {
      atlasDate: asOf,
      nextReverification: nextAnnotation.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || nextAnnotation,
      nextReverificationAnnotation: nextAnnotation,
      proofPackDate: source.metadata.corpus['doc:PP'].date,
      proofPackStatus: source.metadata.corpus['doc:PP'].status,
      verified: clone(source.freshnessLayer.verified),
    },
    relations,
    edgeLabels,
    exceptions: [
      { code: 'superclass-figure-count', detail: 'JSON contains 37 superclasses and is normative; atlas figure 1 reports 33.' },
      { code: 'meta-chain-no-material-class', subject: 'discoveryChain:C10', detail: 'C10 is a meta-chain and intentionally has no material-class foreign key.' },
      { code: 'discovery-chain-class-free-text', detail: 'discoveryChains.class is descriptive text; material-class links are resolved from materialClasses.chain.' },
    ],
    unresolvedForeignKeys,
    stats: {
      nodes: nodes.length,
      links: links.length,
      relationDefinitions: relations.length,
      superClassCount: Object.values(source.superClasses).flat().length,
      typeCounts,
    },
    nodes,
    links,
  };
}

export function writeOntology({ sourcePath = DEFAULT_SOURCE, outputPath = DEFAULT_OUTPUT } = {}) {
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const ontology = normalizeOntology(source);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(ontology, null, 2)}\n`);
  return ontology;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ontology = writeOntology();
  console.log(`[ontology] wrote ${path.relative(process.cwd(), DEFAULT_OUTPUT)} (${ontology.stats.nodes} nodes, ${ontology.stats.links} links)`);
}
