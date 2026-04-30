import { useEffect } from "preact/hooks";

interface Props {
  tagButtonSelector: string;
  cardSelector: string;
  emptyStateId: string;
  clearButtonIds: string[];
  activeTagPanelId?: string;
  activeTagNameId?: string;
  includeSidebarTagState?: boolean;
  tagClickMode?: "click" | "modifier";
}

export const matchesTagFilter = (rawTags: string, tag: string) => {
  if (!tag) return true;
  const tags = rawTags.split("|").filter(Boolean);
  return tags.some((value) => value === tag || value.startsWith(`${tag}/`));
};

const TagFilterIsland = ({
  tagButtonSelector,
  cardSelector,
  emptyStateId,
  clearButtonIds,
  activeTagPanelId,
  activeTagNameId,
  includeSidebarTagState = false,
  tagClickMode = "click",
}: Props) => {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(cardSelector));
    const emptyState = document.getElementById(emptyStateId);
    const activeTagPanel = activeTagPanelId
      ? document.getElementById(activeTagPanelId)
      : null;
    const activeTagName = activeTagNameId
      ? document.getElementById(activeTagNameId)
      : null;

    const applyFilter = (tag: string) => {
      let visibleCount = 0;

      cards.forEach((card) => {
        const rawTags = card.getAttribute("data-tags") || "";
        const matched = matchesTagFilter(rawTags, tag);
        card.classList.toggle("hidden", !matched);
        if (matched) visibleCount += 1;
      });

      if (activeTagPanel && activeTagName) {
        const hasTag = Boolean(tag);
        activeTagPanel.classList.toggle("hidden", !hasTag);
        activeTagPanel.classList.toggle("flex", hasTag);
        if (hasTag) activeTagName.textContent = `#${tag}`;
      }

      if (emptyState) {
        const isEmpty = visibleCount === 0;
        emptyState.classList.toggle("hidden", !isEmpty);
        emptyState.classList.toggle("flex", isEmpty);
      }

      if (includeSidebarTagState) {
        document.querySelectorAll<HTMLElement>(".tag-item").forEach((item) => {
          const isActive = item.getAttribute("data-tag-group") === tag;
          item.classList.toggle("tag-active", isActive);
          item.classList.toggle("text-base-content/70", !isActive);
          item.classList.toggle("hover:bg-base-200/50", !isActive);
        });
      }
    };

    const onTagButtonClick = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const shouldFilter =
        tagClickMode === "click" ||
        (tagClickMode === "modifier" &&
          (mouseEvent.ctrlKey || mouseEvent.metaKey));
      if (!shouldFilter) return;
      event.preventDefault();
      event.stopPropagation();
      const target = event.currentTarget as HTMLElement;
      applyFilter(target.getAttribute("data-tag") || "");
    };

    const onSidebarTagClick = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      applyFilter(target.getAttribute("data-tag") || "");
    };

    const onClear = () => applyFilter("");

    const tagButtons = Array.from(
      document.querySelectorAll<HTMLElement>(tagButtonSelector),
    );
    const sidebarButtons = Array.from(
      document.querySelectorAll<HTMLElement>(".tag-nav-btn"),
    );
    const clearButtons = clearButtonIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    tagButtons.forEach((button) =>
      button.addEventListener("click", onTagButtonClick),
    );
    sidebarButtons.forEach((button) =>
      button.addEventListener("click", onSidebarTagClick),
    );
    clearButtons.forEach((button) => button.addEventListener("click", onClear));

    return () => {
      tagButtons.forEach((button) =>
        button.removeEventListener("click", onTagButtonClick),
      );
      sidebarButtons.forEach((button) =>
        button.removeEventListener("click", onSidebarTagClick),
      );
      clearButtons.forEach((button) =>
        button.removeEventListener("click", onClear),
      );
    };
  }, [
    tagButtonSelector,
    cardSelector,
    emptyStateId,
    clearButtonIds,
    activeTagPanelId,
    activeTagNameId,
    includeSidebarTagState,
    tagClickMode,
  ]);

  return null;
};

export default TagFilterIsland;
