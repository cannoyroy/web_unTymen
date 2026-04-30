export const initTerminalCommands = ({
  terminalInput,
  terminalOutput,
  dock,
  closeOverlay,
  navigateTo,
  setThemePreference,
  pushLine,
}) => {
  if (!terminalInput) {
    return {
      getHistory: () => [],
      cleanup: () => {},
    };
  }

  let lastSearchResults = [];
  const notesKey = 'terminal-notes';
  const historyKey = 'terminal-history';
  const aiHistoryKey = 'terminal-ai-history';
  const aiThreadKey = 'terminal-ai-thread-id';
  const aiMaxMessages = 20;
  // Shared command history used by arrow navigation and "Last session" preview.
  const history = JSON.parse(window.localStorage.getItem(historyKey) || '[]');
  let historyIndex = -1;

  const showHelp = () => {
    pushLine('Commands:');
    pushLine('  help                 Show all commands', 'dim');
    pushLine('  help <cmd>            Show command usage', 'dim');
    pushLine('  home                 Go to Home', 'dim');
    pushLine("  blog                 Go to unTymen's blog", 'dim');
    pushLine('  about                Go to About', 'dim');
    pushLine('  theme dark|light|auto Switch theme', 'dim');
    pushLine('  theme toggle          Toggle theme', 'dim');
    pushLine('  open <url>            Open a URL', 'dim');
    pushLine('  search <keyword>      Filter posts by keyword', 'dim');
    pushLine('  search tags <tag>     Filter posts by tag', 'dim');
    pushLine('  notes                Show quick notes', 'dim');
    pushLine('  notes add <text>      Add a note', 'dim');
    pushLine('  notes clear           Clear all notes', 'dim');
    pushLine('  draft <title>         New draft template', 'dim');
    pushLine('  post <title>          New post template', 'dim');
    pushLine('  links                Show common links', 'dim');
    pushLine('  export               Download terminal output', 'dim');
    pushLine('  toggle dock          Show/hide dock', 'dim');
    pushLine('  profile              Show profile info', 'dim');
    pushLine('  version              Show app version', 'dim');
    pushLine('  clear                Clear terminal output', 'dim');
    pushLine('  clear-history        Clear all command history', 'dim');
    pushLine('  ai ask <question>    Ask AI assistant', 'dim');
    pushLine('  ai history           Show AI chat history', 'dim');
    pushLine('  ai reset             Clear AI chat context', 'dim');
    pushLine('  ai help              Show AI command usage', 'dim');
    pushLine('  !<n>                 Re-run history item', 'dim');
    pushLine('  reset-layout         Clear saved window layout', 'dim');
    pushLine('  reload               Reload current page', 'dim');
    pushLine('  status               Show page status', 'dim');
    pushLine('  exit                 Close terminal', 'dim');
  };

  const showHelpFor = (cmd) => {
    switch (cmd) {
      case 'help':
        pushLine('help [command] - show command list or usage', 'dim');
        break;
      case 'home':
        pushLine('home - go to Home', 'dim');
        break;
      case 'blog':
        pushLine("blog - go to unTymen's blog", 'dim');
        break;
      case 'about':
        pushLine('about - go to About', 'dim');
        break;
      case 'theme':
        pushLine('theme dark|light|auto|toggle - switch theme', 'dim');
        break;
      case 'open':
        pushLine('open <url> - open a URL', 'dim');
        break;
      case 'search':
        pushLine('search <keyword> - list matching posts', 'dim');
        pushLine('search tags <tag> - list posts by tag', 'dim');
        break;
      case 'notes':
        pushLine('notes - show quick notes', 'dim');
        pushLine('notes add <text> - add a note', 'dim');
        pushLine('notes clear - clear all notes', 'dim');
        break;
      case 'draft':
        pushLine('draft <title> - output draft template', 'dim');
        break;
      case 'post':
        pushLine('post <title> - output post template', 'dim');
        break;
      case 'links':
        pushLine('links - show common links', 'dim');
        break;
      case 'export':
        pushLine('export - download terminal output', 'dim');
        break;
      case 'toggle':
        pushLine('toggle dock - show/hide dock', 'dim');
        break;
      case 'profile':
        pushLine('profile - show profile info', 'dim');
        break;
      case 'version':
        pushLine('version - show app version', 'dim');
        break;
      case 'clear':
        pushLine('clear - clear terminal output', 'dim');
        break;
      case 'ai':
        pushLine('ai ask <question> - ask AI assistant with context', 'dim');
        pushLine('ai history - show recent AI chat history', 'dim');
        pushLine('ai reset - clear AI chat context', 'dim');
        pushLine('ai help - show AI usage', 'dim');
        break;
      case 'reset-layout':
        pushLine('reset-layout - clear saved window layout', 'dim');
        break;
      case 'reload':
        pushLine('reload - reload current page', 'dim');
        break;
      case 'status':
        pushLine('status - show location, theme, online', 'dim');
        break;
      case 'exit':
        pushLine('exit - close terminal', 'dim');
        break;
      default:
        pushLine(`No help for "${cmd}".`, 'dim');
        break;
    }
  };

  const runSearch = async (keyword) => {
    if (!keyword) {
      pushLine('Usage: search <keyword>', 'error');
      return;
    }
    pushLine(`Searching for "${keyword}"...`, 'dim');
    try {
      const res = await fetch('/search.json');
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      const needle = keyword.toLowerCase();
      const matches = items
        .filter((item) => {
          const title = (item.title || '').toLowerCase();
          const description = (item.description || '').toLowerCase();
          const tags = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';
          return title.includes(needle) || description.includes(needle) || tags.includes(needle);
        })
        .slice(0, 6);
      renderSearchMatches(matches);
    } catch {
      lastSearchResults = [];
      pushLine('SearchIcon index-page not available.', 'error');
    }
  };

  const runTagSearch = async (tag) => {
    if (!tag) {
      pushLine('Usage: search tags <tag>', 'error');
      return;
    }
    pushLine(`Searching tag "${tag}"...`, 'dim');
    try {
      const res = await fetch('/search.json');
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      const needle = tag.toLowerCase();
      const matches = items
        .filter((item) => {
          const tags = Array.isArray(item.tags) ? item.tags : [];
          return tags.some((t) => t.toLowerCase() === needle);
        })
        .slice(0, 8);
      renderSearchMatches(matches);
    } catch {
      lastSearchResults = [];
      pushLine('SearchIcon index-page not available.', 'error');
    }
  };

  const readNotes = () => JSON.parse(window.localStorage.getItem(notesKey) || '[]');
  const readAiHistory = () => JSON.parse(window.localStorage.getItem(aiHistoryKey) || '[]');
  const writeAiHistory = (messages) => {
    window.localStorage.setItem(aiHistoryKey, JSON.stringify(messages.slice(-aiMaxMessages)));
  };
  const getAiThreadId = () => {
    const current = window.localStorage.getItem(aiThreadKey);
    if (current) return current;
    const generated = `thread-${window.crypto?.randomUUID?.() || Date.now()}`;
    window.localStorage.setItem(aiThreadKey, generated);
    return generated;
  };
  const resetAiSession = () => {
    window.localStorage.removeItem(aiHistoryKey);
    window.localStorage.removeItem(aiThreadKey);
  };

  const createStreamingLine = () => {
    if (!terminalOutput) return null;
    const li = document.createElement('li');
    li.classList.add('output');
    li.textContent = 'AI: ';
    terminalOutput.append(li);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    return li;
  };

  const parseSseChunk = (raw) => {
    const lines = raw.split('\n');
    let eventType = 'message';
    const dataLines = [];

    lines.forEach((line) => {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
        return;
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      }
    });

    let payload = {};
    try {
      payload = JSON.parse(dataLines.join('\n') || '{}');
    } catch {
      payload = {};
    }

    return { eventType, payload };
  };

  const runAiAsk = async (question) => {
    if (!question) {
      pushLine('Usage: ai ask <question>', 'error');
      return;
    }

    const historyMessages = readAiHistory();
    const nextMessages = [...historyMessages, { role: 'user', content: question }].slice(-aiMaxMessages);
    const streamLine = createStreamingLine();
    let fullAnswer = '';

    try {
      const compactHistory = nextMessages.slice(-6).map((message) => ({
        role: message.role,
        content: String(message.content || '').slice(0, 240),
      }));
      const params = new URLSearchParams({
        q: question,
        h: JSON.stringify(compactHistory),
      });
      const fallbackGetRequest = async () =>
        fetch(`/api/ai/chat?${params.toString()}`, {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-ai-question': question,
            'x-ai-history': JSON.stringify(compactHistory),
          },
        });

      const payload = {
        messages: nextMessages,
        threadId: getAiThreadId(),
        stream: true,
      };

      let response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 400) {
        let errorPayload = null;
        try {
          errorPayload = await response.json();
        } catch {
          errorPayload = null;
        }

        if (errorPayload?.error === 'Request body is empty.') {
          response = await fallbackGetRequest();

          if (response.ok) {
            const data = await response.json();
            const fallbackText = typeof data?.text === 'string' ? data.text : '';
            if (!fallbackText) {
              pushLine('AI returned an empty response.', 'error');
              return;
            }
            fullAnswer = fallbackText;
            if (streamLine) {
              streamLine.textContent = `AI: ${fullAnswer}`;
            } else {
              pushLine(`AI: ${fullAnswer}`);
            }
            writeAiHistory([...nextMessages, { role: 'assistant', content: fullAnswer }]);
            return;
          }
        }
      }

      if ([404, 405, 415, 501].includes(response.status)) {
        response = await fallbackGetRequest();
      }

      if (!response.ok) {
        let errorMessage = `AI request failed (${response.status})`;
        try {
          const errorPayload = await response.json();
          if (errorPayload?.error) {
            errorMessage = errorPayload.error;
          }
        } catch {
          // ignore parse failure and use fallback message
        }
        pushLine(errorMessage, 'error');
        return;
      }

      if (!response.body) {
        pushLine('AI stream is not available in this environment.', 'error');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        let markerIndex = buffer.indexOf('\n\n');
        while (markerIndex !== -1) {
          const rawEvent = buffer.slice(0, markerIndex);
          buffer = buffer.slice(markerIndex + 2);
          const { eventType, payload } = parseSseChunk(rawEvent);

          if (eventType === 'token') {
            const token = typeof payload?.text === 'string' ? payload.text : '';
            if (!token) {
              markerIndex = buffer.indexOf('\n\n');
              continue;
            }
            fullAnswer += token;
            if (streamLine) {
              streamLine.textContent = `AI: ${fullAnswer}`;
              terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
          } else if (eventType === 'error') {
            const message = typeof payload?.message === 'string' ? payload.message : 'AI stream failed.';
            throw new Error(message);
          }

          markerIndex = buffer.indexOf('\n\n');
        }
      }

      if (!fullAnswer) {
        pushLine('AI returned an empty response.', 'error');
        return;
      }

      writeAiHistory([...nextMessages, { role: 'assistant', content: fullAnswer }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI request failed.';
      pushLine(message, 'error');
    }
  };

  const runAiHistory = () => {
    const historyMessages = readAiHistory();
    if (!historyMessages.length) {
      pushLine('No AI history yet. Try: ai ask <question>', 'dim');
      return;
    }
    pushLine('AI history:', 'dim');
    historyMessages.slice(-10).forEach((message, index) => {
      const role = message.role || 'unknown';
      const content = (message.content || '').replace(/\s+/g, ' ').trim();
      const preview = content.length > 96 ? `${content.slice(0, 96)}...` : content;
      pushLine(`${index + 1}. [${role}] ${preview}`, 'dim');
    });
  };

  const runAiHelp = () => {
    pushLine('AI commands:', 'dim');
    pushLine('  ai ask <question>  Ask assistant with session memory', 'dim');
    pushLine('  ai history         Show recent chat context', 'dim');
    pushLine('  ai reset           Clear chat context', 'dim');
    pushLine('  ai help            Show this help', 'dim');
  };

  const renderSearchMatches = (matches) => {
    lastSearchResults = matches;
    if (!matches.length) {
      pushLine('No results.', 'dim');
      return;
    }
    matches.forEach((item) => {
      pushLine(`${item.title} -> ${item.url}`);
      if (item.description) {
        pushLine(`  ${item.description}`, 'dim');
      }
      if (Array.isArray(item.tags) && item.tags.length) {
        pushLine(`  #${item.tags.join(' #')}`, 'dim');
      }
    });
  };

  const writeNotes = (notes) => {
    window.localStorage.setItem(notesKey, JSON.stringify(notes.slice(-100)));
  };

  const showNotes = () => {
    const notes = readNotes();
    if (!notes.length) {
      pushLine('No notes yet. Use: notes add <text>', 'dim');
      return;
    }
    pushLine('Notes:', 'dim');
    const startIndex = Math.max(0, notes.length - 10);
    notes.slice(-10).forEach((note, index) => {
      pushLine(`${startIndex + index + 1}. ${note}`, 'dim');
    });
  };

  const generateTemplate = (kind, title) => {
    const date = new Date().toISOString().slice(0, 10);
    const safeTitle = title || 'Untitled';
    const template = [
      '---',
      `title: ${safeTitle}`,
      `date: ${date}`,
      'description: ',
      'tags: []',
      '---',
      '',
      '# ' + safeTitle,
      '',
      kind === 'draft' ? '> Draft notes here.' : 'Write here.',
      '',
    ].join('\n');
    pushLine(template);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(template).then(
        () => pushLine('Template copied to clipboard.', 'dim'),
        () => pushLine('Copy failed. Select and copy manually.', 'dim'),
      );
    }
  };

  const showLinks = () => {
    pushLine('Links:', 'dim');
    pushLine('Home -> /', 'dim');
    pushLine("unTymen's blog -> /blog/", 'dim');
    pushLine('About -> /about/', 'dim');
    pushLine('Tags -> /tags/', 'dim');
    pushLine('RSS -> /rss.xml', 'dim');
  };

  const exportOutput = () => {
    if (!terminalOutput) return;
    const lines = Array.from(terminalOutput.children).map((li) => li.textContent || '');
    if (!lines.length) {
      pushLine('Nothing to export.', 'dim');
      return;
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terminal-log-${stamp}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    pushLine('Exported terminal output.', 'dim');
  };

  const toggleDock = () => {
    const root = document.documentElement;
    const isHidden = root.classList.toggle('dock-hidden');
    window.localStorage.setItem('dock-hidden', isHidden ? '1' : '0');
    if (dock) {
      dock.style.opacity = isHidden ? '0' : '';
    }
    pushLine(isHidden ? 'Dock hidden.' : 'Dock shown.', 'dim');
  };

  const showProfile = () => {
    pushLine('Profile:', 'dim');
    pushLine(`title: ${document.title}`, 'dim');
    pushLine(`origin: ${window.location.origin}`, 'dim');
    const theme = window.localStorage.getItem('theme') || 'light';
    pushLine(`theme: ${theme}`, 'dim');
  };

  const showVersion = () => {
    pushLine('App version:', 'dim');
    pushLine(`build: ${document.lastModified}`, 'dim');
    pushLine(`runtime: ${navigator.userAgent}`, 'dim');
  };

  const executeCommand = (command, argument) => {
    // Central command router.
    switch (command.toLowerCase()) {
      case 'help':
        if (argument) {
          showHelpFor(argument);
        } else {
          showHelp();
        }
        break;
      case 'home':
        navigateTo('/');
        break;
      case 'blog':
        navigateTo('/blog/');
        break;
      case 'about':
        navigateTo('/about/');
        break;
      case 'theme':
        if (argument === 'dark' || argument === 'light' || argument === 'auto') {
          setThemePreference(argument);
          pushLine(`Theme set to ${argument}.`, 'dim');
        } else if (argument === 'toggle') {
          const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
          const next = currentTheme === 'dark' ? 'light' : 'dark';
          setThemePreference(next);
          pushLine(`Theme set to ${next}.`, 'dim');
        } else {
          pushLine('Usage: theme dark|light|auto|toggle', 'error');
        }
        break;
      case 'open':
        if (!argument) {
          pushLine('Usage: open <url>', 'error');
          break;
        }
        navigateTo(argument);
        break;
      case 'search':
        if (argument.startsWith('tags ')) {
          void runTagSearch(argument.slice(5).trim());
        } else {
          void runSearch(argument);
        }
        break;
      case 'notes': {
        const [sub, ...rest] = argument.split(' ');
        if (sub === 'add') {
          const note = rest.join(' ').trim();
          if (!note) {
            pushLine('Usage: notes add <text>', 'error');
            break;
          }
          const notes = readNotes();
          notes.push(note);
          writeNotes(notes);
          pushLine('Note saved.', 'dim');
          break;
        }
        if (sub === 'clear') {
          writeNotes([]);
          pushLine('Notes cleared.', 'dim');
          break;
        }
        showNotes();
        break;
      }
      case 'draft':
        generateTemplate('draft', argument);
        break;
      case 'post':
        generateTemplate('post', argument);
        break;
      case 'links':
        showLinks();
        break;
      case 'export':
        exportOutput();
        break;
      case 'toggle':
        if (argument === 'dock') {
          toggleDock();
        } else {
          pushLine('Usage: toggle dock', 'error');
        }
        break;
      case 'profile':
        showProfile();
        break;
      case 'version':
        showVersion();
        break;
      case 'clear':
        if (terminalOutput) terminalOutput.innerHTML = '';
        lastSearchResults = [];
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'status': {
        const theme = window.localStorage.getItem('theme') || 'light';
        pushLine(`path: ${window.location.pathname}`, 'dim');
        pushLine(`theme: ${theme}`, 'dim');
        pushLine(`online: ${navigator.onLine ? 'yes' : 'no'}`, 'dim');
        break;
      }
      case 'reset-layout':
        Object.keys(window.localStorage).forEach((key) => {
          if (key.startsWith('dock:panel:')) {
            window.localStorage.removeItem(key);
          }
        });
        pushLine('Layout reset. Reopen panels to re-center.', 'dim');
        break;
      case 'clear-history':
        history.length = 0;
        window.localStorage.removeItem(historyKey);
        pushLine('History cleared.', 'dim');
        break;
      case 'ai': {
        const [sub, ...rest] = argument.split(' ').filter(Boolean);
        if (!sub) {
          runAiHelp();
          break;
        }
        if (sub === 'ask') {
          void runAiAsk(rest.join(' ').trim());
          break;
        }
        if (sub === 'history') {
          runAiHistory();
          break;
        }
        if (sub === 'reset') {
          resetAiSession();
          pushLine('AI chat context cleared.', 'dim');
          break;
        }
        if (sub === 'help') {
          runAiHelp();
          break;
        }
        pushLine(`Unknown ai subcommand: ${sub}`, 'error');
        runAiHelp();
        break;
      }
      case 'exit':
        closeOverlay();
        break;
      default:
        pushLine(`Unknown command: ${command}`, 'error');
        pushLine('Type "help" to see available commands.', 'dim');
        break;
    }
  };

  const commands = [
    'help',
    'home',
    'blog',
    'about',
    'theme',
    'open',
    'search',
    'notes',
    'draft',
    'post',
    'links',
    'export',
    'toggle',
    'profile',
    'version',
    'clear',
    'reset-layout',
    'reload',
    'status',
    'exit',
    'clear-history',
    'ai',
  ];

  const completeInput = () => {
    const raw = terminalInput.value;
    const parts = raw.split(' ');
    if (parts.length === 0) return;
    const head = parts[0];
    if (!head) return;
    const matches = commands.filter((cmd) => cmd.startsWith(head));
    if (matches.length === 1) {
      parts[0] = matches[0];
      terminalInput.value = parts.join(' ');
    } else if (matches.length > 1) {
      pushLine(matches.join(' '), 'dim');
    }
  };

  // Single input handler: completion, history navigation, and command execution.
  const onInputKeydown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      completeInput();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = Math.min(historyIndex + 1, history.length - 1);
      terminalInput.value = history[history.length - 1 - historyIndex];
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = Math.max(historyIndex - 1, -1);
      terminalInput.value = historyIndex === -1 ? '' : history[history.length - 1 - historyIndex];
      return;
    }
    if (event.key !== 'Enter') return;

    const raw = terminalInput.value.trim();
    if (!raw) {
      if (lastSearchResults.length) {
        navigateTo(lastSearchResults[0].url);
      }
      return;
    }

    if (raw.startsWith('!')) {
      const idx = Number(raw.slice(1));
      if (Number.isInteger(idx) && idx >= 1 && idx <= history.length) {
        const cmdToRun = history[idx - 1];
        terminalInput.value = '';
        pushLine(`$ ${cmdToRun}`, 'command');
        const [cmd, ...rest] = cmdToRun.split(' ');
        const arg = rest.join(' ').trim();
        executeCommand(cmd, arg);
        return;
      }
      pushLine('Usage: !<n> (n from 1 to history length)', 'error');
      return;
    }

    history.push(raw);
    window.localStorage.setItem(historyKey, JSON.stringify(history.slice(-100)));
    historyIndex = -1;
    pushLine(`$ ${raw}`, 'command');
    terminalInput.value = '';
    const [cmd, ...rest] = raw.split(' ');
    const arg = rest.join(' ').trim();
    executeCommand(cmd, arg);
  };

  terminalInput.addEventListener('keydown', onInputKeydown);

  return {
    getHistory: () => history,
    cleanup: () => {
      terminalInput.removeEventListener('keydown', onInputKeydown);
    },
  };
};
