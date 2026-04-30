import { toggleThemePreference } from "../../../../scripts/theme/themeManager.ts";

// Bind click actions for non-navigation dock items.
export const bindDockActions = (dock: HTMLElement) => {
  const cleanups: Array<() => void> = [];

  dock.querySelectorAll('[data-action="back-to-top"]').forEach((item) => {
    const anchor = item.querySelector('a');
    if (!anchor) return;
    const handler = (event: Event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    anchor.addEventListener('click', handler);
    cleanups.push(() => anchor.removeEventListener('click', handler));
  });

  dock.querySelectorAll('[data-action="theme-toggle"]').forEach((item) => {
    const anchor = item.querySelector('a');
    if (!anchor) return;
    const handler = (event: Event) => {
      event.preventDefault();
      toggleThemePreference();
    };
    anchor.addEventListener('click', handler);
    cleanups.push(() => anchor.removeEventListener('click', handler));
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};
