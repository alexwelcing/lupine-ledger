import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildHomeGraph } from '../src/knowledgeHomeModel.js';
import { InkLayout, inkGradientStops, inkSvgMarkup } from '../src/lupiInk.js';
import { MOLECULE_OPENING, MOLECULE_RADIUS, buildKnowledgeMolecule, moleculePositions, moleculeRadii } from '../src/knowledgeMoleculeModel.js';
import { createKnowledgeMolecule } from '../src/knowledgeMolecule.js';

const nodes = [
  { id: 'a', title: 'Potential validation', categoryLabel: 'Evidence', connectionCount: 0, date: { ms: 1, value: '2026-10-28', kind: 'Document date' } },
  { id: 'b', title: 'An interatomic potential', categoryLabel: 'Methods', connectionCount: 8, date: { ms: 3, value: '2026-10-30', kind: 'Document date' } },
  { id: 'c', title: 'Reference data', categoryLabel: 'Evidence', connectionCount: 4, date: null },
  { id: 'd', title: 'Independent reference', categoryLabel: 'Evidence', connectionCount: 0, date: null },
];
const links = [
  { id: 'a-b', source: 'a', target: 'b', relation: 'related', evidence: 'validation, potentials', provenance: 'shared-tags' },
  { id: 'b-c', source: 'b', target: 'c', relation: 'related', evidence: 'reference, methods' },
];

test('molecule retains all articles and exact supplied relationship records, including parallel relations', () => {
  const original = JSON.stringify({ nodes, links });
  const input = [...links, { ...links[0], id: 'a-b-distinct', relation: 'cites' }, { source: 'a', target: 'missing' }, { source: 'a', target: 'a' }];
  const result = buildKnowledgeMolecule(nodes, input);
  assert.deepEqual(result.nodes.map(n => n.id), ['a', 'b', 'c', 'd']);
  assert.equal(result.links.length, 3); assert.equal(result.model.b.length, 6);
  for (const [i, edge] of result.links.entries()) {
    assert.equal(result.nodes[result.model.b[i * 2]].id, edge.source);
    assert.equal(result.nodes[result.model.b[i * 2 + 1]].id, edge.target);
    assert.equal(input.find(e => e.id === edge.id).evidence, edge.evidence);
  }
  assert.equal(JSON.stringify({ nodes, links }), original);
  assert.equal(result.model.k.length, nodes.length); // isolated d is retained
});

test('3D geometry depends on topology, is deterministic under input reorder and stays fixed across metrics', () => {
  const original = buildKnowledgeMolecule(nodes, links);
  assert.deepEqual(buildKnowledgeMolecule([...nodes].reverse(), [...links].reverse()).positions, original.positions);
  for (const mode of ['equal', 'recent', 'connections', 'category', 'status']) {
    const result = buildKnowledgeMolecule(nodes, links, mode, () => '#71c6bf');
    assert.deepEqual(result.positions, original.positions);
    assert.equal(result.model.radius, original.model.radius);
    assert.deepEqual(result.model.opening, MOLECULE_OPENING);
  }
  for (let axis = 0; axis < 3; axis++) assert(new Set(original.positions.filter((_, i) => i % 3 === axis)).size > 1);
  assert.notDeepEqual(moleculePositions(nodes, []).positions, original.positions);
  const overwritten = moleculePositions(nodes, links); overwritten.positions[0] = 999;
  assert.notEqual(moleculePositions(nodes, links).positions[0], 999); // cache cannot be poisoned by consumers
});

test('metrics scale actual spheres and unknown dates keep their neutral radius', () => {
  assert(moleculeRadii(nodes, 'connections')[1] > moleculeRadii(nodes, 'connections')[0]);
  assert(moleculeRadii(nodes, 'recent')[1] > moleculeRadii(nodes, 'recent')[0]);
  assert.equal(moleculeRadii(nodes, 'recent')[2], MOLECULE_RADIUS);
  assert.deepEqual(moleculeRadii(nodes, 'category'), Array(nodes.length).fill(MOLECULE_RADIUS));
  assert(moleculeRadii([{ connectionCount: NaN }, { connectionCount: -1 }], 'connections').every(Number.isFinite));
});

test('empty and singleton models are finite; canonical sphere bound contains every metric at any pose', () => {
  for (const input of [[], nodes.slice(0, 1), nodes]) for (const mode of ['equal', 'recent', 'connections']) {
    const { model } = buildKnowledgeMolecule(input, links, mode), layout = new InkLayout(model, { fill: 0.86 });
    assert(model.p.every(Number.isFinite)); assert(Number.isFinite(model.radius));
    for (const azimuth of [-Math.PI, -1, 0, 1, Math.PI]) for (const elevation of [-1.2, 0, 1.2]) {
      layout.update({ azimuth, elevation });
      for (let i = 0; i < input.length; i++) {
        assert(layout.cx[i] - layout.r[i] > 0); assert(layout.cx[i] + layout.r[i] < 200);
        assert(layout.cy[i] - layout.r[i] > 0); assert(layout.cy[i] + layout.r[i] < 200);
      }
    }
  }
});

