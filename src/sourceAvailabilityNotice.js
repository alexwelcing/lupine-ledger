import {validateActivity} from './researchActivity.js';
import {canonicalEvidence,evidenceHash,validatePublicEvidence} from './publicResearchEvidence.js';
const hash=/^[a-f0-9]{64}$/,noticeId=/^withdrawal-[a-f0-9]{64}$/,publicationId=/^discovery-[a-f0-9]{64}$/;
const encoder=new TextEncoder();
const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof bytes==='string'?encoder.encode(bytes):bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
const fail=()=>{throw Error('Source availability notice failed verification');};
function pin(record,label){const matches=record?.hashes?.filter(h=>h.label===label)||[];return matches.length===1&&hash.test(matches[0].sha256)?matches[0].sha256:null;}
export function sourceAvailabilityHash(record){return noticeId.test(record?.id)?pin(record,'Source availability notice'):null;}
export async function fetchSourceAvailabilityNotice(record,{endpoint,fetcher=fetch,signal=AbortSignal.timeout(8000)}={}){
  validateActivity(record);const expected=sourceAvailabilityHash(record);if(!expected)fail();
  const url=new URL(`/research/activity/${record.id}/evidence`,endpoint).href;
  const response=await fetcher(url,{cache:'no-store',credentials:'omit',redirect:'error',signal});
  if(!response.ok||Number(response.headers.get('content-length'))>2048){await response.body?.cancel();fail();}
  const reader=response.body?.getReader();if(!reader)fail();const chunks=[];let length=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>2048){await reader.cancel();fail();}chunks.push(value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  if(await digest(bytes)!==expected)fail();const raw=new TextDecoder('utf-8',{fatal:true}).decode(bytes),notice=JSON.parse(raw);
  if(!notice||Array.isArray(notice)||Object.keys(notice).sort().join()!=='evidenceSha256,id,observedAt,producer,publicationId,recordSha256,schema,sourceSemanticSha256'
    ||canonicalEvidence(notice)!==raw||notice.schema!=='lupine.discovery_source_withdrawal.v1'||notice.producer!=='lupine-research-team-v02'
    ||notice.id!==record.id||record.activityId!==record.id||!publicationId.test(notice.publicationId)
    ||![notice.recordSha256,notice.evidenceSha256,notice.sourceSemanticSha256].every(x=>hash.test(x))
    ||notice.observedAt!==record.observedAt||record.evidenceKind!=='workflow_repair'||record.state!=='completed'||record.verification!=='pending'
    ||record.supersedes!==null||record.correctionReason!==null
    ||notice.recordSha256!==pin(record,'Original public record')||notice.evidenceSha256!==pin(record,'Original public evidence'))fail();
  const {id,...core}=notice;if(id!=='withdrawal-'+await digest(canonicalEvidence(core)))fail();
  return {notice,sha256:expected,url,checkedAt:Date.now()};
}
export async function verifySourceAvailabilityTarget(notice,record,evidence){
  validateActivity(record);validatePublicEvidence(evidence,record);
  if(record.id!==notice.publicationId||await digest(JSON.stringify(record))!==notice.recordSha256
    ||evidenceHash(record)!==notice.evidenceSha256||await digest(canonicalEvidence(evidence))!==notice.evidenceSha256)fail();
  const sources=evidence.sources.filter(s=>s.semanticSha256===notice.sourceSemanticSha256);if(sources.length!==1)fail();
  return {publicationId:record.id,recordSha256:notice.recordSha256,evidenceSha256:notice.evidenceSha256,title:record.title,source:sources[0]};
}
export function renderSourceAvailabilityNotice(entry){
  const root=document.createElement('section');root.className='source-availability-notice';
  const append=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;root.append(n);return n;};
  append('h3','Source availability notice');
  if(entry?.status!=='verified'){append('p',entry?.status==='loading'?'Verifying the notice and its original report…':'Notice relationships are unavailable or failed verification. The published summary remains available.');return root;}
  append('p','A cited source was withdrawn from the discovery feed. This does not establish publisher retraction or scientific falsity. The original report remains unchanged.');
  const original=append('a',`Notice for: ${entry.target.title}`);original.href=`#/activity/${entry.target.publicationId}`;
  append('p','Affected cited source:');const source=append('a',entry.target.source.title);source.href=entry.target.source.url;source.target='_blank';source.rel='noopener noreferrer';
  append('p',`Observed ${entry.notice.observedAt}. Notice, original report and source commitments verified.`);
  const machine=append('a','Verified notice JSON');machine.href=entry.url;machine.target='_blank';machine.rel='noopener noreferrer';
  return root;
}
