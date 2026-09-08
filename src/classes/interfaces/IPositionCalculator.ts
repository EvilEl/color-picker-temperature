export interface IPositionCalculator {
  /** Convert a viewport coordinate to a normalized position in the gradient. */
  clientXToRatio(clientX: number): number;
  /** Position the marker around the selected point, keeping it inside the canvas. */
  ratioToLeftPercent(ratio: number): number;
}
