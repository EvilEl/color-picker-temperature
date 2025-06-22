interface handlerControllers {
  onPointerMove: (event: MouseEvent) => void;
  onPointerUp: (event: MouseEvent) => void;
  onMouseMove: (event: MouseEvent) => void;
}


export class Controllers {
  private _pointerUp: (event: MouseEvent) => void;
  private changeMouse: (event: MouseEvent) => void;
  private pointerMove: (event: MouseEvent) => void;
  private targetElement: HTMLCanvasElement;
  private isMouseDown: boolean = false;
  // private animationFrameId: number | null = null;
  private onPointerMove: (event: MouseEvent) => void;
  private onPointerUp: (event: MouseEvent) => void;
  private onMouseMove: (event: MouseEvent) => void;

  // private watchers: { (value: string): void }[] = [];
  //TODO use get set, not proxy
  // myColor = new Proxy(
  //   { _color: "" },
  //   {
  //     set: (_, key, value) => {
  //       if (key === "_color") {
  //         this.notifyWatchers(value);
  //       }
  //       return true;
  //     },
  //   }
  // );

  constructor(targetElement: HTMLCanvasElement, handlers: handlerControllers) {
    const { onPointerMove, onPointerUp, onMouseMove } = handlers;

    this.targetElement = targetElement;
    this.onPointerMove = onPointerMove;
    this.onPointerUp = onPointerUp
    this.onMouseMove = onMouseMove


    this._pointerUp = this.handlePointerUp.bind(this);
    this.changeMouse = this.onChangeMouse.bind(this);
    this.pointerMove = this.handlerPointerMove.bind(this);
    this.isMouseDown = false;
    // this.animationFrameId = null;

    // this.myColor._color = radio.style.background;

    this.setEventMouse();
  }

  // public getColor(callback: { (): void }) {
  //   this.watchers.push(callback);
  // }

  // private notifyWatchers(value: string) {
  //   if (!this.watchers.length) {
  //     return;
  //   }
  //   this.watchers.forEach((callback) => callback(value));
  // }

  handlePointerUp(event: MouseEvent) {
    this.isMouseDown = false;
    // this.removeEventMouse();
    this.onPointerUp(event)
  }

  onChangeMouse(event: MouseEvent) {
    this.isMouseDown = true;
    this.onMouseMove(event);
    // this.moveAt(event);
  }

  private setEventMouse() {
    document.addEventListener("pointerup", this._pointerUp.bind(this));
    this.targetElement.addEventListener("pointerdown", this.changeMouse.bind(this));
    this.targetElement.addEventListener(
      "pointermove",
      this.pointerMove.bind(this)
    );
  }

  private removeEventMouse() {
    document.removeEventListener("pointerup", this._pointerUp);
    this.targetElement.removeEventListener("pointerdown", this.changeMouse);
    this.targetElement.removeEventListener("pointermove", this.pointerMove);
  }

  handlerPointerMove(event: MouseEvent) {
    if (!this.isMouseDown) {
      return;
    }
    // this.changeMouse(event);
    this.onPointerMove(event);
  }

  private moveAt(event: MouseEvent): void {
    // const { x } = event;
    // if (this.animationFrameId !== null) {
    //   cancelAnimationFrame(this.animationFrameId);
    // }
    // this.animationFrameId = requestAnimationFrame(() => this.changePosition(x));
  }

  // private setColor(x: number) {
  //   this.myColor._color = this.radio.style.background;
  //   this.radio.style.background = this.getColorCanvas(x);
  // }

  public changePosition(x: number) {
    // const radioPercent = (this.rectRadio.width / this.rectCanvas.width) * 100;
    // const coordinateX =
    //   ((x - this.rectCanvas.left - this.rectRadio.width / 2) /
    //     this.rectCanvas.width) *
    //   100;
    // let formatCoordinate = coordinateX;
    // if (coordinateX < 0) {
    //   formatCoordinate = 0;
    // }
    // if (coordinateX > 100 - radioPercent) {
    //   formatCoordinate = 100 - radioPercent;
    // }
    // this.radio.style.left = `${formatCoordinate}%`;
    // this.setColor(x);
  }

  // private getColorCanvas(x: number): string {
  //   const positionY = Math.floor(this.rectCanvas.height / 2);
  //   let positionX = Math.floor(x - this.rectCanvas.left - this.rectRadio.width);
  //   if (positionX < 0) {
  //     positionX = 1;
  //   }
  //   if (positionX + this.rectRadio.width > this.rectCanvas.width) {
  //     positionX = this.rectCanvas.width - 1;
  //   }
  //   const imageData = this.context.getImageData(positionX, positionY, 1, 1);
  //   const pixels = imageData.data;
  //   const pixelColor = `rgb(${pixels[0]},${pixels[1]},${pixels[2]})`;
  //   return pixelColor;
  // }
}