test('unchanged Lupi projection agrees with the original TypeScript source golden sample', () => {
  // Calculated from Lupi ink.ts at 146ee91d, SHA256 5445ec93...8563d69dad.
  const model = { p: [-2, 0, 1, 1, 1, -2, 0, -1, 0], k: [0, 1, 0], kinds: [{ s: 'a', c: '#a9a2e6', r: 1.25 }, { s: 'b', c: '#71c6bf', r: 0.85 }], b: [0, 1, 1, 2], radius: 4, detents: [], opening: MOLECULE_OPENING };
  const layout = new InkLayout(model); layout.update(MOLECULE_OPENING);
  const golden = { cx: [50.81308153579887, 139.8321720249695, 100], cy: [99.80879309534276, 71.76841425410238, 121.36943544674466], r: [26.93046650447882, 17.938200361790933, 26.819263555465078], opacity: [0.7074251301358444, 0.6348249364434297, 0.6927665595840327], bondOpacity: [0.4944224528223332, 0.48582949767127115] };
  for (const [key, values] of Object.entries(golden)) values.forEach((value, i) => assert(Math.abs(layout[key][i] - value) < 1e-11));
  assert.deepEqual(layout.order, [1, 4, 3, 2, 0]);
  assert(Math.abs(layout.lightX - 0.5459066396908202) < 1e-12); assert(Math.abs(layout.lightY - 0.34317755884044493) < 1e-12);
  assert.equal(inkGradientStops('#a9a2e6').length, 4);
  assert(inkSvgMarkup(model, MOLECULE_OPENING, { idPrefix: 'golden', title: 'Lupi specimen' }).includes('radialGradient'));
});

test('real Library topology remains complete, volumetric, fitted and visibly shaded at phone size', () => {
  const source = JSON.parse(fs.readFileSync(new URL('../dist/data/library.json', import.meta.url)));
  const graph = JSON.parse(fs.readFileSync(new URL('../dist/data/knowledge-graph.json', import.meta.url)));
  const home = buildHomeGraph(source, graph), molecule = buildKnowledgeMolecule(home.nodes, home.links);
  assert.equal(molecule.nodes.length, home.nodes.length); assert.equal(molecule.links.length, home.links.length);
  assert.equal(new Set(molecule.nodes.map(n => n.id)).size, home.nodes.length);
  const layout = new InkLayout(molecule.model, { fill: 0.86 }); layout.update(MOLECULE_OPENING);
  assert(Math.min(...layout.r) * 370 / 200 > 6); // radius, not a tiny graph dot
  const edgePairs = new Set(molecule.links.map(e => [e.source, e.target].sort().join('\0')));
  let near = 0, nearCount = 0, far = 0, farCount = 0;
  for (let i = 0; i < molecule.nodes.length; i++) for (let j = i + 1; j < molecule.nodes.length; j++) {
    const distance = Math.hypot(...molecule.positions.slice(i * 3, i * 3 + 3).map((value, k) => value - molecule.positions[j * 3 + k]));
    assert(distance > 3.7); // independent of the current metric, atoms fit in 3D
    if (edgePairs.has([molecule.nodes[i].id, molecule.nodes[j].id].sort().join('\0'))) { near += distance; nearCount++; }
    else { far += distance; farCount++; }
  }
  assert(near / nearCount < far / farCount * 0.6);
});

