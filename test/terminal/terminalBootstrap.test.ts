const createTerminalMarkup = () => `
  <div id="shortcut-overlay" class="hidden" aria-hidden="true">
    <div class="shortcut-modal">
      <div id="terminal-panel" class="hidden">
        <div class="shortcut-titlebar"></div>
        <div class="terminal-resize-handle" data-resize="e"></div>
        <ul id="terminal-output"></ul>
        <input id="terminal-input" />
      </div>
    </div>
  </div>
  <button data-action="terminal">Terminal</button>
  <nav id="mac-dock"></nav>
`;

describe("terminal bootstrap", () => {
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
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  it("opens terminal from dock action trigger", async () => {
    document.body.innerHTML = createTerminalMarkup();
    const { bootstrapTerminalModal } = await import("../../src/components/shared/terminal/terminalModal.js");

    bootstrapTerminalModal();
    (document.querySelector('[data-action="terminal"]') as HTMLButtonElement).click();

    const overlay = document.getElementById("shortcut-overlay") as HTMLElement;
    expect(overlay.classList.contains("hidden")).toBe(false);
    expect(overlay.getAttribute("aria-hidden")).toBe("false");
  });

  it("rebinds after astro page-load without duplicate keydown handlers", async () => {
    document.body.innerHTML = createTerminalMarkup();
    const { bootstrapTerminalModal } = await import("../../src/components/shared/terminal/terminalModal.js");

    bootstrapTerminalModal();
    (document.querySelector('[data-action="terminal"]') as HTMLButtonElement).click();
    let input = document.getElementById("terminal-input") as HTMLInputElement;
    let output = document.getElementById("terminal-output") as HTMLUListElement;
    input.value = "status";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(output.textContent).toContain("$ status");

    document.body.innerHTML = createTerminalMarkup();
    document.dispatchEvent(new Event("astro:page-load"));
    (document.querySelector('[data-action="terminal"]') as HTMLButtonElement).click();
    input = document.getElementById("terminal-input") as HTMLInputElement;
    output = document.getElementById("terminal-output") as HTMLUListElement;
    input.value = "status";
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(output.textContent).toContain("$ status");

    const commandEntries = Array.from(output.children).filter((item) =>
      (item.textContent || "").trim() === "$ status",
    );
    expect(commandEntries).toHaveLength(1);
  });
});
