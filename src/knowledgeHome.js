import { HOME_VIEWS, buildHomeGraph, filterHomeGraph, layoutHomeGraph, normalizeKeyword, keywordLabel } from './knowledgeHomeModel.js';
const el = (tag,text,cls) => {const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const svgEl = (tag,attrs={}) => {const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));return n;};
const link = (text,url) => {const n=el('a',text);n.href=url;return n;};
const colors=['#a9a2e6','#71c6bf','#dea479','#91bbdb','#cc95bb','#c2c079','#bc9b89','#93bfa0'];
const plural = (n,word) => `${n} ${word}${n===1?'':'s'}`;

export function renderKnowledgeHome(mount,{manifest,graph}) {
  const model=buildHomeGraph(manifest,graph);let query='',mode='equal',selected=null,active=-1,open=false,filterOptions=false,disposed=false;
  const root=el('section',null,'knowledge-home');root.setAttribute('aria-labelledby','knowledge-home-title');
  const head=el('header',null,'knowledge-home-head');const title=el('h1','Materials science, connected.');title.id='knowledge-home-title';
  head.append(title,el('p','Find a keyword. See the work around it.'));
  const controls=el('div',null,'knowledge-home-controls'),keyword=el('div',null,'knowledge-home-keyword');
  const fieldLabel=el('label','Keyword');fieldLabel.htmlFor='knowledge-keyword';
  const input=el('input');input.id='knowledge-keyword';input.type='text';input.placeholder='All keywords';input.autocomplete='off';
  input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls','knowledge-keyword-options');input.setAttribute('aria-expanded','false');
  const count=el('span','', 'knowledge-home-count');count.id='knowledge-keyword-count';input.setAttribute('aria-describedby',count.id);
  const inputWrap=el('div',null,'knowledge-home-input');inputWrap.append(input,count);
  const options=el('div',null,'knowledge-home-options');options.id='knowledge-keyword-options';options.setAttribute('role','listbox');options.setAttribute('aria-label','Keywords sorted by article count');options.hidden=true;
  keyword.append(fieldLabel,inputWrap,options);
  const viewLabel=el('label','Visual emphasis','knowledge-home-view');viewLabel.htmlFor='knowledge-view';
  const view=el('select');view.id='knowledge-view';for(const option of HOME_VIEWS){const item=el('option',option.label);item.value=option.id;view.append(item);}viewLabel.append(view);controls.append(keyword,viewLabel);
  const status=el('p','', 'knowledge-home-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const chart=el('div',null,'knowledge-home-chart');chart.setAttribute('aria-label','Article knowledge graph');
  const legend=el('div',null,'knowledge-home-legend');const detail=el('section',null,'knowledge-home-detail');detail.setAttribute('aria-label','Selected article');
  const list=el('details',null,'knowledge-home-list'),listSummary=el('summary'),listBody=el('ul');list.append(listSummary,listBody);
  const footer=el('nav',null,'knowledge-home-more');footer.setAttribute('aria-label','More ways to explore');
  footer.append(link('Research connections →','#/connections'),link('Latest research →','#/research'),link('Full knowledge map →','#/graph'),link('All articles →','/articles/'),link('Topics & references →','/topics/'),link('Reading guides →','/guides/'));
  root.append(head,controls,status,chart,legend,detail,list,footer);mount.replaceChildren(root);
  let filtered=filterHomeGraph(model),optionValues=[];

  function closeOptions(){open=false;active=-1;options.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}
  function choose(value){query=value;input.value=model.keywords.find(k=>k.key===value)?.label || value;closeOptions();draw();input.focus();}
  function drawOptions(){
    const q=filterOptions?normalizeKeyword(input.value):'';
    optionValues=[{key:'',label:'All keywords',count:model.nodes.length},...model.keywords.filter(k=>!q||normalizeKeyword(`${k.key} ${k.label}`).includes(q))];
    options.replaceChildren();
    optionValues.forEach((k,i)=>{const option=el('button',null,'knowledge-home-option');option.type='button';option.id=`knowledge-keyword-option-${i}`;option.setAttribute('role','option');option.setAttribute('aria-selected',String(i===active));option.tabIndex=-1;
      option.append(el('span',k.label),el('span',plural(k.count,'article')));option.onmousedown=e=>e.preventDefault();option.onclick=()=>choose(k.key);options.append(option);
    });
    if(active>=optionValues.length)active=-1;
    if(active>=0)input.setAttribute('aria-activedescendant',`knowledge-keyword-option-${active}`);else input.removeAttribute('aria-activedescendant');
    options.hidden=!open;input.setAttribute('aria-expanded',String(open));
  }
  function showOptions(){open=true;filterOptions=false;active=-1;drawOptions();}
  function select(id,focus=false){selected=id;draw();if(focus)chart.querySelector('[aria-pressed="true"]')?.focus?.();}
  function draw(){
    if(disposed)return;filtered=filterHomeGraph(model,query);
    if(selected&&!filtered.nodes.some(n=>n.id===selected))selected=null;
    count.textContent=plural(filtered.nodes.length,'article');listSummary.textContent=`Read as a list · ${plural(filtered.nodes.length,'article')}`;
    const size=Math.max(280,chart.clientWidth||900),layout=layoutHomeGraph(filtered.nodes,size,mode,filtered.links),byId=new Map(layout.nodes.map(n=>[n.id,n]));
    const svg=svgEl('svg',{viewBox:`0 0 ${layout.width} ${layout.height}`,width:'100%',height:layout.height,'aria-label':`${plural(filtered.nodes.length,'article')} in the knowledge graph`,role:'group'});
    const selectedLinks=filtered.links.filter(l=>l.source===selected||l.target===selected),connected=new Set(selectedLinks.flatMap(l=>[l.source,l.target]));
    const categories=[...new Set(model.nodes.map(n=>n.categoryLabel))].sort(),statuses=[...new Set(model.nodes.map(n=>n.statusLabel))].sort();
    const colorFor=n=>mode==='recent'&&!n.date?'#737887':mode==='category'?colors[categories.indexOf(n.categoryLabel)%colors.length]:mode==='status'?(n.statusLabel==='Not classified'?'#7e8392':colors[statuses.indexOf(n.statusLabel)%colors.length]):'#a9a2e6';
    for(const edge of filtered.links){const a=byId.get(edge.source),b=byId.get(edge.target),line=svgEl('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,'class':edge.source===selected||edge.target===selected?'is-connected':''});line.dataset.relation=edge.relation;svg.append(line);}
    for(const n of layout.nodes){
      const button=svgEl('g',{role:'button',tabindex:'0','aria-label':`${n.title}; ${plural(n.connectionCount,'connection')}${n.date?`; ${n.date.kind} ${n.date.value.slice(0,10)}`:''}`,'aria-pressed':String(n.id===selected),'class':`knowledge-home-node${n.id===selected?' is-selected':''}${selected&&!connected.has(n.id)?' is-muted':''}`});
      const tooltip=svgEl('title');tooltip.textContent=n.title;button.append(tooltip,svgEl('circle',{cx:n.x,cy:n.y,r:17,'class':'knowledge-home-hit'}),svgEl('circle',{cx:n.x,cy:n.y,r:n.radius,fill:colorFor(n),'class':'knowledge-home-dot'}));
      button.onclick=()=>select(n.id);button.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(n.id,true);}};svg.append(button);
    }
    chart.replaceChildren(svg);legend.replaceChildren();
    if(mode==='category'||mode==='status')for(const value of mode==='category'?categories:statuses){const chip=el('span',value);const dot=el('i');dot.style.background=mode==='status'&&value==='Not classified'?'#7e8392':colors[(mode==='category'?categories:statuses).indexOf(value)%colors.length];chip.prepend(dot);legend.append(chip);}
    const dated=filtered.nodes.filter(n=>n.date).length;
    const notes={equal:'Each dot is an article. Select one to explore its connections.',connections:'Larger dots have more article connections in the full map.',recent:`Document dates: ${dated} known · ${filtered.nodes.length-dated} unknown. Newer dated articles are larger; undated dots stay neutral.`,category:'Colors show research areas from the Library taxonomy.',status:'Colors show recorded evidence status. A status is not independent validation.'};
    status.textContent=filtered.nodes.length?notes[mode]:'No articles match this keyword. Try a broader term.';
    const current=byId.get(selected);detail.replaceChildren();
    if(current){detail.append(el('p',current.categoryLabel,'knowledge-home-kicker'),link(current.title,`/articles/${encodeURIComponent(current.id)}/`),el('p',current.subtitle));
      const meta=[`${plural(current.connectionCount,'connection')} in full map`,current.date?`${current.date.kind} ${current.date.value.slice(0,10)}`:'Date unavailable',current.statusLabel];detail.append(el('p',meta.join(' · '),'knowledge-home-meta'));
      if(selectedLinks.length){const neighbors=el('ul');for(const e of selectedLinks){const other=byId.get(e.source===selected?e.target:e.source),item=el('li');item.append(link(other.title,`/articles/${encodeURIComponent(other.id)}/`),el('span',` · ${e.label||e.relation}${e.evidence?`: ${String(e.evidence).split(',').map(value=>keywordLabel(value.trim())).join(', ')}`:''}`));neighbors.append(item);}detail.append(neighbors);}
      else detail.append(el('p','No direct article connections in this selection.','knowledge-home-meta'));
    }else detail.append(el('p','Lines connect articles that share multiple keywords. They do not establish scientific agreement. Select a dot for its title and related work.','knowledge-home-meta'));
    listBody.replaceChildren(...filtered.nodes.map(n=>{const li=el('li');li.append(link(n.title,`/articles/${encodeURIComponent(n.id)}/`),el('span',n.categoryLabel));return li;}));
  }
  input.onfocus=showOptions;input.onclick=showOptions;
  input.oninput=()=>{query=input.value;active=-1;open=true;filterOptions=true;drawOptions();draw();};
  input.onkeydown=e=>{
    if(e.key==='Escape'){closeOptions();return;}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!open){filterOptions=false;active=-1;}open=true;active=Math.max(0,Math.min(optionValues.length-1,active+(e.key==='ArrowDown'?1:-1)));drawOptions();options.children[active]?.scrollIntoView?.({block:'nearest'});}
    if(e.key==='Enter'){e.preventDefault();if(open&&active>=0)choose(optionValues[active].key);else{query=input.value;closeOptions();draw();}}
    if(e.key==='Tab')closeOptions();
  };
  view.onchange=()=>{mode=HOME_VIEWS.some(v=>v.id===view.value)?view.value:'equal';draw();};
  const outside=e=>{if(!keyword.contains(e.target))closeOptions();};document.addEventListener('pointerdown',outside);
  const resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>draw()):null;resize?.observe(chart);draw();
  return()=>{disposed=true;resize?.disconnect();document.removeEventListener('pointerdown',outside);};
}
