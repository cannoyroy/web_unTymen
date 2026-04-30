import { useEffect } from "preact/hooks";

const TimelineRevealIsland = () => {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal-entry"));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("opacity-0", "translate-y-8");
          entry.target.classList.add("opacity-100", "translate-y-0");
          observer.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.15 },
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return null;
};

export default TimelineRevealIsland;
