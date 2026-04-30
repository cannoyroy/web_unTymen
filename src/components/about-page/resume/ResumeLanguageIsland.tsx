import { useEffect } from "preact/hooks";

type ResumeLanguage = "python" | "go" | "zh";

const STORAGE_KEY = "about:resume-language";
const TAB_NAME_BY_LANG: Record<ResumeLanguage, string> = {
  python: "resume.py",
  go: "resume.go",
  zh: "resume.zh-CN",
};
const DEFAULT_LANGUAGE: ResumeLanguage = "go";

const isResumeLanguage = (value: string): value is ResumeLanguage =>
  value === "python" || value === "go" || value === "zh";

const ResumeLanguageIsland = () => {
  useEffect(() => {
    const languageSelect = document.getElementById(
      "resume-language",
    ) as HTMLSelectElement | null;
    const tabName = document.getElementById("resume-tab-name");
    const sidebarPanels = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lang-sidebar]"),
    );
    const codePanels = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lang-code]"),
    );

    const applyLanguage = (rawLang: string) => {
      const lang: ResumeLanguage = isResumeLanguage(rawLang)
        ? rawLang
        : DEFAULT_LANGUAGE;
      sidebarPanels.forEach((panel) => {
        const panelLang = panel.getAttribute("data-lang-sidebar");
        panel.classList.toggle("is-active", panelLang === lang);
      });
      codePanels.forEach((panel) => {
        const panelLang = panel.getAttribute("data-lang-code");
        panel.classList.toggle("is-active", panelLang === lang);
      });
      if (tabName) tabName.textContent = TAB_NAME_BY_LANG[lang];
      if (languageSelect) languageSelect.value = lang;
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // no-op for environments where storage is unavailable
      }
    };

    let initialLanguage: ResumeLanguage = DEFAULT_LANGUAGE;
    try {
      const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
      if (savedLanguage && isResumeLanguage(savedLanguage)) {
        initialLanguage = savedLanguage;
      }
    } catch {
      // keep default
    }

    applyLanguage(initialLanguage);

    const onChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      applyLanguage(target.value);
    };

    languageSelect?.addEventListener("change", onChange);

    return () => {
      languageSelect?.removeEventListener("change", onChange);
    };
  }, []);

  return null;
};

export default ResumeLanguageIsland;
