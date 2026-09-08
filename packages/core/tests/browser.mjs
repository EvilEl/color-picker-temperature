import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const astroDist = resolve(root, '../../examples/astro/dist');
const profile = await mkdtemp(join(tmpdir(), 'color-picker-chrome-'));
const chromePath = process.env.CHROME_PATH ?? (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/astro/' || pathname.startsWith('/_astro/')) {
    const path = pathname === '/astro/'
      ? join(astroDist, 'index.html')
      : resolve(astroDist, '.' + pathname);
    if (!path.startsWith(astroDist + sep) && path !== join(astroDist, 'index.html')) {
      response.writeHead(404).end(); return;
    }
    try {
      response.setHeader('Content-Type', path.endsWith('.js') ? 'text/javascript' : 'text/html');
      response.end(await readFile(path));
    } catch { response.writeHead(404).end(); }
    return;
  }
  if (pathname === '/') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><div id="host" style="width:300px;margin-left:200px;margin-top:80px"></div><div id="other" style="width:300px"></div></body></html>');
    return;
  }
  const path = resolve(root, '.' + pathname);
  if (!path.startsWith(join(root, 'dist') + sep) || !path.endsWith('.js')) {
    response.writeHead(404).end(); return;
  }
  try { response.setHeader('Content-Type', 'text/javascript'); response.end(await readFile(path)); }
  catch { response.writeHead(404).end(); }
});
let chrome; let socket; let sequence = 0;
const pending = new Map();
const errors = [];
function send(method, params = {}, sessionId) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

