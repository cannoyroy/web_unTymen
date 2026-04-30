import { useEffect, useRef } from "preact/hooks";
import { BLOG_EVENTS } from "../events";

interface Props {
  inputId?: string;
  cardSelector?: string;
  emptyStateId?: string;
  articleViewId?: string;
}

const BlogSearchIsland = ({
  inputId = "blog-search-input",
  cardSelector = "[data-post-card]",
  emptyStateId = "article-empty-state",
  articleViewId = "article-view",
}: Props) => {
  const searchRef = useRef<string>("");

  useEffect(() => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (!input) return;

    const applySearch = (query: string) => {
      const normalizedQuery = query.trim().toLowerCase();
      searchRef.current = normalizedQuery;

      const articleView = document.getElementById(articleViewId);
      if (!articleView) return;

      // Only apply search when article view is visible
      if (articleView.classList.contains("hidden")) return;

      const cards = articleView.querySelectorAll<HTMLElement>(cardSelector);
      let visibleCount = 0;

      cards.forEach((card) => {
        if (!normalizedQuery) {
          card.classList.remove("hidden");
          visibleCount++;
          return;
        }

        const title = card.getAttribute("data-post-title") || "";
        const tags = card.getAttribute("data-tags") || "";
        const description = card.querySelector("p")?.textContent || "";

        const matchTitle = title.toLowerCase().includes(normalizedQuery);
        const matchTags = tags.toLowerCase().includes(normalizedQuery);
        const matchDescription = description.toLowerCase().includes(normalizedQuery);

        const isMatch = matchTitle || matchTags || matchDescription;
        card.classList.toggle("hidden", !isMatch);
        if (isMatch) visibleCount++;
      });

      // Toggle empty state
      const emptyState = document.getElementById(emptyStateId);
      if (emptyState) {
        emptyState.classList.toggle("hidden", visibleCount > 0);
      }

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent(BLOG_EVENTS.searchQueryChanged, {
          detail: { query: normalizedQuery },
        })
      );
    };

    const handleInput = () => {
      applySearch(input.value);
    };

    const handleViewChange = (event: Event) => {
      const custom = event as CustomEvent;
      const view = custom.detail?.view;
      if (view === "article") {
        applySearch(input.value);
      } else {
        // Clear search when leaving article view
        applySearch("");
      }
    };

    input.addEventListener("input", handleInput);
    window.addEventListener(BLOG_EVENTS.viewChanged, handleViewChange);

    return () => {
      input.removeEventListener("input", handleInput);
      window.removeEventListener(BLOG_EVENTS.viewChanged, handleViewChange);
    };
  }, []);

  return null;
};

export default BlogSearchIsland;
