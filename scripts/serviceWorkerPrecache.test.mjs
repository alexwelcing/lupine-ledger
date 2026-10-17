import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Run the actual worker lifecycle with in-memory cache/network substitutes.
// This tests first-install availability, without a preceding app fetch caching imports.
test('install precaches public module graph dependencies and serves them offline', async () => {
  const origin = 'https://library.lupine.science', handlers = new Map(), entries = new Map(), added = [];
  const key = request => new URL(typeof request === 'string' ? request : request.url, origin).pathname;
  const cache = {
    async add(request) { const path=key(request);added.push(path);entries.set(path,new Response(`module ${path}`)); },
    async match(request) { return entries.get(key(request))?.clone(); },
    async put(request,response) { entries.set(key(request),response); },
  };
  // Browser Request accepts relative URLs; Node's implementation needs the origin.
  class BrowserRequest extends Request { constructor(url,options){super(new URL(url,origin),options);} }
  vm.runInNewContext(fs.readFileSync(new URL('../src/sw.js',import.meta.url),'utf8'), {
    self:{addEventListener:(name,fn)=>handlers.set(name,fn),skipWaiting:async()=>{},clients:{claim:async()=>{}}},
    caches:{open:async()=>cache},location:new URL(origin),Request:BrowserRequest,Response,URL,console,
    fetch:async()=>{throw Error('Offline network must not be needed');},
  });
  let installed;handlers.get('install')({waitUntil:value=>{installed=value;}});await installed;
  for(const module of ['publicSearch.js','publicActivityStore.js','publicResearchView.js','readerPassage.js']){
    assert.equal(added.filter(path=>path===`/${module}`).length,1,`install must fetch ${module} once`);
    let response;handlers.get('fetch')({request:new Request(`${origin}/${module}`),respondWith:value=>{response=value;}});
    const result=await response;assert.equal(result.status,200);assert.equal(await result.text(),`module /${module}`);
  }
});
