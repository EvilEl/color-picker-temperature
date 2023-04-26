import { render } from "../components/Native";
import { BuildCanvas } from "./BuildCanvas";
import {
  IBuildCanvasOptions,
  ICanvasOptions,
  IControllerEventOptions,
} from "./models";

class ColorTemperature {
  private component?: HTMLDivElement | null;
  private elementInstance?: HTMLDivElement | null;
  constructor() {
    this.component = undefined;
    this.elementInstance = undefined;
  }

  private buildCanvas = (
    options: IBuildCanvasOptions,
    controllersEventOptions?: IControllerEventOptions
  ): BuildCanvas => {
    return new BuildCanvas(options, controllersEventOptions);
  };

  public create = <T>(
    instance: string,
    canvasOptions: ICanvasOptions<T>,
    controllersEventOptions?: IControllerEventOptions
  ): ColorTemperature => {
    this.elementInstance = document.querySelector(instance);
    if (!this.elementInstance) {
      throw new Error("Инстанс требуется добавить");
    }

    this.component = render(canvasOptions.width, canvasOptions.height);
    this.elementInstance.appendChild(this.component);
    const newObject = {
      kelvinStart: canvasOptions.kelvinStart,
      kelvinEnd: canvasOptions.kelvinEnd,
      rgbColor: canvasOptions.rgbColor,
    } as IBuildCanvasOptions;
    this.buildCanvas(newObject, controllersEventOptions);
    return this;
  };

  public destroyed = (): void => {
    if (!this.elementInstance || !this.component) {
      throw new Error("Не существует");
    }
    this.elementInstance.removeChild(this.component);
    this.component = undefined;
  };
}

export default new ColorTemperature();
