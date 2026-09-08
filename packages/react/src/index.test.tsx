// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

interface MockPicker {
  color: string;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>;
  getColor: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  listener?: (color: string) => void;
}
const state = vi.hoisted(() => ({ instances: [] as unknown[] }));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
vi.mock('color-picker-temperature', () => ({
  ColorTemperature: class {
    color = 'rgb(1,2,3)';
    create = vi.fn(() => this);
    update = vi.fn(() => this);
    setColor = vi.fn((color: string) => { this.color = color; return this; });
    getColor = vi.fn(() => this.color);
    destroy = vi.fn();
    listener?: (color: string) => void;
    onChange = vi.fn((listener: (color: string) => void) => { this.listener = listener; return vi.fn(); });
    constructor() { state.instances.push(this); }
  },
}));
import { ColorTemperaturePicker, type ColorTemperaturePickerHandle } from './index';

const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  state.instances.length = 0;
});

describe('ColorTemperaturePicker', () => {
  it('mounts from a DOM ref, updates props, forwards changes, and cleans up', async () => {
    const container = document.createElement('div');
    const root = createRoot(container); roots.push(root);
    const onChange = vi.fn();
    await act(async () => root.render(<ColorTemperaturePicker width="100%" height={64} value="rgb(2,3,4)" onChange={onChange} />));
    const picker = state.instances[0] as MockPicker;
    expect(picker.create.mock.calls[0][0]).toBe(container.firstElementChild);
    picker.listener?.('rgb(9,8,7)');
    expect(onChange).toHaveBeenCalledWith('rgb(9,8,7)');
    expect(picker.setColor).toHaveBeenLastCalledWith('rgb(2,3,4)');
    await act(async () => root.render(<ColorTemperaturePicker width={320} height={80} value="rgb(4,5,6)" onChange={onChange} />));
    expect(picker.update).toHaveBeenLastCalledWith({ width: 320, height: 80, kelvinStart: 1000, kelvinEnd: 40000 });
    expect(picker.setColor).toHaveBeenLastCalledWith('rgb(4,5,6)');
    await act(async () => root.unmount()); roots.pop();
    expect(picker.destroy).toHaveBeenCalledOnce();
  });

  it('supports defaultValue, an imperative ref, and independent instances', async () => {
    const first = document.createElement('div'); const second = document.createElement('div');
    const firstRoot = createRoot(first); const secondRoot = createRoot(second); roots.push(firstRoot, secondRoot);
    const handle = { current: null as ColorTemperaturePickerHandle | null };
    await act(async () => {
      firstRoot.render(<ColorTemperaturePicker ref={handle} width={200} height={40} defaultValue="rgb(8,8,8)" />);
      secondRoot.render(<ColorTemperaturePicker width={200} height={40} />);
    });
    expect(state.instances).toHaveLength(2);
    expect((state.instances[0] as MockPicker).create.mock.calls[0][1].rgbColor).toBe('rgb(8,8,8)');
    handle.current?.setColor('rgb(7,7,7)');
    expect(handle.current?.getColor()).toBe('rgb(7,7,7)');
  });

  it('renders on the server without constructing the browser core', () => {
    expect(renderToString(<ColorTemperaturePicker width="100%" height={64} />)).toContain('<div');
    expect(state.instances).toHaveLength(0);
  });
});
