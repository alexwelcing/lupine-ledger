#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const PORT = 41739;
const ORIGIN = `http://127.0.0.1:${PORT}`;
// Resolve Chrome across platforms/install names instead of one Linux path.
const CHROME_BIN =
  process.env.CHROME_BIN ||
  ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    .find((p) => fs.existsSync(p)) ||
  'google-chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lupine-graph-chrome-'));
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
  `${ORIGIN}/#/`,
], { stdio: ['ignore', 'ignore', 'pipe'] });

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
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const response = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
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
  await waitFor(async () => {
    try {
      const response = await fetch(`${ORIGIN}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }, 'static server');

  const debugPortFile = path.join(profile, 'DevToolsActivePort');
  const port = await waitFor(
    () => fs.existsSync(debugPortFile) && fs.readFileSync(debugPortFile, 'utf8').split('\n')[0],
    'Chrome DevTools port',
  );
  const targets = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    const pages = await response.json();
    return pages.find(page => page.type === 'page' && page.url.startsWith(ORIGIN));
  }, 'browser page');

  cdp = new Cdp(targets.webSocketDebuggerUrl);
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await waitFor(
    () => cdp.evaluate(`location.origin === ${JSON.stringify(ORIGIN)} && document.readyState === 'complete'`),
    'initial browser navigation',
  );
  await cdp.evaluate(`localStorage.setItem('ll.lang', 'zh'); location.hash = '#/graph?mode=ontology'`);
  await waitFor(() => cdp.evaluate(`document.querySelector('.kg h1')?.textContent === '知识图谱'`), 'Chinese graph view');

  const chromeState = await cdp.evaluate(`(() => ({
    title: document.querySelector('.kg h1')?.textContent,
    ontology: [...document.querySelectorAll('.kg-mode')].find(el => el.classList.contains('active'))?.textContent,
    placeholder: document.querySelector('.kg-search input')?.placeholder,
    selected: document.querySelector('.kg-inspector-kicker')?.textContent,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    modeHeights: [...document.querySelectorAll('.kg-mode')].map(el => el.getBoundingClientRect().height),
    relationHeights: [...document.querySelectorAll('.kg-relation-chip')].map(el => el.getBoundingClientRect().height),
    hitStroke: getComputedStyle(document.querySelector('.kg-node-hit')).strokeWidth,
  }))()`);
  assert.deepEqual(chromeState.title, '知识图谱');
  assert.deepEqual(chromeState.ontology, '本体');
  assert.match(chromeState.placeholder, /聚焦/);
  assert.deepEqual(chromeState.selected, '已选择');
  assert.ok(chromeState.overflow <= 0, `mobile page overflows by ${chromeState.overflow}px`);
  assert.ok(chromeState.modeHeights.every(height => height >= 44), `mode heights: ${chromeState.modeHeights}`);
  assert.ok(chromeState.relationHeights.every(height => height >= 44), `relation heights: ${chromeState.relationHeights}`);
  assert.deepEqual(chromeState.hitStroke, '44px');

  const before = await cdp.evaluate(`({ hash: location.hash, length: history.length })`);
  const target = await cdp.evaluate(`(async () => {
    const canvas = document.querySelector('.kg-canvas');
    window.scrollTo(0, canvas.getBoundingClientRect().top + scrollY + 120);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const node = [...document.querySelectorAll('.kg-node.ontology')].find(el => {
      const rect = el.querySelector('.kg-node-dot').getBoundingClientRect();
      const centerY = rect.y + rect.height / 2;
      return centerY > 30 && centerY < innerHeight - 30;
    });
    const dot = node?.querySelector('.kg-node-dot')?.getBoundingClientRect();
    if (!dot) return null;
    const centerX = dot.x + dot.width / 2;
    const centerY = dot.y + dot.height / 2;
    const x = centerX + 15;
    const y = centerY;
    return {
      x,
      y,
      centerX,
      centerY,
      hitNode: document.elementFromPoint(x, y)?.closest('.kg-node')?.getAttribute('aria-label') || '',
    };
  })()`);
  assert.ok(target, 'expected a selectable ontology node');
  assert.ok(target.hitNode, `expanded node target missed at (${target.x}, ${target.y})`);
  await cdp.evaluate(`
    [...document.querySelectorAll('.kg-node.ontology')]
      .find(el => el.getAttribute('aria-label') === ${JSON.stringify(target.hitNode)})
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  `);
  await waitFor(() => cdp.evaluate(`location.hash !== ${JSON.stringify(before.hash)}`), 'focused graph URL');
  const focused = await cdp.evaluate(`({ hash: location.hash, length: history.length })`);
  assert.equal(focused.length, before.length + 1, 'node selection should push history');
  assert.equal(await cdp.evaluate(`document.querySelector('.kg-readiness dt')?.textContent`), '就绪度');
  const relationKinds = await cdp.evaluate(`
    [...document.querySelectorAll('.kg-relation-kind')].map(el => el.textContent)
  `);
  assert.ok(relationKinds.includes('属于'), `localized relation kinds: ${relationKinds}`);
  assert.ok(relationKinds.includes('标记为'), `localized relation kinds: ${relationKinds}`);
  assert.ok(
    relationKinds.every(kind => !['chain.gatedBy', 'isA', 'markedAs'].includes(kind)),
    `raw relation kinds remain: ${relationKinds}`,
  );

  await cdp.evaluate('history.back()');
  await waitFor(() => cdp.evaluate(`location.hash === ${JSON.stringify(before.hash)}`), 'restored graph URL');
  await waitFor(
    () => cdp.evaluate(`document.querySelector('.kg-mode.active')?.textContent === '本体'`),
    'restored ontology mode',
  );

  console.log('[ok] graph browser history, zh chrome, and 390px touch checks passed.');
} finally {
  cdp?.close();
  chrome.kill('SIGTERM');
  server.kill('SIGTERM');
  await Promise.race([once(chrome, 'exit'), delay(2_000)]);
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  } catch {
    // Chrome helpers can briefly retain profile files after the browser exits.
  }
}
