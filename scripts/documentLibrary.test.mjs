import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createDocumentIndex, createDocumentSession, createDocumentMeasurements,
  filterDocuments, documentRoute, documentSearchText } from '../src/documentLibraryModel.js';

const manifest = { categories: [{id:'methods',label:{en:'Methods & Theory'}},{id:'validation',label:{en:'Validation & Evidence'}}],
  statuses: { supported: {label:{en:'Supported'},gloss:{en:'Evidence-backed, not proven'}} },
  articles: [{id:'a',title:{en:'An informative article title'},category:'methods',status:'supported'},
    {id:'research-index',title:{en:'Research guide'},category:'methods'},
    {id:'b',title:{en:'A missing article'},category:'validation'}] };
const richHTML = '<h2 id="section-a">Specific results</h2><p>Phonon &amp; vacancy correlation</p><table><tr><td>0.32</td></tr></table><span class="katex">x</span>';
const corpus = {articles:[{id:'a',lang:'en',title:'An informative article title',subtitle:'A sufficiently long summary',html:richHTML,readMinutes:5,words:1000},
  {id:'a',lang:'zh',title:'中文标题',html:'<p>完整内容</p>'},
  {id:'research-index',lang:'en',title:'Research guide',html:'<p>Start here</p>'},
  {id:'extra',lang:'en',title:'Additional corpus article',category:'methods',html:'<p>Never dropped</p>'}]};

test('complete document index retains manifest records, extra corpus articles, and untouched rich HTML', () => {
  const index = createDocumentIndex(manifest,corpus);
  assert.deepEqual(index.documents.map(item=>item.id), ['research-index','a','b','extra']);
  assert.equal(index.byId.get('a').html,richHTML);
  assert.equal(index.byId.get('a').statusLabel,'Supported');
  assert.equal(index.byId.get('b').available,false);
  assert.equal(index.categories.find(item=>item.id==='methods').count,3);
});

test('language selection uses available translation with explicit English fallback', () => {
  const index = createDocumentIndex(manifest,corpus,'zh');
  assert.equal(index.byId.get('a').title,'中文标题');
  assert.equal(index.byId.get('a').lang,'zh');
  assert.equal(index.byId.get('research-index').lang,'en');
  assert.equal(index.byId.get('research-index').requestedLanguage,'zh');
});

test('passage selection pins the English source and switching back restores the translated document', () => {
  const session = createDocumentSession(createDocumentIndex(manifest,corpus,'zh'));
  assert.equal(session.open('a').document.lang,'zh');
  session.rememberScroll(90);
  const anchored = session.open('a','section-a');
  assert.equal(anchored.document.lang,'en');
  assert.equal(anchored.document.html,richHTML);
  assert.equal(anchored.document.statusLabel,'Supported');
  assert.equal(anchored.sameDocument,false);
  assert.equal(session.open('a','section-a').unchanged,true);
  session.rememberScroll(250);
  const normal = session.open('a');
  assert.equal(normal.document.lang,'zh');
  assert.equal(normal.sameDocument,false);
  assert.equal(normal.scrollTop,90);
});

test('full article search combines all query terms and category without changing HTML', () => {
  const index = createDocumentIndex(manifest,corpus);
  assert.deepEqual(filterDocuments(index,'phonon vacancy','methods').map(item=>item.id),['a']);
  assert.equal(filterDocuments(index,'phonon vacancy','validation').length,0);
  assert.equal(filterDocuments(index,'  PHONON  ').length,1);
  assert.equal(index.byId.get('a').html,richHTML);
  assert.equal(documentSearchText('<style>hidden</style><p>Ni&#x2013;Co &amp; Cr</p>'),'Ni–Co & Cr');
});

