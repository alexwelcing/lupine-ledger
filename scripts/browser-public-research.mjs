#!/usr/bin/env node
import {fixture,digest} from './public-research-fixture.mjs';
import {canonicalEvidence} from '../src/publicResearchEvidence.js';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PORT = 41742;
const ORIGIN = `http://127.0.0.1:${PORT}`;
// Resolve Chrome across platforms/install names instead of one Linux path.
const CHROME_BIN =
  process.env.CHROME_BIN ||
  ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    .find((p) => fs.existsSync(p)) ||
  'google-chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-evidence-chrome-'));
const server = spawn(process.execPath, ['scripts/serve.js'], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const chrome = spawn(CHROME_BIN, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-features=ServiceWorker',
  '--remote-allow-origins=*',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  '--window-size=390,844',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

let chromeDiagnostics = '';
chrome.stderr.on('data', chunk => { chromeDiagnostics = (chromeDiagnostics + chunk).slice(-6000); });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function waitFor(predicate, message, timeout = 10_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const result = await predicate();
    if (result) return result;
    await delay(50);
  }
  throw new Error(`Timed out waiting for ${message}`);
}

class Cdp {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timeout);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const response = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { this.pending.delete(id); reject(new Error('Browser command timed out: ' + method)); }, 12000);
      this.pending.set(id, { resolve, reject, timeout });
    });
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
  }

  close() {
    this.socket.close();
  }
}

let cdp;
try {
  const first=await fixture(),second=await fixture('methods','b');
  const packets=[first,second];
  const archive={schema:'lupine.public_research_activity.archive.v1',records:packets.map(p=>p.record),cursor:{after:0,snapshot:2,nextAfter:null},coverage:{complete:true,returned:2},hashes:await Promise.all(packets.map(async p=>({id:p.record.id,sha256:await digest(JSON.stringify(p.record))})))};
  await waitFor(async()=>{try{return(await fetch(`${ORIGIN}/health`)).ok;}catch{return false;}},'server');
  const portFile=path.join(profile,'DevToolsActivePort');
  const port=await waitFor(()=>fs.existsSync(portFile)&&fs.readFileSync(portFile,'utf8').split('\n')[0],'Chrome');
  const target=await waitFor(async()=>(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(p=>p.type==='page'),'target');
  cdp=new Cdp(target.webSocketDebuggerUrl);await cdp.send('Runtime.enable');await cdp.send('Page.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__publicResearchErrors=[];
    window.addEventListener('error',e=>window.__publicResearchErrors.push(e.message));
    window.addEventListener('unhandledrejection',e=>window.__publicResearchErrors.push(String(e.reason)));
    const packets=${JSON.stringify(packets)}, bodies=${JSON.stringify(packets.map(p=>canonicalEvidence(p.evidence)))}, archive=${JSON.stringify(archive)};
    const old=window.fetch.bind(window);
    window.fetch=async(url,options)=>{
      const u=new URL(String(url),location.href);
      if(!u.pathname.startsWith('/research/'))return old(url,options);
      if(u.pathname==='/research/activity/archive')return new Response(JSON.stringify(archive));
      for(let i=0;i<packets.length;i++){
        if(u.pathname==='/research/activity/'+packets[i].record.id+'/evidence')return new Response(bodies[i]);
        if(u.pathname==='/research/activity/'+packets[i].record.id)return new Response(JSON.stringify({schema:'lupine.public_research_activity_feed.v1',items:[packets[i].record],truncated:false}));
      }
      if(u.pathname==='/research/activity')return new Response(JSON.stringify({schema:'lupine.public_research_activity_feed.v1',items:packets.map(p=>p.record),truncated:false}));
      return new Response('',{status:404});
    };
  `});
  await cdp.send('Page.navigate',{url:`${ORIGIN}/#/activity/${second.record.id}`});
  await waitFor(()=>cdp.evaluate(`document.querySelector('.public-research-evidence')?.textContent.includes('Evidence bytes verified')`),'verified report');
  await waitFor(()=>cdp.evaluate(`document.querySelector('[data-relation="inconclusive"]')`),'verified prior assessment edge');
  const detail=await cdp.evaluate(`({text:document.querySelector('.public-research-evidence').textContent,overflow:document.documentElement.scrollWidth>innerWidth,links:[...document.querySelectorAll('.public-research-evidence a')].map(a=>a.href)})`);
  assert.ok(detail.text.includes(second.evidence.report.summary));assert.ok(detail.text.includes('controller-reported'));assert.ok(detail.text.includes('not externally peer reviewed'));assert.equal(detail.overflow,false);
  assert.ok(detail.links.some(url=>url.includes('/research/activity/')&&url.endsWith('/evidence')));
  await cdp.evaluate(`location.hash='#/graph'`);
  await waitFor(()=>cdp.evaluate(`document.querySelector('.published-research-graph')?.textContent.includes('2 verified reports')`),'published graph layer');
  await waitFor(()=>cdp.evaluate(`!!document.querySelector('.kg-svg')`),'static corpus graph preserved');
  assert.ok(await cdp.evaluate(`document.querySelector('.published-research-graph').textContent.includes('not the complete research archive')`));
  assert.ok(await cdp.evaluate(`!!document.querySelector('.published-research-graph [data-relation="inconclusive"]')`));
  assert.equal(await cdp.evaluate(`document.documentElement.scrollWidth>innerWidth`),false);
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1365,height:1024,deviceScaleFactor:1,mobile:false});
  await delay(100);assert.equal(await cdp.evaluate(`document.documentElement.scrollWidth>innerWidth`),false);
  assert.deepEqual(await cdp.evaluate('window.__publicResearchErrors'),[]);
  console.log(JSON.stringify({status:'passed',fixtureOnly:true,desktop:'1365x1024',mobile:'390x844',verifiedReports:2,priorClaimJoined:true,staticGraphPreserved:true,partialCoverageVisible:true,consoleErrors:0,productionVerified:false}));
} catch(error) { console.error(error); if(!cdp)console.error(chromeDiagnostics); process.exitCode=1; }
finally {cdp?.close();const stopped=[chrome,server].filter(p=>p.exitCode===null&&p.signalCode===null).map(p=>{const done=once(p,'exit');p.kill('SIGTERM');return done;});await Promise.allSettled(stopped);await delay(500);await fs.promises.rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:250});}
