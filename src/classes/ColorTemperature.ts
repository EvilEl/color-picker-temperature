import { render } from "../components/Native";
import { BuildCanvas } from "./BuildCanvas";
import UniqName from "./UniqName";
import { IBuildCanvasOptions, ICanvasOptions } from "./models";

interface buildCanvasOptions
  extends Omit<Required<ICanvasOptions>, "width" | "height"> {
  hash: string;
}

export class ColorTemperature {
  private component?: HTMLDivElement | null;
  private elementInstance?: HTMLDivElement | null;
  public buildCanvas: BuildCanvas;
  color: string;
  constructor() {
    this.component = null;
    this.elementInstance = null;
  }

  private createBuildCanvas = (options: IBuildCanvasOptions): BuildCanvas => {
    return new BuildCanvas(options);
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
    canvasOptions: ICanvasOptions
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
    this.buildCanvas = this.createBuildCanvas(buildCanvasOptions);
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
