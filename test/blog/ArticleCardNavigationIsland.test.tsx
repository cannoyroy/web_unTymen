import { fireEvent, render } from "@testing-library/preact";
import { vi } from "vitest";
import ArticleCardNavigationIsland from "../../src/components/blog-page/content/ArticleCardNavigationIsland";

describe("ArticleCardNavigationIsland", () => {
  const installLocalStorage = () => {
    const store = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
        setItem: (key: string, value: string) => {
          store.set(key, String(value));
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
        clear: () => {
          store.clear();
        },
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        get length() {
          return store.size;
        },
      },
    });
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    installLocalStorage();
    document.body.innerHTML = `
      <article data-post-card data-post-url="/posts/post-1/" data-post-title="Post One">
        <h3><a href="/posts/post-1/">Post One</a></h3>
        <button class="article-tag-btn" data-tag="tech">#tech</button>
      </article>
    `;
  });

  it("navigates on card click and writes dock opened item", () => {
    const navigateSpy = vi.fn();

    render(
      <ArticleCardNavigationIsland
        cardSelector="[data-post-card]"
        tagButtonSelector=".article-tag-btn"
        onNavigate={navigateSpy}
      />,
    );

    fireEvent.click(document.querySelector("[data-post-card]") as HTMLElement);

    expect(navigateSpy).toHaveBeenCalledWith("/posts/post-1/");
    const stored = JSON.parse(window.localStorage.getItem("dock-opened-items") || "[]");
    expect(stored[0]).toMatchObject({
      href: "/posts/post-1/",
      label: "Post One",
    });
  });

  it("does not navigate when ctrl/meta-clicking a tag", () => {
    const navigateSpy = vi.fn();

    render(
      <ArticleCardNavigationIsland
        cardSelector="[data-post-card]"
        tagButtonSelector=".article-tag-btn"
        onNavigate={navigateSpy}
      />,
    );

    fireEvent.click(document.querySelector(".article-tag-btn") as HTMLElement, {
      ctrlKey: true,
    });
    fireEvent.click(document.querySelector(".article-tag-btn") as HTMLElement, {
      metaKey: true,
    });

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
