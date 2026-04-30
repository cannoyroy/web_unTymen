// Storage shapes for dock items and activity window positions.
export interface DockEntry {
  label: string;
  href: string;
  icon?: string;
}

export interface PanelState {
  left: number;
  top: number;
  width: number;
  height: number;
}

const defaultPrefix = 'dock';

// Create a storage adapter to support multiple dock instances.
export const createDockStorage = (prefix = defaultPrefix) => {
  const openedItemsKey = `${prefix}-opened-items`;
  const panelKey = (href: string) => `${prefix}:panel:${href}`;

  const readOpenedItems = (): DockEntry[] => {
    return JSON.parse(window.localStorage.getItem(openedItemsKey) || '[]');
  };

  const writeOpenedItems = (items: DockEntry[]) => {
    window.localStorage.setItem(openedItemsKey, JSON.stringify(items));
  };

  const readPanelState = (href: string): PanelState | null => {
    if (!href) return null;
    const stored = window.localStorage.getItem(panelKey(href));
    if (!stored) return null;
    try {
      return JSON.parse(stored) as PanelState;
    } catch {
      return null;
    }
  };

  const writePanelState = (href: string, state: PanelState) => {
    if (!href) return;
    window.localStorage.setItem(panelKey(href), JSON.stringify(state));
  };

  return {
    readOpenedItems,
    writeOpenedItems,
    readPanelState,
    writePanelState,
  };
};

// Backward-compatible default storage helpers.
export const {
  readOpenedItems,
  writeOpenedItems,
  readPanelState,
  writePanelState,
} = createDockStorage();
