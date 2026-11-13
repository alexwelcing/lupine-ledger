import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { articlePath, topicPath, taxonomyGroups, articleStructuredData, rewriteArticleLinks, renderArticlePage, writeSeoPages, seoPaths, LIBRARY_ORIGIN } from './generate-seo.mjs';
import { generateSitemap } from './generate-indexes.mjs';

const articles = [
  {id:'alpha',title:'A conditional materials result',subtitle:'A result & its limitations',category:'methods',tags:['MLIP','mlip','featured','z1'],lang:'en',words:30,readMinutes:1,source:'articles/docs/alpha.md',html:'<h2 id="limits">Limits</h2><p>Only development-set agreement; not independent validation.</p><a href="#/read/beta">Related evidence</a><a href="../missing.md">Missing file</a>',editorial:{applied:true,sourceSha256:'a'.repeat(64)},originalTitle:'Patch 4 July 2026',documentDate:{value:'2026-07-04',basis:'document-header',sourceLine:3}},
  {id:'beta',title:'B uncertainty methods',subtitle:'What the experiment establishes',category:'methods',tags:['mlip','z2'],lang:'en',words:20,source:'articles/docs/beta.md',html:'<p>The claim remains conditional.</p>'},
];
const manifest={articles:articles.map(a=>({...a,status:'open'})),categories:[{id:'methods',label:{en:'Methods and reproducibility'},blurb:{en:'Methods with inspectable assumptions.'}}],statuses:{open:{label:{en:'Open question'},gloss:{en:'Evidence is incomplete.'}}},journeys:[{id:'new-here',label:'New here',description:{en:'Start with the evidence.'},path:['beta','alpha']}],sourceSnapshot:{exportedAt:'2026-10-26T13:53:42Z'}};
const catalog={entries:manifest.articles,journeys:manifest.journeys};
const jsonLd = html => JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);

