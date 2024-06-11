const RGB_COLOR_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/;

export function getRgbValues(rgb: string): string[] | null {
  const result = RGB_COLOR_REGEX.exec(rgb.replace(/\s+/g, ""));
  if (!result) {
    return null;
  }
  return result.slice(1, 4);
}
