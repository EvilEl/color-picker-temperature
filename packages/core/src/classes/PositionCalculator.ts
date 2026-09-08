import type { IPositionCalculator } from './interfaces/index.js';

export class PositionCalculator implements IPositionCalculator {
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly radio: HTMLDivElement
  ) {}

  public clientXToRatio(clientX: number): number {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  public ratioToLeftPercent(ratio: number): number {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const radioRatio = this.radio.getBoundingClientRect().width / rect.width;
    const left = Math.max(0, Math.min(Math.max(0, 1 - radioRatio), ratio - radioRatio / 2));
    return left * 100;
  }
}
