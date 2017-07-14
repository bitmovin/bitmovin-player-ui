export namespace ColorUtils {

  export class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number = 1) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }

    toCSS(): string {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
  }

  /**
   * Parses a string formated as 'rgba(number, number, number, number)'
   * and returns a color element of the same value
   */
  export function colorFromCss(css: string, fallback: Color = new Color(0, 0, 0)): Color {
    if (!css.startsWith('rgba(')) {
      return fallback;
    }
    let end = css.indexOf(')');
    if (end !== css.length - 1) {
      return fallback;
    }
    if (end !== css.lastIndexOf(')')) {
      return fallback;
    }
    let vals = css.slice(5, end).split(',');
    if (vals.length !== 4) {
      return fallback;
    }
    return new Color(Number(vals[0]), Number(vals[1]), Number(vals[2]), Number(vals[3]));
  }

  // Transparent black and opaque white default colors for background and foreground
  export const background = new Color(0, 0, 0, 0);
  export const foreground = new Color(255, 255, 255, 1);
}
