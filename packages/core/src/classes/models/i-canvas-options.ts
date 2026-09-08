export interface ICanvasOptions {
  width: number | string;
  height: number | string;
  kelvinStart?: number;
  kelvinEnd?: number;
  rgbColor?: string;
}

export type ICanvasUpdateOptions = Partial<ICanvasOptions>;

export interface IDomRefs {
  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
  radio: HTMLDivElement;
}
