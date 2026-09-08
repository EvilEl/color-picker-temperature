import { DragController } from './DragController.js';

/** @deprecated Use DragController with explicit attach()/detach(). */
export class Controllers extends DragController {
  constructor(targetElement: HTMLDivElement, handlers: { onPointerMove: (event: MouseEvent) => void }) {
    super(targetElement, { onMove: handlers.onPointerMove });
    this.attach();
  }

  public removeAllEventListener(): void {
    this.detach();
  }
}
