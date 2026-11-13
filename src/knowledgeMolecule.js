import { InkLayout, INK_VIEW, inkGradientStops } from './lupiInk.js';
import { buildKnowledgeMolecule, MOLECULE_OPENING } from './knowledgeMoleculeModel.js';

let instance = 0;
const ns = 'http://www.w3.org/2000/svg';
const number = value => Number(value.toFixed(3));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const wrap = value => ((value + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
const now = () => globalThis.performance?.now?.() ?? Date.now();

/**
 * The Library's selectable Lupi molecular specimen. No network, animation
 * timer, global event listener, element inference or scientific coordinate IO.
 */
export function createKnowledgeMolecule(container, { onSelect = () => {} } = {}) {
  const doc = container.ownerDocument || document;
  const make = (tag, attrs = {}) => {
    const element = doc.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, String(value));
    return element;
  };
  const prefix = `library-molecule-${++instance}`;
  const svg = make('svg', {
    class: 'knowledge-molecule', viewBox: `0 0 ${INK_VIEW} ${INK_VIEW}`,
    width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet', role: 'group', tabindex: '0',
    'aria-label': 'Research molecule. Drag to rotate; arrow keys turn the view. Select an article to read its connections.',
  });
  svg.style.touchAction = 'pan-y';
  svg.style.userSelect = 'none';
  container.replaceChildren(svg);
  let pose = { ...MOLECULE_OPENING }, disposed = false, selected = null;
  let geometry = null, layout = null, topologyKey = null, gesture = null, suppressClickUntil = 0;
  let atoms = [], bonds = [], gradients = [], shownOrder = [];
  const isArticle = target => {
    for (let element = target; element && element !== svg; element = element.parentNode || element.parent) {
      const id = element.getAttribute?.('data-article-id') ?? element.attributes?.['data-article-id'];
      if (typeof id === 'string') return id;
    }
    return null;
  };
  const select = (id, keyboard) => { if (!disposed && id != null) onSelect(id, keyboard); };

  function rebuild() {
    const defs = make('defs');
    atoms = []; bonds = []; gradients = []; shownOrder = [];
    for (let i = 0; i < geometry.nodes.length; i++) {
      const node = geometry.nodes[i], gradient = make('radialGradient', { id: `${prefix}-atom-${i}`, cx: 0.5, cy: 0.5, r: 0.5 });
      for (let stop = 0; stop < 4; stop++) gradient.append(make('stop'));
      defs.append(gradient); gradients.push(gradient);
      const group = make('g', { role: 'button', tabindex: '0', 'data-article-id': node.id, 'aria-pressed': 'false', class: 'knowledge-molecule-atom' });
      const title = make('title');
      const hit = make('circle', { class: 'knowledge-molecule-hit', fill: 'transparent', 'pointer-events': 'all', stroke: 'none' });
      const sphere = make('circle', { class: 'knowledge-molecule-sphere', fill: `url(#${prefix}-atom-${i})`, stroke: '#141d20', 'stroke-width': 0.28 });
      const ring = make('circle', { class: 'knowledge-molecule-ring', fill: 'none', stroke: '#edf9bd', 'stroke-width': 0.65, 'pointer-events': 'none', opacity: 0 });
      group.append(title, hit, sphere, ring);
      group.onclick = event => {
        event?.stopPropagation?.();
        if (event?.detail !== 0 && now() < suppressClickUntil) { suppressClickUntil = 0; return; }
        select(node.id, event?.detail === 0);
      };
      group.onkeydown = event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault(); event.stopPropagation?.();
        select(node.id, true);
      };
      atoms.push({ group, title, hit, sphere, ring });
    }
    for (let i = 0; i < geometry.links.length; i++) {
      const edge = geometry.links[i], title = make('title');
      title.textContent = `${edge.label || edge.relation || 'Recorded relationship'}${edge.evidence ? `: ${edge.evidence}` : ''}`;
      const group = make('g', { class: 'knowledge-molecule-bond', 'data-source': edge.source, 'data-target': edge.target, 'data-relation': edge.relation || '', 'aria-hidden': 'true', 'pointer-events': 'none' });
      const body = make('line', { class: 'knowledge-molecule-bond-body', stroke: '#718a91', 'stroke-linecap': 'round' });
      const light = make('line', { class: 'knowledge-molecule-bond-light', stroke: '#e1eee5', 'stroke-linecap': 'round' });
      group.append(title, body, light); bonds.push({ group, body, light });
    }
    svg.replaceChildren(defs);
  }

  function paint() {
    if (!layout || disposed) return;
    layout.update(pose);
    const connected = new Set([selected]);
    for (const edge of geometry.links) if (edge.source === selected || edge.target === selected) { connected.add(edge.source); connected.add(edge.target); }
    for (let i = 0; i < atoms.length; i++) {
      const node = geometry.nodes[i], atom = atoms[i], isSelected = node.id === selected;
      const muted = selected != null && !connected.has(node.id);
      atom.group.setAttribute('class', `knowledge-molecule-atom${isSelected ? ' is-selected' : ''}${muted ? ' is-muted' : ''}`);
      atom.group.setAttribute('aria-pressed', String(isSelected));
      atom.group.setAttribute('aria-label', `${node.title || node.id}; ${node.connectionCount || 0} connection${node.connectionCount === 1 ? '' : 's'}${node.date ? `; ${node.date.kind || 'Document date'} ${String(node.date.value || '').slice(0, 10)}` : ''}`);
      atom.title.textContent = `${node.title || node.id}${node.categoryLabel ? ` — ${node.categoryLabel}` : ''}`;
      atom.group.setAttribute('opacity', number((muted ? 0.38 : 1) * layout.opacity[i]));
      // Lupi shading already moves the focus with the world-fixed key light.
      gradients[i].setAttribute('fx', number(layout.lightX)); gradients[i].setAttribute('fy', number(layout.lightY));
      for (const [j, [offset, color]] of inkGradientStops(geometry.model.kinds[i].c).entries()) {
        gradients[i].children[j].setAttribute('offset', offset); gradients[i].children[j].setAttribute('stop-color', color);
      }
      for (const part of [atom.hit, atom.sphere, atom.ring]) {
        part.setAttribute('cx', number(layout.cx[i])); part.setAttribute('cy', number(layout.cy[i]));
      }
      atom.sphere.setAttribute('r', number(layout.r[i]));
      atom.ring.setAttribute('r', number(layout.r[i] + 0.95)); atom.ring.setAttribute('opacity', isSelected ? '1' : '0');
      // Transparent hit area improves touch without changing the metric sphere.
      atom.hit.setAttribute('r', number(Math.max(layout.r[i] + 0.9, 4.4)));
    }
    for (let i = 0; i < bonds.length; i++) {
      const edge = geometry.links[i], bond = bonds[i], active = edge.source === selected || edge.target === selected;
      const muted = selected != null && !active;
      bond.group.setAttribute('class', `knowledge-molecule-bond${active ? ' is-connected' : ''}${muted ? ' is-muted' : ''}`);
      bond.group.setAttribute('opacity', number((muted ? 0.2 : 1) * Math.min(1, layout.bondOpacity[i] + 0.12)));
      const width = Math.max(0.7, layout.bondWidth * (active ? 2.7 : 2.2));
      for (const part of [bond.body, bond.light]) {
        part.setAttribute('x1', number(layout.x1[i])); part.setAttribute('y1', number(layout.y1[i]));
        part.setAttribute('x2', number(layout.x2[i])); part.setAttribute('y2', number(layout.y2[i]));
      }
      bond.body.setAttribute('stroke-width', number(width)); bond.body.setAttribute('stroke', active ? '#b2c8a7' : '#718a91');
      bond.light.setAttribute('stroke-width', number(width * 0.24)); bond.light.setAttribute('opacity', 0.65);
    }
    // Reorder only when depth order changes. Keep focus on its original article.
    if (layout.order.some((item, i) => item !== shownOrder[i]) || shownOrder.length !== layout.order.length) {
      const focus = doc.activeElement, hadFocus = focus && svg.contains(focus);
      for (const item of layout.order) svg.append(item < atoms.length ? atoms[item].group : bonds[item - atoms.length].group);
      shownOrder = layout.order.slice();
      if (hadFocus && doc.activeElement !== focus) focus.focus?.({ preventScroll: true });
    }
    svg.setAttribute('data-azimuth', number(pose.azimuth)); svg.setAttribute('data-elevation', number(pose.elevation));
  }

  function releaseCapture(id) {
    try { if (svg.hasPointerCapture?.(id)) svg.releasePointerCapture?.(id); } catch { /* An ended/cancelled browser gesture may already have released it. */ }
  }
  svg.onpointerdown = event => {
    if (disposed || gesture || event.isPrimary === false || (event.button != null && event.button !== 0)) return;
    suppressClickUntil = 0;
    gesture = { id: event.pointerId, article: isArticle(event.target), type: event.pointerType, x: event.clientX, y: event.clientY, azimuth: pose.azimuth, elevation: pose.elevation, state: 'press' };
    // Wait for horizontal intention before capture so a phone can scroll.
  };
  svg.onpointermove = event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (gesture.state === 'press') {
      if (gesture.type === 'touch' && Math.abs(dy) > 7 && Math.abs(dy) > Math.abs(dx) * 1.1) gesture.state = 'scroll';
      else if (Math.abs(dx) > 5 || (gesture.type !== 'touch' && Math.abs(dy) > 5)) {
        gesture.state = 'drag';
        try { svg.setPointerCapture?.(event.pointerId); } catch { /* Pointer may have ended between platform deliveries. */ }
      }
    }
    if (gesture.state !== 'drag') return;
    event.preventDefault?.();
    const bounds = svg.getBoundingClientRect?.();
    const width = Math.max(200, Math.min(bounds?.width || container.clientWidth || 400, bounds?.height || container.clientHeight || 440));
    pose.azimuth = wrap(gesture.azimuth - dx / width * Math.PI * 2);
    pose.elevation = gesture.type === 'touch' ? gesture.elevation : clamp(gesture.elevation + dy / width * Math.PI, -1.2, 1.2);
    paint();
  };
  svg.onpointerup = event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const completed = gesture;
    gesture = null; suppressClickUntil = now() + 600;
    releaseCapture(event.pointerId);
    const travel = Math.hypot((event.clientX ?? completed.x) - completed.x, (event.clientY ?? completed.y) - completed.y);
    if (completed.state === 'press' && travel <= 8) select(completed.article, false);
  };
  const cancel = event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    gesture = null; suppressClickUntil = now() + 600;
    releaseCapture(event.pointerId);
  };
  svg.onpointercancel = cancel; svg.onlostpointercapture = cancel;
  svg.onpointerleave = event => { if (gesture && gesture.state !== 'drag') cancel(event); };
  svg.onclick = () => { if (now() < suppressClickUntil) suppressClickUntil = 0; };
  svg.onkeydown = event => {
    const steps = { ArrowLeft: [0.16, 0], ArrowRight: [-0.16, 0], ArrowUp: [0, 0.12], ArrowDown: [0, -0.12] };
    if (event.key === 'Home') { event.preventDefault(); pose = { ...MOLECULE_OPENING }; paint(); return; }
    const step = steps[event.key]; if (!step) return;
    event.preventDefault(); pose.azimuth = wrap(pose.azimuth + step[0]); pose.elevation = clamp(pose.elevation + step[1], -1.2, 1.2); paint();
  };

  return {
    update({ nodes = [], links = [], mode = 'equal', selected: nextSelected = null, colorFor } = {}) {
      if (disposed) return;
      geometry = buildKnowledgeMolecule(nodes, links, mode, colorFor);
      selected = geometry.index.has(nextSelected) ? nextSelected : null;
      const nextKey = JSON.stringify([geometry.nodes.map(node => node.id), geometry.links.map(edge => [edge.source, edge.target, edge.id, edge.relation, edge.evidence, edge.label])]);
      layout = new InkLayout(geometry.model, { fill: 0.86 });
      if (nextKey !== topologyKey) {
        if (gesture) { const id = gesture.id; gesture = null; releaseCapture(id); suppressClickUntil = now() + 600; }
        topologyKey = nextKey; rebuild();
      }
      svg.setAttribute('aria-label', `${geometry.nodes.length} article${geometry.nodes.length === 1 ? '' : 's'}, ${geometry.links.length} recorded relationship${geometry.links.length === 1 ? '' : 's'}. Drag to rotate; use arrow keys or Home. Select an article to explore.`);
      paint();
    },
    reset() {
      if (disposed) return;
      if (gesture) { const id = gesture.id; gesture = null; releaseCapture(id); }
      pose = { ...MOLECULE_OPENING }; paint();
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      if (gesture) { const id = gesture.id; gesture = null; releaseCapture(id); }
      for (const name of ['onpointerdown', 'onpointermove', 'onpointerup', 'onpointercancel', 'onlostpointercapture', 'onpointerleave', 'onclick', 'onkeydown']) svg[name] = null;
      for (const atom of atoms) { atom.group.onclick = null; atom.group.onkeydown = null; }
      container.replaceChildren(); atoms = []; bonds = []; gradients = []; geometry = layout = null;
    },
  };
}
