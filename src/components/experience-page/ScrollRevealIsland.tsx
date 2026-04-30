import { useEffect } from "preact/hooks";

interface Props {
  selector?: string;
  rootMargin?: string;
  threshold?: number;
  staggerMs?: number;
}

const ScrollRevealIsland = ({ selector = ".reveal", rootMargin = "0px 0px -10% 0px", threshold = 0.15, staggerMs = 60 }: Props) => {
  useEffect(() => {
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      // Remove reveal class and ensure visible
      const elems = Array.from(document.querySelectorAll<HTMLElement>(selector));
      elems.forEach((el) => {
        el.classList.remove("reveal");
        el.classList.add("opacity-100", "translate-y-0");
      });
      return;
    }

    const elems = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!elems.length) return;

    const observer = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const index = elems.indexOf(el);

          const apply = () => {
            el.classList.remove("opacity-0", "translate-y-2");
            el.classList.add("opacity-100", "translate-y-0");
          };

          if (staggerMs > 0) {
            setTimeout(() => apply(), index * staggerMs);
          } else {
            apply();
          }

          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin, threshold }
    );

    elems.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector, rootMargin, threshold, staggerMs]);

  return null;
};

export default ScrollRevealIsland;

