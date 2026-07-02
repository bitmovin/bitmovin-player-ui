export namespace TimestampLinkUtils {
  export function parseTimestampFromUrl(href: string = window.location.href): number | null {
    const url = new URL(href);
    const timestamp = url.searchParams.get('t') ?? new URLSearchParams(url.hash.substring(1)).get('t');
    const match = timestamp?.match(/^([0-9]+(?:\.[0-9]+)?)s?$/);

    if (!match) {
      return null;
    }

    const value = parseFloat(match[1]);
    return isFinite(value) && value >= 0 ? value : null;
  }

  export function buildTimestampLink(currentTime: number, href: string = window.location.href): string {
    const url = new URL(href);
    const time = Math.max(0, Math.floor(currentTime || 0));

    url.searchParams.delete('t');
    url.searchParams.set('t', `${time}s`);

    return url.toString();
  }
}
