import { IControllerEventOptions } from "./models";

export class Controllers {
  private canvas: HTMLCanvasElement;
  private radio: HTMLDivElement;
  private context: CanvasRenderingContext2D;
  private controllersEventOptions: IControllerEventOptions;

  private RadioUp: () => void;
  private RadioMove: (event: MouseEvent) => void;
  private rectRadio: DOMRect;
  private rectCanvas: DOMRect;
  private _color: string;

  constructor(
    canvas: HTMLCanvasElement,
    radio: HTMLDivElement,
    context: CanvasRenderingContext2D,
    controllersEventOptions?: IControllerEventOptions
  ) {
    this.canvas = canvas;
    this.radio = radio;
    this.context = context;
    this.controllersEventOptions = controllersEventOptions ?? {};

    this.radio.addEventListener("pointerdown", this.onRadioDown.bind(this));
    this.canvas.addEventListener("click", this.moveAt.bind(this));

    this._color = radio.style.background;

    this.RadioUp = this.onRadioUp.bind(this);
    this.RadioMove = this.onRadioMove.bind(this);

    this.rectRadio = radio.getBoundingClientRect();
    this.rectCanvas = canvas.getBoundingClientRect();
  }

  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._color = value;
  }

  private onRadioDown(): void {
    document.addEventListener("pointerup", this.RadioUp);
    document.addEventListener("pointermove", this.RadioMove);
  }

  private onRadioUp(): void {
    document.removeEventListener("pointerup", this.RadioUp);
    document.removeEventListener("pointermove", this.RadioMove);
  }

  private onRadioMove(event: MouseEvent): void {
    event.preventDefault();
    this.moveAt(event);
    this.radio.style.background;
  }

  public moveAt(event: MouseEvent): void {
    const radioPercent = (this.rectRadio.width / this.rectCanvas.width) * 100;
    const coordinateX =
      ((event.x - this.rectCanvas.left - this.rectRadio.width / 2) /
        this.rectCanvas.width) *
      100;
    let formatCoordinate = coordinateX;
    if (coordinateX < 0) {
      formatCoordinate = 0;
    }
    if (coordinateX > 100 - radioPercent) {
      formatCoordinate = 100 - radioPercent;
    }
    this.radio.style.left = `${formatCoordinate}%`;
    this.radio.style.background = this.getColorCanvas(event);
    this.color = this.radio.style.background;
  }

  private getColorCanvas(event: MouseEvent): string {
    const positionY = Math.floor(this.rectCanvas.height / 2);
    let positionX = Math.floor(
      event.x - this.rectCanvas.left - this.rectRadio.width
    );
    if (positionX < 0) {
      positionX = 1;
    }
    if (positionX + this.rectRadio.width > this.rectCanvas.width) {
      positionX = this.rectCanvas.width - 1;
    }
    const imageData = this.context.getImageData(positionX, positionY, 1, 1);
    const pixels = imageData.data;
    const pixelColor = `rgb(${pixels[0]},${pixels[1]},${pixels[2]})`;
    if (this.controllersEventOptions.getColor) {
      this.controllersEventOptions.getColor(pixelColor);
    }
    return pixelColor;
  }
}
