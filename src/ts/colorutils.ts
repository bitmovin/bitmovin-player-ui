export namespace ColorUtils {

  export class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number = 1) {
      if (r != null && !isNaN(r)) {
        this.r = r;
      }
      if (g != null && !isNaN(g)) {
        this.g = g;
      }
      if (b != null && !isNaN(b)) {
        this.b = b;
      }
      if (a != null && !isNaN(a)) {
        this.a = a;
      }
    }

    toCSS(): string {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    clone(): Color {
      return new Color(this.r, this.g, this.b, this.a);
    }
  }

  export function mergeColor(colors: Color[]): Color {
    let r, g, b, a: number;
    for (let color of colors) {
      if (color.r != null) {
        r = color.r;
      }
      if (color.g != null) {
        g = color.g;
      }
      if (color.b != null) {
        b = color.b;
      }
      if (color.a != null) {
        a = color.a;
      }
    }
    return new Color(r, g, b, a);
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
