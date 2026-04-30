import {
  aboutCodePanelsByLang,
  aboutSidebarByLang,
  defaultAboutLanguage,
} from "../../src/data/about";

describe("about data contract", () => {
  it("uses go as default language", () => {
    expect(defaultAboutLanguage).toBe("go");
  });

  it("keeps sidebar and code panels aligned by language", () => {
    const sidebarKeys = Object.keys(aboutSidebarByLang).sort();
    const codeKeys = Object.keys(aboutCodePanelsByLang).sort();
    expect(codeKeys).toEqual(sidebarKeys);
  });

  it("contains go-oriented resume blocks", () => {
    const goLines = aboutCodePanelsByLang.go.flatMap((block) => block.lines);
    expect(goLines.some((line) => line.includes("package profile"))).toBe(true);
    expect(goLines.some((line) => line.includes("type Candidate struct"))).toBe(
      true,
    );
    expect(goLines.some((line) => line.includes("var Projects = []Project"))).toBe(
      true,
    );
  });

  it("keeps each language panel non-empty", () => {
    Object.values(aboutCodePanelsByLang).forEach((blocks) => {
      expect(blocks.length).toBeGreaterThan(0);
      blocks.forEach((block) => {
        expect(block.lines.length).toBeGreaterThan(0);
      });
    });
  });
});
