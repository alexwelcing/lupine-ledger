/** Library articles as a Lupi specimen: geometry is presentation, never chemistry. */
export const MOLECULE_OPENING = Object.freeze({ azimuth: 0.48, elevation: 0.24 });
export const MOLECULE_RADIUS = 1.25;
const MAX_RADIUS = 1.85;
const geometryCache = new Map();
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const pointKey = p => JSON.stringify(p);
const endpoint = value => typeof value === 'string' ? value : value?.id;
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Preserve every valid supplied article relation, including parallel relation records. */
export function moleculeTopology(nodes = [], links = []) {
  const ordered = [...nodes].sort((a, b) => compare(a.id, b.id));
  const index = new Map(ordered.map((node, i) => [node.id, i]));
  const edges = links.map((link, inputIndex) => ({ ...link, source: endpoint(link.source), target: endpoint(link.target), inputIndex }))
    .filter(link => index.has(link.source) && index.has(link.target) && link.source !== link.target)
    .sort((a, b) => compare(a.source, b.source) || compare(a.target, b.target) || compare(String(a.id || a.relation || ''), String(b.id || b.relation || '')) || a.inputIndex - b.inputIndex);
  return { nodes: ordered, links: edges, index };
}

/**
 * Deterministic 3D spring embedding. Only supplied relationships attract;
 * repulsion and centering are display forces and create no additional edges.
 * Eight small geometries are cached. Larger graphs keep all records and use
 * bounded repulsion samples instead of quadratic all-pairs work.
 */
export function moleculePositions(nodes = [], links = []) {
  const topology = moleculeTopology(nodes, links);
  const { nodes: ordered, links: edges, index } = topology;
  const n = ordered.length;
  // Parallel relation metadata does not change the spatial connection strength.
  const uniquePairs = new Map();
  for (const edge of edges) {
    const a = index.get(edge.source), b = index.get(edge.target);
    const pair = a < b ? [a, b] : [b, a];
    uniquePairs.set(pointKey(pair), pair);
  }
  const pairs = [...uniquePairs.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const key = JSON.stringify([ordered.map(node => node.id), pairs]);
  const cached = geometryCache.get(key);
  if (cached) return { ...topology, positions: cached.slice() };
  if (!n) return { ...topology, positions: [] };
  const positions = new Float64Array(n * 3), velocity = new Float64Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const initialRadius = Math.max(1.4, Math.cbrt(n) * 1.8);
  for (let i = 0; i < n; i++) {
    const y = 1 - 2 * (i + 0.5) / n;
    const angle = golden * i + (hash(ordered[i].id) % 997) / 997 * 0.45;
    const radial = Math.sqrt(1 - y * y);
    const r = initialRadius * (0.72 + 0.28 * ((hash(ordered[i].id) % 313) / 313));
    positions.set([Math.cos(angle) * radial * r, y * r, Math.sin(angle) * radial * r], i * 3);
  }
  const degree = new Uint32Array(n);
  for (const [a, b] of pairs) { degree[a]++; degree[b]++; }
  const repulse = (a, b) => {
    const ai = a * 3, bi = b * 3;
    let dx = positions[bi] - positions[ai], dy = positions[bi + 1] - positions[ai + 1], dz = positions[bi + 2] - positions[ai + 2];
    let d = Math.hypot(dx, dy, dz);
    if (d < 0.00001) { dx = 0.31; dy = 0.53; dz = 0.79; d = 1; }
    const f = Math.min(1.3, 2.8 / (d * d)) + Math.max(0, 3.75 - d) * 0.6;
    for (const [axis, delta] of [[0, dx], [1, dy], [2, dz]]) {
      const impulse = delta / d * f;
      velocity[ai + axis] -= impulse; velocity[bi + axis] += impulse;
    }
  };
  for (let step = 0; step < 160; step++) {
    for (let i = 0; i < positions.length; i++) velocity[i] = velocity[i] * 0.62 - positions[i] * 0.016;
    if (n <= 256) {
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) repulse(a, b);
    } else {
      // 32 deterministic samples per article, rotating each step. No nodes omitted.
      for (let a = 0; a < n; a++) for (let sample = 1; sample <= 32; sample++) {
        const b = (a + 1 + ((sample * 104729 + step * 37) % (n - 1))) % n;
        repulse(a, b);
      }
    }
    for (const [a, b] of pairs) {
      const ai = a * 3, bi = b * 3;
      const dx = positions[bi] - positions[ai], dy = positions[bi + 1] - positions[ai + 1], dz = positions[bi + 2] - positions[ai + 2];
      const d = Math.max(0.001, Math.hypot(dx, dy, dz));
      const f = (d - 3.9) * 0.115 / Math.sqrt(Math.max(1, Math.min(degree[a], degree[b])));
      for (const [axis, delta] of [[0, dx], [1, dy], [2, dz]]) {
        const impulse = delta / d * f;
        velocity[ai + axis] += impulse; velocity[bi + axis] -= impulse;
      }
    }
    const cooling = 0.75 - step / 250;
    for (let i = 0; i < positions.length; i++) positions[i] += Math.max(-0.65, Math.min(0.65, velocity[i])) * cooling;
  }
  // Match Lupi's bounds-centered camera target, independent of metric or color.
  for (let axis = 0; axis < 3; axis++) {
    let lo = Infinity, hi = -Infinity;
    for (let i = axis; i < positions.length; i += 3) { lo = Math.min(lo, positions[i]); hi = Math.max(hi, positions[i]); }
    const center = (lo + hi) / 2;
    for (let i = axis; i < positions.length; i += 3) positions[i] -= center;
  }
  const result = Array.from(positions);
  if (n <= 4096 && key.length <= 100000) {
    if (geometryCache.size >= 8) geometryCache.delete(geometryCache.keys().next().value);
    geometryCache.set(key, result.slice());
  }
  return { ...topology, positions: result };
}

