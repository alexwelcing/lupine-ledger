/** A bounded presentation of article metadata and the existing graph, with no IO. */
export const HOME_VIEWS = Object.freeze([
  { id: 'equal', label: 'Same size' },
  { id: 'connections', label: 'More connections · larger' },
  { id: 'recent', label: 'Document recency · size' },
  { id: 'category', label: 'Research area · color' },
  { id: 'status', label: 'Evidence status · color' },
]);
const names = {
  mlip: 'Machine learning interatomic potentials (MLIP)',
  dft: 'Density functional theory (DFT)',
  'sparse-dft': 'Sparse density functional theory',
  'ml-potential': 'Machine learning potentials',
  matpes: 'MatPES reference data',
  lean: 'Lean formal verification',
  uq: 'Uncertainty quantification (UQ)',
  gnn: 'Graph neural networks (GNN)',
  hpc: 'High-performance computing (HPC)',
  neb: 'Nudged elastic band (NEB)',
  scf: 'Self-consistent field (SCF)',
  bcc: 'Body-centered cubic (BCC)',
  fcc: 'Face-centered cubic (FCC)',
  ni: 'Nickel (Ni)',
  fe: 'Iron (Fe)',
  au: 'Gold (Au)',
  rg: 'Renormalization group (RG)',
  tda: 'Topological data analysis (TDA)',
  'z1': 'Barrier accuracy campaign (Z1)',
  'z2': 'Spin-aware simulation campaign (Z2)',
  'z3': 'Adsorption correction campaign (Z3)',
};
export const homeText = value => typeof value === 'string' ? value : value?.en || Object.values(value || {})[0] || '';
export const normalizeKeyword = value => String(value || '').normalize('NFKC').trim().toLocaleLowerCase('en');
export const keywordLabel = value => names[normalizeKeyword(value)] || String(value).replace(/[_-]+/g, ' ').replace(/^./, c => c.toUpperCase());
const endpoint = value => typeof value === 'string' ? value : value?.id;
const dateKeys = ['dateModified', 'updatedAt', 'datePublished', 'publishedAt'];

/** Only explicit dates count. Filenames, ids, build dates and export dates never do. */
export function articleDate(article) {
  const documentDate = article.documentDate;
  if (documentDate?.basis === 'document-header' && Number.isSafeInteger(documentDate.sourceLine) && documentDate.sourceLine > 0 && /^\d{4}-\d{2}-\d{2}$/.test(documentDate.value || '')) {
    const ms = Date.parse(documentDate.value);
    if (Number.isFinite(ms) && new Date(ms).toISOString().slice(0,10) === documentDate.value) return { value: documentDate.value, ms, kind: 'Document date' };
  }
  for (const key of dateKeys) {
    const value = article[key];
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) continue;
    const ms = Date.parse(value);
    if (Number.isFinite(ms) && new Date(ms).toISOString().slice(0,10) === value.slice(0,10)) return { value, ms, kind: key === 'dateModified' || key === 'updatedAt' ? 'Updated' : 'Published' };
  }
  return null;
}

