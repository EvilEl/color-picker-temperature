import { colorTemperature2rgb, } from "../utility";
import { Controllers } from "./Controllers";
import { SelectedColor } from './SelectedColor'
import type { IBuildCanvasOptions } from "./models";

export class BuildCanvas {
  public canvas: HTMLCanvasElement;
  public radio: HTMLDivElement;
  public container: HTMLDivElement;
  private kelvinStart: number;
  private kelvinEnd: number;
  private rectCanvas: DOMRect;
  private rgbColor: string;
  private rectRadio: DOMRect;
  private context: CanvasRenderingContext2D | null;
  public controllers: Controllers | null;
  private selectedColor: SelectedColor
  constructor(options: IBuildCanvasOptions) {
    this.container = document.querySelector(
      `.temperature-picker__container-${options.hash}`
    ) as HTMLDivElement;
    this.canvas = document.querySelector(
      `.temperature-picker__canvas-${options.hash}`
    ) as HTMLCanvasElement;
    this.radio = document.querySelector(
      `.temperature-picker__radio-${options.hash}`
    ) as HTMLDivElement;
    this.kelvinStart = options.kelvinStart;
    this.kelvinEnd = options.kelvinEnd;
    this.rgbColor = options.rgbColor ?? "";
    this.rectCanvas = this.canvas.getBoundingClientRect();
    this.rectRadio = this.radio.getBoundingClientRect();
    this.context =
      this.canvas &&
      this.canvas.getContext("2d", {
        willReadFrequently: true,
      });
    this.controllers = null;
    this.selectedColor = new SelectedColor({
      rectRadio: this.rectRadio,
      rectCanvas: this.rectCanvas,
      radio: this.radio,
      canvas: this.canvas,
      context: this.context,
      rgbColor: this.rgbColor
    })
    this.create();
  }





  public create(): void {
    if (!this.context) {
      return;
    }

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    const { width, height } = this.canvas;

    for (let w = 0; w < width; w++) {
      const kelvin =
        ((this.kelvinEnd - this.kelvinStart) / width) * w + this.kelvinStart;
      const rgb = colorTemperature2rgb(kelvin);
      this.context.fillStyle = `rgb(${rgb.red},${rgb.green},${rgb.blue})`;
      this.context.fillRect(w, 0, 1, height);
    }

    this.selectedColor.getSelectedColorIndex(this.rgbColor)
    this.controllers = new Controllers(this.canvas, {
      onPointerMove: (event: MouseEvent) => {
        this.selectedColor.moveAt(event)
      },
      onPointerUp: (event: MouseEvent) => {
        this.selectedColor.moveAt(event)
      },
      onMouseMove: (event: MouseEvent) => {
        this.selectedColor.moveAt(event)
      },
    });
  }
  public getColor() {
    console.log('this.selectedColor.selected', this.selectedColor.selected);

    return this.selectedColor.selected
  }
}
