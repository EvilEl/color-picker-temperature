// @vitest-environment jsdom
import { createApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

interface MockPicker {
  create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>;
  setColor: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn>;
  listener?: (color: string) => void;
}
const state = vi.hoisted(() => ({ instances: [] as unknown[] }));
vi.mock('color-picker-temperature', () => ({
  ColorTemperature: class {
    color = 'rgb(1,2,3)';
    create = vi.fn(() => this); update = vi.fn(() => this);
    setColor = vi.fn((color: string) => { this.color = color; return this; });
    getColor = vi.fn(() => this.color); destroy = vi.fn();
    listener?: (color: string) => void;
    onChange = vi.fn((listener: (color: string) => void) => { this.listener = listener; return vi.fn(); });
    constructor() { state.instances.push(this); }
  },
}));
import { ColorTemperaturePicker } from './index';

const apps: ReturnType<typeof createApp>[] = [];
afterEach(() => { for (const app of apps.splice(0)) app.unmount(); state.instances.length = 0; });

describe('ColorTemperaturePicker', () => {
  it('implements v-model, reactive updates, and cleanup', async () => {
    const color = ref('rgb(2,3,4)'); const width = ref<number | string>('100%');
    const app = createApp({ render: () => h(ColorTemperaturePicker, {
      modelValue: color.value, 'onUpdate:modelValue': (value: string) => { color.value = value; },
      width: width.value, height: 64,
    }) });
    apps.push(app); app.mount(document.createElement('div'));
    const picker = state.instances[0] as MockPicker;
    expect(picker.create.mock.calls[0][1].rgbColor).toBe('rgb(2,3,4)');
    picker.listener?.('rgb(9,8,7)'); await nextTick();
    expect(color.value).toBe('rgb(9,8,7)');
    width.value = 320; await nextTick();
    expect(picker.update).toHaveBeenLastCalledWith({ width: 320, height: 64, kelvinStart: 1000, kelvinEnd: 40000 });
    color.value = 'rgb(4,5,6)'; await nextTick();
    expect(picker.setColor).toHaveBeenLastCalledWith('rgb(4,5,6)');
    app.unmount(); apps.pop();
    expect(picker.destroy).toHaveBeenCalledOnce();
  });

  it('keeps multiple mounted components independent', () => {
    const app = createApp({ render: () => h('main', [
      h(ColorTemperaturePicker, { width: 100, height: 40 }),
      h(ColorTemperaturePicker, { width: 100, height: 40 }),
    ]) });
    apps.push(app); app.mount(document.createElement('div'));
    expect(state.instances).toHaveLength(2);
  });

  it('renders on the server without constructing the browser core', async () => {
    const app = createApp({ render: () => h(ColorTemperaturePicker, { width: '100%', height: 64 }) });
    expect(await renderToString(app)).toContain('<div');
    expect(state.instances).toHaveLength(0);
  });
});
