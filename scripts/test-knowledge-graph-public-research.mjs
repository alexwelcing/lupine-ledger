import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalEvidence,EVIDENCE_SCHEMA,fetchPublicEvidence,validatePublicEvidence,researchEvidenceGraph,MAX_EVIDENCE_BYTES,publicResearchQuestion,isPublicEvidenceText} from '../src/publicResearchEvidence.js';
import {createPublicActivityStore} from '../src/publicActivityStore.js';
import {createPublicSearch} from '../src/publicSearch.js';
import {renderPublicEvidence,renderPublishedResearchGraph} from '../src/publicResearchEvidenceView.js';
import {fixture,sha,id,src,endpoint,digest} from './public-research-fixture.mjs';
const response=e=>new Response(canonicalEvidence(e),{headers:{'content-type':'application/json'}});
test('exact canonical public evidence is verified before a full report is accepted',async()=>{
 const f=await fixture();let url,opts;
 const result=await fetchPublicEvidence(f.record,{endpoint,fetcher:async(u,o)=>{url=u;opts=o;return response(f.evidence);}});
 assert.equal(result.sha256,f.record.hashes[0].sha256);assert.equal(result.evidence.report.summary,f.evidence.report.summary);
 assert.equal(new URL(url).pathname,`/research/activity/${f.record.id}/evidence`);
 assert.equal(opts.cache,'no-store');assert.equal(opts.credentials,'omit');assert.equal(opts.redirect,'error');
});
test('mismatched digest, missing proof, failed fetch and noncanonical duplicate keys never render evidence',async()=>{
 const f=await fixture();
 for(const fetcher of [async()=>response({...f.evidence,externalPeerReviewed:true}),async()=>new Response('',{status:503}),async()=>{throw Error('offline');}])await assert.rejects(fetchPublicEvidence(f.record,{endpoint,fetcher}));
 await assert.rejects(fetchPublicEvidence({...f.record,hashes:[]},{endpoint,fetcher:async()=>response(f.evidence)}));
 const raw=canonicalEvidence(f.evidence).replace('{','{"policy":"accepted-discovery-public/v1",');
 const r={...f.record,hashes:[{label:'Public evidence',sha256:await digest(raw)}]};
 await assert.rejects(fetchPublicEvidence(r,{endpoint,fetcher:async()=>new Response(raw)}));
});
test('unsafe links, unknown fields/schema, private text and broken lineage are rejected',async()=>{
 const f=await fixture();
 const edits=[e=>e.schema='unknown',e=>e.rawPrompt='private',e=>e.sources[0].url='https://localhost/x',e=>e.sources[0].url='javascript:alert(1)',e=>e.sources[0].url='https://arxiv.org/?token=secret',e=>e.report.summary='/Users/name/private/report',e=>e.empiricalValidation=true,e=>e.report.claims[0].sourceReferences=['src-'+sha('9')],e=>e.priorReports=[{role:'principal',publicationId:id('b')}],e=>e.topic.parentPublicationId=id('b')];
 for(const edit of edits){const e=structuredClone(f.evidence);edit(e);assert.throws(()=>validatePublicEvidence(e,f.record));}
});
test('declared and streamed oversize bodies are cancelled without unbounded text reads',async()=>{
 const f=await fixture();for(const declared of [true,false]){let cancelled=false,reads=0;const r={ok:true,headers:new Headers(declared?{'content-length':String(MAX_EVIDENCE_BYTES+1)}:{}),body:{async cancel(){cancelled=true;},getReader(){return {async read(){reads++;return {done:false,value:new Uint8Array(MAX_EVIDENCE_BYTES+1)};},async cancel(){cancelled=true;},releaseLock(){}};}}};
 await assert.rejects(fetchPublicEvidence(f.record,{endpoint,fetcher:async()=>r}));assert.equal(cancelled,true);assert.equal(reads,declared?0:1);}
});
test('graph only joins assessment to an exact verified earlier claim; disposition creates no support',async()=>{
 const parent=await fixture(),child=await fixture('methods','b');
 const partial=researchEvidenceGraph(child.record,child.evidence);assert.ok(partial.unresolved.some(x=>x.kind==='role-prefix'));assert.ok(partial.unresolved.some(x=>x.verdict==='inconclusive'));assert.ok(!partial.edges.some(e=>['supports','contradicts','inconclusive'].includes(e.relation)));
 const prior=new Map([[parent.record.id,parent]]);
 for(const verdict of ['supports','contradicts','inconclusive']){const e=structuredClone(child.evidence);e.report.assessments[0].verdict=verdict;const graph=researchEvidenceGraph(child.record,e,prior);assert.equal(graph.edges.filter(x=>x.relation===verdict).length,1);assert.equal(graph.empiricalValidation,false);assert.equal(graph.edges.filter(x=>x.relation==='cites').length,2);}
 const graph=researchEvidenceGraph(parent.record,parent.evidence);assert.ok(!graph.edges.some(e=>e.relation==='supports'));assert.ok(graph.edges.some(e=>e.relation==='proposes-question'));
 const bad=structuredClone(child.evidence);bad.report.assessments[0].claimIndex=5;assert.throws(()=>researchEvidenceGraph(child.record,bad,prior));
 const wrong=structuredClone(parent);wrong.evidence.topic.id='topic-'+sha('7');assert.throws(()=>researchEvidenceGraph(child.record,child.evidence,new Map([[parent.record.id,wrong]])));
});
test('parent publication and correction edges retain identity without claiming loaded ancestry',async()=>{
 const f=await fixture();f.evidence.topic.parentTopicId='topic-'+sha('7');f.evidence.topic.parentPublicationId=id('c');f.evidence.topic.parentQuestionIndex=0;f.record.supersedes='previous-public-record';f.record.correctionReason='Synthetic correction fixture.';
 const graph=researchEvidenceGraph(f.record,f.evidence);assert.ok(graph.edges.some(e=>e.relation==='parent-publication'&&e.to===id('c')));assert.ok(graph.nodes.find(n=>n.id===id('c')).external);assert.ok(graph.edges.some(e=>e.relation==='supersedes'&&e.to==='previous-public-record'));
});
test('store retains summary on failed evidence and requires an explicit retry',async()=>{
 const f=await fixture();let calls=0,fail=true;const store=createPublicActivityStore({endpoint,fetcher:async url=>{if(url.endsWith('/evidence')){calls++;return fail?new Response('',{status:503}):response(f.evidence);}return new Response(JSON.stringify({schema:'lupine.public_research_activity_feed.v1',items:[f.record],truncated:false}));}});
 await store.loadRecord(f.record.id);await store.loadEvidence(f.record.id);await store.loadEvidence(f.record.id);assert.equal(calls,1);assert.equal(store.state.records.length,1);assert.equal(store.state.evidence[f.record.id].status,'unavailable');
 fail=false;await store.loadEvidence(f.record.id,{retry:true});assert.equal(calls,2);assert.equal(store.state.evidence[f.record.id].status,'verified');
 const search=createPublicSearch();search.activity(f.record);assert.equal(search.search('microstructure').length,0);search.evidence(f.record,store.state.evidence[f.record.id].evidence);assert.equal(search.search('microstructure').length,1);
});
class Element {constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.dataset={};}append(...x){this.children.push(...x);}replaceChildren(...x){this.children=x;}setAttribute(k,v){this[k]=v;}set innerHTML(v){throw Error('Unsafe HTML path');}}
const flat=n=>[n,...n.children.flatMap(flat)];
test('full report uses safe text, attributed model, limitations, source links and machine JSON',async()=>{
 const f=await fixture(),before=globalThis.document;globalThis.document={createElement:t=>new Element(t)};
 try{const view=renderPublicEvidence(f.record,{status:'verified',evidence:f.evidence,checkedAt:Date.now(),sha256:f.record.hashes[0].sha256,url:`https://glim-think-v1.aw-ab5.workers.dev/research/activity/${f.record.id}/evidence`},endpoint),nodes=flat(view);
 assert.ok(nodes.some(n=>n.textContent.includes('not externally peer reviewed')));assert.ok(nodes.some(n=>n.textContent.includes('controller-reported')));assert.ok(nodes.some(n=>n.textContent===f.evidence.report.summary));assert.ok(nodes.some(n=>n.href===f.evidence.sources[0].url));assert.ok(nodes.some(n=>n.href?.endsWith('/evidence')));
 const missing=flat(renderPublicEvidence(f.record,{status:'unavailable'},endpoint));assert.ok(missing.some(n=>n.textContent.includes('unavailable or failed verification')));assert.ok(!missing.some(n=>n.textContent===f.evidence.report.summary));
 }finally{globalThis.document=before;}
});
test('graph layer has a finite automatic evidence load and explicit partial coverage and API link',async()=>{
 const f=await fixture(),records=Array.from({length:25},(_,i)=>({...f.record,id:'discovery-'+i.toString(16).padStart(64,'0')})),state={records,evidence:{},source:'live',archiveComplete:false};let listener,requests=[];
 const store={endpoint,state,subscribe(fn){listener=fn;fn(state);return()=>{};},loadEvidence(id){requests.push(id);},refresh(){},loadMore(){}};
 const before=globalThis.document;globalThis.document={createElement:t=>new Element(t)};
 try{const mount=new Element('main'),dispose=renderPublishedResearchGraph(mount,store);await new Promise(r=>queueMicrotask(r));assert.equal(requests.length,6);listener(state);await new Promise(r=>queueMicrotask(r));assert.equal(requests.length,6);const nodes=flat(mount);assert.ok(nodes.some(n=>n.textContent.includes('not the complete research archive')));assert.ok(nodes.some(n=>n.href==='https://glim-think-v1.aw-ab5.workers.dev/research/knowledge'));dispose();}finally{globalThis.document=before;}
});

