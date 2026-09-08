export interface IComponent {
  width: number | string;
  height: number | string;
  hash: string;
}

export class Component {
  public static default({ width, height, hash }: IComponent): HTMLDivElement {
    const formattedWidth = typeof width === "string" ? width : `${width}px`;
    const formattedHeight = typeof height === "string" ? height : `${height}px`;

    const container = document.createElement("div");
    container.className = `temperature-picker__container temperature-picker__container-${hash}`;
    container.style.width = formattedWidth;
    container.style.height = formattedHeight;

    const canvas = document.createElement("canvas");
    canvas.className = `temperature-picker__canvas temperature-picker__canvas-${hash}`;

    const radio = document.createElement("div");
    radio.className = `temperature-picker__radio temperature-picker__radio-${hash}`;

    container.appendChild(canvas);
    container.appendChild(radio);

    const style = document.createElement("style");
    style.textContent = `.temperature-picker__container-${hash}{
      position:relative;
      isolation: isolate;
      margin: 0;
      padding: 0;
      width: 100%;
      cursor: crosshair;
      touch-action: none;
      user-select: none;
   }
   .temperature-picker__canvas-${hash} {
      display:block;
      width:100%;
      height:100%;
      border-radius: var(--temperature-picker-radius, 12px);
      box-shadow: 0 2px 8px rgb(15 23 42 / 8%);
   }
   .temperature-picker__container-${hash}::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      border-radius: var(--temperature-picker-radius, 12px);
      box-shadow: inset 0 0 0 1px rgb(15 23 42 / 10%), inset 0 1px 0 rgb(255 255 255 / 35%);
   }
   .temperature-picker__radio-${hash}{
      position: absolute;
      z-index: 2;
      box-sizing: content-box;
      border: var(--temperature-picker-marker-border, 3px solid white);
      top: 50%;
      left: 0;
      cursor: grab;
      touch-action: none;
      user-select: none;
      border-radius: var(--temperature-picker-marker-radius, 50%);
      width: var(--temperature-picker-marker-width, 20px);
      height: var(--temperature-picker-marker-height, 20px);
      box-shadow: var(--temperature-picker-marker-shadow, 0 0 0 1px rgb(15 23 42 / 12%), 0 2px 5px rgb(15 23 42 / 20%), 0 5px 14px rgb(15 23 42 / 12%));
      transform: translateY(-50%);
   }
   .temperature-picker__radio-${hash}::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      box-shadow: inset 0 0 0 1px rgb(15 23 42 / 8%);
   }
   .temperature-picker__radio-${hash}:active {
      cursor: grabbing;
   }`;
    container.appendChild(style);
    return container;
  }
}
