import { render } from "@testing-library/preact";
import TimelineRevealIsland from "../../src/components/index-page/timeline/TimelineRevealIsland";

describe("TimelineRevealIsland", () => {
  it("reveals intersected timeline entries", () => {
    document.body.innerHTML = `
      <article class="reveal-entry opacity-0 translate-y-8"></article>
    `;

    let callback:
      | ((entries: IntersectionObserverEntry[]) => void)
      | null = null;

    class MockIntersectionObserver {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
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

    render(<TimelineRevealIsland />);

    const target = document.querySelector(".reveal-entry") as HTMLElement;
    callback?.([{ target, isIntersecting: true } as IntersectionObserverEntry]);

    expect(target.classList.contains("opacity-100")).toBe(true);
    expect(target.classList.contains("translate-y-0")).toBe(true);
  });
});
