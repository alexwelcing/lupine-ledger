import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { MODEL } from './client.mjs';
import { lexicalScore, lexicalSearch, buildRequest, resolveRanking, search } from './search.mjs';
const articles=[{id:'refuted-claim',title:'D-band correlation',subtitle:'The original explanation was refuted.',tags:['refuted'],status:'refuted'},{id:'other',title:'Other article',subtitle:'Another topic',tags:[],status:'open'}];
const makeResponse=(choice,confidence=1)=>({model:MODEL,answers:{article:{type:'choice',choice,confidence,probabilities:Object.fromEntries(Object.keys(buildRequest('query',articles).questions.article.criteria).map(key=>[key,key===choice?1:0]))}}});
test('keyword baseline matches the actual app scorer on the real catalog',()=>{
  const source=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
  const start=source.indexOf('function scoreMatch(a, q) {'),end=source.indexOf('\n}',start)+2;
  const actual=vm.runInNewContext(`(${source.slice(start,end)})`);
  const entries=JSON.parse(readFileSync(new URL('../../dist/data/search-index.json',import.meta.url))).articles;
  for(const article of entries)for(const query of ['d-band','what did the campaign cost','', 'formal proof'])assert.equal(lexicalScore(article,query),actual(article,query));
});
test('ranking preserves catalog identity and scientific status',()=>{
  const request=buildRequest('which claim was refuted?',articles),result=resolveRanking(makeResponse('refuted-claim'),request,articles);
  assert.equal(result.results[0].article,articles[0]);assert.equal(result.results[0].article.status,'refuted');
});
test('unknown IDs, no match, low confidence, invalid scores and duplicate catalog IDs fail closed',()=>{
  const request=buildRequest('query',articles);
  for(const r of [makeResponse('fake-id'),makeResponse('no_match'),makeResponse('refuted-claim',0.1)])assert.equal(resolveRanking(r,request,articles).accepted,false);
  const invalid=makeResponse('refuted-claim');invalid.answers.article.probabilities.other=NaN;assert.equal(resolveRanking(invalid,request,articles).accepted,false);
  assert.throws(()=>buildRequest('query',[articles[0],articles[0]]));
  assert.throws(()=>buildRequest('query',Array(101).fill(articles[0])));
});
test('provider failures preserve available keyword results',async()=>{
  const result=await search('d-band',articles,async()=>({source:'fallback',reason:'timeout'}));
  assert.equal(result.accepted,false);assert.equal(result.baseline[0].article.id,'refuted-claim');
});
test('empty, oversized and nonstring queries fail before inference',async()=>{
  for(const query of ['',null,'x'.repeat(601)])await assert.rejects(()=>search(query,articles,()=>{throw new Error('should not call');}));
});
