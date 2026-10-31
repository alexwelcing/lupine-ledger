import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { articleDate, buildHomeGraph, filterHomeGraph, keywordLabel, layoutHomeGraph } from '../src/knowledgeHomeModel.js';
const a=(id,tags,extra={})=>({id,title:{en:`Title ${id}`},subtitle:{en:'Research context'},tags,...extra});
const manifest={articles:[a('a',['mlip','mlip','lean'],{category:'methods'}),a('b',['mlip'],{category:'methods'}),a('c',['lean','water'],{category:'validation'})],categories:[{id:'methods',label:{en:'Methods'}},{id:'validation',label:{en:'Validation'}}],statuses:{}};
const graph={links:[{id:'ab',source:'article:a',target:'article:b',relation:'related',evidence:'mlip, lean'},{id:'tag',source:'article:a',target:'tag:mlip',relation:'tagged'},{id:'missing',source:'article:a',target:'article:absent',relation:'related'}]};

test('keyword counts count articles once and sort by count then descriptive label',()=>{
 const model=buildHomeGraph(manifest,graph);
 assert.deepEqual(model.keywords.map(k=>[k.key,k.count]),[['lean',2],['mlip',2],['water',1]]);
 assert.equal(model.keywords.find(k=>k.key==='mlip').label,'Machine learning interatomic potentials (MLIP)');
 assert.equal(filterHomeGraph(model,'MLIP').nodes.length,2);
 assert.equal(filterHomeGraph(model,'machine learning interatomic potentials (mlip)').nodes.length,2);
 assert.equal(filterHomeGraph(model,'water').nodes.length,1);
 assert.equal(filterHomeGraph(model,'unmatched').nodes.length,0);
 assert.equal(filterHomeGraph(model,'').nodes.length,3);
});
test('free text includes source aliases while exact keyword membership remains exact',()=>{
 const model=buildHomeGraph({...manifest,articles:[a('x',['wave'],{title:'A pressure study',searchAliases:['Original wave function study']}),a('y',['waves'],{title:'Wave study'})]},{});
 assert.deepEqual(filterHomeGraph(model,'wave').nodes.map(n=>n.id),['x']);
 assert.deepEqual(filterHomeGraph(model,'original function').nodes.map(n=>n.id),['x']);
});
test('only retained article links count; filtered graph preserves actual relations and provenance',()=>{
 const before=JSON.stringify({manifest,graph}),model=buildHomeGraph(manifest,graph);
 assert.equal(model.links.length,1);assert.equal(model.nodes.find(n=>n.id==='a').connectionCount,1);
 assert.equal(filterHomeGraph(model,'water').links.length,0);assert.equal(filterHomeGraph(model,'mlip').links[0].evidence,'mlip, lean');
 assert.equal(JSON.stringify({manifest,graph}),before);
});
test('recency rejects export and filename guesses, validates real dates, and uses qualified document header',()=>{
 assert.equal(articleDate({id:'result-2026-10-30',source:'articles/2026-10-30.md',generatedAt:'2026-10-30',exportedAt:'2026-10-30'}),null);
 assert.equal(articleDate({datePublished:'2026-02-30'}),null);
 assert.equal(articleDate({documentDate:{value:'2026-10-30',basis:'filename',sourceLine:1}}),null);
 assert.equal(articleDate({documentDate:{value:'2026-10-30',basis:'document-header',sourceLine:3}}).kind,'Document date');
 assert.equal(articleDate({datePublished:'2026-10-30'}).kind,'Published');
});
test('mobile layout keeps every selectable node inside bounds and non-overlapping',()=>{
 const nodes=Array.from({length:96},(_,i)=>({id:String(i),connectionCount:i,date:i%2?null:{ms:i,value:'2026-10-30'}}));
 for(const width of [320,390,900,1200])for(const mode of ['equal','connections','recent']){
  const result=layoutHomeGraph(nodes,width,mode);assert.equal(result.nodes.length,96);
  for(const n of result.nodes){assert(n.x-n.radius>=0&&n.x+n.radius<=result.width);assert(n.y-n.radius>=0&&n.y+n.radius<=result.height);}
  for(let i=0;i<96;i++)for(let j=i+1;j<96;j++){const a=result.nodes[i],b=result.nodes[j];assert(Math.hypot(a.x-b.x,a.y-b.y)>a.radius+b.radius);}
 }
 assert.deepEqual(layoutHomeGraph(nodes,390),layoutHomeGraph(nodes,390));
});
test('sizing changes actual radius, and unknown dates stay neutral instead of appearing oldest',()=>{
 const nodes=[{id:'a',connectionCount:0,date:{ms:1}},{id:'b',connectionCount:5,date:{ms:2}},{id:'c',connectionCount:2,date:null}];
 assert(layoutHomeGraph(nodes,390,'connections').nodes[1].radius>layoutHomeGraph(nodes,390,'connections').nodes[0].radius);
 const recent=layoutHomeGraph(nodes,390,'recent');assert(recent.nodes[1].radius>recent.nodes[0].radius);assert.equal(recent.nodes[2].radius,8);
});
test('actual Library keyword counts reconcile with metadata and every article remains reachable',()=>{
 const m=JSON.parse(fs.readFileSync(new URL('../dist/data/library.json',import.meta.url))),g=JSON.parse(fs.readFileSync(new URL('../dist/data/knowledge-graph.json',import.meta.url)));
 const model=buildHomeGraph(m,g);assert.equal(model.nodes.length,m.articles.length);assert.equal(new Set(model.nodes.map(n=>n.id)).size,m.articles.length);
 for(const k of model.keywords)assert.equal(k.count,m.articles.filter(a=>new Set(a.tags.map(t=>t.toLowerCase())).has(k.key)).length);
 assert(model.links.every(l=>l.source!==l.target));
});

