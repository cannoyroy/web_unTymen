import { tokenizeCodeLine } from "../../src/components/about-page/resume/tokenizeCodeLine";

describe("tokenizeCodeLine", () => {
  it("classifies core token types for go-like code", () => {
    const tokens = tokenizeCodeLine(
      'var Projects = []Project{ // resume data',
    );
    expect(tokens.some((token) => token.type === "kw" && token.value === "var")).toBe(
      true,
    );
    expect(
      tokens.some((token) => token.type === "type" && token.value === "Projects"),
    ).toBe(true);
    expect(tokens.some((token) => token.type === "type" && token.value === "Project")).toBe(
      true,
    );
    expect(tokens.some((token) => token.type === "comment")).toBe(true);
  });

  it("detects string and numeric tokens", () => {
    const tokens = tokenizeCodeLine('Title: "Dimensional Debris", Version: 2');
    expect(tokens.some((token) => token.type === "str")).toBe(true);
    expect(tokens.some((token) => token.type === "num" && token.value === "2")).toBe(
      true,
    );
  });
});
