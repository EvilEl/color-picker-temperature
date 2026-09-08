import { DragController, type DragControllerHandlers } from './DragController.js';
import { SelectedColor } from './SelectedColor.js';
import { colorTemperature2rgb } from '../utility/index.js';
import type { IDomRefs } from './models/index.js';
import type { ICanvasRenderer, IColorExtractor, IPositionCalculator, IDragController } from './interfaces/index.js';

export interface ColorPickerOptions {
  domRefs: IDomRefs;
  kelvinStart: number;
  kelvinEnd: number;
  rgbColor: string;
  renderer: ICanvasRenderer;
  colorExtractor: IColorExtractor;
  positionCalculator: IPositionCalculator;
  createDragController?: (target: HTMLDivElement, handlers: DragControllerHandlers) => IDragController;
}

export class ColorPicker {
  private readonly selectedColor: SelectedColor;
  private readonly dragController: IDragController;
  private resizeObserver: ResizeObserver | null = null;
  private disposed = false;
  private kelvinStart: number;
  private kelvinEnd: number;
  private readonly listeners = new Set<(color: string) => void>();

  constructor(private readonly options: ColorPickerOptions) {
    const { domRefs, kelvinStart, rgbColor, positionCalculator, colorExtractor } = options;
    this.kelvinStart = kelvinStart;
    this.kelvinEnd = options.kelvinEnd;
    const initial = colorTemperature2rgb(kelvinStart);
    this.selectedColor = new SelectedColor(domRefs.radio,
      rgbColor || `rgb(${initial.red},${initial.green},${initial.blue})`);
    const createDragController = options.createDragController
      ?? ((target, handlers) => new DragController(target, handlers));
    this.dragController = createDragController(domRefs.container, {
      onMove: event => {
        if (this.disposed) return;
        const previous = this.selectedColor.selected;
        this.selectedColor.moveAt(event, positionCalculator, colorExtractor);
        if (previous !== this.selectedColor.selected) this.emitChange();
      },
    });
    try {
      this.redraw();
      this.dragController.attach();
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(this.redraw);
        this.resizeObserver.observe(domRefs.canvas);
      } else {
        domRefs.canvas.ownerDocument.defaultView?.addEventListener('resize', this.redraw);
      }
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  public redraw = (): void => {
    if (this.disposed) return;
    const { renderer, colorExtractor, positionCalculator } = this.options;
    renderer.draw(this.kelvinStart, this.kelvinEnd);
    this.selectedColor.syncToColor(this.selectedColor.selected, colorExtractor, positionCalculator);
  };

  public getColor(): string {
    return this.selectedColor.selected;
  }

  public setColor(color: string): void {
    if (this.disposed) throw new Error('Color picker has been destroyed');
    this.selectedColor.syncToColor(
      color,
      this.options.colorExtractor,
      this.options.positionCalculator,
    );
  }

  public update(kelvinStart: number, kelvinEnd: number): void {
    if (this.disposed) throw new Error('Color picker has been destroyed');
    this.kelvinStart = kelvinStart;
    this.kelvinEnd = kelvinEnd;
    this.redraw();
  }

  public onChange(listener: (color: string) => void): () => void {
    if (this.disposed) throw new Error('Color picker has been destroyed');
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  public destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.dragController.detach();
    this.selectedColor.destroy();
    this.resizeObserver?.disconnect();
    this.options.domRefs.canvas.ownerDocument.defaultView?.removeEventListener('resize', this.redraw);
    this.listeners.clear();
  }

  private emitChange(): void {
    for (const listener of this.listeners) listener(this.selectedColor.selected);
  }
}
