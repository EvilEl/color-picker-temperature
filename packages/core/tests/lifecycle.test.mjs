import test from 'node:test';
import assert from 'node:assert/strict';
import { SelectedColor } from '../dist/classes/SelectedColor.js';
import { ColorPicker } from '../dist/classes/ColorPicker.js';
import { ColorTemperature } from '../dist/classes/ColorTemperature.js';
import { DragController } from '../dist/classes/DragController.js';

function animationFrames(t) {
  const frames = new Map(); let nextId = 0;
  t.mock.method(globalThis, 'requestAnimationFrame', callback => { frames.set(++nextId, callback); return nextId; });
  t.mock.method(globalThis, 'cancelAnimationFrame', id => { frames.delete(id); });
  return frames;
}
// Browser globals are supplied explicitly; tests in this file run sequentially.
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};
globalThis.ResizeObserver = class { observe() {} disconnect() {} };

test('destroy cancels pending rendering; getColor state updates before the frame', t => {
  const frames = animationFrames(t);
  const radio = { style: {} };
  const selected = new SelectedColor(radio, '');
  selected.moveAt({ clientX: 50 }, { clientXToRatio: () => 0.5, ratioToLeftPercent: () => 48 },
    { getColorAtRatio: () => ({ color: 'rgb(1,2,3)', ratio: 0.5 }) });
  assert.equal(selected.selected, 'rgb(1,2,3)');
  assert.equal(frames.size, 1);
  selected.destroy();
  assert.equal(frames.size, 0);
  assert.deepEqual(radio.style, {});
});

test('redraw resynchronizes selection and destruction disconnects injected controller and observer', t => {
  let observerCallback; let disconnected = 0; let attached = 0; let detached = 0; let draws = 0;
  const originalObserver = globalThis.ResizeObserver;
  t.after(() => { globalThis.ResizeObserver = originalObserver; });
  globalThis.ResizeObserver = class {
    constructor(callback) { observerCallback = callback; }
    observe() {}
    disconnect() { disconnected++; }
  };
  const radio = { style: {} };
  let available = false;
  const picker = new ColorPicker({
    domRefs: { radio, container: {}, canvas: { ownerDocument: { defaultView: new EventTarget() } } },
    kelvinStart: 1000, kelvinEnd: 4000, rgbColor: 'rgb(10,20,30)',
    renderer: { draw() { draws++; } },
    colorExtractor: { findClosestColor: () => available ? { ratio: 0.5, color: 'rgb(11,20,30)' } : null },
    positionCalculator: { ratioToLeftPercent: () => 48 },
    createDragController: () => ({ attach() { attached++; }, detach() { detached++; } }),
  });
  assert.equal(picker.getColor(), 'rgb(10,20,30)');
  available = true; observerCallback();
  assert.equal(picker.getColor(), 'rgb(11,20,30)');
  assert.equal(radio.style.left, '48%');
  assert.equal(draws, 2);
  picker.destroy(); picker.destroy(); observerCallback();
  assert.deepEqual({ attached, detached, disconnected, draws }, { attached: 1, detached: 1, disconnected: 1, draws: 2 });
});

test('core supports subscriptions, programmatic colors, and gradient updates', () => {
  let handlers; let draws = [];
  const radio = { style: {} };
  const picker = new ColorPicker({
    domRefs: { radio, container: {}, canvas: { ownerDocument: { defaultView: new EventTarget() } } },
    kelvinStart: 1000, kelvinEnd: 4000, rgbColor: 'rgb(10,20,30)',
    renderer: { draw(start, end) { draws.push([start, end]); } },
    colorExtractor: {
      findClosestColor: values => ({ ratio: 0.5, color: values ? `rgb(${values.join(',')})` : 'rgb(1,2,3)' }),
      getColorAtRatio: ratio => ({ ratio, color: ratio > 0.5 ? 'rgb(9,8,7)' : 'rgb(1,2,3)' }),
    },
    positionCalculator: { clientXToRatio: x => x / 100, ratioToLeftPercent: ratio => ratio * 100 },
    createDragController: (_target, nextHandlers) => { handlers = nextHandlers; return { attach() {}, detach() {} }; },
  });
  const changes = [];
  const unsubscribe = picker.onChange(color => changes.push(color));
  picker.setColor('rgb(4, 5, 6)');
  assert.equal(picker.getColor(), 'rgb(4,5,6)');
  assert.deepEqual(changes, [], 'programmatic updates must not feed back through onChange');
  handlers.onMove({ clientX: 90 });
  assert.deepEqual(changes, ['rgb(9,8,7)']);
  unsubscribe(); handlers.onMove({ clientX: 10 });
  assert.deepEqual(changes, ['rgb(9,8,7)']);
  picker.update(2000, 5000);
  assert.deepEqual(draws.at(-1), [2000, 5000]);
  picker.destroy();
});

test('public methods keep this when passed as callbacks', () => {
  const picker = new ColorTemperature();
  const destroyed = picker.destroyed;
  assert.throws(destroyed, { message: 'Does not exist' });
  assert.ok(Object.hasOwn(picker, 'create'));
});

function pointer(type, pointerId = 1, extra = {}) {
  const event = new Event(type);
  Object.assign(event, { pointerId, isPrimary: true, button: 0, clientX: 30, ...extra });
  return event;
}

test('drag follows document events, ignores other pointers, cancels, and detaches', () => {
  const doc = new EventTarget(); doc.defaultView = new EventTarget();
  const target = new EventTarget(); target.ownerDocument = doc;
  let captured = null;
  target.setPointerCapture = id => { captured = id; };
  target.hasPointerCapture = id => captured === id;
  target.releasePointerCapture = () => { captured = null; };
  let moves = 0;
  const drag = new DragController(target, { onMove() { moves++; } });
  drag.attach(); drag.attach();
  target.dispatchEvent(pointer('pointerdown', 1, { button: 2 }));
  assert.equal(moves, 0);
  target.dispatchEvent(pointer('pointerdown'));
  doc.dispatchEvent(pointer('pointermove', 2));
  doc.dispatchEvent(pointer('pointermove'));
  assert.equal(moves, 2);
  doc.dispatchEvent(pointer('pointercancel'));
  assert.equal(captured, null);
  doc.dispatchEvent(pointer('pointermove'));
  assert.equal(moves, 2);
  target.dispatchEvent(pointer('pointerdown'));
  doc.defaultView.dispatchEvent(new Event('blur'));
  doc.dispatchEvent(pointer('pointermove'));
  assert.equal(moves, 3);
  target.dispatchEvent(pointer('pointerdown'));
  drag.detach();
  target.dispatchEvent(pointer('pointerdown'));
  doc.dispatchEvent(pointer('pointermove'));
  assert.equal(moves, 4);
  assert.equal(captured, null);
});
