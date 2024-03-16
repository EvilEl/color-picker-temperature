import { ColorTemperature } from "./src/classes";

const btnRemove = document.querySelector("#btn");
const btnCreate = document.querySelector("#create");

function currentColor(color) {
  console.log(color);
}
const instance = "#app";
const optionsCanvas = {
  width: "100%",
  height: 50,
  kelvinStart: 1000,
  kelvinEnd: 9500,
  rgbColor: "rgb(255, 246, 247)",
};
const controllerEventOptions = {
  getColor: currentColor,
};

const colorTemperatrue = ColorTemperature.create(
  instance,
  optionsCanvas,
  controllerEventOptions
);

btnRemove?.addEventListener("click", colorTemperatrue.destroyed);
btnCreate?.addEventListener("click", () =>
  colorTemperatrue.create(instance, optionsCanvas, controllerEventOptions)
);
