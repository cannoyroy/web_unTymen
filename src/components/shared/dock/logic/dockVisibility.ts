// Auto-hide/auto-show behavior for the dock bar.
import { DOCK_CONSTANTS } from '../data/dockConstants.js';

export const createDockVisibility = (dock: HTMLElement) => {
  const { hideDelay, showBoundary } = DOCK_CONSTANTS;
  let hideTimer: number | undefined;
  let isScrolling = false;
  let scrollTimer: number | undefined;
  let pendingPointerY: number | null = null;
  let pointerRafId: number | null = null;
  let isHoveringDock = false;

  const setDockState = (state: 'visible' | 'hidden') => {
    if (dock.dataset.state === state) return;
    if (state === 'visible') {
      dock.style.transform = 'translateY(0)';
      dock.style.opacity = '1';
      dock.dataset.state = 'visible';
      return;
    }
    dock.style.transform = 'translateY(120%)';
    dock.style.opacity = '0';
    dock.dataset.state = 'hidden';
  };

  const clearHideTimer = () => {
    window.clearTimeout(hideTimer);
    hideTimer = undefined;
  };

  const scheduleHide = () => {
    if (hideTimer) return;
    hideTimer = window.setTimeout(() => {
      hideTimer = undefined;
      setDockState('hidden');
    }, hideDelay);
  };

  const evaluate = () => {
    if (isHoveringDock) {
      setDockState('visible');
      clearHideTimer();
      return;
    }
    if (isScrolling) {
      scheduleHide();
      return;
    }
    const isNearBoundary = pendingPointerY !== null && window.innerHeight - pendingPointerY <= showBoundary;
    if (isNearBoundary) {
      setDockState('visible');
      scheduleHide();
      return;
    }
    scheduleHide();
  };

  const onPointerEnter = () => {
    isHoveringDock = true;
    evaluate();
  };

  const onPointerLeave = () => {
    isHoveringDock = false;
    evaluate();
  };

  const onPointerMove = (event: PointerEvent) => {
    pendingPointerY = event.clientY;
    if (pointerRafId !== null) return;
    pointerRafId = requestAnimationFrame(() => {
      evaluate();
      pointerRafId = null;
    });
  };

  const onScroll = () => {
    isScrolling = true;
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      isScrolling = false;
      evaluate();
    }, 180);
  };

  dock.addEventListener('pointerenter', onPointerEnter);
  dock.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('pointermove', onPointerMove);
  window.addEventListener('scroll', onScroll, { passive: true });

  scheduleHide();

  return () => {
    dock.removeEventListener('pointerenter', onPointerEnter);
    dock.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onScroll);
    if (pointerRafId !== null) {
      cancelAnimationFrame(pointerRafId);
      pointerRafId = null;
    }
    clearHideTimer();
    window.clearTimeout(scrollTimer);
    scrollTimer = undefined;
  };
};
