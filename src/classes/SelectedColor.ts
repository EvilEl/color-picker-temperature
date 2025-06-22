import { ColorsValues } from "../utility";

export interface SelectedColorOptions {
  rectRadio: DOMRect,
  rectCanvas: DOMRect,
  radio: HTMLDivElement,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  rgbColor: string
}


export class SelectedColor {
  private animationFrameId: number | null
  private options: SelectedColorOptions
  public selected: string

  constructor(options: SelectedColorOptions) {
    this.animationFrameId = null;
    this.options = options
    this.selected = options.rgbColor
  }

  public moveAt(event: MouseEvent): void {
    const { x } = event;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(() => this.changePosition(x));
  }

  public changePosition(x: number) {
    const radioPercent = (this.options.rectRadio.width / this.options.rectCanvas.width) * 100;
    const coordinateX =
      ((x - this.options.rectCanvas.left - this.options.rectRadio.width / 2) /
        this.options.rectCanvas.width) *
      100;
    let formatCoordinate = coordinateX;
    if (coordinateX < 0) {
      formatCoordinate = 0;
    }
    if (coordinateX > 100 - radioPercent) {
      formatCoordinate = 100 - radioPercent;
    }
    this.options.radio.style.left = `${formatCoordinate}%`;
    this.setColor(x);
  }

  private setColor(x: number) {
    this.selected = this.getColorCanvas(x)
    this.options.radio.style.background = this.selected
  }

  private getColorCanvas(x: number): string {
    const positionY = Math.floor(this.options.rectCanvas.height / 2);
    let positionX = Math.floor(x - this.options.rectCanvas.left - this.options.rectRadio.width);
    if (positionX < 0) {
      positionX = 1;
    }
    if (positionX + this.options.rectRadio.width > this.options.rectCanvas.width) {
      positionX = this.options.rectCanvas.width - 1;
    }
    const imageData = this.options.context.getImageData(positionX, positionY, 1, 1);
    const pixels = imageData.data;
    const pixelColor = `rgb(${pixels[0]},${pixels[1]},${pixels[2]})`;
    return pixelColor;
  }


  private getData(): number[][] {
    if (!this.options.context) {
      return [];
    }
    const imageData = this.options.context.getImageData(0, 0, this.options.canvas.width, 1);
    const formData: number[][] = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      const newArr = [...imageData.data.slice(i, i + 3)] as number[];
      if (!formData.includes(newArr)) {
        formData.push(newArr);
      }
    }
    return formData;
  }

  public getSelectedColorIndex(rgb: string): number {
    if (!rgb) {
      return 0;
    }

    const values = ColorsValues.getColorsValues(rgb, { handler: 'getRgbValues' });
    if (!values) {
      return 0;
    }
    const data = this.getData();

    const findIndex = { index: 0 };

    for (let i = 0; i < data.length; i++) {
      if (
        Number(values[0]) === data[i][0] &&
        Number(values[1]) === data[i][1] &&
        Number(values[2]) === data[i][2]
      ) {
        findIndex.index = i;
        break;
      }
    }
    return findIndex.index + this.options.rectRadio.width + this.options.rectCanvas.left;
  }
}
