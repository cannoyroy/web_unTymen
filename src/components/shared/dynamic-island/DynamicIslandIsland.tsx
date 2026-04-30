import { useEffect, useMemo, useState } from "preact/hooks";
import { dismissMessage, type IslandAction, type IslandMessage, subscribeMessage } from "./core/messageBus";
import { initInstallPromptSource } from "./core/installPromptSource";

const DynamicIslandIsland = () => {
  const [messages, setMessages] = useState<IslandMessage[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    initInstallPromptSource();
    const unsubscribe = subscribeMessage((nextMessages) => {
      const sorted = [...nextMessages].sort(
        (a, b) => (b.priority ?? 0) - (a.priority ?? 0) || (a.createdAt ?? 0) - (b.createdAt ?? 0),
      );
      setMessages(sorted);
      if (sorted.length > 0) {
        setExpanded(true);
        window.setTimeout(() => setExpanded(false), 5200);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const current = useMemo(() => messages[0], [messages]);
  if (!current) return null;

  const onAction = (actionId: IslandAction["id"]) => {
    current.onAction?.(actionId);
    if (actionId === "dismiss") {
      dismissMessage(current.id);
    }
  };

  return (
    <div class="pointer-events-none fixed left-1/2 top-3 z-[85] -translate-x-1/2">
      <div
        class={[
          "pointer-events-auto overflow-hidden rounded-[28px] border border-white/20 bg-black/80 text-white shadow-[0_8px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          expanded ? "min-h-22 w-[min(92vw,460px)] px-4 py-3" : "h-10 w-[min(92vw,220px)] px-4",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          class="flex h-full w-full items-center gap-2 text-left"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-label="切换灵动岛消息详情"
        >
          <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
          <span class="truncate text-sm font-medium">{current.title}</span>
        </button>

        {expanded && (
          <div class="mt-2 space-y-3 border-t border-white/10 pt-3">
            {current.body && <p class="text-xs leading-5 text-white/80">{current.body}</p>}
            {current.actions && current.actions.length > 0 && (
              <div class="flex flex-wrap gap-2">
                {current.actions.map((action) => (
                  <button
                    type="button"
                    class={[
                      "rounded-full px-3 py-1.5 text-xs transition",
                      action.variant === "primary"
                        ? "bg-white text-black hover:bg-white/90"
                        : "border border-white/20 bg-white/5 text-white hover:bg-white/10",
                    ].join(" ")}
                    onClick={() => onAction(action.id)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicIslandIsland;

