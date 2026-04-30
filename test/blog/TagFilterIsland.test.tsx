import { fireEvent, render } from "@testing-library/preact";
import TagFilterIsland, {
  matchesTagFilter,
} from "../../src/components/blog-page/content/TagFilterIsland";

describe("matchesTagFilter", () => {
  it("supports exact and nested tag matching", () => {
    expect(matchesTagFilter("tech|tech/astro|life", "tech")).toBe(true);
    expect(matchesTagFilter("tech|tech/astro|life", "tech/astro")).toBe(true);
    expect(matchesTagFilter("tech|tech/astro|life", "design")).toBe(false);
  });
});

describe("TagFilterIsland", () => {
  it("filters cards by tag and restores on clear", () => {
    document.body.innerHTML = `
      <button class="article-tag-btn" data-tag="tech">tech</button>
      <button id="article-clear-tag-filter-empty">clear</button>
      <article data-post-card data-tags="tech|tech/astro"></article>
      <article data-post-card data-tags="life"></article>
      <div id="article-empty-state" class="hidden"></div>
    `;

    render(
      <TagFilterIsland
        tagButtonSelector=".article-tag-btn"
        cardSelector="[data-post-card]"
        emptyStateId="article-empty-state"
        clearButtonIds={["article-clear-tag-filter-empty"]}
      />,
    );

    const [firstCard, secondCard] = Array.from(
      document.querySelectorAll<HTMLElement>("[data-post-card]"),
    );
    const tagButton = document.querySelector(".article-tag-btn") as HTMLElement;
    const clearButton = document.getElementById(
      "article-clear-tag-filter-empty",
    ) as HTMLElement;

    fireEvent.click(tagButton);
    expect(firstCard.classList.contains("hidden")).toBe(false);
    expect(secondCard.classList.contains("hidden")).toBe(true);

    fireEvent.click(clearButton);
    expect(firstCard.classList.contains("hidden")).toBe(false);
    expect(secondCard.classList.contains("hidden")).toBe(false);
  });

  it("does not filter on plain click in modifier mode", () => {
    document.body.innerHTML = `
      <button class="article-tag-btn" data-tag="tech">tech</button>
      <article data-post-card data-tags="tech"></article>
      <article data-post-card data-tags="life"></article>
      <div id="article-empty-state" class="hidden"></div>
    `;

    render(
      <TagFilterIsland
        tagButtonSelector=".article-tag-btn"
        cardSelector="[data-post-card]"
        emptyStateId="article-empty-state"
        clearButtonIds={[]}
        tagClickMode="modifier"
      />,
    );

    const [firstCard, secondCard] = Array.from(
      document.querySelectorAll<HTMLElement>("[data-post-card]"),
    );
    const tagButton = document.querySelector(".article-tag-btn") as HTMLElement;

    fireEvent.click(tagButton);
    expect(firstCard.classList.contains("hidden")).toBe(false);
    expect(secondCard.classList.contains("hidden")).toBe(false);
  });

  it("filters on ctrl/meta click in modifier mode", () => {
    document.body.innerHTML = `
      <button class="article-tag-btn" data-tag="tech">tech</button>
      <article data-post-card data-tags="tech"></article>
      <article data-post-card data-tags="life"></article>
      <div id="article-empty-state" class="hidden"></div>
    `;

    render(
      <TagFilterIsland
        tagButtonSelector=".article-tag-btn"
        cardSelector="[data-post-card]"
        emptyStateId="article-empty-state"
        clearButtonIds={[]}
        tagClickMode="modifier"
      />,
    );

    const [firstCard, secondCard] = Array.from(
      document.querySelectorAll<HTMLElement>("[data-post-card]"),
    );
    const tagButton = document.querySelector(".article-tag-btn") as HTMLElement;

    fireEvent.click(tagButton, { ctrlKey: true });
    expect(firstCard.classList.contains("hidden")).toBe(false);
    expect(secondCard.classList.contains("hidden")).toBe(true);
  });
});
