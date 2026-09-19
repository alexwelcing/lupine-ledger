import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createClient, MODEL } from './client.mjs';
import { buildRequest,resolveRanking,lexicalSearch } from './search.mjs';

const cases=JSON.parse(await readFile(new URL('./cases.json',import.meta.url),'utf8'));
const indexText=await readFile(new URL('../../dist/data/search-index.json',import.meta.url),'utf8');
const {articles}=JSON.parse(indexText),replay=process.argv.includes('--replay');
if(!replay&&!process.env.TYPESAFE_API_KEY)throw new Error('Set TYPESAFE_API_KEY or use --replay.');
const evaluate=createClient({apiKey:process.env.TYPESAFE_API_KEY,timeoutMs:15000,cacheTtlMs:0});
const recorded=replay?JSON.parse(await readFile(new URL('./results/2026-09-19.json',import.meta.url),'utf8')):null;
const catalogSha256=createHash('sha256').update(indexText).digest('hex');
if(replay&&recorded.catalogSha256!==catalogSha256)throw new Error('Catalog changed; run a fresh benchmark instead of replaying old decisions.');
const results=[];
for(const item of cases){
  const request=buildRequest(item.query,articles),result=replay?recorded.runs.flatMap(run=>run.results).find(row=>row.id===item.id):await evaluate(request);
  if(!result)throw new Error(`Missing receipt ${item.id}`);
  const ranking=resolveRanking(result.response,request,articles),baseline=lexicalSearch(articles,item.query)[0]?.article.id??null;
  const raw=result.response?.answers?.article?.choice??null,applied=ranking.accepted?ranking.results[0].article.id:'no_match';
  const row={id:item.id,query:item.query,expected:item.expected,requestSha256:createHash('sha256').update(JSON.stringify(request)).digest('hex'),...result,baseline,raw,applied,accepted:ranking.accepted,rawCorrect:item.expected.includes(raw),policyCorrect:item.expected.includes(applied)};
  results.push(row);console.log(JSON.stringify({id:row.id,baseline,raw,applied,ms:row.elapsedMs,rawCorrect:row.rawCorrect,policyCorrect:row.policyCorrect}));
}
const positives=results.filter(row=>!row.expected.includes('no_match'));
console.log(JSON.stringify({replay,model:MODEL,cases:results.length,naturalQueries:positives.length,keywordTop1:positives.filter(row=>row.expected.includes(row.baseline)).length,jevTop1:positives.filter(row=>row.rawCorrect).length,policyCorrect:results.filter(row=>row.policyCorrect).length}));
if(!replay)await writeFile(new URL('./results/latest.json',import.meta.url),JSON.stringify({recordedAt:new Date().toISOString(),model:MODEL,catalogSha256,results},null,2)+'\n');
