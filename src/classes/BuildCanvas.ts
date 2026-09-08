import { CanvasRenderer } from './CanvasRenderer.js';
import { ColorExtractor } from './ColorExtractor.js';
import { ColorPicker } from './ColorPicker.js';
import { Controllers } from './Controllers.js';
import { PositionCalculator } from './PositionCalculator.js';
import type { IBuildCanvasOptions } from './models/index.js';

/** @deprecated Prefer ColorTemperature, which also owns the component DOM. */
export class BuildCanvas {
  public readonly container: HTMLDivElement;
  public readonly canvas: HTMLCanvasElement;
  public readonly radio: HTMLDivElement;
  public controllers: Controllers | null = null;
  private picker: ColorPicker | null = null;

  constructor(private readonly options: IBuildCanvasOptions) {
    const container = document.querySelector<HTMLDivElement>(`.temperature-picker__container-${options.hash}`);
    const canvas = container?.querySelector<HTMLCanvasElement>(`.temperature-picker__canvas-${options.hash}`);
    const radio = container?.querySelector<HTMLDivElement>(`.temperature-picker__radio-${options.hash}`);
    if (!container || !canvas || !radio) throw new Error('Color picker DOM not found');
    this.container = container;
    this.canvas = canvas;
    this.radio = radio;
    this.create();
  }

  public create(): void {
    if (this.picker) {
      this.picker.redraw();
      return;
    }
    this.picker = new ColorPicker({
      domRefs: { container: this.container, canvas: this.canvas, radio: this.radio },
      kelvinStart: this.options.kelvinStart,
      kelvinEnd: this.options.kelvinEnd,
      rgbColor: this.options.rgbColor ?? '',
      renderer: new CanvasRenderer(this.canvas),
      colorExtractor: new ColorExtractor(this.canvas),
      positionCalculator: new PositionCalculator(this.canvas, this.radio),
      createDragController: (target, handlers) => {
        this.controllers = new Controllers(target, { onPointerMove: event => handlers.onMove(event as PointerEvent) });
        return this.controllers;
      },
    });
  }

  public getColor(): string {
    if (!this.picker) throw new Error('Canvas not initialized');
    return this.picker.getColor();
  }

  public destroy(): void {
    this.picker?.destroy();
    this.picker = null;
    this.controllers = null;
  }
}
