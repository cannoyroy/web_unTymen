// Public entry for dock behavior.
import { initDock } from './logic/dockController.js';
export { initDock } from './logic/dockController.js';

let cleanupDock: (() => void) | null = null;
let pageLoadBound = false;

const mountDock = () => {
  cleanupDock?.();
  cleanupDock = initDock();
};

export const bootstrapDock = () => {
  mountDock();
  if (pageLoadBound) return;
  pageLoadBound = true;
  document.addEventListener('astro:page-load', mountDock);
};
