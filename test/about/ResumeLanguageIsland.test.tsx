import { fireEvent, render } from "@testing-library/preact";
import ResumeLanguageIsland from "../../src/components/about-page/resume/ResumeLanguageIsland";

describe("ResumeLanguageIsland", () => {
  it("defaults to go when localStorage has no language", () => {
    document.body.innerHTML = `
      <span id="resume-tab-name"></span>
      <select id="resume-language">
        <option value="python">Python</option>
        <option value="go">Go</option>
        <option value="zh">Chinese</option>
      </select>
      <div data-lang-sidebar="python" class="sidebar-lang-panel"></div>
      <div data-lang-sidebar="go" class="sidebar-lang-panel"></div>
      <div data-lang-sidebar="zh" class="sidebar-lang-panel"></div>
      <div data-lang-code="python" class="code-lang-panel"></div>
      <div data-lang-code="go" class="code-lang-panel"></div>
      <div data-lang-code="zh" class="code-lang-panel"></div>
    `;

    const storage = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
      configurable: true,
    });

    render(<ResumeLanguageIsland />);

    const tabName = document.getElementById("resume-tab-name") as HTMLElement;
    const languageSelect = document.getElementById(
      "resume-language",
    ) as HTMLSelectElement;
    const goSidebar = document.querySelector(
      "[data-lang-sidebar='go']",
    ) as HTMLElement;
    const goCode = document.querySelector("[data-lang-code='go']") as HTMLElement;

    expect(tabName.textContent).toBe("resume.go");
    expect(languageSelect.value).toBe("go");
    expect(goSidebar.classList.contains("is-active")).toBe(true);
    expect(goCode.classList.contains("is-active")).toBe(true);
  });

  it("loads language from localStorage and updates view on change", () => {
    document.body.innerHTML = `
      <span id="resume-tab-name"></span>
      <select id="resume-language">
        <option value="python">Python</option>
        <option value="go">Go</option>
        <option value="zh">Chinese</option>
      </select>
      <div data-lang-sidebar="python" class="sidebar-lang-panel"></div>
      <div data-lang-sidebar="go" class="sidebar-lang-panel"></div>
      <div data-lang-sidebar="zh" class="sidebar-lang-panel"></div>
      <div data-lang-code="python" class="code-lang-panel"></div>
      <div data-lang-code="go" class="code-lang-panel"></div>
      <div data-lang-code="zh" class="code-lang-panel"></div>
    `;

    const storage = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
      configurable: true,
    });

    window.localStorage.setItem("about:resume-language", "go");
    render(<ResumeLanguageIsland />);

    const tabName = document.getElementById("resume-tab-name") as HTMLElement;
    const languageSelect = document.getElementById(
      "resume-language",
    ) as HTMLSelectElement;
    const pythonSidebar = document.querySelector(
      "[data-lang-sidebar='python']",
    ) as HTMLElement;
    const goSidebar = document.querySelector(
      "[data-lang-sidebar='go']",
    ) as HTMLElement;

    expect(tabName.textContent).toBe("resume.go");
    expect(languageSelect.value).toBe("go");
    expect(goSidebar.classList.contains("is-active")).toBe(true);
    expect(pythonSidebar.classList.contains("is-active")).toBe(false);

    fireEvent.change(languageSelect, { target: { value: "python" } });
    expect(tabName.textContent).toBe("resume.py");
    expect(window.localStorage.getItem("about:resume-language")).toBe("python");
  });
});
