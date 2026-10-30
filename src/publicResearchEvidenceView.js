import { evidenceHash, evidenceUrl, researchEvidenceGraph } from './publicResearchEvidence.js';
import { publicActivityStore } from './publicActivityStore.js';
const el = (tag,text,cls) => { const n=document.createElement(tag); if(text!=null)n.textContent=text;if(cls)n.className=cls;return n; };
const link = (label,url) => {const a=el('a',label);a.href=url;if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer';}return a;};
function list(title,items) { const s=el('section');s.append(el('h4',title));const ul=el('ul');for(const item of items){const li=el('li');if(typeof item==='string')li.textContent=item;else li.append(item);ul.append(li);}s.append(ul);return s; }
function refs(evidence,references) {const span=el('span');for(const ref of references){const s=evidence.sources.find(s=>s.reference===ref);span.append(el('span',' '),link(s.title,s.url));}return span;}
const roleLabels = { evidence: 'Evidence', methods: 'Methods', reviewer: 'Review', principal: 'Synthesis' };

function renderResearchContext(record, evidence, verifiedPrior) {
  const section = el('section', null, 'research-context');
  section.setAttribute('aria-label', 'Where this report fits');
  section.append(el('p', 'WHERE THIS FITS', 'connections-kicker'), el('h4', evidence.topic.question));
  section.append(el('p', `${roleLabels[evidence.report.role]} report · ${evidence.provenance.model} (controller-reported)`));
  let graph;
  try { graph = researchEvidenceGraph(record, evidence, verifiedPrior); }
  catch { section.append(el('p', 'Cross-report relationships could not be verified. This report remains available on its own.')); }
  if (graph) {
    const completePrefix = !graph.unresolved.some(target => target.kind === 'role-prefix');
    const sequence = el('ol', null, 'research-context-sequence');
    sequence.setAttribute('aria-label', 'Verified report sequence');
    if (completePrefix) for (const prior of evidence.priorReports) {
      const item = el('li');
      item.append(link(roleLabels[prior.role], `#/activity/${prior.publicationId}`));
      sequence.append(item);
    }
    const current = el('li', `${roleLabels[evidence.report.role]} · you are here`);
    current.setAttribute('aria-current', 'step'); sequence.append(current); section.append(sequence);
    if (!completePrefix) section.append(el('p', 'Earlier reports are not all loaded and verified yet. Their sequence will appear when the checks finish.'));
    const followUp = graph.edges.find(edge => edge.relation === 'follows-question');
    if (followUp) {
      const question = graph.nodes.find(node => node.id === followUp.to);
      const parent = el('p', 'This investigation follows ');
      parent.append(link(`question ${evidence.topic.parentQuestionIndex + 1} from the earlier synthesis`, question.route));
      parent.append(document.createTextNode('. A follow-up does not mean the question has been answered.'));
      section.append(parent);
    } else if (evidence.topic.parentPublicationId) {
      section.append(el('p', 'A parent question is declared. Its exact link will appear after the parent report and earlier report sequence are verified.'));
    }
  }
  const explore = link('Explore this research connection →', `#/connections?report=${encodeURIComponent(record.id)}`);
  explore.className = 'connections-context-link'; section.append(explore);
  return section;
}
export function renderPublicEvidence(record,entry,endpoint,verifiedPrior=new Map()) {
  const root=el('section',null,'public-research-evidence');root.append(el('h3','Published research report'));
  if(!evidenceHash(record)){root.append(el('p','This historical record has a public summary; no full report is linked.'));return root;}
  if(entry?.status!=='verified'){root.append(el('p',entry?.status==='loading'?'Verifying the published report…':'The full report is unavailable or failed verification. The public summary remains available.'));return root;}
  const e=entry.evidence,r=e.report;
  // All content is text or validated public links. No model-produced HTML is executed.
  root.append(el('p','Automated research report · contract checked · not externally peer reviewed. Agent agreement is not empirical validation.','public-research-caveat'));
  root.append(renderResearchContext(record,e,verifiedPrior));
  root.append(el('p',`Role: ${r.role} · provider: ${e.provenance.provider} · model: ${e.provenance.model} (controller-reported) · disposition: ${r.disposition}`));
  root.append(el('p',`Completed ${e.provenance.completedAt}. Evidence bytes verified against the public record. Last fetched ${new Date(entry.checkedAt).toISOString()}.`));
  root.append(el('h4','Research question'),el('p',e.topic.question),el('h4','Report summary'),el('p',r.summary));
  root.append(list('Claims and hypotheses',r.claims.map((c,i)=>{const p=el('p',`${i+1}. ${c.kind}: ${c.statement}`);p.id=`claim-${i}`;p.append(refs(e,c.sourceReferences));return p;})));
  root.append(list('Concepts identified',r.concepts.map(c=>{const p=el('p',`${c.kind}: ${c.name}`);p.append(refs(e,c.sourceReferences));return p;})));
  root.append(list('Assessments of earlier claims',r.assessments.map(a=>{const prior=e.priorReports.find(p=>p.role===a.targetRole),p=el('p',`${a.verdict} — ${a.reason} `);p.append(link(`${a.targetRole} claim ${a.claimIndex+1}`,`#/activity/${prior.publicationId}`),refs(e,a.sourceReferences));return p;})));
  root.append(list('Open questions',r.questions.map((q,i)=>{const p=el('p',q);p.dataset.questionIndex=String(i);return p;})),list('Proposed discovery queries',r.queries));
  const trail=el('section');trail.append(el('h4','Research lineage'));
  if(e.topic.parentPublicationId)trail.append(link(`Declared parent publication — question ${e.topic.parentQuestionIndex+1}`,`#/activity/${e.topic.parentPublicationId}?question=${e.topic.parentQuestionIndex}`));
  else if(e.topic.parentTopicId)trail.append(el('p','Parent topic exists; its public publication is not linked.'));
  else trail.append(el('p','This is a root discovery topic.'));
  for(const prior of e.priorReports)trail.append(el('p'),link(`${prior.role} report`, `#/activity/${prior.publicationId}`));
  root.append(trail);
  const details=el('details');details.append(el('summary','Machine-readable evidence and provenance'),link('Verified public evidence JSON',entry.url||evidenceUrl(endpoint,record.id)),el('p',`SHA-256: ${entry.sha256}`));
  details.append(el('p',`Accepted output SHA-256: ${e.provenance.outputSha256}`),el('p',`Execution receipt SHA-256: ${e.provenance.receiptSha256}`),el('p',`Archive SHA-256: ${e.provenance.archiveSha256}`));
  for(const source of e.sources)details.append(el('p',`${source.title} · source semantic SHA-256: ${source.semanticSha256}`));
  root.append(details,renderEvidenceGraph(record,e,verifiedPrior));return root;
}
export function renderEvidenceGraph(record,evidence,verifiedPrior=new Map()) {
  const root=el('section',null,'public-research-graph');
  let graph;try{graph=researchEvidenceGraph(record,evidence,verifiedPrior);}catch{root.append(el('p','Evidence relationships failed their cross-report check. No target-claim edges are displayed.'));return root;}
  root.append(el('h4','Evidence relationships'),el('p','Citations identify provenance. Supports, contradicts and inconclusive are attributed automated assessments, not physical validation.'));
  const nodes=new Map(graph.nodes.map(n=>[n.id,n])),ul=el('ul');
  for(const edge of graph.edges){const a=nodes.get(edge.from),b=nodes.get(edge.to),li=el('li');
    li.dataset.relation=edge.relation;
    li.append(el('span',a.label),el('strong',` → ${edge.relation} → `));
    if(b.url||b.route)li.append(link(b.label,b.url||b.route));else li.append(el('span',b.label));ul.append(li);
  }root.append(ul);
  if(graph.unresolved.length)root.append(el('p',`${graph.unresolved.length} earlier claim or question targets are not loaded and verified. Their typed edges are withheld; follow the earlier publication to inspect them.`));
  return root;
}
/** A bounded live layer alongside the static corpus. It never claims archive completeness. */
export function renderPublishedResearchGraph(mount,store=publicActivityStore()) {
  const root=el('section',null,'published-research-graph'),status=el('p'),content=el('div'),button=el('button','Load more published reports'),refresh=el('button','Check for new publications');
  button.type=refresh.type='button';status.setAttribute('role','status');
  root.append(link('Machine-readable published knowledge graph',new URL('/research/knowledge',store.endpoint).href));
  root.append(el('h2','Published research knowledge graph'),el('p','Live research reports alongside the curated article graph. Each report is verified against its publication hash. This bounded view is not the complete research archive.'),status,content,button,refresh);mount.append(root);
  let bound=6,disposed=false;const requested=new Set();
  const paint=state=>{
    if(disposed)return;const candidates=state.records.filter(r=>evidenceHash(r)),selected=candidates.slice(0,bound);
    const priorMap=new Map(state.records.filter(r=>state.evidence?.[r.id]?.status==='verified').map(r=>[r.id,{record:r,evidence:state.evidence[r.id].evidence}]));
    const verified=selected.filter(r=>state.evidence?.[r.id]?.status==='verified');
    const failures=selected.filter(r=>state.evidence?.[r.id]?.status==='unavailable').length;
    status.textContent=`${verified.length} verified reports of ${selected.length} selected from ${state.records.length} loaded public records. Limit ${bound}/20 reports. ${failures} unavailable or unverified. Latest feed: ${state.source==='live'?'live check':'saved or unavailable'}.`;
    if(state.checkedAt)status.textContent+=` Last successful feed check ${new Date(state.checkedAt).toISOString()}.`;
    const successors=new Map(state.records.filter(r=>r.supersedes).map(r=>[r.supersedes,r.id]));
    content.replaceChildren(...verified.map(record=>{const entry=state.evidence[record.id],card=el('article',null,'research-activity-card');card.append(link(record.title,`#/activity/${record.id}`),el('p',`Observed ${record.observedAt} · ${entry.evidence.report.role} · ${entry.evidence.provenance.model} (controller-reported).`));if(successors.has(record.id))card.append(link('Superseded — read correction',`#/activity/${successors.get(record.id)}`));card.append(renderEvidenceGraph(record,entry.evidence,priorMap));return card;}));
    if(!selected.length)content.append(el('p','No full research reports are present in the loaded records. The curated article graph remains available above.'));
    button.disabled=bound>=20;button.textContent=bound>=20?'20-report view limit reached':'Load more published reports';
    for(const r of selected)if(!requested.has(r.id)&&requested.size<20){requested.add(r.id);queueMicrotask(()=>{if(!disposed)store.loadEvidence(r.id);});}
  };
  const unsubscribe=store.subscribe(paint);
  button.onclick=()=>{bound=Math.min(20,bound+6);paint(store.state);if(!store.state.archiveComplete)store.loadMore();};
  refresh.onclick=()=>{for(const id of requested)if(store.state.evidence?.[id]?.status==='unavailable')store.loadEvidence(id,{retry:true});store.refresh();};
  store.refresh();
  return ()=>{disposed=true;unsubscribe();};
}
