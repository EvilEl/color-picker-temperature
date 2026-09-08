import { Component } from './Component.js';
import { ComponentFactory } from './ComponentFactory.js';
import { ColorPicker } from './ColorPicker.js';
import { CanvasRenderer } from './CanvasRenderer.js';
import { ColorExtractor } from './ColorExtractor.js';
import { PositionCalculator } from './PositionCalculator.js';
import { ColorsValues } from '../utility/index.js';
import UniqName from './UniqName.js';
import type { ICanvasOptions } from './models/index.js';

export class ColorTemperature {
  private component: HTMLDivElement | null = null;
  private elementInstance: HTMLDivElement | null = null;
  private colorPicker: ColorPicker | null = null;

  public create = (instance: string, canvasOptions: ICanvasOptions): this => {
    if (this.component) throw new Error('The component has already been added');
    this.elementInstance = document.querySelector(instance);
    if (!this.elementInstance) {
      throw new Error('No matches found with selector');
    }

    const hash = UniqName.getUniqName();
    const kelvinStart = canvasOptions.kelvinStart ?? 1000;
    const kelvinEnd = canvasOptions.kelvinEnd ?? 4000;
    const rgbColor = canvasOptions.rgbColor ?? '';
    if (rgbColor && !ColorsValues.getColorsValues(rgbColor, { handler: 'getRgbValues' })) {
      throw new TypeError('rgbColor must be rgb(r, g, b) with integer channels from 0 to 255');
    }
    if (!Number.isFinite(kelvinStart) || !Number.isFinite(kelvinEnd)
      || kelvinStart < 1000 || kelvinEnd > 40000 || kelvinStart > kelvinEnd) {
      throw new RangeError('Expected 1000 <= kelvinStart <= kelvinEnd <= 40000');
    }
    for (const size of [canvasOptions.width, canvasOptions.height]) {
      if ((typeof size === 'number' && (!Number.isFinite(size) || size < 0))
        || (typeof size !== 'number' && (typeof size !== 'string' || !size.trim()))) {
        throw new TypeError('width and height must be non-negative numbers or CSS lengths');
      }
    }

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

  /** @deprecated Use destroyed() to release both DOM and resources. */
  public deleteLink = (): void => { this.destroyed(); };

  public destroyed = (): void => {
    if (!this.elementInstance || !this.component) {
      throw new Error('Does not exist');
    }
    this.colorPicker?.destroy();
    this.component.remove();
    this.component = null;
    this.elementInstance = null;
    this.colorPicker = null;
  };
}
