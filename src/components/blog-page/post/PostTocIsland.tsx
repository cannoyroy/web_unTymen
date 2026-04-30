import { useEffect } from "preact/hooks";

const ACTIVE_LINK_CLASSES = ["border-slate-900", "text-slate-900", "font-semibold", "bg-white/65"];
const INACTIVE_LINK_CLASSES = ["border-transparent", "text-slate-500", "font-normal", "bg-transparent"];

const PostTocIsland = () => {
  useEffect(() => {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("[data-post-toc-link][data-target-id]"),
    );
    if (!links.length) return;

    const entries = links
      .map((link) => {
        const id = link.dataset.targetId;
        if (!id) return null;
        const section = document.getElementById(id);
        if (!section) return null;
        return { id, link, section };
      })
      .filter((entry): entry is { id: string; link: HTMLAnchorElement; section: HTMLElement } => !!entry);

    if (!entries.length) return;

    let activeId = "";
    const visibility = new Map<string, number>();

    const paintActive = (id: string) => {
      if (activeId === id) return;
      activeId = id;
      entries.forEach((entry) => {
        const isActive = entry.id === activeId;
        entry.link.classList.remove(...(isActive ? INACTIVE_LINK_CLASSES : ACTIVE_LINK_CLASSES));
        entry.link.classList.add(...(isActive ? ACTIVE_LINK_CLASSES : INACTIVE_LINK_CLASSES));
        if (isActive) {
          entry.link.setAttribute("aria-current", "true");
        } else {
          entry.link.removeAttribute("aria-current");
        }
      });
    };

    paintActive(entries[0].id);

    const observer = new IntersectionObserver(
      (observerEntries) => {
        observerEntries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const id = target.id;
          if (!id) return;
          visibility.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let nextId = activeId;
        let bestRatio = -1;
        entries.forEach((entry) => {
          const ratio = visibility.get(entry.id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            nextId = entry.id;
          }
        });

        if (bestRatio <= 0) {
          const fromTop = entries.find((entry) => entry.section.getBoundingClientRect().top >= 120);
          nextId = fromTop?.id ?? entries[entries.length - 1].id;
        }

        paintActive(nextId);
      },
      {
        root: null,
        threshold: [0.15, 0.3, 0.5, 0.75],
        rootMargin: "-15% 0px -55% 0px",
      },
    );

    entries.forEach((entry) => observer.observe(entry.section));

    const clickHandlers = entries.map((entry) => {
      const handler = (event: Event) => {
        event.preventDefault();
        const y = entry.section.getBoundingClientRect().top + window.scrollY - 92;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        window.history.replaceState(null, "", `#${entry.id}`);
      };
      entry.link.addEventListener("click", handler);
      return { link: entry.link, handler };
    });

    return () => {
      observer.disconnect();
      clickHandlers.forEach(({ link, handler }) => link.removeEventListener("click", handler));
    };
  }, []);

  return null;
};

export default PostTocIsland;
