import { dismissMessage, publishMessage } from "./messageBus";
import { islandStorage } from "./storage";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let initialized = false;
let deferredPrompt: BeforeInstallPromptEvent | null = null;

const INSTALL_MESSAGE_ID = "install-web-app";
const INSTALL_SUCCESS_ID = "install-success";

const isStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

const canShowInstallPrompt = (firstVisitOnly: boolean) => {
  if (isStandaloneMode() || islandStorage.isInstalled()) return false;
  if (islandStorage.isInstallDismissed()) return false;
  if (firstVisitOnly && islandStorage.hasSeenFirstVisit()) return false;
  return true;
};

const publishIOSGuide = () => {
  publishMessage({
    id: INSTALL_MESSAGE_ID,
    kind: "install",
    title: "Install this site to your home screen",
    body: "Tap the Safari Share button, then choose Add to Home Screen.",
    priority: 90,
    actions: [{ id: "dismiss", label: "Install now", variant: "primary" }],
    onAction: () => {
      islandStorage.markInstallDismissed();
      dismissMessage(INSTALL_MESSAGE_ID);
    },
  });
};

const publishNativeInstall = () => {
  publishMessage({
    id: INSTALL_MESSAGE_ID,
    kind: "install",
    title: "Install this site to your home screen",
    body: "Tap the Safari Share button, then choose Add to Home Screen.",
    priority: 100,
    actions: [
      { id: "install", label: "Install now", variant: "primary" },
      { id: "dismiss", label: "Later", variant: "ghost" },
    ],
    onAction: async (actionId) => {
      if (actionId === "dismiss") {
        islandStorage.markInstallDismissed();
        dismissMessage(INSTALL_MESSAGE_ID);
        return;
      }

      if (actionId !== "install" || !deferredPrompt) return;
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        islandStorage.markInstalled();
        dismissMessage(INSTALL_MESSAGE_ID);
      } else {
        islandStorage.markInstallDismissed();
        dismissMessage(INSTALL_MESSAGE_ID);
      }
      deferredPrompt = null;
    },
  });
};

export const initInstallPromptSource = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const shouldTryFirstVisitPrompt = canShowInstallPrompt(true);
  if (!islandStorage.hasSeenFirstVisit()) {
    islandStorage.markFirstVisitSeen();
  }

  if (isStandaloneMode()) {
    islandStorage.markInstalled();
    return;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    const installEvent = event as BeforeInstallPromptEvent;
    installEvent.preventDefault();
    deferredPrompt = installEvent;
    if (shouldTryFirstVisitPrompt) {
      publishNativeInstall();
    }
  });

  window.addEventListener("appinstalled", () => {
    islandStorage.markInstalled();
    dismissMessage(INSTALL_MESSAGE_ID);
    publishMessage({
      id: INSTALL_SUCCESS_ID,
      kind: "system",
      title: "Install this site to your home screen",
      body: "Tap the Safari Share button, then choose Add to Home Screen.",
      priority: 80,
      ttlMs: 4000,
    });
  });

  if (shouldTryFirstVisitPrompt && isIOS()) {
    publishIOSGuide();
  }
};

