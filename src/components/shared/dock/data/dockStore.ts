import { createDockStorage } from './dockStorage.js';
import { normalizeHref } from './dockUtils.js';

// Item shape used by dock right list and activity window.
export type ActivityItem = {
  label: string;
  href: string;
  icon?: string;
};

// Build a removable dock item element for the right list.
const createDockItem = (item: ActivityItem, onRemove: (href: string) => void) => {
  const li = document.createElement('li');
  li.className = 'dock-item group relative';
  li.dataset.href = item.href;
  li.dataset.label = item.label;
  li.dataset.removable = 'true';

  const anchor = document.createElement('a');
  anchor.href = item.href;
  anchor.className = 'tooltip tooltip-top block';
  anchor.dataset.tip = item.label;
  anchor.setAttribute('aria-label', item.label);

  const iconWrap = document.createElement('span');
  iconWrap.className = 'dock-icon flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg transition-all duration-200 ease-out group-hover:scale-[1.2] group-hover:shadow-2xl';
  const icon = document.createElement('span');
  icon.className = 'h-6 w-6';
  icon.innerHTML = item.icon || '';
  iconWrap.append(icon);
  anchor.append(iconWrap);
  li.append(anchor);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'dock-remove btn btn-xs btn-circle btn-error absolute -right-1 -top-1 hidden border-0 text-[10px] text-white group-hover:flex';
  close.setAttribute('aria-label', `关闭 ${item.label}`);
  close.title = `关闭 ${item.label}`;
  close.textContent = '×';
  close.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onRemove(item.href);
  });
  li.append(close);

  return li;
};

// Dock store manages right-list state, persistence, and DOM rendering.
type DockStoreOptions = {
  storagePrefix?: string;
  onAdd?: (item: ActivityItem) => void;
  onRemove?: (href: string) => void;
};

export const createDockStore = (rightList: HTMLElement | null, options: DockStoreOptions = {}) => {
  const storage = createDockStorage(options.storagePrefix);
  const removeDomItem = (href: string) => {
    if (!rightList) return;
    rightList.querySelectorAll('.dock-item').forEach((item) => {
      const element = item as HTMLElement;
      if (element.dataset.href === href) {
        element.remove();
      }
    });
  };

  const renderItems = (items: ActivityItem[]) => {
    if (!rightList) return;
    rightList.querySelectorAll('.dock-item[data-removable="true"]').forEach((item) => item.remove());
    if (items.length === 0) return;
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.prepend(createDockItem(item, removeItem)));
    rightList.prepend(fragment);
  };

  const getItems = () => storage.readOpenedItems();

  const addItem = (entry: ActivityItem) => {
    const normalizedHref = normalizeHref(entry.href);
    const normalizedEntry = { ...entry, href: normalizedHref };
    const deduped = [normalizedEntry, ...storage.readOpenedItems().filter((item) => item.href !== normalizedHref)].slice(0, 5);
    storage.writeOpenedItems(deduped);
    if (rightList && !rightList.querySelector(`.dock-item[data-href="${normalizedHref}"]`)) {
      rightList.prepend(createDockItem(normalizedEntry, removeItem));
    }
    options.onAdd?.(normalizedEntry);
  };

  const removeItem = (href: string) => {
    if (!href) return;
    const normalizedHref = normalizeHref(href);
    const updatedItems = storage.readOpenedItems().filter((openedItem) => openedItem.href !== normalizedHref);
    storage.writeOpenedItems(updatedItems);
    removeDomItem(normalizedHref);
    options.onRemove?.(normalizedHref);
  };

  return {
    renderItems,
    addItem,
    removeItem,
    getItems,
  };
};
