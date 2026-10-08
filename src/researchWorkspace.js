import { prepareWithSegments, layoutWithLines } from './vendor/pretext/layout.js';
import html2canvas from './vendor/html2canvas.js';
import { VIEW_KEY, blankView, readView } from './workspaceState.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title = n => typeof n.title === 'object' ? n.title.en : n.title || n.label || n.id;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const editTarget = el => el.closest('input,textarea,select,[contenteditable="true"]');

export async function renderUniverse(root, { manifest, graph, corpus, onArticleLink, renderActivity }) {
  const abort = new AbortController(), signal = abort.signal;
  let disposed = false, articles = null, selected = null, gesture = null, ghost = null, z = 20;
  let store; try { store = window.localStorage; } catch { store = null; }
  let state = readView(store, manifest.articles.map(a=>a.id));
  const history = [], pieces = new Map(), readers = new Map(), prepared = new Map();
  let pan = {x:38,y:26}, zoom = .82, pointer = null;
  const nodeById = new Map(graph.nodes.map(n=>[n.id,n]));
  const documents = [...manifest.articles].sort((a,b)=>(a.id==='research-index'?-1:b.id==='research-index'?1:a.id==='changelog'?-1:b.id==='changelog'?1:0));
  const docNodes = new Map(graph.nodes.filter(n=>n.type==='article'&&n.articleId).map(n=>[n.articleId,n]));
  const positions = new Map();
  const cols = 8, cellW = 248, cellH = 156;
  documents.forEach((a,i)=>{const n=docNodes.get(a.id);if(n)positions.set(n.id,{x:(i%cols)*cellW+112,y:Math.floor(i/cols)*cellH+63});});
  const rest=graph.nodes.filter(n=>!positions.has(n.id));
  rest.forEach((n,i)=>{const angle=i/rest.length*Math.PI*2;positions.set(n.id,{x:880+Math.cos(angle)*1210,y:840+Math.sin(angle)*1120});});
  root.innerHTML = `
    <section class="research-workspace" aria-label="Movable research workspace">
      <div class="workspace-intro" data-piece="title" tabindex="0" aria-label="Library title; select to move or remove">
        <div class="piece-handle" data-drag-handle><span>THE OPEN WORK / 001</span><button data-remove="title" aria-label="Remove title from my view">×</button></div>
        <h1>Knowledge, <em>in your hands.</em></h1><p>Pull a paper from the field. Make room for the thought.</p>
      </div>
      <section class="knowledge-field" data-piece="field" tabindex="0" aria-label="Knowledge field">
        <div class="piece-handle" data-drag-handle><span>THE FIELD <b>${manifest.articles.length}</b> DOCUMENTS / ${graph.links.length.toLocaleString()} RELATIONSHIPS</span><button data-remove="field" aria-label="Remove field from my view">×</button></div>
        <div class="field-viewport" tabindex="0" aria-label="Research field. Drag a document to open it. Drag empty space to move the field. Arrow keys pan.">
          <canvas class="connection-canvas" aria-label="Source relationships; dashed links are suggested"></canvas>
          <div class="document-plane">${documents.map((a,i)=>`<article class="document-tile" data-article="${esc(a.id)}" data-piece="card:${esc(a.id)}" tabindex="0" aria-label="${esc(title(a))}; Enter to read, Delete to remove from this view" style="left:${i%cols*cellW}px;top:${Math.floor(i/cols)*cellH}px"><div class="tile-meta"><span>${String(i+1).padStart(2,'0')} / ${esc(a.category||'RESEARCH')}</span><button data-remove="card:${esc(a.id)}" aria-label="Remove ${esc(title(a))} from my view">×</button></div><h2>${esc(title(a))}</h2><div class="tile-bottom"><span>${esc(a.status || 'Research note')}</span><button data-open="${esc(a.id)}" aria-label="Read ${esc(title(a))}">Read ↗</button></div></article>`).join('')}</div>
        </div>
        <div class="field-foot"><span class="field-count">${documents.length} documents</span><span>Drag a paper out to read / drag space to travel</span><div><button data-zoom="out" aria-label="Zoom out">−</button><button data-zoom="home" aria-label="Reset field position">⌖</button><button data-zoom="in" aria-label="Zoom in">+</button></div></div>
      </section>
      <aside class="workspace-legend" data-piece="legend" tabindex="0" aria-label="Field guide">
        <div class="piece-handle" data-drag-handle><span>A FIELD, NOT A FINISH LINE</span><button data-remove="legend" aria-label="Remove field guide from my view">×</button></div>
        <p>Materials.<br>Mathematics.<br><em>The unknown.</em></p><span class="legend-note">Solid: declared or derived links.<br>Dashed: suggested links.<br>Position is a reading arrangement.</span>
      </aside>
      <div class="reading-surface" aria-label="Open documents"></div>
      <section class="workspace-media" data-piece="media" tabindex="0" hidden aria-label="Optional research film"><div class="piece-handle" data-drag-handle><span>OPTIONAL / FILM STUDY</span><button data-remove="media" aria-label="Remove film from my view">×</button></div><video controls playsinline preload="none" src="/assets/media/fracture-to-field-web.mp4"></video><p>Generated creative media. Not a simulation.</p></section>
      <nav class="workspace-tools" aria-label="Workspace controls" data-html2canvas-ignore>
        <div class="view-switch"><button data-mode="grid">Grid</button><button data-mode="connections">Connections</button></div>
        <label class="workspace-search"><span>Find</span><input type="search" placeholder="Article, alloy, theorem…" aria-label="Find a document in the field"></label>
        <button class="workspace-math">∑ Math</button><button class="workspace-film">Film +</button><button class="workspace-capture">Capture ↗</button>
        <span class="tool-divider"></span><button class="workspace-remove" disabled>Remove selected</button><button class="workspace-undo" disabled>Undo</button><button class="workspace-reset">Reset view</button>
      </nav>
      <div class="workspace-feedback" role="status" aria-live="polite">Drag anything. Select + Delete to clear space. Your view is saved on this browser.</div>
    </section>
    <section class="workspace-journal" data-piece="journal" tabindex="0" aria-label="Research journal"><div class="piece-handle" data-drag-handle><span>THE WORK CONTINUES</span><button data-remove="journal" aria-label="Remove journal from my view">×</button></div><div class="journal-content"></div></section>
    <footer class="workspace-footer" data-piece="footer" tabindex="0"><div class="piece-handle" data-drag-handle><span>FROM THE FIELD</span><button data-remove="footer" aria-label="Remove footer from my view">×</button></div><a class="footer-brand" href="https://lupine.science"><img src="/lupine-science-icon.png" alt="" width="42" height="42"><span>Lupine Science</span></a><div><a href="#/read/changelog">Changelog & progress ↗</a><a href="https://github.com/alexwelcing/lupine-rhizo">Open source ↗</a></div><p>Evidence before claim.</p></footer>`;
  const stage=root.querySelector('.research-workspace'), field=root.querySelector('.knowledge-field'), viewport=root.querySelector('.field-viewport');
  const canvas=root.querySelector('canvas'), ctx=canvas.getContext('2d'), plane=root.querySelector('.document-plane');
  const feedback=root.querySelector('.workspace-feedback'), search=root.querySelector('.workspace-search input');
  const removeButton=root.querySelector('.workspace-remove'), undoButton=root.querySelector('.workspace-undo');
  const activityCleanup=renderActivity(root.querySelector('.journal-content'));
  const announce=text=>{feedback.textContent=text;};
  function persist(){try{store?.setItem(VIEW_KEY,JSON.stringify(state));}catch{announce('This view works for this visit; browser storage is unavailable.');}}
  function remember(){history.push(JSON.stringify(state));if(history.length>40)history.shift();undoButton.disabled=false;}
  function register(el){pieces.set(el.dataset.piece,el);}
  root.querySelectorAll('[data-piece]').forEach(register);
  function select(id){pieces.get(selected)?.classList.remove('piece-selected');selected=id;pieces.get(id)?.classList.add('piece-selected');removeButton.disabled=!id;}
  function applyPiece(id){
    const el=pieces.get(id);if(!el)return;
    const item=state.pieces[id]||{x:0,y:0,hidden:id==='media'};
    el.hidden=!!item.hidden;
    el.style.translate=`${item.x||0}px ${item.y||0}px`;
    if(el.hidden)el.querySelectorAll('video').forEach(v=>v.pause());
  }
  function apply(){
    for(const id of pieces.keys())applyPiece(id);
    for(const [id,el] of readers){if(!state.readers.includes(id)){pieces.delete(`reader:${id}`);el.remove();readers.delete(id);}}
    for(const id of state.readers)if(!readers.has(id))mountReader(id);
    field.dataset.mode=state.mode;
    root.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
    select(pieces.has(selected)&&!pieces.get(selected).hidden?selected:null);filter();
  }
  function remove(id){
    const el=pieces.get(id);if(!el||el.hidden)return;
    remember();state.pieces[id]={...(state.pieces[id]||{}),hidden:true};applyPiece(id);select(null);persist();filter();announce('Removed from your view. Undo brings it back.');
  }
  const readerReserve=()=>Math.max(130,root.querySelector('.workspace-tools').offsetHeight+68);
  function readerArticle(id){return articles?.find(a=>a.id===id&&a.lang==='en');}
  function mountReader(id){
    const a=readerArticle(id);if(!a)return;
    const pane=document.createElement('section');pane.className='paper-window';pane.dataset.piece=`reader:${id}`;pane.tabIndex=0;pane.setAttribute('aria-label',`${a.title} full article`);
    pane.style.zIndex=++z;
    pane.innerHTML=`<div class="piece-handle" data-drag-handle><span>${esc(a.title)}</span><div><button data-expand="${esc(id)}" aria-label="Expand article">↗</button><button data-remove="reader:${esc(id)}" aria-label="Close ${esc(a.title)}">×</button></div></div><div class="paper-source"><span>${esc(a.status||'Research note')} · full document</span><label class="math-scale">Math <input aria-label="Mathematics size" type="range" min="80" max="180" value="100" step="10"></label><a href="#/read/${encodeURIComponent(id)}">Dedicated reader ↗</a></div><div class="paper-body article-body">${a.html}</div>`;
    const body=pane.querySelector('.paper-body');
    pane.querySelector('.math-scale input').addEventListener('input',e=>body.style.setProperty('--paper-math',`${e.target.value}%`),{signal});
    // Scope anchors inside detached documents so multiple papers can coexist.
    const anchors=new Map();body.querySelectorAll('[id]').forEach(el=>{const old=el.id;el.id=`desk-${id}-${old}`;anchors.set(old,el.id);});
    body.querySelectorAll('a[href^="#"]').forEach(link=>{const key=link.getAttribute('href').slice(1);if(anchors.has(key))link.href=`#${anchors.get(key)}`;});
    body.addEventListener('click',e=>{const a=e.target.closest('a');if(a?.getAttribute('href')?.startsWith(`#desk-${id}-`)){e.preventDefault();body.querySelector(`[id="${CSS.escape(a.getAttribute('href').slice(1))}"]`)?.scrollIntoView({block:'start'});return;}onArticleLink?.(e,readerArticle(id));},{signal});
    root.querySelector('.reading-surface').append(pane);register(pane);readers.set(id,pane);
    const placement=state.pieces[pane.dataset.piece]||{};placement.x=clamp(placement.x||0,8,Math.max(8,stage.clientWidth-Math.min(600,stage.clientWidth-24)-8));placement.y=clamp(placement.y||48,24,Math.max(48,stage.clientHeight-readerReserve()-220));state.pieces[pane.dataset.piece]=placement;pane.style.height=`${Math.max(220,Math.min(600,stage.clientHeight-placement.y-readerReserve()))}px`;applyPiece(pane.dataset.piece);
  }
  async function openArticle(id, point){
    if(!articles){announce('Opening the complete document…');try{const data=await corpus;if(disposed)return;articles=data.articles;}catch{announce('Document preload unavailable. Use the dedicated reader from Browse.');return;}}
    if(!readerArticle(id))return;
    remember();if(!state.readers.includes(id)){state.readers.push(id);if(state.readers.length>12){const evicted=state.readers.shift();readers.get(evicted)?.remove();readers.delete(evicted);pieces.delete(`reader:${evicted}`);}}
    const rect=stage.getBoundingClientRect();
    state.pieces[`reader:${id}`]={hidden:false,x:clamp((point?.x??rect.left+rect.width*.47)-rect.left,8,Math.max(8,rect.width-Math.min(600,rect.width-24)-8)),y:clamp((point?.y??rect.top+95)-rect.top,48,Math.max(48,rect.height-readerReserve()-220))};
    if(!readers.has(id))mountReader(id);else applyPiece(`reader:${id}`);
    const pane=readers.get(id);pane.style.height=`${Math.max(220,Math.min(600,stage.clientHeight-state.pieces[`reader:${id}`].y-readerReserve()))}px`;pane.style.zIndex=++z;select(`reader:${id}`);pane.focus({preventScroll:true});persist();announce('Full article opened. Drag its top edge to move it; select text normally inside.');draw();
  }
  function packTiles(){
    let i=0;for(const a of documents){const el=pieces.get(`card:${a.id}`);const n=docNodes.get(a.id);if(el.hidden)continue;el.style.left=`${i%cols*cellW}px`;el.style.top=`${Math.floor(i/cols)*cellH}px`;if(n)positions.set(n.id,{x:i%cols*cellW+112,y:Math.floor(i/cols)*cellH+63});i++;}
  }
  function filter(){
    const q=search.value.trim().toLowerCase();let count=0;
    for(const a of documents){const el=pieces.get(`card:${a.id}`);const matches=[title(a),a.subtitle,...(a.tags||[])].join(' ').toLowerCase().includes(q);el.hidden=!!state.pieces[`card:${a.id}`]?.hidden||!matches;if(!el.hidden)count++;}
    packTiles();root.querySelector('.field-count').textContent=`${count} / ${documents.length} documents`;
    draw();
  }
  function draw(){
    if(disposed||field.hidden)return;
    const w=viewport.clientWidth,h=viewport.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    plane.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    const active=selected?.startsWith('reader:')?docNodes.get(selected.slice(7))?.id:pointer;
    const related=new Set();for(const l of graph.links)if(l.source===active||l.target===active){related.add(l.source);related.add(l.target);}
    const pos=id=>{const p=positions.get(id);return p?{x:p.x*zoom+pan.x,y:p.y*zoom+pan.y}:null;};
    ctx.lineWidth=1;
    for(const l of graph.links){const a=pos(l.source),b=pos(l.target);if(!a||!b)continue;const lit=l.source===active||l.target===active;ctx.strokeStyle=lit?'#8ca4fa99':state.mode==='connections'?'#657fc02b':'#52669616';ctx.setLineDash(l.provenance?.confidence==='suggested'?[3,5]:[]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    ctx.setLineDash([]);
    if(state.mode==='connections')for(const n of graph.nodes){const p=pos(n.id);if(p.x<0||p.y<0||p.x>w||p.y>h)continue;ctx.fillStyle=related.has(n.id)?'#d7e7fc':n.type==='article'?'#b7c4f3':'#657ca7';ctx.beginPath();ctx.arc(p.x,p.y,n.type==='article'?4:2,0,Math.PI*2);ctx.fill();if(n.id===active||related.has(n.id)||n.type==='article'){const t=title(n);if(!prepared.has(t))prepared.set(t,prepareWithSegments(t,'14px Newsreader'));ctx.font='14px Newsreader';layoutWithLines(prepared.get(t),160,17).lines.slice(0,2).forEach((l,i)=>ctx.fillText(l.text,p.x+9,p.y+17*i));}}
  }
  function endGesture(e,cancel=false){
    if(!gesture)return;const g=gesture;gesture=null;
    if(ghost){ghost.remove();ghost=null;}
    stage.classList.remove('is-dragging');
    if(cancel){if(g.kind==='piece'){state.pieces[g.id]=g.before;applyPiece(g.id);}return;}
    if(g.kind==='article'){if(g.moved)openArticle(g.id,{x:e.clientX-70,y:e.clientY-25});else openArticle(g.id);}
    if(g.kind==='piece'&&g.moved){history.push(g.snapshot);if(history.length>40)history.shift();undoButton.disabled=false;persist();}
    if(g.kind==='pan'&&!g.moved&&state.mode==='connections'){
      const rect=viewport.getBoundingClientRect();const x=(e.clientX-rect.left-pan.x)/zoom,y=(e.clientY-rect.top-pan.y)/zoom;
      const hit=graph.nodes.map(n=>({n,p:positions.get(n.id)})).filter(({p})=>Math.hypot(x-p.x,y-p.y)<22/zoom)[0]?.n;if(hit?.articleId)openArticle(hit.articleId);else if(hit){pointer=hit.id;announce(`${title(hit)} · ${hit.type}. Highlighted its source relationships.`);draw();}
    }
  }
  root.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    const piece=e.target.closest('[data-piece]');if(piece){select(piece.dataset.piece);if(piece.classList.contains('paper-window'))piece.style.zIndex=++z;}
    if(e.target.closest('button,a,input,textarea,select,video,.paper-body'))return;
    const card=e.target.closest('[data-article]');
    if(card){gesture={kind:'article',id:card.dataset.article,x:e.clientX,y:e.clientY,moved:false};card.focus({preventScroll:true});}
    else if(e.target.closest('[data-drag-handle]')||e.target.closest('.workspace-intro')){
      if(!piece)return;const id=piece.dataset.piece,before=state.pieces[id];gesture={kind:'piece',id,before:before?{...before}:undefined,snapshot:JSON.stringify(state),x:e.clientX,y:e.clientY,ox:before?.x||0,oy:before?.y||0,moved:false};piece.focus({preventScroll:true});
    }else if(e.target.closest('.field-viewport')){gesture={kind:'pan',x:e.clientX,y:e.clientY,ox:pan.x,oy:pan.y,moved:false};viewport.focus({preventScroll:true});}
    if(gesture){e.preventDefault();root.setPointerCapture(e.pointerId);}
  },{signal});
  root.addEventListener('pointermove',e=>{
    if(!gesture)return;const g=gesture,dx=e.clientX-g.x,dy=e.clientY-g.y;
    if(Math.hypot(dx,dy)>7)g.moved=true;if(!g.moved)return;stage.classList.add('is-dragging');
    if(g.kind==='pan'){pan={x:g.ox+dx,y:g.oy+dy};draw();}
    if(g.kind==='piece'){
      const el=pieces.get(g.id),rect=el.getBoundingClientRect();
      // Keep a reachable edge inside the viewport, including on small screens.
      const originX=rect.left-(state.pieces[g.id]?.x||0),originY=rect.top-(state.pieces[g.id]?.y||0);
      state.pieces[g.id]={hidden:false,x:clamp(g.ox+dx,-originX+16,innerWidth-originX-80),y:clamp(g.oy+dy,-originY+64,innerHeight-originY-70)};applyPiece(g.id);
    }
    if(g.kind==='article'){if(!ghost){ghost=document.createElement('div');ghost.className='paper-ghost';ghost.textContent=title(documents.find(a=>a.id===g.id));document.body.append(ghost);}ghost.style.left=`${e.clientX+14}px`;ghost.style.top=`${e.clientY+14}px`;}
  },{signal});
  root.addEventListener('pointerup',e=>endGesture(e),{signal});root.addEventListener('pointercancel',e=>endGesture(e,true),{signal});
  root.addEventListener('click',e=>{
    const close=e.target.closest('[data-remove]');if(close){remove(close.dataset.remove);return;}
    const open=e.target.closest('[data-open]');if(open){openArticle(open.dataset.open);return;}
    const expand=e.target.closest('[data-expand]');if(expand){const pane=readers.get(expand.dataset.expand);pane.classList.toggle('paper-expanded');return;}
    const mode=e.target.closest('[data-mode]');if(mode){remember();state.mode=mode.dataset.mode;field.dataset.mode=state.mode;if(state.mode==='connections'){zoom=.34;pan={x:viewport.clientWidth/2-880*zoom,y:viewport.clientHeight/2-840*zoom};}else{zoom=.82;pan={x:38,y:26};}apply();persist();return;}
    const zoomer=e.target.closest('[data-zoom]');if(zoomer){if(zoomer.dataset.zoom==='home'){zoom=.82;pan={x:38,y:26};}else{const old=zoom;zoom=clamp(zoom*(zoomer.dataset.zoom==='in'?1.2:1/1.2),.22,1.5);pan={x:viewport.clientWidth/2-(viewport.clientWidth/2-pan.x)*zoom/old,y:viewport.clientHeight/2-(viewport.clientHeight/2-pan.y)*zoom/old};}draw();}
  },{signal});
  viewport.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){const old=zoom;zoom=clamp(zoom*Math.exp(-e.deltaY*.007),.22,1.5);const r=viewport.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;pan={x:x-(x-pan.x)*zoom/old,y:y-(y-pan.y)*zoom/old};}else{pan.x-=e.deltaX;pan.y-=e.deltaY;}draw();},{signal,passive:false});
  function undo(){if(!history.length)return;state=JSON.parse(history.pop());apply();persist();undoButton.disabled=!history.length;announce('Restored the previous view.');}
  root.addEventListener('keydown',e=>{
    if(editTarget(e.target))return;
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();undo();return;}
    if((e.key==='Delete'||e.key==='Backspace')&&selected&&!window.getSelection()?.toString()){e.preventDefault();remove(selected);return;}
    const card=e.target.closest('[data-article]');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openArticle(card.dataset.article);return;}
    if(e.key==='Escape'){select(null);return;}
    if(e.target===viewport&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();pan.x+=e.key==='ArrowLeft'?100:e.key==='ArrowRight'?-100:0;pan.y+=e.key==='ArrowUp'?100:e.key==='ArrowDown'?-100:0;draw();}
  },{signal});
  root.addEventListener('focusin',e=>{const p=e.target.closest('[data-piece]');if(p)select(p.dataset.piece);},{signal});
  search.addEventListener('input',()=>{pan={x:38,y:26};filter();
    // Pack matching tiles so a search never leaves its first result off-screen.
    let i=0;for(const a of documents){const el=pieces.get(`card:${a.id}`);const n=docNodes.get(a.id);if(el.hidden)continue;el.style.left=`${i%cols*cellW}px`;el.style.top=`${Math.floor(i/cols)*cellH}px`;if(n)positions.set(n.id,{x:i%cols*cellW+112,y:Math.floor(i/cols)*cellH+63});i++;}draw();},{signal});
  removeButton.addEventListener('click',()=>remove(selected),{signal});undoButton.addEventListener('click',undo,{signal});
  root.querySelector('.workspace-reset').addEventListener('click',()=>{remember();state=blankView();search.value='';pan={x:38,y:26};zoom=.82;documents.forEach((a,i)=>{const el=pieces.get(`card:${a.id}`);el.style.left=`${i%cols*cellW}px`;el.style.top=`${Math.floor(i/cols)*cellH}px`;const n=docNodes.get(a.id);if(n)positions.set(n.id,{x:i%cols*cellW+112,y:Math.floor(i/cols)*cellH+63});});apply();persist();announce('Original layout restored. Undo is available.');},{signal});
  root.querySelector('.workspace-film').addEventListener('click',()=>{remember();state.pieces.media={hidden:false,x:0,y:0};applyPiece('media');select('media');pieces.get('media').focus({preventScroll:true});persist();},{signal});
  root.querySelector('.workspace-math').addEventListener('click',()=>{search.value='theorem';search.dispatchEvent(new Event('input'));announce('Theorem documents in the field. Open any paper to work with its live mathematics.');},{signal});
  root.querySelector('.workspace-capture').addEventListener('click',async e=>{
    const b=e.currentTarget;b.disabled=true;announce('Capturing your arrangement…');
    try{const capturePositions=new Map([...stage.querySelectorAll('[data-piece]')].map(el=>{const [x,y]=(el.style.translate||'0 0').split(' ').map(v=>parseFloat(v)||0);return [el.dataset.piece,{x:el.offsetLeft+x,y:el.offsetTop+y,width:el.offsetWidth,height:el.offsetHeight,moved:!!(x||y)}];}));const shot=await html2canvas(stage,{backgroundColor:'#07111c',scale:Math.min(devicePixelRatio||1,2),useCORS:true,logging:false,onclone:doc=>{doc.querySelectorAll('video,.math-scale').forEach(v=>v.remove());doc.querySelectorAll('[data-piece]').forEach(el=>{const p=capturePositions.get(el.dataset.piece);if(p?.moved&&!el.classList.contains('paper-expanded')){el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;el.style.right='auto';el.style.width=`${p.width}px`;el.style.height=`${p.height}px`;el.style.boxSizing='border-box';}el.style.translate='none';});const f=doc.querySelector('.workspace-feedback');if(f)f.textContent=`Lupine Library / ${new Date().toISOString()} / ${manifest.version.slice(0,12)}`;}});const blob=await new Promise(r=>shot.toBlob(r,'image/png'));if(!blob)throw Error();const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`lupine-workspace-${Date.now()}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);announce('Your workspace was captured with its source version.');}catch{announce('Capture unavailable. Your arrangement and documents are still here.');}finally{b.disabled=false;}
  },{signal});
  corpus.then(data=>{if(disposed)return;articles=data.articles;apply();announce(`${manifest.articles.length} documents ready. Pull one into your space. Changes stay on this browser.`);}).catch(()=>announce('Text preload unavailable. Use the dedicated readers from Browse.'));
  const observer=new ResizeObserver(()=>{draw();for(const pane of readers.values())pane.style.maxWidth=`${Math.max(260,stage.clientWidth-24)}px`;});observer.observe(viewport);
  document.fonts.ready.then(()=>{if(!disposed){prepared.clear();draw();}});
  if(state.mode==='connections'){zoom=.34;pan={x:viewport.clientWidth/2-880*zoom,y:viewport.clientHeight/2-840*zoom};}
  apply();
  return()=>{disposed=true;abort.abort();observer.disconnect();ghost?.remove();root.querySelectorAll('video').forEach(v=>v.pause());activityCleanup?.();};
}
