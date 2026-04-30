import { useEffect, useState } from "preact/hooks";

type SortOrder = "desc" | "asc";

interface Props {
  listId?: string;
  buttonId?: string;
}

const ArticleSortIsland = ({
  listId = "post-list",
  buttonId = "sort-toggle-btn",
}: Props) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const button = document.getElementById(buttonId);
    const list = document.getElementById(listId);
    if (!button || !list) return;

    const sortCards = () => {
      const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-post-date]"));
      if (cards.length === 0) return;

      cards.sort((a, b) => {
        const dateA = a.getAttribute("data-post-date") || "";
        const dateB = b.getAttribute("data-post-date") || "";
        return sortOrder === "desc"
          ? dateB.localeCompare(dateA)
          : dateA.localeCompare(dateB);
      });

      cards.forEach((card) => list.appendChild(card));
    };

    const handleClick = () => {
      setSortOrder((prev) => {
        const next = prev === "desc" ? "asc" : "desc";
        return next;
      });
    };

    button.addEventListener("click", handleClick);
    return () => {
      button.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    const list = document.getElementById(listId);
    if (!list) return;

    const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-post-date]"));
    if (cards.length === 0) return;

    cards.sort((a, b) => {
      const dateA = a.getAttribute("data-post-date") || "";
      const dateB = b.getAttribute("data-post-date") || "";
      return sortOrder === "desc"
        ? dateB.localeCompare(dateA)
        : dateA.localeCompare(dateB);
    });

    cards.forEach((card) => list.appendChild(card));

    // Update button icon direction
    const button = document.getElementById(buttonId);
    if (button) {
      const icon = button.querySelector("svg");
      if (icon) {
        icon.style.transform = sortOrder === "asc" ? "rotate(180deg)" : "rotate(0deg)";
        icon.style.transition = "transform 0.2s ease";
      }
    }
  }, [sortOrder]);

  return null;
};

export default ArticleSortIsland;
