import type { IColorExtractor, ColorSample } from './interfaces/IColorExtractor.js';

export class ColorExtractor implements IColorExtractor {
  private readonly context: CanvasRenderingContext2D | null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.context = canvas.getContext('2d', { willReadFrequently: true });
  }

  public getColorAtRatio(ratio: number): ColorSample | null {
    if (!this.context || this.canvas.width === 0 || this.canvas.height === 0) return null;
    const x = Math.round(Math.max(0, Math.min(1, ratio)) * (this.canvas.width - 1));
    const { data } = this.context.getImageData(x, 0, 1, 1);
    return this.sample(x, data);
  }

  public findClosestColor(rgb: readonly number[] | null): ColorSample | null {
    if (!rgb) return this.getColorAtRatio(0);
    if (!this.context || this.canvas.width === 0 || this.canvas.height === 0) return null;

    const { data } = this.context.getImageData(0, 0, this.canvas.width, 1);
    let bestX = 0;
    let bestDistance = Infinity;
    for (let x = 0; x < this.canvas.width; x++) {
      const offset = x * 4;
      const distance = (data[offset] - rgb[0]) ** 2
        + (data[offset + 1] - rgb[1]) ** 2
        + (data[offset + 2] - rgb[2]) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestX = x;
        if (distance === 0) break;
      }
    }
    return this.sample(bestX, data.subarray(bestX * 4, bestX * 4 + 4));
  }

  private sample(x: number, data: Uint8ClampedArray): ColorSample {
    return {
      ratio: this.canvas.width > 1 ? x / (this.canvas.width - 1) : 0,
      color: `rgb(${data[0]},${data[1]},${data[2]})`,
    };
  }
}
