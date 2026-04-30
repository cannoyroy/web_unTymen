export type ThemePreference = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";
const THEME_EVENT = "theme:changed";

let mediaListenerBound = false;

const isValidPreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "auto";

export const getThemePreference = (): ThemePreference => {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isValidPreference(stored) ? stored : "auto";
};

export const getSystemTheme = (): ResolvedTheme => {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

export const resolveTheme = (preference: ThemePreference): ResolvedTheme =>
  preference === "auto" ? getSystemTheme() : preference;

const emitThemeChanged = (
  preference: ThemePreference,
  resolved: ResolvedTheme,
) => {
  window.dispatchEvent(
    new CustomEvent(THEME_EVENT, {
      detail: { preference, resolved },
    }),
  );
};

export const applyResolvedTheme = (resolved: ResolvedTheme) => {
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
};

export const setThemePreference = (preference: ThemePreference) => {
  const resolved = resolveTheme(preference);
  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  applyResolvedTheme(resolved);
  emitThemeChanged(preference, resolved);
};

export const toggleThemePreference = () => {
  const currentResolved = (document.documentElement.getAttribute("data-theme") ||
    getSystemTheme()) as ResolvedTheme;
  setThemePreference(currentResolved === "dark" ? "light" : "dark");
};

export const initTheme = () => {
  const preference = getThemePreference();
  applyResolvedTheme(resolveTheme(preference));

  if (mediaListenerBound) return;
  mediaListenerBound = true;

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", () => {
    if (getThemePreference() !== "auto") return;
    const resolved = resolveTheme("auto");
    applyResolvedTheme(resolved);
    emitThemeChanged("auto", resolved);
  });
};

