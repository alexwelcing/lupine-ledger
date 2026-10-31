import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalEvidence,evidenceHash} from '../src/publicResearchEvidence.js';
import {fetchSourceAvailabilityNotice,sourceAvailabilityHash,verifySourceAvailabilityTarget,renderSourceAvailabilityNotice} from '../src/sourceAvailabilityNotice.js';
import {createPublicActivityStore} from '../src/publicActivityStore.js';
import {buildResearchConnections,MAX_CONNECTION_NOTICES} from '../src/researchConnections.js';
import {renderResearchConnections} from '../src/researchConnectionsView.js';
import {fixture,sha,endpoint,digest} from './public-research-fixture.mjs';
const response=value=>new Response(canonicalEvidence(value));
const feed=items=>new Response(JSON.stringify({schema:'lupine.public_research_activity_feed.v1',items,truncated:false}));
async function noticeFixture(){
 const original=await fixture();
 const core={schema:'lupine.discovery_source_withdrawal.v1',producer:'lupine-research-team-v02',publicationId:original.record.id,recordSha256:await digest(JSON.stringify(original.record)),evidenceSha256:evidenceHash(original.record),sourceSemanticSha256:original.evidence.sources[0].semanticSha256,observedAt:'2026-10-30T12:01:00.000Z'};
 const notice={...core,id:'withdrawal-'+await digest(canonicalEvidence(core))};
 const record={...original.record,id:notice.id,activityId:notice.id,evidenceKind:'workflow_repair',title:'Source availability notice',summary:'A source was withdrawn from the discovery feed.',observedAt:notice.observedAt,reviewedAt:notice.observedAt,hashes:[{label:'Source availability notice',sha256:await digest(canonicalEvidence(notice))},{label:'Original public record',sha256:notice.recordSha256},{label:'Original public evidence',sha256:notice.evidenceSha256}]};
 return {original,notice,record};
}
test('canonical availability notice binds its original immutable report and exact cited source',async()=>{
 const f=await noticeFixture();let path,options;
 const verified=await fetchSourceAvailabilityNotice(f.record,{endpoint,fetcher:async(u,o)=>{path=u;options=o;return response(f.notice);}});
 assert.equal(new URL(path).pathname,`/research/activity/${f.notice.id}/evidence`);
 assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');
 const target=await verifySourceAvailabilityTarget(verified.notice,f.original.record,f.original.evidence);
 assert.equal(target.publicationId,f.original.record.id);assert.deepEqual(target.source,f.original.evidence.sources[0]);
 assert.equal(evidenceHash(f.record),null);assert.equal(sourceAvailabilityHash(f.original.record),null);
});
test('changed envelope commitments, forged identity, noncanonical and duplicate-key packets fail closed',async()=>{
 const f=await noticeFixture();
 for(const edit of [n=>n.id='withdrawal-'+sha('f'),n=>n.producer='other',n=>n.observedAt='2026-10-30T12:02:00.000Z',n=>n.schema='unknown',n=>n.extra=true,n=>n.recordSha256=sha('f')]){
  const notice=structuredClone(f.notice);edit(notice);const record=structuredClone(f.record);record.hashes[0].sha256=await digest(canonicalEvidence(notice));
  await assert.rejects(fetchSourceAvailabilityNotice(record,{endpoint,fetcher:async()=>response(notice)}));
 }
 for(const raw of [JSON.stringify(f.notice),canonicalEvidence(f.notice).replace('{','{"producer":"lupine-research-team-v02",')]){
  const record=structuredClone(f.record);record.hashes[0].sha256=await digest(raw);
  await assert.rejects(fetchSourceAvailabilityNotice(record,{endpoint,fetcher:async()=>new Response(raw)}));
 }
 await assert.rejects(fetchSourceAvailabilityNotice(f.record,{endpoint,fetcher:async()=>response({...f.notice,sourceSemanticSha256:sha('e')})}));
});
test('original record, evidence and source must all match rather than trusting notice identity alone',async()=>{
 const f=await noticeFixture();
 await assert.rejects(verifySourceAvailabilityTarget(f.notice,{...f.original.record,title:'Changed title'},f.original.evidence));
 const evidence=structuredClone(f.original.evidence);evidence.report.summary='Changed report';
 await assert.rejects(verifySourceAvailabilityTarget(f.notice,f.original.record,evidence));
 await assert.rejects(verifySourceAvailabilityTarget({...f.notice,sourceSemanticSha256:sha('f')},f.original.record,f.original.evidence));
});
test('availability sidecar has a strict 2048-byte streamed bound and cancels oversize input',async()=>{
 const f=await noticeFixture();
 for(const declared of [true,false]){let cancelled=false,reads=0;const r={ok:true,headers:new Headers(declared?{'content-length':'2049'}:{}),body:{async cancel(){cancelled=true;},getReader(){return {async read(){reads++;return {done:false,value:new Uint8Array(2049)};},async cancel(){cancelled=true;},releaseLock(){}};}}};
  await assert.rejects(fetchSourceAvailabilityNotice(f.record,{endpoint,fetcher:async()=>r}));assert.equal(cancelled,true);assert.equal(reads,declared?0:1);
 }
});
test('store loads a notice separately from research, retains failures and requires explicit retry',async()=>{
 const f=await noticeFixture();let fail=true,noticeReads=0;
 const store=createPublicActivityStore({endpoint,fetcher:async url=>{
  if(url.endsWith(`/${f.notice.id}/evidence`)){noticeReads++;return fail?new Response('',{status:503}):response(f.notice);}
  if(url.endsWith('/evidence'))return response(f.original.evidence);
  return feed([url.includes(f.notice.id)?f.record:f.original.record]);
 }});
 await store.loadRecord(f.record.id);await store.loadNotice(f.record.id);await store.loadNotice(f.record.id);
 assert.equal(noticeReads,1);assert.equal(store.state.notices[f.record.id].status,'unavailable');
 fail=false;await store.loadNotice(f.record.id,{retry:true});await store.loadNotice(f.record.id);
 assert.equal(noticeReads,2);assert.equal(store.state.notices[f.record.id].status,'verified');
 assert.equal(store.state.evidence[f.record.id],undefined);assert.equal(Object.keys(store.state.evidence).length,1);
 assert.equal(store.state.notices[f.record.id].target.publicationId,f.original.record.id);
});
test('a changed original record invalidates notice verification even if its evidence pin stays identical',async()=>{
 const f=await noticeFixture();let changed=false;
 const store=createPublicActivityStore({endpoint,fetcher:async url=>{
  if(url.endsWith(`/${f.notice.id}/evidence`))return response(f.notice);
  if(url.endsWith('/evidence'))return response(f.original.evidence);
  if(url===endpoint)return feed([f.record,{...f.original.record,...(changed?{title:'Changed record metadata'}:{})}]);
  return feed([url.includes(f.notice.id)?f.record:f.original.record]);
 }});
 await store.loadRecord(f.record.id);await store.loadNotice(f.record.id);assert.equal(store.state.notices[f.record.id].status,'verified');
 changed=true;await store.refresh();assert.equal(store.state.notices[f.record.id].status,'unavailable');
 await store.loadNotice(f.record.id,{retry:true});assert.equal(store.state.notices[f.record.id].status,'unavailable');
});
class Element{constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.dataset={};this.classList={remove(){}};}append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}setAttribute(k,v){this[k]=v;}set innerHTML(_){throw Error('Unsafe HTML');}}
const flat=node=>[node,...node.children.flatMap(flat)];
test('notice panel links original report and cited source with an explicit non-retraction caveat',async()=>{
 const f=await noticeFixture(),saved=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{const target=await verifySourceAvailabilityTarget(f.notice,f.original.record,f.original.evidence),view=renderSourceAvailabilityNotice({status:'verified',notice:f.notice,target,url:'https://glim-think-v1.aw-ab5.workers.dev/research/activity/'+f.notice.id+'/evidence'}),nodes=flat(view);
  assert.ok(nodes.some(n=>n.textContent.includes('does not establish publisher retraction or scientific falsity')));
  assert.ok(nodes.some(n=>n.href===`#/activity/${f.original.record.id}`));assert.ok(nodes.some(n=>n.href===f.original.evidence.sources[0].url));
  assert.ok(flat(renderSourceAvailabilityNotice({status:'unavailable'})).some(n=>n.textContent.includes('unavailable or failed verification')));
 }finally{globalThis.document=saved;}
});
test('loaded-target notice verification never fetches a report outside the connections budget',async()=>{
 const f=await noticeFixture(),calls=[];
 const store=createPublicActivityStore({endpoint,fetcher:async url=>{calls.push(url);return url.endsWith('/evidence')?response(f.notice):feed([f.record]);}});
 await store.loadRecord(f.record.id);await store.loadNotice(f.record.id,{loadTarget:false});
 assert.equal(calls.length,2);assert.equal(store.state.notices[f.record.id].status,'unavailable');
 assert.equal(store.state.records.length,1);assert.deepEqual(store.state.evidence,{});
});
async function verifiedState(){
 const f=await noticeFixture(),verified=await fetchSourceAvailabilityNotice(f.record,{endpoint,fetcher:async()=>response(f.notice)}),target=await verifySourceAvailabilityTarget(f.notice,f.original.record,f.original.evidence);
 return {f,state:{records:[f.record,f.original.record],evidence:{[f.original.record.id]:{status:'verified',evidence:f.original.evidence,sha256:evidenceHash(f.original.record)}},notices:{[f.record.id]:{status:'verified',...verified,target,noticeRecordIdentity:JSON.stringify(f.record),targetRecordIdentity:JSON.stringify(f.original.record)}},archiveComplete:true,source:'live'}};
}
test('connections add exact availability edges without changing research totals or source meaning',async()=>{
 const {f,state}=await verifiedState(),before=buildResearchConnections({...state,notices:{}}),model=buildResearchConnections(state);
 assert.deepEqual(model.totals,before.totals);assert.equal(model.availabilityNotices.length,1);
 assert.deepEqual(model.noticeEdges,[{from:f.record.id,to:f.original.record.id,relation:'publication:availability-notice-for'},{from:f.record.id,to:f.original.evidence.sources[0].reference,relation:'publication:source-withdrawn-from-feed'}]);
 assert.equal(model.reports.length,1);assert.equal(model.topics[0].sources.length,1);assert.ok(model.availabilityNotices[0].meaning.includes('not evidence of publisher retraction'));
 for(const change of [s=>s.records[0].summary='Changed notice metadata',s=>s.records[1].title='Changed original title',s=>s.notices[f.record.id].sha256=sha('f'),s=>s.notices[f.record.id].target.source={...s.notices[f.record.id].target.source,title:'Mismatched source'},s=>delete s.evidence[f.original.record.id]]){
  const edited=structuredClone(state);change(edited);const invalid=buildResearchConnections(edited);assert.equal(invalid.noticeEdges.length,0);assert.equal(invalid.availabilityNotices.length,0);
 }
});
test('connections use cached notices and render report/source relationships separately from stages',async()=>{
 const {f,state}=await verifiedState(),saved=globalThis.document;globalThis.document={createElement:t=>new Element(t),createTextNode:t=>({children:[],textContent:t})};
 const calls=[],store={endpoint,state,subscribe(fn){fn(state);return()=>{};},loadRecord:async()=>{},loadEvidence:async()=>{},loadNotice:async(id,options)=>{calls.push({id,options});},refresh(){},loadMore(){}};
 let dispose;
 try{const mount=new Element('main');dispose=renderResearchConnections(mount,store,'#/connections');await new Promise(r=>setImmediate(r));
  const nodes=flat(mount);assert.ok(nodes.some(n=>n.href===`#/activity/${f.record.id}`&&n.textContent==='Source availability notice ↗'));
  assert.ok(nodes.some(n=>n.textContent.includes('not evidence of publisher retraction')));
  assert.equal(calls.length,1);assert.equal(calls[0].options.loadTarget,false);
 }finally{dispose?.();globalThis.document=saved;}
});
test('cold connections wait for delayed original evidence and then link notices without manual retry',async()=>{
 const f=await noticeFixture(),saved=globalThis.document;globalThis.document={createElement:t=>new Element(t),createTextNode:t=>({children:[],textContent:t})};
 let release;const delayed=new Promise(resolve=>{release=resolve;});let noticeReads=0,evidenceReads=0;
 const store=createPublicActivityStore({endpoint,fetcher:async url=>{
  if(url.endsWith(`/${f.record.id}/evidence`)){noticeReads++;return response(f.notice);}
  if(url.endsWith(`/${f.original.record.id}/evidence`)){evidenceReads++;await delayed;return response(f.original.evidence);}
  return feed([f.original.record,f.record]);
 }});
 let dispose;
 try{await store.refresh();store.state.archiveComplete=true;const mount=new Element('main');dispose=renderResearchConnections(mount,store,'#/connections');
  for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));
  assert.equal(evidenceReads,1);assert.equal(noticeReads,0);assert.equal(store.state.evidence[f.original.record.id].status,'loading');
  release();for(let i=0;i<25;i++)await new Promise(r=>setImmediate(r));
  assert.equal(noticeReads,1);assert.equal(store.state.notices[f.record.id].status,'verified');
  assert.equal(buildResearchConnections(store.state).noticeEdges.length,2);assert.ok(flat(mount).some(n=>n.href===`#/activity/${f.record.id}`));
 }finally{release();dispose?.();globalThis.document=saved;}
});
test('connections cap notice identities at eight, share three request lanes and stop queued work on dispose',async()=>{
 const {f,state}=await verifiedState();state.notices={};state.records=[f.original.record,...Array.from({length:20},(_,i)=>({...f.record,id:'withdrawal-'+i.toString(16).padStart(64,'0'),activityId:'withdrawal-'+i.toString(16).padStart(64,'0')}))];
 const saved=globalThis.document;globalThis.document={createElement:t=>new Element(t),createTextNode:t=>({children:[],textContent:t})};
 let active=0,peak=0;const calls=[],releases=[];let listener;
 const store={endpoint,state,subscribe(fn){listener=fn;fn(state);return()=>{};},loadRecord:async()=>{},loadEvidence:async()=>{},loadNotice:async(id,options)=>{calls.push({id,options});active++;peak=Math.max(peak,active);await new Promise(resolve=>releases.push(()=>{active--;resolve();}));},refresh(){},loadMore(){}};
 let dispose;
 try{dispose=renderResearchConnections(new Element('main'),store,'#/connections');await new Promise(r=>setImmediate(r));
  assert.equal(calls.length,3);assert.equal(peak,3);assert.ok(calls.every(c=>c.options.loadTarget===false));
  for(let round=0;round<4;round++){releases.splice(0).forEach(r=>r());await new Promise(r=>setImmediate(r));listener(state);}
  assert.equal(calls.length,MAX_CONNECTION_NOTICES);assert.equal(buildResearchConnections(state).noticeCoverage.hidden,12);
  dispose();dispose=null;listener(state);await new Promise(r=>setImmediate(r));assert.equal(calls.length,8);
  dispose=renderResearchConnections(new Element('main'),store,'#/connections');await new Promise(r=>setImmediate(r));
  assert.equal(calls.length,11);dispose();dispose=null;releases.splice(0).forEach(r=>r());await new Promise(r=>setImmediate(r));
  assert.equal(calls.length,11,'disposing with three reads pending must discard the five queued notices');
 }finally{dispose?.();releases.splice(0).forEach(r=>r());globalThis.document=saved;}
});
