export const initTerminalInteraction = (terminalModal, terminalTitlebar) => {
  if (!terminalModal) return () => {};

  const handles = terminalModal.querySelectorAll('.terminal-resize-handle');
  const minWidth = 420;
  const minHeight = 360;

  let interaction = null;
  let pointerX = 0;
  let pointerY = 0;
  let rafId = 0;

  const scheduleApply = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      applyInteraction();
    });
  };

  const applyInteraction = () => {
    if (!interaction) return;

    const deltaX = pointerX - interaction.startX;
    const deltaY = pointerY - interaction.startY;

    if (interaction.mode === 'drag') {
      terminalModal.style.left = `${interaction.startLeft + deltaX}px`;
      terminalModal.style.top = `${interaction.startTop + deltaY}px`;
      terminalModal.style.transform = 'translate(0, 0)';
      return;
    }

    let nextWidth = interaction.startWidth;
    let nextHeight = interaction.startHeight;
    let nextLeft = interaction.startLeft;
    let nextTop = interaction.startTop;
    const dirs = interaction.dirFlags;

    if (dirs.e) {
      nextWidth = Math.max(minWidth, interaction.startWidth + deltaX);
    }
    if (dirs.s) {
      nextHeight = Math.max(minHeight, interaction.startHeight + deltaY);
    }
    if (dirs.w) {
      const next = Math.max(minWidth, interaction.startWidth - deltaX);
      nextLeft = interaction.startLeft + (interaction.startWidth - next);
      nextWidth = next;
    }
    if (dirs.n) {
      const next = Math.max(minHeight, interaction.startHeight - deltaY);
      nextTop = interaction.startTop + (interaction.startHeight - next);
      nextHeight = next;
    }

    terminalModal.style.left = `${nextLeft}px`;
    terminalModal.style.top = `${nextTop}px`;
    terminalModal.style.width = `${nextWidth}px`;
    terminalModal.style.height = `${nextHeight}px`;
    terminalModal.style.transform = 'translate(0, 0)';
  };

  const endInteraction = (pointerId) => {
    if (!interaction || interaction.pointerId !== pointerId) return;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    terminalModal.releasePointerCapture?.(pointerId);
    interaction = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
  };

  const onPointerMove = (event) => {
    if (!interaction || interaction.pointerId !== event.pointerId) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    scheduleApply();
  };

  const onPointerUp = (event) => {
    if (!interaction || interaction.pointerId !== event.pointerId) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    applyInteraction();
    endInteraction(event.pointerId);
  };

  const beginInteraction = (event, mode, direction = '') => {
    if (event.button !== 0) return;
    event.preventDefault();
    if (mode === 'resize') {
      event.stopPropagation();
    }

    const rect = terminalModal.getBoundingClientRect();
    terminalModal.style.left = `${rect.left}px`;
    terminalModal.style.top = `${rect.top}px`;
    terminalModal.style.width = `${rect.width}px`;
    terminalModal.style.height = `${rect.height}px`;
    terminalModal.style.transform = 'translate(0, 0)';
    pointerX = event.clientX;
    pointerY = event.clientY;
    interaction = {
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      startWidth: rect.width,
      startHeight: rect.height,
      dirFlags: {
        n: direction.includes('n'),
        s: direction.includes('s'),
        e: direction.includes('e'),
        w: direction.includes('w'),
      },
    };

    terminalModal.setPointerCapture?.(event.pointerId);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const resizeHandlers = new Map();
  handles.forEach((handle) => {
    const onPointerDown = (event) => {
      beginInteraction(event, 'resize', handle.dataset.resize || '');
    };
    resizeHandlers.set(handle, onPointerDown);
    handle.addEventListener('pointerdown', onPointerDown);
  });

  const onTitlebarPointerDown = (event) => {
    beginInteraction(event, 'drag');
  };

  if (terminalTitlebar) {
    terminalTitlebar.removeEventListener('pointerdown', onTitlebarPointerDown);
    terminalTitlebar.addEventListener('pointerdown', onTitlebarPointerDown);
  }

  return () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (interaction) {
      terminalModal.releasePointerCapture?.(interaction.pointerId);
      interaction = null;
    }
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    if (terminalTitlebar) {
      terminalTitlebar.removeEventListener('pointerdown', onTitlebarPointerDown);
    }
    resizeHandlers.forEach((handler, handle) => {
      handle.removeEventListener('pointerdown', handler);
    });
  };
};
