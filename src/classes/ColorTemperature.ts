import { render } from "../components/Native";
import { BuildCanvas } from "./BuildCanvas";
import UniqName from "./UniqName";
import {
  IBuildCanvasOptions,
  ICanvasOptions,
  IControllerEventOptions,
} from "./models";

interface buildCanvasOptions
  extends Omit<Required<ICanvasOptions>, "width" | "height"> {
  hash: string;
}

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

  private getBuildCanvasOptions(
    canvasOptions: buildCanvasOptions
  ): IBuildCanvasOptions {
    return {
      kelvinStart: canvasOptions?.kelvinStart ?? 1000,
      kelvinEnd: canvasOptions?.kelvinEnd ?? 4000,
      rgbColor: canvasOptions?.rgbColor ?? "red",
      hash: canvasOptions?.hash ?? "1",
    };
  }

  public create = (
    instance: string,
    canvasOptions: ICanvasOptions,
    controllersEventOptions?: IControllerEventOptions
  ): ColorTemperature => {
    this.elementInstance = document.querySelector(instance);
    if (!this.elementInstance) {
      throw new Error("Инстанс требуется добавить");
    }

    const hash = UniqName.getUniqName();

    const buildCanvasOptions = this.getBuildCanvasOptions({
      kelvinStart: canvasOptions.kelvinStart,
      kelvinEnd: canvasOptions.kelvinEnd,
      rgbColor: canvasOptions.rgbColor,
      hash,
    });

    this.component = render({
      width: canvasOptions.width,
      height: canvasOptions.height,
      hash,
    });

    this.elementInstance.appendChild(this.component);

    this.buildCanvas(buildCanvasOptions, controllersEventOptions);

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
