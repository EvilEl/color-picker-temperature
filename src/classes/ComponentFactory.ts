import type { IComponent } from './Component.js';

export interface ComponentFactoryOptions {
  width: number | string;
  height: number | string;
  hash: string;
  handler: (options: IComponent) => HTMLDivElement;
}

export class ComponentFactory {
  public static create({ width, height, hash, handler }: ComponentFactoryOptions): HTMLDivElement {
    const container = document.createElement('div');
    container.classList.add('temperature-picker');
    container.style.display = 'flex';
    container.style.height = typeof height === 'number' ? `${height}px` : height;
    container.style.minWidth = '0';

    const component = handler({ width, height: '100%', hash });
    container.appendChild(component);

    return container;
  }
}
