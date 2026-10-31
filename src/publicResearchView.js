import { renderPublicEvidence } from './publicResearchEvidenceView.js';
import { evidenceHash } from './publicResearchEvidence.js';
import { publicActivityStore } from './publicActivityStore.js';
import { renderRecord } from './researchActivityView.js';
import {sourceAvailabilityHash,renderSourceAvailabilityNotice} from './sourceAvailabilityNotice.js';
export function renderPublicResearch(mount, id = null, store = publicActivityStore(), questionIndex = null) {
  let history = false; const priorRequests = new Set(); let disposed=false,questionScrolled=false;
  mount.classList.add('public-research-view');
  const heading=document.createElement('h1'); heading.textContent=id?'Research record':'Latest reviewed research';
  const nav=document.createElement('nav'), link=document.createElement('a'); link.href='#/research'; link.textContent='Research archive'; nav.className='public-research-navigation';nav.setAttribute('aria-label','Research navigation');nav.append(link);
  const connections=document.createElement('a');connections.href=id&&!id.startsWith('withdrawal-')?`#/connections?report=${encodeURIComponent(id)}`:'#/connections';connections.textContent=id&&!id.startsWith('withdrawal-')?'See this report in context':'Explore connections';nav.append(connections);
  const feature=document.createElement('section');feature.className='connections-archive-feature';
  const featureTitle=document.createElement('h2');featureTitle.textContent='Follow a question through the research.';
  const featureText=document.createElement('p');featureText.textContent='See the reports together, trace their follow-up questions, and discover the sources they share.';
  const featureLink=document.createElement('a');featureLink.href='#/connections';featureLink.textContent='Explore research connections →';feature.append(featureTitle,featureText,featureLink);
  const status=document.createElement('p'); status.setAttribute('role','status');
  const content=document.createElement('div');
  const more=document.createElement('button'); more.textContent='Load more research'; more.type='button';
  const refresh=document.createElement('button'); refresh.textContent='Check for new research'; refresh.type='button';
  const toggle=document.createElement('button'); toggle.textContent='Show correction history'; toggle.type='button'; toggle.setAttribute('aria-pressed','false');
  const controls=document.createElement('div');controls.className='public-research-controls';
  refresh.className=toggle.className=more.className='research-activity-refresh';
  controls.append(refresh,toggle);
  mount.replaceChildren(heading,nav,...(id?[]:[feature]),status,controls,content,more);
  const paint=state=>{
    const successors=new Map(state.records.filter(r=>r.supersedes).map(r=>[r.supersedes,r.id]));
    const superseded=new Set(successors.keys());
    const records=id?state.records.filter(r=>r.id===id):state.records.filter(r=>history||!superseded.has(r.id));
    status.textContent=state.archiveError?'Archive unavailable. Showing only loaded records.':state.archiveComplete?'Complete archive loaded for this snapshot.':`Partial archive · ${state.records.length} records loaded. Load more to search older research.`;
    if(!state.archiveComplete)status.textContent+=' Corrections may exist outside the loaded records.';
    if(state.source!=='live')status.textContent+=' Latest feed is saved or unavailable.';
    content.replaceChildren(...records.map(r=>{
      const card=renderRecord(r); if(id)card.querySelector('details')?.setAttribute('open','');
      if(successors.has(r.id)){const p=document.createElement('p');p.textContent='Superseded record. ';const a=document.createElement('a');a.href=`#/activity/${encodeURIComponent(successors.get(r.id))}`;a.textContent='Read correction';p.append(a);card.prepend(p);}
      if(r.supersedes){const a=document.createElement('a');a.href=`#/activity/${encodeURIComponent(r.supersedes)}`;a.textContent='Read previous record';card.append(a);}
      if(id&&state.evidence?.[r.id]?.status==='unavailable'){const retry=document.createElement('button');retry.type='button';retry.textContent='Retry verified report';retry.onclick=()=>store.loadEvidence(r.id,{retry:true});card.append(retry);}
      if(id&&sourceAvailabilityHash(r)){
        card.append(renderSourceAvailabilityNotice(state.notices?.[r.id]));
        if(!state.notices?.[r.id])queueMicrotask(()=>{if(!disposed)store.loadNotice?.(r.id);});
        if(state.notices?.[r.id]?.status==='unavailable'){const retry=document.createElement('button');retry.type='button';retry.textContent='Retry notice verification';retry.onclick=()=>store.loadNotice?.(r.id,{retry:true});card.append(retry);}
      }else if(id){const priorMap=new Map(state.records.filter(x=>state.evidence?.[x.id]?.status==='verified').map(x=>[x.id,{record:x,evidence:state.evidence[x.id].evidence}]));card.append(renderPublicEvidence(r,state.evidence?.[r.id],store.endpoint,priorMap));if(evidenceHash(r)&&!state.evidence?.[r.id])queueMicrotask(()=>{if(!disposed)store.loadEvidence?.(r.id);});}return card;
    }));
    if(id&&!records.length){const p=document.createElement('p');p.textContent='This record is not in the loaded pages. Load more research or retry when online.';content.append(p);}
    if(id&&state.evidence?.[id]?.status==='verified'){
      const e=state.evidence[id].evidence,parent=e.topic.parentPublicationId?state.evidence[e.topic.parentPublicationId]:null;
      const dependencies=[...e.priorReports,...(e.topic.parentPublicationId?[{publicationId:e.topic.parentPublicationId}]:[]),...(parent?.status==='verified'?parent.evidence.priorReports:[])];
      for(const p of dependencies)if(!priorRequests.has(p.publicationId)&&priorRequests.size<7){priorRequests.add(p.publicationId);queueMicrotask(async()=>{if(disposed)return;await store.loadRecord(p.publicationId);if(!disposed)await store.loadEvidence?.(p.publicationId);});}
    }
    if(!questionScrolled&&questionIndex!==null&&id&&state.evidence?.[id]?.status==='verified'){const target=content.querySelector(`[data-question-index="${questionIndex}"]`);if(target){questionScrolled=true;queueMicrotask(()=>{if(!disposed)target.scrollIntoView?.({block:'center',behavior:'instant'});});}}
    more.hidden=state.archiveComplete;more.disabled=state.archiveLoading;refresh.disabled=state.archiveLoading;
  };
  const unsubscribe=store.subscribe(paint);
  more.onclick=()=>store.loadMore();refresh.onclick=()=>{store.refresh();store.loadMore({refresh:true});};
  toggle.onclick=()=>{history=!history;toggle.setAttribute('aria-pressed',String(history));toggle.textContent=history?'Hide loaded superseded records':'Show correction history';paint(store.state);};
  store.refresh(); if(id)store.loadRecord(id); else if(!store.state.archiveComplete)store.loadMore();
  return ()=>{disposed=true;unsubscribe();};
}
