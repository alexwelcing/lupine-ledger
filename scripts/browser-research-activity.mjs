#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PORT = 41740;
const ORIGIN = `http://127.0.0.1:${PORT}`;
// Resolve Chrome across platforms/install names instead of one Linux path.
const CHROME_BIN =
  process.env.CHROME_BIN ||
  ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    .find((p) => fs.existsSync(p)) ||
  'google-chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-activity-chrome-'));
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
const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/research-activity.json'), 'utf8'));
try {
  await waitFor(async () => { try { return (await fetch(`${ORIGIN}/health`)).ok; } catch { return false; } }, 'static server');
  const portFile = path.join(profile, 'DevToolsActivePort');
  const port = await waitFor(() => fs.existsSync(portFile) && fs.readFileSync(portFile, 'utf8').split('\n')[0], 'Chrome DevTools');
  const target = await waitFor(async () => (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(p => p.type === 'page'), 'browser target');
  cdp = new Cdp(target.webSocketDebuggerUrl);
  console.log('Browser connected');
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  // Exercise only the reader with a controlled copy of its reviewed release
  // fixture. This does not call or verify the remote production feed.
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__qaFeed = ${JSON.stringify(fixture)};
    window.__qaMode = 'live'; window.__qaRequests = 0; window.__qaErrors = [];
    window.__qaTimers = new Map();
    const originalInterval = window.setInterval.bind(window), originalClear = window.clearInterval.bind(window);
    window.setInterval = (fn, ms, ...args) => { const id = originalInterval(fn, ms, ...args); if (ms === 60000) window.__qaTimers.set(id, fn); return id; };
    window.clearInterval = id => { window.__qaTimers.delete(id); originalClear(id); };
    const originalError = console.error.bind(console);
    console.error = (...args) => { window.__qaErrors.push(args.map(String).join(' ')); originalError(...args); };
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const url = String(args[0]);
      if (url.includes('/research/activity?')) {
        window.__qaRequests++;
        if (window.__qaMode === 'fail') throw new TypeError('Controlled activity network failure');
        if (window.__qaMode === 'pending') return new Promise((resolve, reject) => args[1].signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }));
        const payload = structuredClone(window.__qaFeed);
        if (window.__qaMode === 'stale') payload.items.forEach(item => { item.observedAt = '2026-01-01T00:00:00.000Z'; });
        if (window.__qaMode === 'empty') payload.items = [];
        return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
      }
      return originalFetch(...args);
    };
  ` });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 1024, deviceScaleFactor: 1, mobile: false });
  console.log('Opening local reader');
  await cdp.send('Page.navigate', { url: `${ORIGIN}/#/` });
  await waitFor(() => cdp.evaluate(`document.querySelector('.research-activity-card') && !document.querySelector('.research-activity-refresh').disabled`), 'reviewed activity');
  console.log('Activity loaded');
  assert.equal(await cdp.evaluate('window.__qaTimers.size'), 1);
  assert.equal(await cdp.evaluate(`document.querySelectorAll('.research-activity-card').length`), fixture.items.length);
  await cdp.evaluate(`document.querySelector('.research-activity').scrollIntoView({block:'start'})`);
  assert.ok(await cdp.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), 'desktop horizontal overflow');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(120);
  assert.ok(await cdp.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth'), 'mobile horizontal overflow');
  assert.ok(await cdp.evaluate(`document.querySelector('.research-activity-refresh').getBoundingClientRect().height >= 40`), 'refresh touch target');
  const evidenceDates = await cdp.evaluate(`[...document.querySelectorAll('.research-activity-times time')].map(el=>el.dateTime)`);
  await cdp.evaluate(`window.__qaMode = 'fail'; document.querySelector('.research-activity-refresh').click()`);
  await waitFor(() => cdp.evaluate(`document.querySelector('.research-activity').dataset.freshness === 'unavailable'`), 'unavailable state');
  assert.deepEqual(await cdp.evaluate(`[...document.querySelectorAll('.research-activity-times time')].map(el=>el.dateTime)`), evidenceDates);
  await cdp.evaluate(`Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false }); document.querySelector('.research-activity-refresh').click()`);
  await waitFor(() => cdp.evaluate(`document.querySelector('.research-activity').dataset.freshness === 'offline'`), 'offline state');
  await cdp.evaluate(`Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true }); window.__qaMode='stale'; document.querySelector('.research-activity-refresh').click()`);
  await waitFor(() => cdp.evaluate(`document.querySelector('.research-activity').dataset.freshness === 'stale'`), 'stale evidence state');
  const previousRequests = await cdp.evaluate('window.__qaRequests');
  await cdp.evaluate(`Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); [...window.__qaTimers.values()][0]()`);
  assert.equal(await cdp.evaluate('window.__qaRequests'), previousRequests, 'hidden tab must not poll');
  await cdp.evaluate(`Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange'))`);
  await waitFor(() => cdp.evaluate(`window.__qaRequests > ${previousRequests} && !document.querySelector('.research-activity-refresh').disabled`), 'visibility refresh');
  await cdp.evaluate(`window.__qaMode='empty'; document.querySelector('.research-activity-refresh').click()`);
  await waitFor(() => cdp.evaluate(`document.querySelector('.research-activity-empty')?.textContent.includes('No reviewed public')`), 'empty feed');
  await cdp.evaluate(`window.__qaMode='pending'; document.querySelector('.research-activity-refresh').click(); location.hash='#/tags'`);
  await waitFor(() => cdp.evaluate(`document.documentElement.dataset.view === 'tags' && window.__qaTimers.size === 0`), 'navigation cleanup');
  await cdp.evaluate(`localStorage.clear(); window.__qaMode='fail'; location.hash='#/'`);
  await waitFor(() => cdp.evaluate(`document.querySelector('.research-activity-status')?.textContent.includes('Reviewed snapshot') && document.querySelector('.research-activity-card')`), 'reviewed snapshot fallback');
  assert.equal(await cdp.evaluate(`document.querySelector('.research-activity-status').textContent.includes('Last successful live check')`), false, 'snapshot cannot claim live check');
  assert.deepEqual(await cdp.evaluate('window.__qaErrors'), []);
  console.log(JSON.stringify({ status: 'passed', desktop: '1365x1024', mobile: '390x844', tested: ['live fixture', 'manual refresh', 'failed fetch', 'offline saved evidence', 'stale evidence', 'hidden polling', 'visibility refresh', 'empty feed', 'navigation cleanup', 'snapshot fallback'], screenshots: 'not captured; DOM checks only', productionFeedVerified: false }));
} catch (error) {
  console.error(error);
  if (!cdp) console.error(chromeDiagnostics);
  process.exitCode = 1;
} finally {
  cdp?.close();
  const stopped = [chrome, server].filter(child => child.exitCode === null && child.signalCode === null).map(child => { const done = once(child, 'exit'); child.kill('SIGTERM'); return done; });
  await Promise.allSettled(stopped);
  fs.rmSync(profile, { recursive: true, force: true });
}
