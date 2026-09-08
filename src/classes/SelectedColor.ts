import { ColorsValues } from '../utility/index.js';
import type { IColorExtractor, ColorSample } from './interfaces/IColorExtractor.js';
import type { IPositionCalculator } from './interfaces/IPositionCalculator.js';

export class SelectedColor {
  public selected: string;
  private animationFrameId: number | null = null;

  constructor(private readonly radio: HTMLDivElement, rgbColor: string) {
    this.selected = rgbColor;
  }

  public moveAt(event: MouseEvent, calculator: IPositionCalculator, extractor: IColorExtractor): void {
    const sample = extractor.getColorAtRatio(calculator.clientXToRatio(event.clientX));
    if (!sample) return;
    this.selected = sample.color;
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = null;
      this.render(sample, calculator);
    });
  }

  public syncToColor(rgb: string, extractor: IColorExtractor, calculator: IPositionCalculator): void {
    const values = rgb ? ColorsValues.getColorsValues(rgb, { handler: 'getRgbValues' }) : null;
    if (rgb && !values) throw new TypeError('rgbColor must be rgb(r, g, b) with integer channels from 0 to 255');
    const sample = extractor.findClosestColor(values?.map(Number) ?? null);
    if (!sample) return;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.selected = sample.color;
    this.render(sample, calculator);
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private render(sample: ColorSample, calculator: IPositionCalculator): void {
    this.radio.style.left = `${calculator.ratioToLeftPercent(sample.ratio)}%`;
    this.radio.style.background = sample.color;
  }
}
