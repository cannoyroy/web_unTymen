export type IslandAction = {
  id: "install" | "dismiss" | "open";
  label: string;
  variant?: "primary" | "ghost";
};

export type IslandMessage = {
  id: string;
  kind: "install" | "update" | "system";
  title: string;
  body?: string;
  actions?: IslandAction[];
  priority?: number;
  ttlMs?: number;
  onAction?: (actionId: IslandAction["id"]) => void;
  createdAt?: number;
};

type Listener = (messages: IslandMessage[]) => void;

const listeners = new Set<Listener>();
const messages = new Map<string, IslandMessage>();

const getSortedMessages = () =>
  [...messages.values()].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0) || (a.createdAt ?? 0) - (b.createdAt ?? 0),
  );

const emit = () => {
  const snapshot = getSortedMessages();
  listeners.forEach((listener) => listener(snapshot));
};

export const publishMessage = (message: IslandMessage) => {
  const next: IslandMessage = {
    ...message,
    createdAt: message.createdAt ?? Date.now(),
  };
  messages.set(message.id, next);
  emit();

  if (next.ttlMs && next.ttlMs > 0) {
    window.setTimeout(() => {
      dismissMessage(next.id);
    }, next.ttlMs);
  }
};

export const dismissMessage = (id: string) => {
  if (!messages.has(id)) return;
  messages.delete(id);
  emit();
};

export const subscribeMessage = (listener: Listener) => {
  listeners.add(listener);
  listener(getSortedMessages());
  return () => {
    listeners.delete(listener);
  };
};
