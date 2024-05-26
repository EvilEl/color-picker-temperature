interface IOptions {
  width: number | string;
  height: number | string;
  hash: string;
}

function myComponent({ width, height, hash }: IOptions): HTMLDivElement {
  const formattedWidth = typeof width === "string" ? width : `${width}px`;
  const formattedHeight = typeof height === "string" ? height : `${height}px`;

  const container = document.createElement("div");
  container.className = `temperature-picker__container-${hash}`;
  container.style.width = formattedWidth;
  container.style.height = formattedHeight;

  const canvas = document.createElement("canvas");
  canvas.className = `temperature-picker__canvas-${hash}`;

  const radio = document.createElement("div");
  radio.className = `temperature-picker__radio-${hash}`;

  container.appendChild(canvas);
  container.appendChild(radio);

  const style = document.createElement("style");
  style.textContent = `.temperature-picker__container-${hash}{
    position:relative;
    margin: 0;
    padding: 0;
    width: 100%;
 }
 .temperature-picker__canvas-${hash} {
    width:100%;
    height:100%;
 }
 .temperature-picker__radio-${hash}{
    position: absolute;
    border:1px solid black;
    top: 50%;
    left: 0;
    cursor: move;
    touch-action: none;
    user-select: none;
    border-radius: 50%;
    width: 0.625rem;
    height: 0.625rem;
    transform: translateY(-50%);
 }`;
  document.head.appendChild(style);
  return container;
}

export function render({ width, height, hash }: IOptions): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("temperature-picker");
  container.style.display = "flex";
  const component = myComponent({ width, height, hash });
  container.appendChild(component);
  return container;
}