export function buildHomeGraph(manifest = {}, graph = {}) {
  const articles = (manifest.articles || []).filter(a => a && typeof a.id === 'string');
  const byId = new Map(articles.map(a => [a.id, a]));
  const keywordMap = new Map();
  for (const article of articles) for (const raw of new Set((article.tags || []).map(normalizeKeyword).filter(Boolean))) {
    // A display-placement flag is not a research keyword.
    if (raw === 'featured') continue;
    if (!keywordMap.has(raw)) keywordMap.set(raw, { key: raw, label: keywordLabel(raw), articleIds: [] });
    keywordMap.get(raw).articleIds.push(article.id);
  }
  const keywords = [...keywordMap.values()].map(k => ({ ...k, count: k.articleIds.length }))
    .sort((a,b) => b.count - a.count || a.label.localeCompare(b.label, 'en') || a.key.localeCompare(b.key));
  const links = [], seen = new Set(), neighbors = new Map(articles.map(a => [a.id, new Set()]));
  for (const link of graph.links || []) {
    const from = endpoint(link.source), to = endpoint(link.target);
    if (!from?.startsWith('article:') || !to?.startsWith('article:')) continue;
    const source = from.slice(8), target = to.slice(8);
    const identity = link.id || `${from}:${link.relation}:${to}`;
    if (!byId.has(source) || !byId.has(target) || source === target || seen.has(identity)) continue;
    seen.add(identity);
    links.push({ ...link, source, target }); neighbors.get(source).add(target); neighbors.get(target).add(source);
  }
  const categories = new Map((manifest.categories || []).map(c => [c.id, homeText(c.label)]));
  const nodes = articles.map(a => ({ ...a, title: homeText(a.title), subtitle: homeText(a.subtitle),
    categoryLabel: categories.get(a.category) || 'Unclassified',
    statusLabel: homeText(manifest.statuses?.[a.status]?.label) || 'Not classified',
    date: articleDate(a), connectionCount: neighbors.get(a.id).size,
    keywords: [...new Set((a.tags || []).filter(t => normalizeKeyword(t) !== 'featured').map(keywordLabel))],
  })).sort((a,b) => a.categoryLabel.localeCompare(b.categoryLabel) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  return { nodes, links, keywords, neighbors, manifest };
}

export function filterHomeGraph(model, query = '') {
  const q = normalizeKeyword(query), exact = model.keywords.find(k => k.key === q || normalizeKeyword(k.label) === q);
  const matching = exact ? new Set(exact.articleIds) : null, terms = q.split(/\s+/).filter(Boolean);
  const nodes = model.nodes.filter(a => {
    if (matching) return matching.has(a.id);
    const text = normalizeKeyword([a.title,a.subtitle,homeText(a.originalTitle),...(a.searchAliases || []),...a.keywords,...(a.tags || [])].join(' '));
    return terms.every(t => text.includes(t));
  });
  const ids = new Set(nodes.map(a => a.id));
  return { nodes, links: model.links.filter(l => ids.has(l.source) && ids.has(l.target)), exactKeyword: exact || null };
}

const positionCache = new Map(); // Eight bounded geometries; selection and sizing reuse positions.

/** Deterministic bounded network layout. Only retained links exert attraction. */
export function layoutHomeGraph(nodes, width = 900, mode = 'equal', links = []) {
  const w=Math.max(280,Math.min(1600,width)), n=nodes.length;
  const height=n>50?(w<600?Math.min(600,Math.max(420,Math.ceil(n*1800/(w-40)))):380):n>15?320:260;
  const ordered=[...nodes].sort((a,b)=>a.id.localeCompare(b.id)), byId=new Map();
  const points=ordered.map((node,i)=>{
    const angle=i*Math.PI*(3-Math.sqrt(5))+.37, radius=Math.sqrt((i+.6)/Math.max(1,n));
    const point={node,x:w/2+Math.cos(angle)*radius*(w/2-28),y:height/2+Math.sin(angle)*radius*(height/2-28),vx:0,vy:0};
    byId.set(node.id,point);return point;
  });
  const edges=links.filter(l=>l.source!==l.target&&byId.has(l.source)&&byId.has(l.target)).map(l=>[byId.get(l.source),byId.get(l.target)]).sort((a,b)=>a[0].node.id.localeCompare(b[0].node.id)||a[1].node.id.localeCompare(b[1].node.id));
  const cacheKey=JSON.stringify([w,ordered.map(a=>a.id),edges.map(([a,b])=>[a.node.id,b.node.id])]), cached=positionCache.get(cacheKey);
  if(cached)points.forEach((p,i)=>{p.x=cached[i][0];p.y=cached[i][1];});
  const margin=20,minDistance=34.4,desired=Math.min(155,Math.max(54,Math.sqrt(w*height/Math.max(1,n))*.8));
  const clamp=p=>{p.x=Math.max(margin,Math.min(w-margin,p.x));p.y=Math.max(margin,Math.min(height-margin,p.y));};
  const separate=()=>{
    let overlap=0;
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
      const a=points[i],b=points[j];let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d>=minDistance)continue;
      if(d<.0001){dx=Math.cos(i+j+.4);dy=Math.sin(i+j+.4);d=1;}
      const shift=(minDistance-d)/2+.001;overlap=Math.max(overlap,minDistance-d);
      a.x-=dx/d*shift;a.y-=dy/d*shift;b.x+=dx/d*shift;b.y+=dy/d*shift;
    }
    points.forEach(clamp);return overlap;
  };
  if(!cached) {
  for(let step=0;step<200;step++){
    for(const p of points){p.vx=(p.vx+(w/2-p.x)*.0012)*.6;p.vy=(p.vy+(height/2-p.y)*.0012)*.6;}
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
      const a=points[i],b=points[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),f=Math.min(3,1100/(d*d));
      a.vx-=dx/d*f;a.vy-=dy/d*f;b.vx+=dx/d*f;b.vy+=dy/d*f;
    }
    for(const [a,b] of edges){
      const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),f=(d-desired)*.035;
      a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;
      // Discourage a link from running through an unrelated article. This is
      // geometry only; it creates no new semantic edge or evidence relation.
      const length2=dx*dx+dy*dy;
      if(length2<1)continue;
      for(const p of points){if(p===a||p===b)continue;
        const t=((p.x-a.x)*dx+(p.y-a.y)*dy)/length2;if(t<=.08||t>=.92)continue;
        const ox=p.x-(a.x+t*dx),oy=p.y-(a.y+t*dy),od=Math.hypot(ox,oy);
        if(od>=19)continue;
        const f=(19-od)*.055;if(od>.001){p.vx+=ox/od*f;p.vy+=oy/od*f;}else{p.vx-=dy/d*f;p.vy+=dx/d*f;}
      }
    }
    const cooling=1-step/260;
    for(const p of points){p.x+=Math.max(-5,Math.min(5,p.vx))*cooling;p.y+=Math.max(-5,Math.min(5,p.vy))*cooling;clamp(p);}
    separate();
  }
  for(let pass=0;pass<2000&&separate()>.001;pass++); // Dense mobile clusters need more bounded relaxation.
  if(n===1){points[0].x=w/2;points[0].y=height/2;}
  if(positionCache.size>=8)positionCache.delete(positionCache.keys().next().value);
  positionCache.set(cacheKey,points.map(p=>[p.x,p.y]));
  }
  const dated=nodes.map(a=>a.date?.ms).filter(Number.isFinite),oldest=Math.min(...dated),newest=Math.max(...dated);
  const maxDegree=Math.max(1,...nodes.map(a=>a.connectionCount));
  return {width:w,height,nodes:nodes.map(a=>{
    const p=byId.get(a.id),radius=mode==='connections'?6+8*Math.sqrt(a.connectionCount/maxDegree):mode==='recent'&&a.date?newest===oldest?12:6+8*(a.date.ms-oldest)/(newest-oldest):8;
    return {...a,x:p.x,y:p.y,radius};
  })};
}
