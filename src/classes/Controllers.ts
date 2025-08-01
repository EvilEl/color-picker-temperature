interface handlerControllers {
  onPointerMove: (event: MouseEvent) => void;
}

interface EventSubscribe {
  targetElement: HTMLElement | Document,
  type: Lowercase<handleKey>,
  callback: (event: MouseEvent) => void
}


type handleKey = 'pointerUp' | 'changeMouse' | 'pointerMove' | 'pointerdown'

export class Controllers {
  private handlers: Partial<Record<handleKey, (event: MouseEvent) => void>>
  private targetElement: HTMLDivElement;
  private isDragging: boolean = false;
  private onPointerMove: (event: MouseEvent) => void;
  private eventSubscribe: EventSubscribe[]

  constructor(targetElement: HTMLDivElement, handlers: handlerControllers) {
    const { onPointerMove } = handlers;
    this.targetElement = targetElement;
    this.onPointerMove = onPointerMove;
    this.handlers = {
      pointerUp: this.pointerUp.bind(this),
      changeMouse: this.changeMouse.bind(this),
      pointerMove: this.pointerMove.bind(this)
    }
    this.eventSubscribe = [
      {
        targetElement: document,
        type: 'pointerup',
        callback: this.handlers.pointerUp
      },
      {
        targetElement: this.targetElement,
        type: 'pointerdown',
        callback: this.handlers.changeMouse
      },
      {
        targetElement: this.targetElement,
        type: 'pointermove',
        callback: this.handlers.pointerMove
      },
    ]
    this.isDragging = false;
    this.setEventMouse();
  }

  private pointerUp() {
    this.isDragging = false;
    this.removeEventListener(this.targetElement, "pointermove", this.handlers.pointerMove)
  }

  private changeMouse(event: MouseEvent) {
    this.isDragging = true;
    this.onPointerMove(event)
    this.targetElement.addEventListener(
      "pointermove",
      this.handlers.pointerMove
    );
  }

  private setEventMouse() {
    document.addEventListener("pointerup", this.handlers.pointerUp);
    this.targetElement.addEventListener("pointerdown", this.handlers.changeMouse);
  }

  public removeAllEventListener() {
    this.eventSubscribe.forEach(data => {
      this.removeEventListener(data.targetElement, data.type, data.callback)
    })
  }

  private removeEventListener(targetElement: HTMLElement | Document, type: Lowercase<handleKey>, callback: typeof this.handlers[keyof typeof this.handlers]) {
    targetElement.removeEventListener(type, callback)
  }

  private pointerMove(event: MouseEvent) {
    if (this.isDragging) {
      this.onPointerMove(event);
    }
  }
}