test('a changed publication pin cannot reuse a previously verified sidecar',async()=>{
 const f=await fixture();let changed=false;
 const store=createPublicActivityStore({endpoint,fetcher:async url=>{
  if(url.endsWith('/evidence'))return response(f.evidence);
  const record=structuredClone(f.record);if(changed)record.hashes[0].sha256=sha('f');
  return new Response(JSON.stringify({schema:'lupine.public_research_activity_feed.v1',items:[record],truncated:false}));
 }});
 await store.loadRecord(f.record.id);await store.loadEvidence(f.record.id);assert.equal(store.state.evidence[f.record.id].status,'verified');
 changed=true;await store.refresh();assert.equal(store.state.evidence[f.record.id].status,'unavailable');
});

test('exact parent question relation requires a verified principal and identical question text',async()=>{
 const parent=await fixture('principal','d'),child=await fixture('evidence','e'),earlier=[await fixture(),await fixture('methods','b'),await fixture('reviewer','c')];
 const known=new Map([...earlier.map(p=>[p.record.id,p]),[parent.record.id,parent]]);
 child.evidence.topic.parentTopicId=parent.evidence.topic.id;child.evidence.topic.id='topic-'+sha('9');child.evidence.topic.parentPublicationId=parent.record.id;child.evidence.topic.parentQuestionIndex=0;child.evidence.topic.question=parent.evidence.report.questions[0];
 const partial=researchEvidenceGraph(child.record,child.evidence);assert.ok(!partial.edges.some(e=>e.relation==='follows-question'));assert.equal(partial.unresolved[0].kind,'parent-question');
 const pendingPrefix=researchEvidenceGraph(child.record,child.evidence,new Map([[parent.record.id,parent]]));assert.ok(!pendingPrefix.edges.some(e=>e.relation==='follows-question'));
 const exact=researchEvidenceGraph(child.record,child.evidence,known);assert.ok(exact.edges.some(e=>e.relation==='follows-question'&&e.to===parent.record.id+':question:0'));
 assert.ok(exact.nodes.some(n=>n.route===`#/activity/${parent.record.id}?question=0`));
 const wrong=structuredClone(parent);wrong.evidence.report.questions[0]='Different question';assert.throws(()=>researchEvidenceGraph(child.record,child.evidence,new Map([[parent.record.id,wrong]])));
 child.evidence.topic.parentQuestionIndex=null;assert.throws(()=>validatePublicEvidence(child.evidence,child.record));
 assert.equal(publicResearchQuestion('#/activity/id?question=0'),0);assert.equal(publicResearchQuestion('#/activity/id?question=99'),null);
});

