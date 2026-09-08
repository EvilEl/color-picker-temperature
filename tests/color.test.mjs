import test from 'node:test';
import assert from 'node:assert/strict';
import { ColorExtractor } from '../dist/classes/ColorExtractor.js';
import { PositionCalculator } from '../dist/classes/PositionCalculator.js';
import { SelectedColor } from '../dist/classes/SelectedColor.js';
import { ColorsValues } from '../dist/utility/ColorsValues.js';

function fixture(row, left = 200, width = 300) {
  const rect = { left, width };
  const reads = [];
  const canvas = {
    width: row.length, height: 100,
    getBoundingClientRect: () => rect,
    getContext: () => ({ getImageData(x, y, w, h) {
      reads.push({ x, y, w, h });
      assert.ok(x >= 0 && x + w <= canvas.width);
      assert.ok(w > 0 && h > 0);
      return { data: new Uint8ClampedArray(row.slice(x, x + w).flatMap(rgb => [...rgb, 255])) };
    } }),
  };
  const radio = { style: {}, getBoundingClientRect: () => ({ width: 12 }) };
  return { canvas, radio, rect, reads, extractor: new ColorExtractor(canvas), calculator: new PositionCalculator(canvas, radio) };
}

test('viewport offset does not affect initial pixel position', () => {
  const f = fixture(Array.from({ length: 301 }, (_, x) => [x % 256, Math.floor(x / 256), 0]));
  const selected = new SelectedColor(f.radio, '');
  selected.syncToColor('rgb(150,0,0)', f.extractor, f.calculator);
  assert.equal(f.radio.style.left, '48%');
  assert.equal(selected.selected, 'rgb(150,0,0)');
});

test('repeated colors retain their actual pixel positions', () => {
  const f = fixture([[10, 0, 0], [10, 0, 0], [10, 0, 0], [20, 0, 0], [30, 0, 0]]);
  assert.deepEqual(f.extractor.findClosestColor([20, 0, 0]), { ratio: 0.75, color: 'rgb(20,0,0)' });
});

test('missing RGB selects nearest sample and updates background and value', () => {
  const f = fixture([[10, 0, 0], [20, 0, 0], [30, 0, 0]]);
  const selected = new SelectedColor(f.radio, '');
  selected.syncToColor('rgb(28, 0, 0)', f.extractor, f.calculator);
  assert.equal(selected.selected, 'rgb(30,0,0)');
  assert.equal(f.radio.style.background, selected.selected);
  assert.equal(f.radio.style.left, '96%');
});

test('omitted RGB selects first pixel; malformed and out-of-range RGB are rejected', () => {
  const f = fixture([[10, 20, 30]]);
  const selected = new SelectedColor(f.radio, '');
  selected.syncToColor('', f.extractor, f.calculator);
  assert.equal(selected.selected, 'rgb(10,20,30)');
  for (const rgb of ['rgb(256,0,0)', 'prefix rgb(1,2,3)', 'rgb(1 2,0,0)', '#ffffff']) {
    assert.throws(() => selected.syncToColor(rgb, f.extractor, f.calculator), TypeError);
  }
  assert.deepEqual(ColorsValues.getColorsValues(' RGB( 1, 2, 3 ) ', { handler: 'getRgbValues' }), ['1', '2', '3']);
});

test('both edges and midpoint sample correct pixels, including outside drag', () => {
  const f = fixture([[10, 0, 0], [20, 0, 0], [30, 0, 0]]);
  for (const [clientX, expected] of [[-100, 10], [200, 10], [350, 20], [500, 30], [900, 30]]) {
    assert.equal(f.extractor.getColorAtRatio(f.calculator.clientXToRatio(clientX)).color, `rgb(${expected},0,0)`);
  }
});

test('geometry is read again after layout changes', () => {
  const f = fixture([[10, 0, 0]], 200, 300);
  assert.equal(f.calculator.clientXToRatio(350), 0.5);
  f.rect.left = 100; f.rect.width = 500;
  assert.equal(f.calculator.clientXToRatio(350), 0.5);
  assert.equal(f.calculator.ratioToLeftPercent(0.5), 48.8);
});

test('zero-size canvas does not read pixels or produce invalid positions', () => {
  const f = fixture([], 0, 0);
  assert.equal(f.extractor.getColorAtRatio(0), null);
  assert.equal(f.extractor.findClosestColor([0, 0, 0]), null);
  assert.equal(f.calculator.ratioToLeftPercent(0.5), 0);
  assert.equal(f.calculator.clientXToRatio(10), 0);
  assert.equal(f.reads.length, 0);
});
