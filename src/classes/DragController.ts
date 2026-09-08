import type { IDragController } from './interfaces/index.js';

export interface DragControllerHandlers {
  onMove: (event: PointerEvent) => void;
}

export class DragController implements IDragController {
  private pointerId: number | null = null;
  private attached = false;
  private readonly document: Document;

  constructor(
    private readonly targetElement: HTMLDivElement,
    private readonly handlers: DragControllerHandlers
  ) {
    this.document = targetElement.ownerDocument;
  }

  public attach(): void {
    if (this.attached) return;
    this.attached = true;
    this.targetElement.addEventListener('pointerdown', this.onPointerDown);
    this.targetElement.addEventListener('lostpointercapture', this.onCancel);
  }

  public detach(): void {
    this.endDrag();
    this.targetElement.removeEventListener('pointerdown', this.onPointerDown);
    this.targetElement.removeEventListener('lostpointercapture', this.onCancel);
    this.attached = false;
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary || event.button !== 0 || this.pointerId !== null) return;
    this.pointerId = event.pointerId;
    this.document.addEventListener('pointermove', this.onPointerMove);
    this.document.addEventListener('pointerup', this.onPointerUp);
    this.document.addEventListener('pointercancel', this.onCancel);
    this.document.defaultView?.addEventListener('blur', this.onBlur);
    this.targetElement.setPointerCapture(event.pointerId);
    this.handlers.onMove(event);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId === this.pointerId) this.handlers.onMove(event);
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.handlers.onMove(event);
    this.endDrag();
  };

  private onCancel = (event: PointerEvent): void => {
    if (event.pointerId === this.pointerId) this.endDrag();
  };

  private onBlur = (): void => { this.endDrag(); };

  private endDrag(): void {
    const pointerId = this.pointerId;
    this.pointerId = null;
    this.document.removeEventListener('pointermove', this.onPointerMove);
    this.document.removeEventListener('pointerup', this.onPointerUp);
    this.document.removeEventListener('pointercancel', this.onCancel);
    this.document.defaultView?.removeEventListener('blur', this.onBlur);
    if (pointerId !== null && this.targetElement.hasPointerCapture(pointerId)) {
      this.targetElement.releasePointerCapture(pointerId);
    }
  }
}
