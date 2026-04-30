import { initTerminalInteraction } from './terminalInteraction.js';
import { initTerminalCommands } from './terminalCommands.js';
import { initTheme, setThemePreference } from '../../../scripts/theme/themeManager.ts';

const initTerminalModal = () => {
  const overlay = document.getElementById('shortcut-overlay');
  const terminalPanel = document.getElementById('terminal-panel');
  const terminalModal = document.querySelector('.shortcut-modal');
  const terminalTitlebar = document.querySelector('.shortcut-titlebar');
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const titlebars = document.querySelectorAll('.shortcut-titlebar');
  const dock = document.querySelector('#mac-dock');

  if (!overlay || !terminalPanel || !terminalModal) {
    return () => {};
  }

  const updateClock = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    titlebars.forEach((bar) => bar.setAttribute('data-clock', time));
  };

  const openOverlay = (panel) => {
    overlay.classList.add('flex');
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    panel?.classList.add('flex');
    panel?.classList.remove('hidden');
  };

  const closeOverlay = () => {
    overlay.classList.remove('flex');
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    terminalPanel.classList.remove('flex');
    terminalPanel.classList.add('hidden');
  };

  const navigateTo = (path) => {
    window.location.assign(path);
  };

  const pushLine = (text, type = 'output') => {
    if (!terminalOutput) return;
    const li = document.createElement('li');
    li.textContent = text;
    li.classList.add(type);
    terminalOutput.append(li);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  const pushClickable = (label, command) => {
    if (!terminalOutput || !terminalInput) return;
    const li = document.createElement('li');
    li.classList.add('dim');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      terminalInput.value = command;
      terminalInput.focus();
    });
    li.append(btn);
    terminalOutput.append(li);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  initTheme();
  updateClock();
  const clockTimer = window.setInterval(updateClock, 30000);

  const cleanupInteraction = initTerminalInteraction(terminalModal, terminalTitlebar);
  const commandRuntime = initTerminalCommands({
    terminalInput,
    terminalOutput,
    dock,
    closeOverlay,
    navigateTo,
    setThemePreference,
    pushLine,
  });

  const openTerminal = () => {
    openOverlay(terminalPanel);
    const history = commandRuntime.getHistory();
    if (terminalOutput && terminalOutput.children.length === 0 && history.length) {
      pushLine('Last session:', 'dim');
      history.slice(-5).forEach((entry, index) => {
        const idx = history.length - 5 + index + 1;
        pushClickable(`${idx}. ${entry}`, entry);
      });
    }
    terminalInput?.focus();
  };

  const onOverlayClick = (event) => {
    if (event.target === overlay) closeOverlay();
  };

  const onDocumentClick = (event) => {
    const trigger = event.target?.closest?.('[data-action="terminal"]');
    if (!trigger) return;
    event.preventDefault();
    openTerminal();
  };

  const onTerminalOpen = () => openTerminal();
  const onTerminalClose = () => closeOverlay();

  overlay.addEventListener('click', onOverlayClick);
  document.addEventListener('click', onDocumentClick);
  window.addEventListener('terminal:open', onTerminalOpen);
  window.addEventListener('terminal:close', onTerminalClose);

  return () => {
    window.clearInterval(clockTimer);
    overlay.removeEventListener('click', onOverlayClick);
    document.removeEventListener('click', onDocumentClick);
    window.removeEventListener('terminal:open', onTerminalOpen);
    window.removeEventListener('terminal:close', onTerminalClose);
    cleanupInteraction?.();
    commandRuntime.cleanup?.();
  };
};

let cleanupTerminal = null;
let pageLoadBound = false;

const mountTerminalModal = () => {
  cleanupTerminal?.();
  cleanupTerminal = initTerminalModal();
};

export const bootstrapTerminalModal = () => {
  mountTerminalModal();
  if (pageLoadBound) return;
  pageLoadBound = true;
  document.addEventListener('astro:page-load', mountTerminalModal);
};
