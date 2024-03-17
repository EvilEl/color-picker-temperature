import { render } from "../components/Native";
import { BuildCanvas } from "./BuildCanvas";
import UniqName from "./UniqName";
import {
  IBuildCanvasOptions,
  ICanvasOptions,
  IControllerEventOptions,
} from "./models";

class ColorTemperature {
  private component?: HTMLDivElement | null;
  private elementInstance?: HTMLDivElement | null;
  constructor() {
    this.component = null;
    this.elementInstance = null;
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

    const hash = UniqName.getUniqName();
    this.component = render({
      width: canvasOptions.width,
      height: canvasOptions.height,
      hash,
    });
    this.elementInstance.appendChild(this.component);
    const newObject = {
      kelvinStart: canvasOptions.kelvinStart,
      kelvinEnd: canvasOptions.kelvinEnd,
      rgbColor: canvasOptions.rgbColor,
      hash: hash,
    } as IBuildCanvasOptions;
    this.buildCanvas(newObject, controllersEventOptions);
    return this;
  };

  public destroyed = (): void => {
    if (!this.elementInstance || !this.component) {
      throw new Error("Не существует");
    }
    this.elementInstance.removeChild(this.component);
    this.component = null;
  };
}

export default new ColorTemperature();
