const RGB_COLOR_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/;

export interface IHandlers extends Record<string, (color: string) => string[] | null> { }
export interface IOptions {
  handler: keyof IHandlers;
}

const handlers: IHandlers = {
  'getRgbValues': getRgbValues
}


function getRgbValues(rgb: string): string[] | null {
  const result = RGB_COLOR_REGEX.exec(rgb.replace(/\s+/g, ""));
  if (!result) {
    return null;
  }
  return result.slice(1, 4);
}

export class ColorsValues {
  public static getColorsValues(color: string, options: IOptions) {
    return handlers[options.handler](color);
  }
}


