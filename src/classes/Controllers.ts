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
  private onPointerMove: (event: MouseEvent) => void;
  private onPointerUp: (event: MouseEvent) => void;
  private onMouseMove: (event: MouseEvent) => void;

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
    this.setEventMouse();
  }

  private handlePointerUp(event: MouseEvent) {
    this.isMouseDown = false;
    this.removeEventMouse();
    this.onPointerUp(event)
  }

  private onChangeMouse(event: MouseEvent) {
    this.isMouseDown = true;
    this.onMouseMove(event);
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

  private handlerPointerMove(event: MouseEvent) {
    if (!this.isMouseDown) {
      return;
    }
    this.onPointerMove(event);
  }
}
