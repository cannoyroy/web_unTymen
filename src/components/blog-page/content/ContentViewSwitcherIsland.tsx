import { useEffect } from "preact/hooks";
import { BLOG_EVENTS, type BlogViewChangedDetail } from "../events";

type ViewName = "article" | "moment" | "note";

interface Props {
  defaultView?: ViewName;
}

const VIEW_IDS: Record<ViewName, string> = {
  article: "article-view",
  moment: "moment-view",
  note: "note-view",
};

const ALL_VIEWS: ViewName[] = ["article", "moment", "note"];

const STORAGE_KEY = "blog-current-view";

const ContentViewSwitcherIsland = ({ defaultView = "article" }: Props) => {
  useEffect(() => {
    const getStoredView = (): ViewName => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored && ALL_VIEWS.includes(stored as ViewName)) {
          return stored as ViewName;
        }
      } catch (error) {
        console.warn("Failed to read view from sessionStorage:", error);
      }
      return defaultView;
    };

    const setStoredView = (view: ViewName) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, view);
      } catch (error) {
        console.warn("Failed to write view to sessionStorage:", error);
      }
    };

    const applyView = (view: ViewName, persist = false) => {
      ALL_VIEWS.forEach((name) => {
        const section = document.getElementById(VIEW_IDS[name]);
        if (!section) return;
        section.classList.toggle("hidden", name !== view);
      });
      if (persist) setStoredView(view);
    };

    const initialView = getStoredView();
    applyView(initialView);

    const onViewChanged = (event: Event) => {
      const custom = event as CustomEvent<BlogViewChangedDetail>;
      const next = custom.detail?.view;
      if (!next || !ALL_VIEWS.includes(next as ViewName)) return;
      applyView(next as ViewName, true);
    };

    window.addEventListener(BLOG_EVENTS.viewChanged, onViewChanged as EventListener);
    return () => {
      window.removeEventListener(
        BLOG_EVENTS.viewChanged,
        onViewChanged as EventListener,
      );
    };
  }, [defaultView]);

  return null;
};

export default ContentViewSwitcherIsland;
