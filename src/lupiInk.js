/**
 * Lupi Ink renderer — project-owned source reuse, AGPL-3.0-or-later.
 * Source: https://github.com/alexwelcing/Lupi/blob/146ee91d16d175d4f0cc8ad24f296e48dd430c4d/packages/ui/src/moleculePage/ink.ts
 * Source SHA-256: 5445ec93dce19eaa709636d08bbdd96c4633be53e89fce537ea9778563d69dad
 * Transpiled with TypeScript 5.1.6 (ES2022); projection/lighting math unchanged.
 * See docs/lupi-molecule-renderer.md and the repository LICENSE.
 */
/**
 * ink.ts — the Lupi ink drawing of any small molecule, as numbers.
 *
 * The home hero's buckyball (landing/hero/buckyStage.ts), generalised: atoms
 * as circles shaded by one radial gradient per element (CPK colour, lit by
 * the viewer's world-fixed key light), bonds as ink lines, all projected from
 * a camera at (azimuth, elevation) about world +Y and painted back to front.
 * The camera convention is the viewer's, so a pose read off the drawing opens
 * the 3D view at the same angle.
 *
 * Pure: no DOM, no three, no imports. The /m page's stage (inkStage.ts)
 * mutates SVG nodes from an InkLayout; the build-time page and card generator
 * (scripts/molecule-pages) prints the same layout as an SVG string, so the
 * static first paint, the share card and the spinnable drawing agree.
 */
