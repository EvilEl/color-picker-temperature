import { Component, type IComponent } from './Component'

interface ICreate extends IComponent {
  handler: keyof typeof handlers;
}

const defaultOptions: ICreate = {
  width: "100%",
  height: "150px",
  hash: "1",
  handler: 'default'
}

const handlers = {
  'default': Component.default,
}

export class CreateHtmlElement {
  public static create({ width, height, hash, handler }: ICreate = defaultOptions): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add("temperature-picker");
    container.style.display = "flex";
    container.style.height = "150px";
    const component = handlers[handler]({ width, height, hash });
    container.appendChild(component);
    return container;
  }
}