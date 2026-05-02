// Lazy-loaded client-side Mermaid renderer.
// remark-mermaid converts ```mermaid blocks to <pre class="mermaid">...</pre>;
// this script picks them up at runtime and renders SVG via mermaid.js.
// Mermaid (~200KB) is only fetched on pages that actually contain diagrams.

type MermaidModule = typeof import("mermaid").default;

const SOURCE_ATTR = "data-mermaid-source";

let mermaidPromise: Promise<MermaidModule> | null = null;
let initialized = false;

function currentTheme(): "dark" | "default" {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "default";
}

async function getMermaid(): Promise<MermaidModule> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => m.default);
  }
  return mermaidPromise;
}

function configure(mermaid: MermaidModule) {
  mermaid.initialize({
    startOnLoad: false,
    theme: currentTheme(),
    securityLevel: "loose",
  });
}

async function renderAll() {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>("pre.mermaid"),
  );
  if (nodes.length === 0) return;

  const mermaid = await getMermaid();
  if (!initialized) {
    configure(mermaid);
    initialized = true;
  }

  for (const el of nodes) {
    // Stash source on first sight; restore on re-render (e.g. theme change).
    if (!el.hasAttribute(SOURCE_ATTR)) {
      el.setAttribute(SOURCE_ATTR, el.textContent ?? "");
    } else {
      el.textContent = el.getAttribute(SOURCE_ATTR) ?? "";
    }
    el.removeAttribute("data-processed");
  }

  try {
    await mermaid.run({ nodes });
  } catch (err) {
    console.error("[mermaid] render failed", err);
  }
}

document.addEventListener("astro:page-load", () => {
  void renderAll();
});

window.addEventListener("theme:changed", async () => {
  if (!initialized) return;
  const mermaid = await getMermaid();
  configure(mermaid);
  void renderAll();
});
