const createDockMarkup = (currentPath: string, pageTitle = "Post") => `
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-70 hidden md:block">
    <div class="dock-sensor h-24 w-full"></div>
    <nav id="mac-dock" data-dock='${JSON.stringify({ pageTitle, currentPath })}'>
      <ul class="dock-left">
        <li class="dock-item" data-action="back-to-top"><a href="#top">Top</a></li>
        <li class="dock-item" data-action="theme-toggle"><a href="#">Theme</a></li>
      </ul>
      <div class="dock-divider"></div>
      <ul class="dock-right"></ul>
    </nav>
  </div>
  <div id="dock-activity" class="dock-activity hidden">
    <template id="dock-activity-template">
      <div class="dock-activity-window">
        <div class="dock-activity-titlebar">
          <button data-action="close" type="button"></button>
          <button data-action="minimize" type="button"></button>
          <button data-action="open" type="button"></button>
          <p class="dock-activity-title"></p>
        </div>
        <iframe class="dock-activity-frame"></iframe>
        <div class="dock-activity-resize-handles">
          <span class="dock-activity-resize-handle" data-resize="n"></span>
        </div>
      </div>
    </template>
  </div>
`;

describe("dock bootstrap", () => {
  const installLocalStorage = () => {
    const store = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
        setItem: (key: string, value: string) => {
          store.set(key, String(value));
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
        clear: () => {
          store.clear();
        },
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        get length() {
          return store.size;
        },
      },
    });
  };

  beforeEach(() => {
    vi.resetModules();
    installLocalStorage();
    document.documentElement.className = "";
    document.documentElement.setAttribute("data-theme", "light");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  it("adds current post item to dock on posts routes", async () => {
    document.body.innerHTML = createDockMarkup("/posts/post-1/");
    const { bootstrapDock } = await import("../../src/components/shared/dock/index.ts");

    bootstrapDock();

    const removable = document.querySelector('.dock-right .dock-item[data-removable="true"]') as HTMLElement | null;
    expect(removable).not.toBeNull();
    expect(removable?.dataset.href).toBe("/posts/post-1/");

    const stored = JSON.parse(window.localStorage.getItem("dock-opened-items") || "[]");
    expect(stored[0]?.href).toBe("/posts/post-1/");
  });

  it("rebinds actions on astro page transitions without duplicate handlers", async () => {
    const scrollSpy = vi.fn();
    Object.defineProperty(window, "scrollTo", { writable: true, value: scrollSpy });
    document.body.innerHTML = createDockMarkup("/posts/post-2/");
    const { bootstrapDock } = await import("../../src/components/shared/dock/index.ts");

    bootstrapDock();
    (document.querySelector('[data-action="back-to-top"] a') as HTMLAnchorElement).click();
    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem("theme")).toBeNull();
    (document.querySelector('[data-action="theme-toggle"] a') as HTMLAnchorElement).click();
    expect(window.localStorage.getItem("theme")).toBe("dark");

    document.body.innerHTML = createDockMarkup("/posts/post-3/");
    document.dispatchEvent(new Event("astro:page-load"));
    (document.querySelector('[data-action="back-to-top"] a') as HTMLAnchorElement).click();
    expect(scrollSpy).toHaveBeenCalledTimes(2);

    document.dispatchEvent(new Event("astro:page-load"));
    (document.querySelector('[data-action="back-to-top"] a') as HTMLAnchorElement).click();
    expect(scrollSpy).toHaveBeenCalledTimes(3);
  });
});
