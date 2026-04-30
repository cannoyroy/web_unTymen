// Activity window manager (iframe preview, drag/resize, minimize, close).
import { createDockStorage } from '../data/dockStorage.js';
import { DOCK_CONSTANTS } from '../data/dockConstants.js';
import type { ActivityItem } from '../data/dockStore.js';

type ActivityCallbacks = {
  onOpen?: (item: ActivityItem) => void;
  onClose?: (href: string) => void;
  onMinimize?: (href: string) => void;
};

export const createActivityManager = (
  dock: HTMLElement,
  activityLayer: HTMLElement | null,
  activityTemplate: HTMLTemplateElement | null,
  onRemove: (href: string) => void,
  options: { storagePrefix?: string; callbacks?: ActivityCallbacks } = {},
) => {
  const { windowPadding, minActivityWidth, minActivityHeight, baseZIndex, minimizeDuration, openDuration } = DOCK_CONSTANTS;
  let topZIndex = baseZIndex;
  const storage = createDockStorage(options.storagePrefix);
  const callbacks = options.callbacks;
  let onLayerDblClick: ((event: MouseEvent) => void) | null = null;
  let onLayerClick: ((event: MouseEvent) => void) | null = null;
  let onCloseTopActivity: (() => void) | null = null;

  const setLayerVisibility = () => {
    if (!activityLayer) return;
    const hasWindows = activityLayer.querySelectorAll('.dock-activity-window:not(.hidden)').length > 0;
    activityLayer.classList.toggle('hidden', !hasWindows);
    activityLayer.classList.toggle('is-visible', hasWindows);
    activityLayer.setAttribute('aria-hidden', hasWindows ? 'false' : 'true');
  };

  const bringToFront = (panel: HTMLElement) => {
    topZIndex += 1;
    panel.style.zIndex = `${topZIndex}`;
  };

  const positionPanel = (panel: HTMLElement) => {
    if (panel.dataset.positioned) return;
    requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      const left = Math.max(windowPadding, (window.innerWidth - rect.width) / 2);
      const top = Math.max(windowPadding, (window.innerHeight - rect.height) / 2);
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.width = `${rect.width}px`;
      panel.style.height = `${rect.height}px`;
      panel.dataset.positioned = 'true';
    });
  };

  const restorePanelState = (panel: HTMLElement) => {
    const href = panel.dataset.href || '';
    const stored = storage.readPanelState(href);
    if (!stored) return false;
    panel.style.left = `${stored.left}px`;
    panel.style.top = `${stored.top}px`;
    panel.style.width = `${stored.width}px`;
    panel.style.height = `${stored.height}px`;
    panel.dataset.positioned = 'true';
    return true;
  };

  const persistPanelState = (panel: HTMLElement) => {
    const href = panel.dataset.href || '';
    if (!href) return;
    const rect = panel.getBoundingClientRect();
    storage.writePanelState(href, { left: rect.left, top: rect.top, width: rect.width, height: rect.height });
  };

  const hidePanel = (panel: HTMLElement) => {
    panel.classList.add('hidden');
    setLayerVisibility();
  };

  const revealPanel = (panel: HTMLElement) => {
    panel.classList.remove('hidden', 'dock-activity-minimized');
    bringToFront(panel);
    setLayerVisibility();
  };

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const closePanel = (panel: HTMLElement) => {
    if (panel.dataset.href) {
      onRemove(panel.dataset.href);
      callbacks?.onClose?.(panel.dataset.href);
    }
    panel.remove();
    setLayerVisibility();
  };

  const closeTopVisiblePanel = () => {
    if (!activityLayer) return false;
    const windows = Array.from(activityLayer.querySelectorAll('.dock-activity-window'))
      .filter((panel) => !(panel as HTMLElement).classList.contains('hidden')) as HTMLElement[];
    if (!windows.length) return false;

    const topPanel = windows
      .sort((a, b) => (Number(a.style.zIndex) || 0) - (Number(b.style.zIndex) || 0))
      .pop();
    if (!topPanel) return false;

    closePanel(topPanel);
    return true;
  };

  const buildWindow = (item: ActivityItem) => {
    if (!activityLayer || !activityTemplate) return null;
    const fragment = activityTemplate.content.cloneNode(true) as DocumentFragment;
    const panel = fragment.querySelector('.dock-activity-window') as HTMLElement | null;
    const title = panel?.querySelector('.dock-activity-title') as HTMLElement | null;
    const frame = panel?.querySelector('.dock-activity-frame') as HTMLIFrameElement | null;
    if (!panel || !title || !frame) return null;

    panel.dataset.href = item.href || '';
    panel.dataset.label = item.label || '文章';
    panel.setAttribute('aria-labelledby', `dock-activity-title-${Date.now()}`);
    title.id = panel.getAttribute('aria-labelledby') || '';
    title.textContent = item.label || '文章';
    if (item.href) {
      frame.setAttribute('src', item.href);
    }
    bringToFront(panel);
    activityLayer.append(panel);
    if (!restorePanelState(panel)) {
      positionPanel(panel);
    }

    const resizeHandles = panel.querySelectorAll('.dock-activity-resize-handle');
    const titlebar = panel.querySelector('.dock-activity-titlebar');

    const closeButton = panel.querySelector('[data-action="close"]');
    const minimizeButton = panel.querySelector('[data-action="minimize"]');
    const openButton = panel.querySelector('[data-action="open"]');

    closeButton?.addEventListener('click', () => {
      closePanel(panel);
    });

    minimizeButton?.addEventListener('click', () => {
      panel.classList.add('dock-activity-minimized');
      if (panel.dataset.href) {
        callbacks?.onMinimize?.(panel.dataset.href);
      }
      window.setTimeout(() => {
        panel.classList.add('hidden');
        panel.classList.remove('dock-activity-minimized', 'dock-activity-fullscreen');
        setLayerVisibility();
      }, minimizeDuration);
    });

    openButton?.addEventListener('click', () => {
      if (!panel.dataset.href) return;
      panel.classList.add('dock-activity-fullscreen');
      window.setTimeout(() => {
        window.location.assign(panel.dataset.href as string);
      }, openDuration);
    });

    const startDrag = (event: PointerEvent) => {
      if (panel.classList.contains('dock-activity-fullscreen')) return;
      if ((event.target as HTMLElement | null)?.closest('.dock-control')) return;
      event.preventDefault();
      bringToFront(panel);
      const rect = panel.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = rect.left;
      const startTop = rect.top;
      let latestX = startX;
      let latestY = startY;
      let rafId: number | null = null;

      const applyMove = () => {
        const deltaX = latestX - startX;
        const deltaY = latestY - startY;
        const nextLeft = clamp(
          startLeft + deltaX,
          windowPadding,
          window.innerWidth - rect.width - windowPadding,
        );
        const nextTop = clamp(
          startTop + deltaY,
          windowPadding,
          window.innerHeight - rect.height - windowPadding,
        );
        panel.style.left = `${nextLeft}px`;
        panel.style.top = `${nextTop}px`;
        rafId = null;
      };

      const handleMove = (moveEvent: PointerEvent) => {
        latestX = moveEvent.clientX;
        latestY = moveEvent.clientY;
        if (!rafId) {
          rafId = requestAnimationFrame(applyMove);
        }
      };

      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        persistPanelState(panel);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    };

    const startResize = (event: PointerEvent) => {
      if (panel.classList.contains('dock-activity-fullscreen')) return;
      const direction = (event.target as HTMLElement | null)?.dataset.resize;
      if (!direction) return;
      event.preventDefault();
      bringToFront(panel);
      const rect = panel.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = rect.left;
      const startTop = rect.top;
      const startWidth = rect.width;
      const startHeight = rect.height;
      let latestX = startX;
      let latestY = startY;
      let rafId: number | null = null;

      const applyResize = () => {
        const deltaX = latestX - startX;
        const deltaY = latestY - startY;
        let nextWidth = startWidth;
        let nextHeight = startHeight;
        let nextLeft = startLeft;
        let nextTop = startTop;

        if (direction.includes('e')) {
          nextWidth = clamp(startWidth + deltaX, minActivityWidth, window.innerWidth - startLeft - windowPadding);
        }
        if (direction.includes('s')) {
          nextHeight = clamp(startHeight + deltaY, minActivityHeight, window.innerHeight - startTop - windowPadding);
        }
        if (direction.includes('w')) {
          const maxWidth = startWidth + (startLeft - windowPadding);
          nextWidth = clamp(startWidth - deltaX, minActivityWidth, maxWidth);
          nextLeft = clamp(startLeft + deltaX, windowPadding, startLeft + startWidth - minActivityWidth);
        }
        if (direction.includes('n')) {
          const maxHeight = startHeight + (startTop - windowPadding);
          nextHeight = clamp(startHeight - deltaY, minActivityHeight, maxHeight);
          nextTop = clamp(startTop + deltaY, windowPadding, startTop + startHeight - minActivityHeight);
        }

        panel.style.left = `${nextLeft}px`;
        panel.style.top = `${nextTop}px`;
        panel.style.width = `${nextWidth}px`;
        panel.style.height = `${nextHeight}px`;
        rafId = null;
      };

      const handleMove = (moveEvent: PointerEvent) => {
        latestX = moveEvent.clientX;
        latestY = moveEvent.clientY;
        if (!rafId) {
          rafId = requestAnimationFrame(applyResize);
        }
      };

      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        persistPanelState(panel);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    };

    if (titlebar) {
      titlebar.addEventListener('pointerdown', startDrag as EventListener);
    }
    resizeHandles.forEach((handle) =>
      (handle as HTMLElement).addEventListener('pointerdown', startResize as EventListener),
    );
    panel.addEventListener('pointerdown', () => bringToFront(panel));

    return panel;
  };

  const open = (item: ActivityItem) => {
    if (!activityLayer) return;
    const existing = activityLayer.querySelector(`.dock-activity-window[data-href="${item.href}"]`) as HTMLElement | null;
    if (existing) {
      const isMinimized = existing.classList.contains('dock-activity-minimized');
      const isHidden = existing.classList.contains('hidden');
      const isVisible = !isHidden && !isMinimized;
      if (isVisible) {
        hidePanel(existing);
        return;
      }
      revealPanel(existing);
      return;
    }
    buildWindow(item);
    setLayerVisibility();
    callbacks?.onOpen?.(item);
  };

  const closeAll = () => {
    if (!activityLayer) return;
    activityLayer.querySelectorAll('.dock-activity-window').forEach((panel) => panel.remove());
    setLayerVisibility();
  };

  const bindLayerEvents = () => {
    onLayerDblClick = (event: MouseEvent) => {
      const panel = (event.target as HTMLElement | null)?.closest('.dock-activity-window') as HTMLElement | null;
      if (!panel?.dataset.href) return;
      window.location.assign(panel.dataset.href);
    };

    onLayerClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement | null)?.closest('.dock-activity-window')) return;
      if ((event.target as HTMLElement | null)?.closest('#mac-dock')) return;
      closeAll();
    };

    onCloseTopActivity = () => {
      closeTopVisiblePanel();
    };

    if (activityLayer && onLayerDblClick) {
      activityLayer.addEventListener('dblclick', onLayerDblClick);
    }
    if (activityLayer && onLayerClick) {
      activityLayer.addEventListener('click', onLayerClick);
    }
    if (onCloseTopActivity) {
      window.addEventListener('dock:close-top-activity', onCloseTopActivity);
    }
  };

  bindLayerEvents();

  const destroy = () => {
    if (activityLayer && onLayerDblClick) {
      activityLayer.removeEventListener('dblclick', onLayerDblClick);
    }
    if (activityLayer && onLayerClick) {
      activityLayer.removeEventListener('click', onLayerClick);
    }
    if (onCloseTopActivity) {
      window.removeEventListener('dock:close-top-activity', onCloseTopActivity);
    }
    onLayerDblClick = null;
    onLayerClick = null;
    onCloseTopActivity = null;
    closeAll();
  };

  return {
    open,
    destroy,
  };
};