test('evidence-only scientific identifier exception preserves bytes and rejects surrounding private paths',async()=>{
 for(const value of ['KOKKOS/GPU/OPENMP','Inspect KOKKOS/GPU/OPENMP.','The packages (KOKKOS/GPU/OPENMP) require evaluation.'])assert.equal(isPublicEvidenceText(value),true,value);
 for(const value of ['work/KOKKOS/GPU/OPENMP','../KOKKOS/GPU/OPENMP','/private/KOKKOS/GPU/OPENMP','KOKKOS/GPU/OPENMP/private','KOKKOS/GPU/OPENMP.txt','prefixKOKKOS/GPU/OPENMP','KOKKOS/GPU/OPENMP_suffix','other/GPU/OPENMP','KOKKOS/GPU/OPENMP and work/private/output.txt'])assert.equal(isPublicEvidenceText(value),false,value);
 const f=await fixture();f.evidence.report.summary='The KOKKOS/GPU/OPENMP identifier remains unchanged.';f.record.hashes[0].sha256=await digest(canonicalEvidence(f.evidence));
 const accepted=await fetchPublicEvidence(f.record,{endpoint,fetcher:async()=>response(f.evidence)});assert.equal(accepted.evidence.report.summary,f.evidence.report.summary);assert.ok(canonicalEvidence(accepted.evidence).includes('KOKKOS/GPU/OPENMP'));
});
test('typed graph edges reject crossed prior-role branches and changed topic metadata',async()=>{
 const first=await fixture(),methods=await fixture('methods','b'),reviewer=await fixture('reviewer','c');
 const known=new Map([[first.record.id,first],[methods.record.id,methods]]);
 assert.ok(researchEvidenceGraph(reviewer.record,reviewer.evidence,known).edges.some(e=>e.relation==='inconclusive'));
 const crossed=structuredClone(methods);crossed.evidence.priorReports[0].publicationId=id('f');
 assert.throws(()=>researchEvidenceGraph(reviewer.record,reviewer.evidence,new Map([[first.record.id,first],[methods.record.id,crossed]])));
 const changed=structuredClone(methods);changed.evidence.topic.question='Different question on the same topic identity';
 assert.throws(()=>researchEvidenceGraph(reviewer.record,reviewer.evidence,new Map([[first.record.id,first],[methods.record.id,changed]])));
 const partial=researchEvidenceGraph(reviewer.record,reviewer.evidence,new Map([[first.record.id,first]]));assert.ok(!partial.edges.some(e=>e.relation==='inconclusive'));assert.ok(partial.unresolved.some(e=>e.kind==='role-prefix'));
});
test('train/validation/test prose retains exact signed bytes without admitting paths or oversize text',async()=>{
 for(const value of ['train/validation/test','A train/validation/test split.','Use (train/validation/test), then compare.'])assert.equal(isPublicEvidenceText(value),true,value);
 for(const value of ['work/train/validation/test','/train/validation/test','train/validation/test/private','train/validation/test.txt',
  'xtrain/validation/test','train/validation/testx','αtrain/validation/test','train/validation/testα','train/validation/test-other',
  'train/validation/test%2Fprivate','train/validation/test%252Fprivate','train/validation/test\u0301','\u0301train/validation/test','KOKKOS/GPU/OPENMP%2Fprivate','Train/validation/test','train/validation/other','train/validation/test and work/private/file','train/validation/test user@example.org'])assert.equal(isPublicEvidenceText(value),false,value);
 const f=await fixture(),summary='A MACE demonstration uses a simple train/validation/test split.',statement='A train/validation/test split may overstate generalization.';
 f.evidence.report.summary=summary;f.evidence.report.claims[0].statement=statement;f.record.hashes[0].sha256=await digest(canonicalEvidence(f.evidence));
 const before=canonicalEvidence(f.evidence),accepted=await fetchPublicEvidence(f.record,{endpoint,fetcher:async()=>response(f.evidence)});
 assert.equal(accepted.evidence.report.summary,summary);assert.equal(accepted.evidence.report.claims[0].statement,statement);assert.equal(canonicalEvidence(accepted.evidence),before);
 f.evidence.report.summary='train/validation/test '+'é'.repeat(890);assert.ok(new TextEncoder().encode(f.evidence.report.summary).length>1800);
 assert.throws(()=>validatePublicEvidence(f.evidence,f.record));
});