/** Metric changes alter radii only; missing document dates retain neutral size. */
export function moleculeRadii(nodes, mode = 'equal') {
  const dated = nodes.map(node => node.date?.ms).filter(Number.isFinite);
  let oldest = Infinity, newest = -Infinity, maxDegree = 1;
  for (const date of dated) { oldest = Math.min(oldest, date); newest = Math.max(newest, date); }
  for (const node of nodes) maxDegree = Math.max(maxDegree, finite(node.connectionCount));
  return nodes.map(node => mode === 'connections'
    ? 0.85 + Math.sqrt(Math.max(0, finite(node.connectionCount)) / maxDegree)
    : mode === 'recent' && Number.isFinite(node.date?.ms)
      ? newest === oldest ? 1.6 : 0.85 + (node.date.ms - oldest) / (newest - oldest)
      : MOLECULE_RADIUS);
}

/** Adapter into the unchanged Lupi InkModel; indices stay joined to article ids. */
export function buildKnowledgeMolecule(nodes = [], links = [], mode = 'equal', colorFor = () => '#a9a2e6') {
  const geometry = moleculePositions(nodes, links);
  const radii = moleculeRadii(geometry.nodes, mode);
  let radius = 1.8;
  for (let i = 0; i < geometry.nodes.length; i++) radius = Math.max(radius, Math.hypot(...geometry.positions.slice(i * 3, i * 3 + 3)) + MAX_RADIUS);
  const model = {
    p: geometry.positions,
    k: geometry.nodes.map((_, i) => i),
    // Each article gets its own radius; colors remain supplied taxonomy, not element CPK.
    kinds: geometry.nodes.map((node, i) => ({ s: `article-${i}`, c: /^#[\da-f]{6}$/i.test(colorFor(node)) ? colorFor(node) : '#a9a2e6', r: radii[i] })),
    b: geometry.links.flatMap(edge => [geometry.index.get(edge.source), geometry.index.get(edge.target)]),
    radius, detents: [], opening: { ...MOLECULE_OPENING },
  };
  return { ...geometry, model };
}
