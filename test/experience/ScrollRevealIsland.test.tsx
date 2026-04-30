import { render } from "@testing-library/preact";
import ScrollRevealIsland from "../../src/components/experience-page/ScrollRevealIsland";

describe("ScrollRevealIsland", () => {
  it("toggles classes on intersecting elements", () => {
    document.body.innerHTML = `
      <div class="reveal opacity-0 translate-y-2"></div>
      <div class="reveal opacity-0 translate-y-2"></div>
    `;

    let callback: ((entries: IntersectionObserverEntry[], io?: IntersectionObserver) => void) | null = null;

    class MockIntersectionObserver {
      cb: (entries: IntersectionObserverEntry[], io?: IntersectionObserver) => void;
      constructor(cb: (entries: IntersectionObserverEntry[], io?: IntersectionObserver) => void) {
        this.cb = cb;
        callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    Object.defineProperty(window, "IntersectionObserver", {
      value: MockIntersectionObserver,
      configurable: true,
    });
    Object.defineProperty(globalThis, "IntersectionObserver", {
      value: MockIntersectionObserver,
      configurable: true,
    });

    // render with zero stagger so toggles happen immediately in tests
    render(<ScrollRevealIsland staggerMs={0} />);

    const items = Array.from(document.querySelectorAll(".reveal")) as HTMLElement[];
    // simulate the observer callback for the first element, providing a mock observer
    const mockIo = { unobserve() {}, observe() {}, disconnect() {} } as unknown as IntersectionObserver;
    callback?.([{ target: items[0], isIntersecting: true } as IntersectionObserverEntry], mockIo);

    expect(items[0].classList.contains("opacity-100")).toBe(true);
    expect(items[0].classList.contains("translate-y-0")).toBe(true);
  });
});
