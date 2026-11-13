import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { keywordLabel, normalizeKeyword } from '../src/knowledgeHomeModel.js';

export const LIBRARY_ORIGIN = 'https://library.lupine.science';
const english = value => typeof value === 'string' ? value : value?.en || '';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jsonLd = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const plain = value => english(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
export const articlePath = id => `/articles/${encodeURIComponent(id)}/`;
export const topicPath = value => {
  const tag = normalizeKeyword(value);
  const slug = /^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(tag) ? tag : `${String(tag).normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70) || 'keyword'}-${createHash('sha256').update(String(tag)).digest('hex').slice(0,10)}`;
  return `/topics/${slug}/`;
};
export const categoryPath = id => `/categories/${encodeURIComponent(id)}/`;
export const guidePath = id => `/guides/${encodeURIComponent(id)}/`;
const GUIDE_TITLES = { 'new-here':'Interatomic potentials and materials simulation: a reading guide', 'materials-scientist':'Evaluating materials-simulation claims', 'mlip-builder':'Machine-learning potentials: methods and reproducibility', 'funder-reviewer':'Research rigor and formal evidence', 'research-progress':'Lupine research results and corrections' };
const absolute = route => `${LIBRARY_ORIGIN}${route}`;
const sortTitle = (a,b) => english(a.title).localeCompare(english(b.title), 'en') || a.id.localeCompare(b.id);

const articleKeywords = article => [...new Set((article.tags || []).map(normalizeKeyword).filter(tag => tag && tag !== 'featured'))];
export function taxonomyGroups(articles) {
  const groups = new Map();
  for (const article of articles) for (const tag of articleKeywords(article)) {
    if (!groups.has(tag)) groups.set(tag, []);
    groups.get(tag).push(article);
  }
  return [...groups].map(([tag,items])=>({tag,label:keywordLabel(tag),articles:[...items].sort(sortTitle)}))
    .sort((a,b)=>b.articles.length-a.articles.length || a.label.localeCompare(b.label,'en') || a.tag.localeCompare(b.tag));
}
export function seoPaths(catalog) {
  const entries=catalog.entries || [];
  const categories=[...new Set(entries.map(a=>a.category))].sort();
  return ['/', '/articles/', '/topics/', '/guides/', ...(catalog.journeys || []).map(g=>guidePath(g.id)), ...entries.map(a=>articlePath(a.id)),
    ...categories.map(categoryPath), ...taxonomyGroups(entries).map(t=>topicPath(t.tag))];
}

/** Only metadata attached to the reviewed source is used. Build/export clocks are not publication dates. */
export function articleStructuredData(article, meta={}) {
  const canonical=absolute(articlePath(article.id));
  return {
    '@context':'https://schema.org', '@type':'Article', '@id':`${canonical}#article`,
    headline:english(article.title), description:plain(article.subtitle), url:canonical,
    mainEntityOfPage:{'@type':'WebPage','@id':canonical}, inLanguage:article.lang || 'en',
    isPartOf:{'@type':'CollectionPage','@id':absolute('/articles/'),name:'Lupine materials-science research library'},
    publisher:{'@type':'Organization','@id':'https://lupine.science/#organization',name:'Lupine Science',url:'https://lupine.science'},
    keywords:articleKeywords(article).map(keywordLabel), articleSection:meta.categoryLabel || article.category,
    ...(Number.isSafeInteger(article.words) && article.words>0 ? {wordCount:article.words} : {}),
    ...(article.editorial?.applied && article.originalTitle ? {alternativeHeadline:article.originalTitle} : {}),
  };
}
const css=`@font-face{font-family:Newsreader;src:url('/fonts/newsreader-var.woff2') format('woff2');font-display:swap}@font-face{font-family:Plex;src:url('/fonts/plex-mono-400.woff2') format('woff2');font-display:swap}:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;background:#080a10;color:#dedfe7;font:18px/1.7 system-ui,sans-serif}a{color:#aeb7ff;text-underline-offset:.2em}a:hover{color:#fff}a:focus-visible{outline:2px solid #bcc6ff;outline-offset:4px}header,main,footer{max-width:950px;margin:auto;padding:1.4rem 1.5rem}header{border-bottom:1px solid #30333f}header nav{display:flex;gap:1.2rem;flex-wrap:wrap;font:12px/1.6 Plex,monospace}.brand{font:26px/1.3 Newsreader,serif;color:#eee;text-decoration:none;margin-right:auto}h1,h2,h3{font-family:Newsreader,Georgia,serif;line-height:1.15;font-weight:450;overflow-wrap:anywhere}h1{font-size:clamp(2rem,5vw,3.5rem);margin:1.6rem 0 .6rem}h2{font-size:2rem;margin-top:2rem}h3{font-size:1.5rem}p,li{overflow-wrap:anywhere}.lead{color:#b9bcc9;font-size:1.15rem}.meta,.provenance,footer{font-size:.85rem;color:#a8acbc}.meta a{display:inline-block;margin-right:.7rem}.content{margin-top:2rem}.content img,.content video,.content iframe{max-width:100%;height:auto}.content pre{overflow:auto;padding:1rem;background:#151824}.content code{font-size:.83em}.content table{display:block;overflow:auto;max-width:100%;border-collapse:collapse;font-size:.9rem}.content th,.content td{padding:.5rem;border:1px solid #3a3f50;vertical-align:top}.content blockquote{margin:1rem 0;padding:.4rem 1rem;border-left:3px solid #8c94cd;background:#131722}.content .katex-display{overflow:auto hidden;padding:.5rem 0}.provenance{padding:1rem;border:1px solid #303746;border-radius:6px}.provenance summary{cursor:pointer}.entries{list-style:none;padding:0}.entries>li{padding:1.2rem 0;border-bottom:1px solid #30333f}.entries h2{font-size:1.6rem;margin:0}.entries p{margin:.3rem 0}.entries:is(ol){list-style:decimal;padding-left:1.8rem}.source-reference small{color:#afb3c3;font-size:.8em}.topics{display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;padding:0}.topics a{display:block;padding:.3rem .7rem;border:1px solid #303746;border-radius:4px}.skip{position:absolute;left:-10000px}.skip:focus{position:static}footer{border-top:1px solid #30333f;margin-top:3rem}.note{font-size:.85rem;color:#b4b8c8}@media(max-width:500px){header,main,footer{padding:1rem}body{font-size:16px}header nav{gap:.8rem}.brand{width:100%}}`;
function shell({title,description,route,body,schema}) {
  const canonical=absolute(route);
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} | Lupine Library</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${escape(canonical)}"><meta property="og:type" content="${schema?.['@type']==='Article'?'article':'website'}"><meta property="og:site_name" content="Lupine Library"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:image" content="${LIBRARY_ORIGIN}/og-lupine-library.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/seo-reader.css"><link rel="stylesheet" href="/katex/katex.min.css"><link rel="alternate" type="text/plain" href="/llms.txt" title="Research agent guide"><script type="application/ld+json">${jsonLd(schema)}</script></head><body><a class="skip" href="#content">Skip to content</a><header><nav aria-label="Library navigation"><a class="brand" href="/">Lupine Library</a><a href="/articles/">All articles</a><a href="/topics/">Research keywords</a><a href="/guides/">Reading guides</a><a href="/#/connections">Research connections</a><a href="/llms.txt">For research agents</a></nav></header><main id="content">${body}</main><footer><p>Lupine Science · Materials science, interatomic potentials and inspectable research evidence.</p><p><a href="/articles/">Article index</a> · <a href="/data/library.json">Library metadata</a> · <a href="/llms-full.txt">Complete agent index</a> · <a href="/sitemap.xml">Sitemap</a></p></footer></body></html>\n`;
}
/** Known retained documents become canonical links; unavailable source paths remain explicit text. */
export function rewriteArticleLinks(html, articleIds, {source = '', sourceMap = new Map()} = {}) {
  const resolve = url => {
    const match=url.match(/^(?:https:\/\/library\.lupine\.science)?\/?#\/read\/([^?&#]+)(.*)$/);
    if(match){let id;try{id=decodeURIComponent(match[1]);}catch{return null;}if(!articleIds.has(id))return null;
      return match[2] ? `/#/read/${match[1]}${match[2]}` : articlePath(id);
    }
    if(url.startsWith('#/'))return `/${url}`;
    if(/^(?:https?:|mailto:|tel:|\/|#)/i.test(url))return url;
    // This mapping is solely between already published corpus entries; no source files are copied.
    const [file,fragment]=url.split('#');
    let decoded;try{decoded=decodeURIComponent(file);}catch{return null;}
    const id=sourceMap.get(path.posix.normalize(path.posix.join(path.posix.dirname(source),decoded)));
    return id ? `${articlePath(id)}${fragment ? `#${fragment}` : ''}` : null;
  };
  return html.replace(/<a\b([^>]*?)\bhref=(['"])([^'"]+)\2([^>]*)>([\s\S]*?)<\/a>/gi, (all,before,quote,url,after,body)=>{
    const target=resolve(url);
    return target === null ? `<span class="source-reference" title="Source reference not included in this Library export">${body}<small> [source reference: <code>${escape(url)}</code>; not included in this export]</small></span>` : `<a${before}href=${quote}${target}${quote}${after}>${body}</a>`;
  }).replace(/<img\b([^>]*?)\bsrc=(['"])([^'"]+)\2([^>]*)>/gi,(all,before,quote,url)=>{
    if(/^(?:https?:|\/|data:image\/)/i.test(url))return all;
    return `<span class="source-reference">[Image source not included in this export: <code>${escape(url)}</code>]</span>`;
  });
}
const decodeHeadingText = text => text.replace(/<[^>]*>/g, ' ').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (all,entity)=> {
  const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  if(entity[0] !== '#')return named[entity.toLowerCase()] ?? all;
  const code=entity[1].toLowerCase()==='x' ? parseInt(entity.slice(2),16) : parseInt(entity.slice(1),10);
  return code>0 && code<=0x10ffff && !(code>=0xd800 && code<=0xdfff) ? String.fromCodePoint(code) : all;
}).normalize('NFKC').replace(/\s+/g,' ').trim();
function articleHeading(html,title) {
  const first=html.match(/^\s*<h1\b([^>]*)>([\s\S]*?)<\/h1>\s*/i);
  if(!first)return {anchor:'',content:html};
  const id=first[1].match(/\bid=(['"])(.*?)\1/i);
  const anchor=id ? ` id=${id[1]}${id[2]}${id[1]}` : '';
  const remainder=html.slice(first[0].length);
  if(decodeHeadingText(first[2])===decodeHeadingText(english(title)))return {anchor,content:remainder};
  return {anchor:'',content:`<p class="note original-heading-label">Original document heading</p><h2${first[1]}>${first[2]}</h2>${remainder}`};
}
export function renderArticlePage(article,{manifest,articleIds,sourceMap=new Map()}) {
  const meta=manifest.articles.find(a=>a.id===article.id) || article;
  const category=manifest.categories?.find(c=>c.id===article.category);
  const categoryLabel=english(category?.label) || article.category;
  const description=plain(article.subtitle).slice(0,240) || `Read ${english(article.title)} in the Lupine materials-science research library.`;
  const status=meta.status ? english(manifest.statuses?.[meta.status]?.label) || meta.status : 'No catalog claim status assigned';
  const statusGloss=meta.status ? english(manifest.statuses?.[meta.status]?.gloss) : '';
  const tags=articleKeywords(article).map(tag=>`<a href="${topicPath(tag)}">${escape(keywordLabel(tag))}</a>`).join(' ');
  const original=article.editorial?.applied ? `<p>Library description: the title above is editorial navigation. Original catalog title: <strong>${escape(article.originalTitle)}</strong>.</p>` : '';
  const exported=manifest.sourceSnapshot?.exportedAt;
  const snapshot=exported ? `<p>Source snapshot exported ${escape(exported.slice(0,10))}. This is an export date, not the article’s publication or review date.</p>` : '';
  const heading=articleHeading(article.html,article.title);
  const content=rewriteArticleLinks(heading.content,articleIds,{source:article.source,sourceMap});
  const documentDate=article.documentDate?.basis==='document-header' && Number.isSafeInteger(article.documentDate.sourceLine) && article.documentDate.sourceLine > 0 && /^\d{4}-\d{2}-\d{2}$/.test(article.documentDate.value||'') && Number.isFinite(Date.parse(article.documentDate.value)) && new Date(article.documentDate.value).toISOString().slice(0,10) === article.documentDate.value ? ` · Document date: ${escape(article.documentDate.value)}` : '';
  const body=`<p class="meta"><a href="${categoryPath(article.category)}">${escape(categoryLabel)}</a></p><h1${heading.anchor}>${escape(article.title)}</h1><p class="lead">${escape(description)}</p><p class="meta">${article.words || 0} words · ${article.readMinutes || 1} min read${documentDate}${meta.status?` · Catalog status: ${escape(status)}`:''}</p><p class="meta" aria-label="Research keywords">${tags}</p><details class="provenance"><summary>Source and evidence notes</summary><p>Catalog status: ${escape(status)}.${statusGloss?` ${escape(statusGloss)}`:''} Catalog classifications are retained source metadata; they do not establish current validation or external peer review.</p>${documentDate?'<p>The document date is stated in the retained document, not a publication or validation timestamp.</p>':''}${original}${snapshot}<p>Source: <code>${escape(article.source)}</code></p>${article.editorial?.sourceSha256?`<p>Source SHA-256: <code>${escape(article.editorial.sourceSha256)}</code></p>`:''}<p><a href="/data/${encodeURIComponent(article.id)}.json">Machine-readable article with complete HTML and metadata</a></p></details><p><a href="/#/read/${encodeURIComponent(article.id)}">Open the interactive reader</a> · <a href="/#/graph/${encodeURIComponent('article:'+article.id)}?mode=local">Explore this article’s connections</a></p><article class="content">${content}</article>`;
  return shell({title:english(article.title),description,route:articlePath(article.id),body,schema:articleStructuredData(article,{categoryLabel})});
}
function articleList(articles,manifest,ordered=false) {
  const list=ordered ? [...articles] : [...articles].sort(sortTitle),tag=ordered?'ol':'ul';
  return `<${tag} class="entries">${list.map(a=>{
    const category=manifest.categories?.find(c=>c.id===a.category);
    return `<li><h2><a href="${articlePath(a.id)}">${escape(a.title)}</a></h2><p>${escape(a.subtitle)}</p><p class="meta"><a href="${categoryPath(a.category)}">${escape(english(category?.label)||a.category)}</a> · ${articleKeywords(a).map(t=>`<a href="${topicPath(t)}">${escape(keywordLabel(t))}</a>`).join(' · ')}</p></li>`;
  }).join('')}</${tag}>`;
}
function collection({title,description,route,articles,manifest,lead='',ordered=false}) {
  const listed=ordered?[...articles]:[...articles].sort(sortTitle);
  const schema={'@context':'https://schema.org','@type':'CollectionPage','@id':absolute(route),name:title,description,url:absolute(route),inLanguage:'en',
    mainEntity:{'@type':'ItemList',numberOfItems:articles.length,itemListElement:listed.map((a,i)=>({'@type':'ListItem',position:i+1,url:absolute(articlePath(a.id)),name:english(a.title)}))}};
  return shell({title,description,route,body:`<h1>${escape(title)}</h1><p class="lead">${escape(description)}</p>${lead}<p class="meta">${articles.length} articles in this collection.</p>${articleList(listed,manifest,ordered)}`,schema});
}
export function writeSeoPages({articles,manifest,outputRoot}) {
  const englishArticles=articles.filter(a=>!a.lang || a.lang==='en');
  const ids=new Set();for(const a of englishArticles){if(!/^[a-z0-9][a-z0-9-]*$/.test(a.id)||!/^[a-z0-9][a-z0-9-]*$/.test(a.category)||ids.has(a.id)||typeof a.html!=='string')throw Error('Invalid or duplicate SEO article');ids.add(a.id);}
  const write=(route,html)=>{const dir=path.resolve(outputRoot,route.replace(/^\//,''));if(!dir.startsWith(path.resolve(outputRoot)+path.sep))throw Error('SEO path escaped output');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html);};
  const sourceMap = new Map(englishArticles.filter(a=>typeof a.source==='string').map(a=>[path.posix.normalize(a.source),a.id]));
  for(const article of englishArticles)write(articlePath(article.id),renderArticlePage(article,{manifest,articleIds:ids,sourceMap}));
  write('/articles/',collection({title:'Materials-science research articles',description:'Research on interatomic potentials, machine learning models, materials simulation, validation and uncertainty from Lupine Science.',route:'/articles/',articles:englishArticles,manifest}));
  const topics=taxonomyGroups(englishArticles);
  for(const topic of topics)write(topicPath(topic.tag),collection({title:`${topic.label} — materials-science research`,description:`Explore ${topic.articles.length} Lupine Library articles tagged ${topic.label}, with research context, evidence and source provenance.`,route:topicPath(topic.tag),articles:topic.articles,manifest}));
  const topicSchema={'@context':'https://schema.org','@type':'CollectionPage','@id':absolute('/topics/'),name:'Materials-science research keywords',url:absolute('/topics/'),mainEntity:{'@type':'ItemList',numberOfItems:topics.length,itemListElement:topics.map((t,i)=>({'@type':'ListItem',position:i+1,url:absolute(topicPath(t.tag)),name:t.label}))}};
  write('/topics/',shell({title:'Materials-science research keywords',description:'Browse Lupine Library research keywords, ordered by the number of related articles.',route:'/topics/',schema:topicSchema,body:`<h1>Research keywords</h1><p class="lead">Browse the Library by subject. Keywords are ordered by the number of related articles.</p><ul class="topics">${topics.map(t=>`<li><a href="${topicPath(t.tag)}">${escape(t.label)} (${t.articles.length})</a></li>`).join('')}</ul>`}));
  const categories=[...new Set(englishArticles.map(a=>a.category))].sort();
  for(const id of categories){const c=manifest.categories?.find(c=>c.id===id),items=englishArticles.filter(a=>a.category===id);write(categoryPath(id),collection({title:english(c?.label)||id,description:english(c?.blurb)||`Lupine Library research in ${id}.`,route:categoryPath(id),articles:items,manifest}));}
  const byId=new Map(englishArticles.map(a=>[a.id,a]));
  const guides=(manifest.journeys || []).map(g=>{
    if(!/^[a-z0-9][a-z0-9-]*$/.test(g.id)||!Array.isArray(g.path)||g.path.some(id=>!byId.has(id)))throw Error('Reading guide references unavailable article');
    return {...g,title:GUIDE_TITLES[g.id] || english(g.label),articles:g.path.map(id=>byId.get(id))};
  });
  for(const g of guides)write(guidePath(g.id),collection({title:g.title,description:english(g.description),route:guidePath(g.id),articles:g.articles,manifest,ordered:true,lead:'<p class="note">A guided reading path through selected Lupine research, in its recorded order. Follow the articles to connect foundational ideas, methods and evidence.</p>'}));
  const guideSchema={'@context':'https://schema.org','@type':'CollectionPage','@id':absolute('/guides/'),name:'Materials-science reading guides',url:absolute('/guides/'),mainEntity:{'@type':'ItemList',numberOfItems:guides.length,itemListElement:guides.map((g,i)=>({'@type':'ListItem',position:i+1,url:absolute(guidePath(g.id)),name:g.title}))}};
  write('/guides/',shell({title:'Materials-science reading guides',description:'Reading paths through interatomic potentials, materials-simulation evidence, machine-learning models and reproducible research.',route:'/guides/',schema:guideSchema,body:`<h1>Materials-science reading guides</h1><p class="lead">Follow a path through the research, from foundational vocabulary to methods and evidence.</p><p class="note">Curated paths through selected Library articles, connecting foundational ideas with methods and research evidence.</p><ul class="entries">${guides.map(g=>`<li><h2><a href="${guidePath(g.id)}">${escape(g.title)}</a></h2><p>${escape(english(g.description))}</p><p class="meta">${g.articles.length} articles · recorded reading order</p></li>`).join('')}</ul>`}));
  const homePath=path.join(outputRoot,'index.html');
  if(fs.existsSync(homePath)){
    const home=`<section aria-labelledby="library-intro"><h1 id="library-intro">Materials science, connected.</h1><p>Explore Lupine Science research on interatomic potentials, machine learning models, simulation accuracy, uncertainty and reproducible evidence.</p><p><a href="/articles/">Read all ${englishArticles.length} research articles</a> · <a href="/topics/">Browse research keywords</a> · <a href="/guides/">Follow a reading guide</a> · <a href="/data/discovery.json">Research-agent discovery index</a></p><ul>${topics.slice(0,8).map(t=>`<li><a href="${topicPath(t.tag)}">${escape(t.label)} (${t.articles.length} articles)</a></li>`).join('')}</ul><p>Source records retain limitations, corrections and claim status. New accepted team reports are available through the separate <a href="/#/research">research archive</a> and <a href="https://glim-think-v1.aw-ab5.workers.dev/research/activity/archive?after=0&amp;limit=50">public research API</a>.</p></section>`;
    const initial=fs.readFileSync(homePath,'utf8');if(!initial.includes('__SEO_HOME__'))throw Error('Homepage SEO marker missing');
    fs.writeFileSync(homePath,initial.replace('__SEO_HOME__',home));
  }
  fs.writeFileSync(path.join(outputRoot,'404.html'),shell({title:'Article not found',description:'This Library address does not identify a published page. Browse the research index to find a current article.',route:'/404.html',schema:{'@context':'https://schema.org','@type':'WebPage',name:'Article not found'},body:'<h1>Article not found</h1><p>This address does not identify a published Library page.</p><p><a href="/articles/">Browse all research articles</a> or <a href="/">explore the knowledge graph</a>.</p>'}).replace('<meta name="viewport"','<meta name="robots" content="noindex"><meta name="viewport"'));
  fs.writeFileSync(path.join(outputRoot,'seo-reader.css'),css+'\n');
  const discovery={schema:'lupine.library.discovery.v1',origin:LIBRARY_ORIGIN,articleCount:englishArticles.length,language:'en',scope:'Static Library corpus with retained provenance and claim status; live research has a separate public archive.',articleIndex:absolute('/articles/'),keywordIndex:absolute('/topics/'),readingGuides:guides.map(g=>({id:g.id,title:g.title,url:absolute(guidePath(g.id)),articleIds:g.path})),sitemap:absolute('/sitemap.xml'),articles:englishArticles.map(a=>({id:a.id,title:a.title,url:absolute(articlePath(a.id)),json:absolute(`/data/${encodeURIComponent(a.id)}.json`),category:a.category,tags:a.tags,sourceSha256:a.editorial?.sourceSha256||null})),liveResearch:{activity:'https://glim-think-v1.aw-ab5.workers.dev/research/activity?limit=20',archive:'https://glim-think-v1.aw-ab5.workers.dev/research/activity/archive?after=0&limit=50',knowledge:'https://glim-think-v1.aw-ab5.workers.dev/research/knowledge'}};
  fs.writeFileSync(path.join(outputRoot,'data','discovery.json'),JSON.stringify(discovery,null,2)+'\n');
  return {articles:englishArticles.length,topics:topics.length,categories:categories.length,guides:guides.length,htmlPages:englishArticles.length+topics.length+categories.length+guides.length+3};
}
