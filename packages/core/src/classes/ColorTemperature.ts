import { Component } from './Component.js';
import { ComponentFactory } from './ComponentFactory.js';
import { ColorPicker } from './ColorPicker.js';
import { CanvasRenderer } from './CanvasRenderer.js';
import { ColorExtractor } from './ColorExtractor.js';
import { PositionCalculator } from './PositionCalculator.js';
import { ColorsValues } from '../utility/index.js';
import UniqName from './UniqName.js';
import type { ICanvasOptions, ICanvasUpdateOptions } from './models/index.js';

export type ColorChangeListener = (color: string) => void;

export class ColorTemperature {
  private component: HTMLDivElement | null = null;
  private elementInstance: HTMLElement | null = null;
  private colorPicker: ColorPicker | null = null;
  private options: ICanvasOptions | null = null;

  public create = (instance: string | HTMLElement, canvasOptions: ICanvasOptions): this => {
    if (this.component) throw new Error('The component has already been added');
    this.validateOptions(canvasOptions);
    this.elementInstance = typeof instance === 'string'
      ? document.querySelector<HTMLElement>(instance)
      : instance;
    if (!this.elementInstance) {
      throw new Error('No matches found with selector');
    }

    const hash = UniqName.getUniqName();
    const kelvinStart = canvasOptions.kelvinStart ?? 1000;
    const kelvinEnd = canvasOptions.kelvinEnd ?? 4000;
    const rgbColor = canvasOptions.rgbColor ?? '';

    this.component = ComponentFactory.create({
      width: canvasOptions.width,
      height: canvasOptions.height,
      hash,
      handler: Component.default,
    });

    this.elementInstance.appendChild(this.component);

    // DOM queries happen only here, after the component is in the DOM
    const container = this.component.querySelector(
      `.temperature-picker__container-${hash}`
    ) as HTMLDivElement;
    const canvas = this.component.querySelector(
      `.temperature-picker__canvas-${hash}`
    ) as HTMLCanvasElement;
    const radio = this.component.querySelector(
      `.temperature-picker__radio-${hash}`
    ) as HTMLDivElement;

    try {
      this.colorPicker = new ColorPicker({
        domRefs: { container, canvas, radio },
        kelvinStart,
        kelvinEnd,
        rgbColor,
        renderer: new CanvasRenderer(canvas),
        colorExtractor: new ColorExtractor(canvas),
        positionCalculator: new PositionCalculator(canvas, radio),
      });
      this.options = { ...canvasOptions, kelvinStart, kelvinEnd, rgbColor };
    } catch (error) {
      this.component.remove();
      this.component = null;
      this.elementInstance = null;
      throw error;
    }

    return this;
  };

  public getColor(): string {
    if (!this.colorPicker) {
      throw new Error('Component not initialized. Call create() first.');
    }
    return this.colorPicker.getColor();
  }

  public setColor(color: string): this {
    this.requirePicker().setColor(color);
    if (this.options) this.options.rgbColor = color;
    return this;
  }

  public onChange(listener: ColorChangeListener): () => void {
    return this.requirePicker().onChange(listener);
  }

  public update(nextOptions: ICanvasUpdateOptions): this {
    const picker = this.requirePicker();
    if (!this.options || !this.component) throw new Error('Component not initialized. Call create() first.');
    const merged = { ...this.options, ...nextOptions };
    this.validateOptions(merged);
    const wrapper = this.component;
    const inner = wrapper.firstElementChild as HTMLDivElement | null;
    if ('height' in nextOptions) wrapper.style.height = this.formatSize(merged.height);
    if ('width' in nextOptions && inner) inner.style.width = this.formatSize(merged.width);
    picker.update(merged.kelvinStart ?? 1000, merged.kelvinEnd ?? 4000);
    if (nextOptions.rgbColor !== undefined) picker.setColor(nextOptions.rgbColor);
    this.options = merged;
    return this;
  }

  public destroy = (): void => {
    if (!this.elementInstance || !this.component) throw new Error('Does not exist');
    this.colorPicker?.destroy();
    this.component.remove();
    this.component = null;
    this.elementInstance = null;
    this.colorPicker = null;
    this.options = null;
  };

  /** @deprecated Use destroy() to release both DOM and resources. */
  public deleteLink = (): void => { this.destroy(); };

  /** @deprecated Use destroy(). */
  public destroyed = (): void => {
    this.destroy();
  };

  private requirePicker(): ColorPicker {
    if (!this.colorPicker) throw new Error('Component not initialized. Call create() first.');
    return this.colorPicker;
  }

  private formatSize(size: number | string): string {
    return typeof size === 'number' ? `${size}px` : size;
  }

  private validateOptions(options: ICanvasOptions): void {
    const kelvinStart = options.kelvinStart ?? 1000;
    const kelvinEnd = options.kelvinEnd ?? 4000;
    const rgbColor = options.rgbColor ?? '';
    if (rgbColor && !ColorsValues.getColorsValues(rgbColor, { handler: 'getRgbValues' })) {
      throw new TypeError('rgbColor must be rgb(r, g, b) with integer channels from 0 to 255');
    }
    if (!Number.isFinite(kelvinStart) || !Number.isFinite(kelvinEnd)
      || kelvinStart < 1000 || kelvinEnd > 40000 || kelvinStart > kelvinEnd) {
      throw new RangeError('Expected 1000 <= kelvinStart <= kelvinEnd <= 40000');
    }
    for (const size of [options.width, options.height]) {
      if ((typeof size === 'number' && (!Number.isFinite(size) || size < 0))
        || (typeof size !== 'number' && (typeof size !== 'string' || !size.trim()))) {
        throw new TypeError('width and height must be non-negative numbers or CSS lengths');
      }
    }
  }
}
