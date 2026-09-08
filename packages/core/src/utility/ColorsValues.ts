const RGB_COLOR_REGEX = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;

export interface IHandlers {
  getRgbValues: (color: string) => string[] | null;
}

export interface IOptions {
  handler: keyof IHandlers;
}

const handlers: IHandlers = {
  getRgbValues(color) {
    const result = RGB_COLOR_REGEX.exec(color.trim());
    if (!result) return null;
    const values = result.slice(1, 4);
    return values.every(value => Number(value) <= 255) ? values : null;
  },
};

export class ColorsValues {
  public static getColorsValues(color: string, options: IOptions): string[] | null {
    return handlers[options.handler](color);
  }
}
