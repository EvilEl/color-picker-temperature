import { colorTemperature2rgb, getRgbValues } from "../utility";
import { Controllers } from "./Controllers";
import { IBuildCanvasOptions, IControllerEventOptions } from "./models";

export class BuildCanvas {
  private canvas: HTMLCanvasElement;
  private radio: HTMLDivElement;
  private kelvinStart: number;
  private kelvinEnd: number;
  private _color: string;
  private rectCanvas: DOMRect;
  private rectRadio: DOMRect;
  private context: CanvasRenderingContext2D | null;
  private controllersEventOptions: IControllerEventOptions;

  constructor(
    options: IBuildCanvasOptions,
    controllersEventOptions?: IControllerEventOptions
  ) {
    this.canvas = document.querySelector(
      "#temperature-picker__canvas"
    ) as HTMLCanvasElement;
    this.radio = document.querySelector(
      "#temperature-picker__radio"
    ) as HTMLDivElement;

    this.kelvinStart = options.kelvinStart;
    this.kelvinEnd = options.kelvinEnd;
    this._color = options.rgbColor ?? "";
    this.rectCanvas = this.canvas.getBoundingClientRect();
    this.rectRadio = this.radio.getBoundingClientRect();
    this.context =
      this.canvas &&
      this.canvas.getContext("2d", {
        willReadFrequently: true,
      });
    this.controllersEventOptions = controllersEventOptions ?? {};
    this.create();
  }

  public get color(): string {
    return this._color;
  }

  public set color(value: string) {
    this._color = value;
  }

  private getData(): number[][] {
    if (!this.context) {
      return [];
    }
    const imageData = this.context.getImageData(0, 0, this.canvas.width, 1);
    const formData: number[][] = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      const newArr = [...imageData.data.slice(i, i + 3)] as number[];
      if (!formData.includes(newArr)) {
        formData.push(newArr);
      }
    }
    return formData;
  }

  private getSelectedColorIndex(rgb: string): number {
    if (!rgb) {
      return 0;
    }

    const rgbValues = getRgbValues(rgb);
    if (!rgbValues) {
      return 0;
    }
    const data = this.getData();

    const findIndex = { index: 0 };

    for (let i = 0; i < data.length; i++) {
      if (
        Number(rgbValues[0]) === data[i][0] &&
        Number(rgbValues[1]) === data[i][1] &&
        Number(rgbValues[2]) === data[i][2]
      ) {
        findIndex.index = i;
        break;
      }
    }
    return findIndex.index + this.rectRadio.width + this.rectCanvas.left;
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

    const selectedColorIndex = this.getSelectedColorIndex(this.color);
    const controllers = new Controllers(
      this.canvas,
      this.radio,
      this.context,
      this.controllersEventOptions
    );
    controllers.moveAt({ x: Number(selectedColorIndex) } as MouseEvent);
    this.color = controllers.color;
  }
}
