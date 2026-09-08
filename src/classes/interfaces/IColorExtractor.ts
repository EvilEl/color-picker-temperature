export interface ColorSample {
  /** Position along the gradient, from 0 (first pixel) to 1 (last pixel). */
  ratio: number;
  color: string;
}

export interface IColorExtractor {
  getColorAtRatio(ratio: number): ColorSample | null;
  findClosestColor(rgb: readonly number[] | null): ColorSample | null;
}
