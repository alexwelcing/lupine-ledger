import test from 'node:test';
import assert from 'node:assert/strict';
import { createPublicSearch } from '../src/publicSearch.js';
import { createPublicActivityStore, validateArchive, ARCHIVE_SCHEMA } from '../src/publicActivityStore.js';
import fs from 'node:fs';
const fixture=JSON.parse(fs.readFileSync(new URL('../content/research-activity.json',import.meta.url))).items[0];
const page=(records=[],nextAfter=null)=>({schema:ARCHIVE_SCHEMA,records,cursor:{after:0,snapshot:4,nextAfter},coverage:{complete:nextAfter===null,returned:records.length},hashes:records.map(r=>({id:r.id,sha256:'0'.repeat(64)}))});
test('searches public article bodies and reviewed activity fields; updates and deletes postings',()=>{
 const s=createPublicSearch();s.article({id:'a',title:'Article'},'shear–response');assert.equal(s.search('shear response').length,1);
 s.article({id:'a',title:'Article'},'new text');assert.equal(s.search('shear').length,0);
 s.activity(fixture);assert.ok(s.search(fixture.findings[0]).some(r=>r.kind==='activity'));
 assert.throws(()=>s.activity({...fixture,visibility:'private'}));s.remove(`activity:${fixture.id}`);assert.equal(s.search(fixture.title).length,0);
});
test('archive rejects nonprogress, changed snapshots, duplicates and malformed hashes',()=>{
 assert.throws(()=>validateArchive(page([fixture],0),0,null));
 assert.throws(()=>validateArchive(page(),0,3));
 assert.throws(()=>validateArchive(page([fixture,fixture]),0,null));
 const p=page([fixture]);p.hashes=[];assert.throws(()=>validateArchive(p,0,null));
 assert.equal(validateArchive(page(),0,null).coverage.complete,true);
});
test('archive preserves available state on503 and rejects bad response hashes',async()=>{
 const store=createPublicActivityStore({endpoint:'https://research.lupine.science/research/activity',fetcher:async()=>new Response('',{status:503})});
 await store.loadMore();assert.equal(store.state.archiveError,true);assert.equal(store.state.archiveComplete,false);
 const bad=createPublicActivityStore({endpoint:'https://research.lupine.science/research/activity',fetcher:async()=>new Response(JSON.stringify(page([fixture])))});
 await bad.loadMore();assert.equal(bad.state.records.length,0);assert.equal(bad.state.archiveError,true);
});
test('pages pin snapshot, verify hashes and incrementally refresh from previous snapshot',async()=>{
 const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(fixture))))].map(x=>x.toString(16).padStart(2,'0')).join('');
 const urls=[];const store=createPublicActivityStore({endpoint:'https://research.lupine.science/research/activity',fetcher:async url=>{
 urls.push(new URL(url));const p=page([fixture],urls.length===1?2:null);p.cursor.after=Number(urls.at(-1).searchParams.get('after'));if(urls.length===3){p.cursor.snapshot=5;p.records=[];p.hashes=[];p.coverage.returned=0;}else p.hashes[0].sha256=hash;
 return new Response(JSON.stringify(p));}});
 await store.loadMore();assert.equal(store.state.archiveComplete,false);await store.loadMore();assert.equal(urls[1].searchParams.get('snapshot'),'4');assert.equal(urls[1].searchParams.get('after'),'2');assert.equal(store.state.archiveComplete,true);
 await store.loadMore({refresh:true});assert.equal(urls[2].searchParams.get('after'),'4');assert.equal(urls[2].searchParams.has('snapshot'),false);assert.equal(store.state.records.length,1);
});
test('detail uses the existing public feed contract and checks requested identity',async()=>{
 let requested;const store=createPublicActivityStore({endpoint:'https://research.lupine.science/research/activity',fetcher:async url=>{requested=url;return new Response(JSON.stringify({schema:'lupine.public_research_activity_feed.v1',items:[fixture],truncated:false}));}});
 await store.loadRecord(fixture.id);assert.equal(new URL(requested).pathname,`/research/activity/${fixture.id}`);assert.equal(store.state.records[0].id,fixture.id);
 const bad=createPublicActivityStore({endpoint:'https://research.lupine.science/research/activity',fetcher:async()=>new Response(JSON.stringify({schema:'lupine.public_research_activity_feed.v1',items:[fixture],truncated:false}))});
 await bad.loadRecord('different-record');assert.equal(bad.state.records.length,0);assert.equal(bad.state.archiveError,true);
});

