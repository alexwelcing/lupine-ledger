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
