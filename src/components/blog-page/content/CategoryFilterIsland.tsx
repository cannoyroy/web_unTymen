import { useEffect, useRef } from "preact/hooks";

interface Props {
  cardSelector?: string;
  buttonSelector?: string;
  activeCategoryId?: string;
  defaultCategory?: string;
}

const CategoryFilterIsland = ({
  cardSelector = "[data-post-card]",
  buttonSelector = ".category-nav-btn",
  activeCategoryId = "article-active-category",
  defaultCategory = "ALL",
}: Props) => {
  const currentCategoryRef = useRef(defaultCategory);

  useEffect(() => {
    const applyFilter = (category: string) => {
      currentCategoryRef.current = category;

      const cards = document.querySelectorAll<HTMLElement>(cardSelector);
      let visibleCount = 0;

      cards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category") || "";
        const match = category === "ALL" || cardCategory === category;
        card.classList.toggle("hidden", !match);
        if (match) visibleCount++;
      });

      // Update active button state
      document.querySelectorAll<HTMLElement>(buttonSelector).forEach((btn) => {
        const btnCategory = btn.getAttribute("data-category") || "";
        const isActive = btnCategory === category;
        btn.classList.toggle("active", isActive);
        btn.classList.toggle("bg-[var(--app-accent)]", isActive);
        btn.classList.toggle("text-[var(--app-accent-contrast)]", isActive);
        btn.classList.toggle("text-base-content/70", !isActive);
        btn.classList.toggle("hover:bg-base-200/50", !isActive);
      });

      // Update header category display
      const activeCategoryEl = document.getElementById(activeCategoryId);
      if (activeCategoryEl) {
        activeCategoryEl.textContent = category === "ALL" ? "" : category;
      }
    };

    const onButtonClick = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      const category = target.getAttribute("data-category") || defaultCategory;
      applyFilter(category);
    };

    const buttons = Array.from(
      document.querySelectorAll<HTMLElement>(buttonSelector),
    );

    buttons.forEach((btn) => btn.addEventListener("click", onButtonClick));

    // Apply default filter on mount
    applyFilter(defaultCategory);

    return () => {
      buttons.forEach((btn) => btn.removeEventListener("click", onButtonClick));
    };
  }, [cardSelector, buttonSelector, activeCategoryId, defaultCategory]);

  return null;
};

export default CategoryFilterIsland;
