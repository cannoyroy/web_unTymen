import { useEffect } from "preact/hooks";
import { createDockStorage } from "../../shared/dock/data/dockStorage";
import { normalizeHref } from "../../shared/dock/data/dockUtils";

interface Props {
  cardSelector?: string;
  tagButtonSelector?: string;
  onNavigate?: (url: string) => void;
}

const MAX_DOCK_ITEMS = 5;

const ArticleCardNavigationIsland = ({
  cardSelector = "[data-post-card]",
  tagButtonSelector = ".article-tag-btn",
  onNavigate = (url: string) => window.location.assign(url),
}: Props) => {
  useEffect(() => {
    const storage = createDockStorage();

    const writeDockItem = (href: string, label: string) => {
      const normalizedHref = normalizeHref(href);
      const deduped = [
        { href: normalizedHref, label },
        ...storage.readOpenedItems().filter((item) => item.href !== normalizedHref),
      ].slice(0, MAX_DOCK_ITEMS);
      storage.writeOpenedItems(deduped);
    };

    const onClick = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as HTMLElement | null;
      const card = target?.closest(cardSelector) as HTMLElement | null;
      if (!card) return;

      const tagButton = target?.closest(tagButtonSelector);
      if (tagButton && (mouseEvent.ctrlKey || mouseEvent.metaKey)) {
        return;
      }

      const interactive = target?.closest(
        "button,input,select,textarea,summary,label,[role='button']",
      );
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (interactive && !tagButton && !anchor) return;

      const postUrl = card.dataset.postUrl;
      if (!postUrl) return;

      mouseEvent.preventDefault();
      const label = card.dataset.postTitle || "Article";
      writeDockItem(postUrl, label);
      onNavigate(postUrl);
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, [cardSelector, tagButtonSelector, onNavigate]);

  return null;
};

export default ArticleCardNavigationIsland;
