const STORAGE_KEYS = {
  firstVisitSeen: "island:first_visit_seen",
  installDismissed: "island:install_dismissed",
  installed: "island:installed",
} as const;

const safeGet = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
};

export const islandStorage = {
  keys: STORAGE_KEYS,
  hasSeenFirstVisit: () => safeGet(STORAGE_KEYS.firstVisitSeen) === "1",
  markFirstVisitSeen: () => safeSet(STORAGE_KEYS.firstVisitSeen, "1"),
  isInstallDismissed: () => safeGet(STORAGE_KEYS.installDismissed) === "1",
  markInstallDismissed: () => safeSet(STORAGE_KEYS.installDismissed, "1"),
  isInstalled: () => safeGet(STORAGE_KEYS.installed) === "1",
  markInstalled: () => safeSet(STORAGE_KEYS.installed, "1"),
};

