function myComponent<T>(width: T, height: number) {
  const formattedWidth = typeof width === "string" ? width : `${width}px`;
  return `

  <div class="temperature-picker__container" style="width: ${formattedWidth}; height: ${height}px;">
   <canvas id="temperature-picker__canvas" class="temperature-picker__canvas">
   </canvas>
   <div id="temperature-picker__radio" class="temperature-picker__radio">
   </div>

   <style>
   .temperature-picker__container{
      position:relative;
      margin: 0;
      padding: 0;
      width: 100%;
   }
   .temperature-picker__canvas {
      width:100%;
      height:100%;
   }
   .temperature-picker__radio{
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

export function render<T>(width: T, height: number): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("temperature-picker");
  container.style.display = "flex";
  container.innerHTML = myComponent(width, height);
  return container;
}