function tempLibrary(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'lupine-seo-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));fs.mkdirSync(path.join(dir,'data'));fs.writeFileSync(path.join(dir,'index.html'),'<main>__SEO_HOME__</main>');return dir;}

test('canonical static article contains retained evidence, correct provenance, and no invented metadata',()=>{
  const before=structuredClone({articles,manifest});
  const page=renderArticlePage(articles[0],{manifest,articleIds:new Set(['alpha','beta'])});
  assert.match(page,/<link rel="canonical" href="https:\/\/library\.lupine\.science\/articles\/alpha\/">/);
  assert.match(page,/Only development-set agreement; not independent validation/);
  assert.match(page,/Original catalog title: <strong>Patch 4 July 2026/);
  assert.match(page,/Document date: 2026-07-04/);
  assert.match(page,/not the article’s publication or review date/);
  assert.match(page,/href="\/articles\/beta\/"/);
  assert.match(page,/href="\/seo-reader.css"/);
  assert.doesNotMatch(page,/<script[^>]+src=|http-equiv="refresh"|window\.location/);
  const schema=jsonLd(page);
  assert.equal(schema['@type'],'Article');assert.equal(schema.url,`${LIBRARY_ORIGIN}/articles/alpha/`);
  for(const key of ['author','datePublished','dateModified','review','reviewedBy'])assert.equal(schema[key],undefined);
  assert.equal(schema.alternativeHeadline,'Patch 4 July 2026');
  assert.deepEqual({articles,manifest},before);
});

test('structured data safely escapes article text and rejects invalid document dates',()=>{
  const article={...articles[0],title:'Test </script><script>alert(1)</script>',documentDate:{value:'2026-02-31',basis:'document-header',sourceLine:2}};
  const page=renderArticlePage(article,{manifest,articleIds:new Set(['alpha','beta'])});
  assert.equal(jsonLd(page).headline,article.title);
  assert.equal((page.match(/<script/g)||[]).length,1);
  assert.doesNotMatch(page,/Document date: 2026-02-31/);
  assert.deepEqual(articleStructuredData(articles[0]).keywords,['Machine learning interatomic potentials (MLIP)','Barrier accuracy campaign (Z1)']);
});

test('keyword counts and descriptive labels match homepage normalization',()=>{
  const groups=taxonomyGroups(articles);
  assert.deepEqual(groups.map(g=>[g.tag,g.articles.length]),[['mlip',2],['z1',1],['z2',1]]);
  assert.equal(groups[0].label,'Machine learning interatomic potentials (MLIP)');
  assert.equal(topicPath('MLIP'),topicPath('mlip'));
  assert.notEqual(topicPath('café'),topicPath('cafe'));
  assert.notEqual(topicPath('a/b'),topicPath('a-b'));
  assert.equal(new Set(['café','cafe','a/b','a-b','../../'].map(topicPath)).size,5);
  assert.ok(topicPath('../../').startsWith('/topics/keyword-'));
});

test('source references map only to retained documents; unavailable files remain explicit text',()=>{
  const html='<a href="./beta.md#limits">Beta</a><a href="../secret.md">Unavailable</a><a href="#/read/beta?passage=x">Passage</a><a href="https://library.lupine.science/#/read/beta">Absolute</a><a href="#local">Local</a><img src="missing.png" alt="Missing">';
  const out=rewriteArticleLinks(html,new Set(['alpha','beta']),{source:articles[0].source,sourceMap:new Map([[articles[1].source,'beta']])});
  assert.match(out,/href="\/articles\/beta\/#limits"/);
  assert.match(out,/href="\/#\/read\/beta\?passage=x"/);
  assert.match(out,/href="\/articles\/beta\/">Absolute/);
  assert.match(out,/href="#local"/);
  assert.doesNotMatch(out,/href="\.\.\/secret|src="missing.png"/);
  assert.match(out,/source reference: <code>\.\.\/secret.md<\/code>; not included in this export/);
  assert.match(out,/Image source not included in this export/);
});

test('every canonical sitemap URL has HTML, full bodies, and separate live discovery',t=>{
  const dir=tempLibrary(t),result=writeSeoPages({articles,manifest,outputRoot:dir});
  const sitemap=generateSitemap(catalog);
  assert.equal(result.articles,2);assert.equal(result.topics,3);assert.equal(result.guides,1);
  const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.deepEqual(urls,seoPaths(catalog).map(p=>LIBRARY_ORIGIN+p));
  for(const url of urls){const route=new URL(url).pathname;assert.ok(fs.existsSync(path.join(dir,route,'index.html')),url);}
  assert.doesNotMatch(sitemap,/#|\.json|<lastmod>/);
  const home=fs.readFileSync(path.join(dir,'index.html'),'utf8');
  assert.match(home,/Materials science, connected/);assert.match(home,/href="\/articles\/"/);assert.match(home,/public research API/);assert.doesNotMatch(home,/__SEO_HOME__/);
  const discovery=JSON.parse(fs.readFileSync(path.join(dir,'data/discovery.json')));
  assert.equal(discovery.articleCount,2);assert.equal(discovery.articles[0].url,`${LIBRARY_ORIGIN}${articlePath('alpha')}`);
  assert.ok(discovery.liveResearch.archive.startsWith('https://glim-think-v1.aw-ab5.workers.dev/'));
  assert.deepEqual(discovery.articles[0].tags,articles[0].tags);
  const notFound=fs.readFileSync(path.join(dir,'404.html'),'utf8');assert.match(notFound,/<meta name="robots" content="noindex">/);
});

test('reading guides preserve recorded order and make no course claim',t=>{
  const dir=tempLibrary(t);writeSeoPages({articles,manifest,outputRoot:dir});
  const page=fs.readFileSync(path.join(dir,'guides/new-here/index.html'),'utf8');
  const schema=jsonLd(page);
  assert.equal(schema['@type'],'CollectionPage');
  assert.deepEqual(schema.mainEntity.itemListElement.map(x=>x.url),['beta','alpha'].map(id=>LIBRARY_ORIGIN+articlePath(id)));
  assert.match(page,/selected Lupine research/);assert.match(page,/<ol class="entries">/);
  assert.doesNotMatch(page,/"@type":"Course"|courseCode|educationalCredentialAwarded/);
  assert.throws(()=>writeSeoPages({articles,manifest:{...manifest,journeys:[{id:'bad',path:['absent']}]},outputRoot:tempLibrary(t)}),/unavailable article/);
});

test('the actual retained corpus has only canonical or explicitly unavailable local source links',()=>{
  const corpus=JSON.parse(fs.readFileSync(new URL('../dist/data/corpus.json',import.meta.url))).articles;
  const ids=new Set(corpus.map(a=>a.id)),sources=new Map(corpus.map(a=>[path.posix.normalize(a.source),a.id]));
  let missing=0;
  for(const a of corpus){const html=rewriteArticleLinks(a.html,ids,{source:a.source,sourceMap:sources});
    for(const m of html.matchAll(/(?:href|src)=(['"])(.*?)\1/g)){assert.match(m[2],/^(?:https?:|mailto:|tel:|\/|#|data:image\/)/i,`${a.id}: ${m[2].slice(0,100)}`);}
    missing+=(html.match(/source reference: <code>/g)||[]).length;
  }
  assert.ok(missing>0,'Missing source references must be disclosed, not copied from private files');
});

test('the compact article header preserves status caveats inside provenance and omits unassigned status outside',()=>{
  const unassigned={...manifest,articles:manifest.articles.map(a=>({...a,status:undefined}))};
  const page=renderArticlePage(articles[0],{manifest:unassigned,articleIds:new Set(['alpha','beta'])});
  const details=page.match(/<details class="provenance">[\s\S]*?<\/details>/)[0];
  assert.match(details,/No catalog claim status assigned/);
  assert.match(details,/do not establish current validation or external peer review/);
  assert.match(details,/not a publication or validation timestamp/);
  assert.doesNotMatch(page.replace(details,''),/Catalog status:|do not establish current validation/);
  const assigned=renderArticlePage(articles[0],{manifest,articleIds:new Set(['alpha','beta'])});
  assert.match(assigned,/<p class="meta">[^<]*Catalog status: Open question<\/p>/);
  assert.match(assigned,/<details class="provenance">[\s\S]*Evidence is incomplete/);
});

test('an identical initial source heading is shown once and retains its anchor',()=>{
  const a={...articles[0],title:'Energy & forces',html:'\n<h1 id="energy-forces">Energy &amp; <em>forces</em></h1><p>Evidence body.</p>'};
  const page=renderArticlePage(a,{manifest,articleIds:new Set(['alpha','beta'])});
  assert.equal((page.match(/<h1\b/g)||[]).length,1);
  assert.match(page,/<h1 id="energy-forces">Energy &amp; forces<\/h1>/);
  assert.match(page,/<article class="content"><p>Evidence body/);
  assert.doesNotMatch(page,/Original document heading/);
});

test('a different source heading remains explicitly attributed as h2 with its anchor',()=>{
  const a={...articles[0],html:'<h1 id="original-title">Original &amp; conditional result</h1><p>Evidence body.</p>'};
  const page=renderArticlePage(a,{manifest,articleIds:new Set(['alpha','beta'])});
  assert.equal((page.match(/<h1\b/g)||[]).length,1);
  assert.match(page,/Original document heading<\/p><h2 id="original-title">Original &amp; conditional result<\/h2>/);
  assert.match(page,/<p>Evidence body/);
});

test('both hash-reader URL forms canonicalize while passage queries keep interactive semantics',()=>{
  const html=['#/read/beta','/#/read/beta','https://library.lupine.science/#/read/beta','/#/read/beta?passage=limits'].map(url=>`<a href="${url}">Link</a>`).join('');
  const out=rewriteArticleLinks(html,new Set(['beta']));
  assert.equal((out.match(/href="\/articles\/beta\/"/g)||[]).length,3);
  assert.match(out,/href="\/#\/read\/beta\?passage=limits"/);
});
