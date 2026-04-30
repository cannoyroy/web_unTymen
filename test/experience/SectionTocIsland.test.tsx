import { render } from "@testing-library/preact";
import SectionTocIsland from "../../src/components/experience-page/SectionTocIsland";

describe("SectionTocIsland", () => {
  it("updates active TOC link on intersection and handles click scroll", () => {
    document.body.innerHTML = `
      <nav>
        <a href="#research" data-toc-link data-target-id="research" class="inline-flex w-full border-l-2 border-transparent py-1.5 pl-3 text-sm text-slate-500"></a>
        <a href="#projects" data-toc-link data-target-id="projects" class="inline-flex w-full border-l-2 border-transparent py-1.5 pl-3 text-sm text-slate-500"></a>
      </nav>
      <section id="research" data-experience-section="research" style="height: 200px;">research</section>
      <section id="projects" data-experience-section="projects" style="height: 200px;">projects</section>
    `;

    let callback: ((entries: IntersectionObserverEntry[]) => void) | null = null;

    class MockIntersectionObserver {
      cb: (entries: IntersectionObserverEntry[]) => void;
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
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

    render(<SectionTocIsland />);

    const researchLink = document.querySelector<HTMLAnchorElement>("[data-target-id=research]")!;
    const projectsLink = document.querySelector<HTMLAnchorElement>("[data-target-id=projects]")!;
    const researchSection = document.getElementById("research")!;

    // Simulate intersection for research
    callback?.([
      { target: researchSection, isIntersecting: true, intersectionRatio: 0.6 } as IntersectionObserverEntry,
    ]);

    expect(researchLink.getAttribute("aria-current")).toBe("true");
    expect(researchLink.classList.contains("border-slate-900")).toBe(true);

    // Test click handling: spy on scrollIntoView
    let scrolled = false;
    researchSection.scrollIntoView = () => {
      scrolled = true;
    };

    researchLink.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(scrolled).toBe(true);
  });
});