test('search ranks exact subject titles before metadata and incidental body mentions', () => {
  const index = createDocumentIndex({articles:[{id:'research-index',title:'Research Index',category:'methods'},
    {id:'body',title:'General study',category:'methods'}, {id:'subtitle',title:'Key findings',subtitle:'Phonon results',category:'methods'},
    {id:'title',title:'Phonon Frequency Benchmarking',category:'methods'}]}, {articles:[
    {id:'research-index',lang:'en',html:'<p>phonon</p>'}, {id:'body',lang:'en',html:'<p>phonon</p>'},
    {id:'subtitle',lang:'en',html:'<p>phonon</p>'}, {id:'title',lang:'en',html:'<p>phonon</p>'},
  ]});
  assert.deepEqual(filterDocuments(index,'phonon').map(item=>item.id), ['title','subtitle','research-index','body']);
  assert.deepEqual(filterDocuments(index,'').map(item=>item.id), ['research-index','body','subtitle','title']);
  assert.equal(filterDocuments(index,'phonon','validation').length,0);
});

test('synchronous selection restores each article position and repeated route callbacks are no-ops', () => {
  const session = createDocumentSession(createDocumentIndex(manifest,corpus));
  assert.equal(session.open('a').document.html,richHTML);
  session.rememberScroll(450);
  session.open('research-index'); session.rememberScroll(120);
  assert.equal(session.open('a').scrollTop,450);
  assert.equal(session.open('a').unchanged,true);
  assert.equal(session.open('a','section-a').sameDocument,true);
  assert.equal(session.open('a','section-a').unchanged,true);
  assert.equal(session.open('unknown'),null);
  assert.equal(session.currentId,'a');
});

test('Pretext prepares all titles and summaries once, reflows widths, and never truncates titles', () => {
  const docs = [{id:'a',title:'An exceptionally descriptive title with every meaningful word retained',subtitle:'One two three four five six seven eight nine ten'}, {id:'b',title:'Short title',subtitle:''}];
  let prepares = 0, layouts = 0;
  const engine = createDocumentMeasurements(docs, {
    prepareWithSegments(text,font) { prepares++; return {text,font}; },
    layoutWithLines(prepared,width,lineHeight) {
      layouts++;
      const words = prepared.text.split(' '); const limit = width > 200 ? 5 : 2; const lines=[];
      while(words.length) lines.push({text:words.splice(0,limit).join(' ')});
      return {lines,lineCount:lines.length,height:lines.length*lineHeight};
    },
  });
  const narrow = engine.layout(100); const wide = engine.layout(250);
  assert.equal(prepares,3); assert.equal(layouts,6);
  assert.equal(narrow.get('a').titleLines.join(' '),docs[0].title);
  assert.ok(narrow.get('a').titleHeight>wide.get('a').titleHeight);
  assert.equal(narrow.get('a').summaryLines.length,2); assert.equal(narrow.get('a').summaryTruncated,true);
  assert.equal(wide.get('a').summaryTruncated,false);
});

test('permalinks encode document and passage identities', () => {
  assert.equal(documentRoute('title / x','résultats & x'),'#/read/title%20%2F%20x?passage=r%C3%A9sultats%20%26%20x');
});

test('real corpus index retains every delivered article and does not mistake archive time for publication', () => {
  if (!fs.existsSync(new URL('../dist/data/corpus.json',import.meta.url))) return;
  const actualCorpus=JSON.parse(fs.readFileSync(new URL('../dist/data/corpus.json',import.meta.url),'utf8'));
  const actualManifest=JSON.parse(fs.readFileSync(new URL('../dist/data/library.json',import.meta.url),'utf8'));
  const index=createDocumentIndex(actualManifest,actualCorpus);
  const uniqueIds=new Set(actualCorpus.articles.map(item=>item.id));
  for(const id of uniqueIds) assert.ok(index.byId.has(id));
  for(const doc of index.documents.filter(item=>item.available)) assert.equal(doc.html,actualCorpus.articles.find(item=>item.id===doc.id&&item.lang===doc.lang).html);
  const undated=index.documents.filter(item=>!item.documentDate&&!item.datePublished&&!item.dateModified&&!item.updatedAt&&!item.publishedAt);
  assert.ok(undated.length>0); assert.ok(undated.every(item=>item.date===null));
});
