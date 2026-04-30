// Normalize hrefs to dedupe dock items reliably.
export const normalizeHref = (href: string) => {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin === window.location.origin) {
      return url.pathname;
    }
    return href;
  } catch {
    return href;
  }
};
