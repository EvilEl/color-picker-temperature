import { colorTemperature2rgb } from '../utility/index.js';
import type { ICanvasRenderer } from './interfaces/index.js';

export class CanvasRenderer implements ICanvasRenderer {
  private readonly context: CanvasRenderingContext2D | null;
  private readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { willReadFrequently: true });
    if (!this.context) throw new Error('Canvas 2D context is unavailable');
  }

  public draw(kelvinStart: number, kelvinEnd: number): void {
    if (!this.context) return;

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    const { width, height } = this.canvas;

    for (let w = 0; w < width; w++) {
      const kelvin = ((kelvinEnd - kelvinStart) / Math.max(1, width - 1)) * w + kelvinStart;
      const rgb = colorTemperature2rgb(kelvin);
      this.context.fillStyle = `rgb(${rgb.red},${rgb.green},${rgb.blue})`;
      this.context.fillRect(w, 0, 1, height);
    }
  }
}