test('search retains ancestry when correction does not match historical query',()=>{
 const s=createPublicSearch(),old={...fixture,id:'old-record',supersedes:null,correctionReason:null,title:'Historical zirconium'};
 const next={...fixture,id:'new-record',supersedes:old.id,correctionReason:'Revised denominator',title:'Corrected comparison'};
 s.activity(old);s.activity(next);
 assert.equal(s.search('historical zirconium')[0].supersededBy,next.id);
 assert.equal(s.search('historical zirconium')[0].route,'#/activity/old-record');
 assert.equal(s.search('revised denominator')[0].correctionReason,next.correctionReason);
 assert.equal(s.search('revised denominator')[0].supersedes,old.id);
 s.remove('activity:new-record');assert.equal(s.search('historical zirconium')[0].supersededBy,null);
});
test('archive and detail cancel oversized streams or declared bodies before accepting records',async()=>{
 for(const mode of ['archive','detail'])for(const declared of [true,false]){
  let cancelled=false,reads=0;
  const response={ok:true,headers:new Headers(declared?{'content-length':'850001'}:{}),body:{
   async cancel(){cancelled=true;},getReader(){return {async read(){reads++;return {done:false,value:new Uint8Array(425001)};},async cancel(){cancelled=true;},releaseLock(){}};}
  },text(){throw Error('Unbounded text called');}};
  const store=createPublicActivityStore({endpoint:'https://research.lupine.science/research/activity',fetcher:async()=>response});
  if(mode==='archive')await store.loadMore();else await store.loadRecord('missing-record');
  assert.equal(cancelled,true);assert.equal(reads,declared?0:2);assert.equal(store.state.records.length,0);assert.equal(store.state.archiveError,true);
 }
});
test('historical detail links successor and partial archive disclaims currentness',async()=>{
 const {renderPublicResearch}=await import('../src/publicResearchView.js');
 class Element{
  constructor(tag){this.classList={add(){}};this.tag=tag;this.children=[];this.attributes={};this.textContent='';}
  append(...x){this.children.push(...x);}prepend(...x){this.children.unshift(...x);}
  replaceChildren(...x){this.children=x;}setAttribute(k,v){this.attributes[k]=v;}
  querySelector(tag){return this.children.find(x=>x.tag===tag)||this.children.map(x=>x.querySelector?.(tag)).find(Boolean);}
 }
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{
  const old={...fixture,id:'old-record',supersedes:null,correctionReason:null};
  const next={...fixture,id:'new-record',supersedes:old.id,correctionReason:'Updated source comparison'};
  const state={records:[old,next],archiveComplete:false,source:'live',archiveLoading:false};
  const store={state,subscribe(fn){fn(state);return ()=>{};},refresh(){},loadRecord(){},loadMore(){}};
  const mount=new Element('main');renderPublicResearch(mount,old.id,store);
  const flatten=n=>[n,...n.children.flatMap(flatten)],nodes=flatten(mount);
  assert.ok(nodes.some(n=>n.textContent.includes('Corrections may exist outside the loaded records')));
  assert.ok(nodes.some(n=>n.textContent==='Superseded record. '));
  assert.ok(nodes.some(n=>n.textContent==='Read correction'&&n.href==='#/activity/new-record'));
  assert.ok(nodes.some(n=>n.href==='#/activity/old-record'));
 }finally{globalThis.document=previous;}
});


test('source labels retrieve the released overlap finding instead of only the earlier unresolved audit',()=>{
 const feed=JSON.parse(fs.readFileSync(new URL('../content/research-activity.json',import.meta.url)));
 const search=createPublicSearch();
 for(const record of feed.items) search.activity(record);
 const target=feed.items.find(record=>record.id==='pinned-source-overlap-20261006-completed-v1');
 assert.ok(target);
 const results=search.search('pinned pilot overlap');
 assert.equal(results[0]?.id,target.id);
 assert.ok(results.some(record=>record.id==='validation-eligibility-20261006-completed-v1'));
 for(const limitation of target.limitations) assert.ok(results[0].body.includes(limitation));
});
test('indexes validated source labels without mutating records or indexing source URLs',()=>{
 const record={...fixture,id:'source-label-case',sources:[{
  label:'Evidence label sentinel',url:'https://evidence.example.org/urlsentinel'
 }]};
 const original=JSON.stringify(record),search=createPublicSearch();
 search.activity(record);
 assert.equal(search.search('evidence label sentinel')[0]?.id,record.id);
 assert.equal(search.search('urlsentinel').length,0);
 assert.equal(JSON.stringify(record),original);
});

test('article search retains supplied lifecycle state across updates without inventing one',()=>{
 const search=createPublicSearch(),article={id:'bounded-claim',title:'Intrinsic dimension',status:'refuted'};
 search.article(article);
 assert.equal(search.search('intrinsic dimension')[0].status,'refuted');
 search.article({...article,status:'open'});
 assert.equal(search.search('intrinsic dimension')[0].status,'open');
 search.article({id:article.id,title:article.title});
 assert.equal(search.search('intrinsic dimension')[0].status,null);
 assert.equal(article.status,'refuted');
});
test('search result displays article state with its claim and preserves correction navigation',async()=>{
 const {createPublicSearchResult}=await import('../src/publicSearchView.js');
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.textContent='';}
  append(...children){this.children.push(...children);}
 }
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{
  let navigated=0;
  const options={statuses:{refuted:{label:{en:'Refuted by us'}}},translate:v=>typeof v==='string'?v:v.en,onNavigate:()=>navigated++};
  const article=createPublicSearchResult({kind:'article',title:'Intrinsic dimension',subtitle:'A bounded observation remains',status:'refuted',route:'#/read/bounded-claim'},options);
  const nodes=article.children[0].children;
  assert.deepEqual(nodes.map(n=>n.textContent),['Intrinsic dimension','Status: Refuted by us','A bounded observation remains']);
  assert.equal(article.children[0].href,'#/read/bounded-claim');
  article.children[0].onclick();assert.equal(navigated,1);
  const unknown=createPublicSearchResult({kind:'article',title:'Unclassified',status:'unresolved',route:'#/read/u'},options);
  assert.equal(unknown.children[0].children[1].textContent,'Status: unresolved');
  const absent=createPublicSearchResult({kind:'article',title:'No supplied state',route:'#/read/a'},options);
  assert.equal(absent.children[0].children.length,1);
  const activity=createPublicSearchResult({kind:'activity',title:'Historical finding',status:'open',route:'#/activity/old',supersededBy:'new-record'},options);
  assert.equal(activity.children[0].children.length,1);
  assert.equal(activity.children[1].textContent,'Superseded record · ');
  assert.equal(activity.children[2].href,'#/activity/new-record');
  activity.children[2].onclick();assert.equal(navigated,2);
 }finally{globalThis.document=previous;}
});