test('evidence cannot display private execution identity or join a future parent question',async()=>{
 const f=await fixture();
 for(const value of ['lev1:private','dq-'+ 'a'.repeat(40),'rl-'+ 'b'.repeat(40),'cc:rl-private']){const e=structuredClone(f.evidence);e.report.summary=value;assert.throws(()=>validatePublicEvidence(e,f.record));}
 const e=structuredClone(f.evidence);e.sources[0].url='https://arxiv.org/abs/dq-'+ 'a'.repeat(40);assert.throws(()=>validatePublicEvidence(e,f.record));
 const parent=await fixture('principal','d'),child=await fixture('evidence','e');
 child.evidence.topic={id:'topic-'+sha('6'),question:parent.evidence.report.questions[0],parentTopicId:parent.evidence.topic.id,parentPublicationId:parent.record.id,parentQuestionIndex:0};
 parent.evidence.provenance.completedAt='2026-10-30T00:01:00.000Z';parent.record.observedAt=parent.evidence.provenance.completedAt;parent.record.reviewedAt=parent.record.observedAt;child.evidence.provenance.completedAt='2026-10-30T00:00:00.000Z';child.record.observedAt=child.evidence.provenance.completedAt;
 assert.throws(()=>researchEvidenceGraph(child.record,child.evidence,new Map([[parent.record.id,parent]])));
});
