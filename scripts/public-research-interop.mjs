#!/usr/bin/env node
// Verify externally supplied public publication fixtures without network calls or publication.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {canonicalEvidence,fetchPublicEvidence,researchEvidenceGraph} from '../src/publicResearchEvidence.js';
import {renderPublicEvidence} from '../src/publicResearchEvidenceView.js';
if(!process.argv.slice(2).length)throw Error('Supply public publication JSON files in earlier-role order.');
class Element {constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.dataset={};}append(...x){this.children.push(...x);}set innerHTML(_){throw Error('HTML prohibited');}}
globalThis.document={createElement:t=>new Element(t)};
const all=new Map(),summary=[],flatten=n=>[n,...n.children.flatMap(flatten)];
for(const filename of process.argv.slice(2)){
 const raw=fs.readFileSync(filename),p=JSON.parse(raw),bytes=canonicalEvidence(p.evidence);
 const verified=await fetchPublicEvidence(p.record,{endpoint:'https://glim-think-v1.aw-ab5.workers.dev/research/activity',fetcher:async()=>new Response(bytes)});
 all.set(p.record.id,{record:p.record,evidence:verified.evidence});
 const graph=researchEvidenceGraph(p.record,verified.evidence,all);assert.equal(graph.unresolved.length,0);
 const nodes=flatten(renderPublicEvidence(p.record,{status:'verified',...verified},undefined,all));
 assert.ok(nodes.some(n=>n.textContent===p.evidence.report.summary));assert.ok(nodes.some(n=>n.textContent.includes(p.evidence.provenance.model)));
 assert.equal(graph.edges.filter(e=>['supports','contradicts','inconclusive'].includes(e.relation)).length,p.evidence.report.assessments.length);
 summary.push({role:p.evidence.report.role,id:p.record.id,fixtureSha256:crypto.createHash('sha256').update(raw).digest('hex'),evidenceSha256:verified.sha256,evidenceBytes:Buffer.byteLength(bytes),claims:p.evidence.report.claims.length,assessments:p.evidence.report.assessments.length,nodes:graph.nodes.length,edges:graph.edges.length,unresolved:0,fullSummaryRendered:true,modelRendered:true});
}
console.log(JSON.stringify({status:'passed',networkRequests:0,publications:summary},null,2));
