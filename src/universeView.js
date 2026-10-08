import { prepareWithSegments, layoutWithLines } from './vendor/pretext/layout.js';
import html2canvas from './vendor/html2canvas.js';

let corpusPromise;
export function preloadCorpus(onArticle = () => {}) {
  if (!corpusPromise) corpusPromise = fetch('/data/corpus.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error('The text collection could not be loaded.'); return r.json(); })
    .then(data => {
      const vault = document.createElement('section');
      vault.id = 'corpus-vault'; vault.hidden = true;
      vault.setAttribute('aria-label', 'Complete research text collection');
      const fragment = document.createDocumentFragment();
      for (const a of data.articles) {
        const article = document.createElement('article');
        article.dataset.articleId = a.id; article.lang = a.lang;
        article.innerHTML = a.html;
        // Avoid duplicate reader anchors while keeping the complete text in the DOM.
        for (const e of article.querySelectorAll('[id]')) e.removeAttribute('id');
        fragment.append(article); onArticle(a);
      }
      vault.append(fragment); document.body.append(vault);
      return data;
    }).catch(error => { corpusPromise = null; throw error; });
  return corpusPromise;
}

const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label = n => typeof n.title === 'object' ? n.title.en : n.title || n.label || n.id;
const color = n => n.type === 'article' ? '#dce5f6' : n.type === 'tag' ? '#abc342' : n.type === 'category' ? '#697bff' : '#6b8aaf';

export async function renderUniverse(root, { manifest, graph, corpus, onArticleLink, renderActivity }) {
  let disposed = false, frame = 0, clock = 0, lastFrame = 0;
  let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let graphMode = false, selected = null, hovering = null, drag = null, moved = false;
  let angle = -0.18, tilt = 0.12, zoom = 1, width = 0, height = 0, projected = [];
  const nodes = graph.nodes.map((n, i) => {
    const z = 1 - 2 * (i + .5) / graph.nodes.length;
    const a = i * Math.PI * (3 - Math.sqrt(5));
    const r = Math.sqrt(1 - z*z);
    return { ...n, xyz: [Math.cos(a)*r, z*.78, Math.sin(a)*r] };
  });
  const byId = new Map(nodes.map(n => [n.id,n]));
  const prepared = new Map();
  const neighbors = new Map(nodes.map(n => [n.id,new Set()]));
  for (const l of graph.links) { neighbors.get(l.source)?.add(l.target); neighbors.get(l.target)?.add(l.source); }
  root.innerHTML = `
    <section class="universe" aria-label="Lupine research universe">
      <div class="universe-art" aria-hidden="true"><img src="/assets/media/bluebonnet-chrome.jpg" alt="" fetchpriority="high"><video muted playsinline loop preload="none" poster="/assets/media/bluebonnet-chrome.jpg" aria-hidden="true"></video></div>
      <div class="universe-shade" aria-hidden="true"></div>
      <div class="film-marks" aria-hidden="true"><span>LU / 001</span><span>AN OPEN RESEARCH TRANSMISSION</span><span>EST. IN CURIOSITY</span></div>
      <div class="universe-title"><p>Materials. Mathematics. The unknown.</p><h1>Finding the<br><em>future</em> first</h1><div class="intro-line"><span class="signal-dot"></span> Independent research, out in the open.</div></div>
      <canvas class="universe-canvas" aria-label="Interactive research graph. Use the searchable index for keyboard navigation."></canvas>
      <div class="field-readout"><span class="micro">THE KNOWLEDGE FIELD</span><strong>${nodes.length}<small> connected objects</small></strong><p>${manifest.articles.length} documents · ${graph.links.length.toLocaleString()} relationships<br>Articles, assumptions, formal structures.</p><span class="readout-rule"></span><p class="field-hint">Drag the field. Follow a connection.</p></div>
      <div class="field-caption"><span>01 / THE LIVING ARCHIVE</span><p>Error geometry of interatomic potentials.<br>Every connection is a way into the work.</p></div>
      <button class="watch-transmission" disabled data-html2canvas-ignore aria-label="Play the 8-second transmission with sound"><span class="film-play">▷</span><span>Watch transmission<small>00:08 / SOUND ON</small></span></button>
      <div class="universe-controls" data-html2canvas-ignore><button class="enter-field">Explore the field <span>↗</span></button><button class="field-index-toggle">Index <span>⌕</span></button><button class="field-math-toggle">Mathematics <span>∑</span></button><button class="field-capture" aria-label="Capture this research view">Capture <span>↗</span></button><button class="field-motion" aria-label="Pause motion">Ⅱ</button></div>
      <div class="field-status" role="status" aria-live="polite">Loading the complete text collection…</div>
      <aside class="field-index" hidden aria-label="Searchable knowledge index"><div class="panel-top"><span>THE INDEX</span><button class="close-index" aria-label="Close index">×</button></div><label class="field-search-label">Find a way in<input type="search" class="field-search" placeholder="Try error, alloys, Lean…"></label><div class="index-filters"><button data-kind="all" aria-pressed="true">Everything</button><button data-kind="article" aria-pressed="false">Documents</button><button data-kind="tag" aria-pressed="false">Topics</button></div><p class="index-count"></p><div class="field-results"></div></aside>
      <aside class="math-desk" hidden aria-label="Mathematics desk"><div class="panel-top"><span>MATHEMATICS / LIVE TYPE</span><button class="close-math" aria-label="Close mathematics desk">×</button></div><p class="math-intro">Equations extracted from the Library. Resize the typography; follow the source for assumptions.</p><label class="math-scale">Scale <input type="range" min="70" max="160" value="100" aria-label="Mathematics scale"><output>100%</output></label><div class="math-plates"></div></aside>
      <aside class="field-inspector" hidden aria-label="Selected research object"><div class="panel-top"><span>IN THE FIELD</span><button class="close-inspector" aria-label="Close selected object">×</button></div><div class="inspector-content"></div></aside>
    </section>
    <dialog class="transmission" aria-labelledby="transmission-title"><div class="transmission-top"><span id="transmission-title">LUPINE / FRACTURE TO FIELD</span><button class="close-transmission" aria-label="Close film">×</button></div><video controls playsinline preload="none" aria-label="Eight-second abstract film of a fracture, chrome lattice and botanical sculpture. Sound contains music and effects, no speech."></video><p>AN EXPERIMENT IN FORM / GENERATED THROUGH FAL / CREATIVE MEDIA</p></dialog>
    <section class="research-statement"><div class="micro">LUPINE / RESEARCH IN PUBLIC</div><h2>Simulation is a claim.<br><em>Let's find its limits.</em></h2><div class="statement-bottom"><p>We connect the mathematics of error to the way interatomic potentials are used. Follow an assumption into a theorem, a computation into its evidence, a result into its limits.</p><a href="#/read/research-index">Enter the research index ↗</a></div></section>
    <section class="universe-journal" aria-label="Research activity"></section>
    <footer class="universe-footer"><span>LUPINE SCIENCE</span><a href="https://github.com/alexwelcing/lupine-rhizo">Open the source ↗</a><p>Generated botanical film / creative interpretation.<br>Graph connections retain their source and evidence status.</p></footer>`;
  const stage = root.querySelector('.universe');
  const canvas = stage.querySelector('canvas'), ctx = canvas.getContext('2d');
  const status = stage.querySelector('.field-status');
  const index = stage.querySelector('.field-index'), search = stage.querySelector('.field-search');
  const inspector = stage.querySelector('.field-inspector');
  const mathDesk = stage.querySelector('.math-desk');
  const video = stage.querySelector('video');
  const cinema = root.querySelector('.transmission'), film = cinema.querySelector('video');
  const watch = stage.querySelector('.watch-transmission');
  let filmUrl = null, resumeAfterFilm = false, scrollBeforeFilm = 0;
  const activityCleanup = renderActivity(root.querySelector('.universe-journal'));
  const abort = new AbortController(), signal = abort.signal;
  let corpusData = null, filter = 'all';
  corpus.then(data => {
    if (disposed) return;
    corpusData = data;
    const count = new Set(data.articles.map(a => a.id)).size;
    status.textContent = `${count} documents loaded. All text is here.`;
    if (selected) inspect(selected);
    const plates = mathDesk.querySelector('.math-plates');
    for (const a of data.articles.filter(a => a.lang === 'en')) {
      const temp = document.createElement('div'); temp.innerHTML = a.html;
      const formulas = [...temp.querySelectorAll('.katex-display')];
      for (const [i, formula] of formulas.entries()) {
        const plate = document.createElement('section'); plate.className = 'math-plate';
        const title = document.createElement('a'); title.href = `#/read/${a.id}`; title.textContent = `${a.title} · ${i+1} ↗`;
        plate.append(formula.cloneNode(true), title); plates.append(plate);
      }
    }
  }).catch(() => { if (!disposed) status.textContent = 'Text preload unavailable. Individual readers remain available.'; });
  // This manifest is generated from reviewed local media receipts, never from fal credentials.
  fetch('/assets/media/manifest.json').then(r => r.ok ? r.json() : null).then(media => {
    if (disposed || !media) return;
    if (media.heroVideo) {
      video.src = media.heroVideo;
      if (playing) video.play().catch(() => {});
    }
    if (media.featureFilm) { filmUrl = media.featureFilm; watch.disabled = false; }
  }).catch(() => {});
  watch.addEventListener('click', () => {
    if (!filmUrl) return;
    resumeAfterFilm = playing; scrollBeforeFilm = scrollY; playing = false; video.pause();
    film.src = filmUrl; cinema.showModal(); film.play().catch(() => {});
  }, { signal });
  cinema.querySelector('.close-transmission').addEventListener('click', () => cinema.close(), { signal });
  cinema.addEventListener('close', () => {
    film.pause(); playing = resumeAfterFilm;
    if (playing && video.src) video.play().catch(() => {});
    watch.focus({ preventScroll: true }); window.scrollTo({ top: scrollBeforeFilm, behavior: 'instant' });
  }, { signal });

  function setMode(value) {
    graphMode = value; stage.classList.toggle('is-exploring', value);
    stage.querySelector('.enter-field').innerHTML = value ? 'Return to film <span>↙</span>' : 'Explore the field <span>↗</span>';
    draw();
  }
  function titleLines(text, maxWidth) {
    if (!prepared.has(text)) prepared.set(text, prepareWithSegments(text, '12px Inter'));
    return layoutWithLines(prepared.get(text), maxWidth, 16).lines;
  }
  function resize() {
    width = stage.clientWidth; height = stage.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0); draw();
  }
  function draw() {
    if (disposed || !width) return;
    ctx.clearRect(0,0,width,height);
    const radius = Math.min(width*.33,height*.45) * zoom;
    const centerX = width * (graphMode ? .53 : .74), centerY = height * .49;
    const ca = Math.cos(angle), sa = Math.sin(angle), ct = Math.cos(tilt), st = Math.sin(tilt);
    projected = nodes.map(n => {
      const [x,y,z] = n.xyz, rx=x*ca-z*sa, rz=x*sa+z*ca;
      const ry=y*ct-rz*st, zz=y*st+rz*ct;
      const perspective=3.8/(3.8+zz);
      return { n, x:centerX+rx*radius*perspective, y:centerY+ry*radius*perspective, z:zz, r:n.type==='article'?2.5:1.5 };
    });
    const positions = new Map(projected.map(p=>[p.n.id,p]));
    const activeId = hovering?.id || selected?.id;
    const nearby = neighbors.get(activeId);
    ctx.lineWidth = .6;
    for (const l of graph.links) {
      const a = positions.get(l.source), b = positions.get(l.target);
      if (!a || !b) continue;
      const active = activeId && (l.source===activeId || l.target===activeId);
      const alpha = active ? .68 : activeId ? .025 : graphMode ? .12 : .06;
      ctx.strokeStyle = `rgba(${active ? '203,230,120' : '117,140,211'},${alpha})`;
      ctx.setLineDash(l.provenance?.confidence==='suggested' ? [2,4] : []);
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const p of [...projected].sort((a,b)=>b.z-a.z)) {
      const active = activeId===p.n.id, related = nearby?.has(p.n.id);
      ctx.globalAlpha = active || related ? 1 : activeId ? .14 : (graphMode ? .9 : .55) * (.6+(1-p.z)*.2);
      ctx.fillStyle = active ? '#d9f59b' : color(p.n);
      ctx.beginPath(); ctx.arc(p.x,p.y,active ? 6 : p.r,0,Math.PI*2); ctx.fill();
      if (active) { ctx.strokeStyle='#d9f59b'; ctx.lineWidth=.8; ctx.beginPath();ctx.arc(p.x,p.y,13,0,Math.PI*2);ctx.stroke(); }
      if (active || (graphMode && related && p.z<0) || (width>650 && !activeId && p.n.featured && p.z<-.2)) {
        ctx.globalAlpha = active ? 1 : .78; ctx.fillStyle='#e1e6f0'; ctx.font='12px Inter';
        titleLines(label(p.n),170).slice(0,2).forEach((line,i)=>ctx.fillText(line.text,p.x+16,p.y+4+i*16));
      }
    }
    ctx.globalAlpha=1;
  }
  function update(ts) {
    if (disposed) return;
    if (ts-lastFrame>32) {
      const delta = lastFrame ? Math.min(ts-lastFrame,80) : 0; lastFrame=ts;
      if (playing && !drag && !hovering && !selected && !document.hidden) { angle += delta*.000035; clock+=delta; draw(); }
    }
    frame=requestAnimationFrame(update);
  }
  function hit(e) {
    const rect=canvas.getBoundingClientRect(), x=e.clientX-rect.left,y=e.clientY-rect.top;
    return projected.filter(p=>Math.hypot(x-p.x,y-p.y)<Math.max(12,p.r+6)).sort((a,b)=>a.z-b.z)[0]?.n || null;
  }
  canvas.addEventListener('pointerdown',e=>{ drag={x:e.clientX,y:e.clientY};moved=false;canvas.setPointerCapture(e.pointerId); },{signal});
  canvas.addEventListener('pointermove',e=>{
    if (drag) {
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if (Math.abs(dx)+Math.abs(dy)>2) moved=true;
      angle+=dx*.005;tilt=Math.max(-1,Math.min(1,tilt+dy*.004));drag={x:e.clientX,y:e.clientY};draw();
    } else { hovering=hit(e);canvas.style.cursor=hovering?'pointer':'grab';draw(); }
  },{signal});
  canvas.addEventListener('pointerup',e=>{ drag=null;if(!moved){const n=hit(e);if(n)inspect(n);} },{signal});
  canvas.addEventListener('pointercancel',()=>{drag=null;},{signal});
  canvas.addEventListener('pointerleave',()=>{hovering=null;draw();},{signal});
  canvas.addEventListener('wheel',e=>{ if(!graphMode)return;e.preventDefault();zoom=Math.max(.45,Math.min(2.5,zoom-e.deltaY*.001));draw(); },{signal,passive:false});
  stage.querySelector('.enter-field').addEventListener('click',()=>setMode(!graphMode),{signal});
  stage.querySelector('.field-index-toggle').addEventListener('click',()=>{index.hidden=!index.hidden;if(!index.hidden){setMode(true);search.focus();}},{signal});
  stage.querySelector('.close-index').addEventListener('click',()=>{index.hidden=true;stage.querySelector('.field-index-toggle').focus();},{signal});
  stage.querySelector('.field-math-toggle').addEventListener('click',()=>{ mathDesk.hidden=!mathDesk.hidden;if(!mathDesk.hidden){setMode(true);inspector.hidden=true;index.hidden=true;} },{signal});
  stage.querySelector('.close-math').addEventListener('click',()=>{mathDesk.hidden=true;stage.querySelector('.field-math-toggle').focus();},{signal});
  mathDesk.querySelector('input').addEventListener('input',e=>{mathDesk.style.setProperty('--math-size',e.target.value+'%');mathDesk.querySelector('output').value=e.target.value+'%';},{signal});
  stage.querySelector('.close-inspector').addEventListener('click',()=>{inspector.hidden=true;selected=null;draw();},{signal});
  stage.querySelector('.field-motion').addEventListener('click',e=>{
    playing=!playing;e.currentTarget.textContent=playing?'Ⅱ':'▷';e.currentTarget.setAttribute('aria-label',playing?'Pause motion':'Play motion');
    if(playing && video.src)video.play().catch(()=>{});else video.pause();
  },{signal});
  const modeButton=stage.querySelector('.field-motion');
  modeButton.textContent=playing?'Ⅱ':'▷';modeButton.setAttribute('aria-label',playing?'Pause motion':'Play motion');
  function results() {
    const q=search.value.trim().toLowerCase();
    const found=nodes.filter(n=>(filter==='all'||n.type===filter)&&[label(n),n.subtitle,...(n.tags||[])].join(' ').toLowerCase().includes(q));
    stage.querySelector('.index-count').textContent=`${found.length} objects · source-linked`;
    stage.querySelector('.field-results').innerHTML=found.map(n=>`<button data-node="${esc(n.id)}"><span>${esc(n.type)}</span><strong>${esc(label(n))}</strong><i>↗</i></button>`).join('');
  }
  search.addEventListener('input',results,{signal});
  stage.querySelector('.index-filters').addEventListener('click',e=>{
    const b=e.target.closest('[data-kind]');if(!b)return;filter=b.dataset.kind;
    for(const item of b.parentElement.children)item.setAttribute('aria-pressed',item===b?'true':'false');results();
  },{signal});
  stage.querySelector('.field-results').addEventListener('click',e=>{
    const b=e.target.closest('[data-node]');if(b){inspect(byId.get(b.dataset.node));index.hidden=true;}
  },{signal});
  function inspect(n) {
    if (!n) return;
    selected=n;
    const [nx,ny,nz]=n.xyz; angle=Math.atan2(-nx,-nz);
    tilt=Math.atan(ny/(nx*Math.sin(angle)+nz*Math.cos(angle)));
    setMode(true);inspector.hidden=false;mathDesk.hidden=true;
    const edges=graph.links.filter(l=>l.source===n.id||l.target===n.id);
    const article=corpusData?.articles.find(a=>a.id===n.articleId&&a.lang==='en');
    const content=stage.querySelector('.inspector-content');
    content.innerHTML=`<p class="micro">${esc(n.type)}${n.status?' / '+esc(n.status):''}</p><h2>${esc(label(n))}</h2><p>${esc(n.subtitle||'Follow the source relationships to explore this object.')}</p>${n.articleId?`<a class="inspector-read" href="#/read/${encodeURIComponent(n.articleId)}">Read the document ↗</a>`:''}<div class="inspector-relations"><h3>${edges.length} connections</h3>${edges.slice(0,24).map(l=>{const other=byId.get(l.source===n.id?l.target:l.source);return `<button data-related="${esc(other?.id)}"><strong>${esc(label(other||{}))}</strong><span>${esc(l.relation)} · ${esc(l.provenance?.confidence||'unknown')}</span></button>`;}).join('')}${edges.length>24?`<a href="#/graph?focus=${encodeURIComponent(n.id)}">See all connections in the source graph ↗</a>`:''}</div>${article?'<details class="instant-text"><summary>Full text · already loaded</summary><div class="instant-text-body"></div></details>':''}<p class="source-note">Graph positions are an exploratory layout. Links preserve declared, derived or suggested status; they are not proof of physical causality.</p>`;
    if(article) {
      const body = content.querySelector('.instant-text-body');
      body.innerHTML = article.html;
      if (onArticleLink) body.addEventListener('click', e => onArticleLink(e, article), { signal });
    }
    content.querySelectorAll('[data-related]').forEach(b=>b.addEventListener('click',()=>inspect(byId.get(b.dataset.related)),{signal}));
    inspector.scrollTop=0;draw();
  }
  stage.querySelector('.field-capture').addEventListener('click',async e=>{
    const b=e.currentTarget;b.disabled=true;const wasPlaying=playing;playing=false;video.pause();draw();
    status.textContent='Composing this view…';
    try {
      const capture=await html2canvas(stage,{backgroundColor:'#03060b',scale:Math.min(devicePixelRatio||1,2),useCORS:true,logging:false,onclone:doc=>{
        doc.querySelectorAll('.universe video').forEach(v=>v.remove());
        const note=doc.querySelector('.field-status');if(note)note.textContent=`Lupine Library · ${new Date().toISOString()} · corpus ${manifest.version.slice(0,12)}`;
      }});
      const blob=await new Promise(resolve=>capture.toBlob(resolve,'image/png'));if(!blob)throw new Error('No capture');
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`lupine-field-${Date.now()}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      status.textContent='View captured, with source version and timestamp.';
    }catch{status.textContent='Capture unavailable in this browser. The research remains accessible.';}
    finally{playing=wasPlaying;b.disabled=false;if(playing&&video.src)video.play().catch(()=>{});}
  },{signal});
  stage.addEventListener('keydown',e=>{if(e.key==='Escape'){index.hidden=true;inspector.hidden=true;mathDesk.hidden=true;selected=null;draw();}},{signal});
  const observer=new ResizeObserver(resize);observer.observe(stage);
  await document.fonts.ready;if(disposed)return()=>{};
  prepared.clear(); results();resize();frame=requestAnimationFrame(update);
  return()=>{disposed=true;abort.abort();observer.disconnect();cancelAnimationFrame(frame);video.pause();film.pause();if(cinema.open)cinema.close();activityCleanup?.();};
}