try {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const endpoint = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome did not expose a debugging endpoint')), 15000);
    chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--window-size=1100,800', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    chrome.once('error', error => { clearTimeout(timeout); reject(error); });
    chrome.once('exit', code => { clearTimeout(timeout); reject(new Error(`Chrome exited: ${code}`)); });
    chrome.stderr.on('data', chunk => {
      const match = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
  });
  socket = new WebSocket(endpoint);
  await once(socket, 'open');
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + (message.params.exceptionDetails.exception?.description ?? ''));
    const callback = pending.get(message.id);
    if (!callback) return;
    pending.delete(message.id);
    if (message.error) callback.reject(new Error(JSON.stringify(message.error)));
    else callback.resolve(message.result);
  });
  const { targetId } = await send('Target.createTarget', { url: `http://127.0.0.1:${server.address().port}/` });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const command = (method, params) => send(method, params, sessionId);
  await command('Runtime.enable');
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  };
  const initial = await evaluate(`(async () => {
    while (!document.querySelector('#host')) await new Promise(resolve => setTimeout(resolve, 10));
    const { ColorTemperature, BuildCanvas, Controllers } = await import('/dist/main.js');
    const { Component } = await import('/dist/classes/Component.js');
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const settle = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const host = document.querySelector('#host');
    const baselineStyles = document.querySelectorAll('style').length;
    const options = { width: '100%', height: 100, kelvinStart: 1000, kelvinEnd: 4000 };
    const picker = new ColorTemperature();
    const create = picker.create;
    create('#host', options);
    await settle();
    const canvas = host.querySelector('canvas');
    const radio = host.querySelector('[class*="__radio-"]');
    const colorAt = x => {
      const d = canvas.getContext('2d').getImageData(x, 0, 1, 1).data;
      return 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')';
    };
    const changes = [];
    const unsubscribe = picker.onChange(color => changes.push(color));
    picker.setColor(colorAt(canvas.width - 1));
    check(picker.getColor() === colorAt(canvas.width - 1), 'setColor must update the selected value');
    check(changes.length === 0, 'setColor must not emit a user change');
    picker.setColor(colorAt(0));
    picker.update({ kelvinEnd: 5000 });
    check(canvas.width === 300 && canvas.height === 100, 'Initial canvas dimensions');
    check(picker.getColor() === colorAt(0), 'Default RGB must match first pixel');
    check(host.firstElementChild.getBoundingClientRect().height === 100, 'Wrapper must honor configured height');
    try { picker.create('#absent', options); } catch {}
    check(picker.getColor() === colorAt(0), 'Failed duplicate create must preserve live instance');
    const other = new ColorTemperature();
    let rejected = false;
    try { other.create('#other', { ...options, rgbColor: 'rgb(999,0,0)' }); } catch { rejected = true; }
    check(rejected && !document.querySelector('#other').children.length, 'Invalid RGB must not leave DOM');
    const originalContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = () => null;
    try { other.create('#other', options); } catch {}
    HTMLCanvasElement.prototype.getContext = originalContext;
    check(!document.querySelector('#other').children.length, 'Failed initialization must remove DOM and styles');
    other.create(document.querySelector('#other'), options); other.destroy();
    document.querySelector('#other').style.height = '200px';
    other.create('#other', { ...options, height: '50%' });
    check(document.querySelector('#other canvas').height === 100, 'Percentage height must be applied once');
    other.destroyed();
    document.querySelector('#other').style.height = '';
    window.fixture = { ColorTemperature, BuildCanvas, Controllers, Component, check, settle, host, picker, canvas, radio, colorAt, options, baselineStyles, changes, unsubscribe };
    return { width: canvas.width, initialColor: picker.getColor() };
  })()`);
  console.log('PASS initial dimensions, defaults, bound create, validation, failed initialization:', initial);
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: 350, y: 120, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 800, y: 120, button: 'left', buttons: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 800, y: 120, button: 'left', clickCount: 1 });
  await evaluate(`(async () => { const f = fixture; await f.settle(); f.check(f.picker.getColor() === f.colorAt(f.canvas.width - 1), 'Outside drag must select last pixel'); f.check(parseFloat(f.radio.style.left) > 90, 'Marker must reach right edge'); f.check(f.changes.length > 0, 'Pointer input must notify subscribers'); })()`);
  console.log('PASS mouse drag outside canvas and final edge color');
  await evaluate(`(async () => {
    const f = fixture;
    const before = f.picker.getColor();
    f.host.style.width = '600px'; f.host.style.marginLeft = '100px';
    await f.settle(); await f.settle();
    f.check(f.canvas.width === 600, 'ResizeObserver must resize backing canvas');
    f.check(f.picker.getColor() === before, 'Endpoint RGB must survive resize');
    f.host.style.display = 'none'; await f.settle();
    f.host.style.display = ''; await f.settle(); await f.settle();
    f.check(f.canvas.width === 600 && f.picker.getColor() === before, 'Hide/show must recover');
  })()`);
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: 400, y: 120, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 400, y: 120, button: 'left', clickCount: 1 });
  await evaluate(`(async () => { const f = fixture; await f.settle(); f.check(f.picker.getColor() === f.colorAt(Math.round((f.canvas.width - 1) / 2)), 'Click must use updated geometry'); })()`);
  console.log('PASS resize, layout shift, hide/show, click with updated coordinates');
  await command('Emulation.setTouchEmulationEnabled', { enabled: true });
  await command('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 400, y: 120, id: 1 }] });
  await command('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 40, y: 120, id: 1 }] });
  await command('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await evaluate(`(async () => { const f = fixture; await f.settle(); f.check(f.picker.getColor() === f.colorAt(0), 'Touch drag must select first pixel'); })()`);
  console.log('PASS touch drag outside canvas');
  const cleanup = await evaluate(`(async () => {
    const f = fixture;
    f.picker.destroyed();
    const hidden = document.querySelector('#other'); hidden.style.display = 'none';
    const second = new f.ColorTemperature().create('#other', { ...f.options, rgbColor: 'rgb(255,190,130)' });
    f.check(hidden.querySelector('canvas').width === 0, 'Hidden initialization must have zero backing width');
    hidden.style.display = ''; await f.settle(); await f.settle();
    f.check(hidden.querySelector('canvas').width === 300, 'Hidden initialization must recover on display');
    f.check(second.getColor().startsWith('rgb('), 'Recovered component must have RGB');
    second.destroyed();
    for (let i = 0; i < 5; i++) {
      f.picker.create('#host', f.options);
      const destroy = f.picker.destroyed; destroy();
    }
    f.check(!f.host.children.length, 'Repeated destroy must remove DOM');
    f.check(document.querySelectorAll('style').length === f.baselineStyles, 'Repeated destroy must remove styles');
    const component = f.Component.default({ width: 300, height: 100, hash: 'legacy' });
    f.host.append(component);
    const legacy = new f.BuildCanvas({ hash: 'legacy', kelvinStart: 1000, kelvinEnd: 4000, rgbColor: '' });
    f.check(legacy.controllers instanceof f.Controllers && legacy.getColor().startsWith('rgb('), 'Legacy exports must work');
    legacy.create(); legacy.controllers.removeAllEventListener(); legacy.destroy(); component.remove();
    f.picker.create('#host', f.options);
    second.create('#other', { ...f.options, rgbColor: 'rgb(255,200,140)' });
    const saved = second.getColor(); f.picker.destroyed();
    f.check(second.getColor() === saved, 'Instances must have independent lifetimes');
    second.destroyed(); await f.settle();
    f.check(document.querySelectorAll('style').length === f.baselineStyles, 'All component styles must be removed');
    return { styles: document.querySelectorAll('style').length, components: document.querySelectorAll('.temperature-picker').length };
  })()`);
  assert.deepEqual(errors, []);
  console.log('PASS hidden initialization, repeated lifecycle, legacy adapters, independent instances, cleanup:', cleanup);
  await command('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/astro/` });
  await new Promise(resolve => setTimeout(resolve, 300));
  const astroReady = await evaluate(`(async () => {
    const timeout = Date.now() + 10000;
    while (document.querySelectorAll('[data-color-temperature-picker] canvas').length !== 2) {
      if (Date.now() > timeout) throw new Error('Astro pickers did not initialize');
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    const hosts = [...document.querySelectorAll('[data-color-temperature-picker]')];
    window.astroChanges = 0;
    document.addEventListener('color-temperature-change', () => window.astroChanges++);
    const first = hosts[0].getBoundingClientRect();
    return { x: first.left + first.width / 2, y: first.top + first.height / 2 };
  })()`);
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: astroReady.x, y: astroReady.y, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: astroReady.x, y: astroReady.y, button: 'left', clickCount: 1 });
  const astro = await evaluate(`(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); return { hosts: document.querySelectorAll('[data-color-temperature-picker]').length, canvases: document.querySelectorAll('canvas').length, changes: window.astroChanges }; })()`);
  assert.equal(astro.hosts, 2); assert.equal(astro.canvases, 2); assert.ok(astro.changes > 0);
  console.log('PASS Astro SSR markup, two independent browser instances, and change events:', astro);
  console.log('Browser checks passed without uncaught exceptions.');
} finally {
  for (const callback of pending.values()) callback.reject(new Error('Browser test finished'));
  pending.clear();
  socket?.close();
  if (chrome && chrome.exitCode === null) {
    chrome.kill('SIGTERM');
    await Promise.race([once(chrome, 'exit'), new Promise(resolve => setTimeout(resolve, 3000))]);
    if (chrome.exitCode === null && chrome.signalCode === null) chrome.kill('SIGKILL');
  }
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
