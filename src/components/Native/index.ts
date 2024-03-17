interface IOptions<T> {
  width: T;
  height: number;
  hash: string;
}

function myComponent<T>({ width, height, hash }: IOptions<T>): string {
  const formattedWidth = typeof width === "string" ? width : `${width}px`;
  return `

  <div class="temperature-picker__container-${hash}" style="width: ${formattedWidth}; height: ${height}px;">
   <canvas id="temperature-picker__canvas-${hash}" class="temperature-picker__canvas-${hash}">
   </canvas>
   <div id="temperature-picker__radio-${hash}" class="temperature-picker__radio-${hash}">
   </div>

   <style>
   .temperature-picker__container-${hash}{
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
   }
 </style>
  </div>
  `;
}

export function render<T>({
  width,
  height,
  hash,
}: IOptions<T>): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("temperature-picker");
  container.style.display = "flex";
  container.innerHTML = myComponent<typeof width>({ width, height, hash });
  return container;
}
