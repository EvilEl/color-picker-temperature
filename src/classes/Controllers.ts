interface IControllers {
  canvas: HTMLCanvasElement;
  radio: HTMLDivElement;
  context: CanvasRenderingContext2D;
  container: HTMLDivElement;
}

export class Controllers {
  private radio: HTMLDivElement;
  private context: CanvasRenderingContext2D;
  private container: HTMLDivElement;
  private isMouseDown: boolean = false;
  private pointerUp: () => void;
  private animationFrameId: number | null = null;
  private changeMouse: (event: MouseEvent) => void;
  private pointerMoveCanvas: (event: MouseEvent) => void;
  private rectRadio: DOMRect;
  private rectCanvas: DOMRect;
  private watchers: { (value: string): void }[] = [];
  //TODO use get set, not proxy
  myColor = new Proxy(
    { _color: "" },
    {
      set: (_, key, value) => {
        if (key === "_color") {
          this.notifyWatchers(value);
        }
        return true;
      },
    }
  );

  constructor({ canvas, radio, context, container }: IControllers) {
    this.radio = radio;
    this.context = context;
    this.container = container;

    this.animationFrameId = null;
    this.pointerUp = this.onPointerUp.bind(this);
    this.changeMouse = this.onChangeMouse.bind(this);
    this.pointerMoveCanvas = this.onPointerMoveCanvas.bind(this);

    this.isMouseDown = false;
    this.rectRadio = radio.getBoundingClientRect();
    this.rectCanvas = canvas.getBoundingClientRect();
    this.myColor._color = radio.style.background;

    this.setEventMouse();
  }

  public getColor(callback: { (): void }) {
    this.watchers.push(callback);
  }

  private notifyWatchers(value: string) {
    if (!this.watchers.length) {
      return;
    }
    this.watchers.forEach((callback) => callback(value));
  }

  onPointerUp() {
    this.isMouseDown = false;
    this.removeEventMouse();
  }

  onChangeMouse(event: MouseEvent) {
    this.isMouseDown = true;
    this.moveAt(event);
  }

  private setEventMouse() {
    document.addEventListener("pointerup", this.pointerUp.bind(this));
    this.container.addEventListener("pointerdown", this.changeMouse.bind(this));
    this.container.addEventListener(
      "pointermove",
      this.pointerMoveCanvas.bind(this)
    );
  }

  private removeEventMouse() {
    document.removeEventListener("pointerup", this.pointerUp);
    this.container.removeEventListener("pointerdown", this.changeMouse);
    this.container.removeEventListener("pointermove", this.pointerMoveCanvas);
  }

  onPointerMoveCanvas(event: MouseEvent) {
    if (!this.isMouseDown) {
      return;
    }
    this.changeMouse(event);
  }

  private moveAt(event: MouseEvent): void {
    const { x } = event;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(() => this.chagePosition(x));
  }

  private setColor(x: number) {
    this.myColor._color = this.radio.style.background;
    this.radio.style.background = this.getColorCanvas(x);
  }

  public chagePosition(x: number) {
    const radioPercent = (this.rectRadio.width / this.rectCanvas.width) * 100;
    const coordinateX =
      ((x - this.rectCanvas.left - this.rectRadio.width / 2) /
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
    this.setColor(x);
  }

  private getColorCanvas(x: number): string {
    const positionY = Math.floor(this.rectCanvas.height / 2);
    let positionX = Math.floor(x - this.rectCanvas.left - this.rectRadio.width);
    if (positionX < 0) {
      positionX = 1;
    }
    if (positionX + this.rectRadio.width > this.rectCanvas.width) {
      positionX = this.rectCanvas.width - 1;
    }
    const imageData = this.context.getImageData(positionX, positionY, 1, 1);
    const pixels = imageData.data;
    const pixelColor = `rgb(${pixels[0]},${pixels[1]},${pixels[2]})`;
    return pixelColor;
  }
}