class Element {
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.style={};this.dataset={};this.textContent='';this.hidden=false;this.value='';this.clientWidth=390;}
 append(...items){for(const n of items){if(n&&typeof n==='object'){if(n.parent)n.parent.children=n.parent.children.filter(c=>c!==n);n.parent=this;}this.children.push(n);}}prepend(...items){this.children.unshift(...items);}
 replaceChildren(...items){this.children=[];this.append(...items);}setAttribute(k,v){this.attributes[k]=String(v);}removeAttribute(k){delete this.attributes[k];}
 contains(n){return this===n||this.children.some(c=>c?.contains?.(n));}focus(){this.focused=true;}scrollIntoView(){}
 querySelector(){return descendants(this).find(n=>n.attributes['aria-pressed']==='true');}
}
const descendants=n=>[n,...n.children.filter(c=>c instanceof Element).flatMap(descendants)];
const text=n=>n.textContent+ n.children.map(c=>typeof c==='string'?c:text(c)).join('');

test('homepage has two primary controls, counts/dropdown, keyboard selection, empty state and cleanup',async()=>{
 const old=globalThis.document,events=new Map();globalThis.document={createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag),addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k)};
 try{
  const {renderKnowledgeHome}=await import('../src/knowledgeHome.js');const mount=new Element('main'),cleanup=renderKnowledgeHome(mount,{manifest,graph});
  const nodes=()=>descendants(mount),input=nodes().find(n=>n.tag==='input'),select=nodes().find(n=>n.tag==='select');
  assert.equal(nodes().filter(n=>n.tag==='input'||n.tag==='select').length,2);
  assert.equal(input.attributes.role,'combobox');input.onfocus();assert.equal(input.attributes['aria-expanded'],'true');
  const optionRows=nodes().filter(n=>n.attributes.role==='option');assert.equal(optionRows.length,4);assert(text(optionRows[1]).includes('Lean'));assert(text(optionRows[1]).includes('2 articles'));
  input.onkeydown({key:'ArrowDown',preventDefault(){}});input.onkeydown({key:'ArrowDown',preventDefault(){}});input.onkeydown({key:'Enter',preventDefault(){}});
  assert.equal(input.value,'Lean formal verification');assert.equal(input.attributes['aria-expanded'],'false');assert.equal(nodes().filter(n=>n.tag==='g'&&n.attributes.role==='button').length,2);
  input.onclick();assert.equal(nodes().filter(n=>n.attributes.role==='option').length,4); // reopen full count-sorted vocabulary, not only the selected word
  input.value='missing';input.oninput();assert.equal(nodes().filter(n=>n.tag==='g'&&n.attributes.role==='button').length,0);assert(text(mount).includes('No articles match'));
  input.value='';input.oninput();select.value='recent';select.onchange();assert(text(mount).includes('0 known · 3 unknown'));
  const button=nodes().find(n=>n.tag==='g'&&n.attributes.role==='button');button.onkeydown({key:'Enter',preventDefault(){}});assert(nodes().some(n=>n.tag==='a'&&n.href.startsWith('/articles/')));
  cleanup();assert.equal(events.size,0);
 }finally{globalThis.document=old;}
});


test('network geometry brings retained neighbors closer without adding edges or matrix rows',()=>{
 const m=JSON.parse(fs.readFileSync(new URL('../dist/data/library.json',import.meta.url))),g=JSON.parse(fs.readFileSync(new URL('../dist/data/knowledge-graph.json',import.meta.url))),model=buildHomeGraph(m,g);
 const before=JSON.stringify(model.links);
 for(const width of [320,390,1200]){
  const layout=layoutHomeGraph(model.nodes,width,'equal',model.links),map=new Map(layout.nodes.map(n=>[n.id,n]));
  assert(layout.height <= (width<600?600:430));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),edgeIds=new Set(model.links.map(e=>[e.source,e.target].sort().join(':')));
  let edgeLength=0,otherLength=0,others=0;
  for(const e of model.links)edgeLength+=distance(map.get(e.source),map.get(e.target));
  for(let i=0;i<layout.nodes.length;i++)for(let j=i+1;j<layout.nodes.length;j++){
   const a=layout.nodes[i],b=layout.nodes[j],d=distance(a,b);assert(d>=34);
   if(!edgeIds.has([a.id,b.id].sort().join(':'))){otherLength+=d;others++;}
  }
  assert(edgeLength/model.links.length < otherLength/others*.6);
  assert(new Set(layout.nodes.map(n=>Math.round(n.y))).size>layout.nodes.length*.5);
  assert.deepEqual(layoutHomeGraph(model.nodes,width,'equal',model.links),layout);
 }
 assert.equal(JSON.stringify(model.links),before);
 const few=filterHomeGraph(model,'lean'),spread=layoutHomeGraph(few.nodes,390,'equal',few.links);
 assert(Math.max(...spread.nodes.map(n=>n.y))-Math.min(...spread.nodes.map(n=>n.y))>60);
});

test('common scientific acronyms expand without guessing unknown campaign codes',()=>{
 const examples={UQ:'Uncertainty quantification',GNN:'Graph neural networks',HPC:'High-performance computing',NEB:'Nudged elastic band',SCF:'Self-consistent field',BCC:'Body-centered cubic',FCC:'Face-centered cubic',Ni:'Nickel',Fe:'Iron',Au:'Gold',RG:'Renormalization group',TDA:'Topological data analysis'};
 for(const [key,label] of Object.entries(examples))assert(keywordLabel(key).startsWith(label));
 assert.equal(keywordLabel('unmapped-code'),'Unmapped code');
});
