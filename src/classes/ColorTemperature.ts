import { CreateHtmlElement } from "./CreateHtmlElement";
import { BuildCanvas } from "./BuildCanvas";
import UniqName from "./UniqName";
import type { IBuildCanvasOptions, ICanvasOptions } from "./models";

interface buildCanvasOptions
  extends Omit<Required<ICanvasOptions>, "width" | "height"> {
  hash: string;
}

export class ColorTemperature {
  private component?: HTMLDivElement | null;
  private elementInstance?: HTMLDivElement | null;
  private buildCanvas: BuildCanvas | null;
  constructor() {
    this.component = null;
    this.elementInstance = null;
    this.buildCanvas = null;
  }

  private createBuildCanvas = (options: IBuildCanvasOptions): BuildCanvas => {
    return new BuildCanvas(options);
  };

  private getBuildCanvasOptions(
    canvasOptions: buildCanvasOptions
  ): IBuildCanvasOptions {
    return {
      kelvinStart: canvasOptions?.kelvinStart,
      kelvinEnd: canvasOptions?.kelvinEnd,
      rgbColor: canvasOptions?.rgbColor,
      hash: canvasOptions?.hash ?? "1",
    };
  }

  public create = (
    instance: string,
    canvasOptions: ICanvasOptions
  ): ColorTemperature => {
    this.elementInstance = document.querySelector(instance);
    if (!this.elementInstance) {
      throw new Error("no matches found with selector");
    }
    if (this.component) {
      throw new Error("The component has already been added");
    }

    const hash = UniqName.getUniqName();

    const buildCanvasOptions = this.getBuildCanvasOptions({
      kelvinStart: canvasOptions.kelvinStart ?? 1000,
      kelvinEnd: canvasOptions.kelvinEnd ?? 4000,
      rgbColor: canvasOptions.rgbColor ?? "",
      hash,
    });

    this.component = CreateHtmlElement.create({
      width: canvasOptions.width,
      height: canvasOptions.height,
      hash,
      handler: 'default'
    });

    this.elementInstance.appendChild(this.component);
    this.buildCanvas = this.createBuildCanvas(buildCanvasOptions);
    return this;
  };

  public getColor(callback: { (): void }) {
    this.buildCanvas?.controllers?.getColor(callback);
  }

  public destroyed = (): void => {
    if (!this.elementInstance || !this.component) {
      throw new Error("Does not exist");
    }
    this.elementInstance.removeChild(this.component);
    this.deleteLink();
  };

  deleteLink() {
    if (!this.elementInstance || !this.component || !this.buildCanvas) {
      throw new Error("Does not exist");
    }
    this.component = null;
    this.elementInstance = null;
    this.buildCanvas = null;
  }
}
