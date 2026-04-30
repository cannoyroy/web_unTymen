// Dock orchestration: wiring store, visibility, actions, and activity windows.
import { createDockStore } from '../data/dockStore.js';
import { createDockVisibility } from './dockVisibility.js';
import { createActivityManager } from './dockActivity.js';
import { bindDockActions } from './dockActions.js';
import { normalizeHref } from '../data/dockUtils.js';

type DockPayload = {
  pageTitle: string;
  currentPath: string;
};

const articleIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 3.75h7.9L19.5 8.35V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2Z" fill="currentColor" fill-opacity=".15"/><path d="M14.75 3.75V8.5h4.75M7 3.75h7.9L19.5 8.35V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 10.5h7M8.5 13.5h7M8.5 16.5h4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

type DockInitOptions = {
  storagePrefix?: string;
};

export const initDock = (selector = '#mac-dock', options: DockInitOptions = {}) => {
  if (window.localStorage.getItem('dock-hidden') === '1') {
    document.documentElement.classList.add('dock-hidden');
  }

  const dock = document.querySelector(selector) as HTMLElement | null;
  if (!dock) return () => {};
  if (dock.dataset.dockInitialized === '1') return () => {};
  dock.dataset.dockInitialized = '1';

  // Setup reveal zone for hidden dock
  const revealZone = document.querySelector('.dock-reveal-zone') as HTMLElement | null;
  const showToastOnce = () => {
    const toastShown = window.localStorage.getItem('dock-reveal-toast-shown');
    if (!toastShown) {
      window.localStorage.setItem('dock-reveal-toast-shown', '1');
      // Dispatch event to show toast
      window.dispatchEvent(new CustomEvent('dock:show-reveal-hint'));
    }
  };

  if (revealZone) {
    revealZone.addEventListener('mouseenter', () => {
      if (document.documentElement.classList.contains('dock-hidden')) {
        document.documentElement.classList.remove('dock-hidden');
        showToastOnce();
      }
    });
  }

  const payload = JSON.parse(dock.dataset.dock || '{}') as DockPayload;
  const rightList = dock.querySelector('.dock-right') as HTMLElement | null;
  const activityLayer = document.querySelector('#dock-activity') as HTMLElement | null;
  const activityTemplate = document.querySelector('#dock-activity-template') as HTMLTemplateElement | null;

  const storagePrefix = options.storagePrefix || dock.dataset.storagePrefix || 'dock';
  const emit = (name: string, detail?: Record<string, unknown>) => {
    dock.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
  };

  const store = createDockStore(rightList, {
    storagePrefix,
    onAdd: (item) => emit('dock:add', { item }),
    onRemove: (href) => emit('dock:remove', { href }),
  });
  const activity = createActivityManager(dock, activityLayer, activityTemplate, store.removeItem, {
    storagePrefix,
    callbacks: {
      onOpen: (item) => emit('dock:open', { item }),
      onClose: (href) => emit('dock:close', { href }),
      onMinimize: (href) => emit('dock:minimize', { href }),
    },
  });

  const cleanupVisibility = createDockVisibility(dock);
  const cleanupActions = bindDockActions(dock);

  const isSystemPath = ['/', '/blog/', '/about/'].includes(payload.currentPath);
  const isBlogPostPath = /^\/posts\/.+/.test(payload.currentPath);

  if (!isSystemPath && isBlogPostPath && payload.currentPath) {
    store.addItem({
      label: payload.pageTitle || document.title || 'Article',
      href: payload.currentPath,
      icon: articleIcon,
    });
  }

  store.renderItems(store.getItems());

  const onDockClick = (event: Event) => {
    const anchor = (event.target as HTMLElement | null)?.closest('.dock-item a') as HTMLAnchorElement | null;
    if (!anchor) return;
    const listItem = anchor.closest('.dock-item') as HTMLElement | null;
    if (!listItem || listItem.dataset.removable !== 'true') return;
    event.preventDefault();
    activity.open({
      href: normalizeHref(anchor.getAttribute('href') || ''),
      label: listItem.dataset.label || 'Article',
    });
  };

  dock.addEventListener('click', onDockClick);

  return () => {
    dock.removeEventListener('click', onDockClick);
    cleanupActions?.();
    cleanupVisibility?.();
    activity.destroy?.();
    delete dock.dataset.dockInitialized;
  };
};
