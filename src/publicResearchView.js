import { publicActivityStore } from './publicActivityStore.js';
import { renderRecord } from './researchActivityView.js';
export function renderPublicResearch(mount, id = null, store = publicActivityStore()) {
  let history = false;
  mount.classList.add('public-research-view');
  const heading=document.createElement('h1'); heading.textContent=id?'Research record':'Latest reviewed research';
  const nav=document.createElement('p'), link=document.createElement('a'); link.href='#/research'; link.textContent='Research archive'; nav.append(link);
  const status=document.createElement('p'); status.setAttribute('role','status');
  const content=document.createElement('div');
  const more=document.createElement('button'); more.textContent='Load more research'; more.type='button';
  const refresh=document.createElement('button'); refresh.textContent='Check for new research'; refresh.type='button';
  const toggle=document.createElement('button'); toggle.textContent='Show correction history'; toggle.type='button'; toggle.setAttribute('aria-pressed','false');
  const controls=document.createElement('div');controls.className='public-research-controls';
  refresh.className=toggle.className=more.className='research-activity-refresh';
  controls.append(refresh,toggle);
  mount.replaceChildren(heading,nav,status,controls,content,more);
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
      if(r.supersedes){const a=document.createElement('a');a.href=`#/activity/${encodeURIComponent(r.supersedes)}`;a.textContent='Read previous record';card.append(a);}return card;
    }));
    if(id&&!records.length){const p=document.createElement('p');p.textContent='This record is not in the loaded pages. Load more research or retry when online.';content.append(p);}
    more.hidden=state.archiveComplete;more.disabled=state.archiveLoading;refresh.disabled=state.archiveLoading;
  };
  const unsubscribe=store.subscribe(paint);
  more.onclick=()=>store.loadMore();refresh.onclick=()=>{store.refresh();store.loadMore({refresh:true});};
  toggle.onclick=()=>{history=!history;toggle.setAttribute('aria-pressed',String(history));toggle.textContent=history?'Hide loaded superseded records':'Show correction history';paint(store.state);};
  store.refresh(); if(id)store.loadRecord(id); else if(!store.state.archiveComplete)store.loadMore();
  return unsubscribe;
}