class Element {
  constructor(tag, doc) { this.tag = tag; this.ownerDocument = doc; this.children = []; this.attributes = {}; this.style = {}; this.parentNode = null; this.clientWidth = 390; this.clientHeight = 370; this.textContent = ''; this.captures = new Set(); }
  append(...items) {
    for (const item of items) {
      if (item.parentNode) {
        item.parentNode.children = item.parentNode.children.filter(child => child !== item);
        if (this.ownerDocument.activeElement === item) this.ownerDocument.activeElement = null;
      }
      item.parentNode = this; this.children.push(item);
    }
  }
  replaceChildren(...items) { for (const item of this.children) item.parentNode = null; this.children = []; this.append(...items); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  contains(item) { return this === item || this.children.some(child => child.contains(item)); }
  focus() { this.ownerDocument.activeElement = this; }
  getBoundingClientRect() { return { width: this.clientWidth, height: this.clientHeight }; }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
}
function fixture() {
  const doc = { activeElement: null, createElementNS: (_ns, tag) => new Element(tag, doc) };
  const host = new Element('div', doc), selected = [], controller = createKnowledgeMolecule(host, { onSelect: (...args) => selected.push(args) });
  controller.update({ nodes, links, mode: 'category', colorFor: n => n.categoryLabel === 'Evidence' ? '#71c6bf' : '#a9a2e6' });
  const svg = host.children[0], atom = id => svg.children.find(n => n.getAttribute('data-article-id') === id);
  const event = (target, changes = {}) => ({ target, pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0, clientX: 100, clientY: 100, preventDefault() { this.prevented = true; }, stopPropagation() {}, ...changes });
  return { doc, host, selected, controller, svg, atom, event };
}

test('article atoms preserve accessible titles and selection joins; metric and selection updates keep pose and focus', () => {
  const f = fixture(), a = f.atom('a');
  assert.equal(a.getAttribute('role'), 'button'); assert.equal(a.getAttribute('tabindex'), '0');
  assert(a.getAttribute('aria-label').includes(nodes[0].title)); assert.equal(a.children[0].tag, 'title');
  a.onkeydown(f.event(a, { key: 'Enter' })); a.onkeydown(f.event(a, { key: ' ' }));
  assert.deepEqual(f.selected, [['a', true], ['a', true]]);
  a.focus(); f.svg.onkeydown(f.event(a, { key: 'ArrowLeft' }));
  const yaw = f.svg.getAttribute('data-azimuth'), x = a.children[2].getAttribute('cx');
  f.controller.update({ nodes, links, mode: 'connections', selected: 'a' });
  assert.equal(f.atom('a'), a); assert.equal(a.getAttribute('aria-pressed'), 'true');
  assert.equal(f.svg.getAttribute('data-azimuth'), yaw); assert.equal(a.children[2].getAttribute('cx'), x);
  assert.equal(f.doc.activeElement, a);
  f.controller.reset(); assert.equal(f.svg.getAttribute('data-azimuth'), String(MOLECULE_OPENING.azimuth));
  f.controller.destroy(); assert.equal(f.host.children.length, 0); assert.equal(f.svg.onpointerdown, null); assert.equal(a.onclick, null);
});

test('tap uses original article target; dragging and scrolling do not accidentally select', () => {
  const f = fixture(), a = f.atom('a'), sphere = a.children[2];
  f.svg.onpointerdown(f.event(sphere)); f.svg.onpointerup(f.event(f.svg));
  a.onclick(f.event(a, { detail: 1 })); // native click following pointerup is suppressed
  assert.deepEqual(f.selected, [['a', false]]);
  f.svg.onpointerdown(f.event(sphere)); const move = f.event(f.svg, { clientX: 145 }); f.svg.onpointermove(move);
  assert.equal(move.prevented, true); assert.equal(f.svg.hasPointerCapture(1), true);
  f.svg.onpointerup(f.event(f.svg, { clientX: 145 })); a.onclick(f.event(a, { detail: 1 }));
  assert.equal(f.selected.length, 1); assert.notEqual(f.svg.getAttribute('data-azimuth'), String(MOLECULE_OPENING.azimuth));
  f.svg.onpointerdown(f.event(sphere)); const scroll = f.event(f.svg, { clientY: 150 }); f.svg.onpointermove(scroll);
  assert.equal(scroll.prevented, undefined); assert.equal(f.svg.hasPointerCapture(1), false);
  f.svg.onpointerup(f.event(f.svg, { clientY: 150 })); assert.equal(f.selected.length, 1);
  assert.equal(f.svg.style.touchAction, 'pan-y');
  f.controller.destroy();
});

test('cancellation, lost capture and leaving the stage clear the gesture without click or stuck state', () => {
  const f = fixture(), a = f.atom('a');
  for (const cancel of ['onpointercancel', 'onlostpointercapture', 'onpointerleave']) {
    f.svg.onpointerdown(f.event(a)); f.svg[cancel](f.event(f.svg));
    a.onclick(f.event(a, { detail: 1 })); assert.equal(f.selected.length, 0);
  }
  f.svg.onpointerdown(f.event(a)); f.svg.onpointerup(f.event(f.svg, { clientX: 140 }));
  assert.equal(f.selected.length, 0); // missed move delivery cannot become a tap
  f.svg.onpointerdown(f.event(a)); f.svg.onpointerup(f.event(f.svg));
  assert.deepEqual(f.selected, [['a', false]]); // next genuine tap works
  f.controller.destroy();
});

test('selection is data, never markup; instances have unique gradients and teardown makes retained handlers inert', () => {
  const f = fixture(), g = fixture(), badTitle = '<img src=x onerror=alert(1)>';
  f.controller.update({ nodes: [{ ...nodes[0], title: badTitle }], links: [] });
  const a = f.atom('a'); assert.equal(a.children[0].textContent, `${badTitle} — Evidence`);
  assert.notEqual(f.svg.children[0].children[0].getAttribute('id'), g.svg.children[0].children[0].getAttribute('id'));
  const click = a.onclick; f.controller.destroy(); click({ detail: 0 }); assert.equal(f.selected.length, 0);
  f.controller.update({ nodes, links }); assert.equal(f.host.children.length, 0); g.controller.destroy();
});
