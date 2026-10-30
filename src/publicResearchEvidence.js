import { isPublicSourceUrl, isPublicText, validateActivity } from './researchActivity.js';
export const EVIDENCE_SCHEMA = 'lupine.public_discovery_report.v1';
export const MAX_EVIDENCE_BYTES = 32768;
const encoder = new TextEncoder();
const roles = ['evidence', 'methods', 'reviewer', 'principal'];
const sha = /^[a-f0-9]{64}$/;
const publication = /^discovery-[a-f0-9]{64}$/;
const topic = /^topic-[a-f0-9]{64}$/;
const fail = () => { throw Error('Public research evidence failed verification'); };
const privateExecution = /(?:lev1:|\bdq-[a-f0-9]{40}\b|\brl-[a-f0-9]{40}\b|cc:rl-)/i;
function object(v, keys) {
  if (!v || typeof v !== 'object' || Array.isArray(v) || Object.getPrototypeOf(v) !== Object.prototype ||
      Object.keys(v).length !== keys.length || keys.some(k => !Object.hasOwn(v, k)) ||
      Object.values(Object.getOwnPropertyDescriptors(v)).some(d => !('value' in d))) fail();
}
export function isPublicEvidenceText(v) {
  if(typeof v!=='string')return false;
  // Exact scientific identifier only. This changes the validation view, never the published bytes.
  const checked=v.replace(/(?<![\p{L}\p{N}_.\/\\-])KOKKOS\/GPU\/OPENMP(?![\p{L}\p{N}_\/\\-]|\.[\p{L}\p{N}_])/gu,'KOKKOS_GPU_OPENMP');
  return isPublicText(checked) && !privateExecution.test(checked) && !/(?:\b\d{1,3}(?:\.\d{1,3}){3}\b|\b[A-Za-z0-9.-]+\.ts\.net\b|(?:^|\s|[\"'(])(?:\.{1,2}\/|\/(?:[^\s/]+\/)+|(?:outputs|work|data|evidence|tools)\/)|(?:[^\s/]+\/){2,}[^\s/]+)/i.test(checked);
}
function text(v, max) {
  if (!isPublicEvidenceText(v) || encoder.encode(v).length > max) fail();
}
function array(v, max) { if (!Array.isArray(v) || v.length > max) fail(); }
function choice(v, values) { if (!values.includes(v)) fail(); }
function stamp(v) { if (typeof v !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v) || new Date(v).toISOString() !== v) fail(); }
export function canonicalEvidence(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonicalEvidence).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonicalEvidence(v[k])).join(',') + '}';
}
export function evidenceHash(record) {
  const hashes = record.hashes.filter(h => h.label === 'Public evidence');
  return hashes.length === 1 && sha.test(hashes[0].sha256) ? hashes[0].sha256 : null;
}
export function evidenceUrl(endpoint, id) {
  if (!publication.test(id)) fail();
  return new URL(`/research/activity/${encodeURIComponent(id)}/evidence`, endpoint).href;
}
export function validatePublicEvidence(v, record) {
  validateActivity(record);
  object(v, ['schema','policy','topic','report','sources','priorReports','provenance','empiricalValidation','externalPeerReviewed','reviewBasis']);
  if (v.schema !== EVIDENCE_SCHEMA || v.policy !== 'accepted-discovery-public/v1' || v.empiricalValidation !== false ||
      v.externalPeerReviewed !== false || v.reviewBasis !== 'automated-contract-validation' || !evidenceHash(record)) fail();
  object(v.topic, ['id','question','parentTopicId','parentPublicationId','parentQuestionIndex']);
  if (!topic.test(v.topic.id) || v.topic.parentTopicId !== null && (!topic.test(v.topic.parentTopicId) || v.topic.parentTopicId === v.topic.id) ||
      v.topic.parentPublicationId !== null && (!publication.test(v.topic.parentPublicationId) || v.topic.parentPublicationId === record.id) ||
      v.topic.parentPublicationId !== null && v.topic.parentTopicId === null) fail();
  if(v.topic.parentQuestionIndex!==null&&(!Number.isInteger(v.topic.parentQuestionIndex)||v.topic.parentQuestionIndex<0||v.topic.parentQuestionIndex>2)||(v.topic.parentPublicationId===null)!==(v.topic.parentQuestionIndex===null))fail();
  text(v.topic.question,800);
  object(v.provenance,['provider','model','modelIdentity','completedAt','outputSha256','receiptSha256','archiveSha256']);
  text(v.provenance.provider,100); text(v.provenance.model,100); stamp(v.provenance.completedAt);
  if (v.provenance.modelIdentity !== 'controller-reported' || ['outputSha256','receiptSha256','archiveSha256'].some(k => !sha.test(v.provenance[k])) ||
      record.id !== `discovery-${v.provenance.archiveSha256}` || v.provenance.completedAt !== record.observedAt) fail();
  array(v.sources,3); if (!v.sources.length) fail(); const refs = new Set();
  for (const s of v.sources) {
    object(s,['reference','title','url','semanticSha256']); text(s.title,500);
    if (!sha.test(s.semanticSha256) || s.reference !== `src-${s.semanticSha256}` || refs.has(s.reference) || (!isPublicSourceUrl(s.url)||privateExecution.test(s.url))) fail();
    refs.add(s.reference);
  }
  const sourceRefs = xs => { array(xs,3); if (!xs.length || new Set(xs).size !== xs.length || xs.some(x => !refs.has(x))) fail(); };
  const r = v.report;
  object(r,['schema','role','summary','claims','concepts','assessments','questions','queries','disposition']);
  if (r.schema !== 'lupine-discovery-report/v1') fail(); choice(r.role,roles); choice(r.disposition,['advance','wait','reject']); text(r.summary,1800);
  array(v.priorReports,3); const priors = new Map();
  for (const p of v.priorReports) {
    object(p,['role','publicationId']);
    if (!roles.includes(p.role) || roles.indexOf(p.role) >= roles.indexOf(r.role) || priors.has(p.role) ||
        !publication.test(p.publicationId) || p.publicationId === record.id) fail();
    priors.set(p.role,p.publicationId);
  }
  if (v.priorReports.length !== roles.indexOf(r.role) || v.priorReports.some((p,i)=>p.role!==roles[i]) || new Set(v.priorReports.map(p=>p.publicationId)).size!==v.priorReports.length) fail();
  array(r.claims,6); array(r.concepts,6); array(r.assessments,3); array(r.questions,3); array(r.queries,3);
  for (const c of r.claims) { object(c,['statement','sourceReferences','kind']); text(c.statement,500); choice(c.kind,['published-claim','hypothesis']); sourceRefs(c.sourceReferences); }
  for (const c of r.concepts) { object(c,['name','kind','sourceReferences']); text(c.name,120); choice(c.kind,['material','method','property','dataset','software']); sourceRefs(c.sourceReferences); }
  const targets = new Set();
  for (const a of r.assessments) {
    object(a,['targetRole','claimIndex','verdict','reason','sourceReferences']);
    if (!priors.has(a.targetRole) || !Number.isInteger(a.claimIndex) || a.claimIndex < 0 || a.claimIndex >= 6 || targets.has(`${a.targetRole}:${a.claimIndex}`)) fail();
    targets.add(`${a.targetRole}:${a.claimIndex}`); choice(a.verdict,['supports','contradicts','inconclusive']); text(a.reason,350); sourceRefs(a.sourceReferences);
  }
  if (new Set(r.concepts.map(c=>c.kind+':'+c.name.replace(/\s+/g,' '))).size!==r.concepts.length) fail();
  r.questions.forEach(q => text(q,400)); r.queries.forEach(q => { text(q,100); const terms=q.split(/\s+/); if(terms.length>12 || terms.some(t=>t.length>40 || /^(and|or|not)$/i.test(t))) fail(); });
  if (r.queries.length > r.questions.length || new Set(r.questions).size !== r.questions.length ||
      new Set(r.queries.map(q=>q.toLowerCase())).size !== r.queries.length || encoder.encode(canonicalEvidence(r)).length > 8192 ||
      encoder.encode(canonicalEvidence(v)).length > MAX_EVIDENCE_BYTES) fail();
  return v;
}
async function bytesOf(response) {
  if (!response.ok || Number(response.headers.get('content-length')) > MAX_EVIDENCE_BYTES) { await response.body?.cancel(); fail(); }
  const reader = response.body?.getReader(); if (!reader) fail();
  const chunks = []; let size = 0;
  try { for (;;) { const {done,value} = await reader.read(); if (done) break; size += value.byteLength;
    if (size > MAX_EVIDENCE_BYTES) { await reader.cancel(); fail(); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let at = 0; for (const chunk of chunks) { bytes.set(chunk,at); at += chunk.byteLength; } return bytes;
}
export async function fetchPublicEvidence(record, { endpoint, fetcher = fetch, signal = AbortSignal.timeout(8000) } = {}) {
  validateActivity(record); const expected = evidenceHash(record); if (!expected) fail();
  const url = evidenceUrl(endpoint,record.id);
  const response = await fetcher(url,{cache:'no-store',credentials:'omit',redirect:'error',signal});
  const bytes = await bytesOf(response);
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
  if (digest !== expected) fail();
  const raw = new TextDecoder('utf-8',{fatal:true}).decode(bytes), evidence = JSON.parse(raw);
  // Canonical exact bytes reject duplicate keys as well as unsigned normalization.
  if (canonicalEvidence(evidence) !== raw) fail();
  validatePublicEvidence(evidence,record);
  return { evidence, sha256:digest, url, checkedAt:Date.now() };
}
/** A later role must refer to the same ordered publication prefix, not another branch of the same topic. */
function verifiedRolePrefix(record,evidence,known) {
  let complete=true;
  for(const [i,prior] of evidence.priorReports.entries()) {
    const saved=known.get(prior.publicationId);if(!saved){complete=false;continue;}
    validatePublicEvidence(saved.evidence,saved.record);
    if(saved.record.id!==prior.publicationId || saved.evidence.report.role!==prior.role ||
       canonicalEvidence(saved.evidence.topic)!==canonicalEvidence(evidence.topic) ||
       canonicalEvidence(saved.evidence.priorReports)!==canonicalEvidence(evidence.priorReports.slice(0,i)) ||
       saved.evidence.provenance.completedAt>evidence.provenance.completedAt)fail();
  }
  return complete;
}
/** Relations preserve attribution. A model's supporting assessment is never empirical validation. */
export function researchEvidenceGraph(record, evidence, verifiedPrior = new Map()) {
  validatePublicEvidence(evidence,record);
  const prefixComplete=verifiedRolePrefix(record,evidence,verifiedPrior);
  const nodes = [], edges = [], unresolved = [], add = (id,type,label,extra={}) => nodes.push({id,type,label,...extra});
  const edge = (from,to,relation,extra={}) => edges.push({from,to,relation,...extra});
  if(!prefixComplete)for(const p of evidence.priorReports)if(!verifiedPrior.has(p.publicationId))unresolved.push({publicationId:p.publicationId,kind:'role-prefix'});
  add(record.id,'report',record.title,{route:`#/activity/${record.id}`}); add(evidence.topic.id,'topic',evidence.topic.question); edge(record.id,evidence.topic.id,'investigates');
  if (record.supersedes) { add(record.supersedes,'publication','Previous public record',{route:`#/activity/${record.supersedes}`,external:true}); edge(record.id,record.supersedes,'supersedes'); }
  if (evidence.topic.parentPublicationId) {
    const parentId=evidence.topic.parentPublicationId,index=evidence.topic.parentQuestionIndex,route=`#/activity/${parentId}?question=${index}`;
    add(parentId,'publication','Parent research publication',{route,external:true});edge(evidence.topic.id,parentId,'parent-publication');
    const parent=verifiedPrior.get(parentId);
    if(parent){validatePublicEvidence(parent.evidence,parent.record);
      if(parent.record.id!==parentId||parent.evidence.report.role!=='principal'||parent.evidence.topic.id!==evidence.topic.parentTopicId||parent.evidence.provenance.completedAt>evidence.provenance.completedAt||parent.evidence.report.questions[index]!==evidence.topic.question)fail();
      if(verifiedRolePrefix(parent.record,parent.evidence,verifiedPrior)){const questionId=`${parentId}:question:${index}`;add(questionId,'question',parent.evidence.report.questions[index],{route,external:true});edge(evidence.topic.id,questionId,'follows-question');}
      else unresolved.push({publicationId:parentId,questionIndex:index,kind:'parent-role-prefix'});
    }else unresolved.push({publicationId:parentId,questionIndex:index,kind:'parent-question'});
  }
  for (const s of evidence.sources) add(s.reference,'source',s.title,{url:s.url,sha256:s.semanticSha256});
  evidence.report.claims.forEach((c,i)=>{const id=`${record.id}:claim:${i}`;add(id,'claim',c.statement,{kind:c.kind,route:`#/activity/${record.id}`});edge(record.id,id,'states');c.sourceReferences.forEach(s=>edge(id,s,'cites'));});
  evidence.report.concepts.forEach((c,i)=>{const id=`${record.id}:concept:${i}`;add(id,'concept',c.name,{kind:c.kind});edge(record.id,id,'identifies');c.sourceReferences.forEach(s=>edge(id,s,'identified-in'));});
  evidence.report.assessments.forEach((a,i)=>{const id=`${record.id}:assessment:${i}`, prior=evidence.priorReports.find(p=>p.role===a.targetRole).publicationId,target=`${prior}:claim:${a.claimIndex}`;
    add(id,'assessment',a.reason,{verdict:a.verdict}); edge(record.id,id,'assesses');
    const known=verifiedPrior.get(prior);
    if(known && prefixComplete) {
      validatePublicEvidence(known.evidence,known.record);
      if(known.record.id!==prior || known.evidence.topic.id!==evidence.topic.id || known.evidence.report.role!==a.targetRole || !known.evidence.report.claims[a.claimIndex]) fail();
      add(target,'claim',known.evidence.report.claims[a.claimIndex].statement,{external:true,route:`#/activity/${prior}`});
      edge(id,target,a.verdict,{meaning:'automated assessment; no empirical validation'});
    } else { unresolved.push({publicationId:prior,claimIndex:a.claimIndex,verdict:a.verdict}); }
    a.sourceReferences.forEach(s=>edge(id,s,'cites'));});
  evidence.report.questions.forEach((q,i)=>{const id=`${record.id}:question:${i}`;add(id,'question',q);edge(record.id,id,'proposes-question');});
  return {nodes,edges,unresolved,empiricalValidation:false,externalPeerReviewed:false};
}

export function publicResearchQuestion(hash) {
  const value=new URLSearchParams(String(hash||'').split('?')[1]||'').get('question');
  return value!==null&&/^[0-2]$/.test(value)?Number(value):null;
}