/** viewBox units; the SVG scales to its box. */
export const INK_VIEW = 200;
const CENTER = INK_VIEW / 2;
/** Share of the box the molecule's widest turn fills. */
const FILL = 0.88;
/** Bond width (Å). */
const BOND_W = 0.14;
/** Bonds sort just behind atoms at the same depth, so every bond tucks under its atoms. */
const BOND_DEPTH_BIAS = 0.35;
export const INK_PLATE = '#101817';
export const INK_BOND = '#a3aaa6';
const HIGHLIGHT = '#f3f5ef';
const SHADE = '#1a2321';
/** The viewer's key light, lightDirection(40, 45): world-fixed. */
const KEY_LIGHT = (() => {
    const az = (40 * Math.PI) / 180;
    const el = (45 * Math.PI) / 180;
    return [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
})();
function mixHex(a, b, t) {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const channel = (shift) => {
        const ca = (pa >> shift) & 255;
        const cb = (pb >> shift) & 255;
        return Math.round(ca + (cb - ca) * t);
    };
    const value = (channel(16) << 16) | (channel(8) << 8) | channel(0);
    return `#${value.toString(16).padStart(6, '0')}`;
}
/** Radial-gradient stops (offset, colour) for one element: a lit ball in its CPK colour. */
export function inkGradientStops(color) {
    return [
        ['0', mixHex(color, HIGHLIGHT, 0.85)],
        ['0.2', mixHex(color, HIGHLIGHT, 0.42)],
        ['0.58', color],
        ['1', mixHex(color, SHADE, 0.62)],
    ];
}
/** The unit view direction normalize(camera − target) for a pose. */
export function inkViewDir(pose) {
    const c = Math.cos(pose.elevation);
    return [c * Math.sin(pose.azimuth), Math.sin(pose.elevation), c * Math.cos(pose.azimuth)];
}
/**
 * Screen positions for one pose, in viewBox units. Allocated once per model;
 * `update` reuses every array, so a spinning drawing allocates nothing.
 */
export class InkLayout {
    model;
    atomCount;
    bondCount;
    itemCount;
    /** viewBox units per Å. */
    scale;
    bondWidth;
    cx;
    cy;
    r;
    opacity;
    x1;
    y1;
    x2;
    y2;
    bondOpacity;
    /** Item indices back to front: below atomCount an atom, else bond (index − atomCount). */
    order;
    /** The gradients' focus (0..1): the highlight slides as the molecule turns under the light. */
    lightX = 0.4;
    lightY = 0.35;
    depth;
    sz;
    byDepth;
    constructor(model, opts = {}) {
        this.model = model;
        this.atomCount = model.k.length;
        this.bondCount = model.b.length / 2;
        this.itemCount = this.atomCount + this.bondCount;
        this.scale = (CENTER * (opts.fill ?? FILL)) / Math.max(0.5, model.radius);
        this.bondWidth = BOND_W * this.scale;
        this.cx = new Float64Array(this.atomCount);
        this.cy = new Float64Array(this.atomCount);
        this.r = new Float64Array(this.atomCount);
        this.opacity = new Float64Array(this.atomCount);
        this.sz = new Float64Array(this.atomCount);
        this.x1 = new Float64Array(this.bondCount);
        this.y1 = new Float64Array(this.bondCount);
        this.x2 = new Float64Array(this.bondCount);
        this.y2 = new Float64Array(this.bondCount);
        this.bondOpacity = new Float64Array(this.bondCount);
        this.depth = new Float64Array(this.itemCount);
        this.order = Array.from({ length: this.itemCount }, (_, i) => i);
        const depth = this.depth;
        this.byDepth = (a, b) => depth[a] - depth[b];
    }
    update(pose) {
        const { model, scale } = this;
        const positions = model.p;
        const sa = Math.sin(pose.azimuth);
        const ca = Math.cos(pose.azimuth);
        const se = Math.sin(pose.elevation);
        const ce = Math.cos(pose.elevation);
        // The camera basis of lookAt(viewDir, up +Y): right (x), up (y), and viewDir (z, toward the camera).
        const xx = ca;
        const xz = -sa;
        const yx = -se * sa;
        const yy = ce;
        const yz = -se * ca;
        const zx = ce * sa;
        const zy = se;
        const zz = ce * ca;
        const span = Math.max(1e-6, 2 * model.radius);
        for (let i = 0; i < this.atomCount; i += 1) {
            const px = positions[3 * i];
            const py = positions[3 * i + 1];
            const pz = positions[3 * i + 2];
            const z = px * zx + py * zy + pz * zz;
            this.sz[i] = z;
            this.depth[i] = z;
            this.cx[i] = CENTER + scale * (px * xx + pz * xz);
            this.cy[i] = CENTER - scale * (px * yx + py * yy + pz * yz);
            const near = Math.min(1, Math.max(0, (z + model.radius) / span)); // 0 at the back, 1 at the front
            this.r[i] = scale * model.kinds[model.k[i]].r * (0.9 + 0.16 * near);
            this.opacity[i] = 0.42 + 0.58 * near;
        }
        const bonds = model.b;
        for (let b = 0; b < this.bondCount; b += 1) {
            const i = bonds[2 * b];
            const j = bonds[2 * b + 1];
            const mid = (this.sz[i] + this.sz[j]) / 2;
            this.depth[this.atomCount + b] = mid - BOND_DEPTH_BIAS;
            this.x1[b] = this.cx[i];
            this.y1[b] = this.cy[i];
            this.x2[b] = this.cx[j];
            this.y2[b] = this.cy[j];
            this.bondOpacity[b] = 0.2 + 0.68 * Math.min(1, Math.max(0, (mid + model.radius) / span));
        }
        // The key light on screen.
        const lx = KEY_LIGHT[0] * xx + KEY_LIGHT[2] * xz;
        const ly = KEY_LIGHT[0] * yx + KEY_LIGHT[1] * yy + KEY_LIGHT[2] * yz;
        this.lightX = 0.5 + 0.3 * lx;
        this.lightY = 0.5 - 0.3 * ly;
        this.order.sort(this.byDepth);
    }
}
const fmt = (value) => {
    const rounded = Number(value.toFixed(2));
    return Object.is(rounded, -0) ? '0' : String(rounded);
};
function escapeXml(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/** The <defs> gradients for a model (one per element). */
export function inkGradientDefs(model, idPrefix, layout) {
    const fx = fmt(layout?.lightX ?? 0.4);
    const fy = fmt(layout?.lightY ?? 0.35);
    return model.kinds
        .map((kind) => {
        const stops = inkGradientStops(kind.c)
            .map(([offset, color]) => `<stop offset="${offset}" stop-color="${color}"/>`)
            .join('');
        return `<radialGradient id="${idPrefix}-${kind.s}" cx="0.5" cy="0.5" r="0.5" fx="${fx}" fy="${fy}">${stops}</radialGradient>`;
    })
        .join('');
}
/** The painted items (bonds and atoms, back to front) for a laid-out pose. */
export function inkItemsMarkup(layout, idPrefix, rim = INK_PLATE) {
    const { model } = layout;
    let out = `<g stroke="${INK_BOND}" stroke-linecap="round" stroke-width="${fmt(layout.bondWidth)}">`;
    for (const item of layout.order) {
        if (item < layout.atomCount) {
            const kind = model.kinds[model.k[item]];
            out += `<circle cx="${fmt(layout.cx[item])}" cy="${fmt(layout.cy[item])}" r="${fmt(layout.r[item])}" opacity="${fmt(layout.opacity[item])}" fill="url(#${idPrefix}-${kind.s})" stroke="${rim}" stroke-width="0.6"/>`;
        }
        else {
            const b = item - layout.atomCount;
            out += `<line x1="${fmt(layout.x1[b])}" y1="${fmt(layout.y1[b])}" x2="${fmt(layout.x2[b])}" y2="${fmt(layout.y2[b])}" stroke-opacity="${fmt(layout.bondOpacity[b])}"/>`;
        }
    }
    return `${out}</g>`;
}
/** A standalone SVG of the molecule at `pose` (static pages, thumbnails, cards). */
export function inkSvgMarkup(model, pose, opts) {
    const layout = new InkLayout(model);
    layout.update(pose);
    const attrs = {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${INK_VIEW} ${INK_VIEW}`,
        ...(opts.title ? { role: 'img' } : { 'aria-hidden': 'true' }),
        ...opts.attrs,
    };
    const attrText = Object.entries(attrs)
        .map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
        .join('');
    const title = opts.title ? `<title>${escapeXml(opts.title)}</title>` : '';
    return `<svg${attrText}>${title}<defs>${inkGradientDefs(model, opts.idPrefix, layout)}</defs>${inkItemsMarkup(layout, opts.idPrefix, opts.rim)}</svg>`;
}
