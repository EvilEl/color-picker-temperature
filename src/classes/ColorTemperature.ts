import { render } from "../components/Native";
import { BuildCanvas } from "./BuildCanvas";
import { ICanvasOptions, IControllerEventOptions } from "./models";

export class ColorTemperature<T> {
  instance: string;
  component: HTMLDivElement;
  canvasRender: BuildCanvas | null;
  rgbColor: string;
  canvasOptions: ICanvasOptions<T>;
  controllersEventOptions: IControllerEventOptions;
  constructor(
    instance: string,
    canvasOptions: ICanvasOptions<T>,
    controllersEventOptions?: IControllerEventOptions
  ) {
    this.instance = instance;
    this.canvasOptions = canvasOptions;
    this.controllersEventOptions = controllersEventOptions ?? {};
    this.rgbColor = canvasOptions.rgbColor ?? "";
    this.component = render(
      this.canvasOptions.width,
      this.canvasOptions.height
    );
    this.canvasRender = null;
  }

  public create(): void {
    const elementInstance = document.querySelector(this.instance);
    if (!elementInstance) {
      return;
    }
    elementInstance.appendChild(this.component);
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
    const radio = document.querySelector("#radio") as HTMLDivElement;
    this.canvasRender = new BuildCanvas(
      {
        kelvinStart: this.canvasOptions.kelvinStart ?? 1000,
        kelvinEnd: this.canvasOptions.kelvinEnd ?? 40000,
        canvas,
        radio,
        color: this.rgbColor,
      },
      this.controllersEventOptions
    );
    this.canvasRender.create();
  }

  public destroyed(): void {
    const elementInstance = document.querySelector(this.instance);
    if (!elementInstance) {
      return;
    }
    elementInstance.removeChild(this.component);
  }
  get color(): string {
    if (!this.canvasRender) {
      return "";
    }
    return this.canvasRender.color;
  }
}
