import { useEffect } from "preact/hooks";

const SectionTocMobileIsland = () => {
  useEffect(() => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-toc-toggle]');
    const panel = document.querySelector<HTMLElement>('[data-toc-panel]');
    const closeBtn = document.querySelector<HTMLButtonElement>('[data-toc-close]');
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
    if (!toggle || !panel) return;

    const openClass = ['fixed', 'inset-0', 'z-50', 'p-4', 'overflow-auto', 'bg-white/90', 'dark:bg-black/80'];

    let previousActive: HTMLElement | null = null;

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = panel.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    const onOpen = () => {
      toggle.setAttribute('aria-expanded', 'true');
      panel.classList.remove('hidden');
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.add(...openClass);
      // basic focus management: save previous and move focus to panel
      previousActive = document.activeElement as HTMLElement | null;
      panel.setAttribute('tabindex', '-1');
      panel.focus();
      document.addEventListener('keydown', trapFocus);
      document.addEventListener('keydown', onEscape);
    };

    const onClose = () => {
      toggle.setAttribute('aria-expanded', 'false');
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
      panel.classList.remove(...openClass);
      panel.removeAttribute('tabindex');
      document.removeEventListener('keydown', trapFocus);
      document.removeEventListener('keydown', onEscape);
      if (previousActive) previousActive.focus();
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const onToggle = () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) onClose(); else onOpen();
    };

    const onLinkClick = () => {
      // close panel on link click (mobile)
      onClose();
    };

    toggle.addEventListener('click', onToggle);
    closeBtn?.addEventListener('click', onClose);
    links.forEach((l) => l.addEventListener('click', onLinkClick));

    return () => {
      toggle.removeEventListener('click', onToggle);
      closeBtn?.removeEventListener('click', onClose);
      links.forEach((l) => l.removeEventListener('click', onLinkClick));
      document.removeEventListener('keydown', trapFocus);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  return null;
};

export default SectionTocMobileIsland;
